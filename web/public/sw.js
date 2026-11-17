/* LRS independent Web-only cache for content-hashed Vite JS/CSS/fonts.
 * The 67 original rune images, Effekseer/WASM, HTML/navigation, public SQL
 * API, auth and device-local daily records are strictly network/storage owned.
 * LOC native IPA never registers this worker.
 */
const CACHE='lrs-vite-static-v1';
const PREFIX='lrs-vite-static-';
const MAX_ENTRIES=96;
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  try{
    const names=await caches.keys();
    await Promise.all(names.filter(name=>name.startsWith(PREFIX)&&name!==CACHE)
      .map(name=>caches.delete(name)));
  }catch{/* cache permissions/quota cannot interrupt navigation */}
  await self.clients.claim();
})()));
function isVersionedAsset(request){
  if(request.method!=='GET'||request.mode==='navigate'||
     request.destination==='document')return false;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin||url.search||url.hash)return false;
  // Vite emits immutable /assets/name-<content-hash>.<extension>.
  // No media, efkefc, wasm, JSON, arbitrary APIs, or unversioned assets.
  return /^\/assets\/[^/]+-[a-zA-Z0-9_-]{8,}\.(?:js|css|woff2?)$/.test(url.pathname);
}
function mayStore(request,response){
  if(!response.ok||response.type!=='basic'||response.redirected)return false;
  const type=String(response.headers.get('content-type')||'').toLowerCase();
  const policy=String(response.headers.get('cache-control')||'').toLowerCase();
  if(/\b(?:private|no-store)\b/.test(policy)||
     response.headers.get('set-cookie')||
     response.headers.get('vary')==='*')return false;
  const path=new URL(request.url).pathname;
  if(path.endsWith('.js'))return /(?:javascript|ecmascript)/.test(type);
  if(path.endsWith('.css'))return /^text\/css(?:;|$)/.test(type);
  if(/\.(?:woff2?)$/.test(path))
    return /^(?:font\/woff2?|application\/(?:font-woff2?|octet-stream))(?:;|$)/.test(type);
  return false;
}
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(!isVersionedAsset(request))return;
  event.respondWith((async()=>{
    let cache=null;
    try{
      cache=await caches.open(CACHE);
      const hit=await cache.match(request);
      if(hit)return hit;
    }catch{cache=null;}
    const response=await fetch(request);
    if(cache&&mayStore(request,response)){
      try{
        await cache.put(request,response.clone());
        const keys=await cache.keys();
        const extra=keys.length-MAX_ENTRIES;
        if(extra>0)await Promise.all(keys.slice(0,extra).map(key=>cache.delete(key)));
      }catch{/* quota denial must never break a valid network response */}
    }
    return response;
  })());
});
