import {makeCalendarMonth,shiftCalendarMonth} from "./calendar-model.js";
export function renderCalendarMonths(container,{month,today,draft,focusDate}){
  const monthStrs = [month, shiftCalendarMonth(month, 1)].filter(Boolean);
  container.replaceChildren();
  const allDayButtons = [];
  monthStrs.forEach(mStr => {
    const monthData = makeCalendarMonth(mStr, today);
    const section = document.createElement('section');
    section.className = 'calendar-month';
    const table = document.createElement('table');
    const caption = document.createElement('caption');
    caption.className = 'calendar-month-title';
    const monthLabel = document.createElement('span');
    monthLabel.className = 'calendar-month-label';
    monthLabel.textContent = monthData.label;
    caption.appendChild(monthLabel);
    table.appendChild(caption);
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    ['일','월','화','수','목','금','토'].forEach(d => {
      const th = document.createElement('th');
      th.setAttribute('scope','col');
      th.textContent = d;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    let row = document.createElement('tr');
    for (let i = 0; i < monthData.leading; i++) {
      const td = document.createElement('td');
      td.setAttribute('aria-hidden','true');
      row.appendChild(td);
    }
    monthData.days.forEach(day => {
      if (row.children.length === 7) {
        tbody.appendChild(row);
        row = document.createElement('tr');
      }
      const td = document.createElement('td');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'calendar-day';
      btn.dataset.date = day.date;
      btn.dataset.number = String(day.day);
      btn.disabled = day.disabled;
      btn.textContent = String(day.day);
      btn.tabIndex = -1;
      btn.setAttribute('aria-pressed','false');
      let rangeType = null;
      if (draft.start && draft.end) {
        if (day.date === draft.start) {
          rangeType = 'start';
          btn.dataset.selected = 'start';
        } else if (day.date === draft.end) {
          rangeType = 'end';
          btn.dataset.selected = 'end';
        } else if (day.date > draft.start && day.date < draft.end) {
          rangeType = 'middle';
        }
      } else if (draft.start && !draft.end) {
        if (day.date === draft.start) {
          rangeType = 'start';
          btn.dataset.selected = 'start';
        }
      }
      if (rangeType) {
        td.dataset.range = rangeType;
        btn.setAttribute('aria-pressed','true');
      }
      if (day.date === today) {
        btn.setAttribute('aria-current','date');
      }
      const [y, m, d] = day.date.split('-').map(Number);
      const dateObj = new Date(Date.UTC(y, m - 1, d));
      const weekDays = ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'];
      let label = dateObj.getUTCFullYear()+'년 '+(dateObj.getUTCMonth()+1)+'월 '+dateObj.getUTCDate()+'일 '+weekDays[dateObj.getUTCDay()];
      if (rangeType === 'start') label += ' 체크인';
      if (rangeType === 'end') label += ' 체크아웃';
      btn.setAttribute('aria-label', label);
      td.appendChild(btn);
      row.appendChild(td);
      if (!day.disabled) allDayButtons.push(btn);
    });
    while (row.children.length < 7) {
      const td = document.createElement('td');
      td.setAttribute('aria-hidden','true');
      row.appendChild(td);
    }
    tbody.appendChild(row);
    table.appendChild(tbody);
    section.appendChild(table);
    container.appendChild(section);
  });
  let focusTarget = null;
  if (focusDate && allDayButtons.some(b => b.dataset.date === focusDate)) {
    focusTarget = allDayButtons.find(b => b.dataset.date === focusDate);
  }
  if (!focusTarget && draft.start) {
    focusTarget = allDayButtons.find(b => b.dataset.date === draft.start && !b.disabled);
  }
  if (!focusTarget) {
    focusTarget = allDayButtons.find(b => !b.disabled);
  }
  if (focusTarget) {
    allDayButtons.forEach(btn => {
      btn.tabIndex = btn === focusTarget ? 0 : -1;
    });
  }
}