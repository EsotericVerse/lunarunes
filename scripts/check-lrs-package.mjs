import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';

// Inspect the LOCAL private package rather than packaging the LRS website.
// This intentionally never publishes to npm or a package registry.
const pkg=JSON.parse(readFileSync('modules/lrs/package.json','utf8'));
assert.equal(pkg.name,'@lo3r/lrs');
assert.equal(pkg.private,true,'LRS modules must remain private; never publish');
assert.match(pkg.version,/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/,'LRS modules require independent SemVer');
assert.deepEqual(Object.keys(pkg.dependencies||{}),[],
  'LRS module package must not depend on SQL drivers, LOC, LAS or Web build tools');
const npm=process.platform==='win32'?'npm.cmd':'npm';
const run=spawnSync(npm,['pack','./modules/lrs','--dry-run','--ignore-scripts','--json'],
  {encoding:'utf8',windowsHide:true});
if(run.status!==0)throw Error('Private LRS npm pack failed: '+(run.stderr||run.stdout));
const pack=JSON.parse(run.stdout)[0];
assert.equal(pack.name,pkg.name);
assert.equal(pack.version,pkg.version);
const paths=(pack.files||[]).map(x=>x.path);
for(const expected of [
  'package.json','LICENSE','index.mjs','manifest.mjs',
  'rune/index.mjs','rune/asset-url.mjs','card/index.mjs',
  'card/draw-core.mjs','daily/index.mjs','daily/runtime.mjs',
  'boardgame/index.mjs','boardgame/life-engine.mjs'
])assert(paths.includes(expected),'Missing private LRS module file: '+expected);
const banned=paths.filter(p=>
  /^(?:app\/|assets\/|public\/|scripts\/|tests\/|packages\/|dist\/|node_modules\/)/.test(p)||
  /\.(?:png|jpe?g|webp|gif|wasm|efkefc|efkmat|efkmodel|pdf|sqlite|db)$/i.test(p));
assert.deepEqual(banned,[],'Private LRS module cannot contain large media or non-LRS source');
assert((pack.size||0)<2*1024*1024,
  'Private LRS code tarball must remain below 2 MB');
console.log('Private code-only '+pkg.name+'@'+pkg.version+
  ': '+paths.length+' files, tarball '+pack.size+' bytes; no registry publish');
