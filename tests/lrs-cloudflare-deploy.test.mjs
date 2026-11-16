import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {readFile} from 'node:fs/promises';
import {deploymentMode,deploymentArgs} from '../scripts/deploy-rune-cloudflare.mjs';

test('Workers Builds main uses only the production deployment command',()=>{
  assert.equal(deploymentMode({WORKERS_CI:'1',WORKERS_CI_BRANCH:'main'}),'deploy');
  assert.deepEqual(deploymentArgs({WORKERS_CI:'1',WORKERS_CI_BRANCH:'main'}),['deploy']);
});
test('Workers Builds feature branches always run true Worker preview',()=>{
  assert.equal(deploymentMode({WORKERS_CI:'1',WORKERS_CI_BRANCH:'work/rune-artifact-contract'}),'preview');
  assert.deepEqual(deploymentArgs({WORKERS_CI:'1',WORKERS_CI_BRANCH:'feature/test'}),['preview']);
});
test('Missing Workers CI branch does not silently publish production',()=>{
  assert.throws(()=>deploymentMode({WORKERS_CI:'1'}),/Missing WORKERS_CI_BRANCH/);
});
test('Explicit manual local deployment still works without Workers CI',()=>{
  assert.equal(deploymentMode({}),'deploy');
});
test('Wrangler native SPA and Worker preview config are present',async()=>{
  const cfg=JSON.parse(await readFile('wrangler.jsonc','utf8'));
  assert.equal(cfg.name,'lunarunes');
  assert.equal(cfg.assets.not_found_handling,'single-page-application');
  assert.deepEqual(cfg.previews,{});
});
