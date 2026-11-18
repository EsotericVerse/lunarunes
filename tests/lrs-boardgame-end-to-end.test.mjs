import test from 'node:test';
import assert from 'node:assert/strict';
import {createLunaRunesGame} from '../modules/lrs/boardgame/boardgame-rules.js';
import {localTabletopRules} from '../modules/lrs/boardgame/game-data.js';

// An end-to-end pure-engine check of the existing local tabletop rules.
// Never chooses or changes a game design; never requests SQL, LOC or networking.
function playMatch(count,{attack=false}={}){
  const rules=localTabletopRules();
  const game=createLunaRunesGame(rules,count);
  const G=game.setup({random:{Shuffle:rows=>[...rows]}});
  for(let player=0;player<count;player++){
    for(const card of G.players[player].hand.slice(0,rules.config.openingDiscard))
      game.moves.toggleCard({G},player,card.id);
    game.moves.confirmOpening({G},player);
  }
  assert.equal(G.stage,'event');
  let steps=0;
  while(G.stage!=='finished'&&steps++<100){
    if(G.stage==='event'){
      for(let i=0;i<count;i++){
        const hand=G.players[i].hand;
        assert(hand.length>=rules.config.eventResponseCards);
        for(const card of hand.slice(0,rules.config.eventResponseCards))
          game.moves.toggleCard({G},i,card.id);
      }
      game.moves.resolveEvent({G});
    }else if(G.stage==='resonance'||G.stage==='duel'){
      const actor=G.active;
      const valid=G.stage==='duel'?G.duelists:G.players.map((_,i)=>i);
      const target=valid.find(i=>i!==actor);
      if(attack&&actor===0&&target!==undefined)
        game.moves.resonance({G},'attack',target);
      else game.moves.resonance({G},'self',actor);
    }else assert.fail('Unexpected boardgame stage: '+G.stage);
  }
  assert(steps<100,'Local game loop must never stall');
  assert.equal(G.stage,'finished');
  assert.equal(G.players.length,count);
  assert.equal(G.winner!==null||G.draw,true,'Match must produce a winner or draw');
  assert(G.history.length>=5);
  return G;
}
for(const count of [2,3,4]){
  test('complete existing local boardgame with '+count+' players',()=>{
    const result=playMatch(count);
    assert.equal(result.draw,true,'Equal deterministic choices reach documented tie resolution');
    assert.equal(result.round,9);
  });
}
test('boardgame resolves asymmetric choices without hanging',()=>{
  const result=playMatch(2,{attack:true});
  assert.equal(result.stage,'finished');
});
