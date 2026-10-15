export function parseDuration(input) {
  if (typeof input !== 'string') {
    return { ok: false, error: 'INVALID_DURATION' };
  }
  const trimmed = input.trim();
  if (trimmed === '' || !/^\d+$/.test(trimmed)) {
    return { ok: false, error: 'INVALID_DURATION' };
  }
  const num = Number(trimmed);
  if (!Number.isSafeInteger(num) || num < 1 || num > 180) {
    return { ok: false, error: 'INVALID_DURATION' };
  }
  return { ok: true, minutes: num };
}

export function validateRecord(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const requiredKeys = ['version', 'durationMinutes', 'phase', 'remainingMs', 'runStartedAt', 'deadlineAt'];
  const keys = Object.keys(value);
  if (keys.length !== 6) {
    return false;
  }
  for (const key of requiredKeys) {
    if (!keys.includes(key)) {
      return false;
    }
  }
  if (value.version !== 1) {
    return false;
  }
  if (!Number.isSafeInteger(value.durationMinutes) || value.durationMinutes < 1 || value.durationMinutes > 180) {
    return false;
  }
  if (!Number.isSafeInteger(value.remainingMs) || value.remainingMs < 0) {
    return false;
  }
  const maxMs = value.durationMinutes * 60000;
  if (value.remainingMs > maxMs) {
    return false;
  }
  if (value.phase === 'ready' || value.phase === 'paused') {
    if (value.runStartedAt !== null || value.deadlineAt !== null) {
      return false;
    }
  } else if (value.phase === 'running') {
    if (!Number.isSafeInteger(value.runStartedAt) || value.runStartedAt < 0) {
      return false;
    }
    if (!Number.isSafeInteger(value.deadlineAt) || value.deadlineAt < 0) {
      return false;
    }
    if (value.deadlineAt - value.runStartedAt !== value.remainingMs) {
      return false;
    }
  } else {
    return false;
  }
  return true;
}

export function snapshot(record, now) {
  if (!validateRecord(record)) {
    throw new TypeError('INVALID_RECORD');
  }
  if (!Number.isSafeInteger(now) || now < 0) {
    throw new TypeError('INVALID_CLOCK');
  }
  let remaining = record.remainingMs;
  let phase = record.phase;
  if (record.phase === 'running') {
    const elapsed = now - record.runStartedAt;
    remaining = Math.max(0, record.remainingMs - elapsed);
    if (remaining === 0) {
      phase = 'completed';
    }
  }
  const totalSeconds = Math.ceil(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return {
    phase: phase,
    remainingMs: remaining,
    durationMinutes: record.durationMinutes,
    minutes: minutes,
    seconds: seconds
  };
}

export function transition(record, event, now) {
  if (!validateRecord(record)) {
    return { ok: false, error: 'INVALID_RECORD' };
  }
  if (!Number.isSafeInteger(now) || now < 0) {
    return { ok: false, error: 'INVALID_CLOCK' };
  }
  if (typeof event !== 'object' || event === null || Array.isArray(event)) {
    return { ok: false, error: 'INVALID_TRANSITION' };
  }
  const eventKeys = Object.keys(event);
  if (eventKeys.length !== 1) {
    return { ok: false, error: 'INVALID_TRANSITION' };
  }
  const type = event.type;
  if (type === 'CONFIGURE') {
    if (record.phase !== 'ready' && record.phase !== 'completed') {
      return { ok: false, error: 'INVALID_TRANSITION' };
    }
    if (eventKeys[0] !== 'minutes') {
      return { ok: false, error: 'INVALID_TRANSITION' };
    }
    const minutes = event.minutes;
    if (!Number.isSafeInteger(minutes) || minutes < 1 || minutes > 180) {
      return { ok: false, error: 'INVALID_TRANSITION' };
    }
    return {
      ok: true,
      record: {
        version: 1,
        durationMinutes: minutes,
        phase: 'ready',
        remainingMs: minutes * 60000,
        runStartedAt: null,
        deadlineAt: null
      }
    };
  }
  if (type === 'START') {
    if (record.phase !== 'ready' && record.phase !== 'completed') {
      return { ok: false, error: 'INVALID_TRANSITION' };
    }
    const startAt = now;
    const deadline = startAt + record.remainingMs;
    if (!Number.isSafeInteger(deadline)) {
      return { ok: false, error: 'INVALID_CLOCK' };
    }
    return {
      ok: true,
      record: {
        version: 1,
        durationMinutes: record.durationMinutes,
        phase: 'running',
        remainingMs: record.remainingMs,
        runStartedAt: startAt,
        deadlineAt: deadline
      }
    };
  }
  if (type === 'PAUSE') {
    if (record.phase !== 'running') {
      return { ok: false, error: 'INVALID_TRANSITION' };
    }
    const elapsed = now - record.runStartedAt;
    const remaining = Math.max(0, record.remainingMs - elapsed);
    if (remaining === 0) {
      return { ok: false, error: 'INVALID_TRANSITION' };
    }
    return {
      ok: true,
      record: {
        version: 1,
        durationMinutes: record.durationMinutes,
        phase: 'paused',
        remainingMs: remaining,
        runStartedAt: null,
        deadlineAt: null
      }
    };
  }
  if (type === 'RESUME') {
    if (record.phase !== 'paused') {
      return { ok: false, error: 'INVALID_TRANSITION' };
    }
    const startAt = now;
    const deadline = startAt + record.remainingMs;
    if (!Number.isSafeInteger(deadline)) {
      return { ok: false, error: 'INVALID_CLOCK' };
    }
    return {
      ok: true,
      record: {
        version: 1,
        durationMinutes: record.durationMinutes,
        phase: 'running',
        remainingMs: record.remainingMs,
        runStartedAt: startAt,
        deadlineAt: deadline
      }
    };
  }
  if (type === 'RESET') {
    const fullDuration = record.durationMinutes * 60000;
    return {
      ok: true,
      record: {
        version: 1,
        durationMinutes: record.durationMinutes,
        phase: 'ready',
        remainingMs: fullDuration,
        runStartedAt: null,
        deadlineAt: null
      }
    };
  }
  return { ok: false, error: 'INVALID_TRANSITION' };
}