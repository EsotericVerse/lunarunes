import {handlePublicRuneRead} from './public-rune-read.mjs';
import {readPublicMoonwriter} from './public-moonwriter-read.mjs';
export {LrsGameRoom} from './lrs-game-room.mjs';

// LRS native app uses its local bundled files and only the LRS public data endpoint.
const IOS_ORIGIN='capacitor://localhost';
const cors=()=>({
  'access-control-allow-origin':IOS_ORIGIN,
  'access-control-allow-methods':'POST, OPTIONS',
  'access-control-allow-headers':'content-type',
  'access-control-max-age':'600',
  'vary':'Origin'
});
export default {
  async fetch(request,env){
    const url=new URL(request.url),pathname=url.pathname;
    if(pathname.startsWith('/api/lrs/game/room/')){
      const match=pathname.match(/^\/api\/lrs\/game\/room\/([a-f0-9]{32})$/);
      if(!match||request.method!=='GET')return new Response('Invalid room request',{status:400});
      const origin=request.headers.get('Origin');
      if(origin&&origin!==url.origin)return new Response('Forbidden',{status:403});
      return env.LRS_GAME_ROOMS.getByName(match[1]).fetch(request);
    }
    if(pathname.startsWith('/api/lrs/moonwriter/'))return readPublicMoonwriter(request,env);
    if(pathname==='/api/lrs/public-read'){
      const native=request.headers.get('origin')===IOS_ORIGIN;
      if(request.method==='OPTIONS')
        return native?new Response(null,{status:204,headers:cors()}):new Response(null,{status:403});
      const result=await handlePublicRuneRead(request,env);
      if(!native)return result;
      const headers=new Headers(result.headers);
      for(const [key,value] of Object.entries(cors()))headers.set(key,value);
      return new Response(result.body,{status:result.status,headers});
    }
    return env.ASSETS.fetch(request);
  }
};
