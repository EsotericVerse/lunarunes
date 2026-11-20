import {lazy,Suspense,useEffect,useState} from 'react';
import RunesClient from '../../app/lrunes/RunesClient.jsx';
import RuneCardHub from '../../app/lrunes/RuneCardHub.jsx';
import {ScopeLink} from './runtime/rune-navigation.jsx';
import RunePageResourceBoundary from './runtime/RunePageResourceBoundary.jsx';
import {pageFromPath} from './runtime/rune-routes.mjs';
// These are LOC's original 2D/3D presentation components, not a new gallery.
const RuneUnifiedView=lazy(()=>import('../../app/lrunes/RuneUnifiedView.jsx'));
const RuneArtNav=lazy(()=>import('../../app/lrunes/Rune3DNav.jsx'));
const RuneLocalDailyPage=lazy(()=>import('./runtime/rune-local-daily.jsx'));
const MoonwriterPage=lazy(()=>import('./reading/MoonwriterPages.jsx'));
const GameBoard=lazy(()=>import('../../modules/lrs/boardgame/GameBoard.jsx'));

// Preserve the exact body of LOC's original app/card/page.jsx. Its Next.js
// metadata belongs to LOC, while the LRS Web document owns its own title.
export default function RuneApp(){
  const [page,setPage]=useState(()=>pageFromPath(window.location.pathname));
  useEffect(()=>{
    const update=()=>setPage(pageFromPath(window.location.pathname));
    window.addEventListener('popstate',update);
    return()=>window.removeEventListener('popstate',update);
  },[]);
  return <div className="lrs-original-scope" data-lrs-original-pages="true">
    {/* LOC's outer global NAV and Footer are intentionally NOT mounted. */}
    <RunePageResourceBoundary routeKey={page}>
    <Suspense fallback={<main className="loc-next-main"><p className="scope-status" role="status">正在載入月之符文…</p></main>}>
      {page==='home'?<main className="loc-next-main" data-loc-scope="lrunes" data-loc-view="home"><RunesClient/><nav className="runes-home-nav lrs-daily-links" aria-label="符文本機紀錄">
          <ScopeLink className="loc-button" href="/daily/log/">本機每日紀錄</ScopeLink>
          <ScopeLink className="loc-button" href="/daily/trend/">本機紀錄趨勢</ScopeLink>
          <ScopeLink className="loc-button" href="/novel/moonwriter/">《月語者》小說章目</ScopeLink>
        </nav></main>
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
