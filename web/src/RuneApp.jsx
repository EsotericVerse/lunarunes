import {lazy,Suspense,useEffect,useState} from 'react';
import RunesClient from '../../app/lrunes/RunesClient.jsx';
import GameBoard from '../../app/lrunes/game/GameBoard.jsx';
// These are LOC's original 2D/3D presentation components, not a new gallery.
const RuneUnifiedView=lazy(()=>import('../../app/lrunes/RuneUnifiedView.jsx'));

function pageFromPath(){
  let path=window.location.pathname.replace(/\/+$/,'')||'/';
  if(path==='/lrunes')path='/';
  else if(path.startsWith('/lrunes/'))path=path.slice('/lrunes'.length);
  if(path==='/')return 'home';
  if(path==='/card/duel')return 'duel';
  if(path==='/card/daily')return 'daily';
  if(path==='/card/list')return 'list';
  if(path==='/game'||path==='/game/room')return 'game';
  return 'unmatched';
}
export default function RuneApp(){
  const [page,setPage]=useState(pageFromPath);
  useEffect(()=>{
    const update=()=>setPage(pageFromPath());
    window.addEventListener('popstate',update);
    return()=>window.removeEventListener('popstate',update);
  },[]);
  return <div className="lrs-original-scope" data-lrs-original-pages="true">
    {/* LOC's outer global NAV and Footer are intentionally NOT mounted. */}
    <Suspense fallback={<main className="loc-next-main"><p className="scope-status" role="status">正在載入月之符文…</p></main>}>
      {page==='home'?<main className="loc-next-main"><RunesClient/></main>
        :page==='game'?<GameBoard/>
        :['duel','daily','list'].includes(page)
          ?<RuneUnifiedView feature={page} defaultView="3d"/>
          :<main className="loc-next-main"><p className="scope-status" role="status">找不到此符文頁面。</p></main>}
    </Suspense>
  </div>;
}
