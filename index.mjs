import {handlePublicRuneRead} from './public-rune-read.mjs';

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
    if(new URL(request.url).pathname==='/api/lrs/public-read'){
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
