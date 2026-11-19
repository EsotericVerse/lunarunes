# LunaRunes（月符／符韻）

LRS 獨立符文與遊戲專案；LRS Web 由 Cloudflare Workers Builds 對接 `EsotericVerse/lunarunes`，不與 LOC、LAS 共用部署。

- 本機開發：`npm ci`、`npm run dev:web`
- Web 唯一建置基礎：`npm run build:pages`（輸出 `dist/pages`，包含 Vite 與原始素材）
- Cloudflare 正式分支 `main`：Build command 留空；Deploy command `npm run deploy`（內含一次 `build:pages`，再由 Wrangler 發布）
- Cloudflare Preview：Build command `npm run build:pages`；Preview command `npx wrangler preview`
- Cloudflare Worker：`lunarunes`，設定在 `wrangler.json`；Web API `/api/lrs/public-read`，資料庫密鑰只存在 Worker runtime Secret
- LRS 網站：`lrs.lo3rwang.cc`，由使用者在 Cloudflare 管理的 DNS CNAME 指向 `lunarunes.esotericverse.workers.dev`
- IPA：GitHub Actions「LRS IPA」手動打包獨立未簽署 IPA，使用本機素材，不透過 Web 路徑替代
- GitHub Actions 不再自動發布另一套 Web／GitHub Pages；LRS 不操作 LOC、LAS，也不跨 Repo 觸發

`assets/` 與 `public/vendor/` 保留素材原檔；`modules/lrs/` 保留符文與遊戲引擎。模擬人生 `life-engine.mjs` 獨立於既有桌遊。

Worker 已設定的 `LRS_DATABASE_URL` 仍由 Cloudflare runtime Secret 管理，切勿寫入 Repository。建置成功、GitHub Build Trigger 與公開 API 可用性仍需在真實部署後分別驗證。
