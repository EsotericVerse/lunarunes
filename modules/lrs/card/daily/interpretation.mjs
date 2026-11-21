import {readDailyGuidance,DAILY_GUIDANCE_FIELDS} from './guidance-fields.mjs';

// LRS original-source composition. This is not a new divination rule or a
// generated prophecy: each stage links directly to the same selected source
// field, direction and actual moon used by the draw.
const DIRECTIONS=Object.freeze(['正位','半正位','半逆位','逆位']);
const CARD_PHASES=Object.freeze({1:'新月',2:'上弦',3:'滿月',4:'下弦'});
const REAL_PHASES=new Set(['新月','上弦','滿月','下弦','空亡']);
const STAGES=Object.freeze([
  Object.freeze({id:'situation',title:'此刻的情境',keys:['sit_q','sit_a'],
    description:'將原文的狀況形容與狀況表達放在一起對照。'}),
  Object.freeze({id:'reminder',title:'今日需要留意',keys:['daily_r'],
    description:'保留原文對當日狀況的提醒。'}),
  Object.freeze({id:'guidance',title:'接下來的引導',keys:['daily_g'],
    description:'以原始引導作為可參考的方向，不增補行動指令。'}),
  Object.freeze({id:'blessing',title:'今日的祝福',keys:['daily_b'],
    description:'以原始祝福收束此次閱讀。'})
]);

export function buildDailyInterpretation(item){
  const card=item?.card;
  const runeNumber=Number(card?.rune_id);
  const directionIndex=Number(item?.directionIndex);
  if(!Number.isInteger(runeNumber)||runeNumber<1||runeNumber>66||
     !Number.isInteger(directionIndex)||directionIndex<0||directionIndex>3)return null;

  const fields=readDailyGuidance(card,directionIndex);
  const byKey=new Map(fields.map(field=>[field.key,field]));
  const stages=STAGES.map(stage=>({
    id:stage.id,title:stage.title,description:stage.description,
    sources:stage.keys.map(key=>byKey.get(key)).filter(Boolean)
  })).filter(stage=>stage.sources.length);
  const moon=REAL_PHASES.has(item?.moon)?item.moon:'未知';
  const cardMoon=CARD_PHASES[Number(card?.moon_phase)]||null;
  const moonRelation=!cardMoon?'not-marked':moon==='未知'?'unknown':
    moon===cardMoon?'same':'different';

  return {
    runeNumber,direction:DIRECTIONS[directionIndex],moon,cardMoon,moonRelation,
    runeDescription:String(card?.rune_description||'').trim(),
    directionMeaning:String(card?.rune_etc?.direction?.[directionIndex+1]||'').trim(),
    stages,originalCount:fields.length,
    missing:DAILY_GUIDANCE_FIELDS.filter(([key])=>!byKey.has(key)).map(([,label])=>label)
  };
}
