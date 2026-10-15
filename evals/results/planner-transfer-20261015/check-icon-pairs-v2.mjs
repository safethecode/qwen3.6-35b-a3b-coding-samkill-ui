import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { resolve, extname } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { sourceBinding } from '../../../scripts/source-binding.mjs';
import { harnessBinding } from '../../../scripts/harness-binding.mjs';
import { inspectTextStress } from '../../../scripts/text-stress.mjs';
const [target, output] = process.argv.slice(2);
await mkdir(output, { recursive: true });
const sourceHashes = await sourceBinding(target), harnessHashes = await harnessBinding(), findings = [], checks = [];
const server = createServer(async (req, res) => { try { const name = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html'; if (!Object.hasOwn(sourceHashes, name)) throw Error(); res.setHeader('content-type', ({ '.html': 'text/html;charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' })[extname(name)] || 'application/octet-stream'); res.end(await readFile(resolve(target, name))); } catch { res.writeHead(404).end(); } });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH });
try {
  for (const width of [296, 320, 390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, timezoneId: 'Asia/Seoul' });
    try {
      const page = await context.newPage(); await page.goto(`http://127.0.0.1:${server.address().port}`); await page.evaluate(() => document.fonts.ready);
      for (const category of ['study', 'life']) { await page.locator(`[data-add-category=${category}]`).click(); await page.locator('#task-name').fill(category === 'study' ? '자료 구조 복습하기' : '산책 20분'); await page.locator('#save-task').click(); }
      await page.locator('#edit-tasks').click();
      await page.locator('.add-task img,.delete-task:visible img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
      const capture = async (mode, stress) => {
        const pairs = await page.locator('.add-task,.delete-task:visible').evaluateAll(buttons => buttons.map(button => {
          const image = button.querySelector('img'), label = button.querySelector(':scope > span'), ir = image.getBoundingClientRect(), lr = label.getBoundingClientRect(), s = getComputedStyle(label), c = document.createElement('canvas');
          c.width = Math.max(1, Math.ceil(ir.width)); c.height = Math.max(1, Math.ceil(ir.height)); const ctx = c.getContext('2d'); ctx.drawImage(image, 0, 0, c.width, c.height);
          const pixels = ctx.getImageData(0, 0, c.width, c.height).data, colors = new Map();
          for (let i = 0; i < pixels.length; i += 4) if (pixels[i + 3] >= 128) { const key = `${pixels[i]},${pixels[i + 1]},${pixels[i + 2]}`; colors.set(key, (colors.get(key) || 0) + 1); }
          const dominant = [...colors].sort((a, b) => b[1] - a[1])[0];
          return { action: button.className, label: label.textContent, fontSize: parseFloat(s.fontSize), textColor: s.color, iconWidth: ir.width, iconHeight: ir.height, centerDifference: Math.abs(ir.top + ir.height / 2 - lr.top - lr.height / 2), paintedRgb: dominant?.[0] || null, sampledPixelCount: dominant?.[1] || 0, alphaFloor: 128, asset: image.getAttribute('src') };
        }));
        findings.push({ width, mode, pairs, stress });
        await page.screenshot({ path: `${output}/${width}-${mode}.png`, fullPage: true });
        for (const pair of pairs) for (const [name, pass] of [['proportional size', pair.iconWidth >= pair.fontSize + 2 && pair.iconWidth <= pair.fontSize + 4 && pair.iconHeight === pair.iconWidth], ['aligned centers', pair.centerDifference <= 2], ['matching actual paint', pair.sampledPixelCount > 0 && pair.textColor.replace(/rgba?\(|\)|\s/g, '') === pair.paintedRgb]]) checks.push({ width, mode, action: pair.action, name, status: pass ? 'PASS' : 'FAIL' });
        assert.equal(pairs.length, 4);
      };
      await capture('normal'); await inspectTextStress(page, capture);
    } finally { await context.close(); }
  }
  assert.deepEqual(await sourceBinding(target), sourceHashes); assert.deepEqual(await harnessBinding(), harnessHashes);
  const report = { status: checks.some(c => c.status === 'FAIL') ? 'FAIL' : 'SCOPED_ICON_PAIR_CHECKS_ONLY', sourceHashes, harnessHashes, checkerSha256: createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex'), checks, findings, limits: ['Four actual add/delete pairs in explicit editing; normal/text200/spacing', 'Icon paint sampled from the actual external image raster at rendered size; text color is browser-computed', 'Hover/focus/disabled paint, optical centering, real devices and whole-catalog approval remain separate checks'] };
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2)); console.log(JSON.stringify({ status: report.status, pass: checks.filter(c => c.status === 'PASS').length, fail: checks.filter(c => c.status === 'FAIL').length })); process.exitCode = report.status === 'FAIL' ? 1 : 0;
} finally { await browser.close(); await new Promise(r => server.close(r)); }
