/**
 * Owns exactly one Effekseer/WebGL stage, not the global (reusable) WASM
 * runtime. A finished single-shot must release GPU resources immediately,
 * even if its React parent remains mounted to display the static result.
 *
 * Safe for a late async initialization: attachments after release are retired
 * instead of silently keeping a second WebGL context alive.
 */
function safely(callback){
  try{callback?.();}catch{/* A lost WebGL context must not block cleanup. */}
}
export function createRuneGpuLifecycle({cancelFrame=()=>{}}={}){
  let retired=false,frame=0,observer=null,context=null,renderer=null;
  const retireContext=value=>{
    safely(()=>value?.stopAll?.());
    safely(()=>value?.release?.());
  };
  const retireRenderer=value=>{
    safely(()=>value?.dispose?.());
    safely(()=>value?.forceContextLoss?.());
  };
  return {
    get retired(){return retired;},
    trackFrame(next){
      if(retired){if(next)cancelFrame(next);return;}
      if(frame&&frame!==next)safely(()=>cancelFrame(frame));
      frame=next||0;
    },
    trackObserver(next){
      if(retired){safely(()=>next?.disconnect?.());return;}
      if(observer&&observer!==next)safely(()=>observer.disconnect?.());
      observer=next;
    },
    trackContext(next){
      if(retired){retireContext(next);return;}
      if(context&&context!==next)retireContext(context);
      context=next;
    },
    trackRenderer(next){
      if(retired){retireRenderer(next);return;}
      if(renderer&&renderer!==next)retireRenderer(renderer);
      renderer=next;
    },
    release(){
      if(retired)return false;
      retired=true;
      if(frame)cancelFrame(frame);
      frame=0;
      safely(()=>observer?.disconnect?.());
      observer=null;
      retireContext(context);
      context=null;
      retireRenderer(renderer);
      renderer=null;
      return true;
    }
  };
}

/** Draw results are static. Licensed mist belongs only to the pending/flighting scene,
 * and MUST unmount before the one-shot Rune reveal starts (one GPU stage at a time).
 */
export function shouldMountRuneMist(mode,phase){
  // Waiting plays a single authored prelude; drawing uses a short mist layer.
  // They never consume multiple background contexts at the same time.
  return mode!=='list'&&phase==='drawing';
}
export function shouldPlayRunePrelude(mode,phase,subject){
  return mode==='duel'&&phase==='waiting'&&Number.isInteger(Number(subject))&&Number(subject)>0;
}

/**
 * 3D Rune draws should never initialize two fog WebGL contexts on compact
 * touch screens. Keep the authored rear mist, lower its DPR, and drop only the
 * decorative foreground canvas. Desktop retains the original dual-layer art.
 */
export function runeMistQualityForDevice(requested='high',{coarsePointer=false,narrowViewport=false}={}){
  return requested==='high'&&(coarsePointer||narrowViewport)?'low':requested;
}
