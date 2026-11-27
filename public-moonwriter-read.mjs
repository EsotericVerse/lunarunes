// Narrow LRS-only public novel reader: one already-listed chapter per request.
// Never accept a caller-selected table, column, SQL, URL or arbitrary Galaxy UID.
import {moonwriterChapter} from './modules/lrs/reading/moonwriter-catalog.mjs';

const headers={
  'content-type':'application/json; charset=utf-8',
  'cache-control':'public, max-age=300, s-maxage=900',
  'x-content-type-options':'nosniff'
};
const json=(value,status)=>new Response(JSON.stringify(value),{status,headers});

export async function readPublicMoonwriter(request,dataPort){
  if(request.method!=='GET')return json({error:'Method not allowed'},405);
  const url=new URL(request.url);
  const match=url.pathname.match(/^\/api\/lrs\/moonwriter\/([A-Za-z0-9]{8})$/);
  if(!match||url.search)return json({error:'Invalid chapter request'},400);
  const expected=moonwriterChapter(match[1]);
  if(!expected)return json({error:'Novel chapter not found'},404);
  if(typeof dataPort?.readMoonwriterChapter!=='function')
    return json({error:'Novel reader unavailable'},503);
  try{
    const row=await dataPort.readMoonwriterChapter(expected,{signal:request.signal});
    if(!row||row.uid!==expected.uid||row.title!==expected.title||
      typeof row.content!=='string'||!row.content.trim())
      return json({error:'Novel chapter not found'},404);
    if(row.content.length>100000)return json({error:'Novel chapter unavailable'},503);
    return json({uid:expected.uid,title:row.title,content:row.content},200);
  }catch{
    // Never disclose connection details, database errors or other Galaxy rows.
    return json({error:'Novel reader unavailable'},503);
  }
}
