import test from 'node:test';
import assert from 'node:assert/strict';
import {bindRunePublicReadPort,selectRows} from '../web/src/runtime/rune-public-port.mjs';

test('same-time anonymous Rune reads share one request, but completed results are not retained',async()=>{
  let calls=0,finish;
  bindRunePublicReadPort(()=>{calls++;return new Promise(resolve=>{finish=resolve;});});
  const query={columns:'rune_id,rune_name',limit:1,offset:0};
  const first=selectRows('silver.runes',query);
  const second=selectRows('silver.runes',{...query});
  await Promise.resolve();
  assert.equal(calls,1,'same query should share one pending transport');
  finish({rows:[{rune_id:66}]});
  const rows=await Promise.all([first,second]);
  assert.deepEqual(rows[0],rows[1]);
  assert.equal(calls,1);
  // Let the completion callback retire the pending map entry.
  await Promise.resolve();
  bindRunePublicReadPort(async()=>{calls++;return {rows:[{rune_id:1}]};});
  await selectRows('silver.runes',query);
  assert.equal(calls,2,'a later read must use fresh SQL');
});
test('AbortSignal owners never share public-read promises',async()=>{
  let calls=0;
  bindRunePublicReadPort(async()=>{calls++;return {rows:[]};});
  const abort=new AbortController();
  const query={columns:'rune_id',limit:1,signal:abort.signal};
  await Promise.all([selectRows('silver.runes',query),selectRows('silver.runes',query)]);
  assert.equal(calls,2);
});
test('private or unsupported tables never receive a public-read cache key',async()=>{
  bindRunePublicReadPort(async()=>({rows:[]}));
  await assert.rejects(()=>selectRows('silver.loc_user',{columns:'id'}),/Unsupported LRS public table/);
});

test('switching a public-read adapter never reuses a pending result from its predecessor',async()=>{
 let resolveOld,calledNew=0;
 bindRunePublicReadPort(()=>new Promise(resolve=>{resolveOld=resolve;}));
 const query={columns:'rune_id',limit:1};
 const old=selectRows('silver.runes',query);
 await Promise.resolve();
 bindRunePublicReadPort(async()=>{calledNew++;return {rows:[{rune_id:9}]};});
 const current=await selectRows('silver.runes',{...query});
 assert.equal(calledNew,1);
 assert.equal(current.rows[0].rune_id,9);
 resolveOld({rows:[{rune_id:3}]});
 assert.equal((await old).rows[0].rune_id,3);
 const next=await selectRows('silver.runes',{...query});
 assert.equal(next.rows[0].rune_id,9);
 assert.equal(calledNew,2);
});

