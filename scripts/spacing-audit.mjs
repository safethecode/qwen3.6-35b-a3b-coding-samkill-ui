import postcss from 'postcss';

const scale = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96];
const nearest = (value, allowed) => {
  const distance = Math.min(...allowed.map(item => Math.abs(item - value)));
  return allowed.filter(item => Math.abs(item - value) === distance);
};

export function classifySpacing(value, role, provenance = {}) {
  if (!Number.isFinite(value)) return { status: 'UNVERIFIED', candidates: [], reason: 'No exact CSS-px value' };
  if (provenance.token && provenance.origin && provenance.definition === `${value}px`) return { status: 'PRESERVED', candidates: [], reason: 'Existing token with recorded definition and origin; layout defects still require separate checks' };
  if (!['structural', 'internal', 'icon-label'].includes(role)) return { status: 'UNVERIFIED', candidates: [], reason: 'Spacing role not established' };
  const allowed = role === 'icon-label' ? [4, 8] : role === 'structural' ? scale.filter(item => item % 8 === 0) : scale;
  const candidates = nearest(value, allowed);
  if (value % 4 !== 0) return { status: 'OFF_GRID', candidates, reason: 'Non-preserved fixed spacing is not a multiple of four' };
  if (role === 'icon-label' && !allowed.includes(value)) return { status: 'REVIEW', candidates, reason: 'Icon-label spacing uses four or eight; existing exceptions need evidence' };
  if (!scale.includes(value) || role === 'structural' && value % 8 !== 0) return { status: 'REVIEW', candidates, reason: 'Structural eight-step or scale alignment review; not a hard product failure' };
  return { status: 'ALIGNED', candidates: [], reason: 'Within the declared role scale; not visual approval' };
}

export function auditSpacingCss(source, contract = {}) {
  const root = postcss.parse(source);
  const definitions = new Map();
  root.walkDecls(/^--/, declaration => {
    const values = definitions.get(declaration.prop) || new Set();
    values.add(declaration.value);
    definitions.set(declaration.prop, values);
  });
  const resolveToken = (name, seen = new Set()) => {
    if (seen.has(name) || seen.size > 8 || definitions.get(name)?.size !== 1) return null;
    seen.add(name);
    const value = [...definitions.get(name)][0];
    const alias = /^var\((--[\w-]+)\)$/.exec(value);
    return alias ? resolveToken(alias[1], seen) : value;
  };
  const entries = [];
  root.walkDecls(declaration => {
    if (!/^(?:padding|margin)(?:-(?:top|right|bottom|left|inline|block)(?:-(?:start|end))?)?$|^(?:row-|column-)?gap$/.test(declaration.prop)) return;
    const selector = declaration.parent.selector || '';
    const roleKey = Object.keys(contract.roles || {}).sort((a, b) => b.length - a.length).find(key => selector === key || selector.endsWith(` ${key}`));
    const role = contract.roles?.[roleKey];
    const scope = [];
    for (let parent = declaration.parent.parent; parent; parent = parent.parent) if (parent.type === 'atrule') scope.unshift(`@${parent.name} ${parent.params}`);
    const tokens = [...declaration.value.matchAll(/var\((--[\w-]+)\)|(-?\d+(?:\.\d+)?px)|(?<![\w.-])0(?![\w.%])/g)];
    const values = tokens.map(match => {
      const token = match[1];
      const resolved = token ? resolveToken(token) : match[0];
      const number = /^(?:-?\d+(?:\.\d+)?px|0)$/.test(resolved || '') ? parseFloat(resolved) : NaN;
      const preserved = token && contract.existingTokens?.[token];
      const provenance = preserved && preserved.definition === resolved ? { token, ...preserved } : {};
      const classification = /calc\(/.test(declaration.value) ? { status: 'UNVERIFIED', candidates: [], reason: 'A term inside calculated spacing is not the final fixed distance' } : classifySpacing(number, role, provenance);
      return { raw: match[0], token, resolved, value: Number.isFinite(number) ? number : null, ...classification };
    });
    if (!tokens.length || /auto|calc\(|rem\b|%/.test(declaration.value)) values.push({ status: 'UNVERIFIED', reason: 'Content-dependent, relative or unresolved spacing requires rendered/context review', candidates: [] });
    entries.push({ selector, property: declaration.prop, raw: declaration.value, role: role || 'UNVERIFIED', scope, values });
  });
  return { scope: 'Every spacing declaration in the supplied CSS, including media/state declarations; not a complete DOM or rendered-distance audit', declarations: entries.length, selectors: new Set(entries.map(entry => entry.selector)).size, entries, hardFindings: entries.filter(entry => entry.values.some(value => value.status === 'OFF_GRID')), reviewFindings: entries.filter(entry => entry.values.some(value => value.status === 'REVIEW')), unverified: entries.filter(entry => entry.values.some(value => value.status === 'UNVERIFIED')), status: 'AUDIT_NOT_VISUAL_APPROVAL' };
}
