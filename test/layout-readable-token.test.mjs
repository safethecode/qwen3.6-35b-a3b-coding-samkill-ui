import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { inspectLayoutContract } from '../scripts/layout-contract.mjs';

test('readable tokens reject overflow-free fragmentation and approve real repaired text', async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent('<style>*{box-sizing:border-box}body{font:16px Arial}#owner{width:260px}#token{display:block;width:44px;overflow-wrap:anywhere}</style><main id="owner"><strong id="token">2026.11.28</strong></main>');
    const rule = { id: 'date', kind: 'readableToken', subject: '#token', container: '#owner', token: 'whole' };
    const inspect = () => inspectLayoutContract(page, { rules: [rule] });
    assert.equal((await inspect()).results[0].status, 'FAIL');
    await page.locator('#token').evaluate(n => n.style.width = '240px');
    assert.equal((await inspect()).results[0].status, 'PASS');
    await page.locator('#token').evaluate(n => { n.textContent = '2028.2.29'; n.style.fontSize = '32px'; });
    assert.equal((await inspect()).results[0].status, 'PASS');
    await page.locator('#token').evaluate(n => n.style.width = '44px');
    assert.equal((await inspect()).results[0].status, 'FAIL');
  } finally { await browser.close(); }
});

test('dynamic numeric units require one actual owned token without ambiguous matches', async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent('<main id="owner" style="width:300px"><span id="token">총 330,800원</span></main>');
    const rule = { id: 'price', kind: 'readableToken', subject: '#token', container: '#owner', token: 'number', suffix: '원' };
    const inspect = () => inspectLayoutContract(page, { rules: [rule] });
    assert.equal((await inspect()).results[0].status, 'PASS');
    await page.locator('#token').evaluate(n => n.textContent = '총 4,371,200원'); assert.equal((await inspect()).results[0].status, 'PASS');
    await page.locator('#token').evaluate(n => n.textContent = '330,800'); assert.equal((await inspect()).results[0].status, 'FAIL');
    await page.locator('#token').evaluate(n => n.textContent = '330,800원 400,000원'); assert.equal((await inspect()).results[0].status, 'FAIL');
  } finally { await browser.close(); }
});

test('intrinsically wider tokens remain unverified and clipping never becomes unknown or pass', async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent('<style>body{font:32px Arial}#owner{width:48px}#token{display:block;overflow-wrap:anywhere}</style><main id="owner"><strong id="token">2026.11.28</strong></main>');
    const rule = { id: 'date', kind: 'readableToken', subject: '#token', container: '#owner', token: 'whole' };
    let result = await inspectLayoutContract(page, { rules: [rule] }); assert.equal(result.results[0].status, 'UNVERIFIED'); assert.ok(result.issues.some(i => i.status === 'UNVERIFIED'));
    await page.locator('#token').evaluate(n => { n.style.whiteSpace = 'nowrap'; n.style.overflow = 'hidden'; });
    result = await inspectLayoutContract(page, { rules: [rule] }); assert.equal(result.results[0].status, 'FAIL');
  } finally { await browser.close(); }
});

test('readable token checks reject false owners, transforms, zoom and hidden or ambiguous subjects', async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent('<main id="owner" style="width:300px"><span id="token">2026.11.28</span></main><aside id="other" style="width:300px">Elsewhere</aside>');
    const rule = { id: 'date', kind: 'readableToken', subject: '#token', container: '#owner', token: 'whole' };
    assert.equal((await inspectLayoutContract(page, { rules: [{ ...rule, container: '#other' }] })).results[0].status, 'FAIL');
    for (const css of ['transform:scale(.5)', 'zoom:.5', 'visibility:hidden']) {
      await page.locator('#token').evaluate((n, css) => n.style.cssText = css, css);
      assert.equal((await inspectLayoutContract(page, { rules: [rule] })).results[0].status, 'FAIL');
    }
    await page.locator('#token').evaluate(n => n.style.cssText = '');
    await page.locator('#owner').evaluate(n => n.append(n.firstElementChild.cloneNode(true)));
    assert.equal((await inspectLayoutContract(page, { rules: [rule] })).results[0].status, 'FAIL');
  } finally { await browser.close(); }
});

