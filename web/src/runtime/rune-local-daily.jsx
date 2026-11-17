import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import DailyRuneCalendar from '../../../app/lrunes/DailyRuneCalendar.jsx';
import {ScopeLink} from './rune-navigation.jsx';
import {runeImage} from '../../../modules/lrs/rune/rune-directory.mjs';
import {
  listLocalDailyRunes,importLocalDailyTransfer,updateLocalDailyRune,deleteLocalDailyRune
} from '../../../modules/lrs/daily/local-records.mjs';
import {dailyRecordSlots,availableDailyRuneKind} from '../../../modules/lrs/daily/record-slots.mjs';
import {normalizeDailyDraws,summarizeDailyDraws,rankDailyDraws,
  pageDailyRanking,dailyTrend,DAILY_DIRECTIONS} from '../../../modules/lrs/daily/analytics.mjs';
import {realMoonPhase} from '../../../modules/lrs/daily/real-moon-phase.mjs';
import {DAILY_TRANSFER_MAX_BYTES,DAILY_CSV_COLUMNS,makeDailyCsv,parseDailyCsv,
  analyzeDailyImport,planDailyTransfer} from '../../../modules/lrs/daily/transfer-contract.mjs';

// Standalone LRS Web: local device records only. No LOC session, private table,
// shared database URL or pretend account is available in this runtime.
const MIN_MONTH=2026*12+7;
const DRAW_KINDS=Object.freeze([['main','主抽'],['supplement','補抽']]);
const ROTATION=Object.freeze({'正位':'rune-rotate-0','半正位':'rune-rotate-90',
  '半逆位':'rune-rotate-n90','逆位':'rune-rotate-180'});
const todayInTaipei=()=>new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Taipei'});
const monthOf=date=>{
  const [year,month]=String(date).slice(0,7).split('-').map(Number);
  return year*12+month-1;
};
const monthParts=value=>({year:Math.floor(value/12),month:value%12+1});
const entryKey=row=>String(row.record_date).slice(0,10)+'|'+String(row.draw_kind);
const localLabel=row=>'第 '+Number(row.rune_number)+' 符';
const phaseOn=date=>realMoonPhase(new Date(date+'T12:00:00+08:00'));
const newForm=()=>({record_date:todayInTaipei(),draw_kind:'main',
  rune_number:'1',direction:'正位'});

function useDeviceDaily(){
  const [rows,setRows]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const request=useRef(0);
  const hasLoaded=useRef(false);
  const reload=useCallback(async()=>{
    const generation=++request.current;
    if(!hasLoaded.current)setLoading(true);
    setError('');
    try{
      const records=await listLocalDailyRunes();
      if(request.current===generation)setRows(records);
    }catch(reason){
      if(request.current===generation){
        setRows([]);
        setError(String(reason?.message||reason||'本機紀錄無法讀取。'));
      }
    }finally{if(request.current===generation){hasLoaded.current=true;setLoading(false);}}
  },[]);
  useEffect(()=>{
    void reload();
    const onChanged=()=>void reload();
    const onVisible=()=>{if(document.visibilityState==='visible')void reload();};
    window.addEventListener('loc-rune-local-changed',onChanged);
    document.addEventListener('visibilitychange',onVisible);
    return()=>{
      request.current++;
      window.removeEventListener('loc-rune-local-changed',onChanged);
      document.removeEventListener('visibilitychange',onVisible);
    };
  },[reload]);
  return {rows,loading,error,reload};
}

function DailyLinks(){
  return <nav className="runes-home-nav lrs-daily-links" aria-label="每日符文頁面">
    <ScopeLink className="loc-button" href="/">回符文首頁</ScopeLink>
    <ScopeLink className="loc-button" href="/daily/log/">本機每日紀錄</ScopeLink>
    <ScopeLink className="loc-button" href="/daily/trend/">本機紀錄趨勢</ScopeLink>
  </nav>;
}

