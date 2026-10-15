import { createRequestStorage } from './request-storage.js';
import { state, CATALOG, today, navigate, render } from './core-runtime.js';
import { roomState } from './room-runtime.js';
import { buildQuote } from './quote.js';
import { guestEditor } from './guest-editor-instance.js';
const id = key => document.getElementById(key);
const money = value => new Intl.NumberFormat('ko-KR').format(value) + '원';
export const requestStorage = createRequestStorage({ getStorage: () => window.localStorage, lock: action => navigator.locks.request('stay-requests-v1', action) });
const form = { key: null, pending: null, busy: false, name: '', note: '', saved: null };
let attempted = false, outcome = null;
let lastRequestListSignature = null;
let cancelBusy = false, cancelCommand = null, cancelContext = null;
const messages = { READ_FAILED: '예약 요청 내역을 확인하지 못했어요. 다시 불러온 뒤 저장해 주세요.', WRITE_FAILED: '저장하지 못했어요. 입력한 내용은 그대로 있어요. 다시 시도해 주세요.', RESULT_UNKNOWN: '저장 결과를 확인하지 못했어요. 내역을 다시 불러와 확인해 주세요.', INVALID_COMMAND: '입력한 내용과 여행 정보를 확인해 주세요.', CONFLICT: '다른 화면에서 요청이 변경되었어요. 내역을 다시 불러와 확인해 주세요.', CANCELLED: '이미 취소한 요청이에요.', NOT_FOUND: '해당 요청을 찾을 수 없어요.' };
function load() { attempted = true; return requestStorage.load(); }
function ensureRead() { if (!attempted) load(); }
function showFormError(error) {
  id('request-form-error').textContent = error ? messages[error] || messages.INVALID_COMMAND : '';
  id('request-form-reload').hidden = !['READ_FAILED', 'RESULT_UNKNOWN', 'CONFLICT'].includes(error);
}
function showCancelError(error) {
  const node = id('cancel-request-error');
  node.textContent = messages[error] || messages.INVALID_COMMAND;
  id('cancel-request-reload').hidden = !['READ_FAILED', 'RESULT_UNKNOWN', 'CONFLICT', 'CANCELLED', 'NOT_FOUND'].includes(error);
  node.tabIndex = -1; node.focus();
}
function setBusy(value) { form.busy = value; id('save-request').disabled = value; id('edit-request-guest').disabled = value; id('request-form').setAttribute('aria-busy', String(value)); id('request-name').readOnly = value; id('request-note').readOnly = value; }
function snapshot(quote) {
  const stay = CATALOG.find(item => item.id === quote.stayId), room = stay?.rooms.find(item => item.id === quote.roomId), rate = room?.rates.find(item => item.id === quote.rateId);
  return stay && room && rate ? { stayName: stay.name, roomName: room.name, rateName: rate.name, city: stay.city, bed: room.bed } : null;
}
function renderRequestTrip(node, quote) {
  const start = document.createElement('span'), end = document.createElement('span'), meta = document.createElement('span');
  start.className = end.className = 'request-trip-date'; meta.className = 'request-trip-meta';
  start.textContent = quote.start; end.textContent = '– ' + quote.end; meta.textContent = quote.nights + '박 · ' + quote.guests + '명';
  node.replaceChildren(start, document.createTextNode(' '), end, document.createTextNode(' '), meta);
}
export function prepareRequestForm() {
  ensureRead();
  const key = JSON.stringify(roomState.selection);
  if (form.key !== key) { form.key = key; if (requestStorage.state.error !== 'RESULT_UNKNOWN') form.pending = null; }
  const applied = guestEditor.read(); form.name = applied.name; form.note = applied.note;
  setBusy(form.busy); showFormError(requestStorage.state.ready ? null : 'READ_FAILED');
}
export function renderRequestList() {
  outcome = null;
  if (!attempted) load(); else if (requestStorage.state.ready) load();
  const ready = requestStorage.state.ready, records = ready ? requestStorage.state.records : null;
  id('requests-empty').hidden = !ready || records.length !== 0;
  id('requests-error').textContent = ready ? '' : messages.READ_FAILED;
  id('requests-reload').hidden = ready;
  id('request-saved-outcome').hidden = !outcome;
  id('request-saved-outcome').textContent = outcome?.kind === 'cancelled' ? '요청을 취소했어요' : outcome ? '요청을 저장했어요' : '';
  const listSignature = JSON.stringify(records);
  if (listSignature !== lastRequestListSignature) {
  const activeHash = document.activeElement?.closest('#request-list a')?.hash;
  const nodes = [];
  for (const record of records || []) {
    const fragment = id('request-card-template').content.cloneNode(true), link = fragment.querySelector('a');
    link.href = '#request/' + encodeURIComponent(record.id);
    for (const [selector, value] of Object.entries({ '[data-request-stay]': record.snapshot.stayName, '[data-request-room]': record.snapshot.roomName + ' · ' + record.snapshot.rateName, '[data-request-total]': money(record.quote.total), '[data-request-status]': record.status === 'cancelled' ? '요청 취소됨' : '요청 저장됨' })) fragment.querySelector(selector).textContent = value;
    renderRequestTrip(fragment.querySelector('[data-request-trip]'), record.quote);
    nodes.push(fragment);
  }
  id('request-list').replaceChildren(...nodes);
  lastRequestListSignature = listSignature;
  if (activeHash) ([...id('request-list').querySelectorAll('a')].find(a => a.hash === activeHash) || id('requests-view').querySelector('h1')).focus();
  }
}
export function renderRequestDetail() {
  ensureRead();
  const ready = requestStorage.state.ready, record = ready ? requestStorage.state.records.find(item => item.id === state.requestId) : null;
  id('request-detail-content').hidden = !record;
  id('request-detail-error').textContent = !ready ? messages.READ_FAILED : !record ? messages.NOT_FOUND : '';
  id('request-detail-reload').hidden = ready;
  const detailOutcome = record && outcome?.id === record.id && outcome.kind === (record.status === 'cancelled' ? 'cancelled' : 'saved') ? outcome : null;
  id('request-detail-outcome').hidden = !detailOutcome;
  id('request-detail-outcome').textContent = detailOutcome?.kind === 'cancelled' ? '요청을 취소했어요' : detailOutcome ? '요청을 저장했어요' : '';
  if (!record) return;
  for (const [key, value] of Object.entries({ 'request-detail-stay': record.snapshot.stayName, 'request-detail-room': record.snapshot.roomName + ' · ' + record.snapshot.rateName, 'request-detail-status': record.status === 'cancelled' ? '요청 취소됨' : '요청 저장됨', 'request-detail-name': record.guest.name, 'request-detail-note': record.guest.note || '없음', 'request-detail-total': money(record.quote.total) })) id(key).textContent = value;
  renderRequestTrip(id('request-detail-trip'), record.quote);
  id('request-detail-base').textContent = money(record.quote.nightly * record.quote.nights);
  id('request-detail-cleaning').textContent = money(record.quote.cleaningFee);
  id('request-detail-service').textContent = money(record.quote.serviceFee);
  id('request-detail-breakfast').textContent = record.quote.breakfast ? '조식 포함' : '조식 미포함';
  id('request-detail-cancellation').textContent = record.quote.freeCancellation ? '무료 취소 포함' : '무료 취소 미포함';
  id('cancel-request').hidden = record.status === 'cancelled';
}
async function submit(event) {
  event.preventDefault(); if (form.busy) return;
  const applied = guestEditor.read(); form.name = applied.name; form.note = applied.note;
  if (!form.name.trim()) { showFormError('INVALID_COMMAND'); guestEditor.open(); return; }
  ensureRead(); if (!requestStorage.state.ready) { showFormError('READ_FAILED'); return; }
  const selected = roomState.selection, checked = selected && buildQuote(CATALOG, { stayId: selected.stayId, roomId: selected.roomId, rateId: selected.rateId, start: selected.start, end: selected.end, guests: selected.guests }, today);
  if (!checked?.ok || !snapshot(checked.quote)) { showFormError('INVALID_COMMAND'); return; }
  const identity = JSON.stringify([form.key, form.name.trim(), form.note]);
  if (form.saved?.identity === identity) {
    if (!load()) { showFormError('READ_FAILED'); return; }
    const saved = requestStorage.state.records.find(record => record.id === form.saved.id);
    if (saved?.status === 'saved') { outcome = { kind: 'saved', id: saved.id }; navigate('request/' + encodeURIComponent(saved.id)); id('request-detail-outcome').focus(); return; }
  }
  if (!form.pending) form.pending = { kind: 'create', id: crypto.randomUUID(), operationId: crypto.randomUUID(), at: new Date(Date.now()).toISOString(), quote: checked.quote, snapshot: snapshot(checked.quote), guest: { name: form.name.trim(), note: form.note } };
  const command = structuredClone(form.pending), scope = form.key;
  setBusy(true); showFormError(null);
  const result = await requestStorage.commit(command);
  setBusy(false);
  if (!result.ok) { if (state.route === 'review' && form.key === scope) showFormError(result.error); return; }
  outcome = { kind: 'saved', id: result.id }; form.pending = null; form.saved = { identity, id: result.id };
  if (state.route === 'review' && form.key === scope) { navigate('request/' + encodeURIComponent(result.id)); id('request-detail-outcome').focus(); window.scrollTo(0, 0); }
}
function reloadForm() {
  if (!load()) { showFormError('READ_FAILED'); return; }
  const saved = form.pending && requestStorage.state.records.find(record => record.operations.includes(form.pending.operationId));
  if (saved) { outcome = { kind: 'saved', id: saved.id }; form.pending = null; navigate('request/' + encodeURIComponent(saved.id)); id('request-detail-outcome').focus(); return; }
  showFormError(null);
}
export function dismissRequestDialog(nextRoute, nextId) {
  if (!id('cancel-request-dialog').open || nextRoute === 'request-detail' && nextId === cancelContext?.id) return null;
  const previousId = cancelContext?.id;
  id('cancel-request-dialog').close(); cancelCommand = null; cancelContext = null;
  return previousId || null;
}
export function installRequestEvents() {
  id('request-form').addEventListener('submit', submit);
  document.addEventListener('requestguestchange', () => { const applied = guestEditor.read(); form.name = applied.name; form.note = applied.note; if (requestStorage.state.ready && !form.busy) form.pending = null; if (requestStorage.state.ready && requestStorage.state.error !== 'RESULT_UNKNOWN') showFormError(null); });
  id('request-form-reload').addEventListener('click', reloadForm);
  id('requests-reload').addEventListener('click', () => { load(); render(); });
  id('request-detail-reload').addEventListener('click', () => { load(); render(); });
  id('request-detail-back').addEventListener('click', () => { outcome = null; navigate('requests'); });
  id('cancel-request').addEventListener('click', () => {
    if (cancelBusy) return;
    ensureRead();
    const record = requestStorage.state.ready && requestStorage.state.records.find(item => item.id === state.requestId);
    if (!record || record.status !== 'saved') { render(); return; }
    cancelContext = { id: record.id, expectedRevision: record.revision };
    cancelCommand = null;
    const name = document.createElement('span'), start = document.createElement('span'), end = document.createElement('span');
    name.className = 'request-cancel-name'; start.className = end.className = 'request-trip-date';
    name.textContent = record.snapshot.stayName; start.textContent = record.quote.start; end.textContent = '– ' + record.quote.end;
    id('cancel-request-subject').replaceChildren(name, document.createTextNode(' '), start, document.createTextNode(' '), end);
    id('cancel-request-error').textContent = '';
    id('cancel-request-reload').hidden = true;
    id('cancel-request-dialog').showModal();
    const dialog = id('cancel-request-dialog');
    if (dialog.scrollHeight > dialog.clientHeight + 1) { id('cancel-request-title').tabIndex = -1; id('cancel-request-title').focus({ preventScroll: true }); dialog.scrollTop = 0; }
    else id('keep-request').focus();
  });
  const close = () => {
    id('cancel-request-dialog').close(); cancelCommand = null; cancelContext = null;
    const target = id('cancel-request').checkVisibility() ? id('cancel-request') : id('request-detail-view').querySelector('h1');
    if (target.checkVisibility()) target.focus();
  };
  id('keep-request').addEventListener('click', close);
  id('cancel-request-dialog').addEventListener('cancel', event => { event.preventDefault(); close(); });
  id('confirm-cancel-request').addEventListener('click', async () => {
    if (cancelBusy || !cancelContext || state.route !== 'request-detail' || state.requestId !== cancelContext.id) return;
    ensureRead();
    if (!requestStorage.state.ready) { showCancelError(requestStorage.state.error === 'RESULT_UNKNOWN' ? 'RESULT_UNKNOWN' : 'READ_FAILED'); return; }
    if (!cancelCommand) cancelCommand = { kind: 'cancel', id: cancelContext.id, operationId: crypto.randomUUID(), at: new Date(Date.now()).toISOString(), expectedRevision: cancelContext.expectedRevision };
    const command = structuredClone(cancelCommand);
    cancelBusy = true; id('confirm-cancel-request').disabled = true; id('cancel-request').disabled = true;
    const result = await requestStorage.commit(command);
    cancelBusy = false; id('confirm-cancel-request').disabled = false; id('cancel-request').disabled = false;
    const ownsDialog = cancelContext?.id === command.id && cancelCommand?.operationId === command.operationId && id('cancel-request-dialog').open && state.route === 'request-detail' && state.requestId === command.id;
    if (!ownsDialog) return;
    if (!result.ok) { showCancelError(result.error); return; }
    outcome = { kind: 'cancelled', id: command.id }; cancelCommand = null; cancelContext = null; id('cancel-request-dialog').close(); render(); id('request-detail-outcome').focus();
  });
  id('cancel-request-reload').addEventListener('click', () => {
    if (!load()) { showCancelError('READ_FAILED'); return; }
    const applied = cancelCommand && requestStorage.state.records.some(record => record.id === cancelCommand.id && record.operations.includes(cancelCommand.operationId));
    if (applied) outcome = { kind: 'cancelled', id: cancelCommand.id };
    cancelCommand = null; cancelContext = null; id('cancel-request-dialog').close(); render();
    (applied ? id('request-detail-outcome') : id('request-detail-view').querySelector('h1')).focus();
  });
  window.addEventListener('storage', event => { if (event.key !== 'stay-requests-v1') return; if (state.route === 'requests' || state.route === 'request-detail') { load(); render(); } });
}
