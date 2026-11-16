---
name: game-rules
description: "桌遊與回合玩法：明確規則、玩家選擇、回合狀態、合法移動、事件與可重玩。"
---

# Boardgame Design — 遊戲規則與玩家選擇
僅適用 EsotericVerse/lunarunes；讀 LRS AGENTS.md 和當前 main 的對應場景，不讀 LOC/LAS 的 AGENTS 作為指令。聚焦實際遊戲畫面與行為；不套網站儀表板、不使用 Superpowers。

- 先確立玩家看見的目標、目前可選的行動與結果回饋；規則要能透過 UI 被理解，不只是引擎能執行。
- 現行桌遊的回合流程與階段依 `modules/lrs/boardgame/boardgame-rules.js`、`GameBoard.jsx`；不得讓視覺重新設計破壞手牌、事件或回合先後。
- 對每個動作核對：何時合法、誰能執行、能否撤銷、結束回合後會發生什麼；非法動作要提供短而具體的玩家可理解訊息。
- 遊戲狀態與顯示動畫分離：避免 UI 因重繪變成再次出牌、抽牌、扣資源或跳回合。
- 遊玩中檢查第一次使用者：無須讀完整規則，也能看懂下一步；新手指引不能擋住棋盤主視覺。
- 在同一任務驗收完整最短可玩路徑（setup → 行動 → 回合／事件 → 結束或繼續），別僅測一個函式。
- 參考：`modules/lrs/boardgame/`、`tests/lrs-modules.test.mjs`、`tests/lrs-life-engine.test.mjs`。
