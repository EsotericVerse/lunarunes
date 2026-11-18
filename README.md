# LunaRunes（月符／符韻）

LRS（`lo3r@lrs`）獨立維護符文、抽牌、每日符文、桌遊引擎、畫面及原創素材。Web 與原生 App 各自交付，不因 LOC 或 LAS 更新而一併部署。

| 模組 | 責任 | 原始碼 |
| --- | --- | --- |
| `lrs:rune` | 符文、圖鑑、圖片與特效 | `modules/lrs/rune/` |
| `lrs:card` | 抽牌、方向位與牌陣 | `modules/lrs/card/` |
| `lrs:daily` | 每日符文與紀錄 | `modules/lrs/daily/` |
| `lrs:boardgame` | 桌遊與模擬規則 | `modules/lrs/boardgame/` |

## 系統邊界

- **LRS** 自行維護 Web／Worker、符文資料及自己的原生 App／IPA 工作；原生建置是否可用以 LRS 現行 Workflow 與實際產物驗證，不以規劃當作已交付。
- **LOC** 自行維護月典網站、Galaxy／Anchor、Scope、SQL Portable，以及 LOC 自己的 App／IPA；需要時以明確的跨系統契約引用符文內容。
- **LAS** 自行部署 Auth、MCP、Plugins 與通訊協定服務，不建置任何 IPA。

三個 Repository **各自管理自己的 Routing Table 與部署**。LRS Web 的路由只由 LRS 自己維護；LOC 的 Scope 路由不等於 LRS 的 Web 路由，LAS 的 Auth／MCP 路由也不屬於 LRS。跨站入口以連結或明確的協定銜接，不複製也不共用路由表。

## 建置與檢查

```bash
npm run check:lrs:modules
npm run check:lrs:ownership
npm run build:web
npm run build:cloudflare
npm run check:cloudflare:release
npm run deploy:cloudflare:dry-run
```

符文原圖與授權素材的來源及完整性依 `contracts/rune-original-art.json`、`scripts/build-rune-artifacts.mjs` 驗證。Web 產物與原生素材分開產生；iOS 使用實際檔案，不以 Web URL 取代。資產匯出不等於 IPA 編譯完成。

正式 Web 部署以 LRS 既有 `lunarunes` Worker 設定為準；原生 App 依 LRS 自己的 Workflow 驗證，不交給 LOC 或 LAS 發布。版本以 `release/version.json`、實際 Git SHA 與檢查碼分別確認，不能混用。

具體路由、資料庫、模組匯入與建置步驟以目前程式碼和測試為準。歷史搬遷說明由 Git Commit 和私人 Slack 工程封存保留，不在 README 重複累積版本日誌。
