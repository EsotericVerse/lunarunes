import test from 'node:test';
import assert from 'node:assert/strict';
import {LRS_MODULE as LRUNE_MODULE} from '../modules/lrs/manifest.mjs';
import {runeAssetUrl} from '../modules/lrs/rune/index.mjs';
import {createLunaRunesGame,localTabletopRules} from '../modules/lrs/boardgame/index.mjs';
import {RUNE_ALL_DRAW_MODES} from '../modules/lrs/card/index.mjs';

test('lrune owns Rune core, not LOC or LunArcus',()=>{
  assert.equal(LRUNE_MODULE.modules.rune,'lrs:rune');
  assert.equal(LRUNE_MODULE.repository,'EsotericVerse/lunarunes');
  assert.equal(LRUNE_MODULE.scope,'lrunes');
  assert.equal(runeAssetUrl('assets/lunarunes/cards/00.png'),'/assets/lunarunes/cards/00.png');
  assert.throws(()=>runeAssetUrl('../secrets'));
  assert.throws(()=>runeAssetUrl('https://invalid.example/path'));
});
test('existing tabletop engine is runnable without LOC imports',()=>{
  const rules=localTabletopRules();
  assert.equal(rules.events.length,32);
  assert.equal(rules.rounds.length,8);
  const match=createLunaRunesGame(rules,2);
  const G=match.setup({random:{Shuffle:rows=>[...rows]}});
  assert.equal(G.stage,'opening');
  assert.equal(G.players.length,2);
  for(let i=0;i<2;i++){
    const player=G.players[i];
    const cards=player.hand.slice(0,3).map(card=>card.id);
    for(const id of cards)match.moves.toggleCard({G},i,id);
    match.moves.confirmOpening({G},i);
  }
  assert.equal(G.stage,'event');
  assert.equal(G.players.every(player=>!player.opening),true);
  assert(RUNE_ALL_DRAW_MODES.some(mode=>mode.key==='ow3gs'));
});
