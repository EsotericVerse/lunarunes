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
test('LRS branch Workers Builds never creates a dev or preview Worker',()=>{
  assert.equal(deploymentMode({WORKERS_CI:'1',WORKERS_CI_BRANCH:'work/rune-art'}),'skip');
  assert.deepEqual(deploymentArgs({WORKERS_CI:'1',WORKERS_CI_BRANCH:'feature/game'}),[]);
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
test('Wrangler native SPA stays on the single existing Worker',async()=>{
  const cfg=JSON.parse(await readFile('wrangler.jsonc','utf8'));
  assert.equal(cfg.name,'lunarunes');
  assert.equal(cfg.assets.not_found_handling,'single-page-application');
  assert.equal(cfg.main,'worker/index.mjs');
});

test('the current LRS product release baseline is owner-designated 1.0R, not an npm publication',async()=>{
  const version=JSON.parse(await readFile('release/version.json','utf8'));
  assert.equal(version.schema,'lunarunes.release-version.v1');
  assert.equal(version.version,'1.0R');
  assert.equal(version.status,'initial-release');
});
