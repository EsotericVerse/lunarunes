/**
 * LRS read-only PostgreSQL host implementation of its own Rune read port.
 *
 * Connection selection is the Worker's LRS_HYPERDRIVE binding ONLY.
 * Table/column selection is the fixed, validated LRS Rune projection in
 * public-rune-read.mjs. No client-controlled host, DB URL, SQL or schema.
 * Only fixed LRS Rune relations are readable; this performs SELECT, never migration.
 */
import {dialect} from './lrs-postgres.mjs';

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
    throw Object.assign(new Error('LRS Hyperdrive unavailable'),{code:'DATABASE_NOT_CONFIGURED'});
  // LRS PostgreSQL owns its request-scoped connection lifecycle.
  // This endpoint retains a fixed, validated read-only projection.
  const db=dialect('pg',connectionString);
  try{
    const rows=await lrsPublicSelect(db,query).execute();
    return {rows,dataSource:'lrs-database'};
  }finally{
    await db.destroy();
  }
}
