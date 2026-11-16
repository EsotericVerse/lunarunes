import {useState} from 'react';
import EffekseerStage from '../../modules/lrs/rune/vfx/EffekseerStage.jsx';
import '../../modules/lrs/rune/vfx/effekseer-stage.css';

// Engine smoke test: one authored scene, NOT a replacement for the full
// database-backed draw, moon phase, or 66-rune effect regression suite.
const SAMPLE=Object.freeze({rune_id:1,rune_name:'靈',english_name:'Spirit',group_name:'靈魂'});
export default function RuneEffects(){
  const [quality,setQuality]=useState('medium');
  return <section className="lrune-effects" aria-labelledby="effects-title">
    <div className="lrune-heading">
      <p className="lrune-eyebrow">EFFEKSEER · THREE.JS · WASM</p>
      <h2 id="effects-title">獨立 3D 特效執行環境</h2>
      <p>此頁只驗證既有符文特效引擎與授權素材的分離載入，不代表所有抽牌功能已完成搬遷。</p>
      <label>渲染品質 <select value={quality} onChange={e=>setQuality(e.target.value)}>
        <option value="medium">中</option><option value="high">高</option>
      </select></label>
    </div>
    <EffekseerStage rune={SAMPLE} quality={quality}/>
  </section>;
}
