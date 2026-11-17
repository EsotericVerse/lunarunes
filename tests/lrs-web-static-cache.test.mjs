import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {readRuneUiSession,rememberRuneUiSession} from '../web/src/runtime/rune-ui-session.mjs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const script=read('web/public/sw.js');
const origin='https://lrs.lo3rwang.cc';
function request(path,{base=origin,method='GET',mode='cors',destination='script'}={}){
  return {url:base+path,method,mode,destination};
}
function harness({type='application/javascript',policy='public,max-age=31536000',redirected=false,
  failCache=false,setCookie=false}={}){
  const handlers=new Map(),stored=new Map(),names=new Set(['lrs-vite-static-v0','third-party-cache']);
  let calls=0;
  const cache={
    match:async r=>stored.get(r.url),
    put:async (r,v)=>{stored.set(r.url,v);},
    keys:async()=>[...stored.keys()].map(url=>({url})),
    delete:async r=>stored.delete(r.url)
  };
  const mockCaches={
    open:async name=>{if(failCache)throw Error('Quota exceeded');names.add(name);return cache;},
    keys:async()=>[...names],
    delete:async name=>names.delete(name)
  };
  const mockResponse=()=>({
    ok:true,type:'basic',redirected,
    headers:{get:name=>name==='content-type'?type:name==='cache-control'?policy:
      name==='set-cookie'&&setCookie?'session=private':null},
    clone(){return this;}
  });
  const self={location:{origin},skipWaiting:async()=>{},clients:{claim:async()=>{}},
    addEventListener:(event,handler)=>handlers.set(event,handler)};
  runInNewContext(script+'\nself.__eligible=isVersionedAsset;',{
    URL,Promise,self,caches:mockCaches,fetch:async()=>{calls++;return mockResponse();}
  });
  async function send(r){
    let result;
    handlers.get('fetch')({request:r,respondWith:p=>{result=p;}});
    return result?await result:null;
  }
  return {handlers,self,stored,names,send,calls:()=>calls};
}
test('only content-addressed same-origin Vite scripts/styles/fonts are eligible',()=>{
  const {self}=harness();
  for(const path of ['/assets/index-C8RSowqh.js',
    '/assets/RuneUnifiedView-BHYxsvuM.css','/assets/font-AbCd3_45.woff2']){
    assert.equal(self.__eligible(request(path)),true,path);
  }
  for(const path of ['/', '/card/', '/index.html','/sw.js',
    '/api/lrs/public-read','/assets/rune-art-layout.css',
    '/assets/lunarunes/cards/00.png',
    '/assets/index-ABC12345.js?session=x',
    '/pics/01.soul.jpg','/vendor/effekseer/effekseer.wasm',
    '/vendor/effekseer/Collections/Effect.efkefc','/rune-release.json',
    '/assets/index-C8RSowqh.js?version=2','/assets/index-C8RSowqh.png']){
    assert.equal(self.__eligible(request(path)),false,path);
  }
  assert.equal(self.__eligible(request('/assets/index-C8RSowqh.js',{base:'https://loc.lo3rwang.cc'})),false);
  assert.equal(self.__eligible(request('/assets/index-C8RSowqh.js',{mode:'navigate'})),false);
  assert.equal(self.__eligible(request('/assets/index-C8RSowqh.js',{method:'POST'})),false);
});
test('a second immutable JS request hits bounded Cache Storage without a second fetch',async()=>{
  const h=harness();
  await h.send(request('/assets/index-C8RSowqh.js'));
  await h.send(request('/assets/index-C8RSowqh.js'));
  assert.equal(h.calls(),1);
  assert.equal(h.stored.size,1);
  await h.send(request('/api/lrs/public-read',{method:'POST'}));
  assert.equal(h.calls(),1);
});
test('image/VFX/HTML/private/redirected responses never enter cache',async()=>{
  for(const settings of [{type:'text/html'},{type:'image/png'},
    {redirected:true},{policy:'private'},{policy:'no-store'},{setCookie:true}]){
    const h=harness(settings);
    await h.send(request('/assets/index-C8RSowqh.js'));
    await h.send(request('/assets/index-C8RSowqh.js'));
    assert.equal(h.calls(),2,JSON.stringify(settings));
    assert.equal(h.stored.size,0);
  }
});
test('Storage failure falls back to live request',async()=>{
  const h=harness({failCache:true});
  await h.send(request('/assets/index-C8RSowqh.js'));
  await h.send(request('/assets/index-C8RSowqh.js'));
  assert.equal(h.calls(),2);
});
test('cache has an upper bound and activation only removes LRS-owned older versions',async()=>{
  const h=harness();
  for(let i=0;i<105;i++)await h.send(request('/assets/chunk-'+i.toString(36).padStart(8,'0')+'.js'));
  assert.equal(h.stored.size,96);
  let task;
  h.handlers.get('activate')({waitUntil:p=>{task=p;}});
  await task;
  assert.equal(h.names.has('lrs-vite-static-v0'),false);
  assert.equal(h.names.has('third-party-cache'),true);
  assert.equal(h.names.has('lrs-vite-static-v1'),true);
});
test('LRS entry registers only its own Web SW and bypasses all private SQL/browser records',()=>{
  const entry=read('web/src/main.jsx');
  const api=read('web/src/runtime/rune-public-port.mjs');
  assert.match(entry,/import\.meta\.env\.PROD/);
  assert.match(entry,/navigator\.serviceWorker\.register\('\/sw\.js'/);
  assert.match(entry,/cache:'no-store'/);
  assert.doesNotMatch(script,/indexedDB|localStorage|sessionStorage|\/api\/lrs|caches\.addAll/);
  assert.match(api,/MAX_PENDING_PUBLIC_READS=32/);
});

test('tab Session saves only six fixed, non-sensitive Rune UI preferences',()=>{
  const values=new Map(),writes=[];
  const storage={
    getItem:key=>values.get(key)??null,
    setItem:(key,val)=>{values.set(key,val);writes.push(key);}
  };
  assert.equal(readRuneUiSession('display:duel','3d',storage),'3d');
  assert.equal(rememberRuneUiSession('display:duel','2d',storage),true);
  assert.equal(rememberRuneUiSession('display:duel','2d',storage),true);
  assert.equal(readRuneUiSession('display:duel','3d',storage),'2d');
  assert.equal(readRuneUiSession('display:list','3d',storage),'3d');
  assert.equal(writes.length,1,'unchanged display state should not rewrite Session');
  for(const [key,value,defaultValue] of [
    ['display:daily','2d','3d'],['display:list','2d','3d'],
    ['trend:range','all','year'],['trend:bucket','week','month'],
    ['trend:mode','direction','rune']
  ]){
    assert.equal(rememberRuneUiSession(key,value,storage),true);
    assert.equal(readRuneUiSession(key,defaultValue,storage),value);
  }
  assert.equal(values.size,6);
  assert([...values.keys()].every(key=>key.startsWith('lrs:rune-ui:v1:')));
});
test('no card draws, secrets, SQL or arbitrary keys can be stored in UI Session',()=>{
  const values=new Map(),storage={
    getItem:key=>values.get(key)??null,setItem:(key,val)=>values.set(key,val)
  };
  for(const key of ['token','session','db','draw','card','hero','effect','trend:records'])
    assert.equal(rememberRuneUiSession(key,'2d',storage),false,key);
  for(const value of ['66','{"rune_id":66}','select','password','0',''])
    assert.equal(rememberRuneUiSession('display:duel',value,storage),false,value);
  values.set('lrs:rune-ui:v1:display:duel','invalid');
  assert.equal(readRuneUiSession('display:duel','3d',storage),'3d');
  assert.equal(values.size,1);
});
test('blocked Session storage leaves all Rune UI functions operational',()=>{
  const denied={
    getItem(){throw Error('SecurityError');},
    setItem(){throw Error('SecurityError');}
  };
  assert.equal(readRuneUiSession('display:duel','3d',denied),'3d');
  assert.equal(rememberRuneUiSession('display:duel','2d',denied),false);
  assert.equal(readRuneUiSession('trend:bucket','month',null),'month');
  assert.equal(rememberRuneUiSession('trend:mode','rune',null),false);
});
test('standalone LRS Web UI uses Session only for displays and trend controls',()=>{
  const app=read('web/src/RuneApp.jsx');
  const unified=read('app/lrunes/RuneUnifiedView.jsx');
  const daily=read('web/src/runtime/rune-local-daily.jsx');
  assert.match(app,/readRuneUiSession\('display:'\+page,'3d'\)/);
  assert.match(app,/onViewChange=.*rememberRuneUiSession/);
  assert.match(unified,/onViewChange\?\.\(selectedFeature,next\)/);
  for(const key of ['range','bucket','mode']){
    assert.match(daily,new RegExp("readRuneUiSession\\('trend:"+key+"'"));
    assert.match(daily,new RegExp("rememberRuneUiSession\\('trend:"+key+"'"));
  }
  assert.doesNotMatch(read('web/public/sw.js'),/sessionStorage|indexedDB|localStorage/);
  assert.match(read('web/src/main.jsx'),/cache:'no-store'/);
});
