# LunaRunes（月符／符韻）

獨立符文與遊戲專案。

- 本機開發：`npm ci`、`npm run dev:web`
- Web：GitHub Actions 唯一建置／發布管道，`main` 經 GitHub Pages 正式發布，PR 僅建置、不發布 Preview
- 本機完整 Web 打包：`npm run build:pages`（`dist/pages`）
- IPA：GitHub Actions「LRS IPA」手動執行（目前產出未簽署 IPA，使用本機打包素材）
- Cloudflare：LRS 無操作權，不發布 Worker、不讀寫 DNS／網域／權杖／憑證或其他 CF 設定

GitHub Pages 是靜態託管服務，不支援舊 Worker 的 `/api/lrs/public-read` POST／SQL 功能；此功能需獨立的正式資料來源才能恢復，不得假稱已由 Pages 取代。既有本機桌遊和裝置內每日符文紀錄不依賴該 API。原始卡面、Effekseer/WASM 素材隨本 Repo 自有網站與 IPA 發布。

符文與遊戲：`modules/lrs/`；素材：`assets/`、`public/vendor/`。

LOC、LAS、LRS 各自獨立，不跨 Repo 觸發部署或改動 DNS。
