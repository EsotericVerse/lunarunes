import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import worker from '../index.mjs';
import {runePublicReadUrl} from '../web/src/runtime/rune-public-url.mjs';

const source=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
const endpoint='https://lrs.lo3rwang.cc/api/lrs/public-read';

test('LRS iOS has its own identity and packages its own local assets',async()=>{
  const cap=JSON.parse(await source('capacitor.config.json'));
  assert.equal(cap.appId,'cc.lo3rwang.lrs.mobile');
  assert.equal(cap.webDir,'dist/cloudflare');
  assert.equal(cap.server.iosScheme,'capacitor');
  assert.notEqual(cap.appId,'cc.lo3rwang.loc.mobile');
  assert.equal(runePublicReadUrl('capacitor:'),endpoint);
  assert.equal(runePublicReadUrl('https:'),'/api/lrs/public-read');
});

test('only the local LRS iOS WebView origin receives CORS authorization',async()=>{
  const options=(origin)=>worker.fetch(new Request(endpoint,{method:'OPTIONS',headers:{origin}}),{});
  const native=await options('capacitor://localhost');
  assert.equal(native.status,204);
  assert.equal(native.headers.get('access-control-allow-origin'),'capacitor://localhost');
  assert.match(native.headers.get('access-control-allow-methods'),/POST/);
  assert.equal((await options('https://loc.lo3rwang.cc')).status,403);
  assert.equal((await options('https://example.com')).status,403);
  const post=new Request(endpoint,{method:'POST',headers:{origin:'capacitor://localhost','content-type':'application/json'},body:'{}'});
  const result=await worker.fetch(post,{});
  assert.equal(result.status,400);
  assert.equal(result.headers.get('access-control-allow-origin'),'capacitor://localhost');
});

test('LRS iOS workflow does not checkout, fetch or deploy LOC',async()=>{
  const yaml=await source('.github/workflows/lrs-ios-device.yml');
  assert.match(yaml,/workflow_dispatch:/);
  assert.match(yaml,/macos-/);
  assert.match(yaml,/CODE_SIGNING_ALLOWED=NO/);
  assert.match(yaml,/npm run build:cloudflare/);
  assert.match(yaml,/actions\/upload-artifact/);
  assert.doesNotMatch(yaml,/lunacodex|restore-lrs-native-ui|LOC_WORKFLOW_KEY|LOC_EMERGENCY_KEY/);
  assert.doesNotMatch(yaml,/wrangler deploy|workflow_run:/);
});
