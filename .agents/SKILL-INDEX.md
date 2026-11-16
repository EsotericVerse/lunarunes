# LRS Skills — Game Design / Visual First

**所有技能只適用 LunaRunes（`EsotericVerse/lunarunes`）。** 在任何工作中先讀根目錄 `AGENTS.md`；以**實際玩家畫面／操作體驗**選技能，**禁止 Superpowers**。Skills 是工作判斷與驗收方式，不是安裝所有 npm 包或每次執行一套網站工程。

## 優先：設計圖、畫面與玩法（先選這一區）
- [scene-blueprint](skills/scene-blueprint/SKILL.md) — 首要規格：畫面構圖、玩家操作、狀態流轉、鏡頭節奏、桌面／手機差異；先定設計圖與行為再選工程手段。
- [game-ui-ux](skills/game-ui-ux/SKILL.md) — LunaRunes 遊戲 UI/UX 首要技能：畫面佈局、操作動線、卡牌手勢、桌面與手機遊戲體驗；優先於一般工程流程。
- [art-direction](skills/art-direction/SKILL.md) — 符韻原創遊戲美術總監：卡面、八群組、材質、色彩層次、場景風格與一致性，杜絕塑膠感和制式網頁。
- [game-feel](skills/game-feel/SKILL.md) — 遊戲手感與回饋：選牌、翻牌、確認、相機、觸控時序、命中回饋與心流節奏。
- [card-experience](skills/card-experience/SKILL.md) — 符文抽牌與占讀互動：牌陣、翻牌、四方向位、月相、解讀與 2D／3D 視覺。
- [game-rules](skills/game-rules/SKILL.md) — 桌遊與回合玩法：明確規則、玩家選擇、回合狀態、合法移動、事件與可重玩。
- [life-simulation](skills/life-simulation/SKILL.md) — 模擬符文人生單人遊戲：月回合、八面向、抽八出五、有限資源與人生事件敘事。
- [3d-rendering](skills/3d-rendering/SKILL.md) — Three.js／WebGL 符文 3D 舞台：鏡頭、場景層次、材質、render loop、GPU 壽命與降階。
- [effekseer-vfx](skills/effekseer-vfx/SKILL.md) — Effekseer 正式素材與 WASM 播放：原版授權特效、語意鏡頭、載入回退、渲染與釋放。
- [motion-direction](skills/motion-direction/SKILL.md) — 符文遊戲動態導演：分鏡、節拍、翻牌、過場、鏡頭、動作節制與可跳過。

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

**使用方式**：設計／畫面／互動任務優先使用 `scene-blueprint`，再以 `game-ui-ux` 或最貼近場景的一份技能補充；若本次確實涉及特效、性能、規則，再按需補相應技能。技能數多是專業覆蓋，不是每次全部預載。每份技能可獨立使用，不強制串成流程。禁止把 LOC 的 Next.js SaaS、MCP／SSO、SQL Portable、Hero 或 LAS IPA 管線當遊戲開發流程。
