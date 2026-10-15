import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { inspectFontRendering } from '../scripts/font-rendering.mjs';
import { inspectTextStress } from '../scripts/text-stress.mjs';

test('declared role metrics reject browser-default headings and preserve enlargement intent', async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    const page = await browser.newPage();
    await page.setContent('<style>body{font:500 16px Arial;color:#202024;background:white}h1{line-height:1.5}</style><h1 id="title">Selected date</h1>');
    const probe = await inspectFontRendering(page), families = [...new Set(probe.fonts.flatMap(item => item.fonts.map(font => font.familyName)))];
    const roles = [{ selector: '#title', families, fontSizePx: 22, fontWeight: 700, lineHeightRatio: 1.5 }];
    const wrong = await inspectFontRendering(page, { roles });
    assert.ok(wrong.issues.some(issue => issue.metric === 'fontSizePx' && issue.actual === 32 && issue.expected === 22));
    await page.addStyleTag({ content: '#title{font-size:22px}' });
    assert.equal((await inspectFontRendering(page, { roles })).issues.length, 0);
    await inspectTextStress(page, async mode => assert.equal((await inspectFontRendering(page, { roles, textScale: mode === 'text-200' ? 2 : 1 })).issues.length, 0));
    await page.addStyleTag({ content: '#title{font-weight:600;line-height:1.2}' });
    const changed = await inspectFontRendering(page, { roles });
    assert.ok(changed.issues.some(issue => issue.metric === 'fontWeight'));
    assert.ok(changed.issues.some(issue => issue.metric === 'lineHeightRatio'));
  } finally { await browser.close(); }
});

test('role metrics inspect actual descendant labels and reject malformed optional expectations', async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    const page = await browser.newPage();
    await page.setContent('<style>body{background:white;color:#202024}button{font:600 14px/1.5 Arial}span{font-size:18px}</style><button id="action"><span>Finish</span></button>');
    const probe = await inspectFontRendering(page), families = [...new Set(probe.fonts.flatMap(item => item.fonts.map(font => font.familyName)))], role = { selector: '#action', families, fontSizePx: 14 };
    assert.ok((await inspectFontRendering(page, { roles: [role] })).issues.some(issue => issue.metric === 'fontSizePx' && issue.actual === 18));
    for (const invalid of [null, false, 0, '14', NaN, Infinity]) await assert.rejects(inspectFontRendering(page, { roles: [{ ...role, fontSizePx: invalid }] }), /typography metric/);
    await assert.rejects(inspectFontRendering(page, { roles: [role], textScale: 0 }), /text scale/);
  } finally { await browser.close(); }
});

test('rendered fonts and contrast expose fallback, invisible text and uncertain surfaces', async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    const page = await browser.newPage();
    await page.setContent('<style>body{background:#fff;font:500 16px sans-serif;color:#111}#bad{color:#fff}#gradient{background:linear-gradient(white,black)}</style><p id="good">Readable text</p><p id="bad">Invisible text</p><p id="gradient">Uncertain contrast</p>');
    const report = await inspectFontRendering(page);
    assert.ok(report.fonts.some(item => item.fonts.some(font => font.glyphCount > 0 && font.familyName)));
    assert.ok(report.issues.some(item => item.id === 'bad' && item.status === 'FAIL'));
    assert.ok(report.issues.some(item => item.id === 'gradient' && item.status === 'UNVERIFIED'));
    assert.ok(!report.issues.some(item => item.id === 'good'));
    const expected = await inspectFontRendering(page, { requiredFamilies: ['DefinitelyMissingFont'] });
    assert.ok(expected.issues.some(item => item.problem.includes('DefinitelyMissingFont')));
    const roles = await inspectFontRendering(page, { roles: [{ selector: '#good', families: ['DefinitelyMissingFont'] }] });
    assert.ok(roles.issues.some(item => item.selector === '#good' && item.problem.includes('fallback')));
  } finally { await browser.close(); }
});

