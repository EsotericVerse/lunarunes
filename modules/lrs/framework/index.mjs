/**
 * LRS-owned application framework. No React, Vite, DOM, LOC or Cloudflare API.
 * Build tooling and visual renderers are adapters, never framework dependencies.
 */
import {LRS_MODULE} from '../manifest.mjs';

export const LRS_FRAMEWORK_VERSION='1.0.0';
export const LRS_FEATURE_MODULES=Object.freeze([
  {id:LRS_MODULE.modules.rune,name:'rune',roles:['catalogue','3d','assets']},
  {id:LRS_MODULE.modules.card,name:'card',roles:['draw','readings']},
  {id:LRS_MODULE.modules.daily,name:'daily',roles:['daily-read','local-records']},
  {id:LRS_MODULE.modules.boardgame,name:'boardgame',roles:['local-game','life-engine']},
  {id:LRS_MODULE.modules.reading,name:'reading',roles:['novel']}
].map(entry=>Object.freeze({...entry,roles:Object.freeze(entry.roles)})));

// Exactly one LRS route table for Web and future clients. LOC Scope is absent.
// View keys describe capabilities, not React components or build chunks.
const route=(id,module,view,match,parameters=()=>({}))=>
  Object.freeze({id,module,view,match,parameters});
export const LRS_FEATURE_ROUTES=Object.freeze([
  route('home','lrs:rune','feature-index',/^\/$/),
  route('card-hub','lrs:card','card-hub',/^\/card$/),
  route('duel','lrs:card','rune-presentation',/^\/card\/duel$/,()=>({feature:'duel'})),
  // Canonical daily entry is /daily; keep /card/daily as a legacy deep-link.
  // Both resolve to the exact same LRS daily renderer and rules.
  route('daily','lrs:daily','rune-presentation',/^\/(?:daily|card\/daily)$/,()=>({feature:'daily'})),
  route('list','lrs:rune','rune-presentation',/^\/card\/list$/,()=>({feature:'list'})),
  route('daily-log','lrs:daily','daily-history',/^\/daily\/log$/,()=>({view:'log'})),
  route('daily-trend','lrs:daily','daily-history',/^\/daily\/trend$/,()=>({view:'trend'})),
  route('game','lrs:boardgame','game-board',/^\/game(?:\/room)?$/),
  route('novel-moonwriter','lrs:reading','novel',/^\/novel\/moonwriter$/),
  route('novel-moonwriter-chapter','lrs:reading','novel',/^\/novel\/moonwriter\/([A-Za-z0-9]{8})$/,match=>({uid:match[1]}))
]);
export function normalizedLrsPath(pathname='/'){
  if(typeof pathname!=='string'||!pathname.startsWith('/')||pathname.includes('?')||pathname.includes('#'))
    return '/__invalid_lrs_route__';
  const path=pathname.replace(/\/+$/,'')||'/';
  return path;
}
export function resolveLrsFeatureRoute(pathname='/',routes=LRS_FEATURE_ROUTES){
  const path=normalizedLrsPath(pathname);
  for(const descriptor of routes){
    const match=descriptor.match.exec(path);
    if(!match)continue;
    const params=Object.freeze(descriptor.parameters(match));
    const key=descriptor.id+(params.uid?':'+params.uid:'');
    return Object.freeze({id:descriptor.id,key,module:descriptor.module,view:descriptor.view,path,params,found:true});
  }
  return Object.freeze({id:'unmatched',key:'unmatched',module:null,view:'not-found',path,params:Object.freeze({}),found:false});
}

/**
 * Tiny lifecycle/route manager; browser/React/iOS integration is injected.
 * A route owns its transient readers, GPU/animation handlers, and subscriptions.
 * Canonical Session and local daily history live outside that lifetime.
 */
export function createLrsFramework({
  initialPath='/',routes=LRS_FEATURE_ROUTES,
  modules=LRS_FEATURE_MODULES,onRouteLeave
}={}){
  const registered=new Map();
  const observers=new Set();
  const exitHandlers=new Set();
  if(onRouteLeave)exitHandlers.add(onRouteLeave);
  let current=resolveLrsFeatureRoute(initialPath,routes);
  let disposed=false;
  function registerModule(definition){
    if(!definition||typeof definition.id!=='string'||!/^lrs:[\w-]+$/.test(definition.id))
      throw TypeError('Invalid LRS module identity');
    if(registered.has(definition.id))throw Error('Duplicate LRS module: '+definition.id);
    const stored=Object.freeze({...definition});
    registered.set(stored.id,stored);
    return stored;
  }
  for(const module of modules)registerModule(module);
  for(const entry of routes)if(!registered.has(entry.module))
    throw Error('Unregistered LRS route module: '+entry.module);
  function subscribe(listener){
    if(disposed)throw Error('LRS framework already disposed');
    observers.add(listener);
    return ()=>observers.delete(listener);
  }
  function onLeave(handler){
    if(typeof handler!=='function')throw TypeError('LRS leave handler required');
    exitHandlers.add(handler);
    return ()=>exitHandlers.delete(handler);
  }
  function enter(pathname){
    if(disposed)return current;
    const next=resolveLrsFeatureRoute(pathname,routes);
    if(next.key===current.key)return current;
    const previous=current;
    // Exit before notifying renderers to prevent old asynchronous reads
    // from leaking across feature changes.
    for(const handler of [...exitHandlers]){
      try{handler(previous,next);}catch(error){console.error('[LRS] resource cleanup:',error);}
    }
    current=next;
    for(const listener of [...observers])listener();
    return current;
  }
  function dispose(){
    if(disposed)return;
    disposed=true;
    for(const handler of [...exitHandlers]){
      try{handler(current,null);}catch(error){console.error('[LRS] resource disposal:',error);}
    }
    exitHandlers.clear();
    observers.clear();
  }
  return Object.freeze({
    identity:LRS_MODULE.identity,version:LRS_FRAMEWORK_VERSION,
    getSnapshot:()=>current,
    subscribe,enter,onLeave,dispose,registerModule,
    getModule:id=>registered.get(id)||null,
    listModules:()=>Object.freeze([...registered.values()])
  });
}
