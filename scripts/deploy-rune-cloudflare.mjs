#!/usr/bin/env node
/**
 * LRS release policy: a merged main commit is NOT a production release.
 * Workers Builds may validate code, but cannot publish production.
 * Production only accepts an explicitly approved, pinned SHA checkout.
 * The credential for that one release is supplied by the operator at runtime.
 */
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const COMMIT_SHA=/^[0-9a-f]{40}$/;
export function deploymentMode(env=process.env){
  if(env.WORKERS_CI){
    if(!env.WORKERS_CI_BRANCH)
      throw new Error('Missing WORKERS_CI_BRANCH; refuse ambiguous deployment');
    return env.WORKERS_CI_BRANCH==='main'?'skip':'preview';
  }
  if(env.LRS_RELEASE_APPROVED!=='1')return 'skip';
  if(!COMMIT_SHA.test(env.LRS_RELEASE_SHA||''))
    throw new Error('Production requires an explicitly pinned LRS_RELEASE_SHA');
  return 'deploy';
}
export function deploymentArgs(env=process.env){
  const mode=deploymentMode(env);
  return mode==='skip'?[]:[mode];
}
function currentCommit(){
  const r=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true});
  if(r.error||r.status!==0)throw new Error('Cannot verify checked-out LRS source revision');
  return r.stdout.trim();
}
function main(){
  const mode=deploymentMode();
  if(mode==='skip'){
    console.log('[LRS] Deployment skipped: a merge/build is not a release.');
    return;
  }
  if(mode==='deploy'){
    const head=currentCommit();
    if(head!==process.env.LRS_RELEASE_SHA)
      throw new Error('LRS_RELEASE_SHA must equal the exact checked-out Git commit');
    const verified=spawnSync('git',['merge-base','--is-ancestor',head,'origin/main'],{
      encoding:'utf8',windowsHide:true
    });
    if(verified.status!==0)
      throw new Error('LRS production release SHA must be reachable from origin/main');
    if(!process.env.CLOUDFLARE_API_TOKEN)
      throw new Error('Supply a one-time CLOUDFLARE_API_TOKEN for the approved release');
  }
  const cli=process.platform==='win32'?'wrangler.cmd':'wrangler';
  const args=[mode];
  console.log('[LRS Cloudflare]',mode,
    mode==='deploy'?process.env.LRS_RELEASE_SHA:process.env.WORKERS_CI_BRANCH);
  const child=spawnSync(cli,args,{stdio:'inherit',env:process.env,windowsHide:true});
  if(child.error)throw child.error;
  if(child.status!==0)throw new Error('Wrangler '+mode+' exited with '+String(child.status));
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url)main();
