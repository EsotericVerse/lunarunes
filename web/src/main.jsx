import React from 'react';
import {createRoot} from 'react-dom/client';
import RuneApp from './RuneApp.jsx';
import {bindRunePublicReadPort} from './runtime/rune-dialect.mjs';
import '../../app/styles/tokens.css';
import '../../app/styles/components.css';
import '../../app/styles/scope-system.css';
import '../../app/styles/home-composition.css';
import '../../app/styles/home-content.css';
import '../../app/styles/home-runes.css';
import '../../app/styles/runes.css';
import './style.css';

// The existing LRS Worker performs bounded read-only queries against its
// LRS_DATABASE_URL secret. Never send cookies, SQL, connection strings or
// credentials from a standalone Rune browser.
bindRunePublicReadPort(async(table,query)=>{
  const response=await fetch('/api/lrs/public-read',{
    method:'POST',credentials:'omit',cache:'no-store',redirect:'error',
    headers:{accept:'application/json','content-type':'application/json'},
    body:JSON.stringify({table,query}),
    ...(query?.signal?{signal:query.signal}:{})
  });
  const payload=await response.json().catch(()=>null);
  if(!response.ok||!Array.isArray(payload?.rows))
    throw new Error('符文公開資料讀取失敗（HTTP '+response.status+'）。');
  return {rows:payload.rows,dataSource:payload.dataSource||'lrs-database'};
});

createRoot(document.getElementById('root')).render(
  <React.StrictMode><RuneApp/></React.StrictMode>
);
