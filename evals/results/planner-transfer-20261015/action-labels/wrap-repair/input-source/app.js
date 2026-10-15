import { createStore, dateKey } from './store.js';
import { renderPlanner } from './render.js';

const store = createStore();
const state = { tasks: store.tasks, selectedDate: dateKey(new Date()), error: store.error };
const dialog = document.getElementById('task-dialog');
const form = document.getElementById('task-form');
const titleInput = document.getElementById('task-name');
const catSelect = document.getElementById('task-category');
const errorEl = document.getElementById('task-error');
const pageError = document.getElementById('page-error');

let lastFocused = null;

function updateUI() {
  state.tasks = store.tasks;
  state.error = store.error;
  renderPlanner(state);
  if (pageError) pageError.textContent = store.error || '';

}

function openDialog(category) {
  lastFocused = document.activeElement;
  dialog.showModal();
  titleInput.value = '';
  errorEl.textContent = '';
  titleInput.removeAttribute('aria-invalid');
  titleInput.removeAttribute('aria-describedby');
  catSelect.value = category || 'study';
  titleInput.focus();
}

document.getElementById('close-task').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => {
  if (dialog.open) return;
  if (!lastFocused || !document.contains(lastFocused)) return;
  const active = document.activeElement;
  if (active !== document.body && active !== dialog) return;
  lastFocused.focus();
});

document.getElementById('week-days').addEventListener('click', (e) => {
  const btn = e.target.closest('.day-button');
  if (!btn) return;
  state.selectedDate = btn.dataset.date;
  updateUI();
  const newBtn = document.querySelector(`[data-date='${state.selectedDate}']`);
  if (newBtn) newBtn.focus();
});

document.querySelectorAll('.add-task').forEach(btn => {
  btn.addEventListener('click', () => openDialog(btn.dataset.addCategory));
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const category = catSelect.value;
  const iso = state.selectedDate;
  errorEl.textContent = '';
  titleInput.removeAttribute('aria-invalid');
  titleInput.removeAttribute('aria-describedby');

  if (!title) {
    errorEl.textContent = '할 일을 입력해주세요.';
    titleInput.setAttribute('aria-invalid', 'true');
    titleInput.setAttribute('aria-describedby', 'task-error');
    return;
  }

  try {
    store.add(title, category, iso);
    updateUI();
    dialog.close();
  } catch (err) {
    errorEl.textContent = err.message;
    titleInput.setAttribute('aria-invalid', 'true');
    titleInput.setAttribute('aria-describedby', 'task-error');
  }
});

const taskList = document.querySelector('.task-groups');
taskList.addEventListener('change', (e) => {
  if (e.target.matches('.task-check')) {
    const row = e.target.closest('.task-row');
    const id = row.dataset.id;
    try {
      store.toggle(id);
      updateUI();
      const newCheck = document.querySelector(`.task-row[data-id="${id}"] .task-check`);
      if (newCheck) newCheck.focus();
    } catch (err) {
      e.target.checked = !e.target.checked;
      pageError.textContent = '저장 중 오류가 발생했습니다.';
    }
  }
});

taskList.addEventListener('click', (e) => {
  const btn = e.target.closest('.delete-task');
  if (!btn) return;
  const row = btn.closest('.task-row');
  const id = row.dataset.id;
  try {
    const category = store.tasks.find(t => t.id === id)?.category;
    store.remove(id);
    updateUI();
    const visibleCheck = document.querySelector('.task-check:not([hidden])');
    if (visibleCheck) visibleCheck.focus();
    else {
      const addBtn = document.querySelector(`[data-add-category='${category}']`);
      if (addBtn) addBtn.focus();
    }
  } catch (err) {
    pageError.textContent = '삭제 중 오류가 발생했습니다.';
  }
});

updateUI();