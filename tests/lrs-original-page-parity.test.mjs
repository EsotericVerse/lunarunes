import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pageFromPath} from '../web/src/runtime/rune-routes.mjs';

const source=async(path)=>readFile(new URL('../'+path,import.meta.url),'utf8');

test('LRS starts from the transplanted LOC Rune home, not an invented showcase',async()=>{
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

test('original public feature pages keep actual LOC 2D/3D scenes and the local tabletop',async()=>{
  const [entry,views]=await Promise.all([
    source('web/src/RuneApp.jsx'),source('app/lrunes/RuneUnifiedView.jsx')
  ]);
  assert.match(entry,/<RuneUnifiedView feature=\{page\}/);
  assert.match(entry,/<GameBoard\s*\/>/);
  for(const name of ['duel','daily','list'])
    assert.equal(pageFromPath('/card/'+name+'/'),name);
  for(const component of ['RuneRitualLab','RuneDaily3D','RuneAtlasLab','Rune3DPreview','Rune3DLibrary'])
    assert(views.includes(component),component+' scene missing');
});

test('private daily pages remain unexposed until a real auth and data contract exists',async()=>{
  const [entry,nav]=await Promise.all([
    source('web/src/RuneApp.jsx'),source('web/src/runtime/loc-navigation.jsx')
  ]);
  assert.equal(pageFromPath('/daily/log/'),'unmatched');
  assert.equal(pageFromPath('/daily/trend/'),'unmatched');
  assert.match(nav,/user:null/);
  assert.match(nav,/canLocAccessSync:\(\)=>false/);
  assert.doesNotMatch(entry,/<DailyLogClient\b/);
});

test('standalone Web obtains original Hero via LRS bounded public read, without LOC HTTP proxy',async()=>{
  const [hero,read,entry]=await Promise.all([
    source('web/src/runtime/loc-home-public.jsx'),
    source('web/src/runtime/rune-dialect.mjs'),
    source('web/src/main.jsx')
  ]);
  assert.match(hero,/readPublicRuneHero\(\)/);
  assert.match(read,/silver\.lrunes_blocks/);
  assert.match(read,/page_name.*operator:'eq'.*value:'hero'/);
  assert.match(entry,/fetch\('\/api\/lrs\/public-read'/);
  assert.match(entry,/credentials:'omit'/);
  assert.doesNotMatch(entry,/loc\.lo3rwang\.cc\/api/);
});
