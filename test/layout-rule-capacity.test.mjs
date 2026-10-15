import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { inspectLayoutContract } from '../scripts/layout-contract.mjs';
import { aggregateLayoutStates } from '../scripts/layout-state-coverage.mjs';

const absent = count => Array.from({ length: count }, (_, i) => ({ id: 'absent-' + i, kind: 'absent', subject: '#absent-' + i }));

test('extended bounded contracts check every rule beyond64 and preserve failures', async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 843 } });
    await page.setContent('<main id="later" style="width:200px">Complete product state</main>');
    const full = { rules: absent(128) }, good = await inspectLayoutContract(page, full);
    assert.equal(good.results.length, 128);
    assert.equal(good.issues.length, 0);
    const beyond64 = { rules: [...absent(64), { id: 'later-measurement', kind: 'maxWidth', subject: '#later', maximum: 100 }] };
    const failed = await inspectLayoutContract(page, beyond64);
    assert.equal(failed.results.length, 65);
    assert.ok(failed.results.some(i => i.status === 'FAIL' && i.id === 'later-measurement'));
    assert.ok(failed.issues.some(i => i.status === 'FAIL' && i.problem.startsWith('later-measurement:')));
  } finally { await browser.close(); }
});

test('extended contracts retain later-state unknowns and reject excess or duplicate rules', async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 843 } });
    await page.setContent('<main id="later" style="width:200px">Complete product state</main>');
    const contract = { rules: [...absent(127), { id: 'later-state', kind: 'maxWidth', subject: '#later', maximum: 220, states: ['editing'] }] };
    const reading = await inspectLayoutContract(page, contract, { state: 'reading' });
    assert.ok(reading.issues.some(i => i.status === 'UNVERIFIED' && i.code === 'LAYOUT_STATES_PENDING'));
    assert.equal(aggregateLayoutStates(contract, [reading], { widths: [390], states: ['reading', 'editing'], modes: ['normal'] }).status, 'UNVERIFIED');
    for (const rules of [absent(129), [...absent(127), { ...absent(1)[0] }]]) {
      const report = await inspectLayoutContract(page, { rules });
      assert.ok(report.issues.some(i => i.status === 'FAIL' && i.problem.includes('uniquely identified rules')));
    }
  } finally { await browser.close(); }
});
