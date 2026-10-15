import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { createServer } from 'node:http';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { sourceBinding } from '../../../scripts/source-binding.mjs';
import { inspectTextStress } from '../../../scripts/text-stress.mjs';
const [target, output] = process.argv.slice(2);
await mkdir(output, { recursive: true });
const sourceHashes = await sourceBinding(target), checks = [];
const server = createServer(async (req, res) => { try { const name = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html'; if (!Object.hasOwn(sourceHashes, name)) throw Error(); res.setHeader('content-type', ({ '.html': 'text/html;charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' })[extname(name)] || 'application/octet-stream'); res.end(await readFile(resolve(target, name))); } catch { res.writeHead(404).end(); } });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });
try {
  for (const width of [296, 320, 390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } }), page = await context.newPage(); page.setDefaultTimeout(5000);
    try {
      await page.goto(`http://127.0.0.1:${server.address().port}`); await page.evaluate(() => document.fonts.ready);
      for (const category of ['study', 'life']) { await page.locator(`[data-add-category=${category}]`).click(); await page.locator('#task-name').fill('기록할 할 일'); await page.locator('#save-task').click(); }
      const inspect = async mode => {
        for (const [selector, label] of [['.add-task', '추가'], ['.delete-task', '삭제']]) {
          const controls = await page.locator(selector).evaluateAll(buttons => buttons.map(b => { const box = b.getBoundingClientRect(), style = getComputedStyle(b); return { text: b.innerText.trim(), name: b.getAttribute('aria-label'), width: box.width, height: box.height, size: parseFloat(style.fontSize), weight: parseFloat(style.fontWeight) }; }));
          for (const control of controls) { assert.ok(control.text.includes(label), `${selector} lacks visible ${label} text`); assert.ok(control.name?.includes(control.text), 'Accessible name must preserve visible action text'); assert.ok(control.width >= 44 && control.height >= 44); assert.ok(control.size >= 14 && control.weight >= 500); }
        }
        checks.push({ width, mode, status: 'PASS' });
        await page.screenshot({ path: `${output}/${width}-${mode}.png`, fullPage: true });
      };
      await inspect('normal'); await inspectTextStress(page, inspect);
    } catch (error) { checks.push({ width, status: 'FAIL', detail: error.message.slice(0, 1500) }); }
    finally { await context.close(); }
  }
  assert.deepEqual(await sourceBinding(target), sourceHashes);
  const report = { status: checks.some(c => c.status === 'FAIL') ? 'FAIL' : 'SCOPED_VISIBLE_ACTION_LABELS_ONLY', sourceHashes, checks, limitation: 'Visible action strings, matching accessible names, computed typography and targets only; whole-design quality, clipping, icon semantics and state recovery require their separate evidence.' };
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2)); console.log(JSON.stringify({ status: report.status, passed: checks.filter(c => c.status === 'PASS').length, failed: checks.filter(c => c.status === 'FAIL').length })); process.exitCode = report.status === 'FAIL' ? 1 : 0;
} finally { await browser.close(); await new Promise(r => server.close(r)); }
