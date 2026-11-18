/**
 * Rune-life advances by committed months. Counts are observations of recorded
 * articles and elected actions, never made-up health/wealth/karma scores.
 */
import {LIFE_ASPECTS} from './life-engine.mjs';

const keys=new Set(LIFE_ASPECTS.map(x=>x.key));
const fresh=()=>Object.fromEntries(LIFE_ASPECTS.map(x=>[x.key,0]));
const entries=object=>Object.entries(object||{}).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'zh-Hant'));
const increment=(dict,key)=>{dict[key]=(dict[key]||0)+1;};
const safeWord=value=>String(value??'').trim().slice(0,80);

export function createLifeProgress(baseline){
  if(baseline?.kind!=='lrs:life/baseline')
    throw new TypeError('需先建立固定久居地歷史基準');
  return {
    baseline,counts:{...baseline.counts},keywordCounts:{...baseline.keywords},
    history:[],lastAdditions:[],month:baseline.endMonth
  };
}

export function recordLifeMonth(progress,completed,cardNames={}){
  if(!progress||!Array.isArray(progress.history))throw new TypeError('無效的模擬人生進度');
  if(completed?.kind!=='lrs:life'||completed.status!=='complete')
    throw new Error('必須先完成當月五次選擇');
  const expected=progress.history.length?progress.history.at(-1).nextMonth:progress.baseline.firstTurnMonth;
  if(completed.month!==expected)throw new Error('不可重複結算或跳過月份');
  if(completed.actions?.length!==5||completed.unplayed?.length!==3)
    throw new Error('每月必須選五張並留下三張');
  const counts={...progress.counts},keywordCounts={...progress.keywordCounts};
  const increments=fresh(),additions=[],monthWords=[];
  for(const action of completed.actions){
    if(!keys.has(action.aspect))throw new Error('未知的曲線面向');
    increments[action.aspect]++;counts[action.aspect]++;
    const aspect=LIFE_ASPECTS.find(x=>x.key===action.aspect);
    const name=safeWord(cardNames[action.runeId])||'符文 '+action.runeId;
    const direction=safeWord(action.direction)||'未指定';
    const base=progress.baseline.keywordsByAspect?.[action.aspect]||{};
    const source=entries(base)[0]?.[0]||null;
    const combinations=[
      aspect.name+' × '+name,
      direction+' × '+aspect.decision,
      ...(source?[source+' × '+name]:[])
    ];
    for(const keyword of combinations){
      const existing=keywordCounts[keyword]||0;
      increment(keywordCounts,keyword);
      additions.push({keyword,previous:existing,current:existing+1,runeId:action.runeId,aspect:action.aspect,source:source?source:'',origin:'game-combination'});
      monthWords.push(keyword);
    }
  }
  // Cross-aspect compositions appear when this month's selected directions
  // connect two different domains. No external article is synthesized.
  const selectedAspects=[...new Set(completed.actions.map(x=>x.aspect))];
  for(let i=1;i<selectedAspects.length;i++){
    const prev=LIFE_ASPECTS.find(x=>x.key===selectedAspects[i-1]);
    const now=LIFE_ASPECTS.find(x=>x.key===selectedAspects[i]);
    const keyword=prev.name+' × '+now.name;
    const existing=keywordCounts[keyword]||0;
    increment(keywordCounts,keyword);
    additions.push({keyword,previous:existing,current:existing+1,origin:'game-cross-aspect'});
    monthWords.push(keyword);
  }
  const nextMonth=(()=>{
    const [y,m]=completed.month.split('-').map(Number);
    return (m===12?y+1:y)+'-'+String(m===12?1:m+1).padStart(2,'0');
  })();
  const record={
    month:completed.month,nextMonth,increments,counts:{...counts},
    additions,selected:completed.actions.map(item=>({...item})),
    unplayed:[...completed.unplayed],event:completed.event??null,
    keywordTotal:Object.values(keywordCounts).reduce((a,b)=>a+b,0),
    newWordCount:monthWords.length
  };
  return {...progress,counts,keywordCounts,history:[...progress.history,record],
    month:completed.month,lastAdditions:additions};
}

export function fiveNumberSummary(values){
  const sorted=(values||[]).filter(Number.isFinite).slice().sort((a,b)=>a-b);
  if(!sorted.length)return null;
  const quantile=q=>{
    const i=(sorted.length-1)*q,lo=Math.floor(i),hi=Math.ceil(i);
    return sorted[lo]+(sorted[hi]-sorted[lo])*(i-lo);
  };
  return {min:sorted[0],q1:quantile(.25),median:quantile(.5),q3:quantile(.75),max:sorted.at(-1),
    mean:sorted.reduce((a,b)=>a+b,0)/sorted.length};
}

export function ewma(values,span=5){
  if(!Array.isArray(values)||!values.length)return [];
  const alpha=2/(Math.max(1,span)+1);
  let last=null;
  return values.map(value=>{
    const next=Number(value)||0;
    last=last===null?next:alpha*next+(1-alpha)*last;
    return last;
  });
}

export function lifeTimeline(progress){
  if(!progress)return [];
  const rows=progress.history||[];
  return rows.map((record,i)=>({
    month:record.month,...record.counts,
    ...Object.fromEntries(LIFE_ASPECTS.map(aspect=>[
      aspect.key+'EWMA',ewma(rows.slice(0,i+1).map(x=>x.increments[aspect.key]))[i]
    ])),
    keywordTotal:record.keywordTotal,
    ...fiveNumberSummary(LIFE_ASPECTS.map(aspect=>record.counts[aspect.key]))
  }));
}
