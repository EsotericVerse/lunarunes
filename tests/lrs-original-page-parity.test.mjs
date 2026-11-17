import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pageFromPath} from '../web/src/runtime/rune-routes.mjs';

const source=async path=>readFile(new URL('../'+path,import.meta.url),'utf8');

// Rebases the still-relevant portions of old PR #10 onto the actual main
// paths and device-only daily routes. Do not resurrect retired LOC shims.
test('standalone LRS starts from original Rune homepage rather than a demo',async()=>{
  const [entry,home]=await Promise.all([
    source('web/src/RuneApp.jsx'),source('app/lrunes/RunesClient.jsx')
  ]);
  assert.match(entry,/import RunesClient from ['"]\.\.\/\.\.\/app\/lrunes\/RunesClient\.jsx['"]/);
  assert.match(entry,/<RunesClient\s*\/>/);
  assert.match(home,/<ScopeEditableBlocks/);
  assert.match(home,/<RuneCardEntryBubbles\s*\/>/);
  assert.match(home,/<RuneIntroSection\s*\/>/);
  assert.doesNotMatch(entry,/function\s+(?:Landing|Cards|Gallery)\s*\(/);
  assert.doesNotMatch(entry,/<(?:GlobalNav|GlobalFooter|Footer)\b/);
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

test('device-local daily route never pretends to authorize LOC private history',async()=>{
  const [entry,nav,daily]=await Promise.all([
    source('web/src/RuneApp.jsx'),
    source('web/src/runtime/rune-navigation.jsx'),
    source('web/src/runtime/rune-local-daily.jsx')
  ]);
  assert.equal(pageFromPath('/daily/log/'),'daily-log');
  assert.equal(pageFromPath('/daily/trend/'),'daily-trend');
  assert.match(nav,/user:null/);
  assert.match(nav,/canLocAccessSync:\(\)=>false/);
  assert.doesNotMatch(entry,/<DailyLogClient\b/);
  assert.doesNotMatch(daily,/(?:selectDailyRuneMonth|selectDailyRuneRange|dbAuthRelation|LRS_DATABASE_URL)/);
  assert.match(daily,/listLocalDailyRunes/);
});

test('LRS Worker bounds anonymous Hero reads, not the LOC HTTP or credential session',async()=>{
  const [hero,port,entry]=await Promise.all([
    source('web/src/runtime/rune-home-public.jsx'),
    source('web/src/runtime/rune-public-port.mjs'),
    source('web/src/main.jsx')
  ]);
  assert.match(hero,/readPublicRuneHero\(\)/);
  assert.match(port,/silver\.lrunes_blocks/);
  assert.match(port,/column:'page_name',operator:'eq',value:'hero'/);
  assert.match(entry,/fetch\('\/api\/lrs\/public-read'/);
  assert.match(entry,/credentials:'omit'/);
  assert.doesNotMatch(entry,/loc\.lo3rwang\.cc\/api/);
});
