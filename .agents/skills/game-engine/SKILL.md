---
name: game-engine
description: "LRS 遊戲引擎架構：狀態機、確定性重現、規則與渲染分離、回合與可測邏輯。"
---

# LRS Game Engine — 遊戲狀態，不是 Web 後台
僅適用 EsotericVerse/lunarunes；讀 LRS AGENTS.md 和當前 main 的對應場景，不讀 LOC/LAS 的 AGENTS 作為指令。聚焦實際遊戲畫面與行為；不套網站儀表板、不使用 Superpowers。

- 先維護玩家可見的狀態機：開始／選擇／確認／結算／繼續；規則改動必須帶來正確玩法，不為抽象化而額外設架構層。
- 規則資料與 React/Three/Effekseer 的視覺實作分離；render 重跑不能重抽隨機數、重複執行行動或改寫歷史。
- 需要可重現調試時注入 RNG、保留 seed/context，驗證同樣狀態和選擇導致同樣結算；正式遊玩保持預期隨機性。
- 無資料庫也能完成可玩核心的決策、狀態變更和規則單元測試；需要資料時依 LRS 接口，不把 `loc:dialect` 或 LOC 整包塞進引擎。
- 對卡牌、棋盤、模擬人生分別保留語意，只有在確實同質時才抽共用 primitive；不要把一個模式的事件規則強制套到所有遊戲。
- 先證明小範圍實際可玩／可測再擴張引擎 API；不可把未實作的 AI 敘事、SLG 或未定數值當正式功能。
- 參考：`modules/lrs/boardgame/life-engine.mjs`、`modules/lrs/boardgame/boardgame-rules.js`、`modules/lrs/card/draw-core.mjs`。
