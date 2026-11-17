import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRuneGpuLifecycle,shouldMountRuneMist,shouldPlayRunePrelude} from '../modules/lrs/rune/vfx/gpu-lifecycle.mjs';
import {createCardModule} from '../modules/lrs/card/draw-core.mjs';
import {readFileSync} from 'node:fs';

test('finished Rune VFX releases one WebGL context, renderer, observer and frame exactly once',()=>{
 const events=[];
 const state=createRuneGpuLifecycle({cancelFrame:id=>events.push('cancel:'+id)});
 state.trackRenderer({dispose:()=>events.push('renderer:dispose'),forceContextLoss:()=>events.push('renderer:lose')});
 state.trackContext({stopAll:()=>events.push('context:stop'),release:()=>events.push('context:release')});
 state.trackObserver({disconnect:()=>events.push('observer:disconnect')});
 state.trackFrame(42);
 assert.equal(state.release(),true);
 assert.equal(state.retired,true);
 assert.deepEqual(events,['cancel:42','observer:disconnect','context:stop','context:release','renderer:dispose','renderer:lose']);
 assert.equal(state.release(),false);
 assert.equal(events.length,6);
});
test('a late runtime resolution cannot attach a fresh renderer after unmount',()=>{
 const events=[];
 const state=createRuneGpuLifecycle({cancelFrame:id=>events.push('cancel:'+id)});
 state.release();
 state.trackFrame(9);
 state.trackRenderer({dispose:()=>events.push('renderer:dispose'),forceContextLoss:()=>events.push('renderer:lose')});
 state.trackContext({stopAll:()=>events.push('context:stop'),release:()=>events.push('context:release')});
 state.trackObserver({disconnect:()=>events.push('observer:disconnect')});
 assert.deepEqual(events,['cancel:9','renderer:dispose','renderer:lose','context:stop','context:release','observer:disconnect']);
});
test('context loss or one cleanup exception never prevents remaining releases',()=>{
 const events=[];
 const state=createRuneGpuLifecycle();
 state.trackContext({stopAll:()=>{throw Error('context already lost')},release:()=>events.push('context:release')});
 state.trackRenderer({dispose:()=>{throw Error('renderer failed')},forceContextLoss:()=>events.push('renderer:lose')});
 assert.equal(state.release(),true);
 assert.deepEqual(events,['context:release','renderer:lose']);
});

test('one-card VFX is isolated from mist during reveal; all fog is gone at result',()=>{
 const phases=['idle','waiting','drawing','revealing','transfer','ready'];
 assert.deepEqual(phases.filter(phase=>shouldMountRuneMist('duel',phase)),['drawing']);
 assert.deepEqual(phases.filter(phase=>shouldMountRuneMist('daily',phase)),['drawing']);
 assert.deepEqual(phases.filter(phase=>shouldMountRuneMist('list',phase)),[]);
 for(const phase of ['idle','revealing','transfer','ready'])
   assert.equal(shouldMountRuneMist('duel',phase),false,phase);
 assert.equal(shouldPlayRunePrelude('duel','waiting',23),true);
 assert.equal(shouldPlayRunePrelude('duel','drawing',23),false);
 assert.equal(shouldPlayRunePrelude('daily','waiting',23),false);
 assert.equal(shouldPlayRunePrelude('duel','waiting',null),false);
});

test('all single-card query stages accept the same abort signal without changing Rune data',async()=>{
 const controller=new AbortController(),calls=[];
 const runtime=createCardModule({
   projectColumns:(...fields)=>fields.join(','),
   readRows:async(table,query)=>{
     calls.push({table,signal:query.signal});
     assert.equal(query.signal,controller.signal);
     if(table==='silver.runes')return {rows:[{rune_id:3,rune_name:'生'}],dataSource:'primary'};
     return {rows:[{type:'direction',desc:'正位指引'}]};
   }
 });
 const rows=await runtime.loadDrawCards([{runeNumber:3,dir:1}],
   {staticTypes:['direction'],signal:controller.signal});
 assert.equal(rows[0].rune_etc.direction[1],'正位指引');
 assert.deepEqual(calls.map(x=>x.table),['silver.runes','silver.runes_etc']);
 controller.abort();
 assert.equal(calls.every(x=>x.signal.aborted),true);
});
test('Rune Web strips browser AbortSignal before sending JSON to LRS public Worker',()=>{
 const source=readFileSync(new URL('../web/src/main.jsx',import.meta.url),'utf8');
 assert.match(source,/const \{signal,\.\.\.publicQuery\}=query\|\|\{\}/);
 assert.match(source,/body:JSON\.stringify\(\{table,query:publicQuery\}\)/);
 assert.match(source,/\.\.\.\(signal\?\{signal\}:\{\}\)/);
});
test('the result stage never retains waiting fog after one-shot playback',()=>{
 const source=readFileSync(new URL('../app/lrunes/Rune3DPreview.jsx',import.meta.url),'utf8');
 assert.match(source,/shouldMountRuneMist\(mode,phase\)/);
 assert.match(source,/shouldPlayRunePrelude\(mode,phase,summonRuneId\)/);
 assert.match(source,/drawRequest\.current\?\.abort\(\)/);
 const effect=readFileSync(new URL('../modules/lrs/rune/vfx/EffekseerStage.jsx',import.meta.url),'utf8');
 assert.match(effect,/const gpu=createRuneGpuLifecycle/);
 assert.match(effect,/if\(retire\(\)&&!ceremony&&!waiting\)/);
});
