export async function inspectReadableToken(page, rule) {
  if (!['whole', 'number'].includes(rule.token) || typeof rule.container !== 'string' || !rule.container.trim()) throw new Error('Readable token requires a whole/number token and concrete semantic owner');
  if (rule.suffix !== undefined && (rule.token !== 'number' || typeof rule.suffix !== 'string' || rule.suffix.length > 32 || /[\u0000-\u0020\u007f]/.test(rule.suffix))) throw new Error('Token suffix must be a bounded literal unit');
  const subject = page.locator(rule.subject), container = page.locator(rule.container);
  if (await subject.count() !== 1 || await container.count() !== 1) throw new Error('Readable token requires one subject and one owner');
  return subject.evaluate((element, spec) => {
    const owner = document.querySelector(spec.container), visible = node => node.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
    const transparent = value => value === 'transparent' || /^(?:rgba|hsla)\(.*,[\s]*0(?:\.0+)?\s*\)$/.test(value) || /\/\s*0(?:\.0+)?\s*\)$/.test(value);
    const unknown = detail => ({ status: 'UNVERIFIED', detail, observed: { method: 'Unsupported painted or typographic token state;no fit approval' } });
    const fontProperties = ['font-family', 'font-size', 'font-size-adjust', 'font-weight', 'font-style', 'font-stretch', 'font-variant-numeric', 'font-kerning', 'font-feature-settings', 'font-variation-settings', 'font-optical-sizing', 'letter-spacing', 'word-spacing', 'text-transform'];
    if (!visible(element) || !visible(owner) || !owner.contains(element)) throw new Error('Token must be visible inside its declared semantic owner');
    for (let node = element; node; node = node.parentElement) {
      const s = getComputedStyle(node);
      if (s.transform !== 'none' || !['none', '1', '1 1'].includes(s.scale) || !['normal', '1'].includes(s.zoom) || s.writingMode !== 'horizontal-tb') throw new Error('Readable token requires untransformed horizontal text at authored scale');
      if (s.clipPath !== 'none' || s.clip !== 'auto' || s.filter !== 'none' || s.maskImage !== 'none' || !['none', '0deg'].includes(s.rotate)) return unknown('Painted clip,filter,mask or rotation needs separate actual-paint review');
      for (const pseudo of ['::first-line', '::first-letter']) {
        const p = getComputedStyle(node, pseudo);
        if ([...fontProperties, 'color', '-webkit-text-fill-color'].some(property => p.getPropertyValue(property) !== s.getPropertyValue(property))) return unknown('Ancestor or owned pseudo typography/paint is outside uniform token measurement');
      }
      for (const pseudo of ['::before', '::after']) if (!['none', 'normal', '""'].includes(getComputedStyle(node, pseudo).content)) return unknown('Ancestor or owned generated pseudo content is outside text-node measurement');
    }
    const computed = getComputedStyle(element);
    if (transparent(computed.color) || transparent(computed.webkitTextFillColor)) throw new Error('Actual token text paint is transparent');
    const meaningful = [...element.childNodes].filter(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
    if (meaningful.length !== 1 || [...element.children].some(n => n.textContent.trim())) throw new Error('Readable token needs one uniform owned text node');
    const node = meaningful[0], text = node.textContent, trimmed = text.trim(); if (!trimmed || trimmed.length > 512) throw new Error('Readable token text is empty or exceeds512characters');
    let token = trimmed;
    if (spec.token === 'number') {
      if (/\p{Cf}/u.test(trimmed) || /\d[,.]\s+\d/.test(trimmed)) throw new Error('Numeric token contains an interrupted amount');
      const suffix = (spec.suffix || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), pattern = new RegExp('^(?:[0-9]+|[0-9]{1,3}(?:,[0-9]{3})+)(?:\\.[0-9]+)?' + suffix + '$'), segments = trimmed.split(/\s+/), candidates = segments.filter(s => /[0-9]/.test(s) && (!spec.suffix || s.includes(spec.suffix)));
      if (candidates.length !== 1 || !pattern.test(candidates[0])) throw new Error('Exactly one complete whitespace-bounded numeric unit token is required');
      token = candidates[0];
    }
    const offset = text.indexOf(token), range = document.createRange(); range.setStart(node, offset); range.setEnd(node, offset + token.length);
    const rects = [...range.getClientRects()].filter(r => r.width > 0 && r.height > 0); if (!rects.length) throw new Error('Token has no actual rendered text');
    const lines = []; for (const r of rects) if (!lines.some(y => Math.abs(r.top - y) <= 1)) lines.push(r.top);
    let clipped = false;
    for (let ancestor = element; ancestor; ancestor = ancestor.parentElement) {
      const s = getComputedStyle(ancestor), b = ancestor.getBoundingClientRect(), left = b.left + ancestor.clientLeft, top = b.top + ancestor.clientTop;
      if (rects.some(r => /^(hidden|clip)$/.test(s.overflowX) && (r.left < left - .5 || r.right > left + ancestor.clientWidth + .5) || /^(hidden|clip)$/.test(s.overflowY) && (r.top < top - .5 || r.bottom > top + ancestor.clientHeight + .5))) clipped = true;
    }
    const sample = document.createElement('span'); sample.textContent = token; sample.style.cssText = 'all:initial;position:fixed;visibility:hidden;white-space:pre;width:max-content;max-width:none;pointer-events:none';
    for (const property of fontProperties) sample.style.setProperty(property, computed.getPropertyValue(property));
    let intrinsicWidth;
    try { document.body.append(sample); intrinsicWidth = sample.getBoundingClientRect().width; } finally { sample.remove(); }
    const ownerStyle = getComputedStyle(owner), available = owner.clientWidth - parseFloat(ownerStyle.paddingLeft) - parseFloat(ownerStyle.paddingRight), b = element.getBoundingClientRect(), outsideSubject = rects.some(r => r.left < b.left - .5 || r.right > b.right + .5 || r.top < b.top - .5 || r.bottom > b.bottom + .5);
    if (!Number.isFinite(available) || available <= 0 || !Number.isFinite(intrinsicWidth) || intrinsicWidth <= 0) throw new Error('Token widths must be resolved and positive');
    const actualLineWidth = Math.max(...rects.map(r => r.width)), observed = { token, lines: lines.length, intrinsicWidth, actualLineWidth, available, fitsOwner: Math.max(intrinsicWidth, actualLineWidth) <= available + .5, clipped, outsideSubject, method: 'Actual text ranges and intrinsic uniform text at computed typography;declared semantic-owner content width' };
    if (clipped || outsideSubject) return { status: 'FAIL', detail: 'Token text is clipped or extends outside its own rendered subject', observed };
    if (!observed.fitsOwner) return { status: 'UNVERIFIED', detail: 'Whole token exceeds semantic owner;requires explicit content/layout review', observed };
    if (lines.length !== 1) return { status: 'FAIL', detail: 'Readable whole token fragments despite fitting its semantic owner', observed };
    return { status: 'PASS', observed };
  }, { container: rule.container, token: rule.token, suffix: rule.suffix });
}
