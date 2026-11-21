# LunaRunes（月符／符韻）

LRS 獨立符文、美術與遊戲專案。Web 使用 **Vite + React**，Cloudflare Worker 負責 LRS 自己的靜態資源與 API。沒有 Next.js、App Router、SSR 或 LOC Scope 的程式碼副本。

- 開發：`npm ci`、`npm run dev:web`
- Web/IPA 共用的發布目錄：`npm run build:pages`，輸出 `dist/pages`（Vite 及原始符文素材）
- Cloudflare Production：Build `npm run build:pages`；Deploy `npx wrangler deploy`，部署階段不重跑 Build
- Cloudflare Preview：Build `npm run build:pages`；Preview Deploy `npx wrangler preview`
- 正式網址僅 `https://lrs.lo3rwang.cc/`；正式 Worker `workers.dev` 關閉、獨立 Preview URL 啟用
- Worker API `/api/lrs/public-read`；資料庫 Secret `LRS_DATABASE_URL` 僅在 Worker runtime
- IPA：手動啟動 GitHub Actions `LRS IPA`，以本機打包素材輸出未簽署 IPA，不把網站 URL 當作原生 App 的素材來源
- LRS `/` 只提供符文功能導覽；`lrunes` Scope、Hero、文字編排及編輯權限由 LOC 持有，位於 `https://loc.lo3rwang.cc/lrunes/`
- `modules/lrs/` 為 Rune/Card/Daily/Boardgame 模組；`web/src/runes/` 為 Vite 專用的 React 功能畫面
- LRS 不改動 LOC／LAS 的程式與部署，也不觸發其他 Repository

請以目前有效的 Cloudflare Builds 設定為準；Build 成功不代表 HTTP、API 或實際 WebGL 功能已經通過驗收。Cloudflare DNS、Access、Token、Secret 由管理者維護。
