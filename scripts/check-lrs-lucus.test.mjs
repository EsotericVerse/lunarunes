import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LRSLucus,LRS_LUCUS_ID,LRS_LUCUS_GROUPS,LRS_LUCUS_SYMBOLS,
  LRS_LUCUS_DRAWABLE_RUNE_IDS,LRS_LUCUS_RELATIONS,
  lrsLucusGroupForRune,lrsLucusGroupForDatabaseId,lrsLucusRuneIdsForGroup,
  lrsLucusRouteRuneIdsForGroup,lrsLucusRuneNumberForRoute,lrsLucusLocalRuneId,
  lrsLucusIsDrawableRune,lrsLucusDrawCandidates,lrsLucusGroupRowMatches,lrsLucusGroupRowsMatch
} from '../modules/lrs/lucus/lrs-lucus.mjs';

const GROUP_FIXTURE=[
  {group_id:'靈魂',english_name:'Soul',runeslist:[1,2,3,4,5,6,7,8]},
  {group_id:'連結',english_name:'Link',runeslist:[9,10,11,12,13,14,15,16]},
  {group_id:'生命',english_name:'Life',runeslist:[17,18,19,20,21,22,23,24]},
  {group_id:'自然',english_name:'Nature',runeslist:[25,26,27,28,29,30,31,32]},
  {group_id:'礦物',english_name:'Mineral',runeslist:[33,34,35,36,37,38,39,40]},
  {group_id:'元素',english_name:'Element',runeslist:[41,42,43,44,45,46,47,48]},
  {group_id:'秩序',english_name:'Order',runeslist:[49,50,51,52,53,54,55,56]},
  {group_id:'無序',english_name:'Disorder',runeslist:[57,58,59,60,61,62,63,64]},
  {group_id:'特殊',english_name:'Special',runeslist:[65,66,0]}
];

test('LRSLucus contains nine canonical groups and all 67 symbols exactly once',()=>{
  assert.equal(LRS_LUCUS_ID,'LRSLucus');
  assert.equal(LRSLucus.groups.length,9);
  assert.equal(LRSLucus.symbols.length,67);
  assert.deepEqual(LRS_LUCUS_SYMBOLS.map(item=>item.runeId),Array.from({length:67},(_,id)=>id));
  assert.equal(LRS_LUCUS_RELATIONS.filter(edge=>edge.from===LRS_LUCUS_ID).length,9);
  assert.equal(LRS_LUCUS_RELATIONS.filter(edge=>edge.kind==='contains').length,67);
});

test('LRSLucus group identities and memberships match the nine database groups',()=>{
  assert.deepEqual(LRS_LUCUS_GROUPS.map(group=>({
    id:group.id,key:group.key,groupId:group.groupId,englishName:group.englishName,runeIds:[...group.runeIds]
  })),[
    {id:1,key:'soul',groupId:'靈魂',englishName:'Soul',runeIds:[1,2,3,4,5,6,7,8]},
    {id:2,key:'link',groupId:'連結',englishName:'Link',runeIds:[9,10,11,12,13,14,15,16]},
    {id:3,key:'life',groupId:'生命',englishName:'Life',runeIds:[17,18,19,20,21,22,23,24]},
    {id:4,key:'nature',groupId:'自然',englishName:'Nature',runeIds:[25,26,27,28,29,30,31,32]},
    {id:5,key:'mineral',groupId:'礦物',englishName:'Mineral',runeIds:[33,34,35,36,37,38,39,40]},
    {id:6,key:'element',groupId:'元素',englishName:'Element',runeIds:[41,42,43,44,45,46,47,48]},
    {id:7,key:'order',groupId:'秩序',englishName:'Order',runeIds:[49,50,51,52,53,54,55,56]},
    {id:8,key:'disorder',groupId:'無序',englishName:'Disorder',runeIds:[57,58,59,60,61,62,63,64]},
    {id:9,key:'special',groupId:'特殊',englishName:'Special',runeIds:[65,66,0]}
  ]);
  assert.equal(lrsLucusGroupRowsMatch(GROUP_FIXTURE),true);
  assert.equal(lrsLucusGroupRowsMatch([...GROUP_FIXTURE].reverse()),true);
  assert.equal(lrsLucusGroupRowMatches({...GROUP_FIXTURE[8],runeslist:[0,65,66]}),false);
  assert.equal(lrsLucusGroupRowsMatch(GROUP_FIXTURE.slice(1)),false);
  assert.equal(lrsLucusGroupForDatabaseId('連結')?.id,2);
  assert.equal(lrsLucusGroupForDatabaseId('Link')?.id,2);
});

test('special group keeps database membership order separate from route order',()=>{
  assert.deepEqual(lrsLucusRuneIdsForGroup(9),[65,66,0]);
  assert.deepEqual(lrsLucusRouteRuneIdsForGroup(9),[0,65,66]);
  assert.equal(lrsLucusLocalRuneId(9,0),'00');
  assert.equal(lrsLucusLocalRuneId(9,65),'01');
  assert.equal(lrsLucusLocalRuneId(9,66),'02');
  assert.equal(lrsLucusRuneNumberForRoute(9,0),0);
  assert.equal(lrsLucusRuneNumberForRoute(9,1),65);
  assert.equal(lrsLucusRuneNumberForRoute(9,2),66);
  assert.equal(lrsLucusRuneNumberForRoute(9,3),null);
});

test('德 is a member but not drawable; all other 66 symbols are drawable',()=>{
  const de=LRS_LUCUS_SYMBOLS[0];
  assert.equal(de.runeId,0);
  assert.equal(de.groupId,9);
  assert.equal(de.groupName,'特殊');
  assert.equal(de.symbol,'德');
  assert.equal(de.drawable,false);
  assert.equal(LRS_LUCUS_DRAWABLE_RUNE_IDS.length,66);
  assert.deepEqual(LRS_LUCUS_DRAWABLE_RUNE_IDS,Array.from({length:66},(_,index)=>index+1));
  assert.equal(lrsLucusIsDrawableRune(0),false);
  assert.equal(lrsLucusIsDrawableRune(65),true);
  assert.equal(lrsLucusIsDrawableRune(66),true);
  assert.equal(lrsLucusIsDrawableRune(67),false);
  assert.equal(lrsLucusGroupForRune(0)?.id,9);
  assert.equal(lrsLucusGroupForRune(66)?.id,9);
  assert.equal(lrsLucusGroupForRune(67),null);
  assert.deepEqual(lrsLucusDrawCandidates([1,65,0]),[
    ...Array.from({length:63},(_,index)=>index+2),66
  ]);
});

test('all 67 group route identities round-trip through LRSLucus',()=>{
  for(const group of LRS_LUCUS_GROUPS){
    for(const runeId of group.routeRuneIds){
      const local=lrsLucusLocalRuneId(group.id,runeId);
      assert.ok(local);
      assert.equal(lrsLucusRuneNumberForRoute(group.id,Number(local)),runeId);
    }
  }
});
