import test from 'node:test';
import {runeAssetDirectoryUrl,runeAssetUrl} from '../modules/lrs/rune/asset-url.mjs';
import assert from 'node:assert/strict';
import {buildDailyInterpretation} from '../modules/lrs/card/daily/interpretation.mjs';
import {
  createLrsFramework,resolveLrsFeatureRoute,LRS_FEATURE_ROUTES,
  LRS_FEATURE_MODULES
} from '../modules/lrs/framework/index.mjs';

test('LRS owns every feature route without LOC Scope or Next.js aliases',()=>{
  const routes=[
    ['/', 'home','lrs:rune'],
    ['/card/','card-hub','lrs:card'],
    ['/card/duel/','duel','lrs:card'],
    ['/card/daily/','daily','lrs:card'],
    ['/card/daily/reading/','daily-reading','lrs:card'],
    ['/daily/','daily','lrs:card'],
    ['/card/list/','list','lrs:rune'],
    ['/card/daily/log/','daily-log','lrs:card'],
    ['/card/daily/trend/','daily-trend','lrs:card'],
    ['/daily/log/','daily-log','lrs:card'],
    ['/daily/trend/','daily-trend','lrs:card'],
    ['/game/','game','lrs:boardgame'],
    ['/game/room/','game','lrs:boardgame'],
    ['/novel/moonwriter/','novel-moonwriter','lrs:reading'],
    ['/novel/moonwriter/104D20F5/','novel-moonwriter-chapter','lrs:reading']
  ];
  for(const [path,id,module] of routes){
    const matched=resolveLrsFeatureRoute(path);
    assert.equal(matched.id,id,path);
    assert.equal(matched.module,module,path);
    assert.equal(matched.found,true,path);
  }
  // Three LRS-owned module roots must resolve to live component contracts.
  assert.equal(resolveLrsFeatureRoute('/card/').view,'card-hub');
  assert.deepEqual(resolveLrsFeatureRoute('/card/daily/').params,{feature:'daily'});
  assert.equal(resolveLrsFeatureRoute('/card/daily/').view,'rune-presentation');
  assert.equal(resolveLrsFeatureRoute('/card/daily/reading/').view,'daily-reading');
  assert.equal(resolveLrsFeatureRoute('/game/').view,'game-board');
  assert.equal(resolveLrsFeatureRoute('/daily/').path,'/card/daily');
  assert.equal(resolveLrsFeatureRoute('/daily/log/').path,'/card/daily/log');
  assert.equal(resolveLrsFeatureRoute('/daily/trend/').path,'/card/daily/trend');
  assert.equal(resolveLrsFeatureRoute('/lrunes/').found,false);
  assert.equal(resolveLrsFeatureRoute('/api/lrs/public-read').found,false);
  assert.equal(resolveLrsFeatureRoute('/card/daily?d=2d').found,false);
  assert.equal(resolveLrsFeatureRoute('/novel/moonwriter/INVALID-UID').found,false);
  assert.equal(resolveLrsFeatureRoute('/novel/moonwriter/104D20F5/').params.uid,'104D20F5');
});
test('registers four independent modules, with daily inside card',()=>{
  const f=createLrsFramework();
  assert.equal(f.listModules().length,4);
  assert.deepEqual(
    [...new Set(LRS_FEATURE_ROUTES.map(x=>x.module))].sort(),
    LRS_FEATURE_MODULES.map(x=>x.id).sort()
  );
  assert.equal(f.getModule('lrs:reading').name,'reading');
  assert.throws(()=>f.registerModule({id:'lrs:rune'}),/Duplicate/);
  assert.throws(()=>f.registerModule({id:'loc:scope'}),/Invalid/);
  f.dispose();
});
test('transitions release transient work before notifying subscribers',()=>{
  const events=[];
  const f=createLrsFramework({
    initialPath:'/',onRouteLeave:(previous,next)=>events.push('leave:'+previous.id+':'+(next?.id||'none'))
  });
  const unlisten=f.subscribe(()=>events.push('view:'+f.getSnapshot().id));
  assert.equal(f.enter('/card/list/').id,'list');
  assert.deepEqual(events,['leave:home:list','view:list']);
  f.enter('/card/list/');
  assert.equal(events.length,2,'the same route must not force a GPU teardown');
  f.enter('/novel/moonwriter/104D20F5/');
  assert.equal(f.getSnapshot().params.uid,'104D20F5');
  unlisten();
  f.enter('/game/');
  assert.equal(events.at(-1),'leave:novel-moonwriter-chapter:game');
  f.dispose();
  assert.equal(events.at(-1),'leave:game:none');
  assert.equal(f.subscribe?.constructor,Function);
});

test('Effekseer directory URLs preserve valid paths and reject traversal',()=>{
  assert.equal(runeAssetDirectoryUrl('vendor/effekseer/'),'/vendor/effekseer/');
  assert.equal(runeAssetUrl('vendor/effekseer/effekseer.wasm'),'/vendor/effekseer/effekseer.wasm');
  assert.throws(()=>runeAssetUrl('vendor/effekseer/'),/Unsafe/);
  assert.throws(()=>runeAssetDirectoryUrl('vendor/../effekseer/'),/Unsafe/);
  assert.throws(()=>runeAssetDirectoryUrl('vendor//effekseer/'),/Unsafe/);
});

