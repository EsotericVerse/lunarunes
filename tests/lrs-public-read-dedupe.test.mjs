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