test('readable token inspection cannot approve cropped ancestors, missing text or unsupported mixed owners', async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage();
    const rule = { id: 'date', kind: 'readableToken', subject: '#token', container: '#owner', token: 'whole' };
    await page.setContent('<main id="owner" style="width:300px"><div style="width:20px;overflow:hidden"><span id="token" style="white-space:nowrap">2026.11.28</span></div></main>');
    assert.equal((await inspectLayoutContract(page, { rules: [rule] })).results[0].status, 'FAIL');
    await page.locator('#token').evaluate(n => n.textContent = ''); assert.equal((await inspectLayoutContract(page, { rules: [rule] })).results[0].status, 'FAIL');
    await page.locator('#token').evaluate(n => { n.textContent = '2026.'; const b = document.createElement('b'); b.textContent = '11.28'; n.append(b); });
    assert.equal((await inspectLayoutContract(page, { rules: [rule] })).results[0].status, 'FAIL');
  } finally { await browser.close(); }
});

test('token contract fields are bounded and never accept arbitrary regex patterns', async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage(); await page.setContent('<main id="owner" style="width:300px"><span id="token">2026.11.28</span></main>');
    const rule = { id: 'date', kind: 'readableToken', subject: '#token', container: '#owner', token: 'whole' };
    for (const fields of [{ token: '(a+)+$' }, { token: 'number', suffix: 'x'.repeat(33) }, { token: 'number', suffix: '\n' }, { token: 'whole', suffix: '원' }, { container: '' }]) assert.equal((await inspectLayoutContract(page, { rules: [{ ...rule, ...fields }] })).results[0].status, 'FAIL');
  } finally { await browser.close(); }
});

test('paint clipping and unsupported effects can never receive token PASS', async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage(); const rule = { id: 'date', kind: 'readableToken', subject: '#token', container: '#owner', token: 'whole' };
    for (const css of ['clip-path:inset(0 99% 0 0)', 'position:absolute;clip:rect(0px,1px,20px,0px)', 'filter:opacity(0)', 'mask-image:linear-gradient(transparent,transparent)', 'rotate:90deg']) {
      await page.setContent('<main id="owner" style="width:300px"><span id="token" style="display:block;width:240px;' + css + '">2026.11.28</span></main>');
      assert.equal((await inspectLayoutContract(page, { rules: [rule] })).results[0].status, 'UNVERIFIED', css);
    }
    for (const css of ['color:transparent', '-webkit-text-fill-color:transparent']) {
      await page.setContent('<main id="owner" style="width:300px"><span id="token" style="' + css + '">2026.11.28</span></main>');
      assert.equal((await inspectLayoutContract(page, { rules: [rule] })).results[0].status, 'FAIL', css);
    }
  } finally { await browser.close(); }
});

test('numeric token extraction cannot narrow an interrupted amount to its trailing digits', async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage(); const rule = { id: 'price', kind: 'readableToken', subject: '#token', container: '#owner', token: 'number', suffix: '원' };
    for (const value of ['330,\u200b800원', '330,\n800원', '330, 800원', '33,0800원', '330800원부터']) {
      await page.setContent('<main id="owner" style="width:300px"><span id="token" style="display:block;width:44px;overflow-wrap:anywhere"></span></main>'); await page.locator('#token').evaluate((n, value) => n.textContent = value, value);
      assert.equal((await inspectLayoutContract(page, { rules: [rule] })).results[0].status, 'FAIL', value);
    }
  } finally { await browser.close(); }
});

test('font adjustments and pseudo typography cannot fake intrinsic fit', async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage(); const rule = { id: 'date', kind: 'readableToken', subject: '#token', container: '#owner', token: 'whole' };
    await page.setContent('<main id="owner" style="width:100px;font:16px Arial"><span id="token" style="display:block;width:240px;font-size-adjust:1">2026.11.28</span></main>');
    assert.equal((await inspectLayoutContract(page, { rules: [rule] })).results[0].status, 'UNVERIFIED');
    for (const css of ['#token::first-line{font-size:48px}', '#token::first-letter{color:transparent}', '#token::before{content:"hidden extra"}']) {
      await page.setContent('<style>' + css + '</style><main id="owner" style="width:300px;font:16px Arial"><span id="token" style="display:block;width:240px">2026.11.28</span></main>');
      assert.equal((await inspectLayoutContract(page, { rules: [rule] })).results[0].status, 'UNVERIFIED', css);
    }
  } finally { await browser.close(); }
});

test('ancestor pseudo paint cannot conceal part of an otherwise owned inline token', async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage(); const rule = { id: 'date', kind: 'readableToken', subject: '#token', container: '#owner', token: 'whole' };
    for (const css of ['#ancestor::first-line{color:transparent}', '#owner::first-letter{color:transparent}', '#ancestor::first-letter{font-size:48px}']) {
      await page.setContent('<style>' + css + '</style><main id="owner" style="width:300px"><div id="ancestor"><span id="token">2026.11.28</span></div></main>');
      assert.equal((await inspectLayoutContract(page, { rules: [rule] })).results[0].status, 'UNVERIFIED', css);
    }
  } finally { await browser.close(); }
});
