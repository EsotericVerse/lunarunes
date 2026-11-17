import {handlePublicRuneRead} from './public-rune-read.mjs';

// Asset browsing stays on the existing Git-connected Worker. Only this
// exact API path runs first; all original art, 3D effects and WASM remain
// static and keep their existing MIME/CORS behavior.
export default {
  async fetch(request,env){
    if(new URL(request.url).pathname==='/api/lrs/public-read')
      return handlePublicRuneRead(request,env);
    return env.ASSETS.fetch(request);
  }
};
