/**
 * LRSLucus is LRS's domain-specific rune relation within the shared Lucus architecture.
 *
 * 9 groups contain 67 symbols. Groups 01-08 each contain eight drawable
 * symbols; group 09 contains the special trio 0/65/66. Symbol 0 is 德 and is
 * part of the graph but is never drawable. Symbols 1-66 are drawable.
 *
 * Keep route identity, group membership and symbol membership derived from
 * this graph. Do not duplicate the mapping in UI routes or card components.
 * This is not the complete particle-level Lucus core or the LunArcus protocol;
 * future cross-system links use the shared Lucus architecture + LunArcus protocol.
 */
const GROUPS=[
  {id:1,key:'soul',image:'pics/01.soul.jpg',runeIds:[1,2,3,4,5,6,7,8]},
  {id:2,key:'connection',image:'pics/02_connection.jpg',runeIds:[9,10,11,12,13,14,15,16]},
  {id:3,key:'life',image:'pics/03_life.jpg',runeIds:[17,18,19,20,21,22,23,24]},
  {id:4,key:'nature',image:'pics/04_nature.jpg',runeIds:[25,26,27,28,29,30,31,32]},
  {id:5,key:'mineral',image:'pics/05_mineral.jpg',runeIds:[33,34,35,36,37,38,39,40]},
  {id:6,key:'element',image:'pics/06_element.jpg',runeIds:[41,42,43,44,45,46,47,48]},
  {id:7,key:'order',image:'pics/07_order.jpg',runeIds:[49,50,51,52,53,54,55,56]},
  {id:8,key:'disorder',image:'pics/08_disorder.jpg',runeIds:[57,58,59,60,61,62,63,64]},
  {id:9,key:'special',image:'pics/09_specia.jpg',runeIds:[0,65,66]}
];

export const LRS_LUCUS_ID='LRSLucus';
export const LRS_LUCUS_GROUPS=Object.freeze(GROUPS.map(group=>Object.freeze({
  ...group,runeIds:Object.freeze([...group.runeIds])
})));

const groupByRune=new Map();
for(const group of LRS_LUCUS_GROUPS){
  for(const runeId of group.runeIds){
    if(groupByRune.has(runeId))throw new Error('LRSLucus duplicate rune membership: '+runeId);
    groupByRune.set(runeId,group.id);
  }
}
if(groupByRune.size!==67||Array.from({length:67},(_,id)=>id).some(id=>!groupByRune.has(id)))
  throw new Error('LRSLucus must map all 67 symbols exactly once');

export const LRS_LUCUS_SYMBOLS=Object.freeze(
  Array.from({length:67},(_,runeId)=>Object.freeze({
    runeId,
    groupId:groupByRune.get(runeId),
    symbol:runeId===0?'德':null,
    drawable:runeId!==0
  }))
);

export const LRS_LUCUS_RELATIONS=Object.freeze([
  ...LRS_LUCUS_GROUPS.map(group=>Object.freeze({
    from:LRS_LUCUS_ID,to:'group:'+String(group.id).padStart(2,'0'),kind:'group'
  })),
  ...LRS_LUCUS_GROUPS.flatMap(group=>group.runeIds.map(runeId=>Object.freeze({
    from:'group:'+String(group.id).padStart(2,'0'),
    to:'rune:'+String(runeId).padStart(2,'0'),kind:'contains'
  })))
]);

export const LRSLucus=Object.freeze({
  id:LRS_LUCUS_ID,
  groups:LRS_LUCUS_GROUPS,
  symbols:LRS_LUCUS_SYMBOLS,
  relations:LRS_LUCUS_RELATIONS
});

export function lrsLucusGroupForRune(runeId){
  const id=Number(runeId);
  if(!Number.isInteger(id)||id<0||id>66)return null;
  const groupId=groupByRune.get(id);
  return LRS_LUCUS_GROUPS.find(group=>group.id===groupId)||null;
}

export function lrsLucusRuneIdsForGroup(groupId){
  const id=Number(groupId);
  return LRS_LUCUS_GROUPS.find(group=>group.id===id)?.runeIds||[];
}

export function lrsLucusRuneNumberForRoute(groupId,localRuneId){
  const group=LRS_LUCUS_GROUPS.find(item=>item.id===Number(groupId));
  const local=Number(localRuneId);
  if(!group||!Number.isInteger(local))return null;
  if(group.id===9)return group.runeIds[local]??null;
  if(local<1||local>group.runeIds.length)return null;
  return group.runeIds[local-1];
}

export function lrsLucusLocalRuneId(groupId,runeId){
  const group=LRS_LUCUS_GROUPS.find(item=>item.id===Number(groupId));
  const index=group?.runeIds.indexOf(Number(runeId))??-1;
  if(index<0)return null;
  return String(group.id===9?index:index+1).padStart(2,'0');
}
