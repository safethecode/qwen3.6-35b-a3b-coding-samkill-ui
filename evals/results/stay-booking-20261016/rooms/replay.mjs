import{spawnSync}from'node:child_process';
import{mkdir}from'node:fs/promises';
import{fileURLToPath}from'node:url';
import{resolve}from'node:path';
const work=process.argv[2];if(!work)throw Error('Pass a new reportdirectory');await mkdir(work);const p=v=>fileURLToPath(new URL(v,import.meta.url));for(const[script,name]of[['check-room-workflows-v3.mjs','connected'],['check-core-workflows-b2.mjs','b1-regression'],['check-room-renderer-v3.mjs','renderer'],['check-room-sheet-words.mjs','short-word']]){const r=spawnSync(process.execPath,[p('./'+script),p('./source'),resolve(work,name)],{stdio:'inherit',windowsHide:true});if(r.status!==0){process.exitCode=r.status??1;break}}
