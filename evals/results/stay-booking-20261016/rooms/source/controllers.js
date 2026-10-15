import { state, CATALOG, selectOffers, today, readSearchDraft, readFilterDraft, setFormError, focusInvalid, closeSearch, closeFilters, navigate, saveFavorites, render } from './core-runtime.js';

export function onSearchSubmit(event) {
  event.preventDefault();
  const candidate = readSearchDraft();
  const result = selectOffers(CATALOG, candidate, today);
  if (!result.ok) {
    setFormError('search', '여행지와 날짜, 게스트 수를 확인해 주세요.');
    focusInvalid('search');
    return;
  }
  state.query = candidate;
  setFormError('search', '');
  closeSearch();
  navigate('browse');
}

export function onFilterSubmit(event) {
  event.preventDefault();
  const candidate = readFilterDraft();
  const result = selectOffers(CATALOG, candidate, today);
  if (!result.ok) {
    setFormError('filter', '가격 범위를 확인해 주세요.');
    focusInvalid('filter');
    return;
  }
  state.query = candidate;
  setFormError('filter', '');
  closeFilters();
  navigate('browse');
}

export function onSortChange(event) {
  const newSortValue = event.currentTarget.value;
  const candidate = { ...state.query, sort: newSortValue };
  const result = selectOffers(CATALOG, candidate, today);
  if (result.ok) {
    state.query = candidate;
    navigate('browse');
  }
}

export function onFavoriteClick(event) {
  if (!state.favoriteReadReady) return;
  const id = event.currentTarget.dataset.favorite;
  if (!id || !CATALOG.some(item => item.id === id)) return;
  let newIds;
  if (state.favorites.includes(id)) {
    newIds = state.favorites.filter(favId => favId !== id);
  } else {
    newIds = [...state.favorites, id];
  }
  saveFavorites(newIds);
  render();
}