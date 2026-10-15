import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { repairComponent } from '../scripts/repair-component.mjs';
import { componentSkillContext } from '../scripts/skill-context.mjs';

const component = { html: '<div data-ui-unit="A">Title</div>', css: '[data-ui-unit="A"]{font-size:12px}' };
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'component-repair-'));
  const target = join(root, 'source');
  await mkdir(join(target, 'design'), { recursive: true });
  await writeFile(join(target, 'design/component-plan.json'), JSON.stringify({ shared: 'Minimum14px.', sharedCss: '', reference: { status: 'inspected', source: 'fixture' }, assembly: '{{A}}', elements: [{ id: 'A', prompt: 'Title', assets: [], sample: '{{A}}' }] }));
  for (const file of ['index.html', 'sample-A.html']) await writeFile(join(target, file), component.html);
  await writeFile(join(target, 'styles.css'), component.css);
  await writeFile(join(target, 'app.js'), 'void 0;');
  return { target, evidence: join(root, 'evidence') };
}
const reply = patches => ({ ok: true, json: async () => ({ done_reason: 'stop', message: { content: JSON.stringify({ patches }) } }) });

test('bounded component repair reuses HTML across sample and assembly without touching behavior', async () => {
  const { target, evidence } = await fixture();
  await repairComponent(target, evidence, 'A', component, 'Change Title to Heading', { fetcher: async () => reply([{ field: 'html', oldString: 'Title', newString: 'Heading' }]) });
  assert.equal(await readFile(join(target, 'index.html'), 'utf8'), await readFile(join(target, 'sample-A.html'), 'utf8'));
  assert.match(await readFile(join(target, 'index.html'), 'utf8'), /Heading/);
  assert.equal(await readFile(join(target, 'app.js'), 'utf8'), 'void 0;');
});

test('invalid scope and stale source are rejected before any repair writes', async () => {
  for (const mode of ['scope', 'stale', 'truncated']) {
    const { target, evidence } = await fixture();
    await assert.rejects(repairComponent(target, evidence, 'A', component, 'Fix type', { fetcher: async () => {
      if (mode === 'stale') await writeFile(join(target, 'app.js'), 'userChange();');
      if (mode === 'truncated') return { ok: true, json: async () => ({ done_reason: 'length' }) };
      return reply([{ field: 'css', oldString: component.css, newString: mode === 'scope' ? 'body{color:red}' : '[data-ui-unit="A"]{font-size:14px}' }]);
    } }));
    assert.equal(await readFile(join(target, 'styles.css'), 'utf8'), component.css);
    assert.equal(await readFile(join(target, 'index.html'), 'utf8'), component.html);
  }
});

test('component repairs deliver applicable guide text and preserve source hashes', async () => {
  const { target, evidence } = await fixture();
  const context = await componentSkillContext({ assets: [] });
  await repairComponent(target, evidence, 'A', component, 'Fix undersized title', { fetcher: async (url, options) => {
    const request = JSON.parse(options.body);
    assert.ok(request.messages.some(message => message.content.includes(context.text)), 'Repair must receive actual applicable guide text');
    return reply([{ field: 'css', oldString: component.css, newString: '[data-ui-unit="A"]{font-size:14px}' }]);
  } });
  const recorded = JSON.parse(await readFile(join(evidence, 'request.json'), 'utf8'));
  assert.deepEqual(recorded.guideSources, context.sources);
});

test('component repair forwards valid role metrics and rejects invalid intent before inference', async () => {
  const { target, evidence } = await fixture();
  const typography = { roles: [{ selector: '[data-ui-unit="A"]', families: ['Example'], fontSizePx: 14 }] };
  await writeFile(join(target, 'design/typography.json'), JSON.stringify(typography));
  await repairComponent(target, evidence, 'A', component, 'Preserve declared title role', { fetcher: async (_url, options) => {
    assert.ok(JSON.parse(options.body).messages[1].content.includes(JSON.stringify(typography)));
    return reply([{ field: 'css', oldString: component.css, newString: '[data-ui-unit="A"]{font-size:14px}' }]);
  } });
  typography.roles[0].fontSizePx = false;
  await writeFile(join(target, 'design/typography.json'), JSON.stringify(typography));
  await assert.rejects(repairComponent(target, evidence + '-invalid', 'A', { ...component, css: '[data-ui-unit="A"]{font-size:14px}' }, 'Invalid metric must not reach model', { fetcher: () => assert.fail('Invalid metric reached inference') }), /typography metric/);
});

test('a CSS fragment boundary protects unchanged rules in the same semantic component', async () => {
  const protectedRule = '[data-ui-unit="A"]:focus-visible{outline:2px solid black}';
  for (const escape of [true, false]) {
    const { target, evidence } = await fixture();
    await writeFile(join(target, 'styles.css'), component.css + '\n' + protectedRule);
    const operation = repairComponent(target, evidence, 'A', component, 'Only repair the title font fragment;focus is read-only', { fetcher: async () => reply([{ field: 'css', oldString: escape ? protectedRule : component.css, newString: escape ? '[data-ui-unit="A"]:focus-visible{outline:none}' : '[data-ui-unit="A"]{font-size:14px}' }]) });
    if (escape) await assert.rejects(operation, /match exactly once/); else await operation;
    assert.equal(await readFile(join(target, 'styles.css'), 'utf8'), (escape ? component.css : '[data-ui-unit="A"]{font-size:14px}') + '\n' + protectedRule);
    assert.equal(await readFile(join(target, 'index.html'), 'utf8'), component.html);
    assert.equal(await readFile(join(target, 'app.js'), 'utf8'), 'void 0;');
  }
});
