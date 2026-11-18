#!/usr/bin/env node
// Keep one owned implementation per Rune feature. This checks tracked source,
// not a second cross-repository sync process. No SQL/DB connection or deployment.
import {execFileSync} from 'node:child_process';
import {existsSync,readFileSync} from 'node:fs';
import {dirname,resolve,relative,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const files=execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'})
 .split(String.fromCharCode(0)).filter(Boolean);
const fileSet=new Set(files);
const removedPrefixes=['modules/lrune/','app/lrunes/effekseer/'];
const removedPaths=new Set([
 'app/lrunes/game/GameBoard.jsx','app/lrunes/game/boardgame-rules.js',
 'app/lrunes/game/game-data.js','app/lrunes/game/game-board.css',
 'app/lrunes/rune-directory.mjs','app/lrunes/rune-draw-modes.mjs',
 'app/lrunes/rune-draw-motion.mjs','app/lrunes/rune-guidance-engine.mjs',
 'app/lrunes/daily-moon-river.mjs','app/lrunes/rune-presentation-switch.css',
 'app/lrunes/skin-lab.css',
 'app/lrunes/visual/rune-art-layout.css',
 'app/lrunes/visual/rune-art-stage.css',
 'app/lrunes/local-rune-records.mjs','app/daily/log/daily-record-slots.mjs',
 'packages/zenstack/lrunes-read-model.mjs',
 'app/lrunes/daily-transfer-contract.mjs'
]);
const owns=p=>removedPaths.has(p)||removedPrefixes.some(prefix=>p.startsWith(prefix))||
 ['app/loc/blocks/home-block-model.js','app/loc/blocks/hero-image.mjs',
  'app/loc/model/moon-phase.js'].includes(p);
// LOC owns all Scope routes, published Blocks and Scope management. LRS may
// keep only card/game Next compatibility routes for LOC's existing IPA bridge.
const LRS_FEATURE_ROUTE=/^app\/lrunes\/(?:card(?:\/(?:daily|duel|list))?|game)\/page\.jsx$/;
const forbidden=files.filter(p=>
  p.startsWith('app/loc/')||p.startsWith('app/modular/')||
  p.startsWith('content/lrunes/')||
  (p.startsWith('app/lrunes/')&&p.endsWith('/page.jsx')&&!LRS_FEATURE_ROUTE.test(p))||
  p==='app/lrunes/page.jsx'||owns(p));
if(forbidden.length)throw Error('Legacy duplicate Rune implementation remains: '+forbidden.slice(0,10).join(', '));
const expected=[
 'modules/lrs/rune/hero/home-presentation.mjs',
 'modules/lrs/rune/hero/image.mjs',
 'modules/lrs/rune/vfx/EffekseerStage.jsx',
 'modules/lrs/rune/asset-url.mjs',
 'modules/lrs/card/draw-core.mjs',
 'modules/lrs/boardgame/GameBoard.jsx',
 'modules/lrs/daily/local-records.mjs',
 'modules/lrs/daily/record-slots.mjs',
 'modules/lrs/daily/real-moon-phase.mjs',
 'modules/lrs/daily/analytics.mjs',
 'modules/lrs/daily/transfer-contract.mjs',
 'web/src/runtime/rune-public-port.mjs',
 'app/lrunes/visual/RuneArtStage.jsx'
];
for(const p of expected)if(!fileSet.has(p))throw Error('Missing canonical Rune owner: '+p);
const refs=/(['"])(\.{1,2}\/[^'"\s]+)\1/g;
let checked=0;
for(const file of files){
 if(!/^(?:app|modules|web|scripts|tests)\//.test(file)||
    !/\.(?:js|jsx|mjs|ts|tsx|css)$/.test(file))continue;
 const data=readFileSync(resolve(root,file),'utf8');
 for(const match of data.matchAll(refs)){
  const target=resolve(root,dirname(file),match[2]);
  if(target!==root&&!target.startsWith(root+sep))continue;
  const rel=relative(root,target).replaceAll('\\','/');
  const candidates=[rel,rel+'.js',rel+'.jsx',rel+'.mjs',rel+'.css'];
  if(candidates.some(owns))
   throw Error('Source still imports deleted Rune duplicate: '+file+' -> '+match[2]);
  // Canonical LRS business modules cannot import LOC business code.
  if(file.startsWith('modules/lrs/')&&rel.startsWith('app/loc/'))
   throw Error('LRS domain module imports LOC application: '+file);
  checked++;
 }
}
console.log('LRS single-source boundary PASS: '+files.length+' tracked files, '+checked+' references; no duplicated Rune implementation');
