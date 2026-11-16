---
name: game-balance
description: "遊戲平衡與隨機性：抽牌機率、牌陣不變量、有限選擇、事件權重及統計測試。"
---

# Game Balance / RNG — 隨機是玩法核心
僅適用 EsotericVerse/lunarunes；讀 LRS AGENTS.md 和當前 main 的對應場景，不讀 LOC/LAS 的 AGENTS 作為指令。聚焦實際遊戲畫面與行為；不套網站儀表板、不使用 Superpowers。

- 隨機不等於任意：先定義抽牌池、是否放回、方向位規則、連續事件可否重複，維持已核定的玩法與符文語意。
- 抽牌池 1–66，第零符不可抽；模擬人生抽 8 張不重複、只出 5 張，餘 3 張不得消失。依現行程式判斷概率，不從題目猜計算公式。
- 用 seeded runs 及分布檢查來重現錯誤、找極端回合與偏差；**測試用固定 seed 不等於正式抽牌改成固定結果**。
- 玩家應能看清楚風險、有限行動、未選擇代價及回合結果；平衡數據必須有作者規格或明確實測依據，不自行補設為原規則。
- 過度削弱隨機或加保底會改變遊戲意義；變更前列出行為差異，僅在本次授權玩法範圍內執行。
- 參考：`modules/lrs/card/draw-core.mjs`、`modules/lrs/boardgame/life-engine.mjs`、`tests/lrs-life-engine.test.mjs`。