function LocalDailyLog({rows}){
  const [monthValue,setMonthValue]=useState(()=>Math.max(MIN_MONTH,monthOf(todayInTaipei())));
  const [selectedDate,setSelectedDate]=useState(todayInTaipei);
  const [form,setForm]=useState(newForm);
  const [editing,setEditing]=useState(null);
  const [editForm,setEditForm]=useState(null);
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState('');
  const csvInput=useRef(null);
  const {year,month}=monthParts(monthValue);
  const currentMonth=String(year)+'-'+String(month).padStart(2,'0');
  const visible=useMemo(()=>rows.filter(row=>String(row.record_date).slice(0,7)===currentMonth),[rows,currentMonth]);
  const selectedRows=useMemo(()=>visible.filter(row=>String(row.record_date).slice(0,10)===selectedDate),[visible,selectedDate]);
  const slots=dailyRecordSlots(rows,form.record_date);
  const occupied=slots[form.draw_kind];
  const moveMonth=offset=>{
    const next=Math.max(MIN_MONTH,monthValue+offset);
    const {year:nextYear,month:nextMonth}=monthParts(next);
    setMonthValue(next);
    setSelectedDate(String(nextYear)+'-'+String(nextMonth).padStart(2,'0')+'-01');
    setEditing(null);
  };
  async function mutate(action,message){
    setBusy(true);setNotice('');
    try{
      await action();
      window.dispatchEvent(new CustomEvent('loc-rune-local-changed'));
      setNotice(message);
      setEditing(null);setEditForm(null);
      return true;
    }catch(reason){setNotice('操作失敗：'+String(reason?.message||reason));return false;}
    finally{setBusy(false);}
  }
  async function add(event){
    event.preventDefault();
    if(occupied){setNotice('該日期與類別已有紀錄，不會覆寫。');return;}
    const added=await mutate(()=>importLocalDailyTransfer([{
      record_date:form.record_date,draw_kind:form.draw_kind,
      rune_number:Number(form.rune_number),direction:form.direction,recorded_phase:''
    }]),'本機紀錄已新增，並未同步到 LOC 雲端。');
    if(!added)return;
    const date=form.record_date;
    if(/^\d{4}-\d{2}-\d{2}$/.test(date)){
      setSelectedDate(date);
      setMonthValue(Math.max(MIN_MONTH,monthOf(date)));
      setForm(current=>({...current,
        draw_kind:availableDailyRuneKind([...rows,{record_date:date,draw_kind:current.draw_kind}],date,'main')
      }));
    }
  }
  async function saveEdit(event){
    event.preventDefault();
    if(!editForm)return;
    await mutate(()=>updateLocalDailyRune(editForm),'本機紀錄已更新。');
  }
  async function remove(row){
    if(!window.confirm('確定刪除此裝置的 '+row.record_date+' '+row.draw_kind+' 紀錄？'))return;
    await mutate(()=>deleteLocalDailyRune({
      recordDate:row.record_date,drawKind:row.draw_kind
    }),'本機紀錄已刪除。');
  }
  async function exportCsv(){
    if(busy)return;
    setBusy(true);setNotice('');
    try{
      const csv=makeDailyCsv(rows);
      const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));
      const link=document.createElement('a');
      link.href=url;
      link.download='LunaRunes-Daily-'+todayInTaipei()+'.csv';
      document.body.appendChild(link);
      try{link.click();}finally{link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);}
      setNotice('已交由瀏覽器下載 '+rows.length+' 筆本機紀錄。');
    }catch(reason){setNotice('匯出失敗：'+String(reason?.message||reason));}
    finally{setBusy(false);}
  }
  async function importCsv(event){
    const file=event.target.files?.[0];
    event.target.value='';
    if(!file||busy)return;
    setBusy(true);setNotice('');
    try{
      if(!/\.csv$/i.test(file.name))throw new Error('只接受每日符文 CSV 格式。');
      if(file.size>DAILY_TRANSFER_MAX_BYTES)throw new Error('CSV 檔案超過 24 MB。');
      const source=new TextDecoder('utf-8',{fatal:true}).decode(await file.arrayBuffer());
      const {header,records}=parseDailyCsv(source);
      if(header.length!==DAILY_CSV_COLUMNS.length||
         DAILY_CSV_COLUMNS.some((column,index)=>header[index]!==column))
        throw new Error('CSV 欄位與原始每日符文備份格式不符。');
      const {valid,invalid}=analyzeDailyImport(records);
      if(invalid.length)throw new Error('有 '+invalid.length+' 列不合法，整份取消匯入：'+invalid[0].error);
      const plan=planDailyTransfer(valid,rows);
      const result=await importLocalDailyTransfer(plan.fresh);
      window.dispatchEvent(new CustomEvent('loc-rune-local-changed'));
      setNotice('本機匯入完成：新增 '+result.newCount+' 筆，原有 '+plan.duplicateCount+
        ' 筆，衝突 '+plan.conflictCount+' 筆維持原值。');
    }catch(reason){setNotice('匯入失敗：'+String(reason?.message||reason));}
    finally{setBusy(false);}
  }
  const chooseForm=setter=>event=>setter(current=>({...current,[event.target.name]:event.target.value}));
  return <>
    <DailyRuneCalendar year={year} month={month} rows={visible}
      selectedDate={selectedDate} canPrevious={monthValue>MIN_MONTH}
      onPrevious={()=>moveMonth(-1)} onNext={()=>moveMonth(1)}
      onSelectDate={date=>{setSelectedDate(date);setEditing(null);}}/>
    <section className="loc-card" aria-live="polite">
      <h2>{selectedDate.replaceAll('-','/')} 的本機紀錄</h2>
      {!selectedRows.length?<p className="scope-status">此日期在本裝置尚無紀錄。</p>:null}
      <div className="lrs-local-daily-records">
        {selectedRows.map(row=>{
          const normalized=normalizeDailyDraws([row],phaseOn)[0];
          const isEditing=editing===entryKey(row);
          return <article className="lrs-local-daily-record" key={entryKey(row)}>
            <img className={'loc-rune-card-image '+(ROTATION[row.direction]||'rune-rotate-0')}
              src={runeImage(row)} alt={'第 '+row.rune_number+' 符卡面'} loading="lazy" decoding="async"/>
            <div className="lrs-local-daily-record-copy">
              <p className="loc-eyebrow">{row.draw_kind==='main'?'主抽':row.draw_kind==='supplement'?'補抽':'歷史紀錄'}</p>
              <h3>{localLabel(row)} · {row.direction}</h3>
              <p>月相：{normalized?.phase||'未知'}{normalized?.phase_inferred?'（依日期計算）':''}</p>
              {!isEditing?<div className="lrs-local-daily-actions">
                <button className="loc-button" type="button" disabled={busy}
                  onClick={()=>{setEditing(entryKey(row));setEditForm({
                    recordDate:row.record_date,drawKind:row.draw_kind,
                    runeNumber:String(row.rune_number),direction:row.direction
                  });}}>編輯</button>
                <button className="loc-button scope-danger-button" type="button"
                  disabled={busy} onClick={()=>void remove(row)}>刪除</button>
              </div>:<form className="scope-stat-controls" onSubmit={saveEdit}>
                <label><span>符文編號</span><input className="scope-input" type="number"
                  min="1" max="66" required value={editForm?.runeNumber||''}
                  onChange={event=>setEditForm(value=>({...value,runeNumber:event.target.value}))}/></label>
                <label><span>方向位</span><select className="scope-select" value={editForm?.direction||'正位'}
                  onChange={event=>setEditForm(value=>({...value,direction:event.target.value}))}>
                  {DAILY_DIRECTIONS.map(value=><option key={value} value={value}>{value}</option>)}
                </select></label>
                <button className="loc-button" type="submit" disabled={busy}>儲存</button>
                <button className="loc-button" type="button" disabled={busy}
                  onClick={()=>{setEditing(null);setEditForm(null);}}>取消</button>
              </form>}
            </div>
          </article>;
        })}
      </div>
    </section>
    <section className="loc-card">
      <h2>手動新增本機紀錄</h2>
      <p className="scope-status">一日最多一筆主抽、一筆補抽；相同日期與類別不覆寫。</p>
      <form className="scope-stat-controls" onSubmit={add}>
        <label><span>日期</span><input className="scope-input" type="date" name="record_date"
          min="2026-08-01" required value={form.record_date} onChange={chooseForm(setForm)}/></label>
        <label><span>類別</span><select className="scope-select" name="draw_kind"
          value={form.draw_kind} onChange={chooseForm(setForm)}>
          {DRAW_KINDS.map(([value,label])=><option key={value} value={value}>{label}</option>)}
        </select></label>
        <label><span>符文編號</span><input className="scope-input" type="number"
          name="rune_number" value={form.rune_number} onChange={chooseForm(setForm)}
          min="1" max="66" required/></label>
        <label><span>方向位</span><select className="scope-select" name="direction"
          value={form.direction} onChange={chooseForm(setForm)}>
          {DAILY_DIRECTIONS.map(direction=><option key={direction} value={direction}>{direction}</option>)}
        </select></label>
        <button className="loc-button" type="submit" disabled={busy||occupied}>
          {occupied?'該類別已有紀錄':'新增本機紀錄'}</button>
      </form>
    </section>
    <section className="loc-card" aria-label="每日符文本機匯入與匯出">
      <h2>每日紀錄 · CSV 搬移</h2>
      <p className="scope-status">可以從原網站匯出 CSV，再在 LRS 網站手動匯入。沿用相同五欄格式；錯誤資料整份拒絕，相同日期／類別的既有紀錄絕不覆寫。</p>
      <div className="lrs-local-daily-actions">
        <button className="loc-button" type="button" disabled={busy} onClick={()=>void exportCsv()}>匯出本機 CSV</button>
        <button className="loc-button" type="button" disabled={busy} onClick={()=>csvInput.current?.click()}>匯入本機 CSV</button>
        <input ref={csvInput} type="file" accept=".csv,text/csv" hidden
          onChange={event=>void importCsv(event)} aria-label="選擇每日符文 CSV"/>
      </div>
      {notice?<p role="status" className="scope-status">{notice}</p>:null}
    </section>
  </>;
}

