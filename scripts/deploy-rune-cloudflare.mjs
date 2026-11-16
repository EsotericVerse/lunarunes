#!/usr/bin/env node
// A single Cloudflare Builds deploy command handles prod and preview safely.
// A non-main WORKERS_CI_BRANCH must never deploy over the production Worker.
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

export function deploymentMode(env=process.env) {
  if(!env.WORKERS_CI) return 'deploy'; // deliberate local deploy
  if(!env.WORKERS_CI_BRANCH) throw new Error('Missing WORKERS_CI_BRANCH; refusing to select production or preview');
  return env.WORKERS_CI_BRANCH==='main'?'deploy':'preview';
}
export function deploymentArgs(env=process.env) {
  return [deploymentMode(env)];
}
function main() {
  const cli=process.platform==='win32'?'wrangler.cmd':'wrangler';
  const args=deploymentArgs();
  console.log('[LRS Cloudflare]',args[0],process.env.WORKERS_CI_BRANCH||'(local)');
  const child=spawnSync(cli,args,{stdio:'inherit',env:process.env,windowsHide:true});
  if(child.error)throw child.error;
  process.exit(child.status===null?1:child.status);
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url)main();
