function parseStayDate(value) {
  if (typeof value !== 'string' || value.length !== 10) return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  if (year < 2000 || year > 2099) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  const d = new Date(Date.UTC(year, month - 1, day));
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) {
    return null;
  }
  return d.getTime();
}

function countNights(start, end) {
  const s = parseStayDate(start);
  const e = parseStayDate(end);
  if (s === null || e === null) return null;
  if (e <= s) return null;
  const diff = (e - s) / 86400000;
  if (diff < 1 || diff > 28) return null;
  return Math.floor(diff);
}

function isBookableRange(start, end, today) {
  const s = parseStayDate(start);
  const e = parseStayDate(end);
  const t = parseStayDate(today);
  if (s === null || e === null || t === null) return false;
  if (s < t) return false;
  if (countNights(start, end) === null) return false;
  return true;
}

export { parseStayDate, countNights, isBookableRange };