import test from 'node:test';
import assert from 'node:assert/strict';
import {runeMediaVersion,isRuneMediaPath} from '../scripts/rune-media-version.mjs';

const sig='f'.repeat(64);
const entries=[
  {path:'assets/lunarunes/cards/00.png',bytes:10,sha256:sig},
  {path:'assets/lunarunes/cards/66.png',bytes:11,sha256:sig},
  {path:'vendor/effekseer/effekseer.wasm',bytes:12,sha256:sig},
  {path:'vendor/effekseer/Collections/MAGICALxSPIRAL/Effect.efkefc',bytes:13,sha256:sig},
  {path:'pics/LunaRunes-hero.jpg',bytes:14,sha256:sig},
  {path:'assets/site/icons/lrunes-favicon.png',bytes:15,sha256:sig},
  {path:'index.html',bytes:500,sha256:sig},
  {path:'assets/index-3e4.js',bytes:123,sha256:sig}
];
test('single Rune asset version is stable across ordering and Web-code-only changes',()=>{
  const v=runeMediaVersion(entries);
  assert.match(v,/^[0-9a-f]{64}$/);
  assert.equal(runeMediaVersion([...entries].reverse()),v);
  assert.equal(runeMediaVersion(entries.map(e=>e.path==='index.html'?{...e,sha256:'a'.repeat(64)}:e)),v);
  assert.equal(runeMediaVersion([...entries,{path:'assets/main.css',bytes:42,sha256:sig}]),v);
});
test('any image or effect content change changes the single Rune media version',()=>{
  const v=runeMediaVersion(entries);
  for(const path of ['assets/lunarunes/cards/66.png','vendor/effekseer/effekseer.wasm',
     'vendor/effekseer/Collections/MAGICALxSPIRAL/Effect.efkefc','pics/LunaRunes-hero.jpg']){
    const changed=entries.map(e=>e.path===path?{...e,sha256:'a'.repeat(64)}:e);
    assert.notEqual(runeMediaVersion(changed),v,path);
  }
});
test('invalid/incomplete and duplicate media versions are rejected',()=>{
  assert.throws(()=>runeMediaVersion([]),/Incomplete/);
  assert.throws(()=>runeMediaVersion([...entries,entries[0]]),/repeated/);
  assert(isRuneMediaPath('vendor/effekseer/effekseer.wasm'));
  assert(isRuneMediaPath('vendor/effekseer/Collections/MAGICALxSPIRAL/Effect.efkefc'));
  assert(isRuneMediaPath('vendor/effekseer/Resources/Texture/star.png'));
  assert(!isRuneMediaPath('assets/index-3e4.js'));
});
