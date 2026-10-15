export function installGuestEditor(onApply) {
  let currentGuest = { name: '', note: '' };
  const dialog = document.getElementById('guest-dialog');
  const form = document.getElementById('guest-form');
  const nameInput = document.getElementById('request-name');
  const noteInput = document.getElementById('request-note');
  const summarySpan = document.getElementById('request-guest-summary');
  const cancelBtn = document.getElementById('cancel-request-guest');
  const openBtn = document.getElementById('edit-request-guest');
  const errorEl = document.getElementById('guest-form-error');
  let triggerElement = null;

  function updateSummary() {
    summarySpan.textContent = currentGuest.name || '이름을 입력해 주세요';
  }

  function clearValidation() {
    errorEl.textContent = '';
    nameInput.removeAttribute('aria-invalid');
    noteInput.removeAttribute('aria-invalid');
  }

  function open() {
    triggerElement = openBtn;
    clearValidation();
    nameInput.value = currentGuest.name;
    noteInput.value = currentGuest.note;
    dialog.showModal();
    nameInput.focus();
  }

  function read() {
    return { name: currentGuest.name, note: currentGuest.note };
  }

  function apply() {
    const name = nameInput.value.trim();
    const note = noteInput.value;

    if (!name) {
      errorEl.textContent = '예약자 이름을 입력해 주세요.';
      nameInput.setAttribute('aria-invalid', 'true');
      nameInput.focus();
      return;
    }

    if (name.length > 60) {
      errorEl.textContent = '이름은 60자를 초과할 수 없습니다.';
      nameInput.setAttribute('aria-invalid', 'true');
      nameInput.focus();
      return;
    }

    if (note.length > 500) {
      errorEl.textContent = '요청 사항은 500자를 초과할 수 없습니다.';
      noteInput.setAttribute('aria-invalid', 'true');
      noteInput.focus();
      return;
    }

    currentGuest = { name, note };
    updateSummary();
    dialog.close();
    if (triggerElement) triggerElement.focus();
    if (typeof onApply === 'function') {
      onApply({ name, note });
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    apply();
  });

  cancelBtn.addEventListener('click', () => {
    dialog.close();
    if (triggerElement) triggerElement.focus();
  });

dialog.addEventListener('cancel', (e) => { e.preventDefault(); dialog.close(); if (triggerElement) triggerElement.focus(); });

nameInput.addEventListener('input', clearValidation);
  openBtn.addEventListener('click', open);

  function dismiss() {
    if (dialog.open) dialog.close();
    nameInput.value = currentGuest.name;
    noteInput.value = currentGuest.note;
    clearValidation();
  }

  return { read, open, dismiss };
}