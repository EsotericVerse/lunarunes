import test from 'node:test';
import assert from 'node:assert/strict';
import {publicRuneQuery,handlePublicRuneRead} from '../worker/public-rune-read.mjs';

const hero={table:'silver.lrunes_blocks',query:{
  columns:'uid,page_name,block_title,block_text,block_image,block_order',
  filters:[{column:'page_name',operator:'eq',value:'hero'}],
  orders:[{column:'block_order',ascending:true}],limit:8
}};
test('the original Hero only reads lrunes/hero with known LOC public fields',()=>{
  assert.deepEqual(publicRuneQuery(hero),{
    schema:'silver',table:'lrunes_blocks',
    columns:['uid','page_name','block_title','block_text','block_image','block_order'],
    filters:[{column:'page_name',op:'eq',value:'hero'}],
    orFilters:[],orders:[{column:'block_order',ascending:true}],
    limit:8,offset:0,head:false,count:null,cardinality:null
  });
  assert.equal(publicRuneQuery({...hero,query:{...hero.query,filters:[{column:'page_name',operator:'eq',value:'manage'}]}}),null);
});
test('the independent public read never permits arbitrary SQL tables, private fields or writes',()=>{
  assert.equal(publicRuneQuery({table:'silver.loc_user',query:hero.query}),null);
  assert.equal(publicRuneQuery({table:'silver.runes',query:{columns:'rune_id,email'}}),null);
  assert.equal(publicRuneQuery({table:'silver.runes',query:{columns:'rune_id',filters:[{column:'rune_id',operator:'delete',value:1}]}}),null);
  assert.equal(publicRuneQuery({table:'silver.runes',query:{columns:'rune_id',limit:99999}}),null);
  assert.equal(publicRuneQuery({table:'silver.lrunes_blocks',query:{columns:'uid',filters:[]}}),null);
});
test('draw and daily requests are real bounded LOC ZModel projections',()=>{
  const query=publicRuneQuery({table:'silver.runes_etc',query:{
    columns:'type,desc',filters:[
      {column:'rune_id',operator:'eq',value:66},
      {column:'dir',operator:'eq',value:1},
      {column:'type',operator:'in',value:['sit_q','daily_r']},
      {column:'current_moon',operator:'eq',value:'上弦'}
    ],limit:2,source:'loc-public'
  }});
  assert.equal(query.table,'runes_etc');
  assert.equal(query.filters.length,4);
  assert.equal(query.filters[2].op,'in');
});
test('the Worker returns only real upstream rows; no data are fabricated',async()=>{
  let called;
  const fakeFetch=async(url,options)=>{
    called={url,options};
    return new Response(JSON.stringify({data:[{rune_id:66,rune_name:'命'}]}),
      {status:200,headers:{'content-type':'application/json'}});
  };
  const request=new Request('https://lrunes.lo3rwang.cc/api/lrs/public-read',{
    method:'POST',headers:{'content-type':'application/json'},
    body:JSON.stringify({table:'silver.runes',query:{
      columns:'rune_id,rune_name',
      filters:[{column:'rune_id',operator:'eq',value:66}],
      limit:1
    }})
  });
  const result=await handlePublicRuneRead(request,fakeFetch);
  assert.equal(result.status,200);
  assert.deepEqual((await result.json()).rows,[{rune_id:66,rune_name:'命'}]);
  assert.equal(called.url,'https://loc.lo3rwang.cc/api/loc-public-query');
  assert.equal(JSON.parse(called.options.body).table,'runes');
  assert.equal(called.options.credentials,undefined);
  assert.equal(called.options.headers.authorization,undefined);
});
test('unavailable LOC data is reported as error, never an empty success',async()=>{
  const request=new Request('https://lrunes.lo3rwang.cc/api/lrs/public-read',{
    method:'POST',body:JSON.stringify(hero)
  });
  const result=await handlePublicRuneRead(request,async()=>new Response('bad gateway',{status:502}));
  assert.equal(result.status,502);
  assert.equal((await result.json()).rows,undefined);
});
