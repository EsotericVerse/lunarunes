# LunaRunes Skills

依當次作品需要，從 .agents/skills/ 選擇技能；不預先載入全部，也不因載入 Skill 就自動增加測試或 Workflow。若本次工作有必要，可自行補充對應測試與驗證，不設全面禁令。

## 小說、短劇與漫劇

- 小說改編：先用 short-drama-novel-analyze 評估原著與拆解章節，再依需要使用 short-drama-develop 建立故事／分集架構、short-drama-write 寫劇本。
- 視覺製作：依需要使用 short-drama-assets、short-drama-image-prompts、short-drama-storyboard、short-drama-video-prompts；short-drama-review 用於獨立審查。
- 完整專案管理：只有需要標準短劇專案目錄、跨階段路由或其獨立創作台時才使用 short-drama。它的創作台不嵌入 LRS Web／IPA，也不取代 LRS Framework。
- 參考片分析：只有使用者提供或指定參考影片時才使用 short-drama-breakdown。
- 生成與剪輯：short-drama-produce 必須先完成任務預覽並取得使用者本次明確確認，才可呼叫外部生成服務；short-drama-edit 只在素材已備妥且需要剪輯時使用。

## 歌曲、歌詞與音樂愛情故事轉影像

- 入口使用 music-narrative-video，先辨識歌詞影片、敘事 MV、音樂愛情故事或動畫 MV，建立歌曲時間軸與視覺故事。
- 依需要組合 short-drama-assets、short-drama-image-prompts、short-drama-storyboard、short-drama-video-prompts；不強制改成短劇分集。
- 影片合成與呈現使用既有 hyperframes；不把影片工具鏈加入 LRS Framework、Web runtime 或 IPA。
- 保留作者原始歌詞、段落與風格。音檔未實際測量時，不虛構 BPM、拍點或精確時間碼。
- 一般愛情故事不套用遊戲專用 narrative-design；只有明確涉及 LunaRunes 符文世界時才使用。

## LRS 遊戲與符文創作

優先視任務使用：art-direction、game-ui-ux、game-feel、card-experience、effekseer-vfx、3d-rendering、game-performance、scene-blueprint、game-rules、life-simulation。其他已有技能按需使用，不自動移除。

遊戲敘事與符文語意使用 narrative-design；不得為了影片或故事改動作者已定義的符文 Canon。

Agent 回覆精簡：caveman，預設去除冗語、不省略技術證據；僅影響對話，不套用原創內容。

台灣繁體中文說明：zh-tw-writing。原創符文文字、歌詞、角色故事與美感由作者決定。

## 外部技能來源

Drama Skills：.agents/skills/drama-skills-source.md 記錄上游來源、MIT 授權與固定版本；所有技能按需載入，不自動執行其腳本或外部服務。
HyperFrames：使用既有 hyperframes 技能與其固定上游版本說明；實際製片前再按需核對官方規範。
外部參考索引：https://github.com/sraodev/awesome-opensource-ai-cheat-sheets
