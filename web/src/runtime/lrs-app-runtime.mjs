/**
 * Web adapter for the LRS framework. This is the only layer that owns browser
 * history and makes the runtime observable by React.
 */
import {createLrsFramework,canonicalLrsFeaturePath} from '../../../modules/lrs/framework/index.mjs';
import {releaseRuneTransientReads} from './rune-public-port.mjs';

const path=()=>{
  const original=window.location.pathname;
  const canonical=canonicalLrsFeaturePath(original);
  if(canonical!==original)
    window.history.replaceState(window.history.state,'',canonical+window.location.search+window.location.hash);
  return canonical;
};
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
  const canonical=canonicalLrsFeaturePath(next.pathname);
  const destination=canonical+next.search+next.hash;
  if(destination===current)return true;
  window.history.pushState({},'',destination);
  lrsFramework.enter(canonical);
  if(scroll)window.scrollTo(0,0);
  return true;
}
