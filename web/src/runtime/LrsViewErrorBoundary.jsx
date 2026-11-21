import {Component} from 'react';

// Keep a failed lazy-rendered feature from unmounting the entire LRS app.
// This is a Web presentation concern, not part of the LRS ESM framework.
export default class LrsViewErrorBoundary extends Component{
  constructor(props){super(props);this.state={error:null};}
  static getDerivedStateFromError(error){return {error};}
  componentDidCatch(error,info){
    console.error('[LRS] feature rendering error',error,info?.componentStack||'');
  }
  render(){
    if(this.state.error)return <main className="loc-next-main" role="alert">
      <div className="loc-view">
        <h1>符文功能暫時無法呈現</h1>
        <p>本頁元件載入失敗，其他功能不受影響。可返回符文入口，或重新載入此頁。</p>
        <p><a className="loc-button" href="/">返回符文功能入口</a></p>
        <button className="loc-button" type="button" onClick={()=>window.location.reload()}>重新載入</button>
      </div>
    </main>;
    return this.props.children;
  }
}
