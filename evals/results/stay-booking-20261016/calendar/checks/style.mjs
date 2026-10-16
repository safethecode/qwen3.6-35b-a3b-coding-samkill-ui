import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {resolve,sep} from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {inspectFontRendering} from '../../../../../scripts/font-rendering.mjs';
import {sourceBinding} from '../../../../../scripts/source-binding.mjs';
import {harnessBinding} from '../../../../../scripts/harness-binding.mjs';
import {createHash} from 'node:crypto';
const [folder,output]=process.argv.slice(2),root=resolve(folder),base=resolve(folder);
assert.ok(existsSync(root+'/calendar.css'),'Calendar CSS is not implemented');
const sourceHashes=await sourceBinding(root),harnessHashes=await harnessBinding(),shellSha256=createHash('sha256').update(await readFile(new URL('../fixtures/calendar-shell.html',import.meta.url))).digest('hex');
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH}),results=[];
const roles=[['#date-calendar-title',22,700],['#date-calendar .calendar-month-title',16,600],['#date-calendar .calendar-day',16,500],['#date-calendar .calendar-weekdays span',14,500],['#calendar-selection',14,500],['#calendar-apply,#calendar-cancel',16,600]].map(([selector,fontSizePx,fontWeight])=>({selector,fontSizePx,fontWeight,lineHeightRatio:1.5,families:['Noto Sans KR Thin'],requireCustomFont:true}));
try{
for(const width of [296,320,390,1440])for(const mode of ['normal','text200','spacing'])for(const state of ['blank','range','error']){
  const name=`${width}-${mode}-${state}`,page=await browser.newPage({viewport:{width,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
    await page.route('http://calendar.test/**',async route=>{
      const file=new URL(route.request().url()).pathname.slice(1);
      if(!file)return route.fulfill({contentType:'text/html',body:await readFile(new URL('../fixtures/calendar-shell.html',import.meta.url))});
      let path=resolve(root,file);if(!path.startsWith(root+sep))return route.fulfill({status:404});
      if(!existsSync(path))path=resolve(base,file);
      if((!path.startsWith(base+sep)&&!path.startsWith(root+sep))||!existsSync(path))return route.fulfill({status:404});
      await route.fulfill({contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':'application/octet-stream',body:await readFile(path)});
    });
    await page.goto('http://calendar.test/');await page.waitForFunction(()=>Boolean(window.calendar));
    if(mode==='text200')await page.evaluate(()=>{
      const elements=[...document.querySelectorAll('#date-calendar,#date-calendar *')],sizes=elements.map(n=>parseFloat(getComputedStyle(n).fontSize));
      elements.forEach((n,i)=>n.style.setProperty('font-size',sizes[i]*2+'px','important'));
      const style=document.createElement('style');style.textContent='#date-calendar .calendar-day{font-size:32px!important}#date-calendar .calendar-month-title{font-size:32px!important}';document.head.append(style);
    });
    if(mode==='spacing')await page.addStyleTag({content:'#date-calendar,#date-calendar *{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}#date-calendar p{margin-bottom:2em!important}'});
    if(state!=='range')await page.evaluate(()=>{document.getElementById('sample-start').value='';document.getElementById('sample-end').value='';});
    await page.locator('#open-calendar').click();await page.evaluate(()=>document.fonts.ready);
    if(state==='error'){await page.locator('[data-date="2026-10-16"]').click();await page.locator('[data-date="2026-11-14"]').click();assert.match(await page.locator('#calendar-error').innerText(),/28박/);assert.equal(await page.locator('#calendar-error').isVisible(),true);}
    const geometry=await page.evaluate(()=>{
      const rect=n=>{const r=n.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom};},dialog=document.getElementById('date-calendar'),scroll=document.getElementById('calendar-months'),buttons=[...dialog.querySelectorAll('.calendar-day')];
      return{viewport:{w:innerWidth,h:innerHeight},dialog:rect(dialog),scroll:{...rect(scroll),width:scroll.clientWidth,scrollWidth:scroll.scrollWidth,height:scroll.clientHeight,scrollHeight:scroll.scrollHeight},header:rect(dialog.querySelector('.calendar-header')),footer:rect(dialog.querySelector('.calendar-footer')),week:[...dialog.querySelectorAll('.calendar-weekdays span')].map(rect),days:buttons.map(n=>{const range=document.createRange();range.selectNodeContents(n);return{date:n.dataset.date,box:rect(n),text:rect(range),cell:rect(n.parentElement),font:getComputedStyle(n).fontSize};}),tables:[...dialog.querySelectorAll('table')].map(rect),selected:buttons.filter(n=>n.dataset.selected).map(n=>({date:n.dataset.date,background:getComputedStyle(n).backgroundColor,color:getComputedStyle(n).color})),separators:dialog.querySelectorAll('hr').length};
    });
    await writeFile(output+'/'+name+'-geometry.json',JSON.stringify(geometry,null,2));
    const errorRole={selector:'#calendar-error',fontSizePx:14,fontWeight:500,lineHeightRatio:1.5,families:['Noto Sans KR Thin'],requireCustomFont:true};
    const fonts=await inspectFontRendering(page,{roles:state==='error'?[...roles,errorRole]:roles,textScale:mode==='text200'?2:1,...(mode==='spacing'?{lineHeightRatioOverride:1.5}:{})});
    await writeFile(output+'/'+name+'-fonts.json',JSON.stringify(fonts,null,2));
    const issues=[];
    if(geometry.dialog.w>390.5||geometry.dialog.x<-.5||geometry.dialog.right>width+.5||geometry.dialog.y<-.5||geometry.dialog.bottom>900.5)issues.push('Dialog leaves mobile viewport bounds');
    if(geometry.scroll.scrollWidth>geometry.scroll.width+1)issues.push('Month stack has horizontal overflow');
    if(geometry.scroll.h<44)issues.push('Date stack has no reachable row');
    if(geometry.scroll.y<geometry.dialog.y-.5||geometry.scroll.bottom>geometry.dialog.bottom+.5)issues.push('Month scroller leaves dialog bounds');
    if(geometry.footer.y<geometry.dialog.y-.5||geometry.footer.bottom>geometry.dialog.bottom+.5)issues.push('Footer is not visible inside dialog');
    if(geometry.separators)issues.push('Decorative separators present');
    if(geometry.footer.y<geometry.scroll.bottom-1||geometry.header.bottom>geometry.scroll.y+1)issues.push('Header/footer overlaps scroll stack');
    for(const d of geometry.days){
      if(d.box.w<24||d.box.h<44)issues.push(d.date+' target below contract');
      if(d.text.w>d.box.w+1||d.text.h>d.box.h+1)issues.push(d.date+' text exceeds target');
      if(d.box.x<d.cell.x-.5||d.box.right>d.cell.right+.5)issues.push(d.date+' target exceeds cell');
    }
    const firstRow=geometry.days.filter(d=>d.date.startsWith('2026-11-')&&Number(d.date.slice(-2))<=7);
    if(firstRow.length===7)for(let i=0;i<7;i++)if(Math.abs((firstRow[i].box.x+firstRow[i].box.w/2)-(geometry.week[i].x+geometry.week[i].w/2))>1)issues.push('Weekday/day column mismatch '+i);
    issues.push(...fonts.issues.map(x=>x.status+':'+x.problem));
    if(geometry.selected.some(x=>x.background==='rgba(0, 0, 0, 0)'||x.color!=='rgb(255, 255, 255)'))issues.push('Selected endpoint surface/foreground missing');
    await page.screenshot({path:output+'/'+name+'.png'});
    const last=page.locator('#date-calendar .calendar-day:not(:disabled)').last();await last.focus();
    const reachable=await last.evaluate(n=>{const r=n.getBoundingClientRect(),s=document.getElementById('calendar-months').getBoundingClientRect();return r.top>=s.top-.5&&r.bottom<=s.bottom+.5;});
    if(!reachable)issues.push('Last date is not reachable within month scroller');
    await page.locator('#calendar-cancel').click();assert.equal(await page.evaluate(()=>document.activeElement.id),'open-calendar');assert.deepEqual(errors,[]);
    results.push({name,width,mode,state,status:issues.length?'FAIL':'PASS',issues});
  }catch(e){results.push({name,width,mode,state,status:'FAIL',issues:[e.message]});}finally{await page.close();}
}
assert.deepEqual(await sourceBinding(root),sourceHashes);assert.deepEqual(await harnessBinding(),harnessHashes);assert.equal(createHash('sha256').update(await readFile(new URL('../fixtures/calendar-shell.html',import.meta.url))).digest('hex'),shellSha256);
await writeFile(output+'/report.json',JSON.stringify({at:new Date().toISOString(),sourceHashes,harnessHashes,shellSha256,checkerSha256:createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex'),results,failures:results.filter(x=>x.status==='FAIL').length,scope:'Isolated rendered component geometry, actual fonts, exact roles, stress and reachability; native visual judgment, integration, device and AT execution remain separate'},null,2));
console.log(JSON.stringify({captures:results.length,failures:results.filter(x=>x.status==='FAIL').length}));process.exitCode=results.some(x=>x.status==='FAIL')?1:0;
}finally{await browser.close();}
