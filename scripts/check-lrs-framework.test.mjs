import test from 'node:test';
import {runeAssetDirectoryUrl,runeAssetUrl} from '../modules/lrs/rune/asset-url.mjs';
import assert from 'node:assert/strict';
import {
  createLrsFramework,resolveLrsFeatureRoute,LRS_FEATURE_ROUTES,
  LRS_FEATURE_MODULES
} from '../modules/lrs/framework/index.mjs';

test('LRS owns every feature route without LOC Scope or Next.js aliases',()=>{
  const routes=[
    ['/', 'home','lrs:rune'],
    ['/card/','card-hub','lrs:card'],
    ['/card/duel/','duel','lrs:card'],
    ['/card/daily/','daily','lrs:daily'],
    ['/card/list/','list','lrs:rune'],
    ['/daily/log/','daily-log','lrs:daily'],
    ['/daily/trend/','daily-trend','lrs:daily'],
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
  assert.equal(resolveLrsFeatureRoute('/lrunes/').found,false);
  assert.equal(resolveLrsFeatureRoute('/api/lrs/public-read').found,false);
  assert.equal(resolveLrsFeatureRoute('/card/daily?d=2d').found,false);
  assert.equal(resolveLrsFeatureRoute('/novel/moonwriter/INVALID-UID').found,false);
  assert.equal(resolveLrsFeatureRoute('/novel/moonwriter/104D20F5/').params.uid,'104D20F5');
});
test('registers five independent modules, validating uniqueness',()=>{
  const f=createLrsFramework();
  assert.equal(f.listModules().length,5);
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
