---
name: playtesting
description: "遊戲 QA 與實機測試：真的看畫面、真的玩完整回合、跨尺寸、記錄視覺與效能故障。"
---

# Playtesting — 真實遊戲驗收，不是 CI 勾勾
僅適用 EsotericVerse/lunarunes；讀 LRS AGENTS.md 和當前 main 的對應場景，不讀 LOC/LAS 的 AGENTS 作為指令。聚焦實際遊戲畫面與行為；不套網站儀表板、不使用 Superpowers。

- 測試先拿**可重現玩法**而非 API 清單：開始抽牌 → 選擇 → 翻牌 → 解讀 → 下一次；桌遊 setup → 出牌 → 事件 → 結束；Rune Life 月回合 → 八抽五出 → 下一月。
- 視覺檢查需實際畫面：符文是否清晰、景深有無吃字、鏡頭是否遮擋、動畫是否發生、觸控區是否太小、字是否被裁切。
- 遊戲狀態檢查：抽樣機率、重複出牌、錯誤方向位、重複事件、返回後狀態、WebGL 遺留資源；測性能要連續玩而不是只打開一次。
- 對照至少桌面與手機視窗；真實裝置不可取得時只報模擬測試，不得宣稱實機通過。
- 記錄第一個異常的畫面／輸入／網路／Console／記憶體與 Commit；測試失敗就定點修，不把同樣問題送回使用者無限重測。
- 自動化依範圍選 `tests/lrs-life-engine.test.mjs`、`tests/lrs-modules.test.mjs`、`tests/lrs-web-routes.test.mjs` 等；**單元綠燈不等於可玩與好看。**
