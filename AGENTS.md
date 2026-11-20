# LunaRunes / LRS AGENTS

**Agent 回覆精簡**：對作者的日常說明、進度、測試與交付回報，預設採用 `.agents/skills/caveman/SKILL.md`，刪去冗語但不刪事實、錯誤、風險及驗證結果；文字保持 `zh-tw-writing` 所定的自然台灣中文。這是 Agent 回覆方式，不改寫符文、原創歌詞、遊戲 UI、文件或程式碼，不新增測試與工作流程。

LRS 是獨立的符文、美術與遊戲創作專案。作者決定符文語意、玩法、畫面與美感；Agent 是實作協作者，不是作品裁判。以實際可玩的畫面、手感及必要效能改善為工作依據。不要為遊戲與藝術強加一般 SaaS 工程、政策關卡或固定測試。禁止 Superpowers。

## 創作與功能
- 可抽符文為 1–66；第零符「德」不抽。原始卡面、四方向位、月相和已定義的規則不擅改。
- `lrs:rune`：圖像、Hero、3D、Effekseer；`lrs:card`：抽牌；`lrs:daily`：每日符文與紀錄；`lrs:boardgame`：遊戲及獨立模擬人生核心。
- 按作者指定意象與實際畫面直接修改；需要時才按需查閱 `.agents/SKILL-INDEX.md` 和相關 Skills。不要一次載入全部。
- 不以自編測試、主觀評分、政策或文書替代作者實際驗收；遇到錯誤直接修正，不改符文定義。

## 專案隔離與部署
- 只處理 `EsotericVerse/lunarunes`。不修改或觸發 LOC／LAS 的程式、資料庫、預覽、部署或 IPA。
- LRS Web 以 GitHub main 為唯一原始碼來源；Cloudflare Workers Builds 負責正式版及分支 Preview。正式版 Build 留空，Deploy 為 `npm run deploy`；預覽 Build 為 `npm run build:pages`，Preview 為 `npx wrangler preview`。
- `wrangler.json` 指向既有 `lunarunes` Worker；只服務 LRS 自己的靜態資源與 API，以現有程式碼路由為準，不擴增其他用途。不擅自改 Cloudflare DNS／Access／Token／Secret／網域設定，不自行 Grant 或延長授權。
- IPA 只由 LRS GitHub Actions 的 `LRS IPA` 手動打包，不跨 Repo。iOS 素材隨 App 打包，Web 使用獨立已發布素材。
- 不設額外測試或檢查 Workflow；Cloudflare Access 目前整個帳戶都沒有啟用，不自行重建、Grant、延長權限或使用跨 Repo 大權杖。
- 保留原始素材、著作權與第三方授權；著作權修改由作者決定。

## 文字與交付
- 繁體中文說明遵循 `.agents/skills/zh-tw-writing/SKILL.md`；不干涉原創故事及符文語言。
- 完成後報告實際檔案、畫面、Preview 與正式部署狀態，未驗證就明說。
