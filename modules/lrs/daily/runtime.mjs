import {buildReferencedMoonRiver} from './moon-river.mjs';
/**
 * Read-only lrs:daily business runtime. LRS owns the data contract and
 * supplies its own trusted read ports; no database URL, SQL driver or
 * user/private record is accepted directly by this pure module.
 * Access-controlled daily writes must use an LRS-owned authenticated endpoint.
 * Lunar-phase computation is injected independently of the data store.
 */
export function createDailyModule({readDailyMonth,readDailyRange,phaseAtDate}={}){
  if(typeof readDailyMonth!=='function'||typeof readDailyRange!=='function')
    throw new TypeError('lrs:daily requires explicit LRS readDailyMonth and readDailyRange ports');
  if(typeof phaseAtDate!=='function')
    throw new TypeError('lrs:daily requires phaseAtDate');
  return Object.freeze({
    readMonth:query=>readDailyMonth(query),
    readRange:query=>readDailyRange(query),
    moonRiver:(start,end,lanes,visibleCount)=>buildReferencedMoonRiver(start,end,lanes,phaseAtDate,visibleCount)
  });
}
