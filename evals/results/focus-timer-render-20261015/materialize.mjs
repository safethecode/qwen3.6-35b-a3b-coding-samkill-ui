import{readFile,writeFile,readdir}from'node:fs/promises';
import{execFileSync}from'node:child_process';
import{resolve,dirname,join,relative}from'node:path';
import{fileURLToPath}from'node:url';
import{createHash}from'node:crypto';
import assert from'node:assert/strict';
const base=dirname(fileURLToPath(import.meta.url)),target=resolve(process.argv[2]);execFileSync(process.execPath,[resolve(base,'../focus-timer-store-20261015/materialize.mjs'),target],{stdio:'inherit'});
for(const f of["render.js","render-dom.js","render-time.js","render-actions.js","render-config.js","render-errors.js","runtime-dom.js","error-copy.js","error-message.js","DESIGN.md","design/component-plan.json"])await writeFile(resolve(target,f),await readFile(resolve(base,'source',f)));
const expected=JSON.parse(await readFile(resolve(base,'summary.json'),'utf8')).sourceHashes,actual={};const walk=async d=>{for(const e of await readdir(d,{withFileTypes:true})){const p=join(d,e.name);if(e.isDirectory())await walk(p);else actual[relative(target,p).replaceAll('\\','/')]=createHash('sha256').update(await readFile(p)).digest('hex')}};await walk(target);assert.deepEqual(actual,expected);console.log(Object.keys(actual).length+' exact source files;controller/CSS incomplete');
