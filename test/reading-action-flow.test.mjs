import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { inspectLayoutContract } from '../scripts/layout-contract.mjs';

const rule = { id: 'readable-action', kind: 'readingActionFlow', subject: 'main', rows: '.row', text: '.text', body: '.label', action: '.delete', minimumTextEm: 6, reservedInlineWidth: 32, minimumTarget: 44, minGap: 8, maxBelowGap: 24, tolerance: 2 };
const markup = '<style>*{box-sizing:border-box}body{margin:0;font:16px/1.6 sans-serif}main{width:256px}.row{display:flex;align-items:flex-start;gap:8px}.label{display:flex;align-items:flex-start;flex:1;min-width:0;gap:12px;padding:8px 0}.check{width:20px;height:20px;flex:none;margin:0}.text{flex:1;min-width:0;overflow-wrap:anywhere}.delete{font:inherit;line-height:1.5;flex:none;min-width:106px;min-height:44px;margin-top:max(0px,calc(.8em - 16px));padding:0 4px}</style><main><div class="row"><label class="label"><input class="check" type="checkbox"><span class="text">A complete long title which must remain readable without being squeezed by the supporting action</span></label><button class="delete">Delete</button></div></main>';
const inspect = page => inspectLayoutContract(page, { rules: [rule] });

test('reading width takes precedence over first-line support alignment only when inline space is insufficient', async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage(); await page.setContent(markup);
    await page.locator('body').evaluate(e => e.style.fontSize = '32px');
    const squeezed = (await inspect(page)).results[0]; assert.equal(squeezed.status, 'FAIL'); assert.match(squeezed.detail, /reading width/);
    await page.addStyleTag({ content: '.row{flex-wrap:wrap}.label{flex:1 1 calc(6em + 32px)}.delete{margin-left:auto}' });
    const wrapped = (await inspect(page)).results[0]; assert.equal(wrapped.status, 'PASS'); assert.equal(wrapped.observed.rows[0].placement, 'below'); assert.equal(wrapped.observed.rows[0].textWidth, 224);
    await page.locator('main').evaluate(e => e.style.width = '180px');
    const constrained = (await inspect(page)).results[0]; assert.equal(constrained.status, 'PASS'); assert.equal(constrained.observed.rows[0].minimumTextWidth, 148);
    await page.locator('main').evaluate(e => e.style.width = '390px');
    const inline = (await inspect(page)).results[0]; assert.equal(inline.status, 'PASS', JSON.stringify(inline)); assert.equal(inline.observed.rows[0].placement, 'inline');
    await page.locator('.delete').evaluate(e => e.style.alignSelf = 'center');
    assert.equal((await inspect(page)).results[0].status, 'FAIL');
    await page.locator('.delete').evaluate(e => e.style.alignSelf = 'auto');
    await page.locator('.label').evaluate(e => e.style.flexBasis = '100%');
    assert.match((await inspect(page)).results[0].detail, /unnecessarily/);
  } finally { await browser.close(); }
});

test('flow cannot pass through hidden, undersized, overlapping or detached actions', async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage();
    for (const mutation of [
      e => e.hidden = true,
      e => { e.style.minWidth = '20px'; e.style.width = '20px'; },
      e => { e.style.position = 'absolute'; e.style.top = '0'; e.style.left = '20px'; },
      e => e.closest('main').append(e),
      e => e.style.marginTop = '40px'
    ]) {
      await page.setContent(markup); await page.addStyleTag({ content: '.row{flex-wrap:wrap}.label{flex:1 1 calc(6em + 32px)}.delete{margin-left:auto}' });
      assert.equal((await inspect(page)).results[0].status, 'PASS');
      await page.locator('.delete').evaluate(mutation); assert.equal((await inspect(page)).results[0].status, 'FAIL');
    }
  } finally { await browser.close(); }
});

test('flow requires actual visible rows and explicit valid reading and target dimensions', async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage(); await page.setContent(markup);
    for (const [key, values] of Object.entries({ minimumTextEm: [undefined, null, 0, '6'], reservedInlineWidth: [undefined, null, -1, '32'], minimumTarget: [undefined, -1], minGap: [undefined, -1], maxBelowGap: [undefined, 4], tolerance: [null, 10], body: ['', null], action: ['', null] })) for (const value of values) {
      const report = await inspectLayoutContract(page, { rules: [{ ...rule, [key]: value }] }); assert.equal(report.results[0].status, 'FAIL', key);
    }
    await page.locator('main').evaluate(e => e.style.minHeight = '100px'); await page.locator('.row').evaluate(e => e.remove()); assert.match((await inspect(page)).results[0].detail, /visible row/);
  } finally { await browser.close(); }
});

test('unused body space or transformed text cannot lower the independently declared reading requirement', async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage();
    for (const css of ['.text{max-width:74px}', '.label{padding-right:150px}', '.text{transform:scaleX(.4);transform-origin:left}', '.label{scale:.4}', 'main{zoom:.4}']) {
      await page.setContent(markup); await page.locator('body').evaluate(e => e.style.fontSize = '32px');
      await page.addStyleTag({ content: '.row{flex-wrap:wrap}.label{flex:1 1 calc(6em + 32px)}.delete{margin-left:auto}' });
      assert.equal((await inspect(page)).results[0].status, 'PASS');
      await page.addStyleTag({ content: css }); assert.equal((await inspect(page)).results[0].status, 'FAIL', css);
    }
  } finally { await browser.close(); }
});
