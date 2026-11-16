/**
 * Rune Hero's pure presentation contract. This is LRS UI, not the LOC
 * editor/management HomeBlock model. Do not import LOC admin schemas.
 */
const markerParagraph=/<p\b[^>]*>\s*(?:(?:\uFFFC|&#0*65532;|&#x0*fffc;)\s*)+<\/p>/gi;
export function stripRunePlaceholderParagraphs(html=''){
 return String(html??'').replace(markerParagraph,'<p><br></p>');
}
const columns=new Set([2,3,6]);
const uidAlphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function uid(){
 const bytes=new Uint8Array(8);globalThis.crypto?.getRandomValues?.(bytes);
 return Array.from(bytes,(b)=>uidAlphabet[b%uidAlphabet.length]).join('');
}
function bubbleColumns(value){
 const first=Array.isArray(value)?value[0]:null;
 return columns.has(first)?first:3;
}
function normalizeEntities(value){
 const raw=Array.isArray(value)?(typeof value[0]==='number'?value.slice(1):value):[];
 return raw.slice(0,6).map((entity,index)=>({
  uid:/^[A-Za-z0-9]{8}$/.test(String(entity?.uid||''))?String(entity.uid):uid(),
  title:String(entity?.title||''),text:String(entity?.text||''),
  ...(entity?.image_mode==='side'?{image_mode:'side'}:{}),order:index+1
 }));
}
function signature(value){
 return stripRunePlaceholderParagraphs(value||'')
  .replace(/<br\b[^>]*>/gi,' ').replace(/<[^>]*>/g,'')
  .replace(/&nbsp;|&#0*160;|&#x0*a0;/gi,' ')
  .replace(/\uFFFC/g,'').replace(/\s+/g,'').trim();
}
function visibleEntities(slot){
 const signatures=new Set([slot?.eyebrow,slot?.title,slot?.subtitle,slot?.text].map(signature).filter(Boolean));
 return (Array.isArray(slot?.entities)?slot.entities:[]).filter(entity=>{
  const title=signature(entity?.title),body=signature(entity?.text);
  const hasMedia=/<(?:img|picture|video|audio|iframe|svg)\b/i.test(String(entity?.text||''));
  if(!title&&!body&&!hasMedia)return false;
  if(!title&&body&&signatures.has(body))return false;
  if(title&&body&&signatures.has(body))return false;
  if(title&&!body&&!hasMedia&&signatures.has(title))return false;
  return true;
 });
}
function plainBlockLine(value=''){
 return String(value??'').replace(/<br\s*\/?\s*>/gi,' ')
 .replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#0*160;|&#x0*a0;/gi,' ')
 .replace(/\s+/g,' ').trim();
}
function removeDuplicatedLegacySubtitle(body='',subtitle=''){
 const text=String(body??''),heading=String(subtitle??'');
 return heading&&text.startsWith(heading)?text.slice(heading.length):text;
}
export const HomeBlock=Object.freeze({
 bubbleColumns,normalizeEntities,visibleEntities,plainBlockLine,
 stripLocHomeEditorPlaceholders:stripRunePlaceholderParagraphs,
 removeDuplicatedLegacySubtitle,
 childPresentation:title=>String(title??'').trim()?'card':'bubble',
 heroExtraFor:scope=>String(scope)==='lrunes'
  ?{key:'moon',label:'玄韻家黃色圓點標誌',text:''}:null
});