test('visible display-contents text cannot escape role metrics or contrast inspection', async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    const page = await browser.newPage();
    await page.setContent('<style>body{background:white;color:#202024;font:500 16px Arial}h1{font:700 22px/1.6 Arial}span{display:contents;font-size:32px}#wrong{color:white}#hidden{display:none}#transparent{opacity:0}#invisible{visibility:hidden}</style><h1 id="title">Date <span id="wrong">Heading</span><span id="hidden">Hidden</span><b id="transparent"><span>Transparent</span></b><span id="invisible">Invisible</span></h1>');
    const probe = await inspectFontRendering(page), families = [...new Set(probe.fonts.flatMap(item => item.fonts.map(font => font.familyName)))];
    const report = await inspectFontRendering(page, { roles: [{ selector: '#title', families, fontSizePx: 22 }] });
    assert.ok(report.issues.some(issue => issue.id === 'wrong' && issue.metric === 'fontSizePx' && issue.actual === 32));
    assert.ok(report.surfaces.some(surface => surface.id === 'wrong' && surface.ratio === 1));
    assert.deepEqual(report.roles[0].metrics.map(item => item.text), ['Date HeadingHiddenTransparentInvisible', 'Heading']);
  } finally { await browser.close(); }
});

test('actual spacing stress has an explicit line-height override without changing authored intent', async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    const page = await browser.newPage();
    await page.setContent('<style>body{background:white;color:#202024;font:500 16px/1.6 Arial}</style><p id="copy">Preserved copy</p>');
    const probe = await inspectFontRendering(page), families = [...new Set(probe.fonts.flatMap(item => item.fonts.map(font => font.familyName)))];
    const roles = [{ selector: '#copy', families, fontSizePx: 16, fontWeight: 500, lineHeightRatio: 1.6 }];
    assert.equal((await inspectFontRendering(page, { roles })).issues.length, 0);
    await inspectTextStress(page, async mode => {
      const options = { roles, textScale: mode === 'text-200' ? 2 : 1, ...(mode === 'text-spacing' ? { lineHeightRatioOverride: 1.5 } : {}) };
      const report = await inspectFontRendering(page, options);
      assert.equal(report.issues.length, 0);
      assert.equal(report.roles[0].lineHeightRatio, 1.6);
      assert.equal(report.metricContext.lineHeightRatioOverride, mode === 'text-spacing' ? 1.5 : null);
    });
    assert.equal((await inspectFontRendering(page, { roles })).issues.length, 0);
    for (const invalid of [null, false, 0, '1.5', NaN, Infinity]) await assert.rejects(inspectFontRendering(page, { roles, lineHeightRatioOverride: invalid }), /line-height override/);
    const mismatch = await inspectFontRendering(page, { roles, lineHeightRatioOverride: 1.5 });
    assert.ok(mismatch.issues.some(issue => issue.metric === 'lineHeightRatio' && issue.expected === 1.5));
  } finally { await browser.close(); }
});

test('nonpainting display-contents opacity and backgrounds cannot create false passes', async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    const page = await browser.newPage();
    await page.setContent('<style>body{background:white;color:#202024;font:500 16px Arial}h1{font:700 22px/1.6 Arial}span{display:contents;font-size:32px}#wrong{color:red;opacity:0}#contrast{color:white;background:black}</style><h1 id="title">Date <span id="wrong">Heading</span><span id="contrast">Hidden contrast</span></h1>');
    const probe = await inspectFontRendering(page), families = [...new Set(probe.fonts.flatMap(item => item.fonts.map(font => font.familyName)))];
    const report = await inspectFontRendering(page, { roles: [{ selector: '#title', families, fontSizePx: 22 }] });
    assert.ok(report.issues.some(issue => issue.id === 'wrong' && issue.metric === 'fontSizePx' && issue.actual === 32));
    assert.ok(report.issues.some(issue => issue.id === 'contrast' && issue.ratio === 1 && issue.status === 'FAIL'));
  } finally { await browser.close(); }
});

test('boxed text inside a nonpainting transparent contents ancestor still has measured typography', async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    const page = await browser.newPage();
    await page.setContent('<style>body{background:white;color:#202024;font:500 16px Arial}h1{font:700 22px/1.6 Arial}span{display:contents;opacity:0}b{font-size:32px;color:red}</style><h1 id="title">Date <span><b id="wrong">Heading</b></span></h1>');
    const probe = await inspectFontRendering(page), families = [...new Set(probe.fonts.flatMap(item => item.fonts.map(font => font.familyName)))];
    const report = await inspectFontRendering(page, { roles: [{ selector: '#title', families, fontSizePx: 22 }] });
    assert.ok(report.issues.some(issue => issue.id === 'wrong' && issue.metric === 'fontSizePx' && issue.actual === 32));
    assert.ok(report.surfaces.some(surface => surface.id === 'wrong'));
  } finally { await browser.close(); }
});