test('daily synthesis preserves source fields, selected direction and phase',()=>{
  const card={rune_id:8,moon_phase:2,rune_description:'原始符文描述',rune_etc:{
    direction:{2:'半正位原文'},
    sit_q:{2:'當下的原文情境'},sit_a:{2:'當下的原文表達'},
    daily_r:{2:'今天的原文提醒'},daily_g:{2:'今天的原文引導'},
    daily_b:{2:'今天的原文祝福'}
  }};
  const read=buildDailyInterpretation({card,directionIndex:1,moon:'上弦'});
  assert.equal(read.direction,'半正位');
  assert.equal(read.directionMeaning,'半正位原文');
  assert.equal(read.moonRelation,'same');
  assert.equal(read.runeDescription,'原始符文描述');
  assert.deepEqual(read.stages.map(x=>x.id),['situation','reminder','guidance','blessing']);
  assert.deepEqual(read.stages[0].sources.map(x=>x.text),
    ['當下的原文情境','當下的原文表達']);
  assert.equal(read.originalCount,5);
  assert.deepEqual(read.missing,[]);
  assert.equal(buildDailyInterpretation({card,directionIndex:4,moon:'上弦'}),null);
  assert.equal(buildDailyInterpretation({card:{rune_id:0},directionIndex:0}),null);
});

test('special rune reading omits absent original guidance without inventing text',()=>{
  const read=buildDailyInterpretation({card:{rune_id:65,rune_etc:{
    sit_q:{4:'原文情境'},sit_a:{4:'原文表達'}
  }},directionIndex:3,moon:'空亡'});
  assert.equal(read.cardMoon,null);
  assert.equal(read.moonRelation,'not-marked');
  assert.equal(read.originalCount,2);
  assert.deepEqual(read.stages.map(s=>s.id),['situation']);
  assert.deepEqual(read.missing,['每日占卜提醒','每日占卜引導','每日占卜祝福']);
  assert.equal(buildDailyInterpretation({card:{rune_id:66},directionIndex:0,moon:'未知'}).stages.length,0);
  assert.equal(buildDailyInterpretation({card:{rune_id:8,moon_phase:1},
    directionIndex:0,moon:'上弦'}).moonRelation,'different');
});

import {lrsConnectionString} from '../lrs-postgres.mjs';
import {handlePublicRuneRead} from '../public-rune-read.mjs';
import {readPublicMoonwriter} from '../public-moonwriter-read.mjs';

test('LRS database reads require Hyperdrive and never fall back to the old secret',async()=>{
  const url='postgresql://user:example@hyperdrive.invalid:5432/db';
  const env={LRS_HYPERDRIVE:{connectionString:url},LRS_DATABASE_URL:'postgresql://legacy.invalid/db'};
  assert.equal(lrsConnectionString(env),url);
  assert.equal(lrsConnectionString({LRS_DATABASE_URL:env.LRS_DATABASE_URL}),null);
  assert.equal(lrsConnectionString({LRS_HYPERDRIVE:{connectionString:'invalid'}}),null);
  const request=()=>new Request('https://lrs.example/api/lrs/public-read',{method:'POST',body:JSON.stringify({table:'silver.runes_group',query:{columns:['group_id'],limit:1}})});
  let calls=0;
  const read=async(connection,query)=>{calls++;assert.equal(connection,url);assert.equal(query.table,'runes_group');return {rows:[{group_id:1}]};};
  assert.equal((await handlePublicRuneRead(request(),env,read)).status,200);
  assert.equal((await handlePublicRuneRead(request(),{LRS_DATABASE_URL:env.LRS_DATABASE_URL},read)).status,503);
  assert.equal(calls,1);
  assert.equal((await readPublicMoonwriter(new Request('https://lrs.example/api/lrs/moonwriter/104D20F5'),{LRS_DATABASE_URL:env.LRS_DATABASE_URL})).status,503);
});

import {createRoom,joinRoom,roomSnapshot,applyRoomAction} from '../modules/lrs/boardgame/online-room.mjs';
test('online room preserves seat ownership, hidden hands, and the existing event engine',()=>{
  const a='a'.repeat(32),b='b'.repeat(32),room=createRoom(2,a);
  assert.equal(joinRoom(room,b),1);assert.equal(joinRoom(room,b),1);
  assert.throws(()=>joinRoom(room,'c'.repeat(32)));
  assert.throws(()=>applyRoomAction(room,1,{action:'start'}));
  applyRoomAction(room,0,{action:'start'});
  assert.equal(roomSnapshot(room,0).game.players[1].hand.length,0);
  assert.equal(roomSnapshot(room,0).game.players[1].handCount,8);
  assert.equal('tokens' in roomSnapshot(room,0),false);
  const move=(seat,action,extra={})=>applyRoomAction(room,seat,{action,stage:room.game.stage,round:room.game.round,...extra});
  assert.throws(()=>move(1,'confirmOpening'));
  for(const seat of [0,1]){
    for(const c of room.game.players[seat].hand.slice(0,3))move(seat,'toggleCard',{cardId:c.id,selected:true});
    move(seat,'confirmOpening');
  }
  assert.equal(room.game.stage,'event');
  for(const seat of [1,0])for(const c of room.game.players[seat].hand.slice(0,3))move(seat,'toggleCard',{cardId:c.id,selected:true});
  move(0,'resolveEvent');assert.equal(room.game.round,2);
  assert.throws(()=>applyRoomAction(room,0,{action:'resolveEvent',stage:'event',round:1}));
});
test('online and local game routes have different lifecycle keys',()=>{
  const local=resolveLrsFeatureRoute('/game/'),online=resolveLrsFeatureRoute('/game/room/');
  assert.equal(local.params.online,false);assert.equal(online.params.online,true);assert.notEqual(local.key,online.key);
});
