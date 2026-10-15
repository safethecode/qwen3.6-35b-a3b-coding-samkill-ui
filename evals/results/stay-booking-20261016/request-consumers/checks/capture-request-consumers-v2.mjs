import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import postcss from 'postcss';
import { stayHarness } from './browser-harness.mjs';
import { inspectFontRendering } from '../../../../../scripts/font-rendering.mjs';
import { inspectLayoutContract } from '../../../../../scripts/layout-contract.mjs';
import { inspectTextStress, settleTextLayout } from '../../../../../scripts/text-stress.mjs';
import { sourceBinding } from '../../../../../scripts/source-binding.mjs';
import { harnessBinding } from '../../../../../scripts/harness-binding.mjs';
const root = 'evals/results/stay-booking-20261016/request-consumers', target = root + '/source', out = process.argv[2], rows = [], failures = [], declarations = [];
assert.ok(out && process.env.CHROME_PATH); await mkdir(out);
const { record } = JSON.parse(await readFile(target + '/booking-fixtures.json', 'utf8')), type = JSON.parse(await readFile(target + '/design/typography.json', 'utf8')), layout = JSON.parse(await readFile(target + '/design/layout-contract.json', 'utf8'));
const long = { ...record, snapshot: { ...record.snapshot, stayName: '강릉의 조용한 정원과 오래된 책방을 함께 이용할 수 있는 오후의 방', roomName: '바다가 보이는 넓은 창가의 스탠다드 더블 객실' }, guest: { name: '한글 English 123 예약자 이름이 긴 경우', note: ('창가 객실 요청입니다. ' + 'https://example.test/' + 'verylongpath'.repeat(9) + ' 🙂\n').repeat(3) } };
assert.ok(long.guest.note.length <= 500);
const cases = [
  { name: 'empty', state: 'requests-empty', hash: 'requests', scope: '#requests-view' },
  { name: 'list', state: 'requests-list', hash: 'requests', scope: '#requests-view', records: [record] },
  { name: 'list-many', state: 'requests-list', hash: 'requests', scope: '#requests-view', records: [long, { ...record, id: 'second-request', operations: ['second-operation'] }, { ...record, id: 'third-request', operations: ['third-operation'], status: 'cancelled' }] },
  { name: 'detail', state: 'request-detail', hash: 'request/request-one', scope: '#request-detail-view', records: [record] },
  { name: 'detail-long', state: 'request-detail', hash: 'request/request-one', scope: '#request-detail-view', records: [long] },
  { name: 'list-error', state: 'requests-error', hash: 'requests', scope: '#requests-view', raw: '[null]' },
  { name: 'detail-error', state: 'request-detail-error', hash: 'request/request-one', scope: '#request-detail-view', raw: '[null]' },
  { name: 'cancel', state: 'cancel-request', hash: 'request/request-one', scope: '#cancel-request-dialog', records: [record], dialog: true },
  { name: 'cancel-error', state: 'cancel-request', hash: 'request/request-one', scope: '#cancel-request-dialog', records: [long], dialog: true, writeError: true },
  { name: 'saved-outcome', state: 'request-outcome', hash: 'stay/afternoon', scope: '#request-detail-view', save: true },
  { name: 'cancelled-outcome', state: 'request-outcome', hash: 'request/request-one', scope: '#request-detail-view', records: [record], cancel: true }
];
postcss.parse(await readFile(target + '/request-pages.css', 'utf8')).walkDecls(d => declarations.push({ property: d.prop, value: d.value, context: d.parent.type==='atrule'&&d.parent.name==='font-face'?'font-face-descriptor':'declaration' }));
const h = await stayHarness(target);
async function save(page) {
  await page.locator('[data-open-room][data-room-id="afternoon-standard"]').click(); await page.locator('#rate-options input[value="afternoon-standard-flex"]').check(); await page.locator('#confirm-rate').click(); await page.locator('#continue-review').click(); await page.locator('#edit-request-guest').click(); await page.locator('#request-name').fill('가상 예약자'); await page.locator('#request-note').fill('조용한 객실을 부탁드려요.'); await page.locator('#apply-request-guest').click(); await page.locator('#save-request').click(); await page.waitForURL(url => url.hash.startsWith('#request/'));
}
async function inspect(page, item, width, mode, stress) {
  const stem = out + '/' + item.name + '-' + width + '-' + mode, settlement = await settleTextLayout(page);
  const fonts = await inspectFontRendering(page, { roles: type.roles, textScale: mode === 'text-200' ? 2 : 1, ...mode === 'text-spacing' ? { lineHeightRatioOverride: 1.5 } : {} }), relation = await inspectLayoutContract(page, layout, { state: item.state, mode });
  const geometry = await page.evaluate(selector => {
    const root = document.querySelector(selector), visible = n => n.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }), nodes = [root, ...root.querySelectorAll('*')].filter(visible), rect = n => { const b = n.getBoundingClientRect(); return { left: b.left, right: b.right, top: b.top + scrollY, bottom: b.bottom + scrollY, width: b.width, height: b.height }; };
    return { body: rect(document.body), scope: rect(root), rootOverflow: Math.max(0, document.documentElement.scrollWidth - innerWidth), scrollHeight: document.documentElement.scrollHeight, lastContentBottom: Math.max(...nodes.map(n => rect(n).bottom)), images: nodes.filter(n=>n.tagName==='IMG').map(n=>({src:n.getAttribute('src'),loaded:n.complete&&n.naturalWidth>0,width:rect(n).width,height:rect(n).height})), text: root.innerText };
  }, item.scope);
  const png = await page.screenshot({ path: stem + '.png', fullPage: true }), captureIntegrity = { width: png.readUInt32BE(16), height: png.readUInt32BE(20), scope: item.dialog ? 'Modalviewport plus separatelyscrolledactioncapture;fullpagePNG doesnotcapturemodaloverflow' : 'Complete document through finalvisiblecontent', complete: item.dialog || png.readUInt32BE(20) >= Math.ceil(geometry.lastContentBottom) - 1 };
  let dialogActions, lastPriceReachable;
  if (item.dialog) {
    const actions = page.locator('.request-cancel-actions'); await actions.scrollIntoViewIfNeeded();
    dialogActions = await actions.evaluate(n => { const b=n.getBoundingClientRect(), parent=n.closest('dialog'), p=parent.getBoundingClientRect();return{left:b.left,right:b.right,top:b.top,bottom:b.bottom,dialog:{left:p.left,right:p.right,top:p.top,bottom:p.bottom},withinViewport:b.left>=0&&b.right<=innerWidth+1&&b.top>=0&&b.bottom<=innerHeight+1,withinDialog:b.left>=p.left&&b.right<=p.right+1&&b.top>=p.top&&b.bottom<=p.bottom+1}; });
    await page.screenshot({ path: stem + '-actions.png' }); await page.evaluate(() => { document.querySelector('#cancel-request-dialog').scrollTop=0;window.scrollTo(0,0); });
  }
  if (['list','list-many'].includes(item.name)) {
    await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));await settleTextLayout(page);
    lastPriceReachable=await page.locator('.request-card:last-child [data-request-total]').evaluate(n=>{const b=n.getBoundingClientRect(),nav=document.querySelector('.bottom-navigation').getBoundingClientRect(),point=document.elementFromPoint((b.left+b.right)/2,(b.top+b.bottom)/2);return{top:b.top,bottom:b.bottom,navTop:nav.top,unobscured:b.top>=0&&b.bottom<=nav.top+1&&point&&(point===n||n.contains(point))};});
    await page.screenshot({path:stem+'-list-end.png'});await page.evaluate(()=>window.scrollTo(0,0));await settleTextLayout(page);
  }
  const failed = [...fonts.issues,...relation.issues].filter(i=>i.status==='FAIL');
  const stressFailures = stress ? Object.fromEntries(Object.entries(stress).filter(([k,v])=>['flexPressure','gridPressure','clippedByAncestor','overlappingLines','controlTextOverflow','outsideViewport'].includes(k)&&Array.isArray(v)&&v.length)) : {};
  const row = { name:item.name,state:item.state,width,mode,settlement,fonts,layout:relation,geometry,captureIntegrity,dialogActions,lastPriceReachable,stress:stress||null };
  rows.push(row);
  if (lastPriceReachable&&!lastPriceReachable.unobscured || failed.length || geometry.rootOverflow>1 || geometry.body.width>390.5 || !captureIntegrity.complete || settlement.status!=='SETTLED' || dialogActions && (!dialogActions.withinViewport||!dialogActions.withinDialog) || Object.keys(stressFailures).length) failures.push({name:item.name,width,mode,failed,rootOverflow:geometry.rootOverflow,captureIntegrity,dialogActions,lastPriceReachable,stressFailures});
}
try {
  for (const width of [296,320,390,1440]) for (const item of cases) {
    const { page, context, errors } = await h.open({ width,hash:item.hash,requestRaw:item.raw ?? (item.records ? JSON.stringify(item.records):undefined) }); await page.setViewportSize({width,height:843});
    try {
      if(item.save)await save(page);
      if(item.dialog||item.cancel)await page.locator('#cancel-request').click();
      if(item.writeError){await page.evaluate(()=>window.__writeDenied=true);await page.locator('#confirm-cancel-request').click();await page.waitForFunction(()=>document.querySelector('#cancel-request-error').textContent.length>0);}
      if(item.cancel){await page.locator('#confirm-cancel-request').click();await page.locator('#request-detail-outcome').filter({hasText:'취소했어요'}).waitFor();}
      await page.evaluate(()=>window.scrollTo(0,0));await inspect(page,item,width,'normal');
      await inspectTextStress(page,async(mode,report)=>{await inspect(page,item,width,mode,report);});
      assert.deepEqual(errors,[]);
    } finally { await context.close(); }
    console.log(JSON.stringify({name:item.name,width,captures:rows.length,failures:failures.length}));
  }
  const {page,context}=await h.open();const support=await page.evaluate(values=>values.filter(d=>d.context==='declaration').map(d=>({...d,supported:CSS.supports(d.property,d.value)})),declarations);
  const fontFaceDescriptors=await page.evaluate(()=>[...document.styleSheets].flatMap(s=>[...s.cssRules].filter(r=>r.type===CSSRule.FONT_FACE_RULE).map(r=>({family:r.style.getPropertyValue('font-family'),source:r.style.getPropertyValue('src'),weight:r.style.getPropertyValue('font-weight'),display:r.style.getPropertyValue('font-display'),cssText:r.cssText}))));
  assert.ok(fontFaceDescriptors.some(f=>f.family.includes('Noto Emoji')&&f.source.includes('NotoEmoji.ttf')&&f.weight==='300 700'));assert.ok(fontFaceDescriptors.some(f=>f.family.includes('Noto Color Emoji')&&f.source.includes('NotoColorEmoji.ttf')&&f.weight==='400'));
  await context.close();
  assert.deepEqual(await sourceBinding(target),h.sourceHashes);assert.deepEqual(await harnessBinding(),h.harnessHashes);
  const report={at:new Date().toISOString(),rows,failures,sourceHashes:h.sourceHashes,harnessHashes:h.harnessHashes,driverSha256:createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex'),support,fontFaceDescriptors,descriptorValidation:'CSS.supports applies only tostyledeclarations;@font-face descriptors are separatelyparsed asactualCSSFontFaceRules,withactualloadedplatformfonts verified percase. Original falseunsupporteddescriptor report preserved.',limits:'ActualdesktopChromium,mobileboundedlayout,synthetictextstress and renderedfonts only. Populated/detail/cancel are chosenproduct adaptations;notnative reproduction. Counts do not establishreferencequality,screenreader or realdeviceapproval.'};
  await writeFile(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify({rows:rows.length,failedCases:failures.length,unsupported:support.filter(d=>!d.supported)}));process.exitCode=failures.length||support.some(d=>!d.supported)?1:0;
} finally { await h.close(); }
