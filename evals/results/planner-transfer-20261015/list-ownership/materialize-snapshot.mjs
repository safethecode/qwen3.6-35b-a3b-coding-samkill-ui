import { readFile, mkdir, cp, realpath, lstat, readdir } from 'node:fs/promises';
import { resolve, join, sep, dirname, basename } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { sourceBinding } from '../../../../scripts/source-binding.mjs';

export async function materializeSnapshot(artifact, name, destination) {
  if (typeof name !== 'string' || !/^[a-z0-9-]+$/.test(name)) throw new Error('Invalid snapshot name');
  const base = resolve(artifact, 'source'), snapshot = resolve(artifact, 'snapshots', name), output = resolve(destination);
  const key = path => process.platform === 'win32' ? path.toLowerCase() : path;
  const realBase = key(await realpath(base)), realOutput = key(join(await realpath(dirname(output)), basename(output)));
  if (realOutput === realBase || realOutput.startsWith(realBase + sep)) throw new Error('Destination must be outside base source');
  const inspectTree = async path => {
    const entry = await lstat(path);
    if (entry.isSymbolicLink()) throw new Error('Linked source tree is not allowed');
    if (entry.isDirectory()) for (const child of await readdir(path)) await inspectTree(join(path, child));
    else if (!entry.isFile()) throw new Error('Unsupported snapshot file type');
  };
  await inspectTree(base); await inspectTree(snapshot);
  const record = JSON.parse(await readFile(join(snapshot, 'snapshot.json'), 'utf8')), expected = record.sourceHashes, changed = record.changedPaths;
  const safe = path => typeof path === 'string' && path && !path.startsWith('/') && !path.includes('\\') && !path.includes(':') && !path.split('/').some(part => !part || part === '.' || part === '..');
  if (!expected || Array.isArray(expected) || !Array.isArray(changed) || !Object.keys(expected).every(safe) || !changed.every(path => safe(path) && Object.hasOwn(expected, path)) || new Set(changed).size !== changed.length) throw new Error('Invalid snapshot paths');
  const current = await sourceBinding(base);
  if (JSON.stringify(Object.keys(current).sort()) !== JSON.stringify(Object.keys(expected).sort())) throw new Error('Snapshot base file set mismatch');
  for (const [path, hash] of Object.entries(expected)) {
    const actual = changed.includes(path) ? createHash('sha256').update(await readFile(join(snapshot, 'changed-files', path))).digest('hex') : current[path];
    if (actual !== hash) throw new Error(`Snapshot source hash mismatch: ${path}`);
  }
  await mkdir(output);
  await cp(base, output, { recursive: true, dereference: true });
  for (const path of changed) { await mkdir(resolve(output, path, '..'), { recursive: true }); await cp(join(snapshot, 'changed-files', path), join(output, path), { dereference: true }); }
  const restored = await sourceBinding(output);
  if (Object.keys(restored).length !== Object.keys(expected).length || Object.entries(expected).some(([path, hash]) => restored[path] !== hash)) throw new Error('Restored snapshot hash mismatch');
  return { status: 'EXACT_BOUND_SOURCE_RESTORED', snapshot: name, files: Object.keys(restored).length, changedFiles: changed.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [name, destination] = process.argv.slice(2);
  if (!destination) throw new Error('Usage: node materialize-snapshot.mjs SNAPSHOT NEW_OUTPUT_DIRECTORY');
  console.log(JSON.stringify(await materializeSnapshot(fileURLToPath(new URL('.', import.meta.url)), name, destination)));
}
