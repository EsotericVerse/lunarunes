import {lazy} from 'react';
import RuneFeatureIndex from '../RuneFeatureIndex.jsx';
import RuneCardHub from '../runes/RuneCardHub.jsx';

// Actual feature renderers are registered here, never in the core framework.
// Expensive renderer, WebGL, game and reader modules remain lazy-loaded.
const RuneUnifiedView=lazy(()=>import('../runes/RuneUnifiedView.jsx'));
const RuneArtNav=lazy(()=>import('../runes/Rune3DNav.jsx'));
const RuneLocalDailyPage=lazy(()=>import('./rune-local-daily.jsx'));
const RuneDailyReading=lazy(()=>import('../runes/daily3d/RuneDailyReading.jsx'));
const MoonwriterPage=lazy(()=>import('../reading/MoonwriterPages.jsx'));
const GameBoard=lazy(()=>import('../../../modules/lrs/boardgame/GameBoard.jsx'));

const RENDERERS=Object.freeze({
  'feature-index':()=> <RuneFeatureIndex/>,
  'card-hub':()=> <RuneCardHub Navigation={RuneArtNav}/>,
  'rune-presentation':({feature})=> <RuneUnifiedView feature={feature} defaultView="3d"/>,
  'daily-history':({view})=> <RuneLocalDailyPage view={view}/>,
  'daily-reading':()=> <RuneDailyReading/>,
  'game-board':({online})=> <GameBoard key={online?'online':'local'} online={online}/>,
  'novel':({uid})=> <MoonwriterPage key={uid||'contents'} uid={uid||''}/>,
  'not-found':()=> <main className="loc-next-main"><p className="scope-status" role="status">找不到此符文頁面。</p></main>
});
export function LrsFeatureRenderer({route}){
  const Component=RENDERERS[route.view]||RENDERERS['not-found'];
  return <Component {...route.params}/>;
}
export const LRS_WEB_VIEWS=Object.freeze(Object.keys(RENDERERS));
