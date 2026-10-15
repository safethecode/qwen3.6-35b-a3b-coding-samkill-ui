import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

export async function checkStore(filename) {
  const source = await readFile(filename, 'utf8');
  const { createStore, dateKey, weekDates } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  const checks = [];
  const check = (name, fn) => { try { fn(); checks.push({ name, status: 'PASS' }); } catch (e) { checks.push({ name, status: 'FAIL', detail: e.message }); } };
  const record = { id: '4a725fc8-3214-4c94-b040-ce6e4cac9a58', title: '복습하기', category: 'study', date: '2026-10-15', completed: false };
  const memory = (raw = null) => ({ raw, fail: false, getItem() { return this.raw; }, setItem(key, value) { assert.equal(key, 'weekly-tasks-v1'); if (this.fail) throw Error('quota'); this.raw = value; } });
  check('local date and Monday week across year', () => {
    assert.equal(dateKey(new Date(2026, 0, 1, 0, 5)), '2026-01-01');
    assert.deepEqual(weekDates('2026-01-01'), ['2025-12-29', '2025-12-30', '2025-12-31', '2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04']);
  });
  check('empty state and full persistence sequence', () => {
    const storage = memory(), store = createStore(storage);
    assert.equal(store.tasks.length, 0);
    assert.equal(store.error, null);
    store.add('  복습하기  ', 'study', '2026-10-15');
    assert.equal(store.tasks[0].title, '복습하기');
    assert.match(store.tasks[0].id, /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i);
    store.toggle(store.tasks[0].id);
    assert.equal(createStore(storage).tasks[0].completed, true);
    store.remove(store.tasks[0].id);
    assert.deepEqual(JSON.parse(storage.raw), []);
  });
  for (const [name, raw] of [
    ['malformed JSON', '{'], ['wrong collection type', '{}'],
    ['impossible saved date', JSON.stringify([{ ...record, date: '2026-02-30' }])],
    ['invalid saved identifier', JSON.stringify([{ ...record, id: '' }])],
    ['blank saved title', JSON.stringify([{ ...record, title: '   ' }])],
    ['duplicate identifiers', JSON.stringify([record, record])]
  ]) check(name, () => {
    const storage = memory(raw), store = createStore(storage);
    assert.equal(typeof store.error, 'string');
    assert.ok(store.error.trim());
    assert.equal(store.tasks.length, 0);
    assert.equal(storage.raw, raw);
  });
  check('read failure is visible', () => {
    const store = createStore({ getItem() { throw Error('denied'); } });
    assert.equal(store.tasks.length, 0);
    assert.ok(store.error);
  });
  check('create after malformed initial read preserves unreadable data', () => {
    const storage = memory('{'), store = createStore(storage);
    assert.throws(() => store.add('보존할 입력', 'study', '2026-10-15'));
    assert.equal(storage.raw, '{');
    assert.equal(store.tasks.length, 0);
    assert.ok(store.error);
  });
  check('create after failed initial read never writes', () => {
    let writes = 0;
    const store = createStore({ getItem() { throw Error('read denied'); }, setItem() { writes++; } });
    assert.throws(() => store.add('보존할 입력', 'life', '2026-10-15'));
    assert.equal(writes, 0);
    assert.equal(store.tasks.length, 0);
  });
  check('invalid input does not write', () => {
    const storage = memory(), store = createStore(storage);
    for (const args of [[' ', 'study', '2026-10-15'], ['a'.repeat(121), 'study', '2026-10-15'], ['제목', 'other', '2026-10-15'], ['제목', 'study', '2026-02-30'], ['제목', 'study', '2026-13-01']]) assert.throws(() => store.add(...args));
    assert.equal(storage.raw, null);
    assert.equal(store.tasks.length, 0);
  });
  for (const action of ['add', 'toggle', 'remove']) check(`failed ${action} preserves memory and disk`, () => {
    const storage = memory(JSON.stringify([record])), store = createStore(storage), before = JSON.stringify(store.tasks), disk = storage.raw;
    storage.fail = true;
    assert.throws(() => action === 'add' ? store.add('산책하기', 'life', '2026-10-15') : store[action](record.id));
    assert.equal(JSON.stringify(store.tasks), before);
    assert.equal(storage.raw, disk);
  });
  return { status: checks.some(x => x.status === 'FAIL') ? 'FAIL' : 'PASS', sourceSha256: createHash('sha256').update(source).digest('hex'), checks };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = await checkStore(process.argv[2]);
  if (process.argv[3]) await writeFile(process.argv[3], JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
  process.exitCode = result.status === 'PASS' ? 0 : 1;
}
