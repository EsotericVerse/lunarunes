'use client';

import {useAsyncResource} from '../../packages/zenstack/client-queries';
import {selectRows} from '../loc/db/db-query.mjs';
import {runeImage} from '../../modules/lrs/rune/rune-directory.mjs';
import RuneCardInfo from './RuneCardInfo';
import {lrsCardRune66ColumnString as lRunes66ColumnString} from '../../modules/lrs/card/zmodel/lrs-card-model.mjs';

export default function RuneIntroSection(){
  const sample=useAsyncResource(['lunarunes-intro-rune',66],async()=>{
      const {rows}=await selectRows('silver.runes',{
        columns:lRunes66ColumnString('rune_id','rune_name','english_name','totem','group_name','moon_phase','card_attr','rune_description','archetype','positive_keywords','negative_keywords'),
        filters:[{column:'rune_id',operator:'eq',value:66}],
        limit:1,offset:0
      });
      return rows?.[0]||null;
  });
  return <section className="loc-card home-copy-block home-rune-section runes-home-intro">
    <div className="home-section-heading runes-home-intro-heading">
      <p className="loc-eyebrow">LunaRunes(Symbolic Language)</p>
      <h2>月之符文籤詩系統</h2>
      <p className="loc-subtitle">一套以符文本義、卡牌方向與月相交互展開的語意指引。</p>
    </div>
    <div className="home-rune-layout runes-home-intro-layout">
      {sample.data?<RuneCardInfo card={sample.data} imageSrc={runeImage(sample.data)} layout="home" direction="正位"/>:
        <div className="home-rune-preview runes-home-intro-preview" aria-busy={sample.isPending}>
          <p className="scope-status">{sample.error?'符文示例目前無法讀取。':'正在讀取符文示例…'}</p>
        </div>}
      <div className="home-rune-copy home-rune-copy-plain runes-home-intro-copy">
        <p className="runes-hint-kicker">從一個符文，開始一段閱讀。</p>
        <p className="runes-hint-lead">六十六枚原創符文，各自承載一個中文字的語意。抽取結果不是預言，而是理解當下的另一種角度。</p>
        <p className="runes-hint-seed">以符文作為語意種子，結合方向與月相，讓你自己決定如何延伸、如何行動。</p>
      </div>
    </div>
  </section>;
}
