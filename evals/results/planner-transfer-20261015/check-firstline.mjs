import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { createServer } from 'node:http';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { sourceBinding } from '../../../scripts/source-binding.mjs';
import { inspectLayoutContract } from '../../../scripts/layout-contract.mjs';
import { inspectTextStress } from '../../../scripts/text-stress.mjs';
const [target, output] = process.argv.slice(2);
await mkdir(output, { recursive: true });
const binding = await sourceBinding(target), contract = JSON.parse(await readFile(resolve(target, 'design/layout-contract.json'), 'utf8'));
assert.ok(contract.rules.some(r => r.kind === 'firstLineControls'));
const server = createServer(async (req, res) => { try { const name = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html'; if (!Object.hasOwn(binding, name)) throw Error(); res.setHeader('content-type', ({ '.html': 'text/html;charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' })[extname(name)] || 'application/octet-stream'); res.end(await readFile(resolve(target, name))); } catch { res.writeHead(404).end(); } });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true }), results = [];
try {
  for (const width of [296, 320, 390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } }), page = await context.newPage();
    page.setDefaultTimeout(5000);
    try {
      await page.goto(`http://127.0.0.1:${server.address().port}`); await page.evaluate(() => document.fonts.ready);
      for (const title of ['자료 구조 복습하기', '가'.repeat(120)]) {
        await page.locator('[data-add-category=study]').click(); await page.locator('#task-name').fill(title); await page.locator('#save-task').click();
      }
      const normal = await inspectLayoutContract(page, contract, { state: 'long' });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: `${output}/${width}.png`, fullPage: true });
      const layouts = [];
      const stress = await inspectTextStress(page, async mode => { layouts.push({ mode, inspection: await inspectLayoutContract(page, contract, { state: 'long' }) }); await page.screenshot({ path: `${output}/${width}-${mode}.png`, fullPage: true }); });
      const icons = await page.locator('.delete-task').evaluateAll(buttons => buttons.map(b => { const img = b.querySelector('img'), box = b.getBoundingClientRect(); return { source: img.getAttribute('src'), loaded: img.complete && img.naturalWidth > 0, width: box.width, height: box.height }; }));
      const categoryHeight = await page.locator('.category-heading').first().evaluate(e => e.getBoundingClientRect().height);
      results.push({ width, normal, layouts, stress, icons, categoryHeight });
    } finally { await context.close(); }
  }
  assert.deepEqual(await sourceBinding(target), binding);
  const failures = results.flatMap(r => [
    ...r.normal.issues.map(issue => ({ width: r.width, mode: 'normal', issue })),
    ...r.layouts.flatMap(l => l.inspection.issues.map(issue => ({ width: r.width, mode: l.mode, issue }))),
    ...(r.icons.some(i => !i.loaded || !i.source.endsWith('Trash2-neutral.svg') || i.width < 44 || i.height < 44) ? [{ width: r.width, problem: 'Official delete asset/target invalid' }] : []),
    ...(Math.abs(r.categoryHeight - 44) > .5 ? [{ width: r.width, problem: `Category capsule ${r.categoryHeight}px exceeds its44px refined contract` }] : [])
  ]);
  const report = { status: failures.length ? 'FAIL' : 'SCOPED_REFINEMENT_CHECKS_ONLY', sourceHashes: binding, results, failures, limitation: 'Line-box center alignment, asset identity/target and capsule size only; no general visual or independent-generation parity.' };
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ status: report.status, failures: failures.map(f => ({ width: f.width, mode: f.mode, problem: f.problem || f.issue.problem })) }));
  process.exitCode = failures.length ? 1 : 0;
} finally { await browser.close(); await new Promise(r => server.close(r)); }
