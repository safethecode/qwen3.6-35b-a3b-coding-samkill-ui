import test from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {inspectLayoutContract} from '../scripts/layout-contract.mjs';

test('textGap measures sibling text separation instead of accepting per-control fit',async()=>{
  const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});
  try{
    const page=await browser.newPage();
    const measure=async(html,rule={})=>{await page.setContent('<style>body{margin:0;font:16px/1.5 monospace}#grid{width:400px}.row{display:flex;gap:8px}span{display:block}button{font:inherit;border:0;padding:0}</style>'+html);return inspectLayoutContract(page,{rules:[{id:'gap',kind:'textGap',subject:'#grid',groups:'.row',text:'span',axis:'inline',minimum:8,...rule}]});};
    let report=await measure('<div id="grid"><div class="row"><span>10</span><span>11</span><span>12</span></div></div>');
    assert.equal(report.results[0].status,'PASS');assert.equal(report.results[0].observed.pairCount,3);
    report=await measure('<div id="grid"><div class="row" style="gap:0"><span>10</span><span>11</span><span>12</span></div></div>');
    assert.equal(report.results[0].status,'FAIL');assert.match(report.results[0].detail,/gap|separat/i);
    report=await measure('<div id="grid"><div class="row" style="font-size:32px;gap:0"><span>10</span><span>11</span></div></div>');assert.equal(report.results[0].status,'FAIL');
    report=await measure('<div id="grid"><div class="row" style="flex-direction:column;align-items:start;gap:8px"><span>10</span><span>17</span><span>24</span></div></div>',{axis:'block'});assert.equal(report.results[0].status,'PASS');
    report=await measure('<div id="grid"><div class="row" style="flex-direction:column;align-items:start;gap:0"><span>10</span><span>17</span></div></div>',{axis:'block'});assert.equal(report.results[0].status,'FAIL');
    report=await measure('<div id="grid"><div class="row" style="direction:rtl"><span>10</span><span>11</span><span>12</span></div></div>');assert.equal(report.results[0].status,'PASS');
    report=await measure('<div id="grid"><div class="row"><span>10</span></div></div>');assert.equal(report.results[0].status,'UNVERIFIED');
    report=await measure('<div id="grid"><div class="row"><span>10</span><span style="display:none">11</span></div></div>');assert.equal(report.results[0].status,'UNVERIFIED');
    report=await measure('<div id="grid"><div class="row"><span><b>10</b></span><span>11</span></div></div>');assert.equal(report.results[0].status,'UNVERIFIED');
    report=await measure('<div id="grid"><div class="row"><span>10</span><span>11</span></div></div>',{minimum:-1});assert.equal(report.results[0].status,'FAIL');
    report=await measure('<div id="grid"><div class="row"><span>10</span><span>11</span></div></div>',{axis:'diagonal'});assert.equal(report.results[0].status,'FAIL');
    const dates=width=>'<div id="grid" style="width:'+width+'px"><div class="row" style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:0">'+[10,11,12,13,14,15,16].map(day=>'<button style="font:32px/1.5 Arial,sans-serif;min-width:0">'+day+'</button>').join('')+'</div></div>';
    report=await measure(dates(256),{text:'button'});assert.equal(report.results[0].status,'FAIL');
    assert.equal(await page.locator('button').evaluateAll(nodes=>nodes.every(n=>{const r=document.createRange();r.selectNodeContents(n);return r.getBoundingClientRect().width<=n.getBoundingClientRect().width;})),true);
    report=await measure(dates(368),{text:'button'});assert.equal(report.results[0].status,'PASS');assert.equal(await page.locator('button').first().evaluate(n=>getComputedStyle(n).fontSize),'32px');
    report=await measure('<div id="grid"><div class="row" style="scale:1.1"><span>10</span><span>11</span></div></div>');assert.equal(report.results[0].status,'UNVERIFIED');
    report=await measure('<section style="transform:scale(1.1)"><div id="grid"><div class="row"><span>10</span><span>11</span></div></div></section>');assert.equal(report.results[0].status,'UNVERIFIED');
    for(const pseudo of['before','after']){
      report=await measure('<style>.row span::'+pseudo+'{content:"extra";position:absolute}</style><div id="grid"><div class="row"><span>10</span><span>11</span></div></div>');assert.equal(report.results[0].status,'UNVERIFIED');
    }
    report=await measure('<style>section::after{content:"extra";position:absolute}</style><section><div id="grid"><div class="row"><span>10</span><span>11</span></div></div></section>');assert.equal(report.results[0].status,'UNVERIFIED');
  }finally{await browser.close();}
});
