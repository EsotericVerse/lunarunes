import {Suspense,useEffect,useSyncExternalStore} from 'react';
import RunePageResourceBoundary from './runtime/RunePageResourceBoundary.jsx';
import {lrsFramework,attachLrsBrowser} from './runtime/lrs-app-runtime.mjs';
import {LrsFeatureRenderer} from './runtime/lrs-feature-views.jsx';

// LRS core selects module/route; React is only one possible renderer adapter.
export default function RuneApp(){
  const route=useSyncExternalStore(lrsFramework.subscribe,lrsFramework.getSnapshot,lrsFramework.getSnapshot);
  useEffect(()=>attachLrsBrowser(),[]);
  return <div className="lrs-feature-host" data-lrs-independent-app="true">
    <RunePageResourceBoundary routeKey={route.key}>
      <Suspense fallback={<main className="loc-next-main"><p className="scope-status" role="status">正在載入符文功能…</p></main>}>
        <LrsFeatureRenderer route={route}/>
      </Suspense>
    </RunePageResourceBoundary>
  </div>;
}
