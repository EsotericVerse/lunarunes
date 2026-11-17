// Browser session is only for tiny presentation preferences, not HTTP cache,
// OAuth, Rune draws, database responses, GPU resources or IndexedDB records.
// These values expire with the tab and never authorize an action.
const KEY_PREFIX='lrs:rune-ui:v1:';
const VALID=Object.freeze({
  'display:duel':Object.freeze(['2d','3d']),
  'display:daily':Object.freeze(['2d','3d']),
  'display:list':Object.freeze(['2d','3d']),
  'trend:range':Object.freeze(['year','all']),
  'trend:bucket':Object.freeze(['week','month']),
  'trend:mode':Object.freeze(['rune','direction'])
});
function allowed(key,value){
  return Object.hasOwn(VALID,key)&&VALID[key].includes(value);
}
function safeStorage(injected){
  try{
    return injected===undefined
      ?(typeof window==='undefined'?null:window.sessionStorage)
      :injected;
  }catch{return null;}
}
export function readRuneUiSession(key,fallback,storage=undefined){
  if(!allowed(key,fallback))return fallback;
  try{
    const value=safeStorage(storage)?.getItem(KEY_PREFIX+key);
    return allowed(key,value)?value:fallback;
  }catch{return fallback;}
}
export function rememberRuneUiSession(key,value,storage=undefined){
  if(!allowed(key,value))return false;
  try{
    const target=safeStorage(storage);
    if(!target)return false;
    if(target.getItem(KEY_PREFIX+key)!==value)target.setItem(KEY_PREFIX+key,value);
    return true;
  }catch{return false;}
}
