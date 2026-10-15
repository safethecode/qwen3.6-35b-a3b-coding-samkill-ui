import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, cp, rm, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { harnessBinding } from '../scripts/harness-binding.mjs';

test('packaged layout API exactly mirrors its canonical contract section', async () => {
  const canonical = await readFile(new URL('../docs/COMPONENT-GENERATION.md', import.meta.url), 'utf8');
  const section = canonical.slice(canonical.indexOf('## Prescribed computed CSS roles'), canonical.indexOf('## Actual data at element boundaries')).trim();
  const packaged = await readFile(new URL('../skills/qwen-samkill-ui/references/layout-contract-api.md', import.meta.url), 'utf8');
  assert.equal(packaged.replaceAll('\r\n', '\n').trim(), section.replaceAll('\r\n', '\n'));
});

test('installed decomposition guide resolves its contract link inside the skill package', async () => {
  const temp = await mkdtemp(join(tmpdir(), 'skill-contract-reference-'));
  try {
    const installed = join(temp, 'installed-skill');
    await cp(new URL('../skills/qwen-samkill-ui/', import.meta.url), installed, { recursive: true });
    const guide = await readFile(join(installed, 'references/decomposed-layout.md'), 'utf8');
    const match = guide.match(/\[the contract API\]\(([^)]+)\)/);
    assert.ok(match);
    const path = resolve(installed, 'references', match[1]);
    assert.ok(path.startsWith(resolve(installed) + sep));
    assert.equal(await realpath(path), path);
    assert.ok((await readFile(path, 'utf8')).includes('readableToken'));
  } finally { await rm(temp, { recursive: true, force: true }); }
});

test('source bindings include the packaged layout API bytes', async () => {
  const path = 'skills/qwen-samkill-ui/references/layout-contract-api.md';
  const bytes = await readFile(new URL('../' + path, import.meta.url));
  assert.equal((await harnessBinding())[path], createHash('sha256').update(bytes).digest('hex'));
});
