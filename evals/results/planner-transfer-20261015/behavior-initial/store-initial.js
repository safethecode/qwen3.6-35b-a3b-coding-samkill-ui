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

export function createStore(storage = localStorage) {
  let tasks = [];

  function load() {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(t =>
            t &&
            typeof t.id === 'string' &&
            typeof t.title === 'string' &&
            t.title.trim().length > 0 &&
            t.title.trim().length <= 120 &&
            (t.category === 'study' || t.category === 'life') &&
            typeof t.completed === 'boolean' &&
            /^\d{4}-\d{2}-\d{2}$/.test(t.date)
          );
          tasks = valid;
          return null;
        }
      }
    } catch (e) {
      return '저장된 데이터를 불러오는 중 오류가 발생했습니다.';
    }
    tasks = [];
    return null;
  }

  function save() {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      return null;
    } catch (e) {
      return '저장소에 데이터를 쓰는 중 오류가 발생했습니다.';
    }
  }

  const loadErr = load();

  return {
    get tasks() { return tasks; },
    get error() { return loadErr; },
    add(title, category, date) {
      const trimmed = title.trim();
      if (trimmed.length === 0 || trimmed.length > 120) {
        throw new Error('할 일 제목은 1자 이상 120자 이하여야 합니다.');
      }
      if (category !== 'study' && category !== 'life') {
        throw new Error('잘못된 분류입니다.');
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new Error('잘못된 날짜 형식입니다.');
      }
      const newTask = {
        id: crypto.randomUUID(),
        title: trimmed,
        category,
        date,
        completed: false
      };
      tasks = [...tasks, newTask];
      const err = save();
      if (err) throw new Error(err);
      return newTask;
    },
    toggle(id) {
      const idx = tasks.findIndex(t => t.id === id);
      if (idx === -1) return;
      tasks = [
        ...tasks.slice(0, idx),
        { ...tasks[idx], completed: !tasks[idx].completed },
        ...tasks.slice(idx + 1)
      ];
      const err = save();
      if (err) throw new Error(err);
    },
    remove(id) {
      const idx = tasks.findIndex(t => t.id === id);
      if (idx === -1) return;
      tasks = [...tasks.slice(0, idx), ...tasks.slice(idx + 1)];
      const err = save();
      if (err) throw new Error(err);
    }
  };
}