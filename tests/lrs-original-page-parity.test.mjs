import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pageFromPath} from '../web/src/runtime/rune-routes.mjs';

const source=async path=>readFile(new URL('../'+path,import.meta.url),'utf8');

// Rebases the still-relevant portions of old PR #10 onto the actual main
// paths and device-only daily routes. Do not resurrect retired LOC shims.
test('standalone LRS does not mount the LOC Scope homepage',async()=>{
  const entry=await source('web/src/RuneApp.jsx');
  assert.doesNotMatch(entry,/import RunesClient|<RunesClient/);
  assert.match(entry,/https:\/\/lrunes\.lo3rwang\.cc\//);
  assert.match(entry,/page==='card'/);
  assert.match(entry,/page==='game'/);
});

test('public 2D/3D scenes and actual local board game retain the original routes',async()=>{
  const [entry,views]=await Promise.all([
    source('web/src/RuneApp.jsx'),source('app/lrunes/RuneUnifiedView.jsx')
  ]);
  assert.match(entry,/<RuneUnifiedView feature=\{page\} defaultView="3d"\s*\/>/);
  assert.match(entry,/<GameBoard\s*\/>/);
  for(const name of ['duel','daily','list'])
    assert.equal(pageFromPath('/card/'+name+'/'),name);
  assert.equal(pageFromPath('/daily/'),'daily');
  for(const component of ['RuneRitualLab','RuneDaily3D','RuneAtlasLab','Rune3DPreview','Rune3DLibrary'])
    assert(views.includes(component),component+' original scene missing');
});

test('LOC owns daily record routes, LRS Web does not mount them',async()=>{
  const [entry,nav]=await Promise.all([
    source('web/src/RuneApp.jsx'),
    source('web/src/runtime/rune-navigation.jsx')
  ]);
  assert.equal(pageFromPath('/daily/log/'),'scope-home-link');
  assert.equal(pageFromPath('/daily/trend/'),'scope-home-link');
  assert.doesNotMatch(entry,/RuneLocalDailyPage|DailyLogClient/);
  assert.match(nav,/user:null/);
  assert.match(nav,/canLocAccessSync:\(\)=>false/);
});

test('LRS Web and public port never access LOC Scope Hero',async()=>{
  const [port,entry,api]=await Promise.all([
    source('web/src/runtime/rune-public-port.mjs'),
    source('web/src/main.jsx'),
    source('public-rune-read.mjs')
  ]);
  assert.doesNotMatch(port,/export async function readPublicRuneHero|['"]silver\.lrunes_blocks['"]/);
  assert.doesNotMatch(api,/silver\.lrunes_blocks/);
  assert.match(entry,/fetch\(runePublicReadUrl\(window\.location\.protocol\)/);
  assert.match(entry,/credentials:'omit'/);
  const url=await source('web/src/runtime/rune-public-url.mjs');
  assert.match(url,/https:\/\/lrs\.lo3rwang\.cc\/api\/lrs\/public-read/);
  assert.doesNotMatch(url,/loc\.lo3rwang\.cc/);
  assert.match(entry,/credentials:'omit'/);
});
