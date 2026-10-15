import {cp,readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import assert from 'node:assert/strict';
import {parse} from 'acorn';
import {sourceBinding} from '../../scripts/source-binding.mjs';
const root='runs/focus-timer-transfer-20261015',out=root+'/unit-app/first-diagnostic',target=out+'/source';
await mkdir(out);
const inputHashes=await sourceBinding(root+'/source');
await cp(root+'/source',target,{recursive:true,errorOnExist:true,force:false});
const raw=await readFile(root+'/unit-app/raw-module.js.txt','utf8'),ast=parse(raw,{ecmaVersion:'latest',sourceType:'module'}),mutations=[],regexMatches=[];
function walk(n){if(!n||typeof n!=='object')return;if(n.type==='AssignmentExpression'&&n.left.type==='MemberExpression')mutations.push(raw.slice(n.start,n.end));if(n.type==='CallExpression'&&n.callee.type==='MemberExpression'&&['setAttribute','removeAttribute'].includes(n.callee.property.name))mutations.push(raw.slice(n.start,n.end));for(const v of Object.values(n))if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v)}walk(ast);
for(const m of raw.matchAll(/\.textContent\s*=|\.hidden\s*=/g))regexMatches.push({index:m.index,excerpt:raw.slice(m.index,m.index+40)});
await writeFile(target+'/app.js',raw,{flag:'wx'});
await writeFile(out+'/diagnosis.json',JSON.stringify({status:'FAILED_SPECIMEN_DIAGNOSTIC_ONLY',inputHashes,regexMatches,actualAssignmentsAndAttributeMutations:mutations,assistance:'Host copies unchanged rejected raw module into an isolated full source for diagnostics. Original source/driver/contract and rejection remain unchanged. Regex incorrectly catches hidden===false reads;actual disabled/aria-invalid mutations still violate renderer ownership. Behavior replay is not acceptance.'},null,2));
try{const r=await promisify(execFile)(process.execPath,[root+'/check-behavior.mjs',target,out+'/checks'],{windowsHide:true,timeout:180000,env:{...process.env,CHROME_PATH:'C:/Program Files/Google/Chrome/Application/chrome.exe'}});console.log(r.stdout)}catch(e){console.log(e.stdout);process.exitCode=1}
assert.deepEqual(await sourceBinding(root+'/source'),inputHashes);
