import { renderRequestList, renderRequestDetail, dismissRequestDialog } from './request-ui.js';
import { guestEditor } from './guest-editor-instance.js';
import { renderRoomView, renderQuoteReview, roomState, resetRoomScope, updateBottomSurface } from './room-runtime.js';
import { CATALOG } from './catalog.js';
import { selectOffers } from './query.js';
import { parseStayDate } from './dates.js';
export { CATALOG, selectOffers };
export const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(Date.now()));
const day = 86400000;
const dateAt = offset => new Date(parseStayDate(today) + offset * day).toISOString().slice(0, 10);
const initialQuery = { city: '강릉', start: dateAt(21), end: dateAt(23), guests: 2, type: 'all', minPrice: 0, maxPrice: 1000000, freeCancellation: false, amenities: [], sort: 'recommended' };
const id = value => document.getElementById(value);
const text = (node, value) => { if (node.textContent !== value) node.textContent = value; };
const hidden = (node, value) => { if (node.hidden !== value) node.hidden = value; };
const money = value => new Intl.NumberFormat('ko-KR').format(value) + '원';
const searchDialog = id('search-dialog');
const filterDialog = id('filter-dialog');
export const state = { query: structuredClone(initialQuery), route: 'browse', selectedId: null, returnRoute: 'browse', favorites: [], favoriteReadReady: false, favoriteError: null };
const validFavorites = value => Array.isArray(value) && new Set(value).size === value.length && value.every(key => typeof key === 'string' && CATALOG.some(stay => stay.id === key));
export function reloadFavorites() {
  try {
    const raw = window.localStorage.getItem('stay-favorites-v1');
    const value = raw === null ? [] : JSON.parse(raw);
    if (!validFavorites(value)) throw new TypeError('Invalid favorites');
    state.favorites = [...value];
    state.favoriteReadReady = true;
    state.favoriteError = null;
    return true;
  } catch {
    state.favorites = null;
    state.favoriteReadReady = false;
    state.favoriteError = 'READ_FAILED';
    return false;
  }
}
export function saveFavorites(values) {
  if (!state.favoriteReadReady) return false;
  if (!validFavorites(values)) return false;
  try {
    window.localStorage.setItem('stay-favorites-v1', JSON.stringify(values));
    state.favorites = [...values];
    state.favoriteError = null;
    return true;
  } catch {
    state.favoriteError = 'WRITE_FAILED';
    return false;
  }
}
export function setFormError(context, value) { text(id(context + '-error'), value); }
export function focusInvalid(context) {
  const form = id(context + '-form');
  const invalid = form.querySelector(':invalid');
  (invalid || id(context === 'search' ? 'check-out' : 'maximum-price')).focus();
}
export function readSearchDraft() {
  return { ...state.query, city: id('city').value, start: id('check-in').value, end: id('check-out').value, guests: Number(id('guests').value) };
}
export function readFilterDraft() {
  return { ...state.query, type: id('stay-type').value, minPrice: Number(id('minimum-price').value), maxPrice: Number(id('maximum-price').value), freeCancellation: id('free-cancellation').checked, amenities: [...document.querySelectorAll('input[name="amenity"]:checked')].map(node => node.value) };
}
export function closeSearch() { searchDialog.close(); id('open-search').focus(); }
export function closeFilters() { filterDialog.close(); id('open-filters').focus(); }
export function openSearch() {
  id('city').value = state.query.city;
  id('check-in').value = state.query.start;
  id('check-out').value = state.query.end;
  id('check-in').min = today;
  id('check-out').min = today;
  id('guests').value = String(state.query.guests);
  for (const key of ['check-in', 'check-out', 'guests']) id(key).required = true;
  setFormError('search', '');
  searchDialog.showModal();
  id('city').focus();
}
export function openFilters() {
  id('stay-type').value = state.query.type;
  id('minimum-price').value = String(state.query.minPrice);
  id('maximum-price').value = String(state.query.maxPrice);
  id('free-cancellation').checked = state.query.freeCancellation;
  for (const node of document.querySelectorAll('input[name="amenity"]')) node.checked = state.query.amenities.includes(node.value);
  setFormError('filter', '');
  filterDialog.showModal();
  id('stay-type').focus();
}
function restoreQuery() {
  try {
    const raw = new URL(location.href).searchParams.get('q');
    if (!raw) return;
    const value = JSON.parse(raw);
    if (selectOffers(CATALOG, value, today).ok) state.query = value;
  } catch {}
}
export function navigate(destination) {
  history.pushState(null, '', '?q=' + encodeURIComponent(JSON.stringify(state.query)) + '#' + destination);
  syncRoute();
}
export function syncRoute() {
  const previousRoute = state.route, previousRequestId = state.requestId;
  restoreQuery();
  const destination = location.hash.slice(1) || 'browse';
  state.requestId = null;
  if (destination.startsWith('stay/') && ['browse', 'saved'].includes(state.route)) state.returnRoute = state.route;
  if (['browse', 'saved', 'requests'].includes(destination)) {
    state.route = destination;
    state.selectedId = null;
  } else if (destination.startsWith('request/')) {
    state.route = 'request-detail';
    state.selectedId = null;
    try { state.requestId = decodeURIComponent(destination.slice(8)); } catch { state.requestId = null; }
  } else if (destination.startsWith('review/') && CATALOG.some(stay => stay.id === destination.slice(7))) {
    state.selectedId = destination.slice(7);
    state.route = roomState.selection?.stayId === state.selectedId ? 'review' : 'detail';
    if (state.route === 'detail') history.replaceState(null, '', location.search + '#stay/' + state.selectedId);
  } else if (destination.startsWith('stay/') && CATALOG.some(stay => stay.id === destination.slice(5))) {
    state.route = 'detail';
    state.selectedId = destination.slice(5);
  } else {
    state.route = 'browse';
    state.selectedId = null;
  }
  const guestWasOpen = state.route !== 'review' && id('guest-dialog').open;
  if (guestWasOpen) guestEditor.dismiss();
  const dismissedRequestId = dismissRequestDialog(state.route, state.requestId);
  render();
  if (guestWasOpen || dismissedRequestId || previousRoute === 'request-detail' && state.route === 'requests') {
    const candidates = state.route === 'detail'
      ? [id('detail-rooms').querySelector('[data-open-room][data-room-id="' + roomState.selection?.roomId + '"]'), id('edit-trip'), id('return-results')]
      : state.route === 'request-detail' ? [id('request-detail-view').querySelector('h1')]
      : state.route === 'requests' ? [[...id('request-list').querySelectorAll('a')].find(a => a.hash === '#request/' + encodeURIComponent(dismissedRequestId || previousRequestId)), id('requests-view').querySelector('h1')]
      : ['browse', 'saved'].includes(state.route) ? [id('open-search')]
      : [document.querySelector('[data-destination="' + state.route + '"]'), document.querySelector('[data-destination][aria-current="page"]')];
    candidates.find(node => node && !node.disabled && node.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }))?.focus();
  }
}
export function render() {
  const browsing = state.route === 'browse' || state.route === 'saved';
  hidden(document.querySelector('[data-ui-unit="search"]'), !browsing);
  hidden(id('stays-view'), !browsing);
  hidden(id('detail-view'), state.route !== 'detail');
  hidden(id('requests-view'), state.route !== 'requests');
  hidden(id('review-view'), state.route !== 'review');
  hidden(id('request-detail-view'), state.route !== 'request-detail');
  if (state.selectedId && roomState.stayId !== state.selectedId) resetRoomScope();
  updateBottomSurface();
  const personalError = ['browse', 'saved', 'detail'].includes(state.route) && state.favoriteError;
  hidden(id('storage-error-region'), !personalError);
  text(id('storage-error'), personalError === 'READ_FAILED' ? '찜한 숙소를 확인하지 못했어요. 다시 불러와 주세요.' : personalError === 'WRITE_FAILED' ? '찜한 숙소를 저장하지 못했어요. 다시 시도해 주세요.' : '');
  for (const link of document.querySelectorAll('[data-destination]')) {
    const selected = link.dataset.destination === state.route || state.route === 'detail' && link.dataset.destination === 'browse';
    if (selected) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  if (state.route === 'requests') { renderRequestList(); return; }
  if (state.route === 'request-detail') { renderRequestDetail(); return; }
  if (state.route === 'detail') { renderRoomView(); return; }
  if (state.route === 'review') { renderQuoteReview(); return; }
  const query = state.route === 'saved' ? { ...state.query, city: '', type: 'all', minPrice: 0, maxPrice: 1000000, freeCancellation: false, amenities: [], sort: 'recommended' } : state.query;
  const result = selectOffers(CATALOG, query, today);
  const offers = result.ok ? result.offers : [];
  const ids = state.route === 'saved' ? state.favoriteReadReady ? state.favorites : [] : offers.map(offer => offer.stayId);
  text(id('destination-summary'), state.route === 'saved' ? '찜한 숙소' : state.query.city || '전체 여행지');
  text(id('trip-summary'), state.query.start.slice(5).replace('-', '월 ') + '일–' + state.query.end.slice(5).replace('-', '월 ') + '일 · 게스트 ' + state.query.guests + '명');
  text(id('result-count'), state.route === 'saved' && !state.favoriteReadReady ? '찜한 숙소 미확인' : '숙소 ' + ids.length + '곳');
  id('sort').value = state.query.sort;
  for (const stay of CATALOG) {
    const card = id('card-' + stay.id), offer = offers.find(offer => offer.stayId === stay.id);
    hidden(card, !ids.includes(stay.id));
    const favorite = card.querySelector('[data-favorite]'), selected = Boolean(state.favoriteReadReady && state.favorites.includes(stay.id));
    favorite.disabled = !state.favoriteReadReady;
    if (state.favoriteReadReady) favorite.setAttribute('aria-pressed', String(selected));
    else favorite.removeAttribute('aria-pressed');
    favorite.setAttribute('aria-label', stay.name + (!state.favoriteReadReady ? ' 찜 상태 미확인' : selected ? ' 찜 해제' : ' 찜하기'));
    text(favorite.querySelector('span'), selected ? '찜 완료' : '찜');
    for (const field of ['nightly', 'total']) hidden(card.querySelector('[data-field="' + field + '"]').parentElement.tagName === 'P' ? card.querySelector('[data-field="' + field + '"]').parentElement : card.querySelector('[data-field="' + field + '"]'), !offer);
    hidden(card.querySelector('[data-field="unavailable"]'), Boolean(offer));
    hidden(card.querySelector('[data-field="room"]'), !offer);
    hidden(card.querySelector('[data-field="policy"]'), true);
    if (offer) {
      const room = stay.rooms.find(room => room.id === offer.roomId), rate = room.rates.find(rate => rate.id === offer.rateId);
      text(card.querySelector('[data-field="room"]'), room.bed + ' · 최대 ' + room.capacity + '명');
      text(card.querySelector('[data-field="nightly"]'), money(offer.nightly));
      text(card.querySelector('[data-field="total"]'), offer.nights + '박 총 ' + money(offer.total) + ' · 수수료 포함');
      hidden(card.querySelector('[data-field="policy"]'), !rate.freeCancellation);
    }
  }
  for (const key of ids) id('results-list').append(id('card-' + key));
  const confirmedEmpty = state.route !== 'saved' || state.favoriteReadReady;
  hidden(id('empty-results'), !confirmedEmpty || ids.length > 0);
  text(id('empty-title'), state.route === 'saved' ? '찜한 숙소가 없어요.' : '조건에 맞는 숙소가 없어요.');
  const hasFilters = state.query.type !== 'all' || state.query.minPrice !== 0 || state.query.maxPrice !== 1000000 || state.query.freeCancellation || state.query.amenities.length > 0;
  hidden(id('clear-filters'), state.route === 'saved' || !hasFilters);
  text(id('adjust-search'), state.route === 'saved' ? '숙소 찾기' : '여행 정보 바꾸기');
}
export function clearFilters() {
  state.query = { ...state.query, type: 'all', minPrice: 0, maxPrice: 1000000, freeCancellation: false, amenities: [] };
  navigate('browse');
}
export function recoverEmpty() { if (state.route === 'saved') navigate('browse'); else openSearch(); }
reloadFavorites();