test('only complete 67 single-rune rows and nine groups persist in a no-TTL Session',async()=>{
 const {readRuneBaseSession,storeRuneBaseSession,clearRuneBaseMemory,
   runeBaseFetchQuery,reuseRuneBaseSession}=await import('../web/src/runtime/rune-base-session.mjs');
 const values=new Map();
 const store={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 const runeFields=Object.keys((await import('../modules/lrs/card/zmodel/lrs-card-model.mjs')).LRS_CARD_RUNE66_FIELDS);
 const runes=Array.from({length:67},(_,id)=>
   Object.fromEntries(runeFields.map(key=>[key,key==='rune_id'?id:'rune-'+id])));
 const groups=Array.from({length:9},(_,i)=>({
   group_id:'group-'+i,english_name:'group-'+i,desc:'',quality:'',style:'',runeslist:[i]
 }));
 assert.equal(storeRuneBaseSession('silver.runes',runes,store),true);
 assert.equal(storeRuneBaseSession('silver.runes_group',groups,store),true);
 assert.equal(values.size,2);
 assert.deepEqual([...values.keys()].sort(),[
   'lrs:public-rune-base:v1:silver.runes',
   'lrs:public-rune-base:v1:silver.runes_group'
 ].sort());
 clearRuneBaseMemory();
 assert.equal(readRuneBaseSession('silver.runes',store)?.length,67);
 assert.equal(readRuneBaseSession('silver.runes_group',store)?.length,9);
 assert.equal(runeBaseFetchQuery('silver.runes').limit,67);
 assert.equal(runeBaseFetchQuery('silver.runes_group').limit,9);
 const selected=reuseRuneBaseSession('silver.runes',{
   columns:'rune_id,rune_name',filters:[{column:'rune_id',operator:'in',value:[66,0]}],
   orders:[{column:'rune_id',ascending:true}],limit:2,offset:0
 },runes);
 assert.deepEqual(selected.rows,[{rune_id:0,rune_name:'rune-0'},{rune_id:66,rune_name:'rune-66'}]);
 assert.equal(storeRuneBaseSession('silver.runes_etc',[],store),false);
 assert.equal(storeRuneBaseSession('silver.lrunes_blocks',[],store),false);
 assert.equal(storeRuneBaseSession('silver.runes',runes.slice(0,66),store),false);
 assert.equal(values.size,2);
});
test('partial catalogue cannot become a cached full dataset',async()=>{
 const {readRuneBaseSession,storeRuneBaseSession,clearRuneBaseMemory}=await import('../web/src/runtime/rune-base-session.mjs');
 const values=new Map();
 const store={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 clearRuneBaseMemory();
 assert.equal(storeRuneBaseSession('silver.runes',Array.from({length:67},(_,i)=>({rune_id:i})),store),false);
 assert.equal(storeRuneBaseSession('silver.runes_group',[{group_id:'one'}],store),false);
 assert.equal(readRuneBaseSession('silver.runes',store),null);
 assert.equal(values.size,0);
});
test('catalogue eager fetch shares in-flight requests and never stores directions or lunar readings',async()=>{
 const {clearRuneBaseMemory}=await import('../web/src/runtime/rune-base-session.mjs');
 clearRuneBaseMemory();
 let runeCalls=0,groupCalls=0,verseCalls=0;
 const model=(await import('../modules/lrs/card/zmodel/lrs-card-model.mjs')).LRS_CARD_RUNE66_FIELDS;
 const runeFields=Object.keys(model);
 const runes=Array.from({length:67},(_,id)=>
   Object.fromEntries(runeFields.map(key=>[key,key==='rune_id'?id:key==='rune_name'?'r'+id:null])));
 const groups=Array.from({length:9},(_,i)=>({
   group_id:'g'+i,english_name:'g'+i,desc:'',quality:'',style:'',runeslist:[i]
 }));
 bindRunePublicReadPort(async table=>{
   if(table==='silver.runes'){runeCalls++;return {rows:runes};}
   if(table==='silver.runes_group'){groupCalls++;return {rows:groups};}
   verseCalls++;return {rows:[{desc:'verse'}]};
 });
 const {warmRuneBaseSession}=await import('../web/src/runtime/rune-public-port.mjs');
 await Promise.all([warmRuneBaseSession(),warmRuneBaseSession()]);
 const single=await selectRows('silver.runes',{
   columns:'rune_id,rune_name',filters:[{column:'rune_id',operator:'eq',value:12}],limit:1
 });
 assert.deepEqual(single.rows,[{rune_id:12,rune_name:'r12'}]);
 const readGroup=await selectRows('silver.runes_group',{columns:'group_id,desc',limit:9});
 assert.equal(readGroup.rows.length,9);
 const verse=await selectRows('silver.runes_etc',{columns:'desc',limit:1});
 assert.deepEqual(verse.rows,[{desc:'verse'}]);
 assert.deepEqual([runeCalls,groupCalls,verseCalls],[1,1,1]);
 await selectRows('silver.runes_etc',{columns:'desc',limit:1});
 assert.equal(verseCalls,2,'lunar/directional verses must never be saved in Session');
});
