// LRS Web route recognition covers independently deployed /card, /daily (daily draw), and /game.
// LOC retains the canonical lrunes Scope Routing Table and all Scope routes.
export function pageFromPath(pathname='/'){
  const path=String(pathname||'/').replace(/\/+$/,'')||'/';
  if(path==='/card')return 'card';
  if(path==='/card/duel')return 'duel';
  if(path==='/card/daily'||path==='/daily')return 'daily';
  if(path==='/card/list')return 'list';
  if(path==='/game'||path==='/game/room')return 'game';
  return 'scope-home-link';
}
