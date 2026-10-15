import{readFile,writeFile,mkdir}from'node:fs/promises';
import{resolve,dirname}from'node:path';
import{fileURLToPath}from'node:url';
import{execFileSync}from'node:child_process';
import assert from'node:assert/strict';
const base=dirname(fileURLToPath(import.meta.url)),repo=resolve(base,'../../..'),target=resolve(process.argv[2]),driver=resolve(process.argv[3]);assert.equal(dirname(driver),resolve(repo,'runs'));assert.notEqual(driver,target);await mkdir(driver);for(const n of['browser-harness.mjs','check-behavior.mjs'])await writeFile(resolve(driver,n),await readFile(resolve(base,n)),{flag:'wx'});execFileSync(process.execPath,[resolve(driver,'check-behavior.mjs'),target,resolve(driver,'checks')],{stdio:'inherit',env:process.env});
