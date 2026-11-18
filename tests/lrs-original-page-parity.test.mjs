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

test('legacy Hero read API is not mounted as an LRS Web homepage',async()=>{
  const [hero,port,entry]=await Promise.all([
    source('web/src/runtime/rune-home-public.jsx'),
    source('web/src/runtime/rune-public-port.mjs'),
    source('web/src/main.jsx')
  ]);
  assert.match(hero,/readPublicRuneHero\(\)/);
  const web=await source('web/src/RuneApp.jsx');
  assert.doesNotMatch(web,/rune-home-public|RunesClient/);
  assert.match(port,/silver\.lrunes_blocks/);
  assert.match(port,/column:'page_name',operator:'eq',value:'hero'/);
  assert.match(entry,/fetch\('\/api\/lrs\/public-read'/);
  assert.match(entry,/credentials:'omit'/);
  assert.doesNotMatch(entry,/loc\.lo3rwang\.cc\/api/);
});
