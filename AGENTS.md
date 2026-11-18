# LunaRunes / LRS AGENTS

LRS 是獨立的符文、美術與遊戲創作專案。作者決定符文語意、玩法、畫面與美感；Agent 是實作協作者，不是作品裁判。以實際可玩的畫面、手感及必要效能改善為工作依據。不要為遊戲與藝術強加一般 SaaS 工程、政策關卡或固定測試。禁止 Superpowers。

## 創作與功能
- 可抽符文為 1–66；第零符「德」不抽。原始卡面、四方向位、月相和已定義的規則不擅改。
- `lrs:rune`：圖像、Hero、3D、Effekseer；`lrs:card`：抽牌；`lrs:daily`：每日符文與紀錄；`lrs:boardgame`：遊戲。
- 按作者指定意象與實際畫面直接修改；需要時才按需查閱 `.agents/SKILL-INDEX.md` 和相關 Skills。不要一次載入全部。
- 不以自編測試、主觀評分、政策或文書替代作者實際驗收；遇到錯誤直接修正，不改符文定義。

## 專案隔離與部署
- 只處理 `EsotericVerse/lunarunes`。不修改或觸發 LOC／LAS 的程式、資料庫、預覽、部署或 IPA。
- Web 由 LRS Cloudflare Workers Builds 建置：`main` 正式發布，其他分支 Preview；不要新增 GitHub Web 部署。
- IPA 只由 LRS GitHub Actions 的 `LRS IPA` 手動打包，不跨 Repo。
- 不設額外測試或檢查 Workflow；不得自行改變 Cloudflare 憑證、權限或安全設定。
- 保留原始素材、著作權與第三方授權；著作權修改由作者決定。

## 文字與交付
- 繁體中文說明遵循 `.agents/skills/zh-tw-writing/SKILL.md`；不干涉原創故事及符文語言。
- 完成後報告實際檔案、畫面、Preview 與正式部署狀態，未驗證就明說。
