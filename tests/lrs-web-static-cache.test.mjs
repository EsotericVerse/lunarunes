import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

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
