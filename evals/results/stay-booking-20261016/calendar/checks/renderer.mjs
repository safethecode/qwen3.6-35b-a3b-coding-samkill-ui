import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const [folder, output] = process.argv.slice(2), root = resolve(folder);
assert.ok(existsSync(root + '/calendar-renderer.js'), 'Calendar renderer is not implemented');
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH }), checks = [];
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 900 } }), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('http://calendar.test/**', async route => {
    const file = new URL(route.request().url()).pathname.slice(1);
    if (!file) return route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="ko"><meta charset="utf-8"><body><div id="months"></div></body></html>' });
    if (!['calendar-renderer.js', 'calendar-model.js', 'dates.js'].includes(file)) return route.fulfill({ status: 404, body: '' });
    await route.fulfill({ contentType: 'text/javascript', body: await readFile(root + '/' + file) });
  });
  await page.goto('http://calendar.test/');
  const results = await page.evaluate(async () => {
    const { renderCalendarMonths } = await import('/calendar-renderer.js'), root = document.getElementById('months'), results = [];
    const require = (ok, message) => { if (!ok) throw Error(message); }, check = (name, fn) => { fn(); results.push({ name, status: 'PASS' }); };
    const descriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML'); Object.defineProperty(Element.prototype, 'innerHTML', { ...descriptor, set() { throw Error('Unsafe innerHTML is forbidden'); } });
    const draw = options => renderCalendarMonths(root, { month: '2026-11', today: '2026-10-16', draft: { start: '', end: '', error: '' }, ...options });
    const button = date => root.querySelector('[data-date="' + date + '"]'), rows = () => [...root.querySelectorAll('tbody tr')];
    check('two consecutive complete months and exact seven-column rows', () => { draw(); require(root.querySelectorAll('section.calendar-month').length === 2, 'Need two month sections'); require(JSON.stringify([...root.querySelectorAll('caption')].map(n => n.textContent)) === JSON.stringify(['2026년 11월', '2026년 12월']), 'Wrong captions'); require(root.querySelectorAll('button[data-date]').length === 61, 'Missing or extra real dates'); require(rows().every(row => row.children.length === 7), 'Each row needs seven cells'); require(root.querySelector('tbody tr td button')?.dataset.date === '2026-11-01', 'Sunday alignment lost'); require([...root.querySelectorAll('thead')].every(head => head.querySelectorAll('th[scope=col]').length === 7), 'Native weekday headers are incomplete'); });
    check('past dates disable actual buttons and blank cells have no controls', () => { draw({ month: '2026-10' }); require(root.querySelectorAll('button:disabled').length === 15, 'Incorrect disabled days'); require(button('2026-10-16')?.disabled === false, 'Today must be selectable'); require(button('2026-10-16').getAttribute('aria-current') === 'date', 'Today needs a real current-date marker'); require([...root.querySelectorAll('td[aria-hidden=true]')].every(cell => !cell.querySelector('button,a,input')), 'Blank padding cannot own controls'); });
    check('selected endpoints,middle range and accessible exact dates agree', () => { const draft = Object.freeze({ start: '2026-11-06', end: '2026-11-08', error: '' }); draw({ draft }); require(button(draft.start).dataset.selected === 'start', 'Missing start state'); require(button(draft.end).dataset.selected === 'end', 'Missing end state'); require(button('2026-11-07').closest('td').dataset.range === 'middle', 'Missing middle range'); require(root.querySelectorAll('button[aria-pressed=true]').length === 3, 'Selected range mismatch'); require(button(draft.start).getAttribute('aria-label').includes('2026년 11월 6일') && button(draft.start).getAttribute('aria-label').includes('체크인'), 'Start accessible identity incomplete'); require(button(draft.end).getAttribute('aria-label').includes('체크아웃'), 'End accessible identity incomplete'); require(draft.end === '2026-11-08', 'Renderer mutated caller'); });
    check('pending range is one selected date and rerender removes old states', () => { draw({ draft: { start: '2026-11-06', end: '', error: '' } }); require(root.querySelectorAll('button[aria-pressed=true]').length === 1, 'Pending start must be only selected date'); require(!root.querySelector('[data-selected=end]'), 'Stale end state'); draw(); require(root.querySelectorAll('button[aria-pressed=true]').length === 0, 'Stale selected state'); require(root.querySelectorAll('table').length === 2, 'Rerender left duplicate tables'); });
    check('one roving tabstop follows explicit focus,selected start or first enabled', () => { for (const date of ['2026-11-08', '2026-12-08']) { draw({ focusDate: date }); require(root.querySelectorAll('button[tabindex="0"]').length === 1 && button(date).tabIndex === 0, 'Explicit focus not honored'); } draw({ draft: { start: '2026-11-06', end: '', error: '' } }); require(button('2026-11-06').tabIndex === 0, 'Selected start not preferred'); draw({ month: '2026-10', focusDate: '2026-10-01' }); require(button('2026-10-16').tabIndex === 0, 'Disabled requested focus should fall back to first enabled'); require(root.querySelectorAll('button[tabindex="0"]').length === 1, 'Multiple active tabstops'); });
    check('year rollover and last supported month preserve bounds', () => { draw({ month: '2026-12' }); require(button('2027-01-31')?.dataset.number === '31', 'Missing year rollover'); draw({ month: '2099-12' }); require(root.querySelectorAll('table').length === 1 && root.querySelectorAll('button[data-date]').length === 31, 'Last supported month needs one complete table'); require(!root.textContent.includes('2100'), 'Unsupported future dates introduced'); });
    check('all-past view has no enabled roving target', () => { draw({ month: '2000-01' }); require(root.querySelectorAll('button[tabindex="0"]').length === 0, 'Past view cannot have enabled tabstop'); require([...root.querySelectorAll('button')].every(n => n.disabled), 'Past view has selectable date'); });
    return results;
  });
  checks.push(...results); assert.deepEqual(errors, []);
  await writeFile(output, JSON.stringify({ at: new Date().toISOString(), checks, failures: 0, scope: 'Actual DOM renderer semantics only; no CSS,visual quality,AT or device approval' }, null, 2)); console.log(JSON.stringify({ groups: checks.length, failures: 0 }));
} finally { await browser.close(); }
