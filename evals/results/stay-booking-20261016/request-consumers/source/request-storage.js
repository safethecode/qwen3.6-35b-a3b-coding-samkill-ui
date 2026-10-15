import { isValidRequestStore } from './request-store.js';
import { applyRequest } from './request-reducer.js';
const key = 'stay-requests-v1';
export function createRequestStorage({ getStorage, lock }) {
  const state = { ready: false, records: null, error: null };
  function read() {
    const raw = getStorage().getItem(key), value = raw === null ? [] : JSON.parse(raw);
    if (!isValidRequestStore(value)) throw new TypeError('Invalid request store');
    return value;
  }
  function accept(records) { state.records = structuredClone(records); state.ready = true; state.error = null; }
  function unknown(error) { state.records = null; state.ready = false; state.error = error; return { ok: false, error }; }
  function load() {
    try { accept(read()); return true; } catch { unknown('READ_FAILED'); return false; }
  }
  async function commit(command) {
    if (!state.ready) return { ok: false, error: 'READ_FAILED' };
    try {
      return await lock(async () => {
        if (!state.ready) return { ok: false, error: 'READ_FAILED' };
        let records;
        try { records = read(); } catch { return unknown('READ_FAILED'); }
        const result = applyRequest(records, command);
        if (!result.ok) { accept(records); state.error = result.error; return result; }
        if (result.duplicate) { accept(result.records); return result; }
        const serialized = JSON.stringify(result.records);
        try { getStorage().setItem(key, serialized); } catch {
          let recovered;
          try { recovered = read(); } catch { return unknown('RESULT_UNKNOWN'); }
          const saved = recovered.find(record => record.id === command.id && record.operations.includes(command.operationId));
          accept(recovered);
          if (saved) return { ok: true, records: structuredClone(recovered), id: command.id, duplicate: true };
          state.error = 'WRITE_FAILED';
          return { ok: false, error: 'WRITE_FAILED' };
        }
        let verified;
        try { verified = read(); } catch { return unknown('RESULT_UNKNOWN'); }
        if (JSON.stringify(verified) !== serialized) return unknown('RESULT_UNKNOWN');
        accept(verified);
        return result;
      });
    } catch { state.error = 'WRITE_FAILED'; return { ok: false, error: 'WRITE_FAILED' }; }
  }
  return { state, load, commit };
}
