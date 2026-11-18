// LunaRunes owns its eight static theme files (copied once from LOC).
// Only the selected CSS is fetched; no LOC network, server settings or DB read.
const PREFIX='lrs.rune.theme';
export const RUNE_THEME_IDS=Object.freeze(Array.from({length:8},(_,i)=>'theme-'+(i+1)));
export function runeThemeId(value){return RUNE_THEME_IDS.includes(value)?value:'theme-1';}
export function storedRuneTheme(storage){
  try{return runeThemeId((storage??globalThis.localStorage)?.getItem(PREFIX));}catch{return 'theme-1';}
}
export function applyRuneTheme(theme,{doc=globalThis.document,storage}={}){
  const id=runeThemeId(theme);
  const root=doc.documentElement;
  root.setAttribute('data-theme-id',id);
  root.setAttribute('data-theme','custom');
  let link=doc.getElementById('lrs-current-theme');
  if(!link){
    link=doc.createElement('link');
    link.id='lrs-current-theme';
    link.rel='stylesheet';
    doc.head.appendChild(link);
  }
  if(link.getAttribute('href')!=='/themes/'+id+'.css')link.setAttribute('href','/themes/'+id+'.css');
  try{(storage??globalThis.localStorage)?.setItem(PREFIX,id);}catch{}
  return id;
}
