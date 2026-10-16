import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { iconMarkup } from '../scripts/icon-assets.mjs';
import { inspectLayoutContract } from '../scripts/layout-contract.mjs';
import { readFile } from 'node:fs/promises';

const iconRule = { id: 'selected-icon', kind: 'monochromePaint', subject: '#icon', paintMode: 'icon', foreground: '#b51d51' };
const labelRule = { id: 'selected-label', kind: 'monochromePaint', subject: '#label', paintMode: 'text', foreground: '#b51d51' };
const inspect = async (page, rule = iconRule) => (await inspectLayoutContract(page, { rules: [rule] })).results[0];
async function fixture(run) {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
    await page.setContent('<style>body{background:#fff;color:#b51d51}#icon{width:24px;height:24px;display:block}#label{display:block;width:max-content;font:600 16px/1.5 sans-serif}</style><div id="host">' + iconMarkup('Search').replace('<svg ', '<svg id="icon" ') + '<span id="label">예약 요청</span></div>');
    await page.evaluate(() => document.fonts.ready);
    await run(page);
  } finally { await browser.close(); }
}

test('actual icon paint rejects an external SVG whose CSS color falsely matches the selected label', async () => fixture(async page => {
  assert.equal((await inspect(page)).status, 'PASS');
  const data = 'data:image/svg+xml;base64,' + Buffer.from(iconMarkup('Search')).toString('base64');
  await page.locator('#icon').evaluate((node, src) => { const image = new Image(); image.id = 'icon'; image.src = src; node.replaceWith(image); }, data);
  await page.locator('#icon').evaluate(node => node.decode());
  assert.equal(await page.locator('#icon').evaluate(node => getComputedStyle(node).color), 'rgb(181, 29, 81)');
  assert.equal((await inspect(page)).status, 'FAIL');
}));

test('plain solid text uses actual foreground cores and accepts browser subpixel antialiasing', async () => fixture(async page => {
  const good = await inspect(page, labelRule);
  assert.equal(good.status, 'PASS');
  assert.ok(good.observed.paint.corePixels >= 5);
  await page.locator('#label').evaluate(node => node.style.webkitTextFillColor = '#000');
  assert.equal(await page.locator('#label').evaluate(node => getComputedStyle(node).color), 'rgb(181, 29, 81)');
  assert.equal((await inspect(page, labelRule)).status, 'FAIL');
  await page.locator('#label').evaluate(node => node.style.webkitTextFillColor = '#b51d51');
  assert.equal((await inspect(page, labelRule)).status, 'PASS');
}));

test('paint expectations reject missing, ambiguous and hidden subjects or malformed contracts', async () => fixture(async page => {
  for (const patch of [{ subject: '#missing' }, { subject: 'div,span' }, { foreground: 'currentColor' }, { foreground: [181, 29, 81] }, { foreground: '#b51d5180' }, { paintMode: 'anything' }]) {
    assert.equal((await inspect(page, { ...iconRule, ...patch })).status, 'FAIL', JSON.stringify(patch));
  }
  await page.locator('#icon').evaluate(node => node.style.display = 'none');
  assert.equal((await inspect(page)).status, 'FAIL');
}));

test('unsupported backgrounds and paint effects stay unknown rather than passing from a few matching pixels', async () => fixture(async page => {
  for (const css of ['background:#eee', 'background:linear-gradient(white,white)', 'filter:brightness(1)', 'opacity:.9', 'transform:translateX(1px)', 'clip-path:inset(0)', 'mix-blend-mode:multiply', 'transition:opacity 1s']) {
    await page.locator('#host').evaluate((node, css) => node.style.cssText = css, css);
    assert.equal((await inspect(page)).status, 'UNVERIFIED', css);
  }
  await page.locator('#host').evaluate(node => node.removeAttribute('style'));
  await page.locator('#label').evaluate(node => node.innerHTML = '<b>예약</b> 요청');
  assert.equal((await inspect(page, labelRule)).status, 'UNVERIFIED');
}));

test('white or transparent suppressed paint cannot pass and a sparse glyph stays unknown', async () => fixture(async page => {
  await page.locator('#icon').evaluate(node => node.style.stroke = '#fff');
  assert.equal((await inspect(page)).status, 'FAIL');
  await page.locator('#label').evaluate(node => { node.style.webkitTextFillColor = 'transparent'; });
  assert.equal((await inspect(page, labelRule)).status, 'FAIL');
  await page.locator('#label').evaluate(node => { node.style.webkitTextFillColor = '#b51d51'; node.style.fontSize = '2px'; node.textContent = '.'; });
  assert.equal((await inspect(page, labelRule)).status, 'UNVERIFIED');
}));

