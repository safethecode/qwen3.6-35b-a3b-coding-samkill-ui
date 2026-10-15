import { validateRecord, transition } from './model.js';

const STORAGE_KEY = 'focus-session-v1';

function createStore(storageProvider) {
  let _record = null;
  let _readReady = false;
  let _error = null;

  function loadFromStorage() {
    try {
      const raw = storageProvider.getItem(STORAGE_KEY);
      if (raw === null || raw === undefined) {
        _readReady = false;
        _record = null;
        _error = null;
        return;
      }
      const parsed = JSON.parse(raw);
      if (!validateRecord(parsed)) {
        _readReady = true;
        _record = null;
        _error = 'INVALID_RECORD';
        return;
      }
      _readReady = true;
      _record = parsed;
      _error = null;
    } catch (e) {
      _readReady = false;
      _record = null;
      _error = 'READ_FAILED';
    }
  }

  function saveToStorage(record) {
    try {
      storageProvider.setItem(STORAGE_KEY, JSON.stringify(record));
      return true;
    } catch (e) {
      return false;
    }
  }

  function createReadyRecord() {
    return {
      version: 1,
      durationMinutes: 25,
      phase: 'ready',
      remainingMs: 25 * 60 * 1000,
      runStartedAt: null,
      deadlineAt: null
    };
  }

  loadFromStorage();

  return {
    getState() {
      return {
        readReady: _readReady,
        record: _readReady ? { ..._record } : null,
        error: _error
      };
    },

    async reload() {
      try {
        const raw = storageProvider.getItem(STORAGE_KEY);
        if (raw === null || raw === undefined) {
          _readReady = false;
          _record = null;
          _error = null;
          return { ok: true };
        }
        const parsed = JSON.parse(raw);
        if (!validateRecord(parsed)) {
          _readReady = true;
          _record = null;
          _error = 'INVALID_RECORD';
          return { ok: true };
        }
        _readReady = true;
        _record = parsed;
        _error = null;
        return { ok: true };
      } catch (e) {
        _readReady = false;
        _record = null;
        _error = 'READ_FAILED';
        return { ok: false, error: 'READ_FAILED' };
      }
    },

    async transact(event, now) {
      if (!_readReady) {
        return { ok: false, error: 'READ_FAILED' };
      }

      let currentRecord = _record;
      let currentPhase = currentRecord ? currentRecord.phase : 'ready';
      let currentDuration = currentRecord ? currentRecord.durationMinutes : 25;

      if (currentPhase === 'completed') {
        currentRecord = {
          version: 1,
          durationMinutes: currentDuration,
          phase: 'ready',
          remainingMs: currentDuration * 60 * 1000,
          runStartedAt: null,
          deadlineAt: null
        };
      }

      if (!currentRecord) {
        currentRecord = createReadyRecord();
      }

      const result = transition(currentRecord, event, now);

      if (!result.ok) {
        return { ok: false, error: result.error };
      }

      const newRecord = result.record;

      if (!saveToStorage(newRecord)) {
        return { ok: false, error: 'WRITE_FAILED' };
      }

      _record = newRecord;
      _readReady = true;
      _error = null;

      return { ok: true };
    }
  };
}

export { createStore };