import {parseStayDate,countNights,isBookableRange} from './dates.js';
const INVALID_DATE_MESSAGE='선택할 수 없는 날짜예요.';
const RANGE_LIMIT_MESSAGE='최대 28박까지 선택할 수 있어요.';
export function makeCalendarMonth(month,today){
if (typeof month !== 'string' || month.length !== 7) {
    throw new TypeError(INVALID_DATE_MESSAGE);
  }
  const firstDayMs = parseStayDate(month + '-01');
  if (firstDayMs === null) {
    throw new TypeError(INVALID_DATE_MESSAGE);
  }
  const todayMs = parseStayDate(today);
  if (todayMs === null) {
    throw new TypeError(INVALID_DATE_MESSAGE);
  }
  const start = new Date(firstDayMs);
  const year = start.getUTCFullYear();
  const monthNum = start.getUTCMonth();
  const leading = start.getUTCDay();
  const nextMonthStart = new Date(Date.UTC(year, monthNum + 1, 1));
  const lastDayMs = nextMonthStart.getTime() - 86400000;
  const lastDay = new Date(lastDayMs).getUTCDate();
  const label = `${year}년 ${monthNum + 1}월`;
  const days = [];
  for (let d = 1; d <= lastDay; d++) {
    const dateStr = `${year}-${String(monthNum + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dateMs = parseStayDate(dateStr);
    const disabled = dateMs < todayMs;
    days.push({ date: dateStr, day: d, disabled: disabled });
  }
  return { month, label, leading, days };
}
export function shiftCalendarMonth(month,delta){
if (typeof month !== "string" || month.length !== 7) throw new TypeError(INVALID_DATE_MESSAGE);
const parsedStart = parseStayDate(month + "-01");
  if (!parsedStart) {
    throw new TypeError(INVALID_DATE_MESSAGE);
  }
  if (typeof delta !== "number" || !Number.isInteger(delta) || delta < -1200 || delta > 1200) {
    throw new TypeError(INVALID_DATE_MESSAGE);
  }
  const baseDate = new Date(parsedStart);
  const targetMonth = baseDate.getUTCMonth() + delta;
  const targetYear = baseDate.getUTCFullYear();
  const newDate = new Date(Date.UTC(targetYear, targetMonth, 1));
  const year = newDate.getUTCFullYear();
  if (year < 2000 || year > 2099) {
    return null;
  }
  const m = newDate.getUTCMonth() + 1;
  return `${year}-${String(m).padStart(2, "0")}`;

}
export function chooseCalendarDate(draft,date,today){
if (!draft || typeof draft !== 'object' || typeof draft.start !== 'string' || typeof draft.end !== 'string') {
    throw new TypeError('Invalid draft');
  }
  const todayMs = parseStayDate(today);
  if (todayMs === null) {
    throw new TypeError('Invalid today');
  }
  if (!draft.start && draft.end) throw new TypeError('Invalid calendar draft');
  if (draft.start && (parseStayDate(draft.start) === null || parseStayDate(draft.start) < todayMs)) throw new TypeError('Invalid calendar draft');
  if (draft.end && !isBookableRange(draft.start, draft.end, today)) throw new TypeError('Invalid calendar draft');
  const clickMs = parseStayDate(date);
  if (clickMs === null || clickMs < todayMs) {
    return { start: draft.start, end: draft.end, error: INVALID_DATE_MESSAGE };
  }
  if (!draft.start) {
    return { start: date, end: '', error: '' };
  }
  const sMs = parseStayDate(draft.start);
  if (sMs === null) {
    throw new TypeError('Invalid start date');
  }
  if (draft.end) {
    const eMs = parseStayDate(draft.end);
    if (eMs === null) {
      throw new TypeError('Invalid end date');
    }
    if (!isBookableRange(draft.start, draft.end, today)) {
      return { start: date, end: '', error: '' };
    }
    return { start: date, end: '', error: '' };
  }
  if (clickMs <= sMs) {
    return { start: date, end: '', error: '' };
  }
  const nights = countNights(draft.start, date);
  if (nights === null) {
    return { start: draft.start, end: draft.end, error: RANGE_LIMIT_MESSAGE };
  }
  if (nights > 28) {
    return { start: draft.start, end: draft.end, error: RANGE_LIMIT_MESSAGE };
  }
  return { start: draft.start, end: date, error: '' };

}
