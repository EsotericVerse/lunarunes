import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pageFromPath} from '../web/src/runtime/rune-routes.mjs';

test('existing Rune home, card hub and feature routes work with or without LOC scope prefix',()=>{
  const expected={
    '/':'home','/lrunes':'home','/lrunes/':'home',
    '/card':'card','/card/':'card','/lrunes/card/':'card',
    '/card/duel/':'duel','/lrunes/card/duel/':'duel',
    '/card/daily/':'daily','/lrunes/card/daily/':'daily',
    '/card/list/':'list','/lrunes/card/list/':'list',
    '/game/':'game','/game/room/':'game','/lrunes/game/':'game'
  };
  for(const [pathname,page] of Object.entries(expected))
    assert.equal(pageFromPath(pathname),page,pathname);
});
test('unimplemented routes never silently show a fabricated Rune page',()=>{
  for(const pathname of ['/daily/log/','/daily/trend/','/culture/','/manage/','/search/','/trace/','/lrunesextra/'])
    assert.equal(pageFromPath(pathname),'unmatched',pathname);
});
