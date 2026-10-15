import{spawnSync}from'node:child_process';
import{fileURLToPath}from'node:url';
const out=process.argv[2];if(!out)throw Error('Pass a new report directory');const p=path=>fileURLToPath(new URL(path,import.meta.url)),result=spawnSync(process.execPath,[p('./check-quote.mjs'),p('./source/quote.js'),p('./source/catalog.json'),out],{stdio:'inherit',windowsHide:true});process.exitCode=result.status??1;
