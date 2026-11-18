import test from 'node:test';
import assert from 'node:assert/strict';
import {Kysely,PostgresDialect} from 'kysely';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dialect as locDialect} from '../vendor/loc-dialect/index.mjs';
import {publicRuneQuery,handlePublicRuneRead} from '../public-rune-read.mjs';
import {lrsPublicSelect,readLrsPublicRows} from '../lrs-database.mjs';

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
test('LOC Scope Hero is never queryable through the LRS Worker',()=>{
  assert.equal(publicRuneQuery(hero),null);
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
test('loc:dialect read port compiles bounded SELECT only on LRS card tables',()=>{
  const db=new Kysely({dialect:new PostgresDialect({pool:{}})});
  const query=publicRuneQuery(card);
  const compiled=lrsPublicSelect(db,query).compile();
  assert.match(compiled.sql,/select/i);
  assert.match(compiled.sql,/"silver"\."runes"/);
  assert.deepEqual(compiled.parameters,[66,1,0]);
  assert.throws(()=>lrsPublicSelect(db,{...query,schema:'private'}),/Unsupported LRS table/);
  assert.throws(()=>lrsPublicSelect(db,{...query,table:'lrunes_blocks'}),/Unsupported LRS table/);
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
  const resp=await handlePublicRuneRead(requestFor(card),
    {LRS_DATABASE_URL:'postgresql://private:password@db.example/lrs'},async()=>{throw Error('password db.example');});
  assert.equal(resp.status,503);
  const result=await resp.text();
  assert(!result.includes('password'));
  assert(!result.includes('db.example'));
  assert(!result.includes('rows'));
});

test('LRS consumes only pinned standalone loc:dialect, never the LOC framework',async()=>{
  const source=await readFile(new URL('../vendor/loc-dialect/index.mjs',import.meta.url));
  const originalBlobHash=createHash('sha1')
    .update('blob '+source.length+'\0').update(source).digest('hex');
  assert.equal(originalBlobHash,'65259840058c0ef2e251f7ca59731950263f1135',
    'LOC PR #1732 module snapshot must match its pinned source blob');
  const pkg=JSON.parse(await readFile(new URL('../vendor/loc-dialect/package.json',import.meta.url),'utf8'));
  assert.equal(pkg.name,'@lo3r/loc-dialect');
  assert.equal(pkg.private,true);
  assert.deepEqual(Object.keys(pkg.dependencies).sort(),['kysely','pg']);
  const db=locDialect('pg','postgresql://localhost/lrs_test');
  try{
    const compiled=lrsPublicSelect(db,publicRuneQuery(card)).compile();
    assert.match(compiled.sql,/"silver"\."runes"/);
    assert.deepEqual(compiled.parameters,[66,1,0]);
  }finally{await db.destroy();}
  assert.throws(()=>locDialect('pg','https://example.invalid'),/PostgreSQL URL/);
  assert.throws(()=>locDialect('mysql','postgresql://localhost/lrs_test'),/Unsupported SQL driver/);
});
