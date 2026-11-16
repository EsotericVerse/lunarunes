---
name: effekseer-vfx
description: "Effekseer 正式素材與 WASM 播放：原版授權特效、語意鏡頭、載入回退、渲染與釋放。"
---

# Effekseer VFX — 作者素材為主，特效不得造假
僅適用 EsotericVerse/lunarunes；讀 LRS AGENTS.md 和當前 main 的對應場景，不讀 LOC/LAS 的 AGENTS 作為指令。聚焦實際遊戲畫面與行為；不套網站儀表板、不使用 Superpowers。

- 使用 LRS 既有授權與來源固定的 .efkefc／材質／WASM，參照 `modules/lrs/rune/vfx/rune-effect-library.mjs` 與 `contracts/rune-original-art.json`。
- 不自己用 CSS glow、手搓 emitters、隨機 shaders 或圖片替代授權特效並稱完成；可以做真正的錯誤／未載入提示，但不能偽裝成原效果。
- 分開處理：特效載入（js / wasm / asset URL）→ 初始化 → 符文／群組對應 → 影片式攝影機運動 → 暫停、切換、卸載。
- `rune-cinematic-language.mjs` 有群組舞台語法，不能讓不同群組只剩同一套變色光圈；方向位的解讀與圖鑑展示也不應混成一種 VFX 情境。
- 檢查素材路徑大小寫、MIME、CORS、素材完整性與資源生命週期；iOS 真實文件交付另外由既有 LRS exporter 消費，不能用 Web URL 假設替代。
- 驗收完整 66 張符文效果的代表群組取樣與至少一次重進舞台，觀察黑屏、閃白、殘留 Canvas、WASM 失敗、素材遺失。
- 參考：`scripts/prepare-rune-runtime-assets.mjs`、`modules/lrs/rune/vfx/EffekseerStage.jsx`、`scripts/build-rune-artifacts.mjs`。
