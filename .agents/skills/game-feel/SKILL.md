---
name: game-feel
description: "遊戲手感與回饋：選牌、翻牌、確認、相機、觸控時序、命中回饋與心流節奏。"
---

# Game Feel — 遊戲的手感而非網站點擊
僅適用 EsotericVerse/lunarunes；讀 LRS AGENTS.md 和當前 main 的對應場景，不讀 LOC/LAS 的 AGENTS 作為指令。聚焦實際遊戲畫面與行為；不套網站儀表板、不使用 Superpowers。

- 每個互動需要可感知的**輸入 → 反應 → 狀態結果**：例如選卡立即提供位置／輪廓／動勢回饋，然後才是後續解牌。
- 響應感、誤觸防護、重複點擊保護、撤銷／返回必須先設計；不得在慢特效期間丟掉玩家輸入或清除尚未完成的抽牌。
- 切換 2D/3D 時原本的邏輯選牌狀態應保留，GPU 畫面可以卸載；持久化遊戲狀態與暫時視覺資源是兩個生命週期。
- 進出場的時間長短要服從玩法：儀式動畫可以有張力，但重複抽牌、切頁與確認回合不該被過長動畫阻塞。
- 同一操作在滑鼠、鍵盤、觸控與 reduced-motion 模式提供等價回饋；需要聲音時保持可靜音，不以聲音作為唯一資訊。
- 針對慢機與低 FPS 實玩，區分輸入延遲、幀率不足、素材等待與資料等待，不盲目提高動畫數量。
- 參考：`app/lrunes/RuneUnifiedView.jsx`、`modules/lrs/card/rune-draw-motion.mjs`、`modules/lrs/boardgame/GameBoard.jsx`。
