import{spawnSync}from'node:child_process';
import{fileURLToPath}from'node:url';
const out=process.argv[2];if(!out)throw Error('Pass a new reportdirectory');const p=v=>fileURLToPath(new URL(v,import.meta.url)),r=spawnSync(process.execPath,[p('./check-room-rates.mjs'),p('./source/room-rates.js'),p('./source/catalog.json'),out],{stdio:'inherit',windowsHide:true});process.exitCode=r.status??1;
