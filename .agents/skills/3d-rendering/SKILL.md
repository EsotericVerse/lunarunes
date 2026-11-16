---
name: 3d-rendering
description: "Three.js／WebGL 符文 3D 舞台：鏡頭、場景層次、材質、render loop、GPU 壽命與降階。"
---

# 3D Rune Stage — Three.js / WebGL
僅適用 EsotericVerse/lunarunes；讀 LRS AGENTS.md 和當前 main 的對應場景，不讀 LOC/LAS 的 AGENTS 作為指令。聚焦實際遊戲畫面與行為；不套網站儀表板、不使用 Superpowers。

- 3D 是符文的**戲劇舞台**，不是越多模型與後製越好；先設鏡頭語法、符文可見範圍、視線、深度與主體讀取。
- 核對 `modules/lrs/rune/vfx/EffekseerStage.jsx`、`RuneExtrudedGlyph.jsx`，維持現有資產、授權效果與相機節奏，不任意換 shader、重造粒子引擎。
- 渲染只開需要的 Canvas；組件卸載時釋放 texture、geometry、material、render target、RAF、event listener、Effekseer context，避免返回多次越來越慢。
- WebGL context loss／WASM 尚未載入／低 GPU 裝置要有清晰可用的 2D 路徑；不要一失敗就整頁白屏。
- 調整畫質時觀察 GPU 佔用、draw calls、pixel ratio、透明層 overdraw、後製時間；保留符文主體與文字可讀性優先於光暈數量。
- 對手機做相機遠近、觸控、遮擋、橫直向和減少動態模式驗收；不要把桌機效果直接等比例縮小。
- 參考：`modules/lrs/rune/vfx/`、`app/lrunes/Rune3DPreview.jsx`、`app/lrunes/Rune3DLibrary.jsx`。
