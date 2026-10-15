import { createStore, dateKey } from './store.js';
import { renderPlanner } from './render.js';

const store = createStore();
const state = { tasks: store.tasks, selectedDate: new Date(), error: store.error };
const dialog = document.getElementById('task-dialog');
const form = document.getElementById('task-form');
const titleInput = document.getElementById('task-name');
const catSelect = document.getElementById('task-category');
const errorEl = document.getElementById('task-error');
const pageError = document.getElementById('page-error');
const emptyState = document.getElementById('empty-state');
let lastFocused = null;

function updateUI() {
  state.tasks = store.tasks;
  state.error = store.error;
  renderPlanner(state);
  if (pageError) pageError.textContent = store.error || '';
  if (emptyState) emptyState.classList.toggle('hidden', state.tasks.some(t => t.date === dateKey(state.selectedDate)));
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
dialog.addEventListener('close', () => { if (lastFocused) lastFocused.focus(); });

document.getElementById('week-days').addEventListener('click', (e) => {
  const btn = e.target.closest('.day-button');
  if (!btn) return;
  state.selectedDate = new Date(btn.dataset.date + 'T00:00:00');
  updateUI();
  btn.focus();
});

document.querySelectorAll('.add-task').forEach(btn => {
  btn.addEventListener('click', () => openDialog(btn.dataset.addCategory));
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const category = catSelect.value;
  const iso = dateKey(state.selectedDate);
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

const taskList = document.getElementById('study-items');
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
    store.remove(id);
    updateUI();
    const next = row.nextElementSibling;
    if (next) next.querySelector('.task-check')?.focus();
    else document.getElementById('close-task')?.focus();
  } catch (err) {
    pageError.textContent = '삭제 중 오류가 발생했습니다.';
  }
});

updateUI();