---
name: art-assets
description: "LRS 原始卡圖、授權特效、Web／iOS 雙輸出素材交付、SHA 完整性及原畫保真。"
---

# Rune Asset Stewardship — 原畫與交付
僅適用 EsotericVerse/lunarunes；讀 LRS AGENTS.md 和當前 main 的對應場景，不讀 LOC/LAS 的 AGENTS 作為指令。聚焦實際遊戲畫面與行為；不套網站儀表板、不使用 Superpowers。

- 先識別真正的源素材：`assets/lunarunes/`、`contracts/rune-original-art.json`、`modules/lrs/rune/asset-url.mjs`；不得覆寫已定稿的 67 張符文卡圖。
- 原圖、卡背、圖示、效能衍生物、Effekseer/WASM 分類管理；修改衍生尺寸不得回寫原圖，也不可把失去授權的外部資源當正式素材。
- LRS Web 以獨立 Worker 靜態資源／URL 提供素材；LRS iOS App 必須使用**本地真實檔案**並校驗完整性，不能假設 Web URL 可用。
- Web 模組、卡圖與 WASM 是不同交付物；**LOC／LRS 各自負責自己的 IPA**，LAS 不參與。LRS 需驗證自己的原生工作流及資產；不為註解改動重設部署或刪除必要素材準備工作。
- 檢查 MIME、路徑大小寫、哈希、缺檔、素材授權及 iOS manifest；`.gitignore` 只忽略真正的生成品，**不可把需要提交的原始素材忽略**。
- 參考：`scripts/build-rune-artifacts.mjs`、`scripts/prepare-lrs-release-assets.mjs`、`scripts/check-rune-cloudflare-release.mjs`。
