'use client';
import {navigationHref} from '../modular/routing/scope-registry.js';
import useNativeNavigation from '../modular/use-native-navigation';
import ScopeLink from '../modular/ScopeLink';

const ENTRIES=Object.freeze([
  {title:'符文抽牌',description:'從一枚到十一枚，探索符文本義、卡牌方向與月相交互。',path:'card/duel'},
  {title:'每日符文',description:'以一枚符文記錄當下，留下可回看的每日線索。',path:'card/daily'},
  {title:'符文圖鑑',description:'走進九個群組，逐張欣賞卡面與閱讀六十六符。',path:'card/list'}
]);
export default function RuneCardEntryBubbles(){
  const native=useNativeNavigation();
  return <div className="home-draw-bubbles" aria-label="符文正式入口">
    {ENTRIES.map(entry=><ScopeLink className="loc-bubble" key={entry.path}
      href={navigationHref('lrunes',entry.path,native)} native={native}>
      <strong>{entry.title}</strong><p>{entry.description}</p>
    </ScopeLink>)}
  </div>;
}
