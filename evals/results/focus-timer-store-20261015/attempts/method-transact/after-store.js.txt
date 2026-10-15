import { validateRecord, transition } from './model.js';
export function createStore(storageProvider) {
  const KEY = 'focus-session-v1';
  let state = { readReady: false, record: null, error: null };

  function parseRaw(raw) {
    if (raw === null || raw === undefined) return null;
    if (typeof raw !== 'string' || raw.trim() === '') return null;
    return JSON.parse(raw);
  }

  function load() { try { const store = storageProvider(); const raw = store.getItem(KEY); if (raw === null) { state = { readReady: true, record: { version: 1, durationMinutes: 25, phase: "ready", remainingMs: 1500000, runStartedAt: null, deadlineAt: null }, error: null }; return; } const parsed = JSON.parse(raw); if (validateRecord(parsed)) { state = { readReady: true, record: parsed, error: null }; } else { state = { readReady: false, record: null, error: "READ_FAILED" }; } } catch (e) { state = { readReady: false, record: null, error: "READ_FAILED" }; } }

  load();

  function getState() {return {readReady:state.readReady,record:state.record?{...state.record}:null,error:state.error}}

  function reload() {
    load();
    if (state.readReady) {
      return { ok: true };
    } else {
      return { ok: false, error: 'READ_FAILED' };
    }
  }

  function transact(event, now) {
  if (!state.readReady) {
    return { ok: false, error: "READ_FAILED" };
  }
  const result = transition(state.record, event, now);
  if (!result.ok) {
    state.error = result.error;
    return { ok: false, error: result.error };
  }
  try {
    const provider = storageProvider();
    provider.setItem(KEY, JSON.stringify(result.record));
    state.record = result.record;
    state.error = null;
    return { ok: true };
  } catch (e) {
    state.error = "WRITE_FAILED";
    return { ok: false, error: "WRITE_FAILED" };
  }
}

  return { getState, reload, transact };
}