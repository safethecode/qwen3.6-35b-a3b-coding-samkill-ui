import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import * as stress from '../scripts/text-stress.mjs';

test('stress capture waits for actual observer reflow and contains the settled last action', async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 296, height: 400 } });
    await page.setContent('<style>body{font:16px Arial;margin:0}#trip{display:grid;grid-template-columns:1fr 1fr}#trip div{padding:20px}#trip[data-stack]{grid-template-columns:1fr}button{font:inherit;margin-top:24px}</style><section id="trip"><div>2026.11.28</div><div>2026.12.26</div></section><button id="last">Save request</button>');
    await page.evaluate(() => { let frame; const group = document.querySelector('#trip'); const observer = new ResizeObserver(() => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => requestAnimationFrame(() => group.toggleAttribute('data-stack', parseFloat(getComputedStyle(group).fontSize) > 20))); }); observer.observe(group); });
    const captures = [];
    const reports = await stress.inspectTextStress(page, async (mode, report) => {
      assert.equal(report.layoutSettlement?.status, 'SETTLED');
      const buffer = await page.screenshot({ fullPage: true }); const bottom = await page.locator('#last').evaluate(n => n.getBoundingClientRect().bottom + scrollY);
      assert.ok(buffer.readUInt32BE(20) >= Math.ceil(bottom)); captures.push(mode);
      if (mode === 'text-200') assert.equal(await page.locator('#trip').getAttribute('data-stack'), '');
    });
    assert.deepEqual(captures, ['text-200', 'text-spacing']); assert.ok(reports.every(r => r.layoutSettlement.frames >= 3));
    assert.equal(await page.locator('body').evaluate(n => n.style.fontSize), '');
    assert.equal(await page.locator('body').evaluate(n => getComputedStyle(n).fontSize), '16px');
  } finally { await browser.close(); }
});

test('layout that keeps changing exhausts its bounded frame budget as unverified', async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage(); await page.setContent('<main style="width:100px;height:100px">Changing</main>');
    assert.equal(typeof stress.settleTextLayout, 'function');
    await page.evaluate(() => { let wide = false; function tick() { document.querySelector('main').style.width = (wide ? 100 : 200) + 'px'; wide = !wide; requestAnimationFrame(tick); } requestAnimationFrame(tick); });
    const result = await stress.settleTextLayout(page); assert.equal(result.status, 'UNVERIFIED'); assert.equal(result.frames, 12);
  } finally { await browser.close(); }
});
