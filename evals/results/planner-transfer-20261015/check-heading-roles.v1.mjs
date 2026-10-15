import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { resolve, extname } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { sourceBinding } from '../../../scripts/source-binding.mjs';
import { harnessBinding } from '../../../scripts/harness-binding.mjs';
import { inspectFontRendering } from '../../../scripts/font-rendering.mjs';
import { inspectTextStress } from '../../../scripts/text-stress.mjs';
const [target, output, intentFile] = process.argv.slice(2);
if (!intentFile) throw new Error('Usage: TARGET OUTPUT ROLE_INTENT_FILE');
await mkdir(output, { recursive: true });
const sourceHashes = await sourceBinding(target), harnessHashes = await harnessBinding(), intentText = await readFile(intentFile, 'utf8'), intent = JSON.parse(intentText), captures = [];
const server = createServer(async (req, res) => { try { const name = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html'; if (!Object.hasOwn(sourceHashes, name)) throw Error(); res.setHeader('content-type', ({ '.html': 'text/html;charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' })[extname(name)] || 'application/octet-stream'); res.end(await readFile(resolve(target, name))); } catch { res.writeHead(404).end(); } });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH });
try {
  for (const width of [296, 320, 390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, timezoneId: 'Asia/Seoul' });
    try {
      const page = await context.newPage(); await page.goto(`http://127.0.0.1:${server.address().port}`);
      for (const [category, title] of [['study', '자료 구조 복습하기'], ['life', '산책 20분']]) { await page.locator(`[data-add-category=${category}]`).click(); await page.locator('#task-name').fill(title); await page.locator('#save-task').click(); }
      for (const state of ['reading', 'editing']) {
        if (state === 'editing') await page.locator('#edit-tasks').click();
        assert.equal(await page.locator('#edit-tasks').getAttribute('aria-pressed'), String(state === 'editing'));
        const capture = async mode => {
          const report = await inspectFontRendering(page, { roles: intent.roles, textScale: mode === 'text-200' ? 2 : 1 });
          captures.push({ width, state, mode, roles: report.roles, issues: report.issues, webFonts: report.webFonts });
          await page.screenshot({ path: `${output}/${width}-${state}-${mode}.png`, fullPage: true });
        };
        await capture('normal'); await inspectTextStress(page, capture);
      }
    } finally { await context.close(); }
  }
  assert.deepEqual(await sourceBinding(target), sourceHashes); assert.deepEqual(await harnessBinding(), harnessHashes);
  const issues = captures.flatMap(c => c.issues.map(issue => ({ width: c.width, state: c.state, mode: c.mode, ...issue }))), status = issues.some(i => i.status === 'FAIL') ? 'FAIL' : issues.length ? 'UNVERIFIED' : 'SCOPED_ROLE_METRICS_ONLY';
  const report = { status, sourceHashes, harnessHashes, checkerSha256: createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex'), intentSha256: createHash('sha256').update(intentText).digest('hex'), intent, captures, issues, limitation: 'Exact role metrics are only approved where explicitly declared. This checker activates real text modes; typography intent alone does not establish reference/commercial quality. A post-generation diagnostic intent must not be called an original frozen input.' };
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2)); console.log(JSON.stringify({ status, captures: captures.length, issues: issues.length })); process.exitCode = status === 'FAIL' ? 1 : status === 'UNVERIFIED' ? 2 : 0;
} finally { await browser.close(); await new Promise(r => server.close(r)); }
