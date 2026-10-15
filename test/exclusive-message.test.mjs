import test from 'node:test';
import assert from 'node:assert/strict';
import { renderExclusiveMessage } from '../runtime/exclusive-message.mjs';

function fixture() {
  const events = [];
  const contexts = Object.freeze(['main', 'config'].map(key => Object.freeze({ key, region: { hidden: true }, content: { textContent: '' } })));
  const snapshot = () => contexts.map(c => ({ key: c.key, hidden: c.region.hidden, text: c.content.textContent }));
  const setters = {
    setBool(node, prop, value) { if (node[prop] !== value) { node[prop] = value; events.push(snapshot()); } },
    setText(node, text) { if (node.textContent !== text) { node.textContent = text; events.push(snapshot()); } }
  };
  return { contexts, setters, events, snapshot };
}

test('message moves between contexts without simultaneous visible alerts', () => {
  const f = fixture();
  renderExclusiveMessage(f.contexts, 'config', '저장하지 못했어요.', f.setters);
  assert.deepEqual(f.snapshot(), [{ key: 'main', hidden: true, text: '' }, { key: 'config', hidden: false, text: '저장하지 못했어요.' }]);
  renderExclusiveMessage(f.contexts, 'main', '다시 불러와 주세요.', f.setters);
  assert.deepEqual(f.snapshot(), [{ key: 'main', hidden: false, text: '다시 불러와 주세요.' }, { key: 'config', hidden: true, text: '' }]);
  assert.ok(f.events.every(frame => frame.filter(c => !c.hidden).length <= 1));
});

test('empty message hides both contexts and clears stale content', () => {
  const f = fixture();
  renderExclusiveMessage(f.contexts, 'main', '읽기 실패', f.setters);
  renderExclusiveMessage(f.contexts, 'config', '', f.setters);
  assert.deepEqual(f.snapshot(), [{ key: 'main', hidden: true, text: '' }, { key: 'config', hidden: true, text: '' }]);
});

test('repeating a stable message produces no writes', () => {
  const f = fixture();
  renderExclusiveMessage(f.contexts, 'main', '실패', f.setters);
  f.events.length = 0;
  for (let i = 0; i < 5; i++) renderExclusiveMessage(f.contexts, 'main', '실패', f.setters);
  assert.equal(f.events.length, 0);
  renderExclusiveMessage(f.contexts, 'config', '', f.setters);
  f.events.length = 0;
  renderExclusiveMessage(f.contexts, 'main', '', f.setters);
  assert.equal(f.events.length, 0);
});

test('invalid context, message or duplicate key cannot mutate existing state', () => {
  const f = fixture();
  renderExclusiveMessage(f.contexts, 'config', '유지', f.setters);
  const before = f.snapshot();
  for (const invoke of [
    () => renderExclusiveMessage(f.contexts, 'missing', 'x', f.setters),
    () => renderExclusiveMessage(f.contexts, 'main', null, f.setters),
    () => renderExclusiveMessage([f.contexts[0], f.contexts[0]], 'main', 'x', f.setters)
  ]) assert.throws(invoke, TypeError);
  assert.deepEqual(f.snapshot(), before);
});
