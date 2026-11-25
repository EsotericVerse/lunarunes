import {createLunaRunesGame} from './boardgame-rules.js';
import {localTabletopRules} from './game-data.js';

const rules=localTabletopRules();
const fail=message=>{throw new Error(message);};
export const validRoomCode=value=>typeof value==='string'&&/^[a-f0-9]{32}$/.test(value);
export const validSeatToken=validRoomCode;
export function createRoom(count,token){
  if(![2,3,4].includes(count)||!validSeatToken(token))fail('房間參數不正確');
  return {count,tokens:[token],game:null,revision:1};
}
export function joinRoom(room,token){
  if(!validSeatToken(token))fail('玩家憑證不正確');
  const existing=room.tokens.indexOf(token);
  if(existing>=0)return existing;
  if(room.game||room.tokens.length>=room.count)fail('房間已滿或牌局已開始');
  room.tokens.push(token);room.revision++;
  return room.tokens.length-1;
}
export function roomSnapshot(room,seat){
  const G=room.game;
  return {seat,count:room.count,joined:room.tokens.length,revision:room.revision,
    game:G?{
      stage:G.stage,round:G.round,active:G.active,winner:G.winner,draw:G.draw,
      duelists:G.duelists,logs:G.logs,result:G.result,
      currentEvent:G.stage==='event'?G.eventDeck[G.eventIndex%G.eventDeck.length]:null,
      players:G.players.map((p,i)=>({name:p.name,de:p.de,
        hand:i===seat?p.hand:[],handCount:p.hand.length,deckCount:p.deck.length,
        selected:i===seat?p.selected:[],selectedCount:p.selected.length,opening:p.opening}))
    }:null};
}
export function applyRoomAction(room,seat,msg){
  if(!Number.isInteger(seat)||seat<0||seat>=room.tokens.length)fail('尚未加入房間');
  const engine=createLunaRunesGame(rules,room.count);
  if(msg.action==='start'){
    if(seat!==0||room.game||room.tokens.length!==room.count)fail('需由房主在玩家到齊後開局');
    room.game=engine.setup();room.revision++;return;
  }
  const G=room.game;
  if(!G||G.stage==='finished'||msg.round!==G.round||msg.stage!==G.stage)fail('牌局已更新，請重新操作');
  const p=G.players[seat];
  switch(msg.action){
    case 'toggleCard':{
      const limit=G.stage==='opening'?rules.config.openingDiscard:rules.config.eventResponseCards;
      if(!['opening','event'].includes(G.stage)||(G.stage==='opening'&&seat!==G.active)
        ||!Number.isInteger(msg.cardId)||typeof msg.selected!=='boolean'
        ||!p.hand.some(c=>c.id===msg.cardId))fail('目前不能選擇這張牌');
      const selected=p.selected.includes(msg.cardId);
      if(selected===msg.selected)return;
      if(msg.selected&&p.selected.length>=limit)fail('已達選牌上限');
      engine.moves.toggleCard({G},seat,msg.cardId);break;
    }
    case 'confirmOpening':
      if(G.stage!=='opening'||seat!==G.active||p.selected.length!==rules.config.openingDiscard)fail('不是你的棄牌回合或張數不符');
      engine.moves.confirmOpening({G},seat);break;
    case 'resolveEvent':
      if(G.stage!=='event'||G.players.some(x=>x.selected.length!==rules.config.eventResponseCards))fail('尚未完成事件選牌');
      engine.moves.resolveEvent({G});break;
    case 'resonance':
      if(!['resonance','duel'].includes(G.stage)||seat!==G.active||!['self','attack'].includes(msg.kind)
        ||(msg.kind==='attack'&&(!Number.isInteger(msg.target)||msg.target===seat||!G.players[msg.target]
          ||(G.stage==='duel'&&!G.duelists.includes(msg.target)))))fail('目前不能執行此共振');
      engine.moves.resonance({G},msg.kind,msg.target);break;
    default:fail('不支援的操作');
  }
  room.revision++;
}
