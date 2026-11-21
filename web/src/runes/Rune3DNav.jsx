import {ScopeLink,runeFeatureHref} from '../runtime/rune-navigation.jsx';

export default function RuneArtNav(){

  return <nav className="runes-home-nav" aria-label="符文三大功能入口">
    <ScopeLink className="loc-button" href={runeFeatureHref('')}>← 回符文首頁</ScopeLink>
    <ScopeLink className="loc-button" href={runeFeatureHref('card/duel')}>抽牌 · 選擇 2D／3D</ScopeLink>
    <ScopeLink className="loc-button" href={runeFeatureHref('card/list')}>符文圖鑑 · 選擇 2D／3D</ScopeLink>
    <ScopeLink className="loc-button" href={runeFeatureHref('card/daily')}>每日符文 · 選擇 2D／3D</ScopeLink>
  </nav>;
}
