#!/usr/bin/env node
/**
 * LunaRunes: pinned, offline asset outputs for independent Rune Web hosting
 * and real file artifacts consumed by LunArcus' existing IPA workflow.
 * This intentionally does not download effects, build an IPA, or touch LOC.
 */
import {createHash} from 'node:crypto';
import {copyFile,cp,mkdir,readFile,readdir,rm,rename,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
const allowed=new Set(['--target=web','--target=ios','--art-only']);
if(args.some(x=>!allowed.has(x)))throw Error('Use --target=web|ios [--art-only] [--verify-only]');
const targets=args.filter(x=>x.startsWith('--target='));
if(targets.length!==1)throw Error('Exactly one --target=web|ios is required');
const target=targets[0].slice(9);
const artOnly=args.includes('--art-only');
const pinned=JSON.parse(await readFile(path.join(ROOT,'contracts/rune-original-art.json'),'utf8'));
if(pinned.schema!=='lunarunes.original-art.v1'||pinned.sourceRepository!=='EsotericVerse/lunacodex')
  throw Error('Unrecognized Rune original-art contract');
const originals=pinned.immutableSourceFiles;

const hash=(type,bytes)=>createHash(type).update(bytes).digest('hex');
const gitBlob=bytes=>hash('sha1',Buffer.concat([Buffer.from('blob '+bytes.length+'\0'),bytes]));
const files=new Map();
async function verify(relative,expected){
  if(path.posix.isAbsolute(relative)||relative.split('/').includes('..')||relative.includes('\\'))
    throw Error('Unsafe Rune artifact path: '+relative);
  const bytes=await readFile(path.join(ROOT,...relative.split('/')));
  if(expected&&(bytes.length!==expected.size||gitBlob(bytes)!==expected.sha))
    throw Error('Pinned original art has changed: '+relative);
  files.set(relative,{path:relative,bytes:bytes.length,sha256:hash('sha256',bytes)});
}
for(const [file,expected] of Object.entries(originals))await verify(file,expected);

const effects=[];
if(!artOnly){
  for(const p of ['public/vendor/effekseer/effekseer.js','public/vendor/effekseer/effekseer.wasm']){
    await verify(p);
  }
  async function walk(folder,relative){
    for(const entry of await readdir(folder,{withFileTypes:true})){
      if(entry.isSymbolicLink())throw Error('Refusing symlink in Rune artifact source');
      const name=path.posix.join(relative,entry.name);
      if(entry.isDirectory())await walk(path.join(folder,entry.name),name);
      else if(entry.isFile()){await verify(name);effects.push(name);}
      else throw Error('Unexpected Rune artifact file type: '+name);
    }
  }
  await walk(path.join(ROOT,'public/vendor/effekseer/Collections'),'public/vendor/effekseer/Collections');
  await walk(path.join(ROOT,'public/vendor/rune-semantic-icons'),'public/vendor/rune-semantic-icons');
}
const dist=path.join(ROOT,'dist');
const dest=path.join(dist,target);
const stage=path.join(dist,'.'+target+'-stage-'+process.pid);
await mkdir(dist,{recursive:true});
await rm(stage,{recursive:true,force:true});
try{
  await mkdir(stage,{recursive:true});
  const entries=[];
  async function copy(relative){
    // Files stored under public/ must publish without the public/ prefix.
    const published=relative.startsWith('public/')?relative.slice(7):relative;
    const output=path.join(stage,...published.split('/'));
    await mkdir(path.dirname(output),{recursive:true});
    await copyFile(path.join(ROOT,...relative.split('/')),output);
    entries.push({...files.get(relative),path:published});
  }
  for(const file of Object.keys(originals))await copy(file);
  if(!artOnly){
    for(const file of ['public/vendor/effekseer/effekseer.js','public/vendor/effekseer/effekseer.wasm',...effects])
      await copy(file);
    const source=path.join(ROOT,'public/vendor/effekseer/Resources');
    const output=path.join(stage,'vendor/effekseer/Resources');
    async function index(folder,prefix){
      for(const item of await readdir(folder,{withFileTypes:true})){
        if(item.isSymbolicLink())throw Error('Refusing symlink in Effekseer resources');
        const file=path.posix.join(prefix,item.name);
        if(item.isDirectory())await index(path.join(folder,item.name),file);
        else if(item.isFile()){
          const bytes=await readFile(path.join(folder,item.name));
          entries.push({path:file,bytes:bytes.length,sha256:hash('sha256',bytes)});
        }
      }
    }
    await index(source,'vendor/effekseer/Resources');
    await cp(source,output,{recursive:true,force:false,errorOnExist:true});
  }
  entries.sort((a,b)=>a.path.localeCompare(b.path,'en'));
  const manifest={schema:'lunarunes.artifacts.v1',target,sourceCommit:pinned.sourceCommit,
    originalArtContract:'contracts/rune-original-art.json',includesEffects:!artOnly,files:entries};
  await writeFile(path.join(stage,'rune-artifacts.json'),JSON.stringify(manifest,null,2)+'\n');
  await rm(dest,{recursive:true,force:true});
  await rename(stage,dest);
  console.log('LunaRunes '+target+' artifact files='+entries.length+' effects='+(!artOnly));
}catch(error){
  await rm(stage,{recursive:true,force:true});
  throw error;
}
