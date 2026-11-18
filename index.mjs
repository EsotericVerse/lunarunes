import {handlePublicRuneRead} from './public-rune-read.mjs';

// The packaged iOS app loads art and code locally, but reads only the existing
// anonymous LRS Worker API. Allow precisely its local WKWebView origin, never
// wildcard origins, cookies, database credentials or another project's API.
const IOS_ORIGIN='capacitor://localhost';
const nativeCorsHeaders=origin=>({
  'access-control-allow-origin':origin,
  'access-control-allow-methods':'POST, OPTIONS',
  'access-control-allow-headers':'content-type',
  'access-control-max-age':'600',
  'vary':'Origin'
});

// Asset browsing stays on the existing Git-connected Worker. Only this
// exact API path runs first; all original art, 3D effects and WASM remain
// static and keep their existing MIME/CORS behavior.
export default {
  async fetch(request,env){
    if(new URL(request.url).pathname==='/api/lrs/public-read'){
      const origin=request.headers.get('origin');
      const isNative=origin===IOS_ORIGIN;
      if(request.method==='OPTIONS'){
        // No other site may use CORS preflight to consume the native read API.
        if(!isNative)return new Response(null,{status:403});
        return new Response(null,{status:204,headers:nativeCorsHeaders(origin)});
      }
      const result=await handlePublicRuneRead(request,env);
      if(!isNative)return result;
      const headers=new Headers(result.headers);
      for(const [key,value] of Object.entries(nativeCorsHeaders(origin)))headers.set(key,value);
      return new Response(result.body,{status:result.status,headers});
    }
    return env.ASSETS.fetch(request);
  }
};
