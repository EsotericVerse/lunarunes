import {lazy,Suspense,useEffect,useState} from 'react';
import RunesClient from '../../app/lrunes/RunesClient.jsx';
import {pageFromPath} from './runtime/rune-routes.mjs';
import GameBoard from '../../app/lrunes/game/GameBoard.jsx';
// These are LOC's original 2D/3D presentation components, not a new gallery.
const RuneUnifiedView=lazy(()=>import('../../app/lrunes/RuneUnifiedView.jsx'));
const RuneArtNav=lazy(()=>import('../../app/lrunes/Rune3DNav.jsx'));

// Preserve the exact body of LOC's original app/card/page.jsx. Its Next.js
// metadata belongs to LOC, while the LRS Web document owns its own title.
function RuneCardHub(){
  return <main className="loc-next-main"><section className="loc-view">
    <header className="loc-hero loc-hero-feature">
      <p className="loc-eyebrow">LunaRunes · Living Artwork</p>
      <h1>符文美術場域</h1>
      <p>以符韻原創美術為主角，選擇月光抽牌、群組畫廊或每日符文。</p>
    </header>
    <RuneArtNav/>
  </section></main>;
}

export default function RuneApp(){
  const [page,setPage]=useState(()=>pageFromPath(window.location.pathname));
  useEffect(()=>{
    const update=()=>setPage(pageFromPath(window.location.pathname));
    window.addEventListener('popstate',update);
    return()=>window.removeEventListener('popstate',update);
  },[]);
  return <div className="lrs-original-scope" data-lrs-original-pages="true">
    {/* LOC's outer global NAV and Footer are intentionally NOT mounted. */}
    <Suspense fallback={<main className="loc-next-main"><p className="scope-status" role="status">正在載入月之符文…</p></main>}>
      {page==='home'?<main className="loc-next-main"><RunesClient/></main>
        :page==='card'?<RuneCardHub/>
        :page==='game'?<GameBoard/>
        :['duel','daily','list'].includes(page)
          ?<RuneUnifiedView feature={page} defaultView="3d"/>
          :<main className="loc-next-main"><p className="scope-status" role="status">找不到此符文頁面。</p></main>}
    </Suspense>
  </div>;
}
