# LunaRunes（月符／符韻）

LRS 獨立管理符文、抽牌、每日符文、遊戲、圖片與特效。LOC、LAS 各自獨立，不能跨 Repo 部署、預覽或觸發工作流程。

## 只有兩項基本檢查

- `npm run check:syntax`：基本 JavaScript 語法。
- `npm run check:files`：67 張符文卡圖及 9 張群組圖的檔案數量。

沒有其他自動測試或政策檢查。Cloudflare 的一般網站建置會各執行上述兩項一次。

## 只有兩條發布流程

1. **一般網站：Cloudflare Workers Builds。** `main` 發布 `lunarunes` 正式版；其他分支使用 Cloudflare Preview。建置：`npm run build:cloudflare`。正式發布：`npx wrangler deploy`；預覽：`npx wrangler preview`。不另建 GitHub Web 部署。
2. **IPA：LRS 的 GitHub Actions「LRS IPA」。** 僅手動執行；以本 Repo 的 Web、卡圖、特效實體檔案打包 iOS App。產出未簽署 IPA，尚需 Apple 簽署才能安裝，不會自動上架。

## 本機使用

`npm ci`、`npm run dev:web`、`npm run build:web`。

程式模組位於 `modules/lrs/`；符文原圖位於 `assets/`，特效位於 `public/vendor/`。不共用 LOC／LAS 的部署。
