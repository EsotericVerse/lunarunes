import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pageFromPath} from '../web/src/runtime/rune-routes.mjs';

test('standalone LRS Web only resolves card and game routes',()=>{
  const expected={
    '/card':'card','/card/':'card',
    '/card/duel/':'duel','/card/daily/':'daily','/card/list/':'list',
    '/game/':'game','/game/room/':'game'
  };
  for(const [pathname,page] of Object.entries(expected))
    assert.equal(pageFromPath(pathname),page,pathname);
});
test('LOC Scope home and daily records cannot be served as LRS Web routes',()=>{
  for(const pathname of [
    '/','/lrunes','/lrunes/','/lrunes/card/','/lrunes/game/',
    '/daily/log/','/daily/trend/','/lrunes/daily/log/',
    '/culture/','/statics/','/search/','/trace/','/manage/'
  ])assert.equal(pageFromPath(pathname),'scope-home-link',pathname);
});

test('Web feature entry does not bundle LOC Scope homepage or LOC daily pages',async()=>{
  const web=await readFile(new URL('../web/src/RuneApp.jsx',import.meta.url),'utf8');
  assert.match(web,/https:\/\/lrunes\.lo3rwang\.cc\//);
  assert.doesNotMatch(web,/import RunesClient|RuneLocalDailyPage|readPublicRuneHero|page==='home'/);
  assert.match(web,/page==='card'/);
  assert.match(web,/page==='game'/);
});

test('LOC-native and LRS Web card hubs share one visual body',async()=>{
  const source=async path=>readFile(new URL('../'+path,import.meta.url),'utf8');
  const [shared,native,web]=await Promise.all([
    source('app/lrunes/RuneCardHub.jsx'),
    source('app/card/page.jsx'),
    source('web/src/RuneApp.jsx')
  ]);
  assert.match(shared,/<h1>符文美術場域<\/h1>/);
  assert.match(shared,/<Navigation\s*\/>/);
  assert.match(native,/lunarunesMetadata/);
  assert.match(native,/<RuneCardHub Navigation=\{RuneArtNav\}\s*\/>/);
  assert.match(web,/RuneArtNav=lazy\(/);
  assert.match(web,/<RuneCardHub Navigation=\{RuneArtNav\}\s*\/>/);
});

test('LRS Web keeps no duplicate LOC Scope homepage or daily record view',async()=>{
  const web=await readFile(new URL('../web/src/RuneApp.jsx',import.meta.url),'utf8');
  assert.doesNotMatch(web,/rune-local-daily|rune-home-public|RunesClient/);
  const routes=await readFile(new URL('../web/src/runtime/rune-routes.mjs',import.meta.url),'utf8');
  assert.doesNotMatch(routes,/return 'daily-log'|return 'daily-trend'|return 'home'/);
});

test('game board returns to LOC Scope without importing the LOC application',async()=>{
  const source=await readFile(new URL('../modules/lrs/boardgame/GameBoard.jsx',import.meta.url),'utf8');
  assert.match(source,/href="https:\/\/lrunes\.lo3rwang\.cc\/"/);
  assert.doesNotMatch(source,/from ['"][^'"]*\/loc\//);
  assert.doesNotMatch(source,/\bLRS_DATABASE_URL\b/);
});
