import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import postcss from 'postcss';
import { stayHarness } from './browser-harness.mjs';
import { inspectFontRendering } from '../../../../../scripts/font-rendering.mjs';
import { inspectLayoutContract } from '../../../../../scripts/layout-contract.mjs';
import { inspectTextStress } from '../../../../../scripts/text-stress.mjs';
import { sourceBinding } from '../../../../../scripts/source-binding.mjs';
import { harnessBinding } from '../../../../../scripts/harness-binding.mjs';
const root = 'evals/results/stay-booking-20261016/request-consumers', target = root + '/source', out = process.argv[2] || root + '/first-form-review';
await mkdir(out);
const h = await stayHarness(target), type = JSON.parse(await readFile(target + '/design/typography.json', 'utf8')), layout = JSON.parse(await readFile(target + '/design/layout-contract.json', 'utf8')), records = [], declarations = [];
postcss.parse(await readFile(target + '/booking.css', 'utf8')).walkDecls(d => declarations.push({ property: d.prop, value: d.value }));
const roles = type.roles;
async function enter(page) { await page.locator('[data-open-room][data-room-id="afternoon-standard"]').click(); await page.locator('#rate-options input[value="afternoon-standard-flex"]').check(); await page.locator('#confirm-rate').click(); await page.locator('#continue-review').click(); await page.locator('#review-view').waitFor({ state: 'visible' }); await page.evaluate(() => document.fonts.ready); }
try {
  for (const width of [296, 320, 390, 1440]) {
    const { page, context, errors } = await h.open({ width, hash: 'stay/afternoon' });
    await page.setViewportSize({ width, height: 843 });
    await enter(page);
    const fonts = await inspectFontRendering(page, { roles }), relation = await inspectLayoutContract(page, layout, { state: 'booking' });
    const geometry = await page.evaluate(() => {
      const box = selector => { const node = document.querySelector(selector), b = node.getBoundingClientRect(), style = getComputedStyle(node); return { x: b.x, y: b.y, width: b.width, height: b.height, paddingInline: [style.paddingLeft, style.paddingRight], background: style.backgroundColor }; };
      return { rootOverflow: Math.max(0, document.documentElement.scrollWidth - innerWidth), body: box('body'), header: box('.booking-header'), identity: box('.booking-identity'), dates: box('.booking-dates'), start: box('.booking-date:first-child'), end: box('.booking-date:last-child'), guest: box('.booking-guest'), price: box('.booking-pricing'), total: box('.booking-total'), action: box('.booking-submit'), hasPhoto: !!document.querySelector('#review-view img:not(.booking-header img)'), navVisible: !document.querySelector('.bottom-navigation').hidden, text: document.querySelector('#review-view').innerText };
    });
    const support = await page.evaluate(values => values.map(d => ({ ...d, supported: CSS.supports(d.property, d.value) })), declarations);
    await page.screenshot({ path: out + '/form-' + width + '.png' });
    if (width === 390) await page.screenshot({ path: out + '/form-full-390.png', fullPage: true });
    let stress;
    if (width === 296 || width === 390) stress = await inspectTextStress(page, async (mode, report) => {
      assert.equal(report.layoutSettlement.status, 'SETTLED');
      const png = await page.screenshot({ path: out + '/' + mode + '-' + width + '.png', fullPage: true });
      const lastAction = await page.locator('.booking-submit').evaluate(node => ({ bottom: node.getBoundingClientRect().bottom + scrollY, documentHeight: document.documentElement.scrollHeight }));
      report.captureIntegrity = { pngWidth: png.readUInt32BE(16), pngHeight: png.readUInt32BE(20), ...lastAction };
      assert.ok(report.captureIntegrity.pngHeight >= Math.ceil(lastAction.bottom));
      report.fonts = await inspectFontRendering(page, { roles, textScale: mode === 'text-200' ? 2 : 1, ...mode === 'text-spacing' ? { lineHeightRatioOverride: 1.5 } : {} });
      report.layout = await inspectLayoutContract(page, layout, { state: 'booking', mode });
    });
    records.push({ width, fonts, layout: relation, geometry, support, errors, stress });
    await context.close();
  }
  assert.deepEqual(await sourceBinding(target), h.sourceHashes); assert.deepEqual(await harnessBinding(), h.harnessHashes);
  const report = { status: 'MEASURED_PENDING_DIRECT_REFERENCE_REVIEW', at: new Date().toISOString(), sourceHashes: h.sourceHashes, harnessHashes: h.harnessHashes, driverSha256: createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex'), reference: { sha256: 'f5738f295c9f97b2b446affa7ae83fbba981289ac6078b8902d7f822bd3a59e6', nativePixelsUnavailableInPortableReplay: true, method: 'Portable replay captures only the candidate; native comparison is separate private evidence. No native reference pixels are distributed.' }, records, limits: 'Actual desktopChromium and synthetic stress, not real-devicezoom/screenreader. Syntax/font/layout counts do not prove reference parity. Creation/change/cancel and fullcatalog/guides require separate executed evidence.' };
  await writeFile(out + '/report.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ records: records.length, fontFailures: records.flatMap(r => r.fonts.issues).filter(i => i.status === 'FAIL'), layoutFailures: records.flatMap(r => r.layout.issues).filter(i => i.status === 'FAIL'), pageErrors: records.flatMap(r => r.errors), unsupported: records.flatMap(r => r.support.filter(x => !x.supported)) }));
  const inspected = records.flatMap(r => [r, ...(r.stress || [])]);
  const failures = inspected.flatMap(r => [...(r.fonts?.issues || []), ...(r.layout?.issues || [])]).filter(i => i.status === 'FAIL');
  const stressFailures = records.flatMap(r => r.stress || []).some(r => r.overflowPx > 0 || ['clippedByAncestor', 'overlappingLines', 'controlTextOverflow', 'outsideViewport', 'gridPressure', 'flexPressure'].some(key => r[key]?.length));
  process.exitCode = failures.length || stressFailures || records.some(r => r.geometry.rootOverflow > 1 || r.errors.length || r.support.some(d => !d.supported)) ? 1 : 0;
} finally { await h.close(); }
