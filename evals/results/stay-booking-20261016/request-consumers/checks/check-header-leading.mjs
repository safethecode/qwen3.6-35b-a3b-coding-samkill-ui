import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { stayHarness } from './browser-harness.mjs';
const root='evals/results/stay-booking-20261016/request-consumers',target=root+'/source',out=process.argv[2];
assert.ok(out&&process.env.CHROME_PATH);await mkdir(out);const h=await stayHarness(target),{record}=JSON.parse(await readFile(target+'/booking-fixtures.json','utf8')),rows=[];
try{
  for(const width of [296,320,390,1440])for(const kind of ['booking','request'])for(const edge of ['leading','trailing']){
    const {page,context,errors}=await h.open({width,hash:kind==='booking'?'stay/afternoon':'request/request-one',...kind==='request'?{requestRaw:JSON.stringify([record])}:{}});
    try{
      if(kind==='booking'){await page.locator('[data-open-room][data-room-id="afternoon-standard"]').click();await page.locator('#rate-options input[value="afternoon-standard-flex"]').check();await page.locator('#confirm-rate').click();await page.locator('#continue-review').click();}
      await page.evaluate(()=>document.fonts.ready);
      const selector=kind==='booking'?'#review-back':'#request-detail-back',header=kind==='booking'?'.booking-header':'.request-detail-header',button=page.locator(selector),box=await button.boundingBox();
      assert.ok(box.width>=44&&box.height>=44);const geometry=await page.locator(header).evaluate(node=>{const rect=node.getBoundingClientRect(),style=getComputedStyle(node),img=node.querySelector('button img');return{x:rect.x,width:rect.width,paddingLeft:style.paddingLeft,paddingRight:style.paddingRight,icon:img?.getAttribute('src'),iconWidth:img?.getBoundingClientRect().width};});
      assert.equal(geometry.paddingLeft,'0px');assert.equal(geometry.paddingRight,'0px');assert.ok(Math.abs(box.x-geometry.x)<0.5);assert.ok(geometry.icon?.endsWith('/ChevronLeft.svg'));assert.equal(geometry.iconWidth,20);
      await button.focus();assert.equal(await button.evaluate(n=>n===document.activeElement),true);
      await page.mouse.click(edge==='leading'?box.x+1:box.x+box.width-1,box.y+box.height/2);
      if(kind==='booking')await page.locator('#detail-view').waitFor({state:'visible'});else await page.locator('#requests-view').waitFor({state:'visible'});
      assert.deepEqual(errors,[]);rows.push({width,kind,edge,pass:true,box,geometry});
    }catch(error){rows.push({width,kind,edge,pass:false,error:error.message});}finally{await context.close();}
  }
  await writeFile(out+'/report.json',JSON.stringify({at:new Date().toISOString(),rows,pass:rows.filter(r=>r.pass).length,total:rows.length,sourceHashes:h.sourceHashes,harnessHashes:h.harnessHashes,driverSha256:createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex'),limits:'Desktop Chromium pointer-edge, real return route, focus and official icon slot geometry. Original reference CSS/DPR and real mobile device testing remain unknown.'},null,2));
  console.log(JSON.stringify({pass:rows.filter(r=>r.pass).length,total:rows.length,failures:rows.filter(r=>!r.pass)}));process.exitCode=rows.every(r=>r.pass)?0:1;
}finally{await h.close();}
