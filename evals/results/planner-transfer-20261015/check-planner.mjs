import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { resolve, extname } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { sourceBinding } from '../../../scripts/source-binding.mjs';
import { harnessBinding } from '../../../scripts/harness-binding.mjs';
import { inspectTypography } from '../../../scripts/typography-check.mjs';
import { inspectTextStress } from '../../../scripts/text-stress.mjs';
import { inspectLayoutContract } from '../../../scripts/layout-contract.mjs';

const [target, output] = process.argv.slice(2);
assert.ok(target && output, 'Usage: check-planner.mjs TARGET OUTPUT');
await mkdir(output, { recursive: true });
const binding = await sourceBinding(target), harness = await harnessBinding();
const server = createServer(async (req, res) => {
  try {
    const name = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html';
    if (!Object.hasOwn(binding, name)) throw Error('unknown file');
    res.setHeader('content-type', ({ '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' })[extname(name)] || 'application/octet-stream');
    res.end(await readFile(resolve(target, name)));
  } catch { res.writeHead(404).end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });
const url = `http://127.0.0.1:${server.address().port}`;
const checks = [], captures = [], runtime = [];
const check = async (name, fn) => { try { await fn(); checks.push({ name, status: 'PASS' }); } catch (e) { checks.push({ name, status: 'FAIL', detail: e.message.slice(0, 1500) }); } };
const open = async (width = 390, raw) => {
  const context = await browser.newContext({ viewport: { width, height: 900 }, timezoneId: 'Asia/Seoul' });
  if (raw !== undefined) await context.addInitScript(value => localStorage.setItem('weekly-tasks-v1', value), raw);
  const page = await context.newPage();
  page.setDefaultTimeout(5000);
  page.on('pageerror', e => runtime.push(e.message));
  await page.goto(url); await page.evaluate(() => document.fonts.ready);
  return { context, page };
};
const add = async (page, title, category = 'study') => {
  await page.locator(`[data-add-category="${category}"]`).click();
  await page.locator('#task-name').fill(title);
  await page.locator('#save-task').click();
};
const freezeWrites = page => page.evaluate(() => { window.originalSetItem = Storage.prototype.setItem; Storage.prototype.setItem = function () { throw new DOMException('storage full', 'QuotaExceededError'); }; });
const allowWrites = page => page.evaluate(() => { Storage.prototype.setItem = window.originalSetItem; });
try {
  await check('both categories create complete reload safe text and delete', async () => {
    const { context, page } = await open();
    try {
      await add(page, '개념 복습하기'); await add(page, '가볍게 산책하기', 'life');
      assert.equal(await page.locator('.task-row').count(), 2);
      await page.locator('#life-items .task-check').check();
      await page.reload();
      assert.equal(await page.locator('#life-items .task-check').isChecked(), true);
      const text = '<img src=x onerror=alert(1)>';
      await add(page, text);
      const row = page.locator('.task-row').filter({ has: page.locator('.task-name', { hasText: text }) });
      assert.equal(await row.locator('.task-name').textContent(), text);
      assert.equal(await row.locator('.task-name img').count(), 0);
      await row.locator('.delete-task').click({ position: { x: 2, y: 2 } });
      await page.reload();
      assert.equal(await page.locator('.task-row').count(), 2);
      assert.equal(await page.locator('#life-items .task-check').isChecked(), true);
    } finally { await context.close(); }
  });
  await check('date isolation and keyboard focus after selection', async () => {
    const { context, page } = await open();
    try {
      const today = await page.locator('.day-button[aria-pressed=true]').getAttribute('data-date');
      await add(page, '선택한 날에만 보여요');
      const other = page.locator(`.day-button:not([data-date="${today}"])`).first();
      const otherDate = await other.getAttribute('data-date');
      await other.press('Enter');
      assert.equal(await page.locator('.task-row').count(), 0);
      assert.equal(await page.locator('#empty-state').isVisible(), true);
      await check('selected day keyboard focus survives rerender', async () => assert.equal(await page.evaluate(() => document.activeElement.dataset.date), otherDate));
      await add(page, '다른 날 산책', 'life');
      await page.locator(`.day-button[data-date="${today}"]`).click();
      assert.equal(await page.locator('.task-name').textContent(), '선택한 날에만 보여요');
    } finally { await context.close(); }
  });
  await check('blank title remains editable and Escape restores actual opener', async () => {
    const { context, page } = await open();
    try {
      await page.locator('[data-add-category=life]').click();
      assert.equal(await page.locator('#task-category').inputValue(), 'life');
      await page.locator('#task-name').fill('   ');
      await page.locator('#save-task').click();
      assert.equal(await page.locator('#task-dialog').evaluate(e => e.open), true);
      assert.equal(await page.locator('.task-row').count(), 0);
      assert.ok((await page.locator('#task-error').textContent()).trim());
      assert.equal(await page.locator('#task-error').isVisible(), true);
      await page.keyboard.press('Escape');
      assert.equal(await page.evaluate(() => document.activeElement.dataset.addCategory), 'life');
    } finally { await context.close(); }
  });
  for (const action of ['add', 'toggle', 'remove']) await check(`${action} storage failure preserves UI and recovers`, async () => {
    const { context, page } = await open();
    try {
      await add(page, '기존 할 일');
      const before = await page.evaluate(() => localStorage.getItem('weekly-tasks-v1'));
      await freezeWrites(page);
      if (action === 'add') {
        await add(page, '보존할 입력', 'life');
        assert.equal(await page.locator('#task-dialog').evaluate(e => e.open), true);
        assert.equal(await page.locator('#task-name').inputValue(), '보존할 입력');
        assert.ok((await page.locator('#task-error').textContent()).trim());
        assert.equal(await page.locator('#task-error').isVisible(), true);
      } else {
        if (action === 'toggle') await page.locator('.task-check').click();
        else await page.locator('.delete-task').click();
        assert.equal(await page.locator('.task-row').count(), 1);
        assert.equal(await page.locator('.task-check').isChecked(), false);
        assert.ok((await page.locator('#page-error').textContent()).trim());
        assert.equal(await page.locator('#page-error').isVisible(), true);
      }
      assert.equal(await page.evaluate(() => localStorage.getItem('weekly-tasks-v1')), before);
      await allowWrites(page);
      if (action === 'add') await page.locator('#save-task').click();
      else if (action === 'toggle') await page.locator('.task-check').check();
      else await page.locator('.delete-task').click();
      assert.equal(await page.locator('.task-row').count(), action === 'add' ? 2 : action === 'remove' ? 0 : 1);
      if (action === 'toggle') assert.equal(await page.locator('.task-check').isChecked(), true);
      assert.equal((await page.locator('#page-error').textContent()).trim(), '');
    } finally { await context.close(); }
  });
  await check('malformed storage is visible and not erased', async () => {
    const { context, page } = await open(390, '{');
    try {
      assert.equal(await page.locator('.task-row').count(), 0);
      assert.ok((await page.locator('#page-error').textContent()).trim());
      assert.equal(await page.locator('#page-error').isVisible(), true);
      assert.equal(await page.evaluate(() => localStorage.getItem('weekly-tasks-v1')), '{');
    } finally { await context.close(); }
  });
  const layout = JSON.parse(await readFile(resolve(target, 'design/layout-contract.json'), 'utf8'));
  for (const width of [296, 320, 390, 1440]) {
    const { context, page } = await open(width);
    try {
      await page.screenshot({ path: `${output}/${width}-empty.png`, fullPage: true });
      await add(page, '알고리즘 두 문제 풀기'); await add(page, '자료 구조 복습하기');
      await add(page, '산책 20분', 'life'); await add(page, '내일 사용할 장보기 목록 정리하기', 'life');
      await page.locator('.task-check').first().check();
      await check(`${width}: checkbox focus survives rerender`, async () => assert.equal(await page.evaluate(() => document.activeElement.matches('.task-check')), true));
      await check(`${width}: local font and official icon loaded`, async () => {
        assert.equal(await page.locator('.add-task img').first().evaluate(e => e.complete && e.naturalWidth > 0 && getComputedStyle(e).width === '20px'), true);
        const cdp = await context.newCDPSession(page); await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
        const { root } = await cdp.send('DOM.getDocument'); const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: '#selected-date' });
        const fonts = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
        assert.ok(fonts.fonts.some(f => f.isCustomFont && /Noto.*Sans.*KR/i.test(f.familyName)));
        captures.push({ width, fonts }); await cdp.detach();
      });
      await check(`${width}: week scroller final day access`, async () => {
        await page.locator('.day-button').last().focus();
        assert.equal(await page.locator('.day-button').last().evaluate(e => { const a = e.getBoundingClientRect(), b = e.parentElement.getBoundingClientRect(); return a.left >= b.left - 1 && a.right <= b.right + 1; }), true);
      });
      await page.locator('#week-days').evaluate(e => { e.scrollLeft = 0; });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: `${output}/${width}-filled.png`, fullPage: true });
      const filled = { layout: await inspectLayoutContract(page, layout, { state: 'filled' }), typography: await inspectTypography(page), stress: await inspectTextStress(page, mode => page.screenshot({ path: `${output}/${width}-filled-${mode}.png`, fullPage: true })) };
      await add(page, '가'.repeat(120));
      const long = await inspectTextStress(page, mode => page.screenshot({ path: `${output}/${width}-long-${mode}.png`, fullPage: true }));
      await page.locator('[data-add-category=study]').click(); await page.locator('#task-name').fill('복습할 내용 정리하기');
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: `${output}/${width}-form.png`, fullPage: true });
      const form = { typography: await inspectTypography(page), stress: await inspectTextStress(page, mode => page.screenshot({ path: `${output}/${width}-form-${mode}.png`, fullPage: true })) };
      await check(`${width}: declared mobile layout`, async () => assert.equal(filled.layout.issues.length, 0, JSON.stringify(filled.layout.issues)));
      await check(`${width}: filled typography minimum`, async () => assert.equal(filled.typography.length, 0, JSON.stringify(filled.typography)));
      await check(`${width}: form typography minimum`, async () => assert.equal(form.typography.length, 0, JSON.stringify(form.typography)));
      for (const [state, reports] of [['filled', filled.stress], ['long', long], ['form', form.stress]]) for (const report of reports) await check(`${width}: ${state} ${report.mode} containment`, async () => {
        assert.equal(report.overflowPx, 0, `Document overflow ${report.overflowPx}px`);
        assert.equal(report.clippedByAncestor.length, 0, JSON.stringify(report.clippedByAncestor));
        assert.equal(report.overlappingLines.length, 0, JSON.stringify(report.overlappingLines));
        assert.equal(report.controlTextOverflow.length, 0, JSON.stringify(report.controlTextOverflow));
      });
      for (const id of ['task-name', 'task-category']) {
        await page.locator(`#${id}`).focus();
        await check(`${width}: ${id} visible inset focus`, async () => assert.equal(await page.locator(`#${id}`).evaluate(e => { const s = getComputedStyle(e), p = getComputedStyle(e.parentElement); return s.outlineStyle === 'none' && s.backgroundColor === 'rgba(0, 0, 0, 0)' && p.boxShadow.includes('inset'); }), true));
        await page.emulateMedia({ forcedColors: 'active' });
        await check(`${width}: ${id} forced colors outline`, async () => assert.equal(await page.locator(`#${id}`).evaluate(e => { const s = getComputedStyle(e.parentElement); return s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2; }), true));
        await page.emulateMedia({ forcedColors: 'none' });
      }
      await page.keyboard.press('Escape');
      captures.push({ width, filled, long, form });
    } finally { await context.close(); }
  }
  checks.push({ name: 'page runtime', status: runtime.length ? 'FAIL' : 'PASS', errors: runtime });
  assert.deepEqual(await sourceBinding(target), binding, 'Source changed during browser inspection');
  assert.deepEqual(await harnessBinding(), harness, 'Harness changed during browser inspection');
  const result = { status: checks.some(c => c.status === 'FAIL') ? 'FAIL' : 'SCOPED_CHECKS_ONLY', sourceHashes: binding, harnessHashes: harness, checkerSha256: createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex'), checks, captures, limitations: ['Stress candidates require direct inspection; own week scroller is intentional', 'Native popup and real-device zoom/screenreader not verified', 'No full catalog or repeated unattended reference parity'] };
  await writeFile(`${output}/report.json`, JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ status: result.status, checks: checks.map(c => ({ name: c.name, status: c.status, detail: c.detail })) }));
  process.exitCode = checks.some(c => c.status === 'FAIL') ? 1 : 0;
} catch (e) {
  await writeFile(`${output}/fatal-report.json`, JSON.stringify({ status: 'FAIL', sourceHashes: binding, harnessHashes: harness, checks, captures, error: e.message }, null, 2));
  throw e;
} finally { await browser.close(); await new Promise(r => server.close(r)); }
