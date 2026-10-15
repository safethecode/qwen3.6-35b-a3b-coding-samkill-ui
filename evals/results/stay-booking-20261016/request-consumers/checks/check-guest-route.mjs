import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { stayHarness } from './browser-harness.mjs';
import { sourceBinding } from '../../../../../scripts/source-binding.mjs';
const root = 'evals/results/stay-booking-20261016/request-consumers', target = root + '/source', out = process.argv[2], rows = [], h = await stayHarness(target);
await mkdir(out);
async function test(name, work) { try { await work(); rows.push({ name, pass: true }); } catch (error) { rows.push({ name, pass: false, error: error.message }); } }
async function enter(page) { await page.locator('[data-open-room][data-room-id="afternoon-standard"]').click(); await page.locator('#rate-options input[value="afternoon-standard-flex"]').check(); await page.locator('#confirm-rate').click(); await page.locator('#continue-review').click(); }
try {
  for (const width of [296, 320, 390]) {
    const { page, context, errors } = await h.open({ width, hash: 'stay/afternoon' }); await enter(page);
    await page.locator('#edit-request-guest').click(); await page.locator('#request-name').fill('적용된 예약자'); await page.locator('#request-note').fill('보존된 요청'); await page.locator('#apply-request-guest').click();
    await page.locator('#edit-request-guest').click(); await page.locator('#request-name').fill('버릴 초안'); await page.goBack(); await page.waitForURL(url => url.hash === '#stay/afternoon');
    await test(width + ':history back closes editor on route exit', async () => assert.equal(await page.locator('#guest-dialog').evaluate(d => d.open), false));
    await test(width + ':visible selected-room owns return focus', async () => assert.equal(await page.locator('[data-open-room][data-room-id="afternoon-standard"]').evaluate(n => n === document.activeElement), true));
    if (await page.locator('#guest-dialog').evaluate(d => d.open)) await page.keyboard.press('Escape');
    await page.goForward(); await page.waitForURL(url => url.hash === '#review/afternoon');
    await test(width + ':forward preserves applied values and discards old draft', async () => { await page.locator('#edit-request-guest').click(); assert.equal(await page.locator('#request-name').inputValue(), '적용된 예약자'); assert.equal(await page.locator('#request-note').inputValue(), '보존된 요청'); await page.keyboard.press('Escape'); assert.equal(await page.locator('#edit-request-guest').evaluate(n => n === document.activeElement), true); });
    await page.locator('#edit-request-guest').click(); await page.locator('#request-name').fill('새 미적용 초안');
    await page.evaluate(async () => (await import('./core-runtime.js')).navigate('browse'));
    await test(width + ':programmatic exit also closes without guest apply', async () => { assert.equal(await page.locator('#guest-dialog').evaluate(d => d.open), false); assert.deepEqual(await page.evaluate(async () => (await import('./guest-editor-instance.js')).guestEditor.read()), { name: '적용된 예약자', note: '보존된 요청' }); assert.equal(await page.locator('#open-search').evaluate(n => n === document.activeElement), true); });
    assert.deepEqual(errors, []); await context.close();
  }
  assert.deepEqual(await sourceBinding(target), h.sourceHashes);
  await writeFile(out + '/report.json', JSON.stringify({ at: new Date().toISOString(), rows, pass: rows.filter(r => r.pass).length, total: rows.length, sourceHashes: h.sourceHashes, harnessHashes: h.harnessHashes, driverSha256: createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex'), limits: 'Actual app same-document desktopChromium Back/Forward and host navigation;real-device hardwareback andAT remain unknown. No save/persistence approval.' }, null, 2)); console.log(JSON.stringify({ pass: rows.filter(r => r.pass).length, total: rows.length, failures: rows.filter(r => !r.pass) })); process.exitCode = rows.every(r => r.pass) ? 0 : 1;
} finally { await h.close(); }
