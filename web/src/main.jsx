import React from 'react';
import {createRoot} from 'react-dom/client';
import RuneApp from './RuneApp.jsx';
import {bindRunePublicReadPort,warmRuneBaseSession} from './runtime/rune-public-port.mjs';
import {runePublicReadUrl} from './runtime/rune-public-url.mjs';
import '../../app/styles/tokens.css';
import '../../app/styles/components.css';
import '../../app/styles/scope-system.css';
import './rune-feature-presentation.css';
import '../../app/styles/runes.css';
import './style.css';

// Browser Web reads its own LRS Worker API; Capacitor may use a separately
// configured HTTPS read endpoint. Never expose SQL credentials in the browser.
bindRunePublicReadPort(async(table,query)=>{
  // AbortSignal belongs to this browser request, never to the public-read
  // JSON payload or Worker query contract.
  const {signal,...publicQuery}=query||{};
  const endpoint=runePublicReadUrl(window.location.protocol);
  if(!endpoint)throw new Error('LRS 公開資料端點尚未設定；請確認 Worker 網域或原生 App 的 HTTPS 讀取位址。');
  const response=await fetch(endpoint,{
    method:'POST',credentials:'omit',cache:'no-store',redirect:'error',
    headers:{accept:'application/json','content-type':'application/json'},
    body:JSON.stringify({table,query:publicQuery}),
    ...(signal?{signal}:{})
  });
  const payload=await response.json().catch(()=>null);
  if(!response.ok||!Array.isArray(payload?.rows))
    throw new Error('符文公開資料讀取失敗（HTTP '+response.status+'）。');
  return {rows:payload.rows,dataSource:payload.dataSource||'lrs-database'};
});

// Catalogue prefetch is non-blocking: just 67 public single-rune entries and
// nine public groups. SessionStorage has no time TTL and stores nothing else.
void warmRuneBaseSession();

// Web-only service worker: native Capacitor IPA uses local packaged files.
// Only content-hashed JS/CSS/fonts may be cached; photos, WASM, API and daily
// IndexedDB records remain outside Cache Storage. Preview origins are isolated.
if(import.meta.env.PROD&&'serviceWorker' in navigator&&
   (location.protocol==='https:'||location.hostname==='localhost')){
  void navigator.serviceWorker.register('/sw.js',{scope:'/',updateViaCache:'none'}).catch(()=>{});
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode><RuneApp/></React.StrictMode>
);
