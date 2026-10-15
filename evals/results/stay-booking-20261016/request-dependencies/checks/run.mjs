import { mkdir, readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';
import assert from 'node:assert/strict';
const run=promisify(execFile),root=fileURLToPath(new URL('../',import.meta.url)),target=join(root,'source'),out=resolve(process.argv[2]||join(root,'check-results'));
await mkdir(out,{recursive:true});let total=0;
for(const name of ['stored-quote','request-store','request-reducer','request-storage']){
  await run(process.execPath,[join(root,'checks','check-'+name+'.mjs'),target,join(out,name)],{windowsHide:true});
  const report=JSON.parse(await readFile(join(out,name,'report.json'),'utf8'));assert.equal(report.pass,report.total);assert.ok(report.rows.every(r=>r.pass));total+=report.total;console.log(name+': '+report.pass+'/'+report.total);
}
console.log('Scoped dependency groups: '+total+'/'+total+'; not UI or reference-quality approval');
