import {lazy,Suspense,useEffect,useState} from 'react';
import {LRUNE_MODULE} from '../../modules/lrune/manifest.mjs';
import {runeAssetUrl} from '../../modules/lrune/asset-url.mjs';
const GameBoard=lazy(()=>import('../../app/lrunes/game/GameBoard.jsx'));
const RuneEffects=lazy(()=>import('./RuneEffects.jsx'));

const PAGES=Object.freeze([
  {key:'home',path:'/lrunes/',label:'首頁'},
  {key:'art',path:'/lrunes/art/',label:'符文原畫'},
  {key:'effects',path:'/lrunes/effects/',label:'3D 特效'},
  {key:'game',path:'/lrunes/game/',label:'本機桌遊'}
]);
const menuPath=key=>PAGES.find(item=>item.key===key)?.path||'/lrunes/';
function routeKey(){
  const path=window.location.pathname.replace(/\/+$/,'')+'/';
  return PAGES.find(item=>item.path===path)?.key||'home';
}
function useRuneRoute(){
  const [page,setPage]=useState(routeKey);
  useEffect(()=>{
    const update=()=>setPage(routeKey());
    window.addEventListener('popstate',update);
    return()=>window.removeEventListener('popstate',update);
  },[]);
  return [page,(key)=>{
    const path=menuPath(key);
    if(window.location.pathname!==path)window.history.pushState({},'',path);
    setPage(key);
    window.scrollTo({top:0,behavior:'instant'});
  }];
}
function Cards(){
  const cards=Array.from({length:67},(_,n)=>n);
  return <section aria-labelledby="art-title">
    <div className="lrune-heading">
      <p className="lrune-eyebrow">ORIGINAL ART · 67</p>
      <h2 id="art-title">符文原始卡圖</h2>
      <p>此處只展示原畫與卡號。符文語意、月相、方向與籤詩資料仍須連接正式資料契約，不能以演示資料代替。</p>
    </div>
    <div className="lrune-gallery">{cards.map(n=><figure className="lrune-card" key={n}>
      <img src={runeAssetUrl('assets/lunarunes/cards/'+String(n).padStart(2,'0')+'.png')}
        alt={'第 '+String(n).padStart(2,'0')+' 枚符文原畫'} loading="lazy" decoding="async"/>
      <figcaption>Rune {String(n).padStart(2,'0')}</figcaption>
    </figure>)}</div>
  </section>;
}
function Landing({go}){
  return <section className="lrune-landing">
    <p className="lrune-eyebrow">LUNARUNES · MODULE lrune</p>
    <h2>以符文為核心，讓引擎獨立。</h2>
    <p>符文原畫、互動牌局及 Effekseer 特效由 LunaRunes 自己管理與建置。LOC 保留統一路由，LunArcus 處理跨專案與 IPA 整合。</p>
    <div className="lrune-actions">
      <button onClick={()=>go('art')}>瀏覽 67 枚原畫</button>
      <button onClick={()=>go('game')}>進入本機桌遊</button>
      <button onClick={()=>go('effects')}>檢視 3D 引擎</button>
    </div>
  </section>;
}
export default function RuneApp(){
  const [page,go]=useRuneRoute();
  return <div className="lrune-shell">
    <header className="lrune-topbar">
      <div><span className="lrune-brand">LunaRunes</span><small>{LRUNE_MODULE.id} · independent Web</small></div>
      <nav aria-label="符文模組導覽">{PAGES.map(item=><a key={item.key}
        className={page===item.key?'active':''} href={item.path}
        aria-current={page===item.key?'page':undefined}
        onClick={event=>{if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();go(item.key);}}>
        {item.label}</a>)}</nav>
    </header>
    <main id="main-content" className="lrune-main">
      <Suspense fallback={<div role="status" className="lrune-loading">正在載入符文模組…</div>}>
        {page==='art'?<Cards/>:page==='game'?<GameBoard/>:page==='effects'?<RuneEffects/>:<Landing go={go}/>}
      </Suspense>
    </main>
    <footer className="lrune-footer">LunaRunes · Rune core & game engine · 符文原畫保持原始檔案不變</footer>
  </div>;
}
