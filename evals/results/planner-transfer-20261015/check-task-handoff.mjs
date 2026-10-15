import { readFile, writeFile } from 'node:fs/promises';
import { parse, serializeOuter } from 'parse5';
import { createHash } from 'node:crypto';
import { sourceBinding } from '../../../scripts/source-binding.mjs';
const [target, output] = process.argv.slice(2);
const find = html => {
  let found;
  const visit = node => { if (node.attrs?.some(a => a.name === 'data-ui-unit' && a.value === 'tasks')) { if (found) throw Error('Task handoff must identify one owned element'); found = node; } for (const child of node.childNodes || []) visit(child); };
  visit(parse(html)); if (!found) throw Error('Missing tasks element'); return serializeOuter(found);
};
const sourceHashes = await sourceBinding(target), checks = [];
const assembly = find(await readFile(`${target}/index.html`, 'utf8'));
const plan = JSON.parse(await readFile(`${target}/design/component-plan.json`, 'utf8'));
for (const [name, markup] of [['sample', find(await readFile(`${target}/sample-tasks.html`, 'utf8'))], ['plan', find(plan.elements.find(e => e.id === 'tasks').html)]]) checks.push({ name: `${name} task markup equals actual assembly`, status: markup === assembly ? 'PASS' : 'FAIL', expectedSha256: createHash('sha256').update(assembly).digest('hex'), actualSha256: createHash('sha256').update(markup).digest('hex') });
const report = { status: checks.some(c => c.status === 'FAIL') ? 'FAIL' : 'SCOPED_HANDOFF_PARITY_ONLY', sourceHashes, checks, scope: 'Canonical static owned tasks markup, including template, across assembly/sample/plan. This does not approve dynamic behavior or rendered appearance.' };
if (output) await writeFile(output, JSON.stringify(report, null, 2)); console.log(JSON.stringify({ status: report.status, checks })); process.exitCode = report.status === 'FAIL' ? 1 : 0;
