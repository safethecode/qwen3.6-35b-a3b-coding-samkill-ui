import{readFile,writeFile,readdir}from'node:fs/promises';
import{execFileSync}from'node:child_process';
import{resolve,dirname,join,relative}from'node:path';
import{fileURLToPath}from'node:url';
import{createHash}from'node:crypto';
import assert from'node:assert/strict';
const base=dirname(fileURLToPath(import.meta.url)),target=resolve(process.argv[2]);execFileSync(process.execPath,[resolve(base,'../focus-timer-model-20261015/materialize.mjs'),target],{stdio:'inherit'});await writeFile(resolve(target,'store.js'),await readFile(resolve(base,'source/store.js')),{flag:'wx'});const expected=JSON.parse(await readFile(resolve(base,'summary.json'),'utf8')).sourceHashes,actual={};const walk=async d=>{for(const e of await readdir(d,{withFileTypes:true})){const p=join(d,e.name);if(e.isDirectory())await walk(p);else actual[relative(target,p).replaceAll('\\','/')]=createHash('sha256').update(await readFile(p)).digest('hex')}};await walk(target);assert.deepEqual(actual,expected);console.log(Object.keys(actual).length+' exact source files materialized;browser/UI incomplete');
