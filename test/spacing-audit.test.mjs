import test from 'node:test';
import assert from 'node:assert/strict';
import { classifySpacing, auditSpacingCss } from '../scripts/spacing-audit.mjs';

test('spacing audit distinguishes hard off-grid values from structural review notes', () => {
  assert.equal(classifySpacing(14, 'internal').status, 'OFF_GRID');
  assert.deepEqual(classifySpacing(14, 'internal').candidates, [12, 16]);
  assert.equal(classifySpacing(20, 'structural').status, 'REVIEW');
  assert.equal(classifySpacing(28, 'structural').status, 'REVIEW');
  assert.equal(classifySpacing(20, 'internal').status, 'ALIGNED');
  assert.equal(classifySpacing(72, 'internal').status, 'REVIEW');
  assert.equal(classifySpacing(0, 'internal').status, 'ALIGNED');
});

test('icon gaps, existing tokens and unresolved roles preserve upstream distinctions', () => {
  assert.deepEqual(classifySpacing(6, 'icon-label').candidates, [4, 8]);
  assert.equal(classifySpacing(12, 'icon-label').status, 'REVIEW');
  assert.equal(classifySpacing(18, 'internal', { token: '--old-space', origin: 'baseline tokens.css', definition: '18px' }).status, 'PRESERVED');
  assert.equal(classifySpacing(18, 'internal', { token: '--new-space' }).status, 'OFF_GRID');
  assert.equal(classifySpacing(16, undefined).status, 'UNVERIFIED');
});

test('source audit covers responsive spacing and does not exempt newly named arbitrary tokens', () => {
  const css = ':root{--old:18px;--new:14px}.card{padding:var(--old);gap:var(--new)}@media(max-width:320px){.card{margin:20px auto}}';
  const report = auditSpacingCss(css, { roles: { '.card': 'structural' }, existingTokens: { '--old': { origin: 'existing baseline', definition: '18px' } } });
  assert.equal(report.declarations, 3);
  assert.equal(report.entries[0].values[0].status, 'PRESERVED');
  assert.equal(report.hardFindings.length, 1);
  assert.equal(report.entries[1].values[0].status, 'OFF_GRID');
  assert.equal(report.entries[2].values[0].status, 'REVIEW');
  assert.ok(report.entries[2].scope[0].includes('320px'));
  assert.ok(report.unverified.length);
});

test('calculated spacing remains unresolved instead of treating a term as a fixed off-grid gap', () => {
  const r = auditSpacingCss('.card{gap:calc(10% + 3px)}', { roles: { '.card': 'structural' } });
  assert.equal(r.hardFindings.length, 0);
  assert.equal(r.entries[0].values[0].status, 'UNVERIFIED');
});
