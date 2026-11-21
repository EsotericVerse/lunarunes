// Independent LRS Vite router helper. LOC owns the lrunes Scope separately.
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
    if(to.pathname+to.search+to.hash!==window.location.pathname+window.location.search+window.location.hash){
      window.history.pushState({},'',to.pathname+to.search+to.hash);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo(0,0);
    }
  };
  return <a href={href} target={target} onClick={navigate} {...rest}>{children}</a>;
}
