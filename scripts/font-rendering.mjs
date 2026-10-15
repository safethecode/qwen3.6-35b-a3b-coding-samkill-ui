import { validateTypographyMetrics, typographyMetricIssues } from './typography-metrics.mjs';

export async function inspectFontRendering(page, options = {}) {
  const textScale = options.textScale === undefined ? 1 : options.textScale;
  if (typeof textScale !== 'number' || !Number.isFinite(textScale) || textScale <= 0) throw new Error('Invalid typography text scale');
  const lineHeightRatioOverride = options.lineHeightRatioOverride;
  if (Object.hasOwn(options, 'lineHeightRatioOverride') && (typeof lineHeightRatioOverride !== 'number' || !Number.isFinite(lineHeightRatioOverride) || lineHeightRatioOverride <= 0)) throw new Error('Invalid typography line-height override');
  if (options.roles?.length) validateTypographyMetrics(options.roles);
  await page.evaluate(() => document.fonts.ready);
  const surfaces = await page.evaluate(() => {
    const rgba = value => {
      const match = value.match(/^rgba?\(([^)]+)\)$/);
      if (!match) return null;
      const channels = match[1].split(/[ ,/]+/).map(Number);
      return channels.length === 3 ? [...channels, 1] : channels;
    };
    const over = (front, back) => front.slice(0, 3).map((value, index) => value * front[3] + back[index] * (1 - front[3])).concat(1);
    const luminance = color => color.slice(0, 3).map(value => value / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
    const visibleOwner = element => {
      if (getComputedStyle(element).visibility !== 'visible') return false;
      for (let ancestor = element; ancestor; ancestor = ancestor.parentElement) {
        const style = getComputedStyle(ancestor);
        if (style.display === 'none' || style.display !== 'contents' && (style.contentVisibility === 'hidden' || Number(style.opacity) === 0)) return false;
      }
      if (element.matches('input:not([type=hidden]),textarea,select')) {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }
      return [...element.childNodes].some(node => {
        if (node.nodeType !== 3 || !node.textContent.trim()) return false;
        const range = document.createRange(); range.selectNodeContents(node);
        return [...range.getClientRects()].some(rect => rect.width > 0 && rect.height > 0);
      });
    };
    return [...document.querySelectorAll('body *')].flatMap(element => {
      if (!visibleOwner(element)) return [];
      if (![...element.childNodes].some(node => node.nodeType === 3 && node.textContent.trim()) && !element.matches('input:not([type=hidden]),textarea,select')) return [];
      const chain = [];
      for (let ancestor = element; ancestor; ancestor = ancestor.parentElement) chain.unshift(ancestor);
      let background = [255, 255, 255, 1];
      let uncertain = false;
      for (const ancestor of chain) {
        const style = getComputedStyle(ancestor);
        const hasBox = style.display !== 'contents';
        const color = hasBox ? rgba(style.backgroundColor) : [0, 0, 0, 0];
        if (!color || hasBox && (style.backgroundImage !== 'none' || style.opacity !== '1' || style.filter !== 'none' || style.mixBlendMode !== 'normal')) uncertain = true;
        if (color) background = over(color, background);
        if (['::before', '::after'].some(pseudo => !['none', 'normal'].includes(getComputedStyle(ancestor, pseudo).content))) uncertain = true;
      }
      const states = [[null, getComputedStyle(element)]];
      if (element.getAttribute('placeholder') && !element.value) states.push(['::placeholder', getComputedStyle(element, '::placeholder')]);
      return states.map(([pseudo, style]) => {
        const foreground = rgba(style.color);
        const fg = foreground && over([foreground[0], foreground[1], foreground[2], foreground[3] * (getComputedStyle(element).display === 'contents' ? 1 : Number(style.opacity))], background);
        const light = fg && luminance(fg);
        const dark = luminance(background);
        const ratio = fg ? (Math.max(light, dark) + .05) / (Math.min(light, dark) + .05) : null;
        const threshold = parseFloat(style.fontSize) >= 24 || (parseFloat(style.fontSize) >= 18.6667 && parseFloat(style.fontWeight) >= 700) ? 3 : 4.5;
        return { tag: element.tagName, id: element.id, pseudo, text: (element.value || element.textContent || element.placeholder || '').trim().slice(0, 60), declaredFamily: style.fontFamily, ratio, threshold, uncertain: uncertain || !foreground, disabled: element.matches(':disabled') };
      });
    });
  });
  const issues = surfaces.flatMap(item => item.disabled ? [] : item.uncertain ? [{ ...item, status: 'UNVERIFIED', problem: 'Contrast requires rendered-surface review for image, gradient, overlay or compositing' }] : item.ratio < item.threshold ? [{ ...item, status: 'FAIL', problem: 'Text contrast is below the applicable threshold' }] : []);
  const session = await page.context().newCDPSession(page);
  const fonts = [];
  const roles = [];
  try {
    await session.send('DOM.enable');
    await session.send('CSS.enable');
    const { root } = await session.send('DOM.getDocument');
    const { nodeIds } = await session.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: 'body *' });
    for (const nodeId of nodeIds) {
      const result = await session.send('CSS.getPlatformFontsForNode', { nodeId });
      if (result.fonts.some(font => font.glyphCount > 0)) fonts.push({ nodeId, fonts: result.fonts });
    }
    for (const role of options.roles || []) {
      if (typeof role.selector !== 'string' || !Array.isArray(role.families) || !role.families.length || role.families.some(family => typeof family !== 'string' || !family.trim())) throw new Error('Typography roles require a selector and explicit rendered font families');
      const selected = await session.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: role.selector });
      const actual = fonts.filter(item => selected.nodeIds.includes(item.nodeId));
      const metrics = ['fontSizePx', 'fontWeight', 'lineHeightRatio'].some(key => Object.hasOwn(role, key)) ? await page.locator(role.selector).evaluateAll(selected => {
        const owners = new Set();
        const visibleOwner = element => {
          if (getComputedStyle(element).visibility !== 'visible') return false;
          for (let ancestor = element; ancestor; ancestor = ancestor.parentElement) {
            const style = getComputedStyle(ancestor);
            if (style.display === 'none' || style.display !== 'contents' && (style.contentVisibility === 'hidden' || Number(style.opacity) === 0)) return false;
          }
          if (element.matches('input:not([type=hidden]),textarea,select')) {
            const rect = element.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          }
          return [...element.childNodes].some(node => {
            if (node.nodeType !== 3 || !node.textContent.trim()) return false;
            const range = document.createRange(); range.selectNodeContents(node);
            return [...range.getClientRects()].some(rect => rect.width > 0 && rect.height > 0);
          });
        };
        for (const root of selected) for (const element of [root, ...root.querySelectorAll('*')]) {
          if (visibleOwner(element) && ([...element.childNodes].some(node => node.nodeType === 3 && node.textContent.trim()) || element.matches('input:not([type=hidden]),textarea,select'))) owners.add(element);
        }
        return [...owners].flatMap(element => {
          const states = [[null, getComputedStyle(element)]];
          if (element.getAttribute('placeholder') && !element.value) states.push(['::placeholder', getComputedStyle(element, '::placeholder')]);
          return states.map(([pseudo, style]) => ({ tag: element.tagName, id: element.id, pseudo, text: (element.value || element.textContent || element.placeholder || '').trim().slice(0, 60), fontSizePx: parseFloat(style.fontSize), fontWeight: parseFloat(style.fontWeight), lineHeightRatio: Number.isFinite(parseFloat(style.lineHeight)) ? parseFloat(style.lineHeight) / parseFloat(style.fontSize) : null }));
        });
      }) : [];
      roles.push({ ...role, actual, metrics });
      issues.push(...typographyMetricIssues(role, metrics, textScale, lineHeightRatioOverride));
      if (['fontSizePx', 'fontWeight', 'lineHeightRatio'].some(key => Object.hasOwn(role, key)) && !metrics.length) issues.push({ status: 'UNVERIFIED', selector: role.selector, problem: 'Typography role has no rendered metric evidence' });
      if (!actual.length) issues.push({ status: 'UNVERIFIED', problem: `Typography role has no rendered text evidence: ${role.selector}` });
      for (const item of actual) for (const font of item.fonts.filter(font => font.glyphCount > 0)) {
        if (role.requireCustomFont === true && !font.isCustomFont) issues.push({ status: 'FAIL', selector: role.selector, actual: font.familyName, problem: 'Typography role requires a supplied font file but rendered a system font' });
        if (!role.families.some(family => family.toLowerCase() === font.familyName.toLowerCase())) issues.push({ status: 'FAIL', selector: role.selector, actual: font.familyName, expected: role.families, problem: 'Typography role rendered an undeclared fallback font' });
      }
    }
  } finally { await session.detach(); }
  for (const family of options.requiredFamilies || []) {
    if (!fonts.some(item => item.fonts.some(font => font.familyName.toLowerCase() === family.toLowerCase() && font.glyphCount > 0))) issues.push({ status: 'FAIL', problem: `Required font is not rendered: ${family}` });
  }
  const webFonts = await page.evaluate(() => [...document.fonts].map(font => ({ family: font.family, status: font.status, weight: font.weight, style: font.style })));
  for (const font of webFonts.filter(font => font.status === 'error')) issues.push({ ...font, status: 'FAIL', problem: 'Declared web font failed to load' });
  if (!options.roles?.length) issues.push({ status: 'UNVERIFIED', problem: 'Intended typography roles were not supplied; font inventory alone does not establish reference fidelity' });
  return { fonts, roles, webFonts, surfaces, issues, metricContext: { textScale, lineHeightRatioOverride: lineHeightRatioOverride ?? null }, scope: 'Actual Chromium platform fonts, declared role metrics and solid-background text contrast. Explicit caller stress overrides require matching real browser activation. Complex surfaces require separate rendered evidence; font-family declarations alone do not establish fidelity.' };
}
