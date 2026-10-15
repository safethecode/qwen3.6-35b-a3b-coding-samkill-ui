import{readFile,mkdir}from'node:fs/promises';
import{fileURLToPath}from'node:url';
import{dirname,resolve}from'node:path';
import{createHash}from'node:crypto';
import{execFileSync}from'node:child_process';
import assert from'node:assert/strict';
const base=dirname(fileURLToPath(import.meta.url)),out=resolve(process.argv[2]||'runs/stay-domain-replay');assert.ok(!out.startsWith(base));await mkdir(out);const index=JSON.parse(await readFile(resolve(base,'file-index.json'),'utf8'));for(const f of index.files)assert.equal(createHash('sha256').update(await readFile(resolve(base,f.path))).digest('hex'),f.sha256,f.path);for(const name of['dates','query']){const args=[resolve(base,'contracts-and-checks/check-'+name+'.mjs'),resolve(base,'source/'+name+'.js')];if(name==='query')args.push(resolve(base,'source/catalog.json'));args.push(resolve(out,name));execFileSync(process.execPath,args,{stdio:'inherit',windowsHide:true})}console.log('Exact dependency checks completed;no UI/reference approval');
