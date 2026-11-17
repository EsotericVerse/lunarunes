import {bindCardDialect} from '../../../app/lrunes/rune-draw-core.mjs';
import {lrsCardRune66ColumnString} from '../../../modules/lrs/card/zmodel/lrs-card-model.mjs';

// Public-read port. LRS sends only bounded, anonymous read requests to its
// own existing Worker. Only the LRS Worker may hold LRS_DATABASE_URL;
// Rune Web must not access another project's database or private record APIs.
let readRows=null;
// Share only simultaneous anonymous reads. A completed result is immediately
// freed, unlike a persistent SQL/session cache; bounded by active requests.
const pendingPublicReads=new Map();
const MAX_PENDING_PUBLIC_READS=32;
const ALLOWED_TABLES=new Set([
  'silver.runes','silver.runes_etc','silver.runes_group','silver.lrunes_blocks'
]);
export function bindRunePublicReadPort(adapter){
  if(typeof adapter!=='function')throw new TypeError('LRS requires an actual public Rune read port');
  // A newly bound transport must never borrow an outstanding promise from an
  // old connection/adapter. The old caller still owns its promise lifetime.
  pendingPublicReads.clear();
  readRows=adapter;
  bindCardDialect({readRows:selectRows,projectColumns:lrsCardRune66ColumnString});
}
export async function selectRows(table,query){
  if(!ALLOWED_TABLES.has(table))throw new Error('Unsupported LRS public table: '+table);
  if(!readRows)throw new Error('LRS 原版符文資料讀取尚未連接 LRS Worker；不能使用展示資料替代。');
  // Explicitly cancellable reads own their AbortSignal and must never share
  // another component's request lifecycle. No persistent read-result cache.
  if(query?.signal||!query||typeof query!=='object')return readRows(table,query);
  let key;
  try{key=JSON.stringify([table,query]);}catch{return readRows(table,query);}
  const existing=pendingPublicReads.get(key);
  if(existing)return existing;
  const promise=Promise.resolve().then(()=>readRows(table,query));
  if(pendingPublicReads.size>=MAX_PENDING_PUBLIC_READS)return promise;
  pendingPublicReads.set(key,promise);
  const forget=()=>{if(pendingPublicReads.get(key)===promise)pendingPublicReads.delete(key);};
  void promise.then(forget,forget);
  return promise;
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
