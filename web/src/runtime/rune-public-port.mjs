import {bindCardDialect} from '../../../app/lrunes/rune-draw-core.mjs';
import {lrsCardRune66ColumnString} from '../../../modules/lrs/card/zmodel/lrs-card-model.mjs';
import {readRuneBaseSession,storeRuneBaseSession,clearRuneBaseMemory,
  runeBaseFetchQuery,reuseRuneBaseSession} from './rune-base-session.mjs';

// Public-read port. LRS sends only bounded, anonymous read requests to its
// own existing Worker. Only the LRS Worker may hold LRS_DATABASE_URL;
// Rune Web must not access another project's database or private record APIs.
let readRows=null;
// Share only simultaneous anonymous reads. A completed result is immediately
// freed, unlike a persistent SQL/session cache; bounded by active requests.
const pendingPublicReads=new Map(); // descriptor -> {controller,promise}
const MAX_PENDING_PUBLIC_READS=32;

// Release only in-flight, non-canonical public reads owned by the departing
// route. Explicit per-component AbortSignals still belong to their callers.
// Never retire the two canonical Session tables or their shared prefetch.
export function releaseRuneTransientReads(){
  const active=[...pendingPublicReads.values()];
  pendingPublicReads.clear();
  for(const entry of active)entry.controller.abort();
  return active.length;
}
const BASE_TABLES=['silver.runes','silver.runes_group'];
const pendingBaseTables=new Map();
let baseGeneration=0;
export function warmRuneBaseSession(){
  if(!readRows)return Promise.resolve([]);
  return Promise.all(BASE_TABLES.map(table=>{
    if(readRuneBaseSession(table))return Promise.resolve();
    if(pendingBaseTables.has(table))return pendingBaseTables.get(table);
    const query=runeBaseFetchQuery(table),generation=baseGeneration;
    const adapter=readRows;
    // Load once per browser tab, independent of draw randomness and UI.
    // Failed/partial reads are never persisted; a later read retries SQL.
    const task=Promise.resolve().then(()=>adapter(table,query))
      .then(result=>{
        if(generation===baseGeneration&&result?.rows)
          storeRuneBaseSession(table,result.rows);
      })
      .catch(()=>{}).finally(()=>{
        if(pendingBaseTables.get(table)===task)pendingBaseTables.delete(table);
      });
    pendingBaseTables.set(table,task);
    return task;
  }));
}
function awaitWithAbort(task,signal){
  if(!signal)return task;
  if(signal.aborted)return Promise.reject(new DOMException('Aborted','AbortError'));
  return new Promise((resolve,reject)=>{
    const abort=()=>{cleanup();reject(new DOMException('Aborted','AbortError'));};
    const cleanup=()=>signal.removeEventListener('abort',abort);
    signal.addEventListener('abort',abort,{once:true});
    task.then(value=>{cleanup();resolve(value);},error=>{cleanup();reject(error);});
  });
}

const ALLOWED_TABLES=new Set([
  'silver.runes','silver.runes_etc','silver.runes_group','silver.lrunes_blocks'
]);
export function bindRunePublicReadPort(adapter){
  if(typeof adapter!=='function')throw new TypeError('LRS requires an actual public Rune read port');
  // A newly bound transport must never borrow an outstanding promise from an
  // old connection/adapter. The old caller still owns its promise lifetime.
  releaseRuneTransientReads();
  pendingBaseTables.clear();
  baseGeneration++;
  clearRuneBaseMemory();
  readRows=adapter;
  bindCardDialect({readRows:selectRows,projectColumns:lrsCardRune66ColumnString});
}
export async function selectRows(table,query){
  if(!ALLOWED_TABLES.has(table))throw new Error('Unsupported LRS public table: '+table);
  if(!readRows)throw new Error('LRS 原版符文資料讀取尚未連接 LRS Worker；不能使用展示資料替代。');
  // ONLY the two fixed catalogue tables can reuse completed Session data.
  // Their exact SQL-style column/filter projection is validated; anything
  // else (especially rune_etc, Hero and daily data) always uses the Worker.
  if(BASE_TABLES.includes(table)){
    let catalog=readRuneBaseSession(table);
    if(!catalog&&pendingBaseTables.has(table)){
      await awaitWithAbort(pendingBaseTables.get(table),query?.signal);
      catalog=readRuneBaseSession(table);
    }
    if(catalog){
      if(query?.signal?.aborted)throw new DOMException('Aborted','AbortError');
      const hit=reuseRuneBaseSession(table,query,catalog);
      if(hit)return hit;
    }
  }
  // Explicitly cancellable reads own their AbortSignal and must never share
  // another component's request lifecycle. Non-base reads are not persisted.
  if(query?.signal||!query||typeof query!=='object')return readRows(table,query);
  let key;
  try{key=JSON.stringify([table,query]);}catch{return readRows(table,query);}
  const existing=pendingPublicReads.get(key);
  if(existing)return existing.promise;
  // At excessive concurrency, preserve the existing no-cache behavior and
  // let the component own its request; do not retain an unbounded registry.
  if(pendingPublicReads.size>=MAX_PENDING_PUBLIC_READS)return readRows(table,query);
  const controller=new AbortController();
  const adapter=readRows;
  const entry={controller,promise:null};
  entry.promise=Promise.resolve().then(()=>{
    if(controller.signal.aborted)
      throw new DOMException('Page changed','AbortError');
    return adapter(table,{...query,signal:controller.signal});
  });
  pendingPublicReads.set(key,entry);
  const forget=()=>{if(pendingPublicReads.get(key)===entry)pendingPublicReads.delete(key);};
  void entry.promise.then(forget,forget);
  return entry.promise;
}
export async function readPublicRuneHero(){
  const {rows}=await selectRows('silver.lrunes_blocks',{
    columns:'uid,page_name,block_eyebrow,block_title,block_subtitle,block_text,block_order,block_entity,block_image',
    filters:[{column:'page_name',operator:'eq',value:'hero'}],
    orders:[{column:'block_order',ascending:true}],limit:8,offset:0
  });
  return rows||[];
}
export const lRunes66ColumnString=lrsCardRune66ColumnString;
