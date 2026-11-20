import {ScopeLink} from './runtime/rune-navigation.jsx';

// LRS is a standalone feature app, not a copy of the LOC /lrunes Scope.
const FEATURES=Object.freeze([
  {title:'符文抽牌',description:'單張至十一張的符文組合與方向判讀。',href:'/card/duel/'},
  {title:'每日符文',description:'抽取當下指引，閱讀原始文字。',href:'/card/daily/'},
  {title:'符文圖鑑',description:'九個群組、六十六枚符文與立體展室。',href:'/card/list/'},
  {title:'桌遊',description:'在本機進行符文互動與桌遊。',href:'/game/'},
  {title:'本機每日紀錄',description:'查看裝置上的每日符文記錄。',href:'/daily/log/'},
  {title:'每日紀錄趨勢',description:'檢視已儲存的每日符文趨勢。',href:'/daily/trend/'},
  {title:'《月語者》小說',description:'按七篇、章節順序閱讀 Galaxy 原文。',href:'/novel/moonwriter/'}
]);

export default function RuneFeatureIndex(){
  return <main className="loc-next-main lrs-feature-index" aria-labelledby="lrs-feature-title">
    <header className="lrs-feature-header">
      <p className="loc-eyebrow">LUNARUNES · LRS</p>
      <h1 id="lrs-feature-title">符文功能</h1>
      <p>進入抽牌、圖鑑、每日符文及創作閱讀。此站只提供 LRS 功能；月之符文的 Scope 首頁與編輯由 LunaCodex 管理。</p>
      <a className="lrs-feature-scope-link" href="https://loc.lo3rwang.cc/lrunes/">
        前往月典 · 月之符文 Scope
      </a>
    </header>
    <nav className="lrs-feature-grid" aria-label="LunaRunes 獨立功能">
      {FEATURES.map(item=><ScopeLink className="lrs-feature-card" key={item.href} href={item.href}>
        <strong>{item.title}</strong>
        <span>{item.description}</span>
      </ScopeLink>)}
    </nav>
  </main>;
}
