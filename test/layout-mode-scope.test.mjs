import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { inspectLayoutContract } from '../scripts/layout-contract.mjs';
import { aggregateLayoutStates, layoutContractFingerprint } from '../scripts/layout-state-coverage.mjs';

const contract = { rules: [{ id: 'canvas', kind: 'maxWidth', subject: 'main', maximum: 390 }, { id: 'paired', kind: 'sameRow', subject: '#start', reference: '#end', modes: ['normal'] }] };
const scope = { widths: [296], states: ['booking'], modes: ['normal', 'text-200'] };
const capture = (mode, status = 'PASS') => ({ width: 296, state: 'booking', mode, contractSha256: layoutContractFingerprint(contract), results: [{ id: 'canvas', kind: 'maxWidth', status: 'PASS' }, ...mode === 'normal' ? [{ id: 'paired', kind: 'sameRow', status }] : []], issues: [] });

test('normal relationship remains mandatory while enlarged mode can use its own content reflow', async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 296, height: 800 } });
    await page.setContent('<main style="width:250px"><div id="start">Check in</div><div id="end">Check out</div></main>');
    assert.equal((await inspectLayoutContract(page, contract, { state: 'booking' })).results.find(r => r.id === 'paired').status, 'FAIL');
    const enlarged = await inspectLayoutContract(page, contract, { state: 'booking', mode: 'text-200' });
    assert.deepEqual(enlarged.results.map(r => r.id), ['canvas']); assert.equal(enlarged.issues.length, 0);
    for (const modes of [[], null, '', ['normal', 'normal'], [5]]) assert.ok((await inspectLayoutContract(page, { rules: [{ ...contract.rules[0], modes }] })).issues.some(i => i.status === 'FAIL'));
  } finally { await browser.close(); }
});

test('mode-scoped relation does not substitute for a missing requested capture or missing normal rule', () => {
  assert.equal(aggregateLayoutStates(contract, [capture('normal'), capture('text-200')], scope).status, 'PASS');
  assert.equal(aggregateLayoutStates(contract, [capture('normal')], scope).status, 'UNVERIFIED');
  const missing = capture('normal'); missing.results.pop(); assert.equal(aggregateLayoutStates(contract, [missing, capture('text-200')], scope).status, 'UNVERIFIED');
});

test('mode scopes never discard failed observations and wider declared modes still need evidence', () => {
  assert.equal(aggregateLayoutStates(contract, [capture('normal', 'FAIL'), capture('normal'), capture('text-200')], scope).status, 'FAIL');
  const expanded = structuredClone(contract); expanded.rules[1].modes.push('text-spacing');
  const captures = [capture('normal'), capture('text-200')].map(c => ({ ...c, contractSha256: layoutContractFingerprint(expanded) }));
  assert.equal(aggregateLayoutStates(expanded, captures, scope).status, 'UNVERIFIED');
});

test('invalid or falsy rule modes are never interpreted as unscoped coverage', () => {
  for (const modes of [[], null, '', ['normal', 'normal'], [0]]) {
    const invalid = structuredClone(contract); invalid.rules[1].modes = modes;
    const captures = [capture('normal'), capture('text-200')].map(c => ({ ...c, contractSha256: layoutContractFingerprint(invalid) }));
    assert.equal(aggregateLayoutStates(invalid, captures, scope).status, 'UNVERIFIED');
  }
});
