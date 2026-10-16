import{readFile,writeFile}from'node:fs/promises';
import{resolve}from'node:path';
import{pathToFileURL}from'node:url';
import assert from'node:assert/strict';
const[folder,out]=process.argv.slice(2),file=resolve(folder,'calendar-focus.js');
const{resolveCalendarFocus}=await import(pathToFileURL(file));
const today='2026-10-16',cases=[
['2026-11-06','ArrowLeft',false,'2026-11-05'],['2026-11-06','ArrowRight',false,'2026-11-07'],['2026-11-06','ArrowUp',false,'2026-10-30'],['2026-11-06','ArrowDown',false,'2026-11-13'],['2026-11-14','Home',false,'2026-11-08'],['2026-11-08','End',false,'2026-11-14'],
['2026-12-31','ArrowRight',false,'2027-01-01'],['2027-01-01','ArrowLeft',false,'2026-12-31'],['2027-01-31','PageDown',false,'2027-02-28'],['2028-01-31','PageDown',false,'2028-02-29'],['2028-03-31','PageUp',false,'2028-02-29'],['2028-02-29','PageUp',true,'2027-02-28'],['2028-02-29','PageDown',true,'2029-02-28'],['2026-11-14','PageDown',true,'2027-11-14'],
['2026-10-16','ArrowLeft',false,today],['2026-10-16','ArrowUp',false,today],['2026-10-16','PageUp',false,today],['2026-10-16','Home',false,today],['2099-12-31','ArrowRight',false,'2099-12-31'],['2099-12-31','PageDown',false,'2099-12-31'],['2099-12-01','PageDown',true,'2099-12-31'],['2026-11-06','Enter',false,null],['2026-11-06',' ',false,null],['2026-11-06','Tab',false,null]
];
const checks=[];for(const[date,key,shift,expected]of cases){let actual;try{actual=resolveCalendarFocus(date,key,shift,today);assert.equal(actual,expected);checks.push({date,key,shift,expected,actual,status:'PASS'});}catch(e){checks.push({date,key,shift,expected,actual,status:'FAIL',detail:e.message});}}
await writeFile(out,JSON.stringify({at:new Date().toISOString(),checks,failures:checks.filter(x=>x.status==='FAIL').length},null,2));console.log(JSON.stringify({groups:checks.length,failures:checks.filter(x=>x.status==='FAIL').length}));process.exitCode=checks.some(x=>x.status==='FAIL')?1:0;
