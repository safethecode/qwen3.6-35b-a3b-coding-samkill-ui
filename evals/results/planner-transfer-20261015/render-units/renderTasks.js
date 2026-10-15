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

  if (filteredTasks.length > 0) {
    if (emptyState) emptyState.classList.add('hidden');
  } else {
    if (emptyState) emptyState.classList.remove('hidden');
  }

  const fragment = document.createDocumentFragment();

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