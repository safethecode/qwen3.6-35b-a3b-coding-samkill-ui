import{readFile,writeFile,mkdir}from'node:fs/promises';
import{resolve,dirname}from'node:path';
import{fileURLToPath}from'node:url';
import{execFileSync}from'node:child_process';
import assert from'node:assert/strict';
const base=dirname(fileURLToPath(import.meta.url)),repo=resolve(base,'../../..'),target=resolve(process.argv[2]),driver=resolve(process.argv[3]);assert.equal(dirname(driver),resolve(repo,'runs'),'Driver must be a new direct child of repository runs/');assert.notEqual(driver,target);await mkdir(driver);
for(const name of['browser-harness.mjs','check-render.mjs'])await writeFile(resolve(driver,name),await readFile(resolve(base,name)),{flag:'wx'});
execFileSync(process.execPath,[resolve(driver,'check-render.mjs'),target,resolve(driver,'checks')],{stdio:'inherit',env:process.env});
