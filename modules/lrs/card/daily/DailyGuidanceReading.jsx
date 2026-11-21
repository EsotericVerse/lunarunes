'use client';

import {runeImage,runeName} from '../../rune/rune-directory.mjs';
import './daily-guidance-reading.css';

import {DAILY_GUIDANCE_FIELDS,readDailyGuidance} from './guidance-fields.mjs';
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

export default function DailyGuidanceReading({item,onFocus}){
  if(!item?.card)return null;
  const {card,direction,directionIndex,moon}=item;
  const cardPhase=CARD_PHASES[Number(card.moon_phase)]||'未標示';
  const title=runeName(card);
  return <section className="lrs-daily-reading" aria-label={title+'每日符文指引'}>
    <header className="lrs-daily-reading-heading">
      <div>
        <p className="loc-eyebrow">LUNARUNES · DAILY READING</p>
        <h2>今日符文 · 五項指引</h2>
        <p>從此刻的符文與方向出發，依序閱讀原始的狀況、提醒、引導與祝福。</p>
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
    <DailyGuidanceFields card={card} directionIndex={directionIndex}/>
  </section>;
}
