import test from 'node:test';
import assert from 'node:assert/strict';
import {Kysely,PostgresDialect,MysqlDialect,MssqlDialect} from 'kysely';
import {publicRuneQuery,handlePublicRuneRead} from '../worker/public-rune-read.mjs';
import {lrsPhysicalSchema,lrsPublicSelect,readLrsPublicRows} from '../worker/lrs-database.mjs';

const hero={table:'silver.lrunes_blocks',query:{
  columns:'uid,page_name,block_title,block_text,block_image,block_order',
  filters:[{column:'page_name',operator:'eq',value:'hero'}],
  orders:[{column:'block_order',ascending:true}],limit:8
}};
const card={table:'silver.runes',query:{
  columns:'rune_id,rune_name',filters:[{column:'rune_id',operator:'eq',value:66}],limit:1
}};
const requestFor=body=>new Request('https://lrunes.lo3rwang.cc/api/lrs/public-read',{
  method:'POST',headers:{'content-type':'application/json'},
  body:JSON.stringify(body)
});
test('the original Hero only reads the existing silver.lrunes_blocks hero rows',()=>{
  assert.deepEqual(publicRuneQuery(hero),{
    schema:'silver',table:'lrunes_blocks',
    columns:['uid','page_name','block_title','block_text','block_image','block_order'],
    filters:[{column:'page_name',op:'eq',value:'hero'}],
    orFilters:[],orders:[{column:'block_order',ascending:true}],
    limit:8,offset:0,head:false,count:null,cardinality:null
  });
  assert.equal(publicRuneQuery({...hero,query:{...hero.query,
    filters:[{column:'page_name',operator:'eq',value:'manage'}]}}),null);
});
test('LRS public reads never allow arbitrary databases, tables, columns or writes',()=>{
  assert.equal(publicRuneQuery({table:'silver.loc_user',query:hero.query}),null);
  assert.equal(publicRuneQuery({table:'other.runes',query:card.query}),null);
  assert.equal(publicRuneQuery({table:'silver.runes',query:{columns:'rune_id,email'}}),null);
  assert.equal(publicRuneQuery({table:'silver.runes',query:{columns:'rune_id',filters:[
    {column:'rune_id',operator:'delete',value:1}]}}),null);
  assert.equal(publicRuneQuery({table:'silver.runes',query:{columns:'rune_id',limit:99999}}),null);
  assert.equal(publicRuneQuery({table:'silver.lrunes_blocks',query:{columns:'uid',filters:[]}}),null);
  assert.equal(publicRuneQuery({table:'silver.runes',query:{columns:'rune_id',
    filters:[{column:'rune_id',operator:'in',value:[]}]}}),null);
  assert.equal(publicRuneQuery({table:'silver.runes',query:{
    columns:'rune_id',database_url:'postgres://malicious.invalid'}}),null);
});
test('daily and card data preserve exact Z-Model field and moon conditions',()=>{
  const query=publicRuneQuery({table:'silver.runes_etc',query:{
    columns:'type,desc',filters:[
      {column:'rune_id',operator:'eq',value:66},
      {column:'dir',operator:'eq',value:1},
      {column:'type',operator:'in',value:['sit_q','daily_r']},
      {column:'current_moon',operator:'eq',value:'上弦'}
    ],limit:2
  }});
  assert.equal(query.table,'runes_etc');
  assert.equal(query.filters.length,4);
  assert.equal(query.filters[2].op,'in');
});
test('loc:dialect read port compiles only bounded prepared SELECT on the fixed LRS table',()=>{
  const db=new Kysely({dialect:new PostgresDialect({pool:{}})});
  const query=publicRuneQuery(hero);
  const sql=lrsPublicSelect(db,query).compile();
  assert.match(sql.sql,/select/i);
  assert.match(sql.sql,/"silver"\."lrunes_blocks"/);
  assert.match(sql.sql,/"page_name" = \$1/);
  assert.match(sql.sql,/order by "block_order" asc/i);
  assert.deepEqual(sql.parameters,['hero',8,0]);
  assert.throws(()=>lrsPublicSelect(db,{...query,schema:'private'}),/Unsupported LRS table/);
  assert.throws(()=>lrsPublicSelect(db,{...query,table:'loc_user'}),/Unsupported LRS table/);
});
test('Worker calls its own LRS_DATABASE_URL once and never contacts LOC site',async()=>{
  let received;
  const read=async(url,query)=>{
    received={url,query};
    return {rows:[{rune_id:66,rune_name:'命'}]};
  };
  const resp=await handlePublicRuneRead(requestFor(card),
    {LRS_DATABASE_URL:'postgresql://private.example:5432/lrs'},read);
  assert.equal(resp.status,200);
  assert.deepEqual(await resp.json(),{
    rows:[{rune_id:66,rune_name:'命'}],dataSource:'lrs-database'
  });
  assert.equal(received.url,'postgresql://private.example:5432/lrs');
  assert.equal(received.query.table,'runes');
});
test('missing Secret fails closed; original art/Web remains independent',async()=>{
  let called=false;
  const resp=await handlePublicRuneRead(requestFor(card),{},async()=>{
    called=true;return {rows:[]};
  });
  assert.equal(resp.status,503);
  assert.equal(called,false);
  assert.match((await resp.json()).error,/not configured/);
  await assert.rejects(readLrsPublicRows('',publicRuneQuery(card)),/LRS_DATABASE_URL/);
});
test('failed database connections never expose credentials or fake empty data',async()=>{
  const resp=await handlePublicRuneRead(requestFor(hero),
    {LRS_DATABASE_URL:'postgresql://private:password@db.example/lrs'},async()=>{throw Error('password db.example');});
  assert.equal(resp.status,503);
  const result=await resp.text();
  assert(!result.includes('password'));
  assert(!result.includes('db.example'));
  assert(!result.includes('rows'));
});

