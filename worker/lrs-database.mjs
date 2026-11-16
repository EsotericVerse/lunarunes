/**
 * LRS read-only host implementation of the loc:dialect read port.
 *
 * Connection selection is the Worker's LRS_DATABASE_URL secret ONLY.
 * Table/column selection is the fixed, validated LRS Rune projection in
 * public-rune-read.mjs. No client-controlled host, DB URL, SQL or schema.
 * The original tables stay in place; this performs SELECT, never migration.
 */
import {Kysely,PostgresDialect} from 'kysely';
import pg from 'pg';

// The incoming HTTP contract retains the historic logical silver.* names.
 // Physical LRS tables can live in a separate database/schema, configured ONLY
 // by the Worker. The public request cannot choose a database or SQL schema.
export function lrsPhysicalSchema(value='silver'){
  const name=String(value||'silver');
  if(!/^[a-z][a-z0-9_]{0,62}$/.test(name)||name.startsWith('pg_')||
     ['information_schema','mysql','sys'].includes(name))
    throw new TypeError('Invalid LRS physical table schema');
  return name;
}
export function lrsPublicSelect(db,query,{schema='silver'}={}){
  // Defense in depth: never accept an arbitrary schema/table here, even
  // though the HTTP edge already validates them.
  if(query?.schema!=='silver'||
     !['runes','runes_etc','runes_group','lrunes_blocks'].includes(query?.table))
    throw new TypeError('Unsupported LRS table');
  if(!Array.isArray(query.columns)||query.columns.length===0)
    throw new TypeError('LRS columns are required');
  const physical=lrsPhysicalSchema(schema);
  let statement=db.selectFrom(physical+'.'+query.table).select(query.columns);
  for(const filter of query.filters||[]){
    if(filter.op==='eq')statement=statement.where(filter.column,'=',filter.value);
    else if(filter.op==='in')statement=statement.where(filter.column,'in',filter.value);
    else throw new TypeError('Unsupported LRS operator');
  }
  for(const order of query.orders||[])
    statement=statement.orderBy(order.column,order.ascending?'asc':'desc');
  return statement.limit(query.limit).offset(query.offset);
}

export async function readLrsPublicRows(connectionString,query,{schema='silver'}={}){
  if(typeof connectionString!=='string'||!/^postgres(?:ql)?:\/\//i.test(connectionString))
    throw Object.assign(new Error('LRS_DATABASE_URL unavailable'),{code:'DATABASE_NOT_CONFIGURED'});
  // Direct PostgreSQL connection, one request-scoped connection. No shared
  // state, LOC website fetch, or pool stored across unrelated Workers.
  const pool=new pg.Pool({
    connectionString,max:1,connectionTimeoutMillis:5000,idleTimeoutMillis:1000,
    allowExitOnIdle:true
  });
  const db=new Kysely({dialect:new PostgresDialect({pool})});
  try{
    const rows=await lrsPublicSelect(db,query,{schema}).execute();
    return {rows,dataSource:'lrs-database'};
  }finally{
    await db.destroy();
  }
}
