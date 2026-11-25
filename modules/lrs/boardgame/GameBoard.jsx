'use client';

import {useMemo,useState} from 'react';
import {createLunaRunesGame} from './boardgame-rules.js';
import {localTabletopRules} from './game-data.js';
import {runeImage} from '../rune/rune-directory.mjs';
import {useOnlineGame} from './use-online-game.jsx';
import './game-board.css';

const LETTERS=['A','B','C','D'];
const PHASES={opening:'起手準備',event:'事件回應',resonance:'共振行動',duel:'決勝回合',finished:'牌局結束'};
export default function GameBoard({online=false}){
  const rules=useMemo(()=>localTabletopRules(),[]);
  const [count,setCount]=useState(2);
  const [localGame,setGame]=useState(null);
  const [localViewer,setViewer]=useState(0);
  const [localNotice,setNotice]=useState('');
  const [roomInput,setRoomInput]=useState('');
  const network=useOnlineGame(online);
  const game=online?network.room?.game:localGame;
  const viewer=online?(network.room?.seat??0):localViewer;
  const notice=online?network.notice:localNotice;
  const ready=!online||network.status==='connected';
  const engine=useMemo(()=>createLunaRunesGame(rules,count),[rules,count]);

  function startGame(){
    if(online){network.action('start');return;}
    setGame(engine.setup());setViewer(0);setNotice('');
  }
  function action(name,...args){
    if(!game||!ready)return;
    if(online){network.action(name,...args);return;}
    try{
      const next=structuredClone(game);
      engine.moves[name]({G:next},...args);
      setGame(next);setNotice('');
      if(name==='confirmOpening')setViewer(next.active);
      if(name==='resolveEvent')setViewer(0);
    }catch(error){setNotice(String(error?.message||error));}
  }

  const stage=game?.stage||'idle';
  const active=online?viewer:stage==='opening'||stage==='resonance'||stage==='duel'?game.active:viewer;
  const myTurn=!online||game?.active===viewer;
  const player=game?.players?.[active]||null;
  const choosing=(stage==='opening'&&myTurn)||stage==='event';
  const selected=player?.selected||[];
  const limit=stage==='opening'?rules.config.openingDiscard:rules.config.eventResponseCards;
  const complete=game?.players?.every(p=>(p.selectedCount??p.selected.length)===rules.config.eventResponseCards);
  const event=stage==='event'?(online?game.currentEvent:game.eventDeck[game.eventIndex%game.eventDeck.length]):null;
  const targets=stage==='duel'?game.duelists:game?.players.map((_,i)=>i)||[];
  return <main className="loc-next-main" data-lrunes-tabletop={online?"online":"local"}>
    <div className="lrg">
      <header className="lrg-head">
        <div><p className="loc-eyebrow">LUNARUNES · {online?'ONLINE TRIAL':'LOCAL TABLETOP'}</p>
          <h1>月之符文 · 桌遊</h1>
          <p>{online?'線上房間試驗':'本機輪流操作'} · 二至四名玩家 · 八回合事件與共振</p>
        </div>
        <a className="loc-button" href={online?'/game/':'/card/'}>{online?'返回本機桌遊':'返回月之符文'}</a>
      </header>
      {online?<section className="lrg-panel" aria-live="polite">
        <h2>線上試驗房間</h2>
        {network.code?<><p>房間代碼：<strong style={{overflowWrap:'anywhere'}}>{network.code}</strong></p><p>{network.status==='connected'?'已連線':network.status==='connecting'?'連線中':'已斷線'}{network.room?' · 已加入 '+network.room.joined+'/'+network.room.count+' 人 · 你是玩家 '+LETTERS[viewer]:''}</p>
          {network.status==='disconnected'?<button className="loc-button" onClick={network.reconnect}>重新連線</button>:null}
          <button className="loc-button" onClick={network.leave}>離開房間</button></>:null}
        {notice?<p role="status">{notice}</p>:null}
      </section>:null}
      {!game?<section className="lrg-panel lrg-launch">
        <h2>建立牌局</h2>
        <p>{online?'分享房間代碼邀請其他玩家；房間保存 24 小時，不寫入 Neon 戰績。':'以歷史 32 個事件與 66 枚符文進行本機對局；不連線、不建立房間、不寫入資料庫。'}</p>
        {(!online||!network.code)?<><label>玩家人數
          <select className="scope-select" value={count} onChange={e=>setCount(Number(e.target.value))}>
            {[2,3,4].map(n=><option value={n} key={n}>{n} 人</option>)}
          </select>
        </label>
        <button type="button" className="loc-button primary" onClick={()=>online?network.create(count):startGame()}>{online?'建立線上房間':'開始遊戲'}</button>
        {online?<><label>房間代碼 <input className="scope-select" value={roomInput} onChange={e=>setRoomInput(e.target.value)} maxLength={64}/></label><button className="loc-button" onClick={()=>network.join(roomInput)}>加入房間</button></>:typeof location!=='undefined'&&/^https?:$/.test(location.protocol)?<a className="loc-button" href="/game/room/">試玩線上房間</a>:null}</>:online&&network.room?.seat===0?<button className="loc-button primary" disabled={!ready||network.room.joined!==network.room.count} onClick={startGame}>玩家到齊 · 開始遊戲</button>:null}
      </section>:<>
        <div className="lrg-topline">
          <span>{stage==='duel'?'第 9 回合 · 延長決勝':`第 ${game.round} 回合／${rules.rounds.length}`}</span>
          <strong>{PHASES[stage]||stage}</strong>
          {!online?<button type="button" className="loc-button" onClick={startGame}>重新開局</button>:null}
        </div>
        <div className="lrg-players" role="list" aria-label="玩家德值">
          {game.players.map((p,i)=><div key={i} className={'lrg-player'+(active===i?' lrg-player--active':'')} role="listitem">
            <strong>玩家 {LETTERS[i]}</strong><span>德 <b>{p.de}</b></span>
            <small>手牌 {p.handCount??p.hand.length} · 牌庫 {p.deckCount??p.deck.length}</small>
          </div>)}
        </div>
        {event?<section className="lrg-panel lrg-event" aria-live="polite">
          <p className="loc-eyebrow">{event.id} · 當前事件</p>
          <h2>{event.name}</h2><p>{event.description}</p>
          <small>需回應：{event.req.join(' ＋ ')}</small>
        </section>:null}
        {stage==='finished'?<section className="lrg-panel lrg-result" role="status">
          <h2>{game.draw?'平局':game.winner===null?'結算完成':'玩家 '+LETTERS[game.winner]+' 獲勝'}</h2>
          <p>{game.players.map((p,i)=>LETTERS[i]+'：德 '+p.de).join(' ／ ')}</p>
          <button type="button" className="loc-button primary" onClick={online?network.leave:startGame}>{online?'離開房間':'再玩一局'}</button>
        </section>:null}
        {stage==='opening'?<section className="lrg-panel">
          <h2>玩家 {LETTERS[game.active]} · 起手棄牌</h2>
          <p>選擇 {rules.config.openingDiscard} 張起手牌棄置，保留其他手牌。</p>
        </section>:null}
        {stage==='event'?<nav className="lrg-player-tabs" aria-label="輪流選擇事件回應牌">
          {game.players.map((p,i)=><button type="button" key={i} className={'loc-button'+(viewer===i?' primary':'')}
            aria-pressed={viewer===i} disabled={online} onClick={()=>setViewer(i)}>
            玩家 {LETTERS[i]} · {p.selectedCount??p.selected.length}/{rules.config.eventResponseCards}
          </button>)}
        </nav>:null}
        {choosing&&player?<section className="lrg-panel" aria-label={'玩家 '+LETTERS[active]+' 手牌'}>
          <h2>玩家 {LETTERS[active]} 的手牌</h2>
          <p>已選 {selected.length}/{limit} 張。{stage==='event'?'每位玩家選完三張後統一判定。':''}</p>
          <div className="lrg-hand">
            {player.hand.map(card=><button key={card.id} type="button"
              className={'lrg-card'+(selected.includes(card.id)?' lrg-card--chosen':'')}
              aria-pressed={selected.includes(card.id)} disabled={!ready}
              onClick={()=>action('toggleCard',active,card.id)}>
              <img src={runeImage({rune_id:card.id})} alt="" loading="lazy"/>
              <strong>{card.name}</strong><small>{card.group} · {card.alphaCompatMacro||'特殊'}</small>
            </button>)}
          </div>
          {stage==='opening'?<button type="button" className="loc-button primary"
            disabled={!ready||selected.length!==limit}
            onClick={()=>action('confirmOpening',game.active)}>確認棄牌，交給下一位</button>:null}
          {stage==='event'&&complete?<button type="button" className="loc-button primary"
            disabled={!ready} onClick={()=>action('resolveEvent')}>全部確認 · 判定事件</button>:null}
        </section>:null}
        {(stage==='resonance'||stage==='duel')&&player&&myTurn?<section className="lrg-panel">
          <h2>玩家 {LETTERS[game.active]} · {stage==='duel'?'延長決勝':'共振'}行動</h2>
          <p>選擇回復自己或干預其他玩家。每名參與者依序執行一次。</p>
          <div className="lrg-actions">
            <button type="button" className="loc-button primary"
              disabled={!ready} onClick={()=>action('resonance','self',game.active)}>回復自身 · 德 +2</button>
            {targets.filter(i=>i!==game.active).map(i=><button type="button" className="loc-button"
              key={i} disabled={!ready} onClick={()=>action('resonance','attack',i)}>
              干預玩家 {LETTERS[i]} · 德 −2
            </button>)}
          </div>
        </section>:null}
        <section className="lrg-panel lrg-history" aria-label="牌局紀錄">
          <h2>狀態與操作紀錄</h2>
          <p role="status">{notice||game.result}</p>
          <ol>{game.logs.slice(0,12).map((line,i)=><li key={i}>{line}</li>)}</ol>
        </section>
      </>}
    </div>
  </main>;
}
