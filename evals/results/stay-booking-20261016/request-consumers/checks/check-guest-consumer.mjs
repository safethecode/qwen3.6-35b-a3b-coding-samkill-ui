import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { stayHarness } from './browser-harness.mjs';
import { inspectFontRendering } from '../../../../../scripts/font-rendering.mjs';
import { inspectTextStress } from '../../../../../scripts/text-stress.mjs';
import { sourceBinding } from '../../../../../scripts/source-binding.mjs';
const root = 'evals/results/stay-booking-20261016/request-consumers', target = root + '/source', out = process.argv[2] || root + '/guest-consumer-first';
assert.ok(process.env.CHROME_PATH); await mkdir(out);
const h = await stayHarness(target), type = JSON.parse(await readFile(target + '/design/typography.json', 'utf8')), rows = [], captures = [];
async function enter(page) { await page.locator('[data-open-room][data-room-id="afternoon-standard"]').click(); await page.locator('#rate-options input[value="afternoon-standard-flex"]').check(); await page.locator('#confirm-rate').click(); await page.locator('#continue-review').click(); }
try {
  const { page, context, errors } = await h.open({ width: 390, hash: 'stay/afternoon' }); await enter(page);
  await page.evaluate(() => { window.__guestChanges = 0; document.addEventListener('requestguestchange', () => window.__guestChanges++); });
  await page.locator('#edit-request-guest').click(); await page.locator('#apply-request-guest').click(); assert.equal(await page.locator('#guest-dialog').evaluate(d => d.open), true); assert.equal(await page.locator('#request-name').getAttribute('aria-invalid'), 'true'); rows.push({ test: 'actual app initialization opens and validates guest editor', pass: true });
  await page.locator('#request-name').fill('가상 예약자'); await page.locator('#request-note').fill('메모 <img src=x onerror=alert(1)>'); await page.locator('#apply-request-guest').click(); assert.equal(await page.locator('#request-guest-summary').textContent(), '가상 예약자'); assert.equal(await page.evaluate(() => window.__guestChanges), 1); assert.deepEqual(await page.evaluate(async () => (await import('./guest-editor-instance.js')).guestEditor.read()), { name: '가상 예약자', note: '메모 <img src=x onerror=alert(1)>' }); rows.push({ test: 'one app instance applies once and returns actual safe snapshot', pass: true });
  await page.locator('#edit-request-guest').click(); await page.locator('#request-name').fill('취소할 초안'); await page.keyboard.press('Escape'); assert.equal(await page.locator('#request-guest-summary').textContent(), '가상 예약자'); assert.equal(await page.locator('#edit-request-guest').evaluate(e => e === document.activeElement), true); rows.push({ test: 'actual Escape preserves applied guest and restores summary trigger', pass: true });
  await page.locator('#edit-request-guest').click(); await page.locator('#request-note').focus();
  const focus = await page.locator('#request-note').evaluate(node => ({ actual: node === document.activeElement, outline: getComputedStyle(node).outlineStyle, wrapperRing: getComputedStyle(node.closest('.field-control')).boxShadow })); assert.equal(focus.actual, true); assert.equal(focus.outline, 'none'); assert.ok(focus.wrapperRing.includes('inset')); rows.push({ test: 'textarea keeps actual focus with one wrapper inset ring', pass: true, focus });
  await page.locator('#cancel-request-guest').click(); assert.deepEqual(errors, []); await context.close();
  for (const width of [296, 320, 390, 1440]) {
    const opened = await h.open({ width, hash: 'stay/afternoon' }), p = opened.page; await p.setViewportSize({ width, height: 843 }); await enter(p); await p.locator('#edit-request-guest').click();
    const roles = type.roles.filter(role => !role.states || role.states.includes('guest-editor'));
    const fonts = await inspectFontRendering(p, { roles }); await p.screenshot({ path: out + '/editor-' + width + '.png' });
    let stress;
    if (width === 296 || width === 390) stress = await inspectTextStress(p, async (mode, report) => { await p.screenshot({ path: out + '/' + mode + '-' + width + '.png' }); report.fonts = await inspectFontRendering(p, { roles, textScale: mode === 'text-200' ? 2 : 1, ...mode === 'text-spacing' ? { lineHeightRatioOverride: 1.5 } : {} }); });
    captures.push({ width, fonts, stress, errors: opened.errors }); assert.deepEqual(opened.errors, []); await opened.context.close();
  }
  assert.deepEqual(await sourceBinding(target), h.sourceHashes);
  const fontFailures = captures.flatMap(c => c.fonts.issues.filter(i => i.status === 'FAIL'));
  await writeFile(out + '/report.json', JSON.stringify({ rows, captures, fontFailures, sourceHashes: h.sourceHashes, harnessHashes: h.harnessHashes, driverSha256: createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex'), limits: 'Actual wired editor and desktopChromium synthetic stress. Native hidden reference,realdevicekeyboard/zoom/screenreader and booking storageworkflow remain unverified.' }, null, 2)); console.log(JSON.stringify({ groups: rows.length, fontFailures, captures: captures.length })); process.exitCode = fontFailures.length ? 1 : 0;
} finally { await h.close(); }
