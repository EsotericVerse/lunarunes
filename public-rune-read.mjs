// LRS owns its standalone public Rune read endpoint; LOC keyword analysis,
// Z-Model Galaxy/Anchor and existing tables are NOT moved or modified.
// Validate the fixed Rune projection before passing it to the host data port.
import {LRS_CARD_RUNE66_FIELDS} from './modules/lrs/card/zmodel/lrs-card-model.mjs';

const TABLE_FIELDS=Object.freeze({
  'silver.runes':new Set(Object.keys(LRS_CARD_RUNE66_FIELDS)),
  'silver.runes_etc':new Set(['rune_id','dir','type','current_moon','desc']),
  'silver.runes_group':new Set(['group_id','english_name','desc','quality','style','runeslist'])
});
const FILTER_FIELDS=Object.freeze({
  'silver.runes':new Set(['rune_id','group_name']),
  'silver.runes_etc':new Set(['rune_id','dir','type','current_moon']),
  'silver.runes_group':new Set(['group_id'])
});
const LIMITS=Object.freeze({'silver.runes':67,'silver.runes_etc':20,'silver.runes_group':9});
const HEADERS={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'};
const response=(data,status)=>new Response(JSON.stringify(data),{status,headers:HEADERS});
function invalid(){return response({error:'Invalid LRS public Rune query'},400);}
export function publicRuneQuery(body){
  if(!body||typeof body!=='object'||Array.isArray(body)||
    Object.keys(body).some(key=>!['table','query'].includes(key)))return null;
  const table=String(body.table||''),allowed=TABLE_FIELDS[table],query=body.query;
  if(!allowed||!query||typeof query!=='object'||Array.isArray(query))return null;
  if(Object.keys(query).some(key=>!['columns','filters','orders','limit','offset','signal','source'].includes(key)))return null;
  const columns=typeof query.columns==='string'
    ?query.columns.split(',').map(s=>s.trim()):query.columns;
  if(!Array.isArray(columns)||columns.length<1||columns.length>32||
    columns.some(c=>!allowed.has(c))||new Set(columns).size!==columns.length)return null;
  const filters=query.filters??[];
  if(!Array.isArray(filters)||filters.length>5)return null;
  const mapped=[];
  for(const item of filters){
    if(!item||typeof item!=='object'||Array.isArray(item)||
      Object.keys(item).some(k=>!['column','operator','value'].includes(k))||
      !FILTER_FIELDS[table].has(item.column)||!['eq','in'].includes(item.operator))return null;
    if(item.operator==='in'){
      if(!Array.isArray(item.value)||item.value.length<1||item.value.length>67||
        item.value.some(v=>typeof v!=='string'&&typeof v!=='number'))return null;
    }else if(typeof item.value!=='string'&&typeof item.value!=='number')return null;
    if(typeof item.value==='string'&&item.value.length>70)return null;
    mapped.push({column:item.column,op:item.operator,value:item.value});
  }
  const orders=query.orders??[];
  if(!Array.isArray(orders)||orders.length>2||
    orders.some(o=>!o||typeof o!=='object'||!allowed.has(o.column)||
      typeof o.ascending!=='boolean'))return null;
  const limit=query.limit??LIMITS[table],offset=query.offset??0;
  if(!Number.isInteger(limit)||limit<1||limit>LIMITS[table]||
    !Number.isInteger(offset)||offset<0||offset>67)return null;
  return {
    schema:'silver',table:table.slice('silver.'.length),columns,
    filters:mapped,orFilters:[],orders,limit,offset,
    head:false,count:null,cardinality:null
  };
}
export async function handlePublicRuneRead(request,dataPort){
  if(request.method!=='POST')return response({error:'Method not allowed'},405);
  if(Number(request.headers.get('content-length')||0)>12000)return invalid();
  let body;
  try{body=await request.json();}catch{return invalid();}
  const query=publicRuneQuery(body);
  if(!query)return invalid();

  // Host supplies a fixed read capability, never a connection or SQL from the caller.
  if(typeof dataPort?.readRuneRows!=='function')
    return response({error:'LRS database connection is not configured'},503);
  try{
    const result=await dataPort.readRuneRows(query,{signal:request.signal});
    if(!result||!Array.isArray(result.rows))
      return response({error:'Invalid LRS database read response'},502);
    return response({rows:result.rows,dataSource:'lrs-database'},200);
  }catch(error){
    // Never echo SQL, host names, credentials or database driver errors.
    if(error?.code==='DATABASE_NOT_CONFIGURED')
      return response({error:'LRS database connection is not configured'},503);
    return response({error:'LRS database read unavailable'},503);
  }
}
