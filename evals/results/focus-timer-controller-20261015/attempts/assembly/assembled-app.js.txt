import { parseDuration, snapshot } from './model.js';
import { createStore } from './store.js';
import { renderTimer } from './render.js';
const store = createStore(() => window.localStorage);
let fieldInvalid = false;
const dialog = document.getElementById('duration-dialog');
const input = document.getElementById('duration-input');
const primary = document.getElementById('primary-action');
const configure = document.getElementById('configure-duration');
const reset = document.getElementById('reset-session');
const cancel = document.getElementById('cancel-duration');
const form = document.getElementById('duration-form');
const apply = document.getElementById('apply-duration');
const mainReload = document.getElementById('reload-session');
const configReload = document.getElementById('reload-config-session');
function currentView(){const state=store.getState();if(!state.readReady){return{readReady:false,session:null,error:state.error,fieldInvalid:fieldInvalid,configOpen:dialog.open}}let session;try{session=snapshot(state.record,Date.now())}catch(e){if(e.message==="INVALID_CLOCK"){return{readReady:false,session:null,error:e.message,fieldInvalid:fieldInvalid,configOpen:dialog.open}}throw e}return{readReady:true,session:session,error:state.error,fieldInvalid:fieldInvalid,configOpen:dialog.open}}

function refresh() {
  const view = currentView();
  renderTimer(view);
  return view;
}

function returnFocus() {
  if (configure && configure.offsetParent !== null && !configure.disabled) {
    configure.focus();
    return;
  }
  if (primary && primary.offsetParent !== null && !primary.disabled) {
    primary.focus();
    return;
  }
  if (mainReload && mainReload.offsetParent !== null && !mainReload.disabled) {
    mainReload.focus();
    return;
  }
}

function reloadSession(event) { const result = store.reload(); refresh(); if (result.ok) { if (dialog.open) { if (apply && apply.offsetParent !== null && !apply.disabled) { apply.focus(); } else if (cancel && cancel.offsetParent !== null && !cancel.disabled) { cancel.focus(); } } else { if (primary && primary.offsetParent !== null && !primary.disabled) { primary.focus(); } else if (mainReload && mainReload.offsetParent !== null && !mainReload.disabled) { mainReload.focus(); } } } }

function openConfig() { const view = currentView(); if (!view.readReady || !view.session) return; if (view.session.phase !== 'ready' && view.session.phase !== 'completed') return; fieldInvalid = false; if (input) input.value = String(view.session.durationMinutes); dialog.showModal(); refresh(); if (input) input.focus(); }

function closeConfig(event) { if (event) event.preventDefault(); fieldInvalid = false; dialog.close(); refresh(); returnFocus(); }

function submitConfig(event) { event.preventDefault(); const val = parseDuration(input.value); if (!val.ok) { fieldInvalid = true; refresh(); if (input) input.focus(); return; } fieldInvalid = false; const result = store.transact({ type: 'CONFIGURE', minutes: val.minutes }, Date.now()); if (result.ok) { closeConfig(); } else { refresh(); } }

function inputConfig() { fieldInvalid = false; refresh(); }

function primaryAction() { const view = currentView(); if (!view.readReady || !view.session) return; let type; if (view.session.phase === 'ready' || view.session.phase === 'completed') { type = 'START'; } else if (view.session.phase === 'running') { type = 'PAUSE'; } else if (view.session.phase === 'paused') { type = 'RESUME'; } else { return; } store.transact({ type: type }, Date.now()); refresh(); }

function resetSession() { store.transact({ type: 'RESET' }, Date.now()); refresh(); }
primary.addEventListener('click', primaryAction);
configure.addEventListener('click', openConfig);
reset.addEventListener('click', resetSession);
cancel.addEventListener('click', closeConfig);
form.addEventListener('submit', submitConfig);
input.addEventListener('input', inputConfig);
dialog.addEventListener('cancel', closeConfig);
mainReload.addEventListener('click', reloadSession);
configReload.addEventListener('click', reloadSession);
refresh();
setInterval(refresh, 250);
