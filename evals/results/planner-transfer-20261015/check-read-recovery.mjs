import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { resolve, extname } from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { sourceBinding } from '../../../scripts/source-binding.mjs';
const [target, output] = process.argv.slice(2);
await mkdir(output, { recursive: true });
const binding = await sourceBinding(target);
const server = createServer(async (req, res) => { try { const name = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html'; if (!Object.hasOwn(binding, name)) throw Error(); res.setHeader('content-type', ({ '.html': 'text/html;charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' })[extname(name)] || 'application/octet-stream'); res.end(await readFile(resolve(target, name))); } catch { res.writeHead(404).end(); } });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true }), checks = [];
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 900 }, timezoneId: 'Asia/Seoul' });
  await context.addInitScript(() => {
    const get = Storage.prototype.getItem;
    if (get.call(sessionStorage, 'fixture-set') !== '1') {
      const now = new Date(), date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      localStorage.setItem('weekly-tasks-v1', JSON.stringify([{ id: '4a725fc8-3214-4c94-b040-ce6e4cac9a58', title: '처음 저장한 할 일', category: 'study', date, completed: false }]));
      sessionStorage.setItem('fixture-set', '1');
    }
    window.nativeGetItem = get;
    Storage.prototype.getItem = function (key) {
      if (this === localStorage && get.call(sessionStorage, 'read-ready') !== '1') throw new DOMException('read unavailable', 'SecurityError');
      return get.call(this, key);
    };
  });
  const page = await context.newPage(); page.setDefaultTimeout(5000);
  try {
    await page.goto(`http://127.0.0.1:${server.address().port}`); await page.evaluate(() => document.fonts.ready);
    const before = await page.evaluate(() => window.nativeGetItem.call(localStorage, 'weekly-tasks-v1'));
    assert.ok((await page.locator('#page-error').textContent()).trim());
    assert.equal(await page.locator('#empty-state').isVisible(), false, 'Failed read is unknown data, not a confirmed empty list');
    await page.locator('[data-add-category=study]').click(); await page.locator('#task-name').fill('보존할 새 입력'); await page.locator('#save-task').click();
    assert.equal(await page.locator('#task-dialog').evaluate(e => e.open), true);
    assert.equal(await page.locator('#task-name').inputValue(), '보존할 새 입력');
    assert.equal(await page.locator('#task-error').isVisible(), true);
    assert.ok((await page.locator('#task-error').textContent()).includes('새로고침'));
    assert.equal(await page.evaluate(() => window.nativeGetItem.call(localStorage, 'weekly-tasks-v1')), before);
    checks.push({ name: 'failed initial read and create preserve original disk and open input', status: 'PASS' });
    await page.screenshot({ path: `${output}/read-failed-form.png`, fullPage: true });
    await page.evaluate(() => sessionStorage.setItem('read-ready', '1')); await page.reload();
    assert.equal(await page.locator('.task-name').textContent(), '처음 저장한 할 일');
    assert.equal((await page.locator('#page-error').textContent()).trim(), '');
    await page.locator('[data-add-category=life]').click(); await page.locator('#task-name').fill('복구 후 새 할 일'); await page.locator('#save-task').click();
    assert.equal(await page.locator('.task-row').count(), 2);
    assert.ok((await page.locator('#study-items .task-name').textContent()).includes('처음 저장한 할 일'));
    checks.push({ name: 'read restored and explicit reload recover original tasks and permit creation', status: 'PASS' });
    await page.screenshot({ path: `${output}/read-restored.png`, fullPage: true });
  } catch (e) { checks.push({ name: 'read recovery flow', status: 'FAIL', detail: e.message.slice(0, 1500) }); }
  assert.deepEqual(await sourceBinding(target), binding);
  const report = { status: checks.some(c => c.status === 'FAIL') ? 'FAIL' : 'SCOPED_RECOVERY_CHECKS_ONLY', sourceHashes: binding, checks, scope: 'Native Storage.getItem failure, failed create, preserved raw data and input, read restored, explicit reload and successful create. Native storage-property policy failures are not covered.' };
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2)); console.log(JSON.stringify(report.checks)); process.exitCode = report.status === 'FAIL' ? 1 : 0;
} finally { await browser.close(); await new Promise(r => server.close(r)); }
