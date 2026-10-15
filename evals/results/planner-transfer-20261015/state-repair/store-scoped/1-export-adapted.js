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
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function validDate(s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const d = new Date(s + 'T00:00:00');
    return isFinite(d) && dateKey(d) === s;
  }

  function isValidRecord(r) {
    if (!r || typeof r !== 'object') return false;
    if (typeof r.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(r.id)) return false;
    if (typeof r.title !== 'string' || r.title.length < 1 || r.title.length > 120) return false;
    if (r.title !== r.title.trim()) return false;
    if (r.category !== 'study' && r.category !== 'life') return false;
    if (!validDate(r.date)) return false;
    if (typeof r.completed !== 'boolean') return false;
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
      if (parsed.length > 0 && !parsed.every(isValidRecord)) throw new Error('invalid');
      tasks = parsed;
      error = null;
    } catch (e) {
      tasks = [];
      error = '저장소 로드 오류';
    }
  }

  function commit(next) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(next));
      tasks = next;
      error = null;
    } catch (e) {
      error = '저장소 저장 오류';
      throw new Error('저장 실패');
    }
  }

  load();

  return {
    get tasks() { return tasks; },
    get error() { return error; },
    add(title, category, date) {
      const trimmed = title.trim();
      if (trimmed.length < 1 || trimmed.length > 120) return null;
      if (category !== 'study' && category !== 'life') return null;
      if (!validDate(date)) return null;
      const newTask = {
        id: crypto.randomUUID(),
        title: trimmed,
        category: category,
        date: date,
        completed: false
      };
      const next = [...tasks, newTask];
      commit(next);
      return newTask;
    },
    toggle(id) {
      const idx = tasks.findIndex(t => t.id === id);
      if (idx === -1) return;
      const next = tasks.map((t, i) => i === idx ? { ...t, completed: !t.completed } : t);
      commit(next);
    },
    remove(id) {
      const next = tasks.filter(t => t.id !== id);
      if (next.length === tasks.length) return;
      commit(next);
    }
  };
}
export { createStore };
