import{readFile,writeFile,readdir}from'node:fs/promises';
import{execFileSync}from'node:child_process';
import{resolve,dirname,relative,join}from'node:path';
import{fileURLToPath}from'node:url';
import{createHash}from'node:crypto';
import assert from'node:assert/strict';
const base=dirname(fileURLToPath(import.meta.url)),[label,targetArg]=process.argv.slice(2);assert.ok(/^draft-(2|0)\/focal-[12]$/.test(label));const target=resolve(targetArg);execFileSync(process.execPath,[resolve(base,'../focus-timer-model-20261015/materialize.mjs'),target],{stdio:'inherit'});await writeFile(resolve(target,'store.js'),await readFile(resolve(base,label,'store.js')),{flag:'wx'});const expected=JSON.parse(await readFile(resolve(base,label,'revalidation/result.json'),'utf8')).sourceHashes,actual={};const walk=async d=>{for(const e of await readdir(d,{withFileTypes:true})){const p=join(d,e.name);if(e.isDirectory())await walk(p);else actual[relative(target,p).replaceAll('\\','/')]=createHash('sha256').update(await readFile(p)).digest('hex')}};await walk(target);assert.deepEqual(actual,expected);console.log('Exact focal source materialized;expected semantic failure,not current timer candidate');
