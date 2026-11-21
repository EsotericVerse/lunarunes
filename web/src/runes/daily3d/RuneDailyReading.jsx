import {ScopeLink,runeFeatureHref} from '../../runtime/rune-navigation.jsx';
import DailyGuidanceReading from '../../../../modules/lrs/card/daily/DailyGuidanceReading.jsx';
import {readDailyDraw} from '../../runtime/rune-daily-result.mjs';

// No second draw or hidden API request: show the active browser draw.
export default function RuneDailyReading(){
  const draw=readDailyDraw();
  return <main className="loc-next-main">
    <div className="loc-panel rune-skin-lab">
      <nav className="rune-skin-controls" aria-label="每日符文頁面">
        <ScopeLink className="rune-skin-btn" href={runeFeatureHref('card/daily')}>← 返回每日抽牌</ScopeLink>
        <ScopeLink className="rune-skin-btn" href={runeFeatureHref('card/daily/log')}>本機每日紀錄</ScopeLink>
      </nav>
      {draw?<DailyGuidanceReading item={draw}/>:<section className="loc-card" role="status">
        <h1>每日抽牌解析</h1>
        <p>尚未取得本次每日抽牌結果。請先抽牌，再進入解析頁；重新整理不會憑空建立或重抽結果。</p>
        <ScopeLink className="rune-skin-btn" href={runeFeatureHref('card/daily')}>前往每日抽牌</ScopeLink>
      </section>}
    </div>
  </main>;
}
