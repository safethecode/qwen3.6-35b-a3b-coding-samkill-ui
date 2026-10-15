import{readFile,writeFile,mkdir,copyFile}from'node:fs/promises';
import{resolve,dirname}from'node:path';
import{fileURLToPath}from'node:url';
import{createHash}from'node:crypto';
import assert from'node:assert/strict';
const base=dirname(fileURLToPath(import.meta.url)),repo=resolve(base,'../../..'),target=resolve(process.argv[2]);assert.ok(target!==base&&!target.startsWith(base+'/'));const summary=JSON.parse(await readFile(resolve(base,'summary.json'),'utf8')),reuse=JSON.parse(await readFile(resolve(base,'asset-reuse.json'),'utf8'));await mkdir(target);for(const[p,h]of Object.entries(summary.sourceHashes)){const entry=reuse.entries.find(e=>e.artifactPath==='source/'+p),from=entry?resolve(repo,entry.repositoryPath):resolve(base,'source',p),bytes=await readFile(from);assert.equal(createHash('sha256').update(bytes).digest('hex'),h,p);await mkdir(dirname(resolve(target,p)),{recursive:true});await writeFile(resolve(target,p),bytes,{flag:'wx'})}console.log(Object.keys(summary.sourceHashes).length+' exact source files materialized;model-only study,UI incomplete');
