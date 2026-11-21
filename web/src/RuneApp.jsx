import {lazy,Suspense,useEffect,useState} from 'react';
import RuneFeatureIndex from './RuneFeatureIndex.jsx';
import RuneCardHub from './runes/RuneCardHub.jsx';
import RunePageResourceBoundary from './runtime/RunePageResourceBoundary.jsx';
import {pageFromPath} from './runtime/rune-routes.mjs';
// LRS owns the 2D/3D presentation components; only the selected view is loaded.
const RuneUnifiedView=lazy(()=>import('./runes/RuneUnifiedView.jsx'));
const RuneArtNav=lazy(()=>import('./runes/Rune3DNav.jsx'));
const RuneLocalDailyPage=lazy(()=>import('./runtime/rune-local-daily.jsx'));
const MoonwriterPage=lazy(()=>import('./reading/MoonwriterPages.jsx'));
const GameBoard=lazy(()=>import('../../modules/lrs/boardgame/GameBoard.jsx'));

// This is the standalone LRS feature host, not the LOC-owned lrunes Scope.
export default function RuneApp(){
  const [page,setPage]=useState(()=>pageFromPath(window.location.pathname));
  useEffect(()=>{
    const update=()=>setPage(pageFromPath(window.location.pathname));
    window.addEventListener('popstate',update);
    return()=>window.removeEventListener('popstate',update);
  },[]);
  return <div className="lrs-feature-host" data-lrs-independent-app="true">
    {/* LOC owns the lrunes Scope, Hero, editing and global navigation. */}
    <RunePageResourceBoundary routeKey={page}>
    <Suspense fallback={<main className="loc-next-main"><p className="scope-status" role="status">正在載入月之符文…</p></main>}>
      {page==='home'?<RuneFeatureIndex/>
        :page==='novel-moonwriter'?<MoonwriterPage/>
        :page.startsWith('novel-moonwriter:')?<MoonwriterPage key={page} uid={page.split(':')[1]}/>
        :page==='card'?<RuneCardHub Navigation={RuneArtNav}/>
        :page==='daily-log'||page==='daily-trend'?<RuneLocalDailyPage view={page==='daily-log'?'log':'trend'}/>
        :page==='game'?<GameBoard/>
        :['duel','daily','list'].includes(page)
          ?<RuneUnifiedView feature={page} defaultView="3d"/>
          :<main className="loc-next-main"><p className="scope-status" role="status">找不到此符文頁面。</p></main>}
    </Suspense>
    </RunePageResourceBoundary>
  </div>;
}
