import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { harnessBinding } from '../scripts/harness-binding.mjs';

test('browser runtime code joins the immutable execution binding', async () => {
  const binding = await harnessBinding();
  const bytes = await readFile(new URL('../runtime/exclusive-message.mjs', import.meta.url));
  assert.equal(binding['runtime/exclusive-message.mjs'], createHash('sha256').update(bytes).digest('hex'));
  for (const path of ['AGENTS.md', 'scripts/harness-binding.mjs', 'scripts/comments.mjs', 'skills/qwen-samkill-ui/SKILL.md', 'evals/service-cases.mjs']) assert.match(binding[path], /^[a-f0-9]{64}$/);
});
