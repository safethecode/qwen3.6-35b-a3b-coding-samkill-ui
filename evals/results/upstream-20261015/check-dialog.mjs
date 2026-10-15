import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { sourceBinding } from '../../../scripts/source-binding.mjs';
import { harnessBinding } from '../../../scripts/harness-binding.mjs';
import { inspectLayoutContract } from '../../../scripts/layout-contract.mjs';
import { inspectTextStress } from '../../../scripts/text-stress.mjs';
const [target, evidence] = process.argv.slice(2);
await mkdir(evidence, { recursive: true });
const binding = await sourceBinding(target);
const server = createServer(async (req, res) => {
  try {
    const name = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html';
    if (!binding[name]) throw Error();
    res.setHeader('content-type', ({ '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg' })[extname(name)] || 'application/octet-stream');
    res.end(await readFile(resolve(target, name)));
  } catch { res.writeHead(404).end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });
const results = [];
try {
  for (const width of [296, 320, 390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, locale: 'ko-KR' });
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#book').click();
    const report = { width, checks: [] };
    const check = async (name, fn) => { try { report.checks.push({ name, status: 'PASS', observed: await fn() }); } catch (e) { report.checks.push({ name, status: 'FAIL', detail: e.message.slice(0, 500) }); } };
    await check('native time selection affordance retained', async () => {
      const appearance = await page.locator('#slot').evaluate(e => getComputedStyle(e).appearance);
      assert.notEqual(appearance, 'none');
      return appearance;
    });
    await check('empty storage error does not reserve a form gap', async () => {
      assert.equal(await page.locator('#storage-error').innerText(), '');
      assert.equal(await page.locator('#storage-error').evaluate(e => getComputedStyle(e).display), 'none');
    });
    await check('dialog component sample width matches real dialog', async () => {
      const r = await inspectLayoutContract(page, { rules: [{ id: 'dialog-width', kind: 'sampleWidth', subject: '[data-ui-unit="dialog"]', sample: 'sample-dialog.html' }] });
      assert.equal(r.results[0].status, 'PASS');
      return r.results[0].observed;
    });
    for (const id of ['guest', 'date', 'slot']) {
      await check(`${id}: field focus owner and stable dimensions`, async () => {
        const field = page.locator(`#${id}`);
        const wrapper = field.locator('..');
        assert.equal(await wrapper.getAttribute('class'), 'field-control');
        const before = await wrapper.boundingBox();
        for (let i = 0; i < 10 && !await field.evaluate(e => e === document.activeElement); i++) await page.keyboard.press('Tab');
        assert.equal(await field.evaluate(e => e === document.activeElement), true);
        const after = await wrapper.boundingBox();
        assert.ok(Math.abs(before.width - after.width) < .5 && Math.abs(before.height - after.height) < .5);
        const style = await wrapper.evaluate(e => ({ shadow: getComputedStyle(e).boxShadow, border: getComputedStyle(e).borderWidth }));
        assert.notEqual(style.shadow, 'none');
        assert.ok(style.shadow.includes('inset'));
        const inputPaint = await field.evaluate(e => ({ outline: getComputedStyle(e).outlineStyle, background: getComputedStyle(e).backgroundColor }));
        assert.equal(inputPaint.outline, 'none');
        assert.ok(inputPaint.background === 'transparent' || /rgba\([^)]*,\s*0\)$/.test(inputPaint.background), 'Opaque child background can cover the wrapper inset ring');
        await page.screenshot({ path: `${evidence}/focus-${id}-${width}.png` });
        await page.locator('#close-booking').focus();
        assert.equal(await wrapper.evaluate(e => getComputedStyle(e).boxShadow), 'none');
        await field.focus();
        await page.emulateMedia({ forcedColors: 'active' });
        let contrast;
        try {
          contrast = await wrapper.evaluate(e => ({ style: getComputedStyle(e).outlineStyle, width: parseFloat(getComputedStyle(e).outlineWidth) }));
          assert.notEqual(contrast.style, 'none');
          assert.ok(contrast.width >= 1);
        } finally { await page.emulateMedia({ forcedColors: 'none' }); }
        return { before, after, style, forcedColors: contrast };
      });
    }
    report.stress = await inspectTextStress(page, async mode => {
      await page.screenshot({ path: `${evidence}/form-${width}-${mode}.png`, fullPage: true });
      const submit = page.locator('.confirm-booking');
      await submit.scrollIntoViewIfNeeded();
      const bounds = await submit.boundingBox();
      await check(`${mode}: submit remains reachable inside viewport`, async () => { assert.ok(bounds && bounds.y >= -.5 && bounds.y + bounds.height <= 900.5); return bounds; });
      await page.screenshot({ path: `${evidence}/form-end-${width}-${mode}.png` });
      await page.locator('#booking-dialog').evaluate(e => { e.scrollTop = 0; });
    });
    results.push(report);
    await page.close();
  }
} finally { await browser.close(); await new Promise(r => server.close(r)); }
await writeFile(`${evidence}/report.json`, JSON.stringify({ status: results.some(r => r.checks.some(c => c.status === 'FAIL')) ? 'FAIL' : 'SCOPED_CHECKS_PASS_NOT_VISUAL_PARITY', sourceHashes: binding, harnessHashes: await harnessBinding(), captureSha256: createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex'), results }, null, 2));
console.log(results.map(r => ({ width: r.width, failed: r.checks.filter(c => c.status === 'FAIL') })));
