import {DurableObject} from 'cloudflare:workers';
import {createRoom,joinRoom,roomSnapshot,applyRoomAction,validSeatToken} from './modules/lrs/boardgame/online-room.mjs';

const ROOM_TTL=24*60*60*1000;
export class LrsGameRoom extends DurableObject{
  constructor(ctx,env){
    super(ctx,env);
    this.ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS room (id INTEGER PRIMARY KEY, data TEXT NOT NULL)');
  }
  load(){
    const rows=this.ctx.storage.sql.exec('SELECT data FROM room WHERE id = 1').toArray();
    return rows.length?JSON.parse(rows[0].data):null;
  }
  save(room){this.ctx.storage.sql.exec('INSERT OR REPLACE INTO room (id,data) VALUES (1,?)',JSON.stringify(room));}
  send(ws,payload){try{ws.send(JSON.stringify(payload));}catch{}}
  broadcast(room){
    for(const ws of this.ctx.getWebSockets()){
      const seat=ws.deserializeAttachment()?.seat;
      if(Number.isInteger(seat)&&seat>=0&&seat<room.tokens.length)this.send(ws,{type:'state',...roomSnapshot(room,seat)});
    }
  }
  async fetch(request){
    if(request.headers.get('Upgrade')?.toLowerCase()!=='websocket')return new Response('WebSocket required',{status:426});
    if(this.ctx.getWebSockets().length>=12)return new Response('Room connection limit',{status:429});
    const [client,server]=Object.values(new WebSocketPair());
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({seat:null});
    return new Response(null,{status:101,webSocket:client});
  }
  async webSocketMessage(ws,message){
    try{
      if(typeof message!=='string'||message.length>2048)throw Error('訊息格式不正確');
      const msg=JSON.parse(message);
      if(!msg||typeof msg!=='object'||Array.isArray(msg))throw Error('訊息格式不正確');
      let room=this.load();
      const seat=ws.deserializeAttachment()?.seat;
      if(!Number.isInteger(seat)){
        if(!['create','join'].includes(msg.type)||!validSeatToken(msg.token))throw Error('請先加入房間');
        if(!room){
          if(msg.type!=='create')throw Error('找不到房間或房間已過期');
          room=createRoom(msg.count,msg.token);
          await this.ctx.storage.setAlarm(Date.now()+ROOM_TTL);
          // Recheck after the alarm await; a concurrent create must not replace a room.
          if(this.load())throw Error('房間已存在，請重新加入');
          this.save(room);
        }else if(msg.type==='create'&&!room.tokens.includes(msg.token))throw Error('房間已存在');
        const nextSeat=joinRoom(room,msg.token);
        this.save(room);
        for(const other of this.ctx.getWebSockets()){
          if(other!==ws&&other.deserializeAttachment()?.seat===nextSeat){
            other.serializeAttachment({seat:null});try{other.close(1000,'Seat reconnected');}catch{}
          }
        }
        ws.serializeAttachment({seat:nextSeat});
        this.broadcast(room);return;
      }
      if(msg.type!=='action'||!room)throw Error('房間不存在或操作無效');
      applyRoomAction(room,seat,msg);
      this.save(room);
      this.broadcast(room);
    }catch(error){this.send(ws,{type:'error',message:String(error?.message||'房間操作失敗').slice(0,120)});}
  }
  webSocketClose(ws,code,reason){try{ws.close(code,reason);}catch{}}
  webSocketError(ws){try{ws.close(1011,'Connection error');}catch{}}
  async alarm(){
    this.ctx.storage.sql.exec('DELETE FROM room');
    for(const ws of this.ctx.getWebSockets())try{ws.close(1000,'Room expired');}catch{}
  }
}
