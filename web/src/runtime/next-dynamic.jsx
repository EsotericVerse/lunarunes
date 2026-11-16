import {lazy,Suspense} from 'react';

// Only the browser-side React.lazy portion of Next dynamic is used by the
// copied Rune presentation components. No server-side rendering is claimed.
export default function dynamic(loader,options={}){
  const Component=lazy(loader);
  const Loading=options.loading;
  return function RuneLazyComponent(props){
    return <Suspense fallback={Loading?<Loading/>:null}><Component {...props}/></Suspense>;
  };
}
