import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { resolve, extname } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { sourceBinding } from '../../../scripts/source-binding.mjs';
import { harnessBinding } from '../../../scripts/harness-binding.mjs';
import { inspectLayoutContract } from '../../../scripts/layout-contract.mjs';
import { aggregateLayoutStates } from '../../../scripts/layout-state-coverage.mjs';
import { inspectTextStress } from '../../../scripts/text-stress.mjs';
const [target, output] = process.argv.slice(2);
await mkdir(output, { recursive: true });
const sourceHashes = await sourceBinding(target), harnessHashes = await harnessBinding(), checks = [], receipts = [], scrollReceipts = [], stressReports = [], widths = [296, 320, 390, 1440];
const contract = JSON.parse(await readFile(`${target}/design/layout-contract.json`, 'utf8'));
const server = createServer(async (req, res) => { try { const name = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html'; if (!Object.hasOwn(sourceHashes, name)) throw Error(); res.setHeader('content-type', ({ '.html': 'text/html;charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' })[extname(name)] || 'application/octet-stream'); res.end(await readFile(resolve(target, name))); } catch { res.writeHead(404).end(); } });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });
const open = async (width = 390, touch = false, raw) => {
  const context = await browser.newContext({ viewport: { width, height: 900 }, timezoneId: 'Asia/Seoul', hasTouch: touch, isMobile: touch });
  if (raw !== undefined) await context.addInitScript(value => localStorage.setItem('weekly-tasks-v1', value), raw);
  const page = await context.newPage(); page.setDefaultTimeout(5000); await page.goto(`http://127.0.0.1:${server.address().port}`); await page.evaluate(() => document.fonts.ready); return { context, page };
};
const check = async (name, fn) => { try { await fn(); checks.push({ name, status: 'PASS' }); } catch (e) { checks.push({ name, status: 'FAIL', detail: e.message.slice(0, 1500) }); } };
const add = async (page, title, category = 'study') => { await page.locator(`[data-add-category=${category}]`).click(); await page.locator('#task-name').fill(title); await page.locator('#save-task').click(); };
const toggle = async (page, touch = false) => { assert.equal(await page.locator('#edit-tasks').isEnabled(), true, 'Populated list editing must be available'); if (touch) await page.locator('#edit-tasks').tap(); else await page.locator('#edit-tasks').click(); };
try {
  await check('empty and malformed-read lists cannot enter editing', async () => {
    for (const raw of [undefined, '{']) { const { context, page } = await open(390, false, raw); try { assert.equal(await page.locator('#edit-tasks').isDisabled(), true); assert.equal(await page.locator('#edit-tasks').getAttribute('aria-pressed'), 'false'); assert.equal(await page.locator('.delete-task:visible').count(), 0); if (raw) assert.equal(await page.evaluate(() => localStorage.getItem('weekly-tasks-v1')), raw); } finally { await context.close(); } }
  });
  await check('coarse-pointer touch entry, real deletion, last-item reset and reload', async () => {
    const { context, page } = await open(390, true);
    try {
      assert.equal(await page.evaluate(() => matchMedia('(hover: none)').matches && navigator.maxTouchPoints > 0), true);
      await add(page, '공부할 일'); await add(page, '생활할 일', 'life'); assert.equal(await page.locator('.delete-task:visible').count(), 0);
      await toggle(page, true); assert.equal(await page.locator('#edit-tasks').getAttribute('aria-pressed'), 'true'); assert.equal((await page.locator('#edit-tasks').innerText()).trim(), '완료'); assert.equal(await page.locator('.delete-task:visible').count(), 2);
      await page.locator('.delete-task:visible').first().tap(); assert.equal(await page.locator('.task-row').count(), 1); assert.equal(await page.locator('.task-name').innerText(), '생활할 일');
      await page.locator('.delete-task:visible').tap(); assert.equal(await page.locator('.task-row').count(), 0); assert.equal(await page.locator('#edit-tasks').isDisabled(), true); assert.equal(await page.locator('#edit-tasks').getAttribute('aria-pressed'), 'false'); assert.equal(await page.evaluate(() => document.activeElement.matches('[data-add-category=life]')), true);
      await page.reload(); assert.equal(await page.locator('#edit-tasks').isDisabled(), true); assert.equal(await page.locator('.task-row').count(), 0);
    } finally { await context.close(); }
  });
  await check('keyboard exit, create cancellation, day change and reload reset editing', async () => {
    const { context, page } = await open(320);
    try {
      await add(page, '기록할 일'); await add(page, '하나 더'); const today = await page.locator('.day-button[aria-pressed=true]').getAttribute('data-date');
      assert.equal(await page.locator('#edit-tasks').isEnabled(), true); await page.locator('#edit-tasks').focus(); await page.keyboard.press('Space'); assert.equal(await page.locator('.delete-task:visible').count(), 2); assert.equal(await page.locator('#edit-tasks').evaluate(e => e === document.activeElement), true);
      await page.keyboard.press('Enter'); assert.equal(await page.locator('.delete-task:visible').count(), 0); assert.equal(await page.locator('#edit-tasks').evaluate(e => e === document.activeElement), true);
      await toggle(page); await page.locator('[data-add-category=study]').click(); assert.equal(await page.locator('#edit-tasks').getAttribute('aria-pressed'), 'false'); await page.keyboard.press('Escape'); assert.equal(await page.locator('[data-add-category=study]').evaluate(e => e === document.activeElement), true);
      await toggle(page); await page.locator('.day-button[aria-pressed=false]').first().click(); assert.equal(await page.locator('#edit-tasks').isDisabled(), true); assert.equal(await page.locator('#edit-tasks').getAttribute('aria-pressed'), 'false');
      await page.locator(`.day-button[data-date="${today}"]`).click(); assert.equal(await page.locator('#edit-tasks').isEnabled(), true); assert.equal(await page.locator('.delete-task:visible').count(), 0); await toggle(page); await page.reload(); assert.equal(await page.locator('.task-row').count(), 2); assert.equal(await page.locator('#edit-tasks').getAttribute('aria-pressed'), 'false');
    } finally { await context.close(); }
  });
  await check('write failure preserves task, permits mode re-entry and successful retry', async () => {
    const { context, page } = await open();
    try {
      await add(page, '보존할 공부'); await add(page, '남길 생활', 'life'); await toggle(page); const before = await page.evaluate(() => localStorage.getItem('weekly-tasks-v1'));
      await page.evaluate(() => { window.nativeSetItem = Storage.prototype.setItem; Storage.prototype.setItem = function () { throw new DOMException('write denied', 'QuotaExceededError'); }; });
      await page.locator('.delete-task:visible').first().click(); assert.equal(await page.locator('.task-row').count(), 2); assert.equal(await page.evaluate(() => localStorage.getItem('weekly-tasks-v1')), before); assert.ok((await page.locator('#page-error').innerText()).trim());
      await toggle(page); assert.equal(await page.locator('.delete-task:visible').count(), 0); assert.equal(await page.locator('#edit-tasks').isEnabled(), true); await toggle(page);
      await page.evaluate(() => Storage.prototype.setItem = window.nativeSetItem); await page.locator('.delete-task:visible').first().click(); assert.equal(await page.locator('.task-name').innerText(), '남길 생활'); assert.equal((await page.locator('#page-error').innerText()).trim(), ''); await page.reload(); assert.equal(await page.locator('.task-name').innerText(), '남길 생활'); assert.equal(await page.locator('.delete-task:visible').count(), 0);
    } finally { await context.close(); }
  });
  await check('keyboard deletion preserves exact remaining records and returns meaningful focus', async () => {
    const { context, page } = await open(320);
    try {
      await add(page, '키보드로 지울 공부'); await add(page, '키보드로 남길 생활', 'life');
      const read = () => page.evaluate(() => JSON.parse(localStorage.getItem('weekly-tasks-v1')));
      const original = await read(); assert.equal(original.length, 2);
      await toggle(page); await page.locator('.delete-task:visible').first().focus(); await page.keyboard.press('Enter');
      assert.equal(await page.locator('.task-name').innerText(), '키보드로 남길 생활');
      assert.deepEqual(await read(), original.filter(task => task.title === '키보드로 남길 생활'));
      assert.equal(await page.locator('.task-check').evaluate(e => document.activeElement === e), true);
      assert.equal(await page.locator('#edit-tasks').getAttribute('aria-pressed'), 'true');
      await page.locator('.delete-task:visible').focus(); await page.keyboard.press('Space');
      assert.deepEqual(await read(), []); assert.equal(await page.locator('.task-row').count(), 0);
      assert.equal(await page.locator('#edit-tasks').isDisabled(), true);
      assert.equal(await page.locator('[data-add-category=life]').evaluate(e => document.activeElement === e), true);
      await page.reload(); assert.deepEqual(await read(), []); assert.equal(await page.locator('.task-row').count(), 0);
    } finally { await context.close(); }
  });
  for (const width of widths) await check(`${width}: actual reading/editing layout and text-mode captures`, async () => {
    const { context, page } = await open(width);
    try {
      await add(page, '자료 구조 복습하기'); await add(page, '가'.repeat(120)); await add(page, '산책 20분', 'life');
      const readingWidth = await page.locator('.task-name').first().evaluate(e => e.getBoundingClientRect().width);
      for (const state of ['reading', 'editing']) {
        if (state === 'editing') await toggle(page);
        assert.equal(await page.locator('#edit-tasks').getAttribute('aria-pressed'), String(state === 'editing'));
        assert.equal(await page.locator('.delete-task:visible').count(), state === 'editing' ? 3 : 0);
        const capture = async (mode, stressReport) => {
          if (stressReport) stressReports.push({ width, state, report: stressReport });
          for (const button of await page.locator('#edit-tasks,.add-task,.delete-task:visible').all()) { const actual = await button.evaluate(e => { const s = getComputedStyle(e), r = e.getBoundingClientRect(); return { label: e.innerText.trim(), name: e.getAttribute('aria-label'), width: r.width, height: r.height, font: parseFloat(s.fontSize), weight: parseFloat(s.fontWeight), whitespace: s.whiteSpace }; }); assert.ok(actual.label && actual.name?.includes(actual.label)); assert.ok(actual.width >= 44 && actual.height >= 44); assert.ok(actual.font >= 14 && actual.weight >= 500); assert.notEqual(actual.whitespace, 'nowrap'); }
          receipts.push(await inspectLayoutContract(page, contract, { state, mode })); await page.screenshot({ path: `${output}/${width}-${state}-${mode}.png`, fullPage: true });
          const access = await page.evaluate(() => {
            const rail = document.getElementById('week-days'), active = document.activeElement, savedScroll = rail.scrollLeft;
            const outside = [...document.querySelectorAll('body *')].filter(e => e.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) && (e.getBoundingClientRect().right > innerWidth + 1 || e.getBoundingClientRect().left < -1));
            const targets = [...rail.querySelectorAll(':scope > .day-button')];
            const unowned = outside.filter(e => !e.matches('.day-button,.weekday,.day-number') || !targets.includes(e.closest('.day-button'))).map(e => ({ tag: e.tagName, id: e.id, class: String(e.className) }));
            const style = getComputedStyle(rail), bounds = rail.getBoundingClientRect();
            const days = targets.map(day => {
              day.focus(); const r = day.getBoundingClientRect();
              return { date: day.dataset.date, focused: document.activeElement === day, width: r.width, height: r.height, fullyReachable: r.left >= Math.max(0, bounds.left) - 1 && r.right <= Math.min(innerWidth, bounds.right) + 1, scrollLeft: rail.scrollLeft };
            });
            if (active instanceof HTMLElement && active !== document.body) active.focus(); else document.activeElement.blur();
            rail.scrollLeft = savedScroll;
            return { overflowX: style.overflowX, outsideCount: outside.length, unowned, days };
          });
          scrollReceipts.push({ width, state, mode, ...access });
          assert.equal(access.unowned.length, 0, JSON.stringify(access.unowned));
          assert.equal(access.overflowX, 'auto'); assert.equal(access.days.length, 7);
          assert.ok(access.days.every(day => day.focused && day.fullyReachable && day.width >= 44 && day.height >= 44), JSON.stringify(access.days));
        };
        await capture('normal'); const stress = await inspectTextStress(page, capture);
        for (const report of stress) { assert.equal(report.overflowPx, 0); for (const key of ['clippedByAncestor', 'overlappingLines', 'controlTextOverflow']) assert.equal(report[key].length, 0, `${key}: ${JSON.stringify(report[key])}`); }
      }
      const editingWidth = await page.locator('.task-name').first().evaluate(e => e.getBoundingClientRect().width); assert.ok(readingWidth - editingWidth >= 44, 'Default reading must recover the supporting action width');
      const cdp = await context.newCDPSession(page); await cdp.send('DOM.enable'); await cdp.send('CSS.enable'); const { root } = await cdp.send('DOM.getDocument'), { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: '#edit-tasks' }); const fonts = await cdp.send('CSS.getPlatformFontsForNode', { nodeId }); assert.ok(fonts.fonts.some(f => f.isCustomFont && /Noto.*Sans.*KR/i.test(f.familyName))); await cdp.detach();
      checks.push({ name: `${width}: recovered default reading width`, status: 'PASS', readingWidth, editingWidth, recoveredPx: readingWidth - editingWidth, fonts: fonts.fonts });
    } finally { await context.close(); }
  });
  const layout = aggregateLayoutStates(contract, receipts, { widths, states: ['reading', 'editing'], modes: ['normal', 'text-200', 'text-spacing'] });
  await check('complete declared layout matrix', async () => assert.equal(layout.status, 'PASS', JSON.stringify(layout.issues).slice(0, 1500)));
  assert.deepEqual(await sourceBinding(target), sourceHashes); assert.deepEqual(await harnessBinding(), harnessHashes);
  const report = { status: checks.some(c => c.status === 'FAIL') ? 'FAIL' : 'SCOPED_EDIT_MODE_CHECKS_ONLY', sourceHashes, harnessHashes, checkerSha256: createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex'), checks, receipts, scrollReceipts, stressReports, layout, limits: ['Touch is Chromium emulation, not a physical device', 'DOM state and text modes activated by this checker; metadata alone is insufficient', 'Existing explicit calendar scroller is checked for actual seven-day focus reachability; raw outsideViewport diagnostics retained. This does not approve unresolved strict catalog scrollbar rules', 'Native popup,screenreader and reference/commercial quality remain unverified'] };
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2)); console.log(JSON.stringify({ status: report.status, passed: checks.filter(c => c.status === 'PASS').length, failed: checks.filter(c => c.status === 'FAIL').length, captured: receipts.length, layout: layout.status })); process.exitCode = report.status === 'FAIL' ? 1 : 0;
} finally { await browser.close(); await new Promise(r => server.close(r)); }