test('paint rules retain state and text-mode coverage instead of approving an unvisited selected state', async () => fixture(async page => {
  const contract = { rules: [{ ...iconRule, states: ['selected'], modes: ['normal', 'text-200'] }] };
  const missing = await inspectLayoutContract(page, contract);
  assert.equal(missing.results.length, 0);
  assert.ok(missing.issues.some(issue => issue.code === 'LAYOUT_STATES_PENDING'));
  assert.equal((await inspectLayoutContract(page, contract, { state: 'selected' })).results[0].status, 'PASS');
  await page.locator('#icon').evaluate(node => node.style.stroke = '#000');
  assert.equal((await inspectLayoutContract(page, contract, { state: 'selected', mode: 'text-200' })).results[0].status, 'FAIL');
}));

test('the packaged paint API example can be retrieved and used in a real selected state', async () => fixture(async page => {
  const guide = await readFile(new URL('../skills/qwen-samkill-ui/references/layout-contract-api.md', import.meta.url), 'utf8');
  const examples = [...guide.matchAll(/```json\s+([\s\S]+?)\s+```/g)].map(match => JSON.parse(match[1]));
  const rule = examples.find(rule => rule.kind === 'monochromePaint');
  assert.ok(rule, 'The retrievable contract API needs an executable paint example');
  const report = await inspectLayoutContract(page, { rules: [rule] }, { state: 'selected' });
  assert.equal(report.results[0].status, 'PASS');
  await page.locator('#icon').evaluate(node => node.style.stroke = '#000');
  assert.equal((await inspectLayoutContract(page, { rules: [rule] }, { state: 'selected' })).results[0].status, 'FAIL');
}));

test('a sibling image behind a transparent icon cannot supply its foreground evidence', async () => fixture(async page => {
  const image = 'data:image/svg+xml;base64,' + Buffer.from(iconMarkup('Search').replace('stroke="currentColor"', 'stroke="#b51d51"')).toString('base64');
  await page.locator('#host').evaluate((node, src) => { node.style.position = 'relative'; const image = new Image(); image.id = 'underlay'; image.src = src; image.style.cssText = 'position:absolute;left:0;top:0;width:24px;height:24px'; node.prepend(image); }, image);
  await page.locator('#underlay').evaluate(node => node.decode());
  await page.locator('#icon').evaluate(node => node.style.stroke = 'transparent');
  assert.equal((await inspect(page)).status, 'UNVERIFIED');
}));

test('unsupported text strokes cannot pass from foreground cores and lighter colored fringes', async () => fixture(async page => {
  await page.locator('#label').evaluate(node => { node.style.color = '#000'; node.style.fontSize = '48px'; node.style.fontWeight = '900'; node.style.webkitTextStroke = '1px yellow'; });
  assert.equal((await inspect(page, { ...labelRule, foreground: '#000000' })).status, 'UNVERIFIED');
}));

test('valid foregrounds below the pixel measurement threshold stay unknown instead of being called suppressed', async () => fixture(async page => {
  await page.locator('#icon').evaluate(node => node.style.stroke = '#f0f0f0');
  assert.equal((await inspect(page, { ...iconRule, foreground: '#f0f0f0' })).status, 'UNVERIFIED');
}));

test('background ownership probes restore exact inline styles without changing sibling content', async () => fixture(async page => {
  await page.locator('#icon').evaluate(node => node.setAttribute('style', 'color: rgb(181,29,81); width: 24px;'));
  const before = await page.locator('#icon').getAttribute('style'), text = await page.locator('#host').textContent();
  assert.equal((await inspect(page)).status, 'PASS');
  assert.equal(await page.locator('#icon').getAttribute('style'), before);
  assert.equal(await page.locator('#host').textContent(), text);
  assert.equal(await page.locator('#icon').evaluate(node => getComputedStyle(node).opacity), '1');
}));

test('a partially captured oversized owner cannot hide wrong paint beyond the viewport', async () => fixture(async page => {
  await page.locator('#icon').evaluate(node => { node.style.width = '600px'; node.style.height = '600px'; node.insertAdjacentHTML('beforeend', '<rect x="22" y="2" width="1" height="1" fill="black" stroke="black"></rect>'); });
  assert.equal((await inspect(page)).status, 'UNVERIFIED');
}));

test('running Web Animations API paint cannot pass from an early matching frame', async () => fixture(async page => {
  await page.locator('#icon').evaluate(node => { node.animate([{ stroke: '#b51d51', offset: 0 }, { stroke: '#b51d51', offset: .99 }, { stroke: '#000', offset: 1 }], { duration: 60000 }); });
  assert.equal(await page.locator('#icon').evaluate(node => getComputedStyle(node).animationName), 'none');
  assert.equal((await inspect(page)).status, 'UNVERIFIED');
}));
