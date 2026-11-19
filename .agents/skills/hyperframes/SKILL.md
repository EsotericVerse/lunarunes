---
name: hyperframes
description: "選擇性使用的 LRS 影片創作 Skill。僅當使用者明確要把原創歌曲、愛情故事、歌詞或符文敘事製作為 MV、動態分鏡、影片、字幕動畫或可剪輯的 HyperFrames 專案時才讀取。一般聊天、純歌詞寫作、遊戲特效、日常頁面設計與網站建置不觸發。"
---

# HyperFrames — LRS 影音敘事（按需啟用）

這是 **LRS 的選擇性技能入口**，用於將作者已有的音樂、歌詞、角色與故事轉為可剪輯的影片；原創內容由現有 `narrative-design`、`zh-tw-writing` 及作者定義維護，本技能不重寫歌詞、故事設定或符文 Canon。影片製作不同於遊戲即時渲染，不取代 Three.js、Effekseer 或現有 LRS Web／iOS 素材流程。

## 啟用判斷

- **使用**：使用者明確要求 MV、音樂愛情故事影片、歌詞影片、可編輯影片、視覺分鏡後續需要轉影片，或直接指定 HyperFrames。
- **不使用**：一般文字創作、單純討論故事、設計遊戲 UI、符文抽牌特效、修復既有網站或本 Repo 的日常建置。
- 啟用後按作品需要組合 `narrative-design`、`motion-direction`、`audio-feedback` 或其他已存在的 LRS Skills；不固定全套載入。

## 按需取得官方規範

來源固定為 [heygen-com/hyperframes @ `e383abf475b6ebd5072d6aa1cb380bc7d984c629`](https://github.com/heygen-com/hyperframes/tree/e383abf475b6ebd5072d6aa1cb380bc7d984c629/skills)；先讀適用的單一檔案，再視工作逐項展開：

- [官方 HyperFrames 影片創作規範](https://github.com/heygen-com/hyperframes/blob/e383abf475b6ebd5072d6aa1cb380bc7d984c629/skills/hyperframes/SKILL.md)：開始實際建立、修改、渲染影片前閱讀。
- [HyperFrames CLI 指引](https://github.com/heygen-com/hyperframes/blob/e383abf475b6ebd5072d6aa1cb380bc7d984c629/skills/hyperframes-cli/SKILL.md)：確實要執行 CLI、檢查、渲染時才閱讀。
- [素材與音訊指引](https://github.com/heygen-com/hyperframes/blob/e383abf475b6ebd5072d6aa1cb380bc7d984c629/skills/media-use/SKILL.md)：需要匯入歌曲、音效、影像或影片時再讀。
- [視覺元件 Registry](https://github.com/heygen-com/hyperframes/blob/e383abf475b6ebd5072d6aa1cb380bc7d984c629/skills/hyperframes-registry/SKILL.md)：需要現成轉場、文字動態、字幕或效果時再讀。
- [官方文件](https://hyperframes.heygen.com/introduction)：遇到版本或介面差異時核對目前規格。

## 執行邊界

本目錄只提供**入口與必要連結**，不是官方完整 Skill 套件或已安裝的執行環境。官方主技能會引用 `scripts/plugin-cli.mjs` 等配套檔案；未依官方程序安裝前，不能假設本地有那些腳本，也不能宣稱已可產出 MP4。實際開始製片時，先檢查 Node.js 22+、FFmpeg 與 HyperFrames CLI／Studio 的可用性，並核對官方版本相容性。

不要在 LRS 的 `package.json`、部署腳本、網站或 IPA 建置中自動加入 HyperFrames。影片作品獨立處理；不得因讀取 Skill 而執行需要登入、收費、上傳素材、回傳使用情況或額外服務的指令，應先確認本次用途及授權。保留歌曲、影像、聲音與角色素材的使用權限及作者原意。

這份技能採漸進載入：不製片時不展開官方資料，不強制產生規格、建立工作流程或額外資料夾。
