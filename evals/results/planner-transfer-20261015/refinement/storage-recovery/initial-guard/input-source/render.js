import { weekDates } from './store.js';
function renderWeek(selectedDate) {
const dates = weekDates(selectedDate);
    const heading = document.getElementById('selected-date');
    const container = document.getElementById('week-days');

    if (heading) {
heading.textContent = new Date(selectedDate + 'T00:00:00').toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });
    }

    if (container) {
        container.replaceChildren();
    }

    const weekdays = ['월', '화', '수', '목', '금', '토', '일'];

    for (let i = 0; i < 7; i++) {
const dateStr = dates[i];
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'day-button';
        btn.dataset.date = dateStr;
        btn.setAttribute('aria-label', new Date(dateStr + 'T00:00:00').toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }));
btn.setAttribute('aria-pressed', dateStr === selectedDate ? 'true' : 'false');

        const spanWeekday = document.createElement('span');
        spanWeekday.className = 'weekday';
        spanWeekday.textContent = weekdays[i];

        const spanDayNumber = document.createElement('span');
        spanDayNumber.className = 'day-number';
        spanDayNumber.textContent = new Date(dateStr + 'T00:00:00').getDate();

        btn.append(spanWeekday, spanDayNumber);
        container.append(btn);
    }
}

function renderTasks(state) {
  const { tasks, selectedDate, error } = state;
  const containerStudy = document.getElementById('study-items');
  const containerLife = document.getElementById('life-items');
  const emptyState = document.getElementById('empty-state');
  const pageError = document.getElementById('page-error');
  const template = document.getElementById('task-template');

  if (pageError) {
    pageError.textContent = error || '';
  }

  const filteredTasks = tasks.filter(task => task.date === selectedDate);

  if (containerStudy) containerStudy.replaceChildren();
  if (containerLife) containerLife.replaceChildren();

if (emptyState) emptyState.hidden = filteredTasks.length > 0;  const fragment = document.createDocumentFragment();

  filteredTasks.forEach(task => {
    const clone = template.content.cloneNode(true);
    const row = clone.querySelector('.task-row');
    const checkbox = clone.querySelector('.task-check');
    const nameSpan = clone.querySelector('.task-name');
    const deleteBtn = clone.querySelector('.delete-task');

    if (row) {
      row.dataset.id = task.id;
      if (task.completed) {
        row.classList.add('is-complete');
      } else {
        row.classList.remove('is-complete');
      }
    }

    if (checkbox) {
      checkbox.checked = !!task.completed;
    }

    if (nameSpan) {
      nameSpan.textContent = task.title;
    }

    if (deleteBtn) {
      deleteBtn.setAttribute('aria-label', task.title + ' 할 일 삭제');
    }

    if (task.category === 'study') {
      if (containerStudy) containerStudy.appendChild(clone);
    } else if (task.category === 'life') {
      if (containerLife) containerLife.appendChild(clone);
    }
  });
}

function renderPlanner(state) {
    renderWeek(state.selectedDate);
    renderTasks(state);
}
export { renderPlanner };
