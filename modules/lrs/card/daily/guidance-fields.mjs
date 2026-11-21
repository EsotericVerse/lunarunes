// Original five source fields and their canonical display order.
// Pure original guidance field selection; no renderer, CSS or data request.
export const DAILY_GUIDANCE_FIELDS=Object.freeze([
  ['sit_q','狀況形容'],
  ['sit_a','狀況表達'],
  ['daily_r','每日占卜提醒'],
  ['daily_g','每日占卜引導'],
  ['daily_b','每日占卜祝福']
]);


export function readDailyGuidance(card,directionIndex){
  const position=Number(directionIndex)+1;
  return DAILY_GUIDANCE_FIELDS.map(([key,label],index)=>({
    key,label,index,
    text:String(card?.rune_etc?.[key]?.[position]||'').trim()
  })).filter(field=>field.text);
}
