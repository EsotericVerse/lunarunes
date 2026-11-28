# LunaRunes（月符／符韻）

LRS 獨立符文、美術與遊戲專案。LRS 自有輕量框架位於 **`modules/lrs/framework/`**；路由、模組註冊與資源生命週期不依賴 React、Vite 或 LOC。Web 使用 React 適配層和 Vite 建置工具，Cloudflare Worker 負責 LRS 自己的靜態資源與 API。沒有 Next.js、App Router、SSR 或 LOC Scope 的程式碼副本。

- 開發：`npm ci`、`npm run dev:web`
- Web/IPA 共用的發布目錄：`npm run build:pages`，輸出 `dist/pages`（Vite 及原始符文素材）
- Cloudflare Production：Build `npm run build:pages`；Deploy `npx wrangler deploy`，部署階段不重跑 Build
- Cloudflare Preview：Build `npm run build:pages`；Preview Deploy `npx wrangler preview`
- 正式網址僅 `https://lrs.lo3rwang.cc/`；正式 Worker `workers.dev` 關閉、獨立 Preview URL 啟用
- Worker API `/api/lrs/public-read`、`/api/lrs/moonwriter/`；僅使用 `LRS_HYPERDRIVE` binding（`lrs-postgres`）取得 runtime connectionString，不讀取舊 URL Secret。LRS 自有 PostgreSQL-only Kysely/pg 連線層，每個請求最多一條本地連線，結束即釋放；上游連線池由 Hyperdrive 管理。Query Cache 關閉。
- IPA：手動啟動 GitHub Actions `LRS IPA`，以本機打包素材輸出未簽署 IPA，不把網站 URL 當作原生 App 的素材來源
- LRS `/` 只提供符文功能導覽；`lrunes` Scope、Hero、文字編排及編輯權限由 LOC 持有，位於 `https://loc.lo3rwang.cc/lrunes/`
- `modules/lrs/` 為 Rune/Card（內含 Daily）/Boardgame 模組；`web/src/runes/` 為 Vite 專用的 React 功能畫面
- LRS 不改動 LOC／LAS 的程式與部署，也不觸發其他 Repository
- SQL Dialect、資料連線及服務端匯入／匯出轉交 LAS Adapter；目前直接 PostgreSQL 是過渡 host，API handler 已隔離成固定讀取介面。文字密度推演使用 Universe 命名，不改寫 LOC Galaxy。參見 [交接契約](contracts/las-adapter.md)。

請以目前有效的 Cloudflare Builds 設定為準；Build 成功不代表 HTTP、API 或實際 WebGL 功能已經通過驗收。Cloudflare DNS、Access、Token、Secret 由管理者維護。

## Lucus 架構與 LRSLucus 符文關係圖

**Lucus = Lucas + Locus = Lucus**，是作者定義的特殊拉丁文字，意為「光之時空定錨點」，意象為 Universe Tree 上的神聖樹林。Lucus 是跨系統共用的基礎架構；LRS 以 LRSLucus 表達自身的符文關係，不代表 LRS 已實作完整的粒子化 Lucus 核心或 Universe Tree。

**LRSLucus** 是 LRS 九大群組與 67 個符文字的唯一關聯圖，也是抽牌、圖鑑路由及後續分組加權的基礎：

- 第 1–8 群各包含 8 枚符文。
- 第 9 群包含 0、65、66 三枚特殊符文。
- 共 67 個符文字；0「德」屬於關聯圖，但不參與抽牌；1–66 可抽。
- 群組歸屬、圖鑑路由與本地符文編號統一由 `modules/lrs/lucus/lrs-lucus.mjs` 提供，不在 UI 或抽牌頁重複計算。
- LRSLucus 是 LRS 專屬的符文關係圖，與 LOC 的 LOCLucus 資料面向各自獨立，但共用 Lucus 架構。未來跨系統連接與轉換使用 Lucus 架構及 LunArcus 協定；粒子化關聯格式與 Universe Tree 的完整連接仍屬未來設計。

## LRS Framework

- **核心**：`modules/lrs/framework/index.mjs`，持有 LRS 模組註冊、唯一功能路由表、路由狀態與離頁釋放通知；純 ESM，無 DOM／React／Vite 相依。
- **Web 適配層**：`web/src/runtime/lrs-app-runtime.mjs` 管理 History API、公開資料讀取離頁釋放；`lrs-feature-views.jsx` 將框架 View 映射到按需載入的 React 元件。
- **資源規則**：只清理上一功能頁的暫時公開查詢與該頁元件資源；67 符及九組 Session、本機每日紀錄、3D GPU 效果的元件卸載規則不變。
- **Web／IPA**：共用同一套框架與路由語意，Web 按需讀取已發布圖片，IPA 保留本機實體素材；打包工具可替換而不必重寫功能模組。
- **邊界**：LOC 的 Scope、Hero、SSO 與 LAS 的 Plugins 不屬於 LRS Framework。

## /card（含 daily）、/game 路由歸屬

- `/card/`、`/card/duel/` 與 `/card/list/`：LRS 原生符文卡牌、抽牌與圖鑑。
- `/card/daily/`：每日抽牌正式入口；`/card/daily/reading/`：依同次抽牌的符文本義、原始方向位、真實月相與五項來源欄位顯示整合解析，並可展開逐字原文；不重新抽牌、不補造占辭。純資料組合演算在 `modules/lrs/card/daily/interpretation.mjs`。
- `/card/daily/log/`、`/card/daily/trend/`：獨立本機紀錄與趨勢。每日程式位於 `modules/lrs/card/daily/`。
- 舊公開連結 `/daily/`、`/daily/log/`、`/daily/trend/` 只改到對應 `/card/daily/` 路徑，不保留另一套每日模組。
- 解析頁只使用同一瀏覽器執行期間的暫存抽牌結果；重新整理後沒有結果就提示先抽牌，並不自動建立紀錄。
- `/game/`：保留 LRS 本機桌遊。
- `/game/room/`：選用線上桌遊試驗，2–4 人以房間代碼加入；每房間獨立 SQLite-backed Durable Object、WebSocket Hibernation、伺服器執行既有規則、私人手牌分離。房間保存 24 小時，暫不寫入 Neon 戰績；無新帳號或跨專案依賴。
- LOC 的歷史 `/card`、`/daily`、`/game` 頁面只負責連往 `https://lrs.lo3rwang.cc`；LRS 不負責 LOC Scope 的 Hero、內容與權限。
