import test from 'node:test';
import assert from 'node:assert/strict';
import {LRS_MODULE,rune,card,boardgame,daily} from '../modules/lrs/index.mjs';
test('canonical lrs module IDs and URL contract',()=>{
  assert.deepEqual(LRS_MODULE.modules,{rune:'lrs:rune',boardgame:'lrs:boardgame',card:'lrs:card',daily:'lrs:daily'});
  assert.equal(LRS_MODULE.repository,'EsotericVerse/lunarunes');
  assert.equal(rune.runeAssetUrl('assets/lunarunes/cards/00.png'),'/assets/lunarunes/cards/00.png');
  assert.throws(()=>rune.runeAssetUrl('../secrets'));
  assert(card.RUNE_ALL_DRAW_MODES.some(mode=>mode.key==='ow3gs'));
});
test('lrs:boardgame operates without SQL, LOC or LunArcus',()=>{
  const rules=boardgame.localTabletopRules();
  assert.equal(rules.events.length,32);
  const engine=boardgame.createLunaRunesGame(rules,2);
  const G=engine.setup({random:{Shuffle:list=>[...list]}});
  assert.equal(G.players.length,2);
  for(let i=0;i<2;i++){
    const chosen=G.players[i].hand.slice(0,3).map(c=>c.id);
    for(const id of chosen)engine.moves.toggleCard({G},i,id);
    engine.moves.confirmOpening({G},i);
  }
  assert.equal(G.stage,'event');
});
test('lrs:card requires loc:dialect explicit read port and projections',()=>{
  assert.throws(()=>card.createCardModule(),/loc:dialect/);
  assert.throws(()=>card.createCardModule({readRows:async()=>{},projectColumns:()=>'*'}),/explicit/);
});
test('lrs:card preserves multi-card sit_q, pinned source and direction',async()=>{
  const calls=[];
  const dialect={
    projectColumns:(...cols)=>{assert(cols.includes('rune_id'));return cols.join(',');},
    readRows:async(table,query)=>{
      calls.push({table,query});
      if(table==='silver.runes')return{rows:[{rune_id:1,rune_name:'靈',card_attr:1},{rune_id:2,rune_name:'魂',card_attr:1}],dataSource:'primary'};
      if(table==='silver.runes_etc')return{rows:[{desc:'符文 '+query.filters.find(f=>f.column==='rune_id').value+' 的形容'}]};
      throw Error('Unknown relation');
    }
  };
  const runtime=card.createCardModule(dialect);
  const selected=await runtime.loadDrawCards([{runeNumber:1,dir:1},{runeNumber:2,dir:4}],{moonTypes:['sit_q'],currentMoon:'新月'});
  assert.equal(selected.length,2);
  assert.equal(selected[0].rune_etc.sit_q[1],'符文 1 的形容');
  assert.equal(selected[1].rune_etc.sit_q[4],'符文 2 的形容');
  assert.equal(calls.length,3);
  assert(calls.slice(1).every(c=>c.query.source==='primary'));
  assert(calls.slice(1).every(c=>c.query.filters.some(f=>f.column==='current_moon'&&f.value==='新月')));
  assert.match(runtime.buildFixedReading(selected,['正位','逆位'],'2card').sentence,/故/);
});
test('lrs:card preserves single-card static and moon-conditioned data reads',async()=>{
  const calls=[];
  const runtime=card.createCardModule({
    projectColumns:(...names)=>names.join(','),
    readRows:async(table,query)=>{
      calls.push({table,query});
      if(table==='silver.runes')return {rows:[{rune_id:1,rune_name:'靈'}],dataSource:'primary'};
      const moon=query.filters.find(x=>x.column==='current_moon');
      return {rows:moon?[{type:'sit_q',desc:'今日狀況'}]:[{type:'direction',desc:'正位意義'}]};
    }
  });
  const cards=await runtime.loadDrawCards([{runeNumber:1,dir:1}],{staticTypes:['direction'],moonTypes:['sit_q'],currentMoon:'滿月'});
  assert.equal(cards[0].rune_etc.direction[1],'正位意義');
  assert.equal(cards[0].rune_etc.sit_q[1],'今日狀況');
  assert.equal(calls.length,3);
  await assert.rejects(()=>runtime.loadDrawCards([{runeNumber:1,dir:1}],{moonTypes:['sit_q'],currentMoon:'未知'}),/月相/);
});

test('lrs:daily requires explicit host SQL and lunar time ports',async()=>{
  assert.equal(LRS_MODULE.identity,'lo3r@lrs');
  assert.throws(()=>daily.createDailyModule(),/loc:dialect/);
  assert.throws(()=>daily.createDailyModule({readDailyMonth:async()=>[],readDailyRange:async()=>[]}),/loc:time/);
  const calls=[];
  const runtime=daily.createDailyModule({
    readDailyMonth:async query=>{calls.push(['month',query]);return [{record_date:'2026-11-01'}];},
    readDailyRange:async query=>{calls.push(['range',query]);return [];},
    phaseAtDate:()=> '新月'
  });
  const month={year:2026,month:11};
  assert.equal((await runtime.readMonth(month))[0].record_date,'2026-11-01');
  await runtime.readRange({start:'2026-11-01',end:'2026-11-03'});
  assert.deepEqual(calls[0],['month',month]);
  const lanes=[{source:'daily:rune',scopeId:'lrunes'}];
  const moon=runtime.moonRiver('2026-11-01','2026-11-03',lanes,1);
  assert.equal(moon.length,1);
  assert.equal(moon[0].moon_phase,'新月');
  assert.equal(runtime.moonRiver('2026-11-01','2026-11-03',lanes,0).length,0);
  assert.equal(daily.DAILY_MOON_PHASES.length,5);
});

test('lrs:card owns a copied 25-column Rune66 ZModel and class hierarchy',()=>{
  assert.equal(card.LRS_CARD_CLASS,'runes66');
  assert.deepEqual(card.LRS_CARD_KEYWORD_TYPES,['item','group','class']);
  assert.equal(Object.keys(card.LRS_CARD_RUNE66_FIELDS).length,25);
  assert.equal(card.LRS_CARD_RUNE66_FIELDS.rune_id,'Int');
  assert(card.LRS_CARD_DRAW_READ_FIELDS.every(name=>Object.hasOwn(card.LRS_CARD_RUNE66_FIELDS,name)));
  assert.throws(()=>card.lrsCardRune66Columns('not_a_rune_field'),/Unknown/);
});
