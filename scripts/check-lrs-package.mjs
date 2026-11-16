import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';

const npm=process.platform==='win32'?'npm.cmd':'npm';
const child=spawnSync(npm,['pack','--dry-run','--ignore-scripts','--json'],{encoding:'utf8',windowsHide:true});
if(child.status!==0)throw Error('npm pack failed: '+(child.stderr||child.stdout));
const pack=JSON.parse(child.stdout)[0];
const paths=(pack.files||[]).map(file=>file.path);
for(const required of [
  'modules/lrs/card/index.mjs',
  'modules/lrs/card/draw-core.mjs',
  'modules/lrs/boardgame/index.mjs',
  'modules/lrs/rune/index.mjs',
  'modules/lrs/rune/asset-url.mjs'
])assert(paths.includes(required),'Missing LRS package export: '+required);
const banned=paths.filter(p=>
  /^(?:app\/|assets\/|public\/|scripts\/|tests\/|modules\/lrune\/|dist\/)/.test(p)||
  /\.(?:png|jpe?g|webp|wasm|efkefc|efkmat|efkmodel|pdf|sqlite)$/i.test(p));
assert.deepEqual(banned,[],'LRS module package must never include heavy Rune originals or effect binaries');
assert((pack.size||0)<2*1024*1024,'The code-only LRS module package is unexpectedly heavy');
console.log('[lrs-package] SQL-free submodules='+3+' code files='+paths.length+' tarball bytes='+pack.size);
