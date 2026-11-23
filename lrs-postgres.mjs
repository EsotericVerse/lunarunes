// LRS PostgreSQL-only runtime. Adopted from the current LOC postgres SQL Type.
// No LOC framework, MySQL, MSSQL, Scope, or other database provider dependency.
// The Worker alone reads LRS_DATABASE_URL. Each request owns and closes its socket.
import {Kysely,PostgresDialect} from 'kysely';
import pg from 'pg';

const NON_RETRYABLE_CONNECTION_CODES=new Set([
  '28P01','28000','3D000','3F000','42501','ENOTFOUND'
]);
export function requestScopedPostgresPool(options,ClientClass,{
  attempts=7,baseDelayMs=350,maxDelayMs=1400,
  maxElapsedMs=6000,attemptTimeoutMs=1500,
  now=()=>Date.now(),
  sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms))
}={}){
  let currentWaitUntil=null;
  let ended=false;
  const acquired=new Set();
  const connecting=new Set();
  const closing=new Map();
  const closed=new WeakSet();
  function close(client){
    if(closing.has(client))return closing.get(client);
    if(closed.has(client))return Promise.resolve();
    closed.add(client);
    acquired.delete(client);
    connecting.delete(client);
    const task=Promise.resolve().then(()=>client.end?.()).catch(()=>{})
      .finally(()=>closing.delete(client));
    closing.set(client,task);
    return task;
  }
  function release(client){
    const task=close(client);
    // A response must not freeze a Cloudflare isolate while the PostgreSQL
    // socket remains open. The owning request also explicitly awaits end().
    if(currentWaitUntil)currentWaitUntil(task);
  }
  return {
    setWaitUntil(fn){currentWaitUntil=typeof fn==='function'?fn:null;},
    async connect(){
      if(ended)throw new Error('LRS request database connection already closed');
      let lastError;
      const started=now();
      for(let attempt=1;attempt<=attempts;attempt++){
        if(ended)throw new Error('LRS request database connection already closed');
        const remaining=maxElapsedMs-(now()-started);
        if(remaining<=0)break;
        // pg enforces this timeout per socket. A 6s timeout on EACH retry
        // would take up to 26.1s with the previous four-attempt backoff.
        const configured=Number(options?.connectionTimeoutMillis);
        const perAttempt=Number.isFinite(configured)&&configured>0
          ?Math.min(configured,attemptTimeoutMs):attemptTimeoutMs;
        const client=new ClientClass({...options,
          connectionTimeoutMillis:Math.max(1,Math.floor(Math.min(perAttempt,remaining)))
        });
        client.on?.('error',()=>{});
        connecting.add(client);
        try{
          await client.connect();
          connecting.delete(client);
          if(ended){
            await close(client);
            throw new Error('LRS request database connection already closed');
          }
          acquired.add(client);
          client.release=()=>release(client);
          return client;
        }catch(error){
          connecting.delete(client);
          lastError=error;
          // A failed connection attempt still owns a partially opened socket.
          // Wait for its close before retrying or returning an error.
          await close(client);
          if(ended)throw error;
          // Invalid credentials, database names and SQL permissions cannot
          // be fixed by waking the compute; surface them without retrying.
          if(NON_RETRYABLE_CONNECTION_CODES.has(String(error?.code||'')))
            throw error;
          if(attempt<attempts){
            const left=maxElapsedMs-(now()-started);
            const delay=Math.min(maxDelayMs,baseDelayMs*2**(attempt-1),left);
            if(delay>0)await sleep(delay);
          }
        }
      }
      throw lastError||new Error('LRS database connection retry budget exhausted');
    },
    async end(){
      ended=true;
      await Promise.all([
        ...[...acquired,...connecting].map(close),
        ...closing.values()
      ]);
      currentWaitUntil=null;
    },
    // A cancelled request must release its socket even when its page cannot
    // finish drawing or its SQL callback never reached a normal COMMIT.
    async abort(){await this.end();}
  };
}


export function dialect(driver,url){
  if(driver!=='pg')throw new Error('LRS only supports the PostgreSQL driver');
  if(typeof url!=='string'||!url.trim())throw new TypeError('LRS database URL is required');
  let parsed;
  try{parsed=new URL(url);}catch{throw new TypeError('Invalid LRS database URL');}
  if(!['postgres:','postgresql:'].includes(parsed.protocol)||!parsed.hostname)
    throw new TypeError('Expected a PostgreSQL URL');
  const pool=requestScopedPostgresPool({connectionString:url,connectionTimeoutMillis:6000},pg.Client);
  return new Kysely({dialect:new PostgresDialect({pool})});
}
