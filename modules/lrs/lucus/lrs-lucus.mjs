/**
 * LRSLucus is LRS's rune-domain relation within the shared Lucus architecture.
 * It records the canonical nine-group / 67-symbol membership from runes_group.
 *
 * Membership order is the persisted runeslist order. Route order is a separate
 * presentation mapping and must never rewrite the membership relation.
 * Symbol 0 (德) belongs to group 09 but is not drawable; 1-66 are drawable.
 *
 * This is not the complete particle-level Lucus core or LunArcus Protocol.
 * Future cross-system links use the shared Lucus architecture + LunArcus protocol.
 */
const GROUPS=[
  {id:1,key:'soul',groupId:'靈魂',englishName:'Soul',image:'pics/01.soul.jpg',runeIds:[1,2,3,4,5,6,7,8],routeRuneIds:[1,2,3,4,5,6,7,8]},
  {id:2,key:'link',groupId:'連結',englishName:'Link',image:'pics/02_connection.jpg',runeIds:[9,10,11,12,13,14,15,16],routeRuneIds:[9,10,11,12,13,14,15,16]},
  {id:3,key:'life',groupId:'生命',englishName:'Life',image:'pics/03_life.jpg',runeIds:[17,18,19,20,21,22,23,24],routeRuneIds:[17,18,19,20,21,22,23,24]},
  {id:4,key:'nature',groupId:'自然',englishName:'Nature',image:'pics/04_nature.jpg',runeIds:[25,26,27,28,29,30,31,32],routeRuneIds:[25,26,27,28,29,30,31,32]},
  {id:5,key:'mineral',groupId:'礦物',englishName:'Mineral',image:'pics/05_mineral.jpg',runeIds:[33,34,35,36,37,38,39,40],routeRuneIds:[33,34,35,36,37,38,39,40]},
  {id:6,key:'element',groupId:'元素',englishName:'Element',image:'pics/06_element.jpg',runeIds:[41,42,43,44,45,46,47,48],routeRuneIds:[41,42,43,44,45,46,47,48]},
  {id:7,key:'order',groupId:'秩序',englishName:'Order',image:'pics/07_order.jpg',runeIds:[49,50,51,52,53,54,55,56],routeRuneIds:[49,50,51,52,53,54,55,56]},
  {id:8,key:'disorder',groupId:'無序',englishName:'Disorder',image:'pics/08_disorder.jpg',runeIds:[57,58,59,60,61,62,63,64],routeRuneIds:[57,58,59,60,61,62,63,64]},
  {id:9,key:'special',groupId:'特殊',englishName:'Special',image:'pics/09_specia.jpg',runeIds:[65,66,0],routeRuneIds:[0,65,66]}
];

export const LRS_LUCUS_ID='LRSLucus';
export const LRS_LUCUS_GROUPS=Object.freeze(GROUPS.map(group=>Object.freeze({
  ...group,runeIds:Object.freeze([...group.runeIds]),routeRuneIds:Object.freeze([...group.routeRuneIds])
})));

const groupByRune=new Map();
const groupByDatabaseId=new Map();
const groupByEnglishName=new Map();
const groupByKey=new Map();
for(const group of LRS_LUCUS_GROUPS){
  groupByDatabaseId.set(group.groupId,group);
  groupByEnglishName.set(group.englishName.toLowerCase(),group);
  groupByKey.set(group.key,group);
  for(const runeId of group.runeIds){
    if(groupByRune.has(runeId))throw new Error('LRSLucus duplicate rune membership: '+runeId);
    groupByRune.set(runeId,group.id);
  }
}
if(groupByRune.size!==67||Array.from({length:67},(_,id)=>id).some(id=>!groupByRune.has(id)))
  throw new Error('LRSLucus must map all 67 symbols exactly once');

export const LRS_LUCUS_SYMBOLS=Object.freeze(
  Array.from({length:67},(_,runeId)=>{
    const group=LRS_LUCUS_GROUPS.find(item=>item.id===groupByRune.get(runeId));
    return Object.freeze({runeId,groupId:group.id,groupKey:group.key,groupName:group.groupId,
      symbol:runeId===0?'德':null,drawable:runeId!==0});
  })
);

export const LRS_LUCUS_DRAWABLE_RUNE_IDS=Object.freeze(
  LRS_LUCUS_SYMBOLS.filter(symbol=>symbol.drawable).map(symbol=>symbol.runeId)
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
  id:LRS_LUCUS_ID,groups:LRS_LUCUS_GROUPS,symbols:LRS_LUCUS_SYMBOLS,
  drawableRuneIds:LRS_LUCUS_DRAWABLE_RUNE_IDS,relations:LRS_LUCUS_RELATIONS
});

export function lrsLucusGroupForRune(runeId){
  const id=Number(runeId);
  if(!Number.isInteger(id)||id<0||id>66)return null;
  const groupId=groupByRune.get(id);
  return LRS_LUCUS_GROUPS.find(group=>group.id===groupId)||null;
}
export function lrsLucusGroupForDatabaseId(value){
  const key=String(value??'').trim();
  return groupByDatabaseId.get(key)||groupByEnglishName.get(key.toLowerCase())||groupByKey.get(key.toLowerCase())||null;
}
export function lrsLucusRuneIdsForGroup(groupId){
  const id=Number(groupId);
  return LRS_LUCUS_GROUPS.find(group=>group.id===id)?.runeIds||[];
}
export function lrsLucusRouteRuneIdsForGroup(groupId){
  const id=Number(groupId);
  return LRS_LUCUS_GROUPS.find(group=>group.id===id)?.routeRuneIds||[];
}
export function lrsLucusRuneNumberForRoute(groupId,localRuneId){
  const routeIds=lrsLucusRouteRuneIdsForGroup(groupId),local=Number(localRuneId);
  if(!routeIds.length||!Number.isInteger(local)||local<0||local>=routeIds.length)return null;
  return routeIds[local];
}
export function lrsLucusLocalRuneId(groupId,runeId){
  const index=lrsLucusRouteRuneIdsForGroup(groupId).indexOf(Number(runeId));
  return index<0?null:String(index).padStart(2,'0');
}
export function lrsLucusIsDrawableRune(runeId){
  const id=Number(runeId);
  return Number.isInteger(id)&&id>=1&&id<=66;
}
export function lrsLucusDrawCandidates(usedRuneIds=[]){
  const used=new Set((Array.isArray(usedRuneIds)?usedRuneIds:[]).map(Number));
  return LRS_LUCUS_DRAWABLE_RUNE_IDS.filter(id=>!used.has(id));
}
export function lrsLucusGroupRowMatches(row){
  const group=lrsLucusGroupForDatabaseId(row?.group_id);
  if(!group||String(row?.english_name??'').trim()!==group.englishName)return false;
  const ids=Array.isArray(row?.runeslist)?row.runeslist.map(Number):[];
  return ids.length===group.runeIds.length&&ids.every((id,index)=>id===group.runeIds[index]);
}
export function lrsLucusGroupRowsMatch(rows){
  if(!Array.isArray(rows)||rows.length!==LRS_LUCUS_GROUPS.length)return false;
  const ids=rows.map(row=>String(row?.group_id??'').trim());
  if(ids.some(id=>!id)||new Set(ids).size!==LRS_LUCUS_GROUPS.length)return false;
  return LRS_LUCUS_GROUPS.every(group=>
    lrsLucusGroupRowMatches(rows.find(row=>String(row?.group_id??'').trim()===group.groupId))
  );
}
