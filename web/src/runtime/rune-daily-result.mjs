// A single ephemeral daily result shared by draw/reading route views.
// Never written into Session, IndexedDB or another project's authority.
let current=null;
const taipeiDay=()=>new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Taipei'});
export function rememberDailyDraw(item){
  const rune=Number(item?.card?.rune_id);
  if(!Number.isInteger(rune)||rune<1||rune>66)
    throw new TypeError('Expected a real drawn LRS rune');
  current={day:taipeiDay(),item};
  return item;
}
export function readDailyDraw(){
  if(current&&current.day!==taipeiDay())current=null;
  return current?.item||null;
}
