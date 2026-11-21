/**
 * Web adapter for the LRS framework. This is the only layer that owns browser
 * history and makes the runtime observable by React.
 */
import {createLrsFramework} from '../../../modules/lrs/framework/index.mjs';
import {releaseRuneTransientReads} from './rune-public-port.mjs';

const path=()=>window.location.pathname;
export const lrsFramework=createLrsFramework({
  initialPath:path(),onRouteLeave:()=>releaseRuneTransientReads()
});
export function attachLrsBrowser(){
  const onPop=()=>lrsFramework.enter(path());
  window.addEventListener('popstate',onPop);
  return ()=>window.removeEventListener('popstate',onPop);
}
export function navigateLrsBrowser(href,{scroll=true}={}){
  const next=new URL(String(href),window.location.href);
  if(next.origin!==window.location.origin)return false;
  const current=window.location.pathname+window.location.search+window.location.hash;
  const destination=next.pathname+next.search+next.hash;
  if(destination===current)return true;
  window.history.pushState({},'',destination);
  lrsFramework.enter(next.pathname);
  if(scroll)window.scrollTo(0,0);
  return true;
}
