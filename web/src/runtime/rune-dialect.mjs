import {bindCardDialect} from '../../../app/lrunes/rune-draw-core.mjs';
import {lrsCardRune66ColumnString} from '../../../modules/lrs/card/zmodel/lrs-card-model.mjs';

// LRS consumes a bound public-read port. Authentication, Kysely,
// ZenStack/Zod policy and SQL connection ownership remain external.
// An unbound read MUST fail, not return sample/fabricated Rune readings.
let readRows=null;
const ALLOWED_TABLES=new Set(['silver.runes','silver.runes_etc','silver.runes_group']);
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
export const lRunes66ColumnString=lrsCardRune66ColumnString;
