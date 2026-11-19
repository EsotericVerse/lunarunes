import React from 'react';
import {createRoot} from 'react-dom/client';
import RuneApp from './RuneApp.jsx';
import {bindRunePublicReadPort,warmRuneBaseSession} from './runtime/rune-public-port.mjs';
import {runePublicReadUrl} from './runtime/rune-public-url.mjs';
import '../../app/styles/tokens.css';
import '../../app/styles/components.css';
import '../../app/styles/scope-system.css';
import '../../app/styles/home-composition.css';
import '../../app/styles/home-content.css';
import '../../app/styles/home-runes.css';
import '../../app/styles/runes.css';
import './style.css';

// GitHub Pages is static. A real LRS public-read adapter can be configured
// only via an independently provisioned, explicitly approved HTTPS endpoint;
// Pages itself cannot process POST/SQL. Never expose SQL credentials.
bindRunePublicReadPort(async(table,query)=>{
  // AbortSignal belongs to this browser request, never to the public-read
  // JSON payload or Worker query contract.
  const {signal,...publicQuery}=query||{};
  const endpoint=runePublicReadUrl(window.location.protocol);
  if(!endpoint)throw new Error('GitHub Pages 不提供資料庫 API；符文文字資料尚未接入獨立的公開讀取來源。');
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
