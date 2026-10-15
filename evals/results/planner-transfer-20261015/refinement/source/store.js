const STORAGE_KEY = 'weekly-tasks-v1';

export function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function weekDates(iso) {
  const d = new Date(iso + 'T00:00:00');
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + i);
    dates.push(dateKey(dd));
  }
  return dates;
}

function createStore(storage = localStorage) {
  const STORAGE_KEY = 'weekly-tasks-v1';
  let tasks = [];
  let error = null;

  function dateKey(d) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function validDate(s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const d = new Date(s + 'T00:00:00');
    return isFinite(d) && dateKey(d) === s;
  }

  function isValidRecord(r) {
    if (!r || typeof r !== 'object') return false;
    if (typeof r.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(r.id)) return false;
if (typeof r.title !== 'string' || r.title.trim().length < 1 || r.title.trim().length > 120) return false;
    if (!['study', 'life'].includes(r.category)) return false;
    if (typeof r.completed !== 'boolean') return false;
    if (!validDate(r.date)) return false;
    return true;
  }

  function load() {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (raw === null) {
        tasks = [];
        error = null;
        return;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error('parse');
      if (!parsed.every(isValidRecord)) throw new Error('invalid record');
      const ids = new Set();
      for (const r of parsed) {
        if (ids.has(r.id)) throw new Error('duplicate id');
        ids.add(r.id);
      }
      tasks = parsed;
      error = null;
    } catch (e) {
      tasks = [];
      error = '저장한 할 일을 불러오지 못했어요.';
    }
  }

function commit(next) {
    if (initialReadError) throw new Error('저장한 할 일을 불러오지 못했어요. 새로고침 후 다시 확인해주세요.');
    try {      storage.setItem(STORAGE_KEY, JSON.stringify(next));
      tasks = next;
      error = null;
    } catch (e) {
      error = '저장소 저장 중 오류가 발생했습니다.';
      throw new Error(error);
    }
  }

  load();
  const initialReadError = error;

  return {
    get tasks() {
      return tasks;
    },
    get error() {
      return error;
    },
    add(title, category, date) {
      const trimmed = title.trim();
if (trimmed.length < 1 || trimmed.length > 120) throw new Error('제목 길이는 1자 이상 120자 이하여야 합니다.');
if (category !== 'study' && category !== 'life') throw new Error('카테고리는 study 또는 life만 가능합니다.');
if (!validDate(date)) throw new Error('유효하지 않은 날짜입니다.');
      const newTask = {
        id: crypto.randomUUID(),
        title: trimmed,
        category,
        date,
        completed: false
      };
      commit([...tasks, newTask]);
      return newTask;
    },
    toggle(id) {
      const idx = tasks.findIndex(t => t.id === id);
      if (idx === -1) return null;
      const next = tasks.map((t, i) => i === idx ? { ...t, completed: !t.completed } : t);
      commit(next);
      return next[idx];
    },
    remove(id) {
      const idx = tasks.findIndex(t => t.id === id);
      if (idx === -1) return null;
      const next = tasks.filter(t => t.id !== id);
      commit(next);
      return tasks[idx];
    }
  };
}
export { createStore };
