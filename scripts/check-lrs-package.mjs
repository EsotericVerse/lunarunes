import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const npm=process.platform==='win32'?'npm.cmd':'npm';
const manifest=JSON.parse(readFileSync('modules/lrs/package.json','utf8'));
assert.equal(manifest.name,'@lo3r/lrs');
assert.match(manifest.version,/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/);
assert.equal(manifest.private,false);
assert.deepEqual(Object.keys(manifest.dependencies||{}),[],'The code-only LRS package must not bring database or Web build drivers');
const child=spawnSync(npm,['pack','./modules/lrs','--dry-run','--ignore-scripts','--json'],{encoding:'utf8',windowsHide:true});
if(child.status!==0)throw Error('npm pack failed: '+(child.stderr||child.stdout));
const pack=JSON.parse(child.stdout)[0];
assert.equal(pack.name,manifest.name);
assert.equal(pack.version,manifest.version);
const paths=(pack.files||[]).map(file=>file.path);
for(const required of ['index.mjs','manifest.mjs','card/index.mjs','card/draw-core.mjs',
  'boardgame/index.mjs','boardgame/life-engine.mjs','rune/index.mjs','rune/asset-url.mjs',
  'daily/index.mjs','daily/runtime.mjs','package.json','LICENSE'])
  assert(paths.includes(required),'Missing LRS npm file: '+required);
const banned=paths.filter(p=>/^(?:app\/|assets\/|public\/|scripts\/|tests\/|packages\/|dist\/|node_modules\/)/.test(p)||
  /\.(?:png|jpe?g|webp|gif|wasm|efkefc|efkmat|efkmodel|pdf|sqlite|db)$/i.test(p));
assert.deepEqual(banned,[],'npm LRS must never bundle images, effects, WASM or unrelated projects');
assert((pack.size||0)<2*1024*1024,'LRS code package is unexpectedly heavy');
console.log('[lrs-package] '+manifest.name+'@'+manifest.version+' '+paths.length+' files; tarball '+pack.size+' bytes; no binary assets');
