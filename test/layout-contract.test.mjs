import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { inspectLayoutContract } from '../scripts/layout-contract.mjs';
import { createServer } from 'node:http';

test('first-line control contract rejects controls centered in a tall wrapped row', async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent('<style>body{font:16px sans-serif}*{box-sizing:border-box}.row{display:flex;gap:8px;align-items:center;width:240px}.label{display:flex;gap:12px;flex:1;min-width:0;padding:8px 0}.check{font:inherit;width:20px;height:20px;min-width:20px;margin:2px 0 0}.text{flex:1;min-width:0;line-height:1.6;overflow-wrap:anywhere}.delete{font:inherit;width:44px;height:44px;min-width:44px}</style><main id="tasks"><div class="row"><label class="label"><input class="check" type="checkbox"><span class="text">A long task title that wraps into multiple lines and keeps its complete content visible.</span></label><button class="delete">X</button></div></main>');
    const contract = { rules: [{ id: 'task-actions', kind: 'firstLineControls', subject: '#tasks', rows: '.row', text: '.text', controls: ['.check', '.delete'], tolerance: 2 }] };
    assert.equal((await inspectLayoutContract(page, contract)).results[0].status, 'FAIL');
    await page.locator('.row').evaluate(e => { e.style.alignItems = 'flex-start'; });
    await page.locator('.check').evaluate(e => { e.style.marginTop = 'calc(.8em - 10px)'; });
    await page.locator('.delete').evaluate(e => { e.style.marginTop = 'max(0px, calc(.8em - 14px))'; });
    assert.equal((await inspectLayoutContract(page, contract)).results[0].status, 'PASS');
    await page.locator('body').evaluate(e => { e.style.fontSize = '32px'; });
    assert.equal((await inspectLayoutContract(page, contract)).results[0].status, 'PASS');
  } finally { await browser.close(); }
});

test('first-line control inspection cannot pass with no visible rows or unvisited states', async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage(); await page.setContent('<main id="tasks" style="height:100px"></main>');
    const rule = { id: 'task-actions', kind: 'firstLineControls', subject: '#tasks', rows: '.row', text: '.text', controls: ['.delete'], tolerance: 2 };
    assert.match((await inspectLayoutContract(page, { rules: [rule] })).results[0].detail, /visible row/);
    const pending = await inspectLayoutContract(page, { rules: [{ ...rule, states: ['filled'] }] });
    assert.equal(pending.results.length, 0); assert.equal(pending.pendingStates[0].status, 'UNVERIFIED');
  } finally { await browser.close(); }
});

test('primary action must occupy the remainder of its two-control row', async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent('<div id="row" style="display:grid;grid-template-columns:48px minmax(0,1fr);gap:12px;width:300px"><button id="favorite">Save</button><button id="book" style="padding:12px 16px;min-width:0;width:0">Book this class</button></div>');
    const contract = { rules: [{ id: 'action-space', kind: 'fillRemainder', subject: '#book', reference: '#favorite', container: '#row' }] };
    assert.equal((await inspectLayoutContract(page, contract)).results[0].status, 'FAIL');
    await page.locator('#book').evaluate(e => { e.style.width = '100%'; e.style.boxSizing = 'border-box'; });
    assert.equal((await inspectLayoutContract(page, contract)).results[0].status, 'PASS');
  } finally { await browser.close(); }
});

test('mobile-only preview rejects expansion on a desktop viewport', async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.setContent('<main style="height:400px">Mobile screen</main>');
    const contract = { rules: [{ id: 'mobile-scope', kind: 'maxWidth', subject: 'main', maximum: 390 }] };
    assert.equal((await inspectLayoutContract(page, contract)).results[0].status, 'FAIL');
    await page.locator('main').evaluate(e => { e.style.maxWidth = '390px'; e.style.margin = 'auto'; });
    assert.equal((await inspectLayoutContract(page, contract)).results[0].status, 'PASS');
  } finally { await browser.close(); }
});

