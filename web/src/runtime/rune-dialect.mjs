import {bindCardDialect} from '../../../app/lrunes/rune-draw-core.mjs';
import {lrsCardRune66ColumnString} from '../../../modules/lrs/card/zmodel/lrs-card-model.mjs';

// Public-read port. LRS sends only bounded, anonymous read requests to its
// own existing Worker. The LRS Worker owns the LRS_DATABASE_URL secret, while
// the existing LOC language/keyword modules remain unchanged.
let readRows=null;
const ALLOWED_TABLES=new Set([
  'silver.runes','silver.runes_etc','silver.runes_group','silver.lrunes_blocks'
]);
export function bindRunePublicReadPort(adapter){
  if(typeof adapter!=='function')throw new TypeError('LRS requires an actual public Rune read port');
  readRows=adapter;
  bindCardDialect({readRows:selectRows,projectColumns:lrsCardRune66ColumnString});
}
export async function selectRows(table,query){
  if(!ALLOWED_TABLES.has(table))throw new Error('Unsupported LRS public table: '+table);
  if(!readRows)throw new Error('LRS 原版符文資料讀取尚未連接 loc:dialect；不能使用展示資料替代。');
  return readRows(table,query);
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
