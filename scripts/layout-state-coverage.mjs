import { createHash } from 'node:crypto';

export const MAX_LAYOUT_RULES = 128;

export const layoutContractFingerprint = contract => createHash('sha256').update(JSON.stringify(contract ?? null)).digest('hex');

export function aggregateLayoutStates(contract, captures, scope = {}) {
  const issues = [], coverage = [];
  const finish = () => ({ status: issues.some(i => i.status === 'FAIL') ? 'FAIL' : issues.length ? 'UNVERIFIED' : 'PASS', issues, coverage, scope: 'Declared contract/state/viewport/text-mode coverage and preserved inspection failures only; no visual quality, source authenticity or reference-parity certification.' });
  const unique = (values, predicate) => Array.isArray(values) && values.length > 0 && new Set(values).size === values.length && values.every(predicate);
  const width = value => Number.isInteger(value) && value > 0;
  const text = value => typeof value === 'string' && Boolean(value.trim());
  for (const capture of Array.isArray(captures) ? captures : []) {
    for (const result of Array.isArray(capture?.results) ? capture.results : []) if (result?.status === 'FAIL') issues.push({ status: 'FAIL', id: result.id, width: capture.width, state: capture.state, mode: capture.mode, problem: 'A reported inspection failure remains in this capture batch' });
    for (const issue of Array.isArray(capture?.issues) ? capture.issues : []) if (issue?.status === 'FAIL') issues.push({ ...issue, width: capture.width, state: capture.state, mode: capture.mode });
  }
  if (!scope || !unique(scope.widths, width) || !unique(scope.states, text) || !unique(scope.modes, text) || !Array.isArray(captures) || !Array.isArray(contract?.rules) || !contract.rules.length || contract.rules.length > MAX_LAYOUT_RULES || !unique(contract.rules.map(r => r?.id), text)) {
    issues.push({ status: 'UNVERIFIED', problem: 'Coverage needs a valid contract and nonempty unique widths, states and modes' }); return finish();
  }
  for (const rule of contract.rules) if (rule.widths !== undefined && !unique(rule.widths, width) || rule.states !== undefined && !unique(rule.states, text) || rule.modes !== undefined && !unique(rule.modes, text)) { issues.push({ status: 'UNVERIFIED', id: rule.id, problem: 'Invalid declared width/state/mode scope' }); return finish(); }
  const fingerprint = layoutContractFingerprint(contract), accepted = [];
  for (const capture of captures) {
    if (!capture || !width(capture.width) || !text(capture.state) || !text(capture.mode) || capture.contractSha256 !== fingerprint || !Array.isArray(capture.results) || !capture.results.every(r => r && text(r.id) && text(r.kind) && ['PASS', 'FAIL', 'UNVERIFIED'].includes(r.status)) || !Array.isArray(capture.issues) || !capture.issues.every(i => i && ['FAIL', 'UNVERIFIED'].includes(i.status))) { issues.push({ status: 'UNVERIFIED', problem: 'Capture identity, contract digest or inspection shape is invalid' }); continue; }
    for (const issue of capture.issues) if (issue.status !== 'FAIL' && !(issue.code === 'LAYOUT_STATES_PENDING' && issue.status === 'UNVERIFIED')) issues.push({ ...issue, width: capture.width, state: capture.state, mode: capture.mode });
    if (!scope.widths.includes(capture.width) || !scope.states.includes(capture.state) || !scope.modes.includes(capture.mode)) { issues.push({ status: 'UNVERIFIED', problem: 'Capture falls outside the explicit coverage matrix', width: capture.width, state: capture.state, mode: capture.mode }); continue; }
    accepted.push(capture);
  }
  for (const w of scope.widths) for (const s of scope.states) for (const m of scope.modes) {
    const observations = accepted.filter(c => c.width === w && c.state === s && c.mode === m).length;
    const cell = { kind: 'capture', width: w, state: s, mode: m, status: observations ? 'PASS' : 'UNVERIFIED', observations }; coverage.push(cell);
    if (!observations) issues.push({ ...cell, problem: 'Requested state/width/mode has not been captured' });
  }
  for (const rule of contract.rules) {
    const widths = rule.widths || scope.widths, states = rule.states || scope.states, modes = rule.modes || scope.modes;
    for (const w of widths) for (const s of states) for (const m of modes) {
      const matches = accepted.filter(c => c.width === w && c.state === s && c.mode === m);
      let status = 'PASS';
      if (!matches.length) status = 'UNVERIFIED';
      for (const capture of matches) {
        const results = capture.results.filter(r => r.id === rule.id);
        if (results.length !== 1 || results[0].kind !== rule.kind) { if (status !== 'FAIL') status = 'UNVERIFIED'; }
        else if (results[0].status === 'FAIL') status = 'FAIL';
        else if (results[0].status !== 'PASS' && status !== 'FAIL') status = 'UNVERIFIED';
      }
      const cell = { id: rule.id, width: w, state: s, mode: m, status, observations: matches.length }; coverage.push(cell);
      if (status !== 'PASS') issues.push({ ...cell, problem: matches.length ? 'Required rule observation is missing, ambiguous or failed' : 'Required state/width/mode has not been inspected' });
    }
  }
  return finish();
}
