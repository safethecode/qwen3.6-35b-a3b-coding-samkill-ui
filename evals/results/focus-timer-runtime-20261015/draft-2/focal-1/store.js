import { validateRecord, transition } from './model.js';

const READ_FAILED = 'READ_FAILED';
const WRITE_FAILED = 'WRITE_FAILED';
const INVALID_RECORD = 'INVALID_RECORD';
const INVALID_CLOCK = 'INVALID_CLOCK';
const INVALID_TRANSITION = 'INVALID_TRANSITION';

export function createStore(storageProvider) {
  let readReady = false;
  let error = null;
  let record = null;
  const key = 'focus-session-v1';

  function reload() {
    try {
      const raw = storageProvider.getItem(key);
      if (raw === null || raw === undefined) {
        readReady = false;
        error = null;
        record = null;
        return { ok: true };
      }
      const parsed = JSON.parse(raw);
      if (!validateRecord(parsed)) {
        readReady = false;
        error = INVALID_RECORD;
        record = null;
        return { ok: false, error: INVALID_RECORD };
      }
      readReady = true;
      error = null;
      record = parsed;
      return { ok: true };
    } catch (e) {
      readReady = false;
      error = READ_FAILED;
      record = null;
      return { ok: false, error: READ_FAILED };
    }
  }

  function getState() {
    return {
      readReady,
      record: readReady ? { ...record } : null,
      error: error
    };
  }

  function transact(event, now) {
    if (!readReady) {
      return { ok: false, error: READ_FAILED };
    }

    let candidateRecord = record;
    let candidateEvent = event;

    if (record === null) {
      candidateRecord = {
        version: 1,
        durationMinutes: 0,
        phase: 'ready',
        remainingMs: 0,
        runStartedAt: null,
        deadlineAt: null
      };
    }

    const result = transition(candidateRecord, candidateEvent, now);

    if (!result.ok) {
      return { ok: false, error: result.error };
    }

    try {
      const serialized = JSON.stringify(result.record);
      storageProvider.setItem(key, serialized);
    } catch (e) {
      return { ok: false, error: WRITE_FAILED };
    }

    record = result.record;
    return { ok: true };
  }

  reload();

  return { getState, reload, transact };
}