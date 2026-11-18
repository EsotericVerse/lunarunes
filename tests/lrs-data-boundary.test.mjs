import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const contract=JSON.parse(read('contracts/lrs-data-ownership.json'));
test('Worker public Rune endpoint never automatically exposes migrated private records',()=>{
 const code=read('public-rune-read.mjs');
 const publicPart=code.split('const TABLE_FIELDS=Object.freeze(')[1].split('const FILTER_FIELDS=')[0];
 const tables=[...publicPart.matchAll(/'silver\.([a-z_]+)'/g)].map(x=>x[1]);
 assert.deepEqual(tables,contract.publicReadAllowlist);
 for(const privateTable of contract.privateByDefault){
  assert(!tables.includes(privateTable));
  assert.equal(contract.tables.find(t=>t.name===privateTable).publicRead,'never');
 }
 assert.equal(contract.tables.find(t=>t.name==='lrunes_blocks').publicRead,'never');
 assert(!tables.includes('lrunes_blocks'));
 assert(!code.includes("'silver.lrunes_blocks'"));
});
test('LRS controls only its own connection binding; no LOC/LAS credential fallback',()=>{
 const worker=read('index.mjs');
 const readEndpoint=read('public-rune-read.mjs');
 const backend=read('lrs-database.mjs');
 const web=read('web/src/main.jsx');
 assert.match(worker,/handlePublicRuneRead/);
 assert.match(readEndpoint,/env\?\.LRS_DB_URL/);
 assert.match(backend,/LRS_DB_URL/);
 assert.match(web,/credentials:'omit'/);
 for(const name of ['LOC_DATABASE_URI','LAS_DATABASE_URL','LOC_AUTH_DATABASE_URL']){
  assert(!worker.includes(name)&&!readEndpoint.includes(name)&&!backend.includes(name)&&!web.includes(name));
 }
 assert(!web.includes('LRS_DB_URL:'));
});
