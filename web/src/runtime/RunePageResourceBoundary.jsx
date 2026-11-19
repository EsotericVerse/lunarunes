'use client';

import {useLayoutEffect,useRef,useState} from 'react';
import {releaseRuneTransientReads} from './rune-public-port.mjs';

// LRS-owned equivalent of LOC's PageResourceBoundary; no LOC imports.
// A route change first unmounts the old page, retires only its in-flight
// transient public reads, then mounts the next page on the following commit.
// Catalogue Session (67 runes / 9 groups) and native/local daily history
// are intentionally outside this page-lifetime boundary.
export default function RunePageResourceBoundary({routeKey,children}){
  const key=String(routeKey||'home');
  const [readyKey,setReadyKey]=useState(key);
  const previous=useRef(key);

  useLayoutEffect(()=>{
    if(previous.current!==key){
      releaseRuneTransientReads();
      previous.current=key;
      setReadyKey(key);
    }
  },[key]);

  if(readyKey!==key){
    return <main className="loc-next-main" aria-busy="true">
      <p className="scope-status" role="status">正在釋放上一頁資源…</p>
    </main>;
  }
  return children;
}
