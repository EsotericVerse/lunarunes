#!/usr/bin/env node
/**
 * LRS release policy: main Workers Builds deploys its own Worker only.
 * All non-main Workers Builds are validation-only: no dev/preview Worker.\n * Independent manual/emergency releases
 * still require explicit approved pinned SHA and an existing credential.
 * No LRS merge triggers LOC production.
 */
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const COMMIT_SHA=/^[0-9a-f]{40}$/;
// Fail closed before *any* Wrangler deploy: Dashboard disables are not durable
// unless the checked-in config independently prohibits the workers.dev route.
export function verifyWorkerBoundary(config){
  if(config?.name!=='lunarunes'||config.workers_dev!==false||
    config.observability?.enabled!==true||
    config.observability?.logs?.enabled!==true)
    throw new Error('LRS Worker boundary: workers_dev must be false and Observability enabled');
}

export function deploymentMode(env=process.env){
  if(env.WORKERS_CI){
    if(!env.WORKERS_CI_BRANCH)
      throw new Error('Missing WORKERS_CI_BRANCH; refuse ambiguous deployment');
    return env.WORKERS_CI_BRANCH==='main'?'automatic':'skip';
  }
  if(env.LRS_RELEASE_APPROVED!=='1')return 'skip';
  if(!COMMIT_SHA.test(env.LRS_RELEASE_SHA||''))
    throw new Error('Production requires an explicitly pinned LRS_RELEASE_SHA');
  return 'deploy';
}
export function deploymentArgs(env=process.env){
  const mode=deploymentMode(env);
  return mode==='skip'?[]:['deploy'];
}
function currentCommit(){
  const r=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true});
  if(r.error||r.status!==0)throw new Error('Cannot verify checked-out LRS source revision');
  return r.stdout.trim();
}
function main(){
  const mode=deploymentMode();
  if(mode==='skip'){
    console.log('[LRS] No Worker deployment: only main builds or an explicitly approved pinned release can publish lunarunes.');
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
  verifyWorkerBoundary(JSON.parse(readFileSync('wrangler.jsonc','utf8')));
  const cli=process.platform==='win32'?'wrangler.cmd':'wrangler';
  const args=deploymentArgs();
  if(args.length!==1||args[0]!=='deploy')throw new Error('Only the existing lunarunes production deployment is permitted');
  console.log('[LRS Cloudflare]',mode,
    mode==='deploy'?process.env.LRS_RELEASE_SHA:process.env.WORKERS_CI_BRANCH);
  const child=spawnSync(cli,args,{stdio:'inherit',env:process.env,windowsHide:true});
  if(child.error)throw child.error;
  if(child.status!==0)throw new Error('Wrangler '+mode+' exited with '+String(child.status));
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url)main();
