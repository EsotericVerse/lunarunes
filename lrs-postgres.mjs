// LRS PostgreSQL-only runtime; Hyperdrive owns the origin connection pool.
import {Kysely,PostgresDialect} from 'kysely';
import pg from 'pg';

export function lrsConnectionString(env){
  const value=env?.LRS_HYPERDRIVE?.connectionString;
  if(typeof value!=='string'||!value.trim())return null;
  try{
    const parsed=new URL(value);
    return ['postgres:','postgresql:'].includes(parsed.protocol)&&parsed.hostname?value:null;
  }catch{return null;}
}

export function dialect(driver,url){
  if(driver!=='pg')throw new Error('LRS only supports the PostgreSQL driver');
  if(typeof url!=='string'||!/^postgres(?:ql)?:\/\//i.test(url))
    throw new TypeError('LRS Hyperdrive connection is required');
  // One request-local client at most. Kysely destroy closes this pool;
  // Hyperdrive keeps and reuses the upstream connections across requests.
  const pool=new pg.Pool({connectionString:url,max:1,connectionTimeoutMillis:6000});
  return new Kysely({dialect:new PostgresDialect({pool})});
}
