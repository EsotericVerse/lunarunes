#!/usr/bin/env node
/**
 * Assemble the independent LunaRunes Web bundle for GitHub Pages.
 * Never copies build assets into LOC, and never builds an IPA.
 * Existing original art and authored effects are exported separately from
 * the Web application build, then combined only in this release artifact.
 */
import {createHash} from 'node:crypto';
import {cp,mkdir,readFile,readdir,rm,rename,stat,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {runeMediaVersion,RUNE_MEDIA_VERSION_SCHEMA} from './rune-media-version.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const app=path.join(dist,'web-app');
const art=path.join(dist,'web');
const dest=path.join(dist,'pages');
const stage=path.join(dist,'.pages-stage-'+process.pid);
const manifest=JSON.parse(await readFile(path.join(art,'rune-artifacts.json'),'utf8'));
const version=JSON.parse(await readFile(path.join(root,'release','version.json'),'utf8'));
if(version.schema!=='lunarunes.release-version.v1'||!/^(?:\d+\.\d+R|\d+\.\d+\.\d+)$/.test(version.version))
  throw Error('LRS release must have a valid owner-designated version');
if(manifest.schema!=='lunarunes.artifacts.v1'||manifest.target!=='web'||!manifest.includesEffects)
  throw Error('LunaRunes GitHub Pages release requires a validated Web runtime/artifact pack');
if(!(await stat(path.join(app,'index.html'))).size)throw Error('Missing standalone Rune Web build');
const seen=new Set();
const releaseEntries=[];
async function install(source,rel,original){
  const parts=rel.split('/');
  if(!rel||path.posix.isAbsolute(rel)||parts.some(p=>!p||p==='.'||p==='..')||rel.includes('\\'))
    throw Error('Unsafe Rune artifact: '+rel);
  if(seen.has(rel))throw Error('Duplicate Rune published path: '+rel);
  seen.add(rel);
  const data=await readFile(source);
  if(original&&(data.length!==original.bytes||createHash('sha256').update(data).digest('hex')!==original.sha256))
    throw Error('Corrupted source Rune artifact: '+original.path);
  const target=path.join(stage,...parts);
  await mkdir(path.dirname(target),{recursive:true});
  await cp(source,target,{force:false,errorOnExist:true});
  releaseEntries.push({path:rel,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')});
}
async function recursivelyCopy(dir,prefix=''){
  for(const entry of await readdir(dir,{withFileTypes:true})){
    if(entry.isSymbolicLink())throw Error('Refusing to publish symlink');
    const relative=path.posix.join(prefix,entry.name),real=path.join(dir,entry.name);
    // GitHub Pages does not apply _redirects. A 404.html copy of the SPA
    // entrypoint handles direct URLs without touching DNS or any Worker.
    if(relative==='_redirects')continue;
    if(entry.isDirectory())await recursivelyCopy(real,relative);
    else if(entry.isFile())await install(real,relative);
    else throw Error('Unsupported file type: '+relative);
  }
}
await rm(stage,{recursive:true,force:true});
await mkdir(stage,{recursive:true});
try{
  await recursivelyCopy(app);
  for(const entry of manifest.files){
    // Original pictures are stored in assets/pics, but the published Rune
    // image URLs are /pics/*.jpg. Do not change the original source paths.
    const published=entry.path.startsWith('assets/pics/')?entry.path.slice('assets/'.length):entry.path;
    await install(path.join(art,...entry.path.split('/')),published,entry);
  }
  // The original Rune card-cut download is LRS-owned, not a LOC build input.
  await install(path.join(root,'assets','lunarunes','source','LunarRunesCardCut.pdf'),'LunarRunesCardCut.pdf');
  for(const name of [
    'LunaRunes-hero.jpg','LunaRunes-hero_s.webp','LunaRunesGame.jpg',
    'LunaRunes.webp','lrunes66_overview.jpg','lrunes66_overview_s.jpg'
  ])await install(path.join(root,'assets','pics',name),'pics/'+name);
  if(!seen.has('vendor/effekseer/effekseer.wasm')||
     !seen.has('vendor/effekseer/effekseer.js')||
     !seen.has('assets/lunarunes/cards/66.png')||
     !seen.has('pics/01.soul.jpg')||
     !seen.has('index.html'))throw Error('Rune GitHub Pages release missing critical runtime dependencies');
  releaseEntries.sort((a,b)=>a.path.localeCompare(b.path,'en'));
  // GitHub Pages serves the same SPA shell at deep links (with HTTP 404 status).
  // The original index.html remains the single build entrypoint.
  await cp(path.join(stage,'index.html'),path.join(stage,'404.html'));
  await writeFile(path.join(stage,'.nojekyll'),'');
  const output={schema:'lunarunes.pages-release.v1',
    sourceCommit:manifest.sourceCommit,releaseVersion:version.version,includesEffects:true,
    mediaSchema:RUNE_MEDIA_VERSION_SCHEMA,mediaVersion:runeMediaVersion(releaseEntries),
    files:releaseEntries};
  await writeFile(path.join(stage,'rune-release.json'),JSON.stringify(output,null,2)+'\n');
  await rm(dest,{recursive:true,force:true});
  await rename(stage,dest);
  console.log('LunaRunes GitHub Pages static asset release: '+releaseEntries.length+
    ' files, '+releaseEntries.reduce((total,e)=>total+e.bytes,0)+' bytes');
}catch(e){await rm(stage,{recursive:true,force:true});throw e;}
