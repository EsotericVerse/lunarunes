// An intentionally tiny, no-TTL browser Session: ONLY the original public
// 67 single-rune rows and 9 rune-group rows. No other table, auth, daily,
// draw, direction/moon text, GPU state, image, HTTP response or SQL is stored.
// HTTP public-read remains no-store. Native LOC never imports this Web file.
import {LRS_CARD_RUNE66_FIELDS} from '../../../modules/lrs/card/zmodel/lrs-card-model.mjs';

const BASE_KEY='lrs:public-rune-base:v1:';
const DEFINITIONS=Object.freeze({
  'silver.runes':Object.freeze({
    limit:67,
    columns:Object.freeze(Object.keys(LRS_CARD_RUNE66_FIELDS)),
    order:'rune_id'
  }),
  'silver.runes_group':Object.freeze({
    limit:9,
    columns:Object.freeze(['group_id','english_name','desc','quality','style','runeslist']),
    order:'group_id'
  })
});
const inMemory=new Map();
function storage(){
  try{return typeof window==='undefined'?null:window.sessionStorage;}
  catch{return null;}
}
function validated(table,rows){
  const definition=DEFINITIONS[table];
  if(!definition||!Array.isArray(rows)||rows.length!==definition.limit)return false;
  if(rows.some(row=>!row||typeof row!=='object'||Array.isArray(row)||
      definition.columns.some(column=>!Object.hasOwn(row,column))))return false;
  if(table==='silver.runes'){
    const ids=new Set(rows.map(row=>Number(row.rune_id)));
    return ids.size===67&&Array.from({length:67},(_,n)=>n).every(id=>ids.has(id));
  }
  const names=rows.map(row=>String(row.group_id??'').trim());
  return names.every(Boolean)&&new Set(names).size===9;
}
export function readRuneBaseSession(table,store=storage()){
  if(!Object.hasOwn(DEFINITIONS,table))return null;
  if(inMemory.has(table))return inMemory.get(table);
  try{
    const raw=store?.getItem(BASE_KEY+table);
    if(!raw)return null;
    const parsed=JSON.parse(raw);
    if(!validated(table,parsed))return null;
    inMemory.set(table,parsed);
    return parsed;
  }catch{return null;}
}
export function storeRuneBaseSession(table,rows,store=storage()){
  if(!validated(table,rows))return false;
  // Runtime memory reuses the canonical payload, even when browser storage
  // is unavailable/full. Session persists it across same-tab page reloads.
  inMemory.set(table,rows);
  try{store?.setItem(BASE_KEY+table,JSON.stringify(rows));}catch{}
  return true;
}
export function clearRuneBaseMemory(){
  // Adapter rebind: clear memory, but preserve the tab's canonical Session.
  inMemory.clear();
}
export function runeBaseFetchQuery(table){
  const definition=DEFINITIONS[table];
  return definition?{
    columns:definition.columns.join(','),limit:definition.limit,offset:0
  }:null;
}
export function reuseRuneBaseSession(table,query,rows){
  const definition=DEFINITIONS[table];
  if(!definition||!validated(table,rows)||!query||typeof query!=='object')return null;
  const columns=typeof query.columns==='string'
    ?query.columns.split(',').map(x=>x.trim()):query.columns;
  if(!Array.isArray(columns)||!columns.length||columns.length>32||
     new Set(columns).size!==columns.length||
     columns.some(column=>!definition.columns.includes(column)))return null;
  const filters=query.filters??[],orders=query.orders??[];
  if(!Array.isArray(filters)||filters.length>5||
     !Array.isArray(orders)||orders.length>2)return null;
  if(filters.some(item=>!item||!['eq','in'].includes(item.operator)||
     !(table==='silver.runes'
       ?['rune_id','group_name'].includes(item.column)
       :item.column==='group_id')||
     (item.operator==='in'&&(!Array.isArray(item.value)||!item.value.length))))return null;
  // LRS currently orders catalogue queries by rune_id. Other SQL orderings
  // continue through the dialect to avoid subtly changing SQL NULL semantics.
  if(orders.some(o=>!o||o.column!=='rune_id'||table!=='silver.runes'||
     typeof o.ascending!=='boolean'))return null;
  const offset=query.offset??0,limit=query.limit??definition.limit;
  if(!Number.isInteger(offset)||offset<0||offset>67||
     !Number.isInteger(limit)||limit<1||limit>definition.limit)return null;
  const included=(row,item)=>{
    const value=row[item.column];
    const same=other=>item.column==='rune_id'
      ?Number(value)===Number(other)
      :String(value)===String(other);
    return item.operator==='eq'?same(item.value):item.value.some(same);
  };
  let selected=rows.filter(row=>filters.every(filter=>included(row,filter)));
  if(orders.length)selected=selected.slice().sort((a,b)=>
    (Number(a.rune_id)-Number(b.rune_id))*(orders[0].ascending?1:-1));
  return {rows:selected.slice(offset,offset+limit).map(row=>
    Object.fromEntries(columns.map(column=>[column,row[column]]))),
    dataSource:'lrs-database'};
}
