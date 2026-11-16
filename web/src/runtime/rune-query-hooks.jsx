import {useEffect,useState} from 'react';

export function useAsyncResource(key,load,{enabled=true}={}){
  const identity=JSON.stringify(key);
  const [state,setState]=useState({data:null,isPending:Boolean(enabled),error:null});
  useEffect(()=>{
    if(!enabled){setState({data:null,isPending:false,error:null});return;}
    let active=true;
    setState({data:null,isPending:true,error:null});
    Promise.resolve().then(load).then(data=>{
      if(active)setState({data,isPending:false,error:null});
    },error=>{
      if(active)setState({data:null,isPending:false,error});
    });
    return()=>{active=false;};
    // The published read identity controls lifecycle; the load closure is
    // intentionally not a changing dependency for the original Rune caller.
  },[identity,enabled]);
  return state;
}
export function prepareTransientResourceAction(){
  // React's keyed unmount remains the canonical presentation resource
  // boundary; no LOC query-client ownership is available to reset here.
}
