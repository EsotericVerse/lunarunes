import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LRSLucus,LRS_LUCUS_ID,LRS_LUCUS_GROUPS,LRS_LUCUS_SYMBOLS,LRS_LUCUS_RELATIONS,
  lrsLucusGroupForRune,lrsLucusRuneIdsForGroup,
  lrsLucusRuneNumberForRoute,lrsLucusLocalRuneId
} from '../modules/lrs/lucus/lrs-lucus.mjs';

test('LRSLucus contains exactly nine groups and all 67 symbols',()=>{
  assert.equal(LRS_LUCUS_ID,'LRSLucus');
  assert.equal(LRSLucus.groups.length,9);
  assert.equal(LRSLucus.symbols.length,67);
  assert.deepEqual(LRS_LUCUS_SYMBOLS.map(item=>item.runeId),
    Array.from({length:67},(_,id)=>id));
  assert.equal(LRS_LUCUS_RELATIONS.filter(edge=>edge.from===LRS_LUCUS_ID).length,9);
});

test('groups 01-08 each contain eight symbols and group 09 contains the special trio',()=>{
  for(const group of LRS_LUCUS_GROUPS.slice(0,8))assert.equal(group.runeIds.length,8);
  assert.deepEqual(lrsLucusRuneIdsForGroup(9),[0,65,66]);
  assert.deepEqual(LRS_LUCUS_GROUPS.map(group=>group.key),[
    'soul','connection','life','nature','mineral','element','order','disorder','special'
  ]);
});

test('德 belongs to LRSLucus but is not drawable; symbols 1-66 are drawable',()=>{
  const de=LRS_LUCUS_SYMBOLS[0];
  assert.deepEqual(de,{runeId:0,groupId:9,symbol:'德',drawable:false});
  assert.ok(LRS_LUCUS_SYMBOLS.slice(1).every(item=>item.drawable));
  assert.equal(lrsLucusGroupForRune(0)?.id,9);
  assert.equal(lrsLucusGroupForRune(66)?.id,9);
  assert.equal(lrsLucusGroupForRune(67),null);
});

test('all 67 group route identities round-trip through LRSLucus',()=>{
  for(const group of LRS_LUCUS_GROUPS){
    for(const runeId of group.runeIds){
      const local=lrsLucusLocalRuneId(group.id,runeId);
      assert.ok(local);
      assert.equal(lrsLucusRuneNumberForRoute(group.id,Number(local)),runeId);
    }
  }
  assert.equal(lrsLucusRuneNumberForRoute(9,3),null);
  assert.equal(lrsLucusRuneNumberForRoute(1,0),null);
});
