import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { sourceBinding } from '../scripts/source-binding.mjs';
import { materializeSnapshot } from '../evals/results/planner-transfer-20261015/list-ownership/materialize-snapshot.mjs';

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'snapshot-recovery-'));
  const artifact = join(root, 'artifact'), source = join(artifact, 'source'), snapshot = join(artifact, 'snapshots/earlier');
  await mkdir(source, { recursive: true }); await mkdir(join(snapshot, 'changed-files'), { recursive: true });
  await writeFile(join(source, 'index.html'), '<p>Kept</p>'); await writeFile(join(source, 'styles.css'), 'p{color:black}'); await writeFile(join(source, 'app.js'), 'void 0;');
  const earlier = 'p{color:blue}', hashes = await sourceBinding(source); hashes['styles.css'] = createHash('sha256').update(earlier).digest('hex');
  await writeFile(join(snapshot, 'changed-files/styles.css'), earlier); await writeFile(join(snapshot, 'snapshot.json'), JSON.stringify({ sourceHashes: hashes, changedPaths: ['styles.css'] }));
  return { root, artifact, snapshot, hashes };
}

test('thin snapshots restore exact source bytes and preserve an existing destination', async () => {
  const { root, artifact, hashes } = await fixture(), destination = join(root, 'recovered');
  await materializeSnapshot(artifact, 'earlier', destination);
  assert.deepEqual(await sourceBinding(destination), hashes);
  assert.equal(await readFile(join(destination, 'styles.css'), 'utf8'), 'p{color:blue}');
  assert.equal(await readFile(join(artifact, 'source/styles.css'), 'utf8'), 'p{color:black}');
  await writeFile(join(destination, 'user.txt'), 'Keep user work');
  await assert.rejects(materializeSnapshot(artifact, 'earlier', destination), /exist/i);
  assert.equal(await readFile(join(destination, 'user.txt'), 'utf8'), 'Keep user work');
});

test('snapshot corruption and path escape fail before destination creation', async () => {
  const { root, artifact, snapshot } = await fixture(), destination = join(root, 'uncreated');
  await writeFile(join(snapshot, 'changed-files/styles.css'), 'changed evidence');
  await assert.rejects(materializeSnapshot(artifact, 'earlier', destination), /hash mismatch/i);
  await assert.rejects(readFile(join(destination, 'styles.css')), /ENOENT/);
  await assert.rejects(materializeSnapshot(artifact, '../earlier', destination), /snapshot name/i);
  for (const directory of process.platform === 'win32' ? ['source', 'SOURCE'] : ['source']) await assert.rejects(materializeSnapshot(artifact, 'earlier', join(artifact, directory, 'nested')), /outside base source/);
});

test('a linked design parent cannot redirect snapshot overlays into original data', async () => {
  const { root, artifact, snapshot } = await fixture(), original = join(root, 'original-design'), destination = join(root, 'blocked');
  await mkdir(original); await writeFile(join(original, 'component-plan.json'), '{"keep":"original"}');
  await symlink(original, join(artifact, 'source/design'), process.platform === 'win32' ? 'junction' : 'dir');
  const record = JSON.parse(await readFile(join(snapshot, 'snapshot.json'), 'utf8'));
  const changed = '{"earlier":"snapshot"}'; record.sourceHashes['design/component-plan.json'] = createHash('sha256').update(changed).digest('hex'); record.changedPaths.push('design/component-plan.json');
  await mkdir(join(snapshot, 'changed-files/design')); await writeFile(join(snapshot, 'changed-files/design/component-plan.json'), changed); await writeFile(join(snapshot, 'snapshot.json'), JSON.stringify(record));
  await assert.rejects(materializeSnapshot(artifact, 'earlier', destination), /linked source tree/i);
  await assert.rejects(readFile(join(destination, 'styles.css')), /ENOENT/);
  assert.equal(await readFile(join(original, 'component-plan.json'), 'utf8'), '{"keep":"original"}');
});
