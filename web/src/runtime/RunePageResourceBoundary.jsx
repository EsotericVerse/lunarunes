import {useLayoutEffect,useState} from 'react';

// Presentation boundary only: the LRS framework owns route-exit disposal.
// Old views are unmounted before the next view mounts; catalogue Session and
// IndexedDB belong to their respective long-lived data modules.
export default function RunePageResourceBoundary({routeKey,children}){
  const key=String(routeKey||'home');
  const [readyKey,setReadyKey]=useState(key);
  useLayoutEffect(()=>{
    if(readyKey!==key)setReadyKey(key);
  },[key,readyKey]);
  if(readyKey!==key)return <main className="loc-next-main" aria-busy="true">
    <p className="scope-status" role="status">正在切換符文場域…</p>
  </main>;
  return children;
}
