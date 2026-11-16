---
name: motion-direction
description: "符文遊戲動態導演：分鏡、節拍、翻牌、過場、鏡頭、動作節制與可跳過。"
---

# Motion Direction — 抽牌儀式與遊戲節奏
僅適用 EsotericVerse/lunarunes；讀 LRS AGENTS.md 和當前 main 的對應場景，不讀 LOC/LAS 的 AGENTS 作為指令。聚焦實際遊戲畫面與行為；不套網站儀表板、不使用 Superpowers。

- 設計動作先回答：玩家看見什麼、這個動作告訴他哪個狀態、多久才可再次操作；動畫是語言，不是過場模板。
- 規劃**鏡頭 → 主體 → 反應 → 停格可閱讀**的節奏，保持群組風格與已定原畫。Motion 只編排已有舞台，不重做 Effekseer 粒子。
- 翻牌、選牌、抽中、返回、清場應有不同 easing、速度與反應；避免所有動畫都用同一個 bounce、zoom、模糊光暈。
- 動作期間不要阻塞無關操作，且可依 reduced-motion 改成等價的快速狀態轉換；玩家應能略過不必要的重複儀式。
- 卸載或切換時正確 cancel animation、清理 listener，動畫停止不能改變已確認的邏輯結果。
- 驗收連續抽卡／切 2D-3D／返回／減少動態／低階手機。觀察卡面殘影與資源是否持續上升。
- 參考：`modules/lrs/card/rune-draw-motion.mjs`、`modules/lrs/rune/vfx/rune-glyph-motion.mjs`、`app/lrunes/RuneUnifiedView.jsx`。
