import{readFile,writeFile,mkdir}from'node:fs/promises';
import assert from'node:assert/strict';
import{createHash}from'node:crypto';
import{stayHarness}from'./browser-harness.mjs';
import{sourceBinding}from'../../../../../scripts/source-binding.mjs';
import{harnessBinding}from'../../../../../scripts/harness-binding.mjs';
import{inspectLayoutContract}from'../../../../../scripts/layout-contract.mjs';
import{aggregateLayoutStates,layoutContractFingerprint}from'../../../../../scripts/layout-state-coverage.mjs';
import{inspectFontRendering}from'../../../../../scripts/font-rendering.mjs';
const[target,out]=process.argv.slice(2),h=await stayHarness(target),captures=[],checks=[],full=JSON.parse(await readFile(target+'/design/layout-contract.json','utf8')),contract={...full,rules:full.rules.filter(r=>r.id.startsWith('calendar-'))},scope={widths:[296,320,390,1440],modes:['normal','text200','spacing'],states:['calendar-blank','calendar-range','calendar-error','calendar-footer','calendar-error-footer']};
assert.equal(contract.rules.length,7);await mkdir(out,{recursive:true});
const roles=[['#date-calendar-title',22,700],['#date-calendar .calendar-month-label',16,600],['#date-calendar .calendar-day',16,500],['#date-calendar .calendar-weekdays span',14,500],['#calendar-selection',14,500],['#calendar-apply,#calendar-cancel',16,600]].map(([selector,fontSizePx,fontWeight])=>({selector,fontSizePx,fontWeight,lineHeightRatio:1.5,families:['Noto Sans KR Thin'],requireCustomFont:true}));
try{for(const width of scope.widths)for(const mode of scope.modes)for(const state of scope.states){
  const f=await h.open({width}),p=f.page,name=`${width}-${mode}-${state}`;
  try{
    if(mode==='text200')await p.evaluate(()=>{const nodes=[...document.querySelectorAll('body,body *')],sizes=nodes.map(n=>parseFloat(getComputedStyle(n).fontSize));nodes.forEach((n,i)=>n.style.setProperty('font-size',sizes[i]*2+'px','important'));const style=document.createElement('style');style.textContent='#date-calendar .calendar-day,#date-calendar .calendar-month-title{font-size:32px!important}';document.head.append(style);});
    if(mode==='spacing')await p.addStyleTag({content:'body,body *{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}'});
    await p.locator('#open-search').click();if(!['calendar-range','calendar-footer'].includes(state)){await p.locator('#check-in').fill('');await p.locator('#check-out').fill('');}await p.locator('#open-search-calendar').click();
    if(state.includes('error')){await p.locator('[data-date="2026-10-16"]').click();await p.locator('[data-date="2026-11-14"]').click();assert.match(await p.locator('#calendar-error').innerText(),/28박/);}
    if(state.endsWith('footer')){await p.locator('#date-calendar [role=region][tabindex="0"]').focus();await p.keyboard.press('End');await p.waitForFunction(()=>{const r=document.getElementById('calendar-apply').getBoundingClientRect();return r.y>=0&&r.bottom<=innerHeight;});}
    const report=await inspectLayoutContract(p,contract,{state,mode});captures.push(report);
    const errorRole={selector:'#calendar-error',fontSizePx:14,fontWeight:500,lineHeightRatio:1.5,families:['Noto Sans KR Thin'],requireCustomFont:true};
    const fonts=await inspectFontRendering(p,{roles:state.includes('error')?[...roles,errorRole]:roles,textScale:mode==='text200'?2:1,...(mode==='spacing'?{lineHeightRatioOverride:1.5}:{})});
    await writeFile(out+'/'+name+'.json',JSON.stringify({report,fonts},null,2));await p.screenshot({path:out+'/'+name+'.png'});
    const fontIssues=fonts.issues||[];assert.deepEqual(f.errors,[]);checks.push({name,status:report.results.some(r=>r.status!=='PASS')||report.issues.some(r=>r.status==='FAIL')||fontIssues.length?'FAIL':'PASS',fontIssues,layoutIssues:report.issues,results:report.results.map(({id,status,detail})=>({id,status,detail}))});
  }catch(e){checks.push({name,status:'FAIL',detail:e.message});}finally{await f.context.close();}
}
const coverage=aggregateLayoutStates(contract,captures,scope);assert.deepEqual(await sourceBinding(target),h.sourceHashes);assert.deepEqual(await harnessBinding(),h.harnessHashes);
await writeFile(out+'/report.json',JSON.stringify({at:new Date().toISOString(),sourceHashes:h.sourceHashes,harnessHashes:h.harnessHashes,checkerSha256:createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex'),fullContractSha256:layoutContractFingerprint(full),scopedContract:contract,scope,checks,coverage,failures:checks.filter(r=>r.status==='FAIL').length,limitation:'Seven calendar relations and actual rendered fonts only. Existing79relations,full75catalog,deviceAT and native reference parity are separate and unapproved.'},null,2));console.log(JSON.stringify({captures:captures.length,failures:checks.filter(r=>r.status==='FAIL').length,coverage:coverage.status}));process.exitCode=checks.some(r=>r.status==='FAIL')||coverage.status!=='PASS'?1:0;
}finally{await h.close();}
