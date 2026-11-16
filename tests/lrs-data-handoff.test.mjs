import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';

const command=new URL('../scripts/lrs-data-handoff.mjs',import.meta.url).pathname;
const contract=JSON.parse(readFileSync(new URL('../contracts/lrs-data-ownership.json',import.meta.url)));
const run=(...args)=>spawnSync(process.execPath,[command,...args],{encoding:'utf8'});
function fixture(){
 const root=mkdtempSync(join(tmpdir(),'lrs-transfer-test-'));
 const source=join(root,'source'),target=join(root,'target'),copy=join(root,'copy');
 mkdirSync(source);
 const rows=new Map();
 for(const table of contract.tables){
  let values;
  if(table.name==='runes')values=Array.from({length:67},(_,n)=>({rune_id:n,rune_name:'symbol-'+n}));
  else if(table.name==='runes_group')
   values=Array.from({length:9},(_,n)=>({group_id:String(n+1).padStart(2,'0'),english_name:'group'}));
  else if(table.name==='runes_etc')values=[
   {rune_id:1,dir:1,type:'direction',current_moon:'',desc:'static'},
   {rune_id:1,dir:1,type:'sit_q',current_moon:'新月',desc:'moon'}];
  else if(table.name==='lrunes_blocks')values=[{uid:'00000001',page_name:'hero',block_text:'intro'}];
  else if(table.name==='lrunes_daily')values=[{record_id:'date|main',record_date:'2026-11-17',rune_number:66,draw_kind:'main'}];
  else if(table.name==='lrunes_anchor')values=[{uid:'anchor01',type:'memory'}];
  else values=[{uid:'galaxy01',title:'private rune journal'}];
  rows.set(table.name,values);
  writeFileSync(join(source,table.name+'.jsonl'),values.map(x=>JSON.stringify(x)).join('\n')+'\n');
 }
 return {root,source,target,copy,rows,cleanup:()=>rmSync(root,{recursive:true,force:true})};
}
test('seven LRS-only relations are explicitly classified and private records stay private',()=>{
 assert.deepEqual(contract.tables.map(x=>x.name),[
  'runes','runes_etc','runes_group','lrunes_blocks','lrunes_daily','lrunes_anchor','lrunes_galaxy']);
 assert.deepEqual(contract.privateByDefault,['lrunes_daily','lrunes_anchor','lrunes_galaxy']);
 assert.deepEqual(contract.publicReadAllowlist,['runes','runes_etc','runes_group','lrunes_blocks']);
 assert.equal(contract.restrictedReads.lrunes_blocks,'hero-only');
 assert.equal(contract.activation,'operator-explicit-only');
});
test('pack/verify/compare give a data parity gate without DB URL or live writes',()=>{
 const fx=fixture();
 try{
  let p=run('pack',fx.source,fx.target);
  assert.equal(p.status,0,p.stderr);
  assert.equal(run('verify',fx.target).status,0);
  const m=JSON.parse(readFileSync(join(fx.target,'manifest.json')));
  assert.equal(m.owner,'lrs');
  assert.equal(m.mode,'offline-no-cutover');
  assert.equal(m.tables.length,7);
  assert(!JSON.stringify(m).includes('DATABASE_URL'));
  for(const t of m.tables)assert.match(t.semanticSha256,/^[a-f0-9]{64}$/);
  // Identical logical rows in a different export order must not count as corruption.
  const runes=fx.rows.get('runes');
  writeFileSync(join(fx.source,'runes.jsonl'),runes.toReversed().map(x=>JSON.stringify(x)).join('\n')+'\n');
  p=run('pack',fx.source,fx.copy);
  assert.equal(p.status,0,p.stderr);
  assert.equal(run('compare',fx.target,fx.copy).status,0);
  assert.notEqual(
   JSON.parse(readFileSync(join(fx.copy,'manifest.json'))).tables[0].sha256,
   JSON.parse(readFileSync(join(fx.target,'manifest.json'))).tables[0].sha256);
 }finally{fx.cleanup();}
});
test('cutover parity rejects changed or missing LRS data without printing user records',()=>{
 const fx=fixture();
 try{
  assert.equal(run('pack',fx.source,fx.target).status,0);
  const daily=fx.rows.get('lrunes_daily').map(x=>({...x,note:'sensitive sentence MUST NOT appear in logs'}));
  writeFileSync(join(fx.source,'lrunes_daily.jsonl'),daily.map(x=>JSON.stringify(x)).join('\n')+'\n');
  assert.equal(run('pack',fx.source,fx.copy).status,0);
  const result=run('compare',fx.target,fx.copy);
  assert.notEqual(result.status,0);
  assert.match(result.stderr,/lrunes_daily/);
  assert.doesNotMatch(result.stderr,/sensitive sentence/);
  // Even if someone changes the imported file after it was verified.
  writeFileSync(join(fx.target,'runes_group.jsonl'),'{}');
  assert.notEqual(run('verify',fx.target).status,0);
 }finally{fx.cleanup();}
});
test('handoff refuses extra cross-project tables, missing tables and duplicate Rune identities',()=>{
 const fx=fixture();
 try{
  writeFileSync(join(fx.source,'las_auth.jsonl'),'{"id":"a"}\n');
  assert.notEqual(run('pack',fx.source,fx.target).status,0);
  rmSync(join(fx.source,'las_auth.jsonl'));
  rmSync(join(fx.source,'lrunes_daily.jsonl'));
  assert.notEqual(run('pack',fx.source,fx.target).status,0);
  const daily=fx.rows.get('lrunes_daily');
  writeFileSync(join(fx.source,'lrunes_daily.jsonl'),daily.map(x=>JSON.stringify(x)).join('\n')+'\n');
  writeFileSync(join(fx.source,'runes_etc.jsonl'),
   [fx.rows.get('runes_etc')[0],fx.rows.get('runes_etc')[0]].map(x=>JSON.stringify(x)).join('\n')+'\n');
  const p=run('pack',fx.source,fx.target);
  assert.notEqual(p.status,0);
  assert.match(p.stderr,/duplicate primary key/);
 }finally{fx.cleanup();}
});