function LocalDailyTrend({rows}){
  const [range,setRange]=useState('year');
  const [bucket,setBucket]=useState('month');
  const [mode,setMode]=useState('rune');
  const [page,setPage]=useState(1);
  const normalized=useMemo(()=>normalizeDailyDraws(rows,phaseOn),[rows]);
  const periodRows=useMemo(()=>{
    if(range==='all')return normalized;
    const cutoff=new Date(todayInTaipei()+'T00:00:00Z');
    cutoff.setUTCFullYear(cutoff.getUTCFullYear()-1);
    const start=cutoff.toISOString().slice(0,10);
    return normalized.filter(row=>row.record_date>=start);
  },[normalized,range]);
  const summary=useMemo(()=>summarizeDailyDraws(periodRows),[periodRows]);
  const trend=useMemo(()=>dailyTrend(periodRows,bucket),[periodRows,bucket]);
  const ranked=useMemo(()=>rankDailyDraws(periodRows,mode),[periodRows,mode]);
  const paginated=pageDailyRanking(ranked,page);
  const max=Math.max(1,...trend.map(point=>point.total));
  return <section className="loc-card">
    <h2>本機每日符文統計</h2>
    <div className="scope-stat-controls">
      <label><span>統計範圍</span><select className="scope-select" value={range}
        onChange={event=>{setRange(event.target.value);setPage(1);}}>
        <option value="year">最近一年</option><option value="all">本裝置全部紀錄</option>
      </select></label>
      <label><span>趨勢週期</span><select className="scope-select" value={bucket}
        onChange={event=>setBucket(event.target.value)}>
        <option value="week">每週</option><option value="month">每月</option>
      </select></label>
      <label><span>排名方式</span><select className="scope-select" value={mode}
        onChange={event=>{setMode(event.target.value);setPage(1);}}>
        <option value="rune">符文出現次數</option><option value="direction">方向位</option>
      </select></label>
    </div>
    <p className="scope-status">{summary.dayCount} 日 · {summary.recordCount} 筆實際本機紀錄</p>
    {!summary.recordCount?<p className="scope-status">目前沒有可統計的本機資料。</p>:<>
      <div className="lrs-local-trend" role="img" aria-label="每週或每月實際抽牌紀錄次數">
        {trend.map(point=><div className="lrs-local-trend-row" key={point.period}>
          <span>{point.period}</span>
          <span className="lrs-local-trend-track">
            <span className="lrs-local-trend-fill"
              style={{width:(point.total/max*100).toFixed(2)+'%'}}/>
          </span>
          <strong>{point.total}</strong>
        </div>)}
      </div>
      <h3>{mode==='direction'?'方向位':'符文'}排名</h3>
      <div className="scope-ranking">
        {paginated.rows.map((item,index)=><div key={item.key}>
          <strong>{(paginated.currentPage-1)*paginated.pageSize+index+1}. {mode==='rune'?'第 '+item.rune_number+' 符':item.label}</strong>
          <span>{item.count} 次 · {item.ratio.toFixed(1)}%</span>
        </div>)}
      </div>
      {paginated.totalPages>1?<nav className="lrs-local-daily-actions" aria-label="本機紀錄排名分頁">
        <button type="button" className="loc-button" disabled={paginated.currentPage===1}
          onClick={()=>setPage(value=>Math.max(1,value-1))}>上一頁</button>
        <span>第 {paginated.currentPage}／{paginated.totalPages} 頁</span>
        <button type="button" className="loc-button" disabled={paginated.currentPage===paginated.totalPages}
          onClick={()=>setPage(value=>Math.min(paginated.totalPages,value+1))}>下一頁</button>
      </nav>:null}
    </>}
  </section>;
}

export default function RuneLocalDailyPage({view='log'}){
  const {rows,loading,error}=useDeviceDaily();
  const isTrend=view==='trend';
  return <main className="loc-next-main">
    <div className="loc-view lrs-local-daily-page">
      <DailyLinks/>
      <header className="loc-hero loc-hero-feature">
        <p className="loc-eyebrow">LunaRunes · Device Records</p>
        <h1>{isTrend?'每日符文 · 本機趨勢':'每日符文 · 本機紀錄'}</h1>
        <p>這裡只使用本裝置 IndexedDB 中真正儲存的紀錄；不連接 LOC 私有資料庫、不代替帳號登入，也不會自動同步雲端。</p>
      </header>
      {loading?<p className="scope-status" role="status">讀取本機每日符文紀錄…</p>:null}
      {error?<p className="scope-status scope-error" role="alert">{error}</p>:null}
      {!loading&&!error?(isTrend?<LocalDailyTrend rows={rows}/>:<LocalDailyLog rows={rows}/>):null}
    </div>
  </main>;
}
