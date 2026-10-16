import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {generateComponents} from '../scripts/generate-components.mjs';

const output={html:'<h2 data-ui-unit="A">Heading</h2>',css:'[data-ui-unit="A"]{font-size:20px}'};
async function fixture(fixed){
  const root=await mkdtemp(join(tmpdir(),'qwen-retry-')),target=join(root,'source');
  await mkdir(join(target,'design'),{recursive:true});
  for(const [file,value] of Object.entries({'DESIGN.md':'Mobile heading.','REFERENCE.md':'Inspected fixture.','design/typography.json':JSON.stringify({roles:[{selector:'h2',families:['Arial']}]}),'design/component-plan.json':JSON.stringify({shared:'Keep the heading role.',sharedCss:'',reference:{status:'inspected',source:'fixture'},assembly:'{{A}}',elements:[{id:'A',prompt:'One heading.',assets:[],sample:'{{A}}',...(fixed?{html:output.html}:{})}]})}))await writeFile(join(target,file),value);
  return{target,evidence:join(root,'evidence')};
}
for(const mode of ['scope','json','truncated','transport'])for(const fixed of [false,true])test(`component retry preserves its full original prefix after ${mode}, fixed=${fixed}`,async()=>{
  const{target,evidence}=await fixture(fixed),requests=[];
  const rejected=mode==='json'?'Malformed JSON output':JSON.stringify({...(!fixed?{html:output.html}:{}),css:'body{color:red}'});
  await generateComponents(target,evidence,{fetcher:async(_url,options)=>{
    const request=JSON.parse(options.body);requests.push(request);
    if(requests.length===1){
      if(mode==='transport')throw Error('Injected transport failure');
      return{ok:true,json:async()=>({done_reason:mode==='truncated'?'length':'stop',message:{role:'assistant',content:rejected}})};
    }
    assert.deepEqual(request.messages.slice(0,requests[0].messages.length),requests[0].messages);
    assert.deepEqual(request.format,requests[0].format);
    assert.deepEqual(request.options,requests[0].options);
    const tail=request.messages.slice(requests[0].messages.length);
    if(mode==='transport')assert.deepEqual(tail.map(m=>m.role),['user']);
    else{assert.deepEqual(tail.map(m=>m.role),['assistant','user']);assert.equal(tail[0].content,rejected);}
    assert.match(tail.at(-1).content,/VALIDATION FAILURE/);
    assert.match(tail.at(-1).content,/untrusted/i);
    assert.match(request.messages[1].content,/GENERATION GUIDE \.\.\/decomposed-layout.md/);
    return{ok:true,json:async()=>({done_reason:'stop',message:{content:JSON.stringify(fixed?{css:output.css}:output)}})};
  }});
  assert.equal(requests.length,2);
  assert.match(await readFile(join(target,'index.html'),'utf8'),/Heading/);
});
