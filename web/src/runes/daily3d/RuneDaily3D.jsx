import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import RuneArtStage from '../visual/RuneArtStage';
import useRuneDialogFocus from '../visual/useRuneDialogFocus';
import {realMoonPhase} from '../../../../modules/lrs/card/daily/real-moon-phase.mjs';
import {ScopeLink,runeFeatureHref} from '../../runtime/rune-navigation.jsx';
import {loadDrawCards,randomIndex,lrsLucusDrawCandidates} from '../rune-draw-core.mjs';
import {runeImage} from '../../../../modules/lrs/rune/rune-directory.mjs';
import {DAILY_GUIDANCE_FIELDS} from '../../../../modules/lrs/card/daily/guidance-fields.mjs';
import {rememberDailyDraw,readDailyDraw} from '../../runtime/rune-daily-result.mjs';
import '../../../../modules/lrs/rune/styles/skin-lab.css';
import '../../../../modules/lrs/rune/art/rune-art-layout.css';

const DIRECTIONS=['正位','半正位','半逆位','逆位'];
const CARD_ROTATION=[0,90,-90,180];
export default function RuneDaily3D({presentationSwitcher=null}){

  const [moon,setMoon]=useState(()=>realMoonPhase());
  const [draw,setDraw]=useState(readDailyDraw);
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
    const candidates=lrsLucusDrawCandidates();
    const runeNumber=candidates[randomIndex(candidates.length)];
    const index=randomIndex(4);
    try{
      const [card]=await loadDrawCards([{runeNumber,dir:index+1}],{
        staticTypes:['direction'],moonTypes:DAILY_GUIDANCE_FIELDS.map(([type])=>type),currentMoon
      });
      if(!card)throw new Error('每日符文資料尚未就緒。');
      if(mounted.current){
        const item={card,directionIndex:index,
          direction:DIRECTIONS[index],birth:Date.now(),moon:currentMoon};
        rememberDailyDraw(item);
        setDraw(item);
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
      <p>抽取一枚符文，依當下真實月相與方向決定結果；五項原始指引在獨立解析頁閱讀。</p>
    </header>
    <nav className="rune-art-toolbar">
      <span className="rune-art-toolbar-label">真實月相：{moon}　·　每日指示</span>
    </nav>
    <section className="rune-art-stage" aria-label="每日符文原創美術揭示">
      <RuneArtStage mode="daily" items={draw?[draw]:[]}
        onSelect={()=>setDetails(true)} onBackgroundClick={!busy&&!draw?drawDaily:undefined}/>
      <div className="rune-art-stage-label" role="status">
        {busy?'正在讀取符文與原始指引……':draw?'抽牌完成；可進入每日抽牌解析，或點選卡片查看結果。':'輕觸月光，或使用下方按鈕抽取每日符文。'}
      </div>
    </section>
    {!draw?<div className="rune-art-daily-trigger"><button type="button" className="rune-skin-btn primary"
      onClick={drawDaily} disabled={busy}>{busy?'正在讀取…':'抽取每日符文'}</button></div>:null}
    {error?<p className="rune-skin-error" role="alert">{error}</p>:null}
    {draw?<div className="rune-art-daily-trigger"><ScopeLink className="rune-skin-btn primary" href={runeFeatureHref('card/daily/reading')}>查看每日抽牌解析</ScopeLink></div>:null}
    <div className="rune-art-footer">
      <nav className="rune-skin-controls" aria-label="符文模式">
        <ScopeLink className="rune-skin-btn" href={runeFeatureHref('')}>回符文首頁</ScopeLink>
        <ScopeLink className="rune-skin-btn" href={runeFeatureHref('card')}>← 符文展示首頁</ScopeLink>
        <ScopeLink className="rune-skin-btn" href={runeFeatureHref('card/duel')}>一般抽牌</ScopeLink>
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
              <h2>每日抽牌結果</h2>
            </div>
            <div className="rune-art-result-actions">
              <ScopeLink className="rune-art-result-home" href={runeFeatureHref('card')}>回到首頁</ScopeLink>
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
            <div className="rune-art-daily-fields">
              <ScopeLink className="rune-skin-btn" href={runeFeatureHref('card/daily/reading')}>閱讀五項原始指引</ScopeLink>
            </div>
          </div>
        </section>
      </div>,document.body
    ):null}
    </div>
  </main>;
}
