import {readdir} from 'node:fs/promises';
const cards=await readdir(new URL('../assets/lunarunes/cards/',import.meta.url));
const pics=await readdir(new URL('../assets/pics/',import.meta.url));
const cardCount=cards.filter(name=>/^\d{2}\.png$/.test(name)).length;
const groupCount=pics.filter(name=>/^0[1-9][._].+\.jpg$/.test(name)&&!/_s\.jpg$/.test(name)).length;
if(cardCount!==67||groupCount!==9){
  console.error('LRS files: cards='+cardCount+'/67, group images='+groupCount+'/9');
  process.exitCode=1;
}else console.log('LRS file counts: 67 cards, 9 group images');
