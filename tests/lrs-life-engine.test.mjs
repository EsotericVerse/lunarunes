import test from 'node:test';
import assert from 'node:assert/strict';
import {LIFE_ASPECTS,LIFE_TURN,nextLifeMonth,createRuneLifeEngine} from '../modules/lrs/boardgame/index.mjs';
import {createLunaRunesGame} from '../modules/lrs/boardgame/boardgame-rules.js';
import {localTabletopRules} from '../modules/lrs/boardgame/game-data.js';

test('Rune-life and original tabletop are independent engines',()=>{
  assert.equal(typeof createLunaRunesGame,'function');
  assert.equal(localTabletopRules().events.length,32);
  assert.equal(LIFE_ASPECTS.length,8);
  assert.deepEqual(LIFE_ASPECTS.map(a=>a.focus),
    ['出國','朋友','愛情','寵物','經濟','專精','學習','娛樂']);
  assert.deepEqual([LIFE_TURN.draw,LIFE_TURN.play,LIFE_TURN.unplayed,LIFE_TURN.trendLimit],[8,5,3,11]);
  assert.equal(nextLifeMonth('2026-12'),'2027-01');
});

test('monthly Rune-life turns draw 8 unique playable cards and play exactly 5',async()=>{
  const applied=[];
  const engine=createRuneLifeEngine({
    random:()=>0.1,
    applyAction:(state,action)=>{applied.push(action);return (state||0)+1;},
    resolveEvent:({unplayed,trendRunes})=>({unplayedCount:unplayed.length,trendCount:trendRunes.length})
  });
  let turn=engine.start('2026-11',{trendRunes:[1,2],environment:{rain:true}});
  assert.equal(turn.month,'2026-11');
  assert.equal(turn.hand.length,8);
  assert.equal(new Set(turn.hand).size,8);
  assert(turn.hand.every(n=>n>=1&&n<=66));
  await assert.rejects(()=>engine.finish(turn,0),/Exactly five/);
  for(let i=0;i<5;i++)turn=engine.select(turn,turn.hand[i],LIFE_ASPECTS[i].key);
  const result=await engine.finish(turn,0);
  assert.equal(result.status,'complete');
  assert.equal(result.unplayed.length,3);
  assert.deepEqual(result.unplayed,turn.hand.slice(5));
  assert.equal(result.hostState,5);
  assert.equal(applied.length,5);
  assert.deepEqual(result.event,{unplayedCount:3,trendCount:2});
  const next=engine.following(result);
  assert.equal(next.month,'2026-12');
  assert.equal(next.history.length,1);
  assert.equal(next.status,'selecting');
  assert.notEqual(next.hand,result.hand);
});

test('Rune-life prevents invalid selections and fabricated resource policies',async()=>{
  const engine=createRuneLifeEngine({random:()=>0.5});
  let turn=engine.start('2027-01');
  assert.throws(()=>engine.start('2027-00'),/YYYY-MM/);
  assert.throws(()=>engine.start('2027-01',{trendRunes:Array(12).fill(1)}),/up to 11/);
  assert.throws(()=>engine.select(turn,0,'soul'),/not in/);
  assert.throws(()=>engine.select(turn,turn.hand[0],'not-a-valid-aspect'),/Unknown/);
  for(let i=0;i<5;i++)turn=engine.select(turn,turn.hand[i],LIFE_ASPECTS[i].key);
  assert.throws(()=>engine.select(turn,turn.hand[5],'soul'),/Only five/);
  const result=await engine.finish(turn);
  assert.equal(result.event,null);
  assert.equal(result.hostState,undefined);
  assert.throws(()=>engine.select(result,turn.hand[0],'soul'),/not accepting/);
});
