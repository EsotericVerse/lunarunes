'use client';

import {runeImage,runeName} from '../../rune/rune-directory.mjs';
import './daily-guidance-reading.css';

import {DAILY_GUIDANCE_FIELDS,readDailyGuidance} from './guidance-fields.mjs';
import {buildDailyInterpretation} from './interpretation.mjs';
export {DAILY_GUIDANCE_FIELDS,readDailyGuidance} from './guidance-fields.mjs';

const CARD_PHASES=Object.freeze({1:'新月',2:'上弦',3:'滿月',4:'下弦'});
const CARD_ROTATIONS=Object.freeze([0,90,-90,180]);

export function DailyGuidanceFields({card,directionIndex}){
  const fields=readDailyGuidance(card,directionIndex);
  return <div className="lrs-daily-guidance" aria-label="每日符文五項原始指引">
    {fields.length?<ol className="lrs-daily-guidance-list">
      {fields.map(field=><li className="lrs-daily-guidance-item" key={field.key}>
        <span className="lrs-daily-guidance-number" aria-hidden="true">{String(field.index+1).padStart(2,'0')}</span>
        <div className="lrs-daily-guidance-copy">
          <h3>{field.label}</h3>
          <p>{field.text}</p>
        </div>
      </li>)}
    </ol>:<p className="lrs-daily-guidance-empty">此符文目前沒有可顯示的原始每日指引文字。</p>}
    {fields.length<DAILY_GUIDANCE_FIELDS.length?<p className="lrs-daily-guidance-note">
      原始資料目前收錄 {fields.length}／{DAILY_GUIDANCE_FIELDS.length} 項，未收錄的段落不會以生成文字補足。
    </p>:null}
  </div>;
}

export function DailyIntegratedReading({item}){
  const result=buildDailyInterpretation(item);
  if(!result)return null;
  const phaseDescription=result.moonRelation==='same'
    ?'當下月相與卡片月相相同；僅表示資料一致，不作吉凶評斷。'
    :result.moonRelation==='different'
      ?'當下月相與卡片固有月相不同；本次原文仍依抽牌當下月相取得。'
      :result.moonRelation==='not-marked'
        ?'此符文未標示固有月相，沒有可比較的卡片月相。'
        :'目前無法確定當下月相，不補推月相解讀。';
  return <section className="lrs-daily-integrated" aria-labelledby="lrs-daily-integrated-title">
    <header className="lrs-daily-integrated-heading">
      <p className="loc-eyebrow">LUNARUNES · ORIGINAL-SOURCE SYNTHESIS</p>
      <h3 id="lrs-daily-integrated-title">每日整合解析</h3>
      <p>依本次抽取的符文、方向位與真實月相，將原始資料串成「情境 → 提醒 → 引導 → 祝福」的閱讀脈絡；不生成新的占辭。</p>
    </header>
    {(result.runeDescription||result.directionMeaning)?<div className="lrs-daily-integrated-foundation">
      {result.runeDescription?<div>
        <h4>符文本義</h4>
        <p>{result.runeDescription}</p>
      </div>:null}
      {result.directionMeaning?<div>
        <h4>{result.direction} · 原始位向說明</h4>
        <p>{result.directionMeaning}</p>
      </div>:null}
    </div>:null}
    {result.stages.length?<ol className="lrs-daily-integrated-stages">
      {result.stages.map((stage,index)=><li key={stage.id} className="lrs-daily-integrated-stage">
        <span className="lrs-daily-integrated-stage-index" aria-hidden="true">{String(index+1).padStart(2,'0')}</span>
        <div>
          <h4>{stage.title}</h4>
          <p className="lrs-daily-integrated-stage-note">{stage.description}</p>
          {stage.sources.map(source=><div className="lrs-daily-integrated-source" key={source.key}>
            <span>{source.label}</span>
            <p>{source.text}</p>
          </div>)}
        </div>
      </li>)}
    </ol>:<p className="lrs-daily-guidance-empty">本次沒有可用的原始每日指引，不以推測文字替代。</p>}
    <div className="lrs-daily-integrated-moon">
      <h4>月相合參</h4>
      <p>抽牌當下：{result.moon}　·　卡片月相：{result.cardMoon||'未標示'}</p>
      <p>{phaseDescription}</p>
    </div>
    {result.missing.length?<p className="lrs-daily-guidance-note">
      原始指引已收錄 {result.originalCount}／5 項；未收錄：{result.missing.join('、')}。缺少的段落不作推測補全。
    </p>:null}
  </section>;
}

export default function DailyGuidanceReading({item,onFocus}){
  if(!item?.card)return null;
  const {card,direction,directionIndex,moon}=item;
  const cardPhase=CARD_PHASES[Number(card.moon_phase)]||'未標示';
  const title=runeName(card);
  return <section className="lrs-daily-reading" aria-label={title+'每日符文指引'}>
    <header className="lrs-daily-reading-heading">
      <div>
        <p className="loc-eyebrow">LUNARUNES · DAILY READING</p>
        <h2>今日符文 · 整合解析</h2>
        <p>先閱讀情境、提醒、引導與祝福的整合脈絡，再按需要對照五項原始指引。</p>
      </div>
      {onFocus?<button type="button" className="rune-skin-btn" onClick={onFocus}>
        集中閱讀
      </button>:null}
    </header>
    <div className="lrs-daily-reading-summary">
      <div className="lrs-daily-reading-art">
        <img src={runeImage(card)} alt={title+'原創符文卡面'}
          loading="lazy" decoding="async"
          style={{transform:'rotate('+(CARD_ROTATIONS[Number(directionIndex)]||0)+'deg)'}}/>
      </div>
      <div className="lrs-daily-reading-identity">
        <p className="loc-eyebrow">RUNE · {String(card.rune_id).padStart(2,'0')}</p>
        <h3>{title} · {direction}</h3>
        <dl>
          <div><dt>真實月相</dt><dd>{moon||'未知'}</dd></div>
          <div><dt>卡片月相</dt><dd>{cardPhase}</dd></div>
        </dl>
        <p className="lrs-daily-reading-context">這是本次抽取的指引；關閉或切換展示模式不代表已儲存每日紀錄。</p>
      </div>
    </div>
    <DailyIntegratedReading item={item}/>
    <details className="lrs-daily-reading-original">
      <summary>對照五項原始指引（逐字）</summary>
      <DailyGuidanceFields card={card} directionIndex={directionIndex}/>
    </details>
  </section>;
}
