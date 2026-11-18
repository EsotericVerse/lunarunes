import {lazy,Suspense,useEffect,useState} from 'react';
import RuneCardHub from '../../app/lrunes/RuneCardHub.jsx';
import {pageFromPath} from './runtime/rune-routes.mjs';
import GameBoard from '../../modules/lrs/boardgame/GameBoard.jsx';

// LRS Web publishes only draw/card and game. The lrunes Scope homepage,
// daily records, culture, statistics, search and management belong to LOC.
const RuneUnifiedView=lazy(()=>import('../../app/lrunes/RuneUnifiedView.jsx'));
const RuneArtNav=lazy(()=>import('../../app/lrunes/Rune3DNav.jsx'));
const LOC_RUNE_SCOPE='https://lrunes.lo3rwang.cc/';

function ScopeHomeLink(){
  return <main className="loc-next-main"><section className="loc-view">
    <p>月之符文的首頁與紀錄由 LunaCodex 管理。</p>
    <a className="loc-button" href={LOC_RUNE_SCOPE}>前往月之符文首頁</a>
  </section></main>;
}

export default function RuneApp(){
  const [page,setPage]=useState(()=>pageFromPath(window.location.pathname));
  useEffect(()=>{
    const update=()=>setPage(pageFromPath(window.location.pathname));
    window.addEventListener('popstate',update);
    return()=>window.removeEventListener('popstate',update);
  },[]);
  return <div className="lrs-feature-app" data-lrs-features="card-game">
    <Suspense fallback={<main className="loc-next-main"><p className="scope-status">正在載入月之符文…</p></main>}>
      {page==='card'?<RuneCardHub Navigation={RuneArtNav}/>
        :page==='game'?<GameBoard/>
        :['duel','daily','list'].includes(page)
          ?<RuneUnifiedView feature={page} defaultView="3d"/>
          :<ScopeHomeLink/>}
    </Suspense>
  </div>;
}
