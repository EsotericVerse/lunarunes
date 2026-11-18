/**
 * LRS read-only host implementation of the loc:dialect read port.
 *
 * Connection selection is the Worker's LRS_DATABASE_URL secret ONLY.
 * Table/column selection is the fixed, validated LRS Rune projection in
 * public-rune-read.mjs. No client-controlled host, DB URL, SQL or schema.
 * The original tables stay in place; this performs SELECT, never migration.
 */
// Fixed, module-only snapshot of LOC PR #1732. No loc-framework dependency.
import {dialect} from './vendor/loc-dialect/index.mjs';

export function lrsPublicSelect(db,query){
  // Defense in depth: never accept an arbitrary schema/table here, even
  // though the HTTP edge already validates them.
  if(query?.schema!=='silver'||
     !['runes','runes_etc','runes_group'].includes(query?.table))
    throw new TypeError('Unsupported LRS table');
  if(!Array.isArray(query.columns)||query.columns.length===0)
    throw new TypeError('LRS columns are required');
  let statement=db.selectFrom('silver.'+query.table).select(query.columns);
  for(const filter of query.filters||[]){
    if(filter.op==='eq')statement=statement.where(filter.column,'=',filter.value);
    else if(filter.op==='in')statement=statement.where(filter.column,'in',filter.value);
    else throw new TypeError('Unsupported LRS operator');
  }
  for(const order of query.orders||[])
    statement=statement.orderBy(order.column,order.ascending?'asc':'desc');
  return statement.limit(query.limit).offset(query.offset);
}

export async function readLrsPublicRows(connectionString,query){
  if(typeof connectionString!=='string'||!/^postgres(?:ql)?:\/\//i.test(connectionString))
    throw Object.assign(new Error('LRS_DATABASE_URL unavailable'),{code:'DATABASE_NOT_CONFIGURED'});
  // The isolated loc:dialect server-only adapter owns request-scoped pg
  // connection lifecycle; LRS retains the exact read whitelist and query shape.
  const db=dialect('pg',connectionString);
  try{
    const rows=await lrsPublicSelect(db,query).execute();
    return {rows,dataSource:'lrs-database'};
  }finally{
    await db.destroy();
  }
}
