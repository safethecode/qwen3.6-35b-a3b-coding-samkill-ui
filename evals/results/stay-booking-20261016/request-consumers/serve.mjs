import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { extname } from 'node:path';
const root=new URL('./source/',import.meta.url),files=new Set();
async function inventory(dir=''){for(const entry of await readdir(new URL(dir,root),{withFileTypes:true})){const path=dir+entry.name;if(entry.isDirectory())await inventory(path+'/');else files.add(path);}}
await inventory();
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;const key=decodeURIComponent(pathname.slice(1)||'index.html');if(!files.has(key))throw Error('Unknown resource');res.setHeader('cache-control','no-store');res.setHeader('content-type',({'.html':'text/html;charset=utf-8','.js':'text/javascript;charset=utf-8','.css':'text/css;charset=utf-8','.json':'application/json;charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.ttf':'font/ttf'})[extname(key)]||'application/octet-stream');res.end(await readFile(new URL(key,root)));}catch{res.writeHead(404).end();}});
const port=Number(process.argv[2]||0);if(!Number.isInteger(port)||port<0||port>65535)throw Error('Expected port0–65535');
server.listen(port,'127.0.0.1',()=>console.log('http://127.0.0.1:'+server.address().port+'/#browse'));
