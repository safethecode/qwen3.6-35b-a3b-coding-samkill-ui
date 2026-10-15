import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { stayHarness } from './browser-harness.mjs';
import { inspectTextStress, settleTextLayout } from '../../../../../scripts/text-stress.mjs';
import { sourceBinding } from '../../../../../scripts/source-binding.mjs';
const root = 'evals/results/stay-booking-20261016/request-consumers', target = root + '/source', out = process.argv[2], rows = [];
assert.ok(out && process.env.CHROME_PATH); await mkdir(out);
const { record } = JSON.parse(await readFile(target + '/booking-fixtures.json', 'utf8')), h = await stayHarness(target);
async function measure(page, width, mode) {
  const dates = await page.evaluate(() => {
    const owner = document.querySelector('#cancel-request-subject'), walk = document.createTreeWalker(owner, NodeFilter.SHOW_TEXT), nodes = []; let current, text = '';
    while ((current = walk.nextNode())) { nodes.push({ node: current, start: text.length }); text += current.textContent; }
    const boundary = offset => { const entry = nodes.findLast(n => n.start <= offset); return [entry.node, offset - entry.start]; };
    const container = owner.getBoundingClientRect();
    return [...text.matchAll(/\d{4}-\d{2}-\d{2}/g)].map(match => {
      const range = document.createRange(), start = boundary(match.index), end = boundary(match.index + match[0].length); range.setStart(...start); range.setEnd(...end);
      const boxes = [...range.getClientRects()].filter(r => r.width > 0 && r.height > 0).map(r => ({ left: r.left, right: r.right, top: r.top, bottom: r.bottom })), lines = new Set(boxes.map(r => Math.round(r.top)));
      return { text: match[0], lines: lines.size, boxes, withinOwner: boxes.every(r => r.left >= container.left - 1 && r.right <= container.right + 1) };
    });
  });
  const pass = dates.length === 2 && dates.every(d => d.lines === 1 && d.withinOwner);
  await page.screenshot({ path: out + '/' + width + '-' + mode + '.png', fullPage: true }); rows.push({ width, mode, pass, dates });
}
try {
  for (const width of [296, 320, 390, 1440]) {
    const { page, context, errors } = await h.open({ width, hash: 'request/request-one', requestRaw: JSON.stringify([record]) }); await page.setViewportSize({ width, height: 843 }); await page.locator('#cancel-request').click();
    assert.equal((await settleTextLayout(page)).status, 'SETTLED'); await measure(page, width, 'normal');
    await inspectTextStress(page, async (mode, report) => { assert.equal(report.layoutSettlement.status, 'SETTLED'); await measure(page, width, mode); });
    assert.deepEqual(errors, []); await context.close();
  }
  assert.deepEqual(await sourceBinding(target), h.sourceHashes);
  const report = { at: new Date().toISOString(), rows, pass: rows.filter(r => r.pass).length, total: rows.length, sourceHashes: h.sourceHashes, harnessHashes: h.harnessHashes, driverSha256: createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex'), limits: 'Actual cancellation subject date Range fragments and semantic-owner bounds only;not fullvisual,reference or actualdevice approval.' };
  await writeFile(out + '/report.json', JSON.stringify(report, null, 2)); console.log(JSON.stringify({ pass: report.pass, total: report.total, failed: rows.filter(r => !r.pass).map(r => ({ width: r.width, mode: r.mode, dates: r.dates.map(d=>({text:d.text,lines:d.lines,withinOwner:d.withinOwner})) })) })); process.exitCode = report.pass === report.total ? 0 : 1;
} finally { await h.close(); }
