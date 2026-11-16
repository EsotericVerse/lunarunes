#!/usr/bin/env node
// Confirm the independent Worker output can serve complete Rune Web and
// all authored effect resources. Do not publish or touch LOC in this test.
import {strict as assert} from 'node:assert';
import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const root='dist/cloudflare';
const release=JSON.parse(await readFile(path.join(root,'rune-release.json'),'utf8'));
assert.equal(release.schema,'lunarunes.cloudflare-release.v1');
assert.equal(release.includesEffects,true);
const records=new Map(release.files.map(e=>[e.path,e]));
assert(!records.has('_redirects'),'Worker must use SPA not_found_handling instead of legacy _redirects');
for (const required of [
  'index.html','assets/lunarunes/cards/00.png',
  'assets/lunarunes/cards/66.png','assets/site/icons/lrunes-favicon.png',
  'vendor/effekseer/effekseer.js','vendor/effekseer/effekseer.wasm',
  'pics/01.soul.jpg','pics/09_specia.jpg','pics/LunaRunesGame.jpg'
])assert(records.has(required),'Missing LRS Worker asset '+required);
const effects=[...records.keys()].filter(p=>p.endsWith('.efkefc'));
const icons=[...records.keys()].filter(p=>p.startsWith('vendor/rune-semantic-icons/')&&p.endsWith('.svg'));
assert(effects.length>=81,'Missing authored Effekseer effects');
assert.equal(icons.length,67,'Missing semantic icons');
const cards=[...records.keys()].filter(p=>/^assets\/lunarunes\/cards\/\d{2}\.png$/.test(p));
assert.equal(cards.length,67,'Missing complete Rune set');
for(const entry of release.files){
  const resolved=path.join(root,...entry.path.split('/'));
  const bytes=await readFile(resolved);
  assert.equal(bytes.length,entry.bytes,'Size mismatch '+entry.path);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256,'Checksum mismatch '+entry.path);
}
assert((await stat(path.join(root,'index.html'))).size>50);
console.log('LRS standalone Worker release PASS:',release.files.length,'assets,',effects.length,'effects,',icons.length,'icons,',cards.length,'cards');
