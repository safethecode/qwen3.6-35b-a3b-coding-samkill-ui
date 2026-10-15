function renderWeek(selectedDate) {
    const weekDates = externalWeekDates(selectedDate);
    const heading = document.getElementById('selected-date');
    const container = document.getElementById('week-days');

    if (heading) {
        heading.textContent = selectedDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });
    }

    if (container) {
        container.replaceChildren();
    }

    const weekdays = ['월', '화', '수', '목', '금', '토', '일'];

    for (let i = 0; i < 7; i++) {
        const dateStr = weekDates[i];
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'day-button';
        btn.dataset.date = dateStr;
        btn.setAttribute('aria-label', new Date(dateStr + 'T00:00:00').toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }));
        btn.setAttribute('aria-pressed', dateStr === selectedDate.toISOString().split('T')[0] ? 'true' : 'false');

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