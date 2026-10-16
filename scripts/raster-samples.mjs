import {createRequire} from 'node:module';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {inflateSync} from 'node:zlib';

const require=createRequire(import.meta.url),decoderPackage=require.resolve('playwright-core/package.json'),{PNG}=require(join(dirname(decoderPackage),'lib/utilsBundle.js'));
const crcTable=Uint32Array.from({length:256},(_,value)=>{for(let bit=0;bit<8;bit++)value=(value>>>1)^((value&1)?0xedb88320:0);return value>>>0;});
function crc32(bytes){let crc=0xffffffff;for(const byte of bytes)crc=(crc>>>8)^crcTable[(crc^byte)&255];return (crc^0xffffffff)>>>0;}
function validateEncoding(bytes,width,height){
 const depth=bytes[24],type=bytes[25];
 if(depth!==8||![2,3,6].includes(type)||bytes[26]!==0||bytes[27]!==0||bytes[28]!==0)throw new Error('Unsupported PNG encoding: require8-bit noninterlaced RGB, opaque indexed or RGBA');
 let offset=8,headers=0,ended=false,dataClosed=false,paletteEntries=0;const data=[];
 while(offset<bytes.length){
  if(offset+12>bytes.length)throw new Error('Truncated PNG chunk');
  const length=bytes.readUInt32BE(offset),end=offset+length+12;
  if(end>bytes.length)throw new Error('Truncated PNG chunk data');
  const name=bytes.toString('latin1',offset+4,offset+8);
  if(!/^[A-Za-z]{4}$/.test(name)||crc32(bytes.subarray(offset+4,end-4))!==bytes.readUInt32BE(end-4))throw new Error('PNG chunk CRC/type mismatch');
  if(name==='IHDR'){headers++;if(offset!==8||headers!==1||length!==13)throw new Error('Invalid PNG IHDR sequence');}
  else if(name==='tRNS')throw new Error('Unsupported PNG tRNS transparency-key conversion');
  else if(name==='PLTE'){if(data.length||paletteEntries||length<3||length>768||length%3)throw new Error('Invalid PNG palette length/order');paletteEntries=length/3;}
  else if(name==='IDAT'){if(dataClosed)throw new Error('Invalid PNG IDAT sequence');data.push(bytes.subarray(offset+8,end-4));}
  else{if(data.length)dataClosed=true;if(name==='IEND'){if(length!==0||end!==bytes.length)throw new Error('Invalid PNG IEND/trailing data');ended=true;}else if(name[0]===name[0].toUpperCase()&&name!=='PLTE')throw new Error('Unsupported critical PNG chunk');}
  offset=end;
 }
 if(headers!==1||!ended||!data.length)throw new Error('Incomplete PNG chunk sequence');
 if(type===3&&!paletteEntries)throw new Error('PNG indexed image requires a palette');
 const compressed=Buffer.concat(data),expected=(width*(type===2?3:type===6?4:1)+1)*height;
 let decoded;try{decoded=inflateSync(compressed,{maxOutputLength:expected+1,info:true});}catch(error){throw new Error('PNG inflate length/stream failure: '+error.message);}
 if(decoded.buffer.length!==expected||decoded.engine.bytesWritten!==compressed.length)throw new Error('PNG scanline/compressed length differs from declared geometry');
 return {bitDepth:depth,colorType:type,interlaced:false,...(type===3?{paletteEntries}:{}),conversion:type===2?'RGB8 channels retained; opaque alpha255 added':type===3?'Indexed8 mapped through stored RGB8 palette; opaque alpha255 added':'RGBA8 channels retained, including hidden RGB at alpha0',colorManagement:'Stored raster channel values; no color-profile transform applied'};
}

export function sampleRasterPng(bytes,probes){
 if(!Buffer.isBuffer(bytes)||bytes.length>12*1024*1024)throw new Error('PNG input size must be at most12MiB');
 if(bytes.length<33||bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||bytes.readUInt32BE(8)!==13||bytes.toString('ascii',12,16)!=='IHDR')throw new Error('Invalid PNG header');
 const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
 if(!width||!height||width>16384||height>16384||width*height>16000000)throw new Error('PNG dimensions exceed the measurement size limit');
 if(!Array.isArray(probes)||!probes.length||probes.length>256)throw new Error('Declare1–256 image-pixel probes');
 const ids=new Set();
 for(const p of probes){if(!p||Object.keys(p).sort().join(',')!=='id,x,y'||typeof p.id!=='string'||!p.id.trim()||p.id.length>128||ids.has(p.id)||!Number.isInteger(p.x)||!Number.isInteger(p.y)||p.x<0||p.y<0||p.x>=width||p.y>=height)throw new Error('Each probe requires a unique id and in-bounds integer x/y only');ids.add(p.id);}
 const encoding=validateEncoding(bytes,width,height);
 let png;try{png=PNG.sync.read(bytes,{checkCRC:true});}catch(error){throw new Error('PNG decode failed: '+error.message);}
 if(png.width!==width||png.height!==height||png.data.length!==width*height*4)throw new Error('PNG decoded dimensions do not match the declared image');
 return {schemaVersion:1,source:{sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,width,height,encoding,decoder:'playwright-core@'+require(decoderPackage).version},samples:probes.map(p=>({...p,rgba:Array.from(png.data.subarray((p.y*width+p.x)*4,(p.y*width+p.x)*4+4)),unit:'image-px',valueKind:'measured-raster-pixel'})),scope:'Exact declared raster pixels only; not source CSS colors, element ownership, region uniformity or visual approval. Alpha is retained without a guessed background.'};
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [image,probes,output,...extra]=process.argv.slice(2);
 if(!image||!probes||!output||extra.length)throw new Error('Usage: node scripts/raster-samples.mjs IMAGE.png PROBES.json OUTPUT.json');
 const result=sampleRasterPng(await readFile(image),JSON.parse((await readFile(probes,'utf8')).replace(/^\uFEFF/,'')));
 await writeFile(output,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({sourceSha256:result.source.sha256,width:result.source.width,height:result.source.height,samples:result.samples.length}));
}
