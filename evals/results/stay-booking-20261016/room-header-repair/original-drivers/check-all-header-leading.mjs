import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { stayHarness } from './browser-harness.mjs';
const target=process.argv[2],out=process.argv[3];assert.ok(target&&out&&process.env.CHROME_PATH);await mkdir(out);const h=await stayHarness(target),{record}=JSON.parse(await readFile(target+'/booking-fixtures.json','utf8')),rows=[];
try{for(const width of [296,320,390,1440])for(const kind of ['rooms','booking','request'])for(const edge of ['leading','trailing']){
  const{page,context,errors}=await h.open({width,hash:kind==='request'?'request/request-one':'stay/afternoon',...kind==='request'?{requestRaw:JSON.stringify([record])}:{}});
  try{
    if(kind==='booking'){await page.locator('[data-open-room][data-room-id="afternoon-standard"]').click();await page.locator('#rate-options input[value="afternoon-standard-flex"]').check();await page.locator('#confirm-rate').click();await page.locator('#continue-review').click();}
    const selector={rooms:'#return-results',booking:'#review-back',request:'#request-detail-back'}[kind],button=page.locator(selector),box=await button.boundingBox(),body=await page.locator('body').boundingBox();assert.ok(box.width>=44&&box.height>=44);assert.ok(Math.abs(box.x-body.x)<.5,'Back target must own the mobile canvas edge');
    const icon=await button.locator('img').evaluate(n=>({src:n.getAttribute('src'),width:n.getBoundingClientRect().width,height:n.getBoundingClientRect().height}));assert.ok(icon.src.endsWith('/ChevronLeft.svg'));assert.equal(icon.width,20);assert.equal(icon.height,20);
    if(kind==='rooms'){const favorite=page.locator('#detail-favorite');await favorite.click();assert.equal(await favorite.getAttribute('aria-pressed'),'true');await favorite.click();assert.equal(await favorite.getAttribute('aria-pressed'),'false');}
    await button.focus();assert.equal(await button.evaluate(n=>n===document.activeElement),true);await page.mouse.click(edge==='leading'?box.x+1:box.x+box.width-1,box.y+box.height/2);
    await page.locator({rooms:'#stays-view',booking:'#detail-view',request:'#requests-view'}[kind]).waitFor({state:'visible'});assert.deepEqual(errors,[]);rows.push({width,kind,edge,pass:true,box,body,icon});
  }catch(error){rows.push({width,kind,edge,pass:false,error:error.message});}finally{await context.close();}
}
await writeFile(out+'/report.json',JSON.stringify({at:new Date().toISOString(),rows,pass:rows.filter(r=>r.pass).length,total:rows.length,sourceHashes:h.sourceHashes,harnessHashes:h.harnessHashes,driverSha256:createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex'),limits:'Actual desktop Chromium three-header edges,return/focus and room favorite toggles. No native CSS/DPR,real-device or visual parity approval.'},null,2));console.log(JSON.stringify({pass:rows.filter(r=>r.pass).length,total:rows.length,failures:rows.filter(r=>!r.pass)}));process.exitCode=rows.every(r=>r.pass)?0:1;}finally{await h.close();}
