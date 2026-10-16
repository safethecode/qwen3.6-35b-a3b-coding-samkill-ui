import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { stayHarness } from '../request-consumers/checks/browser-harness.mjs';
import { inspectLayoutContract } from '../../../../scripts/layout-contract.mjs';
import { aggregateLayoutStates } from '../../../../scripts/layout-state-coverage.mjs';
import { sourceBinding } from '../../../../scripts/source-binding.mjs';
import { harnessBinding } from '../../../../scripts/harness-binding.mjs';
import { inspectTextStress } from '../../../../scripts/text-stress.mjs';

const [target, output, fault] = process.argv.slice(2);
assert.ok(target && output && process.env.CHROME_PATH);
await mkdir(output);
const widths = fault ? [296] : [296, 320, 390, 1440], states = ['browse', 'saved', 'requests'], modes = ['normal', 'text-200', 'text-spacing'];
const contract = { rules: states.flatMap(state => states.flatMap(destination => ['icon', 'text'].map(paintMode => ({ id: state + '-' + destination + '-' + paintMode, kind: 'monochromePaint', subject: '.bottom-navigation [data-destination="' + destination + '"] ' + (paintMode === 'icon' ? ':is(img,svg)' : 'span'), paintMode, foreground: state === destination ? '#b51d51' : '#66616a', states: [state] })))) };
const h = await stayHarness(resolve(target)), captures = [], labels = ['숙소 찾기', '찜한 숙소', '예약 요청'];
try {
  for (const width of widths) {
    const { page, context, errors } = await h.open({ width, hash: 'browse' });
    try {
      if (fault) await page.addStyleTag({ content: '.bottom-navigation span{color:#000!important}' });
      for (const state of states) {
        await page.locator('.bottom-navigation [data-destination="' + state + '"]').click();
        assert.equal(new URL(page.url()).hash, '#' + state);
        assert.equal(await page.locator('.bottom-navigation [aria-current="page"]').getAttribute('data-destination'), state);
        assert.deepEqual(await page.locator('.bottom-navigation span').allTextContents(), labels);
        const capture = async mode => {
          const report = await inspectLayoutContract(page, contract, { state, mode });
          captures.push(report);
          await page.screenshot({ path: resolve(output, state + '-' + mode + '-' + width + '.png'), fullPage: true });
        };
        await capture('normal');
        await inspectTextStress(page, mode => capture(mode));
      }
      assert.deepEqual(errors, []);
    } finally { await context.close(); }
  }
  assert.deepEqual(await sourceBinding(resolve(target)), h.sourceHashes, 'Source changed during paint captures');
  assert.deepEqual(await harnessBinding(), h.harnessHashes, 'Harness changed during paint captures');
  const coverage = aggregateLayoutStates(contract, captures, { widths, states, modes });
  const results = captures.flatMap(capture => capture.results), counts = { captures: captures.length, inspected: results.length, failures: results.filter(result => result.status === 'FAIL').length, unknown: results.filter(result => result.status === 'UNVERIFIED').length, iconFailures: results.filter(result => result.status === 'FAIL' && result.observed.paintMode === 'icon').length, textFailures: results.filter(result => result.status === 'FAIL' && result.observed.paintMode === 'text').length };
  await writeFile(resolve(output, 'report.json'), JSON.stringify({ at: new Date().toISOString(), injectedLabelFault: Boolean(fault), contract, captures, coverage, counts, sourceHashes: h.sourceHashes, harnessHashes: h.harnessHashes, driverSha256: createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex'), scope: 'Shared monochromePaint relation against the frozen chosen local navigation. No new reference/shape/whole-product parity approval.' }, null, 2));
  console.log(JSON.stringify({ ...counts, coverage: coverage.status }));
  process.exitCode = coverage.status === 'PASS' ? 0 : 1;
} finally { await h.close(); }
