import {useEffect,useState} from 'react';

// This is LRS' local link adapter, NOT a second Scope Routing Table.
// The official Scope/domain contract remains owned by LOC.
export function navigationHref(scope,path='',native=false){
  if(scope!=='lrunes')throw new Error('LRS navigation can only resolve its own Rune scope');
  const suffix=String(path||'').split('/').filter(Boolean).join('/');
  return '/'+(suffix?suffix+'/':'');
}
export default function useNativeNavigation(){
  // The standalone Vite/Worker site is the Web build; native packaging
  // is owned by LOC, not by this LRS Web entrypoint or LAS.
  const [native]=useState(false);
  return native;
}
export function usePassiveSessionAccount(){
  // Never fabricate an OAuth or SSO user. No server-verified session
  // bridge has been attached to this standalone runtime.
  return {user:null,loading:false,permissionLoading:false,error:''};
}
export function useAccount(){
  return {...usePassiveSessionAccount(),canLocAccessSync:()=>false};
}
export function ScopeLink({href,children,onClick,target,...rest}){
  const navigate=event=>{
    onClick?.(event);
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||
      event.shiftKey||event.altKey||(target&&target!=='_self'))return;
    const to=new URL(String(href),window.location.href);
    if(to.origin!==window.location.origin)return;
    event.preventDefault();
    if(to.pathname+to.search+to.hash!==window.location.pathname+window.location.search+window.location.hash){
      window.history.pushState({},'',to.pathname+to.search+to.hash);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo(0,0);
    }
  };
  return <a href={href} target={target} onClick={navigate} {...rest}>{children}</a>;
}
