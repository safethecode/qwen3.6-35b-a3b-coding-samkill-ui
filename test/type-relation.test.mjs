import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { inspectLayoutContract } from '../scripts/layout-contract.mjs';
import { readFile } from 'node:fs/promises';
const relation={id:'task-card-emphasis',kind:'typeRelation',subject:'#task',reference:'#card',minSizeRatio:1,maxSizeRatio:1,minWeightDifference:0,maxWeightDifference:0};
async function fixture(run){const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});try{const page=await browser.newPage();await page.setContent('<style>h1,h2{font:600 18px/1.5 sans-serif;margin:0}</style><h1 id="task">객실 선택</h1><h2 id="card">스탠더드 더블</h2>');await run(page);}finally{await browser.close();}}
const inspect=async(page,rule=relation)=>(await inspectLayoutContract(page,{rules:[rule]})).results[0];
test('relative typography measures equal roles and rejects an overemphasized task heading',async()=>fixture(async page=>{
  assert.equal((await inspect(page)).status,'PASS');await page.locator('#task').evaluate(n=>{n.style.fontSize='22px';n.style.fontWeight='700';});const bad=await inspect(page);assert.equal(bad.status,'FAIL');assert.equal(bad.observed.typography.sizeRatio,22/18);assert.equal(bad.observed.typography.weightDifference,100);
  await page.locator('#task').evaluate(n=>{n.style.fontSize='18px';n.style.fontWeight='600';});assert.equal((await inspect(page)).status,'PASS');
}));
test('relative typography preserves real enlargement and cannot approve mixed or scaled owners',async()=>fixture(async page=>{
  await page.locator('h1,h2').evaluateAll(nodes=>nodes.forEach(n=>n.style.fontSize='36px'));assert.equal((await inspect(page)).status,'PASS');await page.locator('#card').evaluate(n=>n.style.fontSize='18px');assert.equal((await inspect(page)).status,'FAIL');
  await page.locator('#card').evaluate(n=>n.style.fontSize='36px');await page.locator('#task').evaluate(n=>n.innerHTML='<span style="font-size:48px">객실</span> 선택');assert.equal((await inspect(page)).status,'UNVERIFIED');await page.locator('#task').evaluate(n=>{n.textContent='객실 선택';n.style.transform='scale(1.2)';});assert.equal((await inspect(page)).status,'UNVERIFIED');
}));
test('relative typography fails closed for invalid bounds, ambiguous owners and tautologies',async()=>fixture(async page=>{
  for(const patch of [{minSizeRatio:0},{minSizeRatio:2,maxSizeRatio:1},{maxSizeRatio:'1'},{minWeightDifference:1},{maxWeightDifference:Infinity},{reference:'#absent'},{reference:'#task'},{subject:'h1,h2'}])assert.equal((await inspect(page,{...relation,...patch})).status,'FAIL',JSON.stringify(patch));
  await page.locator('#card').evaluate(n=>n.hidden=true);assert.equal((await inspect(page)).status,'FAIL');
}));
test('the installed API example can be retrieved and executed against actual text owners',async()=>fixture(async page=>{
  const guide=await readFile(new URL('../skills/qwen-samkill-ui/references/layout-contract-api.md',import.meta.url),'utf8');const match=guide.match(/```json\s+([\s\S]+?)\s+```/);assert.ok(match,'A complete retrievable relationship example is required');const rule=JSON.parse(match[1]);assert.equal(rule.kind,'typeRelation');assert.equal((await inspect(page,rule)).status,'PASS');
}));
test('relative typography cannot compare an ancestor with the same contained reference text',async()=>fixture(async page=>{
  await page.locator('#card').evaluate(n=>{const wrapper=document.createElement('div');wrapper.id='wrapper';wrapper.style.font='600 18px/1.5 sans-serif';n.before(wrapper);wrapper.append(n);});assert.equal((await inspect(page,{...relation,subject:'#wrapper'})).status,'FAIL');
}));
test('generated pseudo text is unknown instead of a uniform owner pass',async()=>fixture(async page=>{
  await page.addStyleTag({content:'#task::before{content:"강한 제목";font-size:72px;font-weight:900}'});assert.equal((await inspect(page)).status,'UNVERIFIED');
}));
test('individual CSS rotation is unknown even when the transform shorthand is none',async()=>fixture(async page=>{
  await page.locator('#task').evaluate(n=>n.style.rotate='45deg');assert.equal((await inspect(page)).status,'UNVERIFIED');
}));
for(const pseudo of ['first-letter','first-line'])test('pseudo '+pseudo+' typography cannot pass from the parent metric',async()=>fixture(async page=>{
  await page.addStyleTag({content:'#task::'+pseudo+'{font-size:72px;font-weight:900}'});assert.equal((await inspect(page)).status,'UNVERIFIED');
}));
test('weight-only limits and intentional negative differences are enforced independently of size',async()=>fixture(async page=>{
  await page.locator('#task').evaluate(n=>n.style.fontWeight='700');assert.equal((await inspect(page)).status,'FAIL');await page.locator('#task').evaluate(n=>n.style.fontWeight='500');assert.equal((await inspect(page,{...relation,minWeightDifference:-100,maxWeightDifference:-100})).status,'PASS');assert.equal((await inspect(page,{...relation,maxWeightDifference:undefined})).status,'FAIL');
}));
