export function renderExclusiveMessage(contexts, selected, message, setters) {
  if (!Array.isArray(contexts) || !contexts.length || typeof message !== 'string' || typeof setters?.setBool !== 'function' || typeof setters?.setText !== 'function') throw new TypeError('Invalid exclusive-message input');
  const keys = contexts.map(context => context?.key);
  if (keys.some(key => typeof key !== 'string' || !key) || new Set(keys).size !== keys.length || !keys.includes(selected) || contexts.some(context => !context.region || !context.content)) throw new TypeError('Invalid exclusive-message contexts');
  for (const context of contexts) if (context.key !== selected || message === '') setters.setBool(context.region, 'hidden', true);
  for (const context of contexts) setters.setText(context.content, context.key === selected ? message : '');
  if (message !== '') setters.setBool(contexts.find(context => context.key === selected).region, 'hidden', false);
}
