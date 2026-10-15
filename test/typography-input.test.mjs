import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generateService } from '../scripts/generate-service.mjs';

test('generation forwards predeclared font roles and refuses resume after typography intent changes', async () => {
  const root = await mkdtemp(join(tmpdir(), 'qwen-font-intent-'));
  const target = join(root, 'source');
  const evidence = join(root, 'evidence');
  await mkdir(join(target, 'design'), { recursive: true });
  await mkdir(evidence);
  await writeFile(join(target, 'DESIGN.md'), 'Use the supplied font intent.');
  await writeFile(join(target, 'REFERENCE.md'), 'Original service, no reference font inference.');
  const typography = { roles: [{ selector: 'h1,p,button', families: ['Example Font'], fontSizePx: 22, fontWeight: 700, lineHeightRatio: 1.5 }] };
  await writeFile(join(target, 'design/typography.json'), JSON.stringify(typography));
  const calls = [];
  const fetcher = async (_url, options) => {
    const request = JSON.parse(options.body);
    calls.push(request);
    assert.match(request.messages[1].content, /PREDECLARED TYPOGRAPHY INTENT/);
    assert.ok(request.messages[1].content.includes('Example Font'));
    assert.ok(request.messages[1].content.includes('fontSizePx'));
    if (request.messages[1].content.includes('CURRENT UNIT: shell')) return { ok: true, json: async () => ({ done_reason: 'stop', message: { content: JSON.stringify({ code: '<html><body><h1>Example</h1></body></html>' }) } }) };
    throw new Error('Stop after shell');
  };
  await assert.rejects(generateService(target, evidence, { fetcher }), /Stop after shell/);
  assert.ok(JSON.parse(await readFile(join(evidence, 'generation-checkpoint.json'), 'utf8')).completed.shell);
  await writeFile(join(target, 'design/typography.json'), JSON.stringify({ roles: [{ selector: 'h1,p,button', families: ['Different Font'] }] }));
  const count = calls.length;
  await assert.rejects(generateService(target, evidence, { fetcher, resume: true }), /does not match/);
  assert.equal(calls.length, count);
});

test('malformed role metrics are rejected before service inference', async () => {
  const root = await mkdtemp(join(tmpdir(), 'qwen-font-metric-invalid-'));
  await mkdir(join(root, 'design'));
  await writeFile(join(root, 'DESIGN.md'), 'Declared role metrics.');
  await writeFile(join(root, 'REFERENCE.md'), 'No inferred reference CSS.');
  for (const metrics of [{ fontSizePx: null }, { fontSizePx: '22' }, { fontWeight: 0 }, { fontWeight: 1001 }, { lineHeightRatio: false }]) {
    await writeFile(join(root, 'design/typography.json'), JSON.stringify({ roles: [{ selector: 'h1', families: ['Example'], ...metrics }] }));
    await assert.rejects(generateService(root, root, { fetcher: () => assert.fail('Invalid metrics reached inference') }), /typography metric/);
  }
});

test('invalid predeclared font roles fail before inference', async () => {
  const root = await mkdtemp(join(tmpdir(), 'qwen-font-invalid-'));
  await mkdir(join(root, 'design'));
  await writeFile(join(root, 'DESIGN.md'), 'Font contract validation.');
  await writeFile(join(root, 'REFERENCE.md'), 'No reference.');
  for (const roles of [[], [{ selector: '', families: ['Example'] }], [{ selector: 'p', families: [] }], [{ selector: 'p', families: [''] }]]) {
    await writeFile(join(root, 'design/typography.json'), JSON.stringify({ roles }));
    await assert.rejects(generateService(root, root, { fetcher: () => assert.fail('Invalid intent must not reach inference') }), /Predeclared typography requires/);
  }
});
