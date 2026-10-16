import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';

const require = createRequire(import.meta.url);
const decoderPackage = require.resolve('playwright-core/package.json');
const { PNG } = require(join(dirname(decoderPackage), 'lib/utilsBundle.js'));

export async function inspectMonochromePaint(page, rule) {
  if (!['icon', 'text'].includes(rule.paintMode) || typeof rule.foreground !== 'string' || !/^#[a-f\d]{6}$/i.test(rule.foreground)) throw new Error('Monochrome paint requires icon/text mode and a predeclared six-digit foreground color');
  const color = rule.foreground.slice(1).match(/../g).map(value => parseInt(value, 16));
  const subject = page.locator(rule.subject);
  const context = await subject.evaluate((element, mode) => {
    const problems = [], style = getComputedStyle(element), ancestors = [];
    let background;
    for (let node = element; node; node = node.parentElement) {
      ancestors.push(node);
      const css = getComputedStyle(node);
      if (css.backgroundImage !== 'none') problems.push('Background images need separate actual-paint review');
      if (!background && css.backgroundColor !== 'rgba(0, 0, 0, 0)') background = css.backgroundColor;
      for (const pseudo of ['::before', '::after']) if (!['none', 'normal', '""', "''"].includes(getComputedStyle(node, pseudo).content)) problems.push('Generated content is outside the single-paint scope');
    }
    for (const node of new Set([...ancestors, ...element.querySelectorAll('*')])) {
      const css = getComputedStyle(node);
      if (css.filter !== 'none' || css.backdropFilter !== 'none' || css.maskImage !== 'none' || css.clipPath !== 'none' || css.clip !== 'auto' || css.mixBlendMode !== 'normal' || css.opacity !== '1' || css.transform !== 'none' || !['none', '1', '1 1'].includes(css.scale) || !['none', '0deg'].includes(css.rotate) || !['none', '0px', '0px 0px'].includes(css.translate) || !['normal', '1'].includes(css.zoom)) problems.push('Effects, painted clips or transformed opacity require separate review');
      if (css.boxShadow !== 'none' || css.textShadow !== 'none' || css.textDecorationLine !== 'none') problems.push('Shadows or text decorations are outside the plain-paint scope');
      if (parseFloat(css.webkitTextStrokeWidth) > 0 || ['::first-letter', '::first-line'].some(pseudo => parseFloat(getComputedStyle(node, pseudo).webkitTextStrokeWidth) > 0)) problems.push('Text strokes need separate actual-paint review');
      if (css.animationName !== 'none' || css.transitionDuration.split(',').some(value => parseFloat(value) > 0)) problems.push('Animated paint needs a separate settled-state inspection');
      if (node.getAnimations().some(animation => animation.pending || !['finished', 'idle'].includes(animation.playState))) problems.push('Active Web Animations API paint needs a settled-state inspection');
    }
    if (background !== 'rgb(255, 255, 255)') problems.push('Only a resolved opaque white background is supported');
    if (['Top', 'Right', 'Bottom', 'Left'].some(side => parseFloat(style['border' + side + 'Width']) > 0)) problems.push('Subject borders need separate paint ownership');
    if (mode === 'text') {
      if (element.childElementCount || !element.textContent.trim() || /\p{Extended_Pictographic}/u.test(element.textContent) || element.namespaceURI !== 'http://www.w3.org/1999/xhtml') problems.push('Text paint requires one nonempty plain DOM text owner without pictographic glyphs');
      for (const pseudo of ['::first-letter', '::first-line']) {
        const p = getComputedStyle(element, pseudo);
        if (['color', '-webkit-text-fill-color', 'font-size', 'font-weight'].some(key => p.getPropertyValue(key) !== style.getPropertyValue(key))) problems.push('Pseudo text styling needs separate paint review');
      }
    } else if (!['svg', 'img'].includes(element.localName)) problems.push('Icon paint requires a single SVG or image slot');
    return { background, color: style.color, textFill: style.webkitTextFillColor, tag: element.localName, problems: [...new Set(problems)] };
  }, rule.paintMode);
  const observed = { context, foreground: rule.foreground, paintMode: rule.paintMode };
  if (context.problems.length) return { status: 'UNVERIFIED', detail: context.problems.join('; '), observed };
  if (Math.max(...color.map(value => 255 - value)) < 30) return { status: 'UNVERIFIED', detail: 'Declared foreground is below the pixel measurement threshold', observed };
  await subject.scrollIntoViewIfNeeded();
  const clip = await subject.boundingBox();
  if (!clip || clip.width < 1 || clip.height < 1) return { status: 'UNVERIFIED', detail: 'Paint clip is below one CSS pixel or no longer resolved', observed };
  const viewport = await page.evaluate(() => ({ width: innerWidth, height: innerHeight }));
  if (clip.x < 0 || clip.y < 0 || clip.x + clip.width > viewport.width || clip.y + clip.height > viewport.height) return { status: 'UNVERIFIED', detail: 'Entire subject is not inside the captured viewport;partial paint cannot approve its owner', observed: { ...observed, clip, viewport } };
  const bytes = await page.screenshot({ clip });
  const originalStyle = await subject.evaluate(node => { const before = node.getAttribute('style'); node.style.setProperty('transition', 'none', 'important'); node.style.setProperty('opacity', '0', 'important'); return before; });
  let background;
  try { background = await page.screenshot({ clip }); }
  finally { await subject.evaluate((node, before) => { if (before === null) node.removeAttribute('style'); else node.setAttribute('style', before); }, originalStyle); }
  const backdrop = PNG.sync.read(background);
  observed.backgroundProbe = { sha256: createHash('sha256').update(background).digest('hex'), method: 'Same clip with owner opacity temporarily zero and exact inline style restored; must expose only opaque white pixels' };
  for (let i = 0; i < backdrop.data.length; i += 4) if (backdrop.data[i] < 254 || backdrop.data[i + 1] < 254 || backdrop.data[i + 2] < 254 || backdrop.data[i + 3] !== 255) return { status: 'UNVERIFIED', detail: 'Other paint occupies the subject clip;foreground ownership is unresolved', observed };
  const png = PNG.sync.read(bytes), vector = color.map(value => 255 - value), square = vector.reduce((sum, value) => sum + value * value, 0);
  let meaningful = 0, bad = 0, corePixels = 0, maxAlpha = 0, maxResidual = 0;
  for (let i = 0; i < png.data.length; i += 4) {
    if (png.data[i + 3] !== 255) return { status: 'UNVERIFIED', detail: 'Screenshot has unresolved background transparency', observed };
    const pixel = [png.data[i], png.data[i + 1], png.data[i + 2]], ink = pixel.map(value => 255 - value);
    if (Math.max(...ink) < 30) continue;
    meaningful++;
    if (rule.paintMode === 'text') {
      if (pixel.some((value, channel) => value < color[channel] - 1)) bad++;
      if (pixel.every((value, channel) => Math.abs(value - color[channel]) <= 2)) corePixels++;
    } else {
      const alpha = ink.reduce((sum, value, channel) => sum + value * vector[channel], 0) / square;
      const residual = Math.sqrt(ink.reduce((sum, value, channel) => sum + (value - alpha * vector[channel]) ** 2, 0));
      maxAlpha = Math.max(maxAlpha, alpha); maxResidual = Math.max(maxResidual, residual);
      if (!Number.isFinite(alpha) || alpha > 1.025 || alpha < 0 || residual > 4) bad++;
    }
  }
  observed.paint = { width: png.width, height: png.height, meaningful, bad, corePixels, maxAlpha, maxResidual, sha256: createHash('sha256').update(bytes).digest('hex'), decoder: `playwright-core@${require(decoderPackage).version}`, method: rule.paintMode === 'icon' ? 'Opaque white alpha-compositing ray; residual<=4 and alpha<=1.025' : 'Plain solid text per-channel foreground/white coverage plus >=5 expected-color cores; permits browser subpixel antialiasing' };
  if (bad) return { status: 'FAIL', detail: 'Actual painted pixels differ from the declared monochrome foreground', observed };
  if ((!meaningful && rule.paintMode === 'icon') || (rule.paintMode === 'text' && context.textFill === 'rgba(0, 0, 0, 0)')) return { status: 'FAIL', detail: 'Required foreground paint is suppressed', observed };
  if (meaningful < 5 || (rule.paintMode === 'text' ? corePixels < 5 : maxAlpha < .7)) return { status: 'UNVERIFIED', detail: 'Too few foreground pixels to verify the declared paint', observed };
  return { status: 'PASS', observed };
}