test('declared surfaces, navigation and state hierarchy reject the flattened detail regression', async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage();
    const contract = { rules: [
      { id: 'return', kind: 'returnNavigation', subject: '#back', destination: 'classes.html' },
      { id: 'group', kind: 'surface', subject: '#group', container: 'body', minPadding: 16, forbidHorizontalBorders: true },
      { id: 'hierarchy', kind: 'typeHierarchy', subject: '#success', reference: '#product', minSizeDifference: 4 }
    ] };
    await page.setContent('<style>body{background:#eee}#group{background:white;padding:20px}#success{font-size:24px;font-weight:700}#product{font-size:16px;font-weight:500}</style><a id="back" href="classes.html" aria-label="Back">Back</a><section id="group"><h2 id="success">Saved</h2><p id="product">Product</p></section>');
    assert.ok((await inspectLayoutContract(page, contract)).results.every(item => item.status === 'PASS'));
    await page.locator('#back').evaluate(e => e.setAttribute('href', '#'));
    await page.locator('#group').evaluate(e => { e.style.background = 'transparent'; e.style.borderTop = '1px solid gray'; });
    await page.locator('#product').evaluate(e => { e.style.fontSize = '24px'; e.style.fontWeight = '700'; });
    const failed = await inspectLayoutContract(page, contract);
    assert.deepEqual(failed.results.filter(item => item.status === 'FAIL').map(item => item.id), ['return', 'group', 'hierarchy']);
    await page.locator('#group').evaluate(e => { e.style.background = 'white'; e.style.borderTop = '1px solid gray'; });
    assert.equal((await inspectLayoutContract(page, contract)).results.find(item => item.id === 'group').status, 'FAIL');
  } finally { await browser.close(); }
});

test('sameRow rejects stacked actions and invisible subjects', async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage();
    const contract = { rules: [{ id: 'actions', kind: 'sameRow', subject: '#favorite', reference: '#book', tolerance: 2 }] };
    await page.setContent('<div style="display:flex;align-items:center;gap:12px"><button id="favorite" style="height:48px">Save</button><button id="book" style="height:52px">Book</button></div>');
    assert.equal((await inspectLayoutContract(page, contract)).results[0].status, 'PASS');
    await page.locator('div').evaluate(element => element.style.display = 'block');
    await page.locator('#book').evaluate(element => element.style.display = 'block');
    assert.equal((await inspectLayoutContract(page, contract)).results[0].status, 'FAIL');
    await page.locator('#book').evaluate(element => element.style.visibility = 'hidden');
    assert.match((await inspectLayoutContract(page, contract)).results[0].detail, /hidden/);
  } finally { await browser.close(); }
});

test('sample width gate checks assembled width and inset against the actual sample', async () => {
  let sampleWidth = 210;
  const server = createServer((request, response) => {
    response.setHeader('Content-Type', 'text/html');
    response.end(`<div id="unit" style="width:${request.url === '/sample.html' ? sampleWidth : 200}px;height:40px">Unit</div>`);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
    await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
    const contract = { rules: [{ id: 'sample', kind: 'sampleWidth', subject: '#unit', sample: 'sample.html' }] };
    assert.equal((await inspectLayoutContract(page, contract)).results[0].status, 'FAIL');
    sampleWidth = 200;
    assert.equal((await inspectLayoutContract(page, contract)).results[0].status, 'PASS');
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});

test('layout contracts reject misplaced actions, crowded rows and duplicate owned content', async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
    const contract = { rules: [
      { id: 'favorite-owner', kind: 'contained', subject: '#favorite', container: '#identity' },
      { id: 'body-owner', kind: 'absent', subject: '#identity p' },
      { id: 'action-density', kind: 'rowLimit', groups: ['#price', '#consult', '#favorite'], maximum: 2 },
      { id: 'body-after-identity', kind: 'below', subject: '#body', reference: '#identity', minGap: 8 }
    ] };
    await page.setContent('<div id="identity">Name<p style="margin:0">Duplicated description</p></div><div id="body">Body</div><footer style="display:flex"><span id="price">Price</span><button id="consult">Consult</button><button id="favorite">Favorite</button></footer>');
    const failed = await inspectLayoutContract(page, contract);
    assert.deepEqual(failed.results.filter(item => item.status === 'FAIL').map(item => item.id), contract.rules.map(item => item.id));
    await page.setContent('<div id="identity">Name<button id="favorite">Favorite</button></div><div id="body" style="margin-top:12px">Body</div><footer style="display:flex"><span id="price">Price</span><button id="consult">Consult</button></footer>');
    assert.ok((await inspectLayoutContract(page, contract)).results.every(item => item.status === 'PASS'));
    assert.equal((await inspectLayoutContract(page, null)).issues[0].status, 'UNVERIFIED');
    assert.ok((await inspectLayoutContract(page, { rules: [{ id: 'missing', kind: 'contained', subject: '#missing', container: '#identity' }] })).issues.some(item => item.status === 'FAIL'));
  } finally { await browser.close(); }
});
