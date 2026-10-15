import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { layoutContractFingerprint } from './layout-state-coverage.mjs';
import { inspectReadableToken } from './readable-token.mjs';

export const readLayoutContract = target => readFile(resolve(target, 'design/layout-contract.json'), 'utf8').then(JSON.parse).catch(error => { if (error.code === 'ENOENT') return null; throw error; });

export async function inspectLayoutContract(page, contract, options = {}) {
  const results = [];
  const issues = [];
  const pendingStates = [];
  const scope = 'Declared DOM ownership, rendered geometry, row grouping and sample width. These measurements do not certify visual equivalence or undeclared relationships.';
  const width = page.viewportSize()?.width;
  const state = options.state || 'initial';
  const identity = { width, state, mode: options.mode || 'normal', contractSha256: layoutContractFingerprint(contract) };
  if (!contract) return { ...identity, results, issues: [{ status: 'UNVERIFIED', problem: 'Reference layout ownership and grouping contract is missing' }], scope };
  if (!Array.isArray(contract.rules) || !contract.rules.length || contract.rules.length > 64 || contract.rules.some(rule => !rule || typeof rule.id !== 'string' || !rule.id.trim()) || new Set(contract.rules.map(rule => rule.id)).size !== contract.rules.length) return { ...identity, results, issues: [{ status: 'FAIL', problem: 'Layout contract requires 1–64 uniquely identified rules' }], scope };
  const box = async (selector, surface = page) => {
    if (typeof selector !== 'string' || !selector.trim()) throw new Error('A concrete selector is required');
    const locator = surface.locator(selector);
    if (await locator.count() !== 1) throw new Error(`Expected one layout subject: ${selector}`);
    if (!await locator.evaluate(element => element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }))) throw new Error(`Layout subject is hidden: ${selector}`);
    const bounds = await locator.boundingBox();
    if (!bounds || bounds.width <= 0 || bounds.height <= 0) throw new Error(`Layout subject has no visible bounds: ${selector}`);
    return bounds;
  };
  const inside = (a, b) => a.x >= b.x - .5 && a.y >= b.y - .5 && a.x + a.width <= b.x + b.width + .5 && a.y + a.height <= b.y + b.height + .5;
  for (const rule of contract.rules) {
    if (rule.widths !== undefined && (!Array.isArray(rule.widths) || !rule.widths.length || new Set(rule.widths).size !== rule.widths.length || rule.widths.some(value => !Number.isInteger(value) || value < 1))) { issues.push({ status: 'FAIL', problem: `Invalid widths for ${rule.id}` }); continue; }
    if (rule.states !== undefined && (!Array.isArray(rule.states) || !rule.states.length || new Set(rule.states).size !== rule.states.length || rule.states.some(value => typeof value !== 'string' || !value.trim()))) { issues.push({ status: 'FAIL', problem: `Invalid states for ${rule.id}` }); continue; }
    if (rule.modes !== undefined && (!Array.isArray(rule.modes) || !rule.modes.length || new Set(rule.modes).size !== rule.modes.length || rule.modes.some(value => typeof value !== 'string' || !value.trim()))) { issues.push({ status: 'FAIL', problem: `Invalid modes for ${rule.id}` }); continue; }
    if (rule.widths && !rule.widths.includes(width)) continue;
    if (rule.modes && !rule.modes.includes(identity.mode)) continue;
    if (rule.states && !rule.states.includes(state)) { pendingStates.push({ id: rule.id, states: rule.states, status: 'UNVERIFIED' }); continue; }
    let observed = {};
    try {
      if (!rule.id || typeof rule.id !== 'string') throw new Error('Layout rule needs an ID');
      if (rule.kind === 'absent') {
        observed.count = await page.locator(rule.subject).count();
        if (observed.count) throw new Error(`Content appears outside its declared ownership: ${rule.subject}`);
      } else if (rule.kind === 'rowLimit') {
        if (!Array.isArray(rule.groups) || rule.groups.length < 2 || !Number.isInteger(rule.maximum) || rule.maximum < 1 || rule.maximum >= rule.groups.length) throw new Error('Invalid row-group limit');
        observed.boxes = await Promise.all(rule.groups.map(selector => box(selector)));
        const events = observed.boxes.flatMap(bounds => [[bounds.y + .5, 1], [bounds.y + bounds.height - .5, -1]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
        let active = 0;
        observed.maximumInlineGroups = 0;
        for (const [, delta] of events) { active += delta; observed.maximumInlineGroups = Math.max(observed.maximumInlineGroups, active); }
        if (observed.maximumInlineGroups > rule.maximum) throw new Error(`Too many semantic groups share a row: ${observed.maximumInlineGroups} > ${rule.maximum}`);
      } else {
        observed.subject = await box(rule.subject);
        if (rule.kind === 'firstLineControls') {
          const tolerance = rule.tolerance ?? 2;
          if (typeof rule.rows !== 'string' || !rule.rows.trim() || typeof rule.text !== 'string' || !rule.text.trim() || !Array.isArray(rule.controls) || !rule.controls.length || rule.controls.length > 4 || rule.controls.some(selector => typeof selector !== 'string' || !selector.trim()) || new Set(rule.controls).size !== rule.controls.length || !Number.isFinite(tolerance) || tolerance < 0 || tolerance > 4) throw new Error('First-line controls require row/text selectors, one to four unique control selectors and tolerance0–4px');
          observed.rows = await page.locator(rule.subject).evaluate((root, rule) => {
            const visible = element => element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) && element.getBoundingClientRect().width > 0;
            const rows = [...root.querySelectorAll(rule.rows)].filter(visible);
            if (!rows.length) throw new Error('First-line inspection requires at least one visible row in its declared state');
            return rows.map((row, index) => {
              const texts = row.querySelectorAll(rule.text);
              if (texts.length !== 1 || !visible(texts[0])) throw new Error('Expected one visible first-line text subject per row');
              const text = texts[0], style = getComputedStyle(text), lineHeight = parseFloat(style.lineHeight);
              if (!Number.isFinite(lineHeight) || lineHeight <= 0) throw new Error('First-line alignment requires a resolved numeric line-height');
              const firstLineCenter = text.getBoundingClientRect().top + parseFloat(style.borderTopWidth) + parseFloat(style.paddingTop) + lineHeight / 2, bounds = row.getBoundingClientRect();
              const controls = rule.controls.map(selector => {
                const elements = row.querySelectorAll(selector);
                if (elements.length !== 1 || !visible(elements[0])) throw new Error('Expected one visible owned control per selector in each row');
                const box = elements[0].getBoundingClientRect();
                return { selector, centerOffset: box.top + box.height / 2 - firstLineCenter, contained: box.left >= bounds.left - .5 && box.right <= bounds.right + .5 && box.top >= bounds.top - .5 && box.bottom <= bounds.bottom + .5 };
              });
              return { index, firstLineCenter, lineHeight, controls };
            });
          }, rule);
          if (observed.rows.some(row => row.controls.some(control => !control.contained || Math.abs(control.centerOffset) > tolerance))) throw new Error('Supporting controls drift from their owned first text line or escape the row');
        } else if (rule.kind === 'readingActionFlow') {
          const tolerance = rule.tolerance === undefined ? 2 : rule.tolerance;
          if (['rows', 'text', 'body', 'action'].some(key => typeof rule[key] !== 'string' || !rule[key].trim()) || ['minimumTextEm', 'minimumTarget'].some(key => !Number.isFinite(rule[key]) || rule[key] <= 0) || !Number.isFinite(rule.reservedInlineWidth) || rule.reservedInlineWidth < 0 || !Number.isFinite(rule.minGap) || rule.minGap < 0 || !Number.isFinite(rule.maxBelowGap) || rule.maxBelowGap < rule.minGap || !Number.isFinite(tolerance) || tolerance < 0 || tolerance > 4) throw new Error('Reading/action flow requires concrete selectors, positive reading/target dimensions, independent nontext allowance, bounded gaps and tolerance0–4px');
          observed.rows = await page.locator(rule.subject).evaluate((root, rule) => {
            const visible = element => element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) && element.getBoundingClientRect().width > 0;
            const inside = (a, b) => a.left >= b.left - .5 && a.right <= b.right + .5 && a.top >= b.top - .5 && a.bottom <= b.bottom + .5;
            const rows = [...root.querySelectorAll(rule.rows)].filter(visible);
            if (!rows.length) throw new Error('Reading/action flow requires at least one visible row');
            return rows.map((row, index) => {
              const one = selector => { const elements = row.querySelectorAll(selector); if (elements.length !== 1 || !visible(elements[0])) throw new Error('Expected one visible owned body, text and action per row'); return elements[0]; };
              const body = one(rule.body), text = one(rule.text), action = one(rule.action);
              if (body.parentElement !== row || action.parentElement !== row || !body.contains(text)) throw new Error('Reading body and supporting action must belong directly to their row');
              for (const subject of [text, action]) for (let element = subject; element; element = element.parentElement) {
                const style = getComputedStyle(element);
                if (['transform', 'translate', 'rotate', 'scale'].some(property => style[property] !== 'none') || !['1', 'normal'].includes(style.zoom)) throw new Error('Reading/action flow cannot certify transformed or CSS-zoomed geometry');
              }
              const rb = row.getBoundingClientRect(), bb = body.getBoundingClientRect(), tb = text.getBoundingClientRect(), ab = action.getBoundingClientRect(), rs = getComputedStyle(row), ts = getComputedStyle(text);
              const fontSize = parseFloat(ts.fontSize), lineHeight = parseFloat(ts.lineHeight);
              if (!Number.isFinite(fontSize) || fontSize <= 0 || !Number.isFinite(lineHeight) || lineHeight <= 0 || ts.writingMode !== 'horizontal-tb' || ts.direction !== 'ltr') throw new Error('Reading/action flow requires resolved horizontal LTR typography');
              const start = rb.left + parseFloat(rs.borderLeftWidth) + parseFloat(rs.paddingLeft), end = rb.right - parseFloat(rs.borderRightWidth) - parseFloat(rs.paddingRight);
              const textInset = tb.left - bb.left + parseFloat(ts.borderLeftWidth) + parseFloat(ts.paddingLeft), textEndInset = bb.right - tb.right + parseFloat(ts.borderRightWidth) + parseFloat(ts.paddingRight);
              const available = end - start - rule.reservedInlineWidth, minimumTextWidth = Math.min(rule.minimumTextEm * fontSize, available), textWidth = tb.width - parseFloat(ts.borderLeftWidth) - parseFloat(ts.borderRightWidth) - parseFloat(ts.paddingLeft) - parseFloat(ts.paddingRight);
              const inlinePossible = available - ab.width - rule.minGap >= rule.minimumTextEm * fontSize - .5;
              const inline = ab.left >= bb.right + rule.minGap - .5 && ab.top < bb.bottom - .5;
              const belowGap = ab.top - bb.bottom, below = belowGap >= rule.minGap - .5 && belowGap <= rule.maxBelowGap + .5;
              const firstLineCenter = tb.top + parseFloat(ts.borderTopWidth) + parseFloat(ts.paddingTop) + lineHeight / 2;
              return { index, fontSize, textWidth, minimumTextWidth, available, nonTextWidth: textInset + textEndInset, inlinePossible, placement: inline ? 'inline' : below ? 'below' : 'invalid', centerOffset: ab.top + ab.height / 2 - firstLineCenter, belowGap, targetWidth: ab.width, targetHeight: ab.height, contained: inside(bb, rb) && inside(tb, bb) && inside(ab, rb), actionAtEnd: Math.abs(ab.right - end) <= .5 };
            });
          }, rule);
          for (const row of observed.rows) {
            if (row.available <= 0 || row.textWidth < row.minimumTextWidth - .5) throw new Error('Supporting action leaves insufficient primary reading width');
            if (row.nonTextWidth > rule.reservedInlineWidth + .5) throw new Error('Undeclared blank body space exceeds the independent nontext allowance');
            if (!row.contained || row.targetWidth < rule.minimumTarget - .5 || row.targetHeight < rule.minimumTarget - .5 || row.placement === 'invalid' || !row.actionAtEnd) throw new Error('Supporting action overlaps, escapes, loses its target or has an invalid owned gap');
            if (row.placement === 'inline' && Math.abs(row.centerOffset) > tolerance) throw new Error('Inline supporting action drifts from the first text line');
            if (row.placement === 'below' && row.inlinePossible) throw new Error('Supporting action wraps unnecessarily despite sufficient declared reading width');
          }
        } else if (rule.kind === 'fillRemainder') {
          observed.reference = await box(rule.reference);
          observed.container = await box(rule.container);
          observed.row = await page.locator(rule.container).evaluate((element, selectors) => {
            const style = getComputedStyle(element);
            const subjects = selectors.map(selector => document.querySelector(selector));
            return { directChildren: subjects.every(subject => subject?.parentElement === element), children: [...element.children].filter(child => child.checkVisibility()).length, innerWidth: element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight), gap: parseFloat(style.columnGap) || 0 };
          }, [rule.subject, rule.reference]);
          const tolerance = rule.tolerance ?? 2;
          if (!Number.isFinite(tolerance) || tolerance < 0 || tolerance > 4) throw new Error('Fill tolerance must be between zero and four pixels');
          observed.expectedWidth = observed.row.innerWidth - observed.reference.width - observed.row.gap;
          if (!observed.row.directChildren || observed.row.children !== 2 || observed.expectedWidth <= 0 || Math.abs(observed.subject.width - observed.expectedWidth) > tolerance || !inside(observed.subject, observed.container)) throw new Error('Primary action does not fill the remaining space in its declared two-control row');
        } else if (rule.kind === 'computedStyle') {
          if (!rule.properties || typeof rule.properties !== 'object' || Array.isArray(rule.properties) || !Object.keys(rule.properties).length || Object.keys(rule.properties).length > 32 || Object.entries(rule.properties).some(([property, value]) => !/^(?:--)?[a-z][a-z0-9-]*$/.test(property) || typeof value !== 'string' || !value.trim())) throw new Error('Computed styles require 1–32 named properties with nonempty canonical computed strings');
          observed.computed = await page.locator(rule.subject).evaluate((element, properties) => {
            const style = getComputedStyle(element);
            return Object.entries(properties).map(([property, expected]) => ({ property, expected, supported: property.startsWith('--') || CSS.supports(property, expected), actual: style.getPropertyValue(property).trim() }));
          }, rule.properties);
          const mismatch = observed.computed.find(item => !item.supported || item.actual !== item.expected);
          if (mismatch) throw new Error(`Computed ${mismatch.property} is ${JSON.stringify(mismatch.actual)}, expected ${JSON.stringify(mismatch.expected)}${mismatch.supported ? '' : '; unsupported property/value'}`);
        } else if (rule.kind === 'maxWidth') {
          if (!Number.isFinite(rule.maximum) || rule.maximum <= 0) throw new Error('Maximum rendered width must be positive');
          if (observed.subject.width > rule.maximum + .5) throw new Error(`Screen exceeds declared mobile width: ${observed.subject.width} > ${rule.maximum}`);
        } else if (rule.kind === 'returnNavigation') {
          if (typeof rule.destination !== 'string' || !/^[\w./-]+\.html$/.test(rule.destination) || rule.destination.startsWith('/') || rule.destination.includes('..')) throw new Error('Return navigation requires a declared local destination');
          observed.navigation = await page.locator(rule.subject).evaluate(element => ({ tag: element.tagName, href: element.getAttribute('href'), label: element.getAttribute('aria-label') || element.textContent.trim() }));
          if (observed.navigation.tag !== 'A' || observed.navigation.href !== rule.destination || !observed.navigation.label) throw new Error('Missing accessible return navigation with a real fallback destination');
        } else if (rule.kind === 'surface') {
          if (!Number.isFinite(rule.minPadding) || rule.minPadding < 0) throw new Error('Surface requires nonnegative minPadding');
          await box(rule.container);
          observed.surface = await page.locator(rule.subject).evaluate((element, selector) => {
            const container = document.querySelector(selector);
            const style = getComputedStyle(element), parent = getComputedStyle(container);
            return { owned: container.contains(element), color: style.backgroundColor, containerColor: parent.backgroundColor, padding: ['Top', 'Right', 'Bottom', 'Left'].map(side => parseFloat(style[`padding${side}`])), horizontalBorders: parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth), separators: element.querySelectorAll('hr,[role="separator"]').length };
          }, rule.container);
          const surface = observed.surface;
          if (!surface.owned || surface.color === surface.containerColor || surface.color === 'transparent' || /rgba\([^)]*,\s*0\)$/.test(surface.color) || surface.padding.some(value => value < rule.minPadding)) throw new Error('Declared group needs its own visible surface and internal spacing');
          if (rule.forbidHorizontalBorders && (surface.horizontalBorders || surface.separators)) throw new Error('Declared surface grouping cannot use horizontal borders or separator bars');
        } else if (rule.kind === 'typeHierarchy') {
          if (!Number.isFinite(rule.minSizeDifference) || rule.minSizeDifference <= 0) throw new Error('Hierarchy requires a positive minimum size difference');
          observed.reference = await box(rule.reference);
          const typography = selector => page.locator(selector).evaluate(element => { const style = getComputedStyle(element); return { size: parseFloat(style.fontSize), weight: parseFloat(style.fontWeight) }; });
          observed.primary = await typography(rule.subject);
          observed.secondary = await typography(rule.reference);
          if (observed.primary.size - observed.secondary.size < rule.minSizeDifference || observed.primary.weight < observed.secondary.weight) throw new Error('Primary state heading is not distinguished from subordinate content');
        } else if (rule.kind === 'contained') {
          observed.container = await box(rule.container);
          const owns = await page.locator(rule.container).evaluate((container, selector) => container.contains(document.querySelector(selector)), rule.subject);
          if (!owns || !inside(observed.subject, observed.container)) throw new Error('Action/content is outside its declared owner');
        } else if (rule.kind === 'readableToken') {
          const token = await inspectReadableToken(page, rule);
          observed = { ...observed, ...token.observed };
          if (token.status !== 'PASS') throw Object.assign(new Error(token.detail), { verificationStatus: token.status });
        } else if (rule.kind === 'sameRow') {
          observed.reference = await box(rule.reference);
          const tolerance = rule.tolerance ?? 2;
          if (!Number.isFinite(tolerance) || tolerance < 0 || tolerance > 8) throw new Error('Row alignment tolerance must be between 0 and 8 pixels');
          const a = observed.subject, b = observed.reference;
          observed.centerDelta = Math.abs(a.y + a.height / 2 - b.y - b.height / 2);
          const separated = a.x + a.width <= b.x + .5 || b.x + b.width <= a.x + .5;
          if (!separated || observed.centerDelta > tolerance) throw new Error('Declared sibling regions do not share a nonoverlapping centered row');
        } else if (rule.kind === 'below' || rule.kind === 'disjoint') {
          observed.reference = await box(rule.reference);
          if (rule.kind === 'below') {
            if (rule.minGap !== undefined && (!Number.isFinite(rule.minGap) || rule.minGap < 0)) throw new Error('Invalid minimum gap');
            if (observed.subject.y + .5 < observed.reference.y + observed.reference.height + (rule.minGap || 0)) throw new Error('Declared regions are not vertically separated');
          } else {
            const a = observed.subject, b = observed.reference;
            if (Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x) > .5 && Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y) > .5) throw new Error('Declared independent regions overlap');
          }
        } else if (rule.kind === 'sampleWidth') {
          if (!/^[\w-]+\.html$/.test(rule.sample || '')) throw new Error('Sample must be a local HTML file');
          const context = await page.context().browser().newContext({ viewport: page.viewportSize() });
          const sample = await context.newPage();
          try {
            await sample.setViewportSize(page.viewportSize());
            await sample.goto(new URL(rule.sample, page.url()).href);
            await sample.evaluate(() => document.fonts.ready);
            observed.sample = await box(rule.subject, sample);
            if (Math.abs(observed.subject.width - observed.sample.width) > .5 || Math.abs(observed.subject.x - observed.sample.x) > .5) throw new Error('Standalone sample and assembled slot have different available widths or insets');
          } finally { await context.close(); }
        } else throw new Error(`Unsupported layout relation: ${rule.kind}`);
      }
      results.push({ id: rule.id, kind: rule.kind, status: 'PASS', observed });
    } catch (error) {
      const detail = error.message.slice(0, 500);
      const status = error.verificationStatus === 'UNVERIFIED' ? 'UNVERIFIED' : 'FAIL';
      results.push({ id: rule.id, kind: rule.kind, status, detail, observed });
      issues.push({ status, problem: `${rule.id}: ${detail}` });
    }
  }
  if (!results.length && !issues.length) issues.push({ status: 'UNVERIFIED', problem: 'No declared layout relation was checked for this viewport/state' });
  if (pendingStates.length) issues.push({ code: 'LAYOUT_STATES_PENDING', status: 'UNVERIFIED', problem: 'Declared state relations still require their own state captures', rules: pendingStates });
  return { ...identity, results, issues, pendingStates, scope };
}
