import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { generateComponents } from '../scripts/generate-components.mjs';
import { readElementDataContext } from '../scripts/element-data.mjs';

async function fixture(dataSources) {
  const root = await mkdtemp(join(tmpdir(), 'qwen-data-context-'));
  const target = join(root, 'source'), evidence = join(root, 'evidence');
  await mkdir(join(target, 'design'), { recursive: true });
  const catalog = { rooms: [{ id: 'room-one', rates: [{ id: 'rate-flex', name: 'Flexible', nightly: 148000 }] }, { id: 'unrequested-room', rates: [] }], 'literal/key': { '~value': 7 } };
  const plan = { shared: 'Room choice.', sharedCss: '', reference: { status: 'inspected' }, assembly: '{{room}}', elements: [{ id: 'room', prompt: 'Render supplied room and rate facts.', assets: [], sample: '{{room}}', dataSources }] };
  for (const [file, value] of [['catalog.json', JSON.stringify(catalog)], ['DESIGN.md', 'Mobile room choice.'], ['REFERENCE.md', 'Observed reference.'], ['design/typography.json', JSON.stringify({ roles: [{ selector: 'body *', families: ['Arial'] }] })], ['design/component-plan.json', JSON.stringify(plan)]]) await writeFile(join(target, file), value);
  return { root, target, evidence, catalog };
}
const output = { ok: true, json: async () => ({ done_reason: 'stop', message: { content: JSON.stringify({ html: '<article data-ui-unit="room">Flexible</article>', css: '[data-ui-unit="room"]{font-size:16px}' }) } }) };

test('generation receives selected actual record fields and binds their source bytes', async () => {
  const f = await fixture([{ id: 'selected-room', file: 'catalog.json', pointer: '/rooms/0' }]);
  let packet;
  await generateComponents(f.target, f.evidence, { fetcher: async (_url, options) => {
    packet = JSON.parse(options.body).messages.map(m => m.content).join('\n');
    assert.ok(packet.includes('rate-flex'), 'Actual rate.id must reach the model');
    assert.ok(packet.includes('148000'), 'Actual owned nightly value must reach the model');
    assert.ok(!packet.includes('unrequested-room'), 'Unselected records must not inflate the packet');
    return output;
  } });
  const receipt = JSON.parse(await readFile(join(f.evidence, 'inputs.json'), 'utf8'));
  const record = receipt.dataSources.room[0];
  assert.equal(record.file, 'catalog.json');
  assert.equal(record.pointer, '/rooms/0');
  assert.equal(record.sourceSha256, createHash('sha256').update(await readFile(join(f.target, 'catalog.json'))).digest('hex'));
  assert.equal(record.deliveredSha256, createHash('sha256').update(JSON.stringify(f.catalog.rooms[0])).digest('hex'));
});

test('missing data pointer rejects generation before any inference instead of inventing a shape', async () => {
  const f = await fixture([{ id: 'room', file: 'catalog.json', pointer: '/rooms/8' }]);
  let calls = 0;
  await assert.rejects(generateComponents(f.target, f.evidence, { fetcher: async () => { calls++; return output; } }), /data|pointer/i);
  assert.equal(calls, 0);
});

test('array pointers accept only canonical indices while object keys retain their literal names', async () => {
  const f = await fixture([]);
  await writeFile(join(f.target, 'design/keys.json'), JSON.stringify({ length: 2, '01': 'literal', '-': 'dash', rooms: ['first', 'second'] }));
  for (const pointer of ['/rooms/length', '/rooms/01', '/rooms/-']) {
    await assert.rejects(readElementDataContext(f.target, { dataSources: [{ id: 'item', file: 'design/keys.json', pointer }] }), /pointer/i);
  }
  for (const [pointer, value] of [['/length', 2], ['/01', 'literal'], ['/-', 'dash'], ['/rooms/0', 'first'], ['/rooms/1', 'second']]) {
    const result = await readElementDataContext(f.target, { dataSources: [{ id: 'item', file: 'design/keys.json', pointer }] });
    assert.equal(result.sources[0].deliveredSha256, createHash('sha256').update(JSON.stringify(value)).digest('hex'));
  }
});

test('data context cannot read outside target or accept duplicate ownership IDs', async () => {
  for (const sources of [[{ id: 'outside', file: '../private.json', pointer: '' }], [{ id: 'same', file: 'catalog.json', pointer: '/rooms/0' }, { id: 'same', file: 'catalog.json', pointer: '/rooms/1' }]]) {
    const f = await fixture(sources);
    let calls = 0;
    await assert.rejects(generateComponents(f.target, f.evidence, { fetcher: async () => { calls++; return output; } }), /data|source|duplicate|path/i);
    assert.equal(calls, 0);
  }
});

test('JSON pointer escaping retains literal field ownership', async () => {
  const f = await fixture([{ id: 'literal', file: 'catalog.json', pointer: '/literal~1key/~0value' }]);
  await generateComponents(f.target, f.evidence, { fetcher: async () => output });
  const receipt = JSON.parse(await readFile(join(f.evidence, 'inputs.json'), 'utf8'));
  assert.ok(receipt.dataSources?.room?.[0], 'Delivered data identity must be retained');
  assert.equal(receipt.dataSources.room[0].deliveredSha256, createHash('sha256').update('7').digest('hex'));
});

test('a data file outside the default design inventory cannot change during inference unnoticed', async () => {
  const f = await fixture([{ id: 'record', file: 'design/fixture.json', pointer: '' }]);
  await writeFile(join(f.target, 'design/fixture.json'), '{"id":"before"}');
  await assert.rejects(generateComponents(f.target, f.evidence, { fetcher: async () => {
    await writeFile(join(f.target, 'design/fixture.json'), '{"id":"after"}');
    return output;
  } }), /data.*changed|changed.*data/i);
  assert.equal(await readFile(join(f.target, 'design/fixture.json'), 'utf8'), '{"id":"after"}');
});
