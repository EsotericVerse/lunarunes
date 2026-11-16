import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {readFile} from 'node:fs/promises';
import {deploymentMode,deploymentArgs} from '../scripts/deploy-rune-cloudflare.mjs';

const sha='a'.repeat(40);
test('LRS main merge deploys LRS itself, independently of LOC',()=>{
  const env={WORKERS_CI:'1',WORKERS_CI_BRANCH:'main',LRS_RELEASE_APPROVED:'1',LRS_RELEASE_SHA:sha};
  assert.equal(deploymentMode(env),'automatic');
  assert.deepEqual(deploymentArgs(env),['deploy']);
});
test('LRS feature branch Workers Builds only creates an isolated preview',()=>{
  assert.equal(deploymentMode({WORKERS_CI:'1',WORKERS_CI_BRANCH:'work/rune-art'}),'preview');
  assert.deepEqual(deploymentArgs({WORKERS_CI:'1',WORKERS_CI_BRANCH:'feature/game'}),['preview']);
});
test('Missing Workers branch is rejected, never guessed as production',()=>{
  assert.throws(()=>deploymentMode({WORKERS_CI:'1'}),/Missing WORKERS_CI_BRANCH/);
});
test('No explicit approval means no production deploy, including local commands',()=>{
  assert.equal(deploymentMode({}),'skip');
  assert.deepEqual(deploymentArgs({} ),[]);
  assert.equal(deploymentMode({LRS_RELEASE_SHA:sha}),'skip');
});
test('Approved production release requires an exact immutable commit SHA',()=>{
  assert.throws(()=>deploymentMode({LRS_RELEASE_APPROVED:'1'}),/pinned LRS_RELEASE_SHA/);
  assert.throws(()=>deploymentMode({LRS_RELEASE_APPROVED:'1',LRS_RELEASE_SHA:'main'}),/pinned LRS_RELEASE_SHA/);
  assert.equal(deploymentMode({LRS_RELEASE_APPROVED:'1',LRS_RELEASE_SHA:sha}),'deploy');
  assert.deepEqual(deploymentArgs({LRS_RELEASE_APPROVED:'1',LRS_RELEASE_SHA:sha}),['deploy']);
});
test('Wrangler native SPA and Worker preview config remain intact',async()=>{
  const cfg=JSON.parse(await readFile('wrangler.jsonc','utf8'));
  assert.equal(cfg.name,'lunarunes');
  assert.equal(cfg.assets.not_found_handling,'single-page-application');
  assert.deepEqual(cfg.previews,{});
});
