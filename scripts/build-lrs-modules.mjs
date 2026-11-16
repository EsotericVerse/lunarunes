#!/usr/bin/env node
/**
 * Build/verify ONE source-only LRS module without Vite, Next, Cloudflare,
 * Effekseer, native packaging or a second copy of LOC's SQL dialect.
 *
 * Native ES modules need no transpilation. The deliverable is the existing
 * package subpath (lrs/rune, lrs/card, lrs/daily, lrs/boardgame) plus its
 * content-addressed manifest; it is not a separately deployed Worker.
 */
import {createHash} from 'node:crypto';
import {mkdir,readFile,readdir,writeFile} from 'node:fs/promises';
import {resolve,join,relative,sep} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const declared=['rune','boardgame','card','daily'];
const selection=process.argv.slice(2);
if(selection.length>1||selection.some(name=>!declared.includes(name)))
  throw Error('Usage: node scripts/build-lrs-modules.mjs [rune|boardgame|card|daily]');
const modules=selection.length?selection:declared;
async function sourcePaths(dir){
  const entries=await readdir(dir,{withFileTypes:true});
  const result=[];
  for(const e of entries){
    if(e.isSymbolicLink())throw Error('Refusing symlinked LRS module file: '+e.name);
    if(e.isDirectory())result.push(...await sourcePaths(join(dir,e.name)));
    else if(e.isFile())result.push(join(dir,e.name));
    else throw Error('Unsupported LRS module source');
  }
  return result.sort();
}
for(const name of modules){
  const directory=join(root,'modules','lrs',name);
  const files=await sourcePaths(directory);
  if(!files.some(file=>file===join(directory,'index.mjs')))throw Error('Missing LRS '+name+' public entry');
  const hash=createHash('sha256');
  const entries=[];
  for(const full of files){
    const rel=relative(root,full).split(sep).join('/');
    // This build contains only source text. Original Rune art is separately
    // delivered by LRS; LOC and LAS are never included in module packages.
    if(/\.(?:png|jpe?g|gif|webp|wasm|efkefc|efkmat|pdf|sqlite)$/i.test(rel))
      throw Error('Binary asset inside LRS code module: '+rel);
    const bytes=await readFile(full);
    hash.update(rel+'\0'+bytes.length+'\0').update(bytes);
    entries.push({path:rel,size:bytes.length});
  }
  const exports=await import(pathToFileURL(join(directory,'index.mjs')).href);
  if(Object.keys(exports).length===0)throw Error('Empty LRS module export: '+name);
  const manifest={schema:'lrs.code-module.v1',identity:'lo3r@lrs',
    module:'lrs:'+name,import:'lrs/'+name,
    sha256:hash.digest('hex'),exports:Object.keys(exports).sort(),files:entries};
  const target=join(root,'dist','modules');
  await mkdir(target,{recursive:true});
  await writeFile(join(target,name+'.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log('[LRS code-module] '+manifest.module+' '+manifest.sha256.slice(0,12)+
    ' '+files.length+' files, no Web/Worker/art/iOS build');
}
