import{readFile,writeFile,mkdir,cp}from'node:fs/promises';
import{fileURLToPath}from'node:url';
import{resolve}from'node:path';
import{spawnSync}from'node:child_process';
import assert from'node:assert/strict';
import{sourceBinding}from'../../../../scripts/source-binding.mjs';
const work=process.argv[2];if(!work)throw Error('Pass a new workdirectory');await mkdir(work);const here=fileURLToPath(new URL('.',import.meta.url)),base=fileURLToPath(new URL('../core/source',import.meta.url));for(const name of['before','after']){const target=resolve(work,name+'-source');await cp(base,target,{recursive:true,errorOnExist:true,force:false});if(name==='before'){await cp(here+'local-css-repair/before-styles.css.txt',target+'/styles.css');await cp(here+'local-css-repair/before-component-plan.json',target+'/design/component-plan.json')}const expected=JSON.parse(await readFile(here+name+'-historical-report.json','utf8')).sourceHashes;assert.deepEqual(await sourceBinding(target),expected);const r=spawnSync(process.execPath,[here+'check-nav-paint.mjs',resolve(work,name+'-report'),target],{stdio:'inherit',windowsHide:true});assert.equal(r.status,name==='before'?1:0)}console.log('Exact before source reproduces requests-nav interception; after source has owned hits and no favorite mutation. No visual parity claim.');
