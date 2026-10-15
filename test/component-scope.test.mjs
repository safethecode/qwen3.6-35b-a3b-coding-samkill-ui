import test from 'node:test';
import assert from 'node:assert/strict';
import { componentScope } from '../scripts/component-scope.mjs';
import { componentSkillContext } from '../scripts/skill-context.mjs';
const element = { id: 'week', assets: [], html: '<header data-ui-unit="week" class="planner-header"><div class="planner-heading"><h1 id="selected-date">Today</h1><button id="edit-tasks">Edit</button></div></header>' };
test('scope maps distinguish the attribute owner from actual descendant classes and IDs', () => {
  const result = componentScope(element);
  assert.equal(result.status, 'KNOWN_FIXED_HTML');
  assert.ok(result.rootSelectors.includes('[data-ui-unit="week"].planner-header'));
  assert.ok(result.descendantSelectors.includes('[data-ui-unit="week"] .planner-heading'));
  assert.ok(result.descendantSelectors.includes('[data-ui-unit="week"] #edit-tasks'));
  assert.ok(!result.rootSelectors.includes('[data-ui-unit="week"].planner-heading'));
});
test('unknown markup is explicit and a mismatched fixed owner is rejected', () => {
  assert.equal(componentScope({ id: 'tasks' }).status, 'UNKNOWN_HTML');
  assert.throws(() => componentScope({ ...element, id: 'tasks' }), /owner/);
  assert.throws(() => componentScope({ ...element, html: element.html + element.html }), /root/);
});

test('scope context accepts every valid component ID shape without narrowing plan compatibility', () => {
  for (const id of ['E2', 'UI_header-2', 'week']) {
    const result = componentScope({ id, html: `<section data-ui-unit="${id}"><span class="title">Title</span></section>` });
    assert.equal(result.prefix, `[data-ui-unit="${id}"]`);
    assert.ok(result.descendantSelectors.includes(`[data-ui-unit="${id}"] .title`));
  }
});
test('the real generation and repair context carries grounded scope data alongside complete guide text', async () => {
  const context = await componentSkillContext(element);
  assert.ok(context.text.includes('OWNED SELECTOR CONTEXT'));
  assert.ok(context.text.includes('planner-heading'));
  assert.ok(context.text.includes('data-ui-unit'));
  assert.ok(context.text.includes('descendantSelectors'));
});
