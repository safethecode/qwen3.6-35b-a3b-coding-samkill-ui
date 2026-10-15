import { installRoomEvents, updateBottomSurface } from './room-runtime.js';
import { onSearchSubmit, onFilterSubmit, onSortChange, onFavoriteClick } from './controllers.js';
import { openSearch, openFilters, closeSearch, closeFilters, clearFilters, recoverEmpty, reloadFavorites, render, syncRoute, navigate, setFormError } from './core-runtime.js';
const id = value => document.getElementById(value);
id('open-search').addEventListener('click', openSearch);
id('open-filters').addEventListener('click', openFilters);
id('search-form').addEventListener('submit', onSearchSubmit);
id('filter-form').addEventListener('submit', onFilterSubmit);
id('sort').addEventListener('change', onSortChange);
for (const node of document.querySelectorAll('[data-favorite]')) node.addEventListener('click', onFavoriteClick);
for (const [key, close] of [['search', closeSearch], ['filter', closeFilters]]) {
  id(key + '-dialog').querySelector('[data-close]').addEventListener('click', close);
  id(key + '-dialog').addEventListener('cancel', event => { event.preventDefault(); close(); });
  id(key + '-form').addEventListener('input', () => setFormError(key, ''));
}
id('clear-filters').addEventListener('click', clearFilters);
id('adjust-search').addEventListener('click', recoverEmpty);
installRoomEvents();
id('reload-favorites').addEventListener('click', () => { if (reloadFavorites()) { render(); (document.querySelector('[data-favorite]:not([disabled])') || id('open-search')).focus(); } else render(); });
id('requests-reload').addEventListener('click', render);
window.addEventListener('hashchange', syncRoute);
window.addEventListener('popstate', syncRoute);
const nav = document.querySelector('.bottom-navigation');
const bottomObserver = new ResizeObserver(updateBottomSurface);
bottomObserver.observe(nav);
bottomObserver.observe(id('room-bottom'));
syncRoute();
