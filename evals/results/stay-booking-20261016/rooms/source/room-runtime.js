import { state, CATALOG, today, navigate, render, saveFavorites } from './core-runtime.js';
import { listStayRates } from './room-rates.js';
import { buildQuote } from './quote.js';
import { renderRoomChoices, renderRateChoices } from './room-renderer.js';
const id = key => document.getElementById(key);
const money = value => new Intl.NumberFormat('ko-KR').format(value) + '원';
const trip = () => ({ start: state.query.start, end: state.query.end, guests: state.query.guests });
const tripLabel = () => state.query.start.slice(5).replace('-', '.') + '–' + state.query.end.slice(5).replace('-', '.') + ' · ' + state.query.guests + '명';
export const roomState = { stayId: null, tripKey: null, filters: { freeCancellation: false, breakfast: false }, selection: null, activeRoom: null, draft: null };
export function resetRoomScope() {
  roomState.stayId = state.selectedId;
  roomState.tripKey = JSON.stringify(trip());
  roomState.filters = { freeCancellation: state.query.freeCancellation, breakfast: false };
  roomState.selection = null;
}
export function updateBottomSurface() {
  const nav = document.querySelector('.bottom-navigation'), bottom = id('room-bottom');
  nav.hidden = state.route === 'detail' || state.route === 'review';
  bottom.hidden = state.route !== 'detail' || !roomState.selection;
  const active = nav.hidden ? bottom.hidden ? null : bottom : nav;
  document.documentElement.style.setProperty('--nav-height', (active ? active.getBoundingClientRect().height : 0) + 'px');
}
function updateSelected() {
  const quote = roomState.selection, stay = CATALOG.find(item => item.id === state.selectedId);
  if (quote && stay) {
    const room = stay.rooms.find(item => item.id === quote.roomId), rate = room.rates.find(item => item.id === quote.rateId);
    id('selected-room-name').textContent = room.name + ' · ' + rate.name;
    id('selected-room-total').textContent = quote.nights + '박 총 ' + money(quote.total);
  }
  updateBottomSurface();
}
function available() { return listStayRates(CATALOG, state.selectedId, trip(), today, roomState.filters); }
export function renderRoomView() {
  if (roomState.tripKey !== JSON.stringify(trip())) { roomState.tripKey = JSON.stringify(trip()); roomState.selection = null; }
  const stay = CATALOG.find(item => item.id === state.selectedId), result = available();
  id('detail-location').textContent = stay.name + ' · ' + stay.city + ' ' + stay.area;
  id('detail-trip').textContent = tripLabel();
  const ready = state.favoriteReadReady, selected = ready && state.favorites.includes(stay.id), favorite = id('detail-favorite');
  favorite.dataset.favorite = stay.id;
  favorite.disabled = !ready;
  if (ready) favorite.setAttribute('aria-pressed', String(selected)); else favorite.removeAttribute('aria-pressed');
  favorite.setAttribute('aria-label', stay.name + (!ready ? ' 찜 상태 미확인' : selected ? ' 찜 해제' : ' 찜하기'));
  favorite.querySelector('span').textContent = selected ? '찜 완료' : '찜';
  const quotes = result.ok ? result.quotes : [];
  id('room-count').textContent = result.ok ? '객실 ' + new Set(quotes.map(q => q.roomId)).size + '종 · 수수료 포함 총액' : '여행 정보를 확인해 주세요.';
  id('rooms-empty').hidden = !result.ok || quotes.length !== 0;
  id('rooms-clear-filters').hidden = !roomState.filters.freeCancellation && !roomState.filters.breakfast;
  renderRoomChoices({ container: id('detail-rooms'), template: id('room-template'), stay, quotes, selectedRateId: roomState.selection?.rateId || null, onOpen: openRates });
  updateSelected();
}
function openRates(roomId) {
  const result = available(), stay = CATALOG.find(item => item.id === state.selectedId), room = stay.rooms.find(item => item.id === roomId);
  if (!result.ok || !room) return;
  roomState.activeRoom = roomId;
  roomState.draft = result.quotes.find(q => q.roomId === roomId && q.rateId === roomState.selection?.rateId) || null;
  id('rate-title').textContent = room.name;
  id('rate-trip').textContent = tripLabel();
  renderRateChoices({ container: id('rate-options'), template: id('rate-template'), room, quotes: result.quotes.filter(q => q.roomId === roomId), selectedRateId: roomState.draft?.rateId || null, onSelect: quote => { roomState.draft = quote; id('confirm-rate').disabled = false; } });
  id('confirm-rate').disabled = !roomState.draft;
  id('rate-dialog').showModal();
  (id('rate-options').querySelector('input:checked') || id('rate-options').querySelector('input') || id('rate-dialog').querySelector('button')).focus();
}
function closeRates() {
  id('rate-dialog').close();
  id('detail-rooms').querySelector('[data-open-room][data-room-id="' + roomState.activeRoom + '"]')?.focus();
}
function openTrip() {
  for (const [key, value] of [['room-check-in', state.query.start], ['room-check-out', state.query.end], ['room-guests', state.query.guests]]) id(key).value = String(value);
  id('room-check-in').min = today;
  id('room-check-out').min = today;
  id('trip-error').textContent = '';
  id('trip-dialog').showModal();
  id('room-check-in').focus();
}
function closeTrip() { id('trip-dialog').close(); id('edit-trip').focus(); }
function closeRoomFilters() { id('room-filter-dialog').close(); id('room-filters').focus(); }
export function renderQuoteReview() {
  const quote = roomState.selection, checked = quote && buildQuote(CATALOG, { stayId: quote.stayId, roomId: quote.roomId, rateId: quote.rateId, ...trip() }, today);
  if (!checked?.ok) { roomState.selection = null; navigate('stay/' + state.selectedId); return; }
  const stay = CATALOG.find(item => item.id === quote.stayId), room = stay.rooms.find(item => item.id === quote.roomId), rate = room.rates.find(item => item.id === quote.rateId);
  for (const [key, value] of Object.entries({ 'review-stay': stay.name, 'review-room': room.name, 'review-rate': rate.name, 'review-start': quote.start, 'review-end': quote.end, 'review-guests': quote.guests + '명', 'review-nights': money(quote.nightly) + ' × ' + quote.nights + '박', 'review-base': money(quote.nightly * quote.nights), 'review-cleaning': money(quote.cleaningFee), 'review-service': money(quote.serviceFee), 'review-total': money(quote.total), 'review-breakfast': quote.breakfast ? '조식 포함' : '조식 미포함', 'review-cancellation': quote.freeCancellation ? '무료 취소 포함' : '무료 취소 미포함' })) id(key).textContent = value;
  id('review-photo').src = room.photo;
  id('review-photo').alt = room.photoAlt;
  updateBottomSurface();
}
export function installRoomEvents() {
  id('return-results').addEventListener('click', () => navigate(state.returnRoute));
  id('detail-favorite').addEventListener('click', () => {
    if (!state.favoriteReadReady) return;
    const values = state.favorites.includes(state.selectedId) ? state.favorites.filter(value => value !== state.selectedId) : [...state.favorites, state.selectedId];
    saveFavorites(values); render();
  });
  id('edit-trip').addEventListener('click', openTrip);
  id('rooms-adjust-trip').addEventListener('click', openTrip);
  id('trip-form').addEventListener('input', () => { id('trip-error').textContent = ''; });
  id('trip-form').addEventListener('submit', event => {
    event.preventDefault();
    const candidate = { start: id('room-check-in').value, end: id('room-check-out').value, guests: Number(id('room-guests').value) };
    const checked = listStayRates(CATALOG, state.selectedId, candidate, today, roomState.filters);
    if (!checked.ok) { id('trip-error').textContent = '날짜와 게스트 수를 확인해 주세요. 숙박 기간은 1박부터 28박까지 선택할 수 있어요.'; (id('trip-form').querySelector(':invalid') || id('room-check-out')).focus(); return; }
    state.query = { ...state.query, ...candidate };
    roomState.selection = null;
    closeTrip(); navigate('stay/' + state.selectedId);
  });
  id('room-filters').addEventListener('click', () => {
    id('room-free-cancellation').checked = roomState.filters.freeCancellation;
    id('room-breakfast').checked = roomState.filters.breakfast;
    id('room-filter-dialog').showModal(); id('room-free-cancellation').focus();
  });
  id('room-filter-form').addEventListener('submit', event => { event.preventDefault(); roomState.filters = { freeCancellation: id('room-free-cancellation').checked, breakfast: id('room-breakfast').checked }; roomState.selection = null; closeRoomFilters(); render(); });
  id('rooms-clear-filters').addEventListener('click', () => { roomState.filters = { freeCancellation: false, breakfast: false }; roomState.selection = null; render(); id('room-filters').focus(); });
  for (const [key, close] of [['trip-dialog', closeTrip], ['room-filter-dialog', closeRoomFilters], ['rate-dialog', closeRates]]) {
    id(key).querySelector('[data-cancel]').addEventListener('click', close);
    id(key).addEventListener('cancel', event => { event.preventDefault(); close(); });
  }
  id('confirm-rate').addEventListener('click', () => {
    if (!roomState.draft) return;
    const draft = roomState.draft, result = buildQuote(CATALOG, { stayId: draft.stayId, roomId: draft.roomId, rateId: draft.rateId, ...trip() }, today);
    if (!result.ok) return;
    roomState.selection = result.quote;
    id('rate-dialog').close(); renderRoomView();
    id('detail-rooms').querySelector('[data-open-room][data-room-id="' + roomState.activeRoom + '"]')?.focus();
  });
  id('continue-review').addEventListener('click', () => { if (roomState.selection) { navigate('review/' + state.selectedId); id('review-view').querySelector('h1').focus(); window.scrollTo(0, 0); } });
  id('review-back').addEventListener('click', () => { navigate('stay/' + state.selectedId); id('detail-rooms').querySelector('[data-open-room][data-room-id="' + roomState.selection?.roomId + '"]')?.focus(); });
}
