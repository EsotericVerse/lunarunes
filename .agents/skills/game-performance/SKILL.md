---
name: game-performance
description: "遊戲效能與流暢度：畫面幀率、輸入延遲、GPU/CPU/記憶體、場景與素材載入、行動裝置。"
---

# Game Performance — 看遊戲是否跑得動
僅適用 EsotericVerse/lunarunes；讀 LRS AGENTS.md 和當前 main 的對應場景，不讀 LOC/LAS 的 AGENTS 作為指令。聚焦實際遊戲畫面與行為；不套網站儀表板、不使用 Superpowers。

- **不是 Next.js bundle scoring。** 目標是玩家操作不卡、畫面不閃、不過度耗 GPU、轉場不白屏、手機不因資源累積而崩潰。
- 用實際幀時間／FPS、輸入至畫面回應、GPU context、記憶體曲線、初次入場與第二次入場耗時定位瓶頸；先量再改。
- 分辨 JS 主執行緒、Three draw calls、Effekseer 粒子、材質透明 overdraw、圖片解碼與網路載入；不要把所有慢都怪「圖片快取」或 SQL。
- 保持符文品質但依裝置調整 DPR、特效層數或呈現模式；畫質降階必須透明、可用，不能擅刪符文語意與原畫。
- GPU 資源按場景卸載；避免每次切換又開一個 Canvas、留下 RAF 或重複載入相同 WASM。
- 靜態素材可依 LRS 獨立管線準備；LRS 發版時準備素材正常，**不為省建置而犧牲作品完整性**。網頁以 URL 使用資產；原生以實體檔案交付。
- 驗收：連續遊玩、反覆 2D／3D、回首頁再進遊戲、手機較弱裝置、reduced-motion。沒有實測不得報「60fps」。
