#!/usr/bin/env node
/**
 * LRS asset module release boundary.
 *
 * The original Rune art and licensed Effekseer resources are *not* inputs to
 * the ordinary code-module build or the Vite Web build. This runner prepares
 * them only if their own pinned sources have changed or the artifact pack is
 * missing. A clean machine must still assemble its first full release; a
 * subsequent Web-only build reuses the verified immutable art pack.
 *
 * The Web preparation is independent of LRS's separately triggered iOS IPA build.
 */
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {readFile,readdir,stat,writeFile} from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const scripts=join(root,'scripts');
const art=join(root,'dist','web');
const fingerprintFile=join(art,'lrs-assets-input.json');
const dry=process.argv.includes('--check');
const force=process.argv.includes('--force');
if(process.argv.slice(2).some(arg=>!['--check','--force'].includes(arg)))
  throw Error('Usage: node scripts/prepare-lrs-release-assets.mjs [--check|--force]');
const hash=createHash('sha256');
const sourceNames=(await readdir(scripts)).filter(name=>
  /^(?:prepare-(?:rune-|effekseer-)|rune-effekseer-|pinned-effekseer-|build-rune-artifacts\.mjs$)/.test(name)&&
  name.endsWith('.mjs')).sort();
const files=[
  'contracts/rune-original-art.json',
  'scripts/build-rune-artifacts.mjs',
  ...sourceNames.filter(name=>name!=='build-rune-artifacts.mjs').map(name=>'scripts/'+name)
];
for(const name of files){
  const bytes=await readFile(join(root,name));
  hash.update(name+'\0'+bytes.length+'\0').update(bytes);
}
const digest=hash.digest('hex');

async function reusable(){
  try{
    const state=JSON.parse(await readFile(fingerprintFile,'utf8'));
    if(state.schema!=='lrs.assets-build-input.v1'||state.sha256!==digest)return false;
    const manifest=JSON.parse(await readFile(join(art,'rune-artifacts.json'),'utf8'));
    if(manifest.schema!=='lunarunes.artifacts.v1'||manifest.target!=='web'||
      manifest.includesEffects!==true||!Array.isArray(manifest.files))return false;
    // Do not mistake a partial effect export for a complete, reusable pack.
    const indexed=new Map(manifest.files.map(row=>[row.path,row]));
    const important=[
      'vendor/effekseer/effekseer.js','vendor/effekseer/effekseer.wasm',
      'assets/lunarunes/cards/00.png','assets/lunarunes/cards/66.png',
      'vendor/rune-semantic-icons/66.svg'
    ];
    if(important.some(name=>!indexed.has(name)))return false;
    for(const item of manifest.files){
      if(!item||typeof item.path!=='string'||!/^[a-f0-9]{64}$/.test(item.sha256)||
        !Number.isSafeInteger(item.bytes)||item.bytes<1)return false;
      const parts=item.path.split('/');
      if(parts.some(part=>!part||part==='.'||part==='..')||item.path.includes('\\'))return false;
      const entry=await stat(join(art,...parts));
      if(!entry.isFile()||entry.size!==item.bytes)return false;
    }
    return true;
  }catch(error){
    if(error?.code==='ENOENT')return false;
    throw error;
  }
}
function command(script,args=[]){
  return new Promise((ok,fail)=>{
    const child=spawn(process.execPath,[join(scripts,script),...args],{
      cwd:root,env:process.env,stdio:'inherit',windowsHide:true
    });
    child.once('error',fail);
    child.once('close',(code,signal)=>code===0?ok():fail(new Error(script+' failed: '+(signal||code))));
  });
}
const cached=!force&&await reusable();
if(dry){
  console.log(JSON.stringify({schema:'lrs.assets-build-input.v1',sha256:digest,
    reusable:cached,action:cached?'reuse':'prepare',sourceFiles:files.length}));
}else if(cached){
  console.log('[LRS lrs:rune] Reusing independently built original art/Effekseer artifacts; no effects prepare or asset rebuild.');
}else{
  console.log('[LRS lrs:rune] Preparing art/effects independently (first build or source changed).');
  await command('prepare-rune-runtime-assets.mjs');
  await command('build-rune-artifacts.mjs',['--target=web']);
  await writeFile(fingerprintFile,JSON.stringify({
    schema:'lrs.assets-build-input.v1',sha256:digest,sourceFiles:files
  },null,2)+'\n');
  if(!(await reusable()))throw Error('Generated Rune art pack failed reuse checks');
}
