---
name: game-delivery
description: "LRS 遊戲作品驗收與獨立交付：可玩的 Web、資產完整性、原生素材契約及部署結果。"
---

# Game Delivery — 發布一個能玩的作品
僅適用 EsotericVerse/lunarunes；讀 LRS AGENTS.md 和當前 main 的對應場景，不讀 LOC/LAS 的 AGENTS 作為指令。聚焦實際遊戲畫面與行為；不套網站儀表板、不使用 Superpowers。

- **交付不是 PR 數。** 本次目標是玩家看到正確畫面、能玩、不卡、資料和符文原畫不缺，再驗證 LRS 自己的建置與 Worker。
- 只操作 `EsotericVerse/lunarunes`；不要替 LOC、LAS 變更 code／設定／Cloudflare。LRS 自己的 Worker 負責 Web；LRS 原生 App 由本 Repo 自己打包並驗證。
- Web 與 native 是同一套 LRS 原始素材的兩種交付；**LRS 與 LOC 各自擁有自己的 IPA**，LAS 不打包 App。原生檔案不得被 URL-only iOS 取代；Workflow 在 PR 中不代表正式 IPA 已驗收。
- LRS `main` 更新會由既有 Cloudflare Builds 自動部署唯一的 `lunarunes` Worker；不得開 dev／Preview Worker。緊急與作者裁定的大版本走既有特別授權通道，須核實 SHA、TTL 及版本。保留既有 `build:cloudflare`、`check:cloudflare:release` 和必要的 syntax/route/gameplay tests。素材準備在 LRS 發版時執行是正常的，不要假設是重複負擔。
- 區分單元、畫面、互動、效能、Worker 預覽、主線部署、實際使用：哪層通過就只宣稱哪層；需要真實瀏覽器／資料時自己測，工具受限再精確回報。
- 不把遊戲開發拆成每改一段就開 PR 的軟體工程儀式；能安全一次完成的功能與相應驗收應一批交付。
