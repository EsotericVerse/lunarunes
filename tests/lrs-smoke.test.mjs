import {test} from 'node:test';
import assert from 'node:assert/strict';
import {stat} from 'node:fs/promises';
import {createCardModule} from '../modules/lrs/card/draw-core.mjs';
import {runeAssetUrl} from '../modules/lrs/rune/asset-url.mjs';
import {publicRuneQuery,handlePublicRuneRead} from '../public-rune-read.mjs';

// 1. Only verify that selected runes, directions and current moon reach the matching reading.
// Creative interpretations, scores, artwork and visual preferences are not tested.
test('draw returns the selected rune, direction and real-moon reading',async()=>{
  const requests=[];
  const card=createCardModule({
    projectColumns:(...names)=>names.join(','),
    readRows:async(table,query)=>{
      requests.push({table,query});
      if(table==='silver.runes')return {
        rows:[{rune_id:1,rune_name:'靈'},{rune_id:66,rune_name:'命'}],
        dataSource:'lrs'
      };
      const value=column=>query.filters.find(f=>f.column===column)?.value;
      if(table==='silver.runes_etc')return {rows:[
        {desc:'rune-'+value('rune_id')+'-dir-'+value('dir')+'-'+value('current_moon')}
      ]};
      throw Error('Unexpected LRS table');
    }
  });
  const result=await card.loadDrawCards(
    [{runeNumber:1,dir:1},{runeNumber:66,dir:4}],
    {moonTypes:['sit_q'],currentMoon:'新月'}
  );
  assert.deepEqual(result.map(card=>card.rune_id),[1,66]);
  assert.equal(result[0].rune_etc.sit_q[1],'rune-1-dir-1-新月');
  assert.equal(result[1].rune_etc.sit_q[4],'rune-66-dir-4-新月');
  const meanings=requests.filter(r=>r.table==='silver.runes_etc');
  assert.equal(meanings.length,2);
  assert(meanings.every(r=>r.query.filters.some(f=>
    f.column==='current_moon'&&f.value==='新月')));
});

// 2. Only verify source files needed for visible Rune cards, group pictures and effects exist.
test('rune cards, group images and effect source files are present',async()=>{
  const exists=async relative=>{
    const file=await stat(new URL('../'+relative,import.meta.url));
    assert(file.isFile()&&file.size>0,'Missing or empty LRS asset: '+relative);
  };
  for(let id=0;id<=66;id++)
    await exists('assets/lunarunes/cards/'+String(id).padStart(2,'0')+'.png');
  for(const name of [
    '01.soul.jpg','02_connection.jpg','03_life.jpg','04_nature.jpg',
    '05_mineral.jpg','06_element.jpg','07_order.jpg','08_disorder.jpg',
    '09_specia.jpg'
  ])await exists('assets/pics/'+name);
  await exists('public/vendor/effekseer/Resources/Blow1.efkefc');
  assert.equal(runeAssetUrl('assets/lunarunes/cards/66.png'),
    '/assets/lunarunes/cards/66.png');
});

// 3. Only verify the LRS public read endpoint works with its own data and rejects
// unrelated tables, arbitrary fields and a missing database Secret. No real DB calls.
test('LRS public read accepts cards but blocks unrelated data and missing Secret',async()=>{
  const card={table:'silver.runes',query:{
    columns:'rune_id,rune_name',
    filters:[{column:'rune_id',operator:'eq',value:66}],limit:1
  }};
  assert.equal(publicRuneQuery(card)?.table,'runes');
  assert.equal(publicRuneQuery({...card,table:'silver.loc_user'}),null);
  assert.equal(publicRuneQuery({...card,query:{columns:'rune_id,email'}}),null);
  assert.equal(publicRuneQuery({table:'silver.lrunes_blocks',query:{
    columns:'uid',filters:[{column:'page_name',operator:'eq',value:'manage'}]
  }}),null);
  const request=()=>new Request('https://lrs.lo3rwang.cc/api/lrs/public-read',{
    method:'POST',headers:{'content-type':'application/json'},
    body:JSON.stringify(card)
  });
  let reads=0;
  const read=async(_url,query)=>{
    reads++;
    assert.equal(query.table,'runes');
    return {rows:[{rune_id:66,rune_name:'命'}]};
  };
  const ok=await handlePublicRuneRead(request(),{
    LRS_DATABASE_URL:'postgresql://local.invalid/lrs'
  },read);
  assert.equal(ok.status,200);
  assert.equal((await ok.json()).rows[0].rune_id,66);
  const unavailable=await handlePublicRuneRead(request(),{},read);
  assert.equal(unavailable.status,503);
  assert.equal(reads,1,'Missing Secret must never access the DB');
});
