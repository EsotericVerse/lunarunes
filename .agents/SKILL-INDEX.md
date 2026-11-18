# LRS Skills — Game Design / Visual First

## Awesome Open-Source AI Cheat Sheets（外部完整總目錄；按需參考）

- [專案總目錄／完整速查表索引](https://github.com/sraodev/awesome-opensource-ai-cheat-sheets/blob/c8275b4bfad40f431cd22b616c74728c18e2b29f/README.md)
- [全部 Cheatsheets 目錄（10 份）](https://github.com/sraodev/awesome-opensource-ai-cheat-sheets/tree/c8275b4bfad40f431cd22b616c74728c18e2b29f/cheatsheets)

來源快照：`sraodev/awesome-opensource-ai-cheat-sheets@c8275b4bfad40f431cd22b616c74728c18e2b29f`（MIT）。這是**完整來源索引，不是按 LOC／LRS／LAS 預先分配的清單**；本 Repo 的 Agent 依當前任務與本地 `AGENTS.md`、現有 Skills 自行選擇必要章節。只按需讀取，不一次載入十份；連結不代表已安裝 Skill、增加依賴、創建 Workflow，亦不自動授權跨 Repo 或外部平台操作。

**所有技能只適用 LunaRunes（`EsotericVerse/lunarunes`）。** 在任何工作中先讀根目錄 `AGENTS.md`；以**實際玩家畫面／操作體驗**選技能，**禁止 Superpowers**。Skills 是工作判斷與驗收方式，不是安裝所有 npm 包或每次執行一套網站工程。

## 風格、畫面與玩法（依任務自由選擇）
- [scene-blueprint](skills/scene-blueprint/SKILL.md) — 適合新場景與大幅互動調整：構圖、玩家操作、狀態流轉、鏡頭節奏及裝置差異；不是所有風格微調的前置條件。
- [game-ui-ux](skills/game-ui-ux/SKILL.md) — LunaRunes 遊戲 UI/UX 首要技能：畫面佈局、操作動線、卡牌手勢、桌面與手機遊戲體驗；優先於一般工程流程。
- [art-direction](skills/art-direction/SKILL.md) — 符韻原創遊戲美術總監：卡面、八群組、材質、色彩層次、場景風格與一致性，杜絕塑膠感和制式網頁。
- [game-feel](skills/game-feel/SKILL.md) — 遊戲手感與回饋：選牌、翻牌、確認、相機、觸控時序、命中回饋與心流節奏。
- [card-experience](skills/card-experience/SKILL.md) — 符文抽牌與占讀互動：牌陣、翻牌、四方向位、月相、解讀與 2D／3D 視覺。
- [game-rules](skills/game-rules/SKILL.md) — 桌遊與回合玩法：明確規則、玩家選擇、回合狀態、合法移動、事件與可重玩。
- [life-simulation](skills/life-simulation/SKILL.md) — 模擬符文人生單人遊戲：月回合、八面向、抽八出五、有限資源與人生事件敘事。
- [3d-rendering](skills/3d-rendering/SKILL.md) — Three.js／WebGL 符文 3D 舞台：鏡頭、場景層次、材質、render loop、GPU 壽命與降階。
- [effekseer-vfx](skills/effekseer-vfx/SKILL.md) — Effekseer 正式素材與 WASM 播放：原版授權特效、語意鏡頭、載入回退、渲染與釋放。
- [motion-direction](skills/motion-direction/SKILL.md) — 符文遊戲動態導演：分鏡、節拍、翻牌、過場、鏡頭、動作節制與可跳過。

## 台灣繁體中文顯示與說明文字
- [zh-tw-writing](skills/zh-tw-writing/SKILL.md) — 日常說明、玩法指引、遊戲 UI、測試與交付的基本台灣中文寫作 Skill；原創敘事仍依遊戲專業技能。

## 表現、品質與生產
- [game-performance](skills/game-performance/SKILL.md) — 遊戲效能與流暢度：畫面幀率、輸入延遲、GPU/CPU/記憶體、場景與素材載入、行動裝置。
- [playtesting](skills/playtesting/SKILL.md) — 遊戲 QA 與實機測試：真的看畫面、真的玩完整回合、跨尺寸、記錄視覺與效能故障。
- [game-accessibility](skills/game-accessibility/SKILL.md) — 遊戲無障礙：手勢替代、鍵盤、卡片文字、低動態、色覺辨識、觸控操作與可讀性。
- [art-assets](skills/art-assets/SKILL.md) — LRS 原始卡圖、授權特效、Web／iOS 雙輸出素材交付、SHA 完整性及原畫保真。
- [game-engine](skills/game-engine/SKILL.md) — LRS 遊戲引擎架構：狀態機、確定性重現、規則與渲染分離、回合與可測邏輯。
- [game-balance](skills/game-balance/SKILL.md) — 遊戲平衡與隨機性：抽牌機率、牌陣不變量、有限選擇、事件權重及統計測試。
- [narrative-design](skills/narrative-design/SKILL.md) — 符文世界敘事與遊戲文案：事件的可讀性、角色與象徵、回合故事、UI 文案節奏。
- [audio-feedback](skills/audio-feedback/SKILL.md) — 遊戲聲音設計：原創音效、操作確認、儀式聲景、動作節奏與靜音／無聲可玩。
- [game-delivery](skills/game-delivery/SKILL.md) — LRS 遊戲作品驗收與獨立交付：可玩的 Web、資產完整性、原生素材契約及部署結果。

**使用方式**：以風格設計為出發點，根據本次目標直接選 `art-direction`、`game-ui-ux`、`game-feel`、`scene-blueprint` 或相關專長；需要時可組合多項技能、隨工作自然延伸，沒有固定先後或數量上限。細節微調也是設計工作，不強制先做整份場景圖；大幅場景調整再採合適規格。技能數多代表專業覆蓋，不需要每次全部預載。禁止把 LOC 的 Next.js SaaS、LAS 的 MCP／Auth 或其他 Repo 的 IPA 工作流搬進 LRS 遊戲開發。
