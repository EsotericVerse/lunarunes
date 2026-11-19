import {useEffect,useState} from 'react';
import {ScopeLink} from '../runtime/rune-navigation.jsx';
import {MOONWRITER_VOLUMES,MOONWRITER_CHAPTERS,moonwriterChapter,moonwriterNeighbors} from '../../../modules/lrs/reading/moonwriter-catalog.mjs';
import './moonwriter.css';

const chapterHref=chapter=>'/novel/moonwriter/'+chapter.uid+'/';

export default function MoonwriterPage({uid=''}){
  const chapter=uid?moonwriterChapter(uid):null;
  const [article,setArticle]=useState(null);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(Boolean(uid));
  useEffect(()=>{
    const title=chapter?chapter.heading+'｜月語者':'月語者｜小說章目';
    const oldTitle=document.title;
    document.title=title+'｜LunaRunes';
    return()=>{document.title=oldTitle;};
  },[chapter?.uid]);
  useEffect(()=>{
    if(!chapter){setArticle(null);setLoading(false);return;}
    const abort=new AbortController();
    setLoading(true);setError('');setArticle(null);
    fetch('/api/lrs/moonwriter/'+encodeURIComponent(chapter.uid),{signal:abort.signal,headers:{accept:'application/json'}})
      .then(async response=>{
        if(!response.ok)throw new Error(response.status===404?'此章目前無法讀取。':'章節讀取暫時失敗。');
        const json=await response.json();
        if(json.uid!==chapter.uid||json.title!==chapter.title||typeof json.content!=='string')
          throw new Error('章節資料與目錄不一致。');
        return json;
      })
      .then(json=>{if(!abort.signal.aborted)setArticle(json);})
      .catch(err=>{if(!abort.signal.aborted)setError(err.message||'章節讀取失敗。');})
      .finally(()=>{if(!abort.signal.aborted)setLoading(false);});
    return()=>abort.abort();
  },[chapter?.uid]);
  const links=<nav className="lrs-novel-breadcrumb" aria-label="小說導覽">
    <ScopeLink href="/">符文首頁</ScopeLink><span aria-hidden="true">／</span>
    <ScopeLink href="/novel/moonwriter/">《月語者》章目</ScopeLink>
    {chapter?<><span aria-hidden="true">／</span><span>{chapter.volumeName}</span></>:null}
  </nav>;
  if(uid&&!chapter)return <main className="loc-next-main"><div className="loc-view lrs-novel">{links}
    <p className="scope-status" role="alert">找不到此章節。請由小說目錄選擇篇章。</p>
  </div></main>;
  const neighbors=chapter?moonwriterNeighbors(chapter.uid):null;
  const paragraphs=article?.content?.replace(/\r\n?/g,'\n').split(/\n\s*\n/g).map(s=>s.trim()).filter(Boolean)||[];
  return <main className="loc-next-main" data-lrs-novel="moonwriter">
    <div className="loc-view lrs-novel">
      {links}
      {!chapter?<>
        <header className="loc-hero loc-hero-feature lrs-novel-hero">
          <p className="loc-eyebrow">LUNARUNES · FICTION ARCHIVE</p>
          <h1>《月語者》小說章目</h1>
          <p>七篇故事，依篇、序章、第一至第二十四章、終章排列。選擇篇章後，逐章閱讀 Galaxy 收錄的原始小說。</p>
          <p className="lrs-novel-hero-meta">全書 {MOONWRITER_CHAPTERS.length} 章節單位 · 七篇完整章目</p>
        </header>
        <div className="lrs-novel-volumes">
          {MOONWRITER_VOLUMES.map((volume,index)=><details className="lrs-novel-volume" key={volume.id} open={index===0}>
            <summary className="lrs-novel-volume-summary">
              <span className="lrs-novel-volume-number">{String(volume.id).padStart(2,'0')}</span>
              <span className="lrs-novel-volume-heading"><strong>{volume.name} · {volume.subtitle}</strong>
                <small>序章 · 24 章 · 終章</small></span>
            </summary>
            <ol className="lrs-novel-chapter-list">
              {volume.chapters.map(entry=><li key={entry.uid}>
                <ScopeLink href={chapterHref(entry)}>
                  <span className="lrs-novel-chapter-index">{entry.order===0?'序':entry.order===25?'終':String(entry.order).padStart(2,'0')}</span>
                  <span>{entry.heading}</span>
                </ScopeLink>
                {entry.vocus?<a className="lrs-novel-original-link" href={entry.vocus} target="_blank" rel="noopener noreferrer" aria-label={'在 vocus 閱讀 '+entry.heading}>原刊</a>:null}
              </li>)}
            </ol>
          </details>)}
        </div>
        <p className="lrs-novel-footnote">本目錄依 LRS Galaxy 原始章名編排；章節正文在開啟時才載入。標示「原刊」者另提供原始外部發表連結。</p>
      </>:<>
        <header className="lrs-novel-chapter-header">
          <p className="loc-eyebrow">{chapter.volumeName} · {chapter.volumeSubtitle}</p>
          <h1>{chapter.heading}</h1>
          <p>《月語者》 · {String(chapter.order).padStart(2,'0')}／25</p>
        </header>
        {loading?<p className="scope-status" role="status">正在讀取這一章…</p>:null}
        {error?<p className="scope-status scope-error" role="alert">{error}</p>:null}
        {article?<article className="lrs-novel-prose" aria-label={article.title}>
          {paragraphs.map((text,index)=><p key={index}>{text}</p>)}
        </article>:null}
        <nav className="lrs-novel-next" aria-label="上一篇與下一篇">
          {neighbors.previous?<ScopeLink href={chapterHref(neighbors.previous)}>← 上一章：{neighbors.previous.heading}</ScopeLink>:<span>全書起點</span>}
          {neighbors.next?<ScopeLink href={chapterHref(neighbors.next)}>下一章：{neighbors.next.heading} →</ScopeLink>:<span>全書終章</span>}
        </nav>
        {chapter.vocus?<p className="lrs-novel-external"><a href={chapter.vocus} target="_blank" rel="noopener noreferrer">前往 vocus 原刊閱讀</a></p>:null}
      </>}
    </div>
  </main>;
}
