import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRuneGpuLifecycle} from '../modules/lrs/rune/vfx/gpu-lifecycle.mjs';

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
