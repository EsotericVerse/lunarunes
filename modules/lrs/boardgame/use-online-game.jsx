import {useEffect,useRef,useState} from 'react';
import {validRoomCode} from './online-room.mjs';

const randomId=()=>crypto.randomUUID().replaceAll('-','');
const storageKey=code=>'lrs:room:'+code;
function tokenFor(code){
  let token;try{token=sessionStorage.getItem(storageKey(code));}catch{}
  if(!validRoomCode(token)){token=randomId();try{sessionStorage.setItem(storageKey(code),token);}catch{}}
  return token;
}
export function useOnlineGame(enabled){
  const socket=useRef(null),intent=useRef(null);
  const [room,setRoom]=useState(null),[code,setCode]=useState(''),[status,setStatus]=useState('idle'),[notice,setNotice]=useState('');
  function close(){const old=socket.current;socket.current=null;if(old)old.close();}
  useEffect(()=>()=>{const old=socket.current;socket.current=null;if(old)old.close();},[]);
  function connect(type,roomCode,count){
    if(!enabled||!/^https?:$/.test(location.protocol)){setNotice('線上試驗僅支援網頁版');return;}
    if(!validRoomCode(roomCode)){setNotice('房間代碼不正確');return;}
    close();setRoom(null);setCode(roomCode);setNotice('');setStatus('connecting');
    const token=tokenFor(roomCode);
    intent.current={type,roomCode,count};
    const endpoint=new URL('/api/lrs/game/room/'+roomCode,location.origin);
    endpoint.protocol=location.protocol==='https:'?'wss:':'ws:';
    const ws=new WebSocket(endpoint);socket.current=ws;
    ws.onopen=()=>{if(socket.current===ws)ws.send(JSON.stringify({type,token,count}));};
    ws.onmessage=event=>{
      if(socket.current!==ws)return;
      try{
        const msg=JSON.parse(event.data);
        if(msg.type==='state'){setRoom(msg);setNotice('');setStatus('connected');intent.current={type:'join',roomCode,count};}
        else if(msg.type==='error'){setNotice(msg.message);if(ws.readyState===WebSocket.OPEN&&msg.message.includes('找不到房間'))ws.close();}
      }catch{setNotice('房間資料格式錯誤');}
    };
    ws.onclose=()=>{if(socket.current===ws)setStatus('disconnected');};
    ws.onerror=()=>{if(socket.current===ws)setNotice('連線失敗，可重新連線');};
  }
  function action(name,...args){
    if(socket.current?.readyState!==WebSocket.OPEN||status!=='connected'){setNotice('尚未連線');return;}
    const G=room?.game;
    const msg={type:'action',action:name,stage:G?.stage,round:G?.round};
    if(name==='toggleCard'){msg.cardId=args[1];msg.selected=!G.players[room.seat].selected.includes(msg.cardId);}
    if(name==='resonance'){msg.kind=args[0];msg.target=args[1];}
    socket.current.send(JSON.stringify(msg));
  }
  function leave(){close();intent.current=null;setRoom(null);setCode('');setStatus('idle');setNotice('');}
  return {room,code,status,notice,action,leave,create:count=>connect('create',randomId(),count),join:code=>connect('join',code.trim().toLowerCase()),reconnect:()=>{const i=intent.current;if(i)connect(i.type,i.roomCode,i.count);}};
}
