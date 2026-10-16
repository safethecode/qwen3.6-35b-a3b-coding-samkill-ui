import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {dirname,join} from 'node:path';
import {mkdtemp,writeFile,readFile,unlink,rmdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import {deflateSync} from 'node:zlib';
import {sampleRasterPng} from '../scripts/raster-samples.mjs';

const require=createRequire(import.meta.url),{PNG}=require(join(dirname(require.resolve('playwright-core/package.json')),'lib/utilsBundle.js'));
const hash=x=>createHash('sha256').update(x).digest('hex');
function fixture(){const png=new PNG({width:3,height:2});png.data.set([255,255,255,255,245,245,245,255,31,44,59,0,30,128,255,255,255,255,255,255,200,12,45,128]);return PNG.sync.write(png);}
function chunk(type,data,corrupt=false){const body=Buffer.concat([Buffer.from(type),data]),result=Buffer.alloc(data.length+12);result.writeUInt32BE(data.length,0);body.copy(result,4);let crc=0xffffffff;for(const byte of body){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}result.writeUInt32BE(((crc^0xffffffff)^(corrupt?1:0))>>>0,result.length-4);return result;}
function customPng({depth=8,type=6,interlace=0,raw=Buffer.from([0,31,44,59,0]),extra=[],tail=[]}={}){const header=Buffer.alloc(13);header.writeUInt32BE(1,0);header.writeUInt32BE(1,4);header[8]=depth;header[9]=type;header[12]=interlace;return Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',header),...extra,chunk('IDAT',deflateSync(raw)),...tail,chunk('IEND',Buffer.alloc(0))]);}

test('records exact declared image pixels and original bytes without inferring CSS or surface ownership',()=>{
 const bytes=fixture(),before=Buffer.from(bytes),result=sampleRasterPng(bytes,[{id:'quiet-surface',x:1,y:0},{id:'white-neighbor',x:1,y:1},{id:'transparent',x:2,y:0},{id:'partial-alpha',x:2,y:1}]);
 assert.deepEqual(bytes,before);assert.equal(result.source.sha256,hash(bytes));assert.equal(result.source.width,3);assert.equal(result.source.height,2);
 assert.deepEqual(result.samples.map(p=>p.rgba),[[245,245,245,255],[255,255,255,255],[31,44,59,0],[200,12,45,128]]);
 assert.deepEqual(result.samples[0],{id:'quiet-surface',x:1,y:0,rgba:[245,245,245,255],unit:'image-px',valueKind:'measured-raster-pixel'});
 assert.match(result.scope,/not.*CSS|not.*ownership/);assert.match(result.source.decoder,/playwright-core@/);
});

test('unsupported precision, transparency-key and interlaced encodings fail before implicit pixel conversion',()=>{
 const p=[{id:'x',x:0,y:0}],key=Buffer.from([0,77,0,88,0,99]);
 for(const bytes of [customPng({depth:16,raw:Buffer.from([0,0,1,0,128,255,255,128,0])}),customPng({type:2,raw:Buffer.from([0,77,88,99]),extra:[chunk('tRNS',key)]}),customPng({interlace:1,raw:Buffer.alloc(8*1024*1024)})])assert.throws(()=>sampleRasterPng(bytes,p),/unsupported|encoding|interlace|tRNS/i);
});

test('every chunk CRC is checked including ancillary text chunks',()=>{
 const p=[{id:'x',x:0,y:0}],text=Buffer.from('Note\0source');
 assert.deepEqual(sampleRasterPng(customPng({extra:[chunk('tEXt',text)]}),p).samples[0].rgba,[31,44,59,0]);
 assert.throws(()=>sampleRasterPng(customPng({extra:[chunk('tEXt',text,true)]}),p),/PNG.*CRC/i);
});

test('decompressed scanline data cannot exceed declared pixel geometry',()=>{
 assert.throws(()=>sampleRasterPng(customPng({raw:Buffer.alloc(1005)}),[{id:'x',x:0,y:0}]),/PNG.*(?:inflate|scanline|length)/i);
});

test('an opaque indexed8 reference maps exact palette RGB and rejects missing or invalid entries',()=>{
 const palette=chunk('PLTE',Buffer.from([245,245,245,255,255,255])),p=[{id:'x',x:0,y:0}];
 const image=customPng({type:3,raw:Buffer.from([0,0]),extra:[palette]});
 assert.deepEqual(sampleRasterPng(image,p).samples[0].rgba,[245,245,245,255]);
 assert.equal(sampleRasterPng(image,p).source.encoding.paletteEntries,2);
 assert.throws(()=>sampleRasterPng(customPng({type:3,raw:Buffer.from([0,0])}),p),/PNG.*palette/i);
 assert.throws(()=>sampleRasterPng(customPng({type:3,raw:Buffer.from([0,9]),extra:[palette]}),p),/PNG.*palette/i);
});

test('palettes are unique valid RGB triplets before IDAT even when the RGB source does not use them',()=>{
 const p=[{id:'x',x:0,y:0}],palette=chunk('PLTE',Buffer.from([10,20,30]));
 for(const bytes of [customPng({extra:[palette,palette]}),customPng({tail:[palette]}),customPng({extra:[chunk('PLTE',Buffer.from([10]))]})])assert.throws(()=>sampleRasterPng(bytes,p),/PNG.*palette/i);
});

test('missing, duplicate, fractional and out-of-image probes fail instead of clamping to another pixel',()=>{
 const bytes=fixture();
 for(const probes of [[],null,[{}],[{id:'x',x:0,y:0},{id:'x',x:1,y:0}],[{id:'x',x:-1,y:0}],[{id:'x',x:3,y:0}],[{id:'x',x:0,y:2}],[{id:'x',x:.5,y:0}],[{id:'x',x:NaN,y:0}],[{id:'x',x:'1',y:0}],[{id:'x',x:0,y:0,expectedColor:'#ffffff'}]])assert.throws(()=>sampleRasterPng(bytes,probes),/probe/i);
});

test('invalid PNG bytes, corrupt content and excessive declared geometry cannot become measurements',()=>{
 const bytes=fixture(),corrupt=Buffer.from(bytes);corrupt[corrupt.length-16]^=1;
 for(const data of [Buffer.from('not an image'),Buffer.from('89504e470d0a1a0a','hex'),corrupt])assert.throws(()=>sampleRasterPng(data,[{id:'x',x:0,y:0}]),/PNG/i);
 const huge=Buffer.from(bytes);huge.writeUInt32BE(100000,16);assert.throws(()=>sampleRasterPng(huge,[{id:'x',x:0,y:0}]),/dimensions|size/i);
 assert.throws(()=>sampleRasterPng(Buffer.alloc(12*1024*1024+1),[{id:'x',x:0,y:0}]),/size/i);
});

test('CLI writes source-bound measurements once and preserves existing output and input files',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'raster-sample-test-')),image=join(dir,'input.png'),probes=join(dir,'probes.json'),output=join(dir,'receipt.json'),bytes=fixture(),run=promisify(execFile),script=fileURLToPath(new URL('../scripts/raster-samples.mjs',import.meta.url));
 try{
  await writeFile(image,bytes);await writeFile(probes,JSON.stringify([{id:'surface',x:1,y:0}]));
  const command=[script,image,probes,output],options={windowsHide:true,timeout:15000};await run(process.execPath,command,options);
  const receipt=await readFile(output);assert.equal(JSON.parse(receipt).source.sha256,hash(bytes));assert.deepEqual(JSON.parse(receipt).samples[0].rgba,[245,245,245,255]);
  await assert.rejects(run(process.execPath,command,options),error=>error.code===1&&/EEXIST/.test(error.stderr));assert.deepEqual(await readFile(output),receipt);
  await assert.rejects(run(process.execPath,[script,image,probes,image],options),error=>error.code===1&&/EEXIST/.test(error.stderr));assert.deepEqual(await readFile(image),bytes);
 }finally{for(const file of [image,probes,output])await unlink(file).catch(error=>{if(error.code!=='ENOENT')throw error;});await rmdir(dir);}
});
