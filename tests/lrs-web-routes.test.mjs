import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pageFromPath} from '../web/src/runtime/rune-routes.mjs';

test('existing Rune home, card hub and feature routes work with or without LOC scope prefix',()=>{
  const expected={
    '/':'home','/lrunes':'home','/lrunes/':'home',
    '/card':'card','/card/':'card','/lrunes/card/':'card',
    '/card/duel/':'duel','/lrunes/card/duel/':'duel',
    '/card/daily/':'daily','/lrunes/card/daily/':'daily',
    '/card/list/':'list','/lrunes/card/list/':'list',
    '/game/':'game','/game/room/':'game','/lrunes/game/':'game',
    '/daily/log/':'daily-log','/lrunes/daily/log/':'daily-log',
    '/daily/trend/':'daily-trend','/lrunes/daily/trend/':'daily-trend'
  };
  for(const [pathname,page] of Object.entries(expected))
    assert.equal(pageFromPath(pathname),page,pathname);
});
test('unimplemented routes never silently show a fabricated Rune page',()=>{
  for(const pathname of ['/culture/','/manage/','/search/','/trace/','/lrunesextra/'])
    assert.equal(pageFromPath(pathname),'unmatched',pathname);
});

test('the LOC-native and LRS Web card hubs share one visual body without losing Web lazy navigation',async()=>{
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
  assert.doesNotMatch(native,/<h1>符文美術場域<\/h1>/);
  assert.doesNotMatch(web,/<h1>符文美術場域<\/h1>/);
});

test('independent daily Web pages use real device IndexedDB; no fake account or private LOC adapter',async()=>{
  const source=async path=>readFile(new URL('../'+path,import.meta.url),'utf8');
  const [web,device,local,calendar,localModel]=await Promise.all([
    source('web/src/RuneApp.jsx'),
    source('web/src/runtime/rune-local-daily.jsx'),
    source('modules/lrs/daily/local-records.mjs'),
    source('app/lrunes/DailyRuneCalendar.jsx'),
    source('modules/lrs/daily/analytics.mjs')
  ]);
  assert.match(web,/RuneLocalDailyPage=lazy\(/);
  assert.match(web,/view=\{page==='daily-log'\?'log':'trend'\}/);
  assert.match(device,/listLocalDailyRunes/);
  assert.match(device,/importLocalDailyTransfer/);
  assert.match(device,/updateLocalDailyRune/);
  assert.match(device,/deleteLocalDailyRune/);
  assert.match(device,/parseDailyCsv/);
  assert.match(device,/makeDailyCsv/);
  assert.match(device,/DAILY_TRANSFER_MAX_BYTES/);
  assert.match(device,/dailyTrend\(periodRows,bucket\)/);
  assert.match(device,/DailyRuneCalendar/);
  assert.match(device,/不會自動同步雲端/);
  assert.doesNotMatch(device,/(?:\/loc\/auth\/|\/loc\/db\/|dbAuthRelation|LRS_DATABASE_URL|sessionOnly|fakeUser)/);
  assert.match(local,/indexedDB.open/);
  assert.match(calendar,/realMoonPhase/);
  assert.match(localModel,/rankDailyDraws/);
});
