import test from 'node:test';
import assert from 'node:assert/strict';
import { aggregateLayoutStates, layoutContractFingerprint } from '../scripts/layout-state-coverage.mjs';
const contract = { rules: [{ id: 'width', kind: 'maxWidth', subject: 'main', maximum: 390 }, { id: 'quiet', kind: 'absent', subject: '.delete:visible', states: ['reading'] }, { id: 'delete', kind: 'firstLineControls', subject: 'main', states: ['editing'] }] };
const scope = { widths: [320, 390], states: ['reading', 'editing'], modes: ['normal', 'text-200'] };
const capture = (width, state, mode = 'normal') => ({ width, state, mode, contractSha256: layoutContractFingerprint(contract), results: contract.rules.filter(r => !r.states || r.states.includes(state)).map(r => ({ id: r.id, kind: r.kind, status: 'PASS' })), issues: [{ code: 'LAYOUT_STATES_PENDING', status: 'UNVERIFIED', problem: 'Other states still require captures' }], pendingStates: contract.rules.filter(r => r.states && !r.states.includes(state)).map(r => ({ id: r.id, states: r.states, status: 'UNVERIFIED' })) });
const complete = () => scope.widths.flatMap(w => scope.states.flatMap(s => scope.modes.map(m => capture(w, s, m))));
test('every declared state, requested width and text mode needs a matching capture', () => {
  const all = complete(); assert.equal(aggregateLayoutStates(contract, all, scope).status, 'PASS');
  for (let index = 0; index < all.length; index++) assert.equal(aggregateLayoutStates(contract, all.filter((_, i) => i !== index), scope).status, 'UNVERIFIED');
  assert.equal(aggregateLayoutStates(contract, [], scope).status, 'UNVERIFIED');
  assert.equal(aggregateLayoutStates(contract, all.filter(c => c.state === 'reading'), { ...scope, states: ['reading'] }).status, 'UNVERIFIED');
});
test('a real failed observation survives later passing captures and pending notices', () => {
  const all = complete(), bad = capture(320, 'editing'); bad.results[1].status = 'FAIL'; bad.issues.push({ status: 'FAIL', problem: 'Action drifts from first line' });
  assert.equal(aggregateLayoutStates(contract, [...all, bad], scope).status, 'FAIL');
  assert.equal(aggregateLayoutStates(contract, [...all, { ...bad, contractSha256: 'stale' }], scope).status, 'FAIL');
  const outside = capture(1440, 'editing'); outside.results[1].status = 'FAIL';
  assert.equal(aggregateLayoutStates(contract, [...all, outside], scope).status, 'FAIL');
  all[0].issues.push({ status: 'UNVERIFIED', problem: 'Missing unrelated evidence' });
  assert.equal(aggregateLayoutStates(contract, all, scope).status, 'UNVERIFIED');
});
test('changed contracts, duplicate or absent rule results and invalid scopes cannot pass', () => {
  const all = complete(); all[0].contractSha256 = 'old'; assert.equal(aggregateLayoutStates(contract, all, scope).status, 'UNVERIFIED');
  const duplicate = complete(); duplicate[0].results.push(duplicate[0].results[0]); assert.equal(aggregateLayoutStates(contract, duplicate, scope).status, 'UNVERIFIED');
  const missing = complete(); missing[0].results.shift(); assert.equal(aggregateLayoutStates(contract, missing, scope).status, 'UNVERIFIED');
  for (const invalid of [{}, { ...scope, widths: [] }, { ...scope, states: [] }, { ...scope, modes: [] }, { ...scope, widths: [320, 320] }]) assert.equal(aggregateLayoutStates(contract, complete(), invalid).status, 'UNVERIFIED');
  const extended = { rules: [...contract.rules, { id: 'wide', kind: 'maxWidth', subject: 'main', maximum: 390, widths: [1440] }] };
  assert.equal(aggregateLayoutStates(extended, complete(), scope).status, 'UNVERIFIED');
});

test('explicit matrix cells are required even if all rules have narrower applicability', () => {
  const narrow = { rules: [{ id: 'only-reading', kind: 'maxWidth', subject: 'main', maximum: 390, widths: [320], states: ['reading'] }] };
  const record = { ...capture(320, 'reading'), contractSha256: layoutContractFingerprint(narrow), results: [{ id: 'only-reading', kind: 'maxWidth', status: 'PASS' }], issues: [] };
  assert.equal(aggregateLayoutStates(narrow, [record], { widths: [320, 390], states: ['reading', 'editing'], modes: ['normal'] }).status, 'UNVERIFIED');
});

test('invalid scope or contract cannot discard a reported failed observation', () => {
  const failed = capture(320, 'reading'); failed.results[0].status = 'FAIL';
  for (const invalid of [null, {}, { ...scope, widths: [] }]) assert.equal(aggregateLayoutStates(contract, [failed], invalid).status, 'FAIL');
  assert.equal(aggregateLayoutStates(null, [failed], scope).status, 'FAIL');
  assert.equal(aggregateLayoutStates(contract, [], null).status, 'UNVERIFIED');
});

test('provided falsy rule scopes and malformed receipts cannot masquerade as unscoped observations', () => {
  for (const field of ['widths', 'states']) for (const value of [null, false, 0, '']) {
    const invalid = { rules: [{ id: 'width', kind: 'maxWidth', subject: 'main', maximum: 390, [field]: value }] };
    const record = { ...capture(320, 'reading'), contractSha256: layoutContractFingerprint(invalid), results: [{ id: 'width', kind: 'maxWidth', status: 'PASS' }], issues: [] };
    assert.equal(aggregateLayoutStates(invalid, [record], { widths: [320], states: ['reading'], modes: ['normal'] }).status, 'UNVERIFIED');
  }
  for (const invalid of [{ ...capture(320, 'reading'), results: [null] }, { ...capture(320, 'reading'), issues: [null] }]) assert.equal(aggregateLayoutStates(contract, [invalid], scope).status, 'UNVERIFIED');
});
