// Route recognition for the existing LOC Rune pages hosted independently by LRS.
// The canonical Scope Routing Table remains in LunaCodex; this is only a
// standalone Web pathname decoder, not a duplicate routing authority.
export function pageFromPath(pathname='/'){
  let path=String(pathname||'/').replace(/\/+$/,'')||'/';
  if(path==='/lrunes')path='/';
  else if(path.startsWith('/lrunes/'))path=path.slice('/lrunes'.length);
  if(path==='/')return 'home';
  if(path==='/card')return 'card';
  if(path==='/card/duel')return 'duel';
  if(path==='/card/daily')return 'daily';
  if(path==='/card/list')return 'list';
  if(path==='/daily/log')return 'daily-log';
  if(path==='/daily/trend')return 'daily-trend';
  if(path==='/game'||path==='/game/room')return 'game';
  return 'unmatched';
}
