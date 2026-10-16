import{readFile,writeFile,mkdir}from'node:fs/promises';import assert from'node:assert/strict';import{createHash}from'node:crypto';
import{stayHarness}from'./browser-harness.mjs';import{sourceBinding}from'../../../../../scripts/source-binding.mjs';import{harnessBinding}from'../../../../../scripts/harness-binding.mjs';
const[target,out]=process.argv.slice(2),h=await stayHarness(target),checks=[];await mkdir(out,{recursive:true});
try{for(const width of[296,390])for(const active of['date','region']){
  const f=await h.open({width}),p=f.page;try{
    await p.evaluate(()=>{const nodes=[...document.querySelectorAll('body,body *')],sizes=nodes.map(n=>parseFloat(getComputedStyle(n).fontSize));nodes.forEach((n,i)=>n.style.setProperty('font-size',sizes[i]*2+'px','important'));const style=document.createElement('style');style.textContent='#date-calendar .calendar-day,#date-calendar .calendar-month-title{font-size:32px!important}';document.head.append(style);});
    await p.setViewportSize({width,height:500});await p.locator('#open-search').click();await p.locator('#open-search-calendar').click();
    if(active==='date')await p.locator('#date-calendar .calendar-day:not(:disabled)').last().focus();else await p.locator('#date-calendar [role=region][tabindex="0"]').focus();
    const steps=[];
    for(const height of[500,900,500]){
      await p.setViewportSize({width,height});await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      const observed=await p.evaluate(()=>{const d=document.getElementById('date-calendar'),a=document.activeElement,o=d.querySelector('[role=region][tabindex="0"]'),box=n=>{const r=n.getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom};};return{mode:d.dataset.scrollMode,activeDate:a.dataset.date||null,activeIsOwner:a===o,active:box(a),owner:box(o),context:parseFloat(getComputedStyle(d).getPropertyValue('--calendar-context-height')),cancel:box(document.getElementById('calendar-cancel')),outerTop:d.scrollTop,regionCount:d.querySelectorAll('[role=region][tabindex="0"]').length};});
      assert.equal(observed.regionCount,1);assert.equal(observed.outerTop,0);assert.ok(observed.cancel.y>=0&&observed.cancel.bottom<=height);
      if(active==='date'){assert.equal(observed.activeDate,'2026-12-31');assert.ok(observed.active.x>=observed.owner.x-.5&&observed.active.right<=observed.owner.right+.5&&observed.active.y>=observed.owner.y+observed.context-.5&&observed.active.bottom<=observed.owner.bottom+.5);}else assert.equal(observed.activeIsOwner,true);
      steps.push({height,observed});await p.screenshot({path:out+`/${width}-${active}-${height}-${steps.length}.png`});
    }
    assert.deepEqual(steps.map(s=>s.observed.mode),['flow','fixed','flow']);await p.locator('#calendar-cancel').click();assert.equal(await p.evaluate(()=>document.activeElement.id),'open-search-calendar');assert.deepEqual(f.errors,[]);checks.push({width,active,status:'PASS',steps});
  }catch(e){checks.push({width,active,status:'FAIL',detail:e.message});}finally{await f.context.close();}
}
assert.deepEqual(await sourceBinding(target),h.sourceHashes);assert.deepEqual(await harnessBinding(),h.harnessHashes);await writeFile(out+'/report.json',JSON.stringify({at:new Date().toISOString(),sourceHashes:h.sourceHashes,harnessHashes:h.harnessHashes,checkerSha256:createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex'),checks,failures:checks.filter(c=>c.status==='FAIL').length,scope:'Focused last date or active scroll region survives actual500→900→500CSS-px viewport resize;device orientation/native keyboard and AT unverified'},null,2));console.log(JSON.stringify({groups:checks.length,failures:checks.filter(c=>c.status==='FAIL').length}));process.exitCode=checks.some(c=>c.status==='FAIL')?1:0;
}finally{await h.close();}
