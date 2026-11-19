'use client';

import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import RuneArtStage from '../visual/RuneArtStage';
import useRuneDialogFocus from '../visual/useRuneDialogFocus';
import {realMoonPhase} from '../../../modules/lrs/daily/real-moon-phase.mjs';
import {navigationHref} from '../../modular/routing/scope-registry.js';
import useNativeNavigation from '../../modular/use-native-navigation';
import ScopeLink from '../../modular/ScopeLink';
import {loadDrawCards,randomIndex} from '../rune-draw-core.mjs';
import {runeImage} from '../../../modules/lrs/rune/rune-directory.mjs';
import DailyGuidanceReading,{DailyGuidanceFields,DAILY_GUIDANCE_FIELDS} from '../../../modules/lrs/daily/DailyGuidanceReading.jsx';
import '../../../modules/lrs/rune/styles/skin-lab.css';
import '../../../modules/lrs/rune/art/rune-art-layout.css';

const DIRECTIONS=['正位','半正位','半逆位','逆位'];
const CARD_ROTATION=[0,90,-90,180];
export default function RuneDaily3D({presentationSwitcher=null}){
  const native=useNativeNavigation();
  const [moon,setMoon]=useState(()=>realMoonPhase());
  const [draw,setDraw]=useState(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [details,setDetails]=useState(false);
  const dialogRef=useRuneDialogFocus(()=>setDetails(false),details);
  const lock=useRef(false);
  const mounted=useRef(true);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
  async function drawDaily(){
    if(lock.current||draw)return;
    lock.current=true;setBusy(true);setError('');setDetails(false);
    const currentMoon=realMoonPhase();setMoon(currentMoon);
    if(currentMoon==='未知'){
      setError('真實月相無法辨識，無法查詢每日指示。');
      lock.current=false;setBusy(false);return;
    }
    const runeNumber=randomIndex(66)+1;
    const index=randomIndex(4);
    try{
      const [card]=await loadDrawCards([{runeNumber,dir:index+1}],{
        staticTypes:['direction'],moonTypes:DAILY_GUIDANCE_FIELDS.map(([type])=>type),currentMoon
      });
      if(!card)throw new Error('每日符文資料尚未就緒。');
      if(mounted.current){
        setDraw({card,directionIndex:index,
          direction:DIRECTIONS[index],birth:Date.now(),moon:currentMoon});
        // Daily has precisely one card, so reveal canonical details immediately.
        setDetails(false);
      }
    }catch(e){if(mounted.current)setError('每日指示讀取失敗：'+String(e?.message||e));}
    finally{lock.current=false;if(mounted.current)setBusy(false);}
  }
  return <main className="loc-next-main" data-rune-lab="daily3d">
    <div className="loc-panel rune-skin-lab rune-art-shell">
    {presentationSwitcher}
    <header className="rune-art-header">
      <p className="loc-eyebrow">LunaRunes · Living Daily</p>
      <h1>每日符文 · 月光指示</h1>
      <p>抽取一枚符文，依當下真實月相與方向閱讀五項原始指引。結果會直接排在舞台下方，無須先開啟視窗。</p>
    </header>
    <nav className="rune-art-toolbar">
      <span className="rune-art-toolbar-label">真實月相：{moon}　·　每日指示</span>
    </nav>
    <section className="rune-art-stage" aria-label="每日符文原創美術揭示">
      <RuneArtStage mode="daily" items={draw?[draw]:[]}
        onSelect={()=>setDetails(true)} onBackgroundClick={!busy&&!draw?drawDaily:undefined}/>
      <div className="rune-art-stage-label" role="status">
        {busy?'正在讀取符文與原始指引……':draw?'指引已呈現於下方；點選卡片可集中閱讀。':'輕觸月光，或使用下方按鈕抽取每日符文。'}
      </div>
    </section>
    {!draw?<div className="rune-art-daily-trigger"><button type="button" className="rune-skin-btn primary"
      onClick={drawDaily} disabled={busy}>{busy?'正在讀取…':'抽取每日符文'}</button></div>:null}
    {error?<p className="rune-skin-error" role="alert">{error}</p>:null}
    {draw?<DailyGuidanceReading item={draw} onFocus={()=>setDetails(true)}/>:null}
    <div className="rune-art-footer">
      <nav className="rune-skin-controls" aria-label="符文模式">
        <ScopeLink className="rune-skin-btn" href={navigationHref('lrunes','',native)} native={native}>回符文首頁</ScopeLink>
        <ScopeLink className="rune-skin-btn" href={navigationHref('lrunes','card',native)} native={native}>← 符文展示首頁</ScopeLink>
        <ScopeLink className="rune-skin-btn" href={navigationHref('lrunes','card/duel',native)} native={native}>一般抽牌</ScopeLink>
      </nav>
    </div>
    {details&&draw&&typeof document!=='undefined'?createPortal(
      <div className="rune-art-modal-backdrop rune-art-result-backdrop"
        onClick={()=>setDetails(false)} role="presentation">
        <section ref={dialogRef} tabIndex={-1} className="rune-art-modal rune-art-result-modal" role="dialog"
          aria-modal="true" aria-label="每日符文指示"
          onClick={event=>event.stopPropagation()}>
          <div className="rune-art-modal-head rune-art-result-head">
            <div>
              <p className="loc-eyebrow">LUNARUNES · DAILY GUIDANCE</p>
              <h2>每日符文指示</h2>
            </div>
            <div className="rune-art-result-actions">
              <ScopeLink className="rune-art-result-home" href={navigationHref('lrunes','card',native)} native={native}>回到首頁</ScopeLink>
              <button type="button" className="rune-art-result-close"
                onClick={()=>setDetails(false)} aria-label="關閉每日指示">×</button>
            </div>
          </div>
          <div className="rune-art-result-body rune-art-daily-result-body">
            <div className="rune-art-daily-summary">
              <img className="rune-art-daily-card" src={runeImage(draw.card)}
                alt={draw.card.rune_name+'原始符文卡面'} loading="eager"
                style={{transform:`rotate(${CARD_ROTATION[draw.directionIndex]??0}deg)`}}/>
              <div className="rune-art-daily-summary-copy">
                <h3>{String(draw.card.rune_name||'').replace(/之符文$/,'')} · {draw.direction}</h3>
                <p>卡片月相：{['','新月','上弦','滿月','下弦'][Number(draw.card.moon_phase)]||'無'}</p>
                <p>真實月相：{draw.moon}</p>
              </div>
            </div>
            <div className="rune-art-daily-fields" aria-label="每日五項指示">
              <DailyGuidanceFields card={draw.card} directionIndex={draw.directionIndex}/>
            </div>
          </div>
        </section>
      </div>,document.body
    ):null}
    </div>
  </main>;
}
