import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';

const script="import {runeAssetUrl} from './modules/lrs/rune/asset-url.mjs'; console.log(runeAssetUrl('assets/lunarunes/cards/01.png'));";
function resolveWith(env){
 const proc=spawnSync(process.execPath,['--input-type=module','-e',script],{
  cwd:process.cwd(),encoding:'utf8',
  env:{...process.env,NEXT_PUBLIC_LOC_NATIVE_BUNDLE:'',NEXT_PUBLIC_LRS_ASSET_ORIGIN:'',...env}
 });
 assert.equal(proc.status,0,proc.stderr);
 return proc.stdout.trim();
}
test('LOC Web resolves real Rune assets at LRS host, not LOC build output',()=>{
 assert.equal(resolveWith({NEXT_PUBLIC_LRS_ASSET_ORIGIN:'https://lrs.lo3rwang.cc'}),
   'https://lrs.lo3rwang.cc/assets/lunarunes/cards/01.png');
});
test('LOC IPA reads its real bundled files instead of the Web origin',()=>{
 assert.equal(resolveWith({NEXT_PUBLIC_LRS_ASSET_ORIGIN:'https://lrs.lo3rwang.cc',
  NEXT_PUBLIC_LOC_NATIVE_BUNDLE:'1'}),'/assets/lunarunes/cards/01.png');
});
test('Standalone LRS worker keeps its own local static asset routes',()=>{
 assert.equal(resolveWith({}),'/assets/lunarunes/cards/01.png');
});
