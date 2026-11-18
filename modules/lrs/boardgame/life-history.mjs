/**
 * Fixed, explicit residence interval => historical Rune-life starting point.
 * Article dates/places/aspects/keywords are supplied by a host or user.
 * Never infer a two-year residence from a sparse collection of posts.
 */
import {LIFE_ASPECTS,nextLifeMonth} from './life-engine.mjs';

const KEYS=new Set(LIFE_ASPECTS.map(item=>item.key));
const MONTH=/^\d{4}-(0[1-9]|1[0-2])$/;
const monthIndex=value=>{if(!MONTH.test(value))throw new TypeError('月份必須是 YYYY-MM');const [y,m]=value.split('-').map(Number);return y*12+m;};
const text=value=>String(value??'').trim();

export function createBloomFilter(expected=256,hashes=4){
  const size=Math.max(256,Math.ceil(expected*12));
  const bits=new Uint8Array(Math.ceil(size/8));
  const locations=value=>{
    let a=2166136261,b=5381;
    for(const char of String(value)){const n=char.codePointAt(0);a=Math.imul(a^n,16777619)>>>0;b=(Math.imul(b,33)^n)>>>0;}
    return Array.from({length:hashes},(_,i)=>(a+i*b+i*i)>>>0).map(n=>n%size);
  };
  return {
    mightContain(value){return locations(value).every(n=>(bits[n>>3]&(1<<(n&7)))!==0);},
    add(value){for(const n of locations(value))bits[n>>3]|=1<<(n&7);}
  };
}

export function buildFixedLifeBaseline({placeId,startMonth,endMonth,articles}){
  const place=text(placeId);
  if(!place)throw new Error('請指定久居地');
  const begin=monthIndex(startMonth),end=monthIndex(endMonth);
  if(end<begin||end-begin<24)throw new Error('久居區間需至少跨越完整兩年（24 個月）');
  if(!Array.isArray(articles))throw new TypeError('歷史文章必須是陣列');
  const counts=Object.fromEntries(LIFE_ASPECTS.map(x=>[x.key,0]));
  const keywordCounts=new Map(),keywordsByAspect=Object.fromEntries(LIFE_ASPECTS.map(x=>[x.key,new Map()]));
  const bloom=createBloomFilter(Math.max(256,articles.length));
  const exact=new Set();
  let accepted=0,unclassified=0,duplicates=0;
  for(const article of articles){
    if(!article||typeof article!=='object')continue;
    const date=text(article.month||article.date||article.created_at).slice(0,7);
    if(!MONTH.test(date)||monthIndex(date)<begin||monthIndex(date)>end)continue;
    if(text(article.placeId??article.source_place)!==place)continue;
    const tags=Array.isArray(article.aspects)?[...new Set(article.aspects.filter(key=>KEYS.has(key)))]:[];
    const words=Array.isArray(article.keywords)?[...new Set(article.keywords.map(text).filter(Boolean))]:[];
    const key=text(article.id)||JSON.stringify([date,place,text(article.text),tags,words]);
    if(bloom.mightContain(key)&&exact.has(key)){duplicates++;continue;}
    bloom.add(key);exact.add(key);accepted++;
    if(!tags.length)unclassified++;
    for(const tag of tags)counts[tag]++;
    for(const word of words){
      keywordCounts.set(word,(keywordCounts.get(word)||0)+1);
      for(const tag of tags){
        const map=keywordsByAspect[tag];map.set(word,(map.get(word)||0)+1);
      }
    }
  }
  return {
    kind:'lrs:boardgame/life-baseline',placeId:place,startMonth,endMonth,
    firstTurnMonth:nextLifeMonth(endMonth),articleCount:accepted,unclassified,duplicates,
    counts,keywords:Object.fromEntries(keywordCounts),
    keywordsByAspect:Object.fromEntries(Object.entries(keywordsByAspect).map(([key,map])=>[key,Object.fromEntries(map)]))
  };
}
