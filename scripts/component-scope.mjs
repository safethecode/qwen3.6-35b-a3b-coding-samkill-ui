import { parseFragment } from 'parse5';

export function componentScope(element) {
  if (!element?.id || element.html === undefined) return { status: 'UNKNOWN_HTML', reason: 'No fixed component HTML; do not invent descendant ownership from a name.' };
  if (!/^[A-Za-z][\w-]*$/.test(element.id)) throw new Error('Invalid component scope ID');
  const prefix = `[data-ui-unit="${element.id}"]`, roots = parseFragment(element.html).childNodes.filter(node => node.tagName);
  if (roots.length !== 1) throw new Error('Fixed component HTML needs one owned root');
  const root = roots[0], attr = (node, name) => node.attrs?.find(a => a.name === name)?.value;
  if (attr(root, 'data-ui-unit') !== element.id) throw new Error('Fixed component owner does not match its scope ID');
  const rootSelectors = new Set([prefix]), descendantSelectors = new Set();
  const safe = value => /^[A-Za-z_][A-Za-z0-9_-]*$/.test(value || '');
  const visit = (node, isRoot = false) => {
    if (node.tagName) {
      const base = isRoot ? prefix : `${prefix} `, selectors = isRoot ? rootSelectors : descendantSelectors, id = attr(node, 'id');
      if (safe(id)) selectors.add(`${base}#${id}`);
      for (const cls of (attr(node, 'class') || '').split(/\s+/).filter(safe)) selectors.add(`${base}.${cls}`);
    }
    for (const child of node.childNodes || []) visit(child);
    if (node.content) visit(node.content);
  };
  visit(root, true);
  return { status: 'KNOWN_FIXED_HTML', prefix, ownerTag: root.tagName, rootSelectors: [...rootSelectors], descendantSelectors: [...descendantSelectors], limitation: 'Canonical ownership examples from fixed markup, including template content; not proof of runtime matching or state visibility. Keep the owner prefix on ID selectors and use a descendant space for child nodes; do not move the root attribute onto a child.' };
}
