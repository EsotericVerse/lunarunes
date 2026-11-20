// LRS-only feature paths. LOC alone owns /lrunes Scope and its route table.
export function pageFromPath(pathname='/'){
  let path=String(pathname||'/').replace(/\/+$/,'')||'/';
  if(path==='/')return 'home';
  if(path==='/novel/moonwriter')return 'novel-moonwriter';
  if(/^\/novel\/moonwriter\/[A-Za-z0-9]{8}$/.test(path))
    return 'novel-moonwriter:'+path.split('/').pop();
  if(path==='/card')return 'card';
  if(path==='/card/duel')return 'duel';
  if(path==='/card/daily')return 'daily';
  if(path==='/card/list')return 'list';
  if(path==='/daily/log')return 'daily-log';
  if(path==='/daily/trend')return 'daily-trend';
  if(path==='/game'||path==='/game/room')return 'game';
  return 'unmatched';
}
