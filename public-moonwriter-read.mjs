// Narrow LRS-only public novel reader: one already-listed chapter per request.
// Never accept a caller-selected table, column, SQL, URL or arbitrary Galaxy UID.
import {dialect,lrsConnectionString} from './lrs-postgres.mjs';
import {moonwriterChapter} from './modules/lrs/reading/moonwriter-catalog.mjs';

const headers={
  'content-type':'application/json; charset=utf-8',
  'cache-control':'public, max-age=300, s-maxage=900',
  'x-content-type-options':'nosniff'
};
const json=(value,status)=>new Response(JSON.stringify(value),{status,headers});

export async function readPublicMoonwriter(request,env){
  if(request.method!=='GET')return json({error:'Method not allowed'},405);
  const url=new URL(request.url);
  const match=url.pathname.match(/^\/api\/lrs\/moonwriter\/([A-Za-z0-9]{8})$/);
  if(!match||url.search)return json({error:'Invalid chapter request'},400);
  const expected=moonwriterChapter(match[1]);
  if(!expected)return json({error:'Novel chapter not found'},404);
  const connection=lrsConnectionString(env);
  if(!connection)
    return json({error:'Novel reader unavailable'},503);
  const db=dialect('pg',connection);
  try{
    // These conditions are authorization constraints, not user-editable filters.
    const row=await db.selectFrom('silver.lrunes_galaxy')
      .select(['uid','title','content'])
      .where('uid','=',expected.uid)
      .where('site','=','vocus')
      .where('list','=',true)
      .where('title','=',expected.title)
      .limit(1)
      .executeTakeFirst();
    if(!row||typeof row.content!=='string'||!row.content.trim())
      return json({error:'Novel chapter not found'},404);
    if(row.content.length>100000)return json({error:'Novel chapter unavailable'},503);
    return json({uid:expected.uid,title:row.title,content:row.content},200);
  }catch{
    // Never disclose connection details, database errors or other Galaxy rows.
    return json({error:'Novel reader unavailable'},503);
  }finally{await db.destroy();}
}