test('LRS physical table location is Worker-owned and cannot be selected by a public client',async()=>{
  assert.equal(lrsPhysicalSchema('lrs'),'lrs');
  assert.throws(()=>lrsPhysicalSchema('loc.private'),/Invalid LRS/);
  assert.throws(()=>lrsPhysicalSchema('information_schema'),/Invalid LRS/);
  const q=publicRuneQuery(card);
  const pg=new Kysely({dialect:new PostgresDialect({pool:{}})});
  const statement=lrsPublicSelect(pg,q,{schema:'lrs'}).compile();
  assert.match(statement.sql,/"lrs"\."runes"/);
  assert.deepEqual(statement.parameters,[66,1,0]);
  assert.throws(()=>lrsPublicSelect(pg,q,{schema:'loc.private'}),/Invalid LRS/);
  let physical;
  const response=await handlePublicRuneRead(requestFor(card),{
    LRS_DATABASE_URL:'postgresql://lrs-only.example/runes',
    LRS_DATABASE_SCHEMA:'lrs'
  },async(_url,_q,options)=>{physical=options.schema;return {rows:[]}});
  assert.equal(response.status,200);
  assert.equal(physical,'lrs');
  assert.equal(publicRuneQuery({...card,query:{...card.query,schema:'loc'}}),null);
});

test('one LRS read query compiles under PostgreSQL, MySQL and MSSQL without driver access',()=>{
  // This proves SQL compilation portability, NOT live connectivity, DDL or
  // that every target server has already been provisioned.
  const query=publicRuneQuery(hero);
  const dialects=[
    ['postgres',new PostgresDialect({pool:{}})],
    ['mysql',new MysqlDialect({pool:{}})],
    ['mssql',new MssqlDialect({tedious:{},tarn:{}})]
  ];
  for(const [name,dialect] of dialects){
    const db=new Kysely({dialect});
    const compiled=lrsPublicSelect(db,query,{schema:'lrs'}).compile();
    assert.match(compiled.sql,/select/i,name);
    assert.match(compiled.sql,/lrunes_blocks/i,name);
    assert.match(compiled.sql,/page_name/i,name);
    assert.match(compiled.sql,/order by/i,name);
    assert(compiled.parameters.includes('hero'),name+' must bind filter values');
  }
});
