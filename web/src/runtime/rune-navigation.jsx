import {navigateLrsBrowser} from './lrs-app-runtime.mjs';

// LRS-only feature URLs. LOC owns the lrunes Scope independently.
export function runeFeatureHref(path=''){
  const suffix=String(path||'').split('/').filter(Boolean).join('/');
  return '/'+(suffix?suffix+'/':'');
}
export function ScopeLink({href,children,onClick,target,...rest}){
  const navigate=event=>{
    onClick?.(event);
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||
       event.shiftKey||event.altKey||(target&&target!=='_self'))return;
    const to=new URL(String(href),window.location.href);
    if(to.origin!==window.location.origin)return;
    event.preventDefault();
    navigateLrsBrowser(to.href);
  };
  return <a href={href} target={target} onClick={navigate} {...rest}>{children}</a>;
}
