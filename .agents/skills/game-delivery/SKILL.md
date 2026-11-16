---
name: game-delivery
description: "LRS 遊戲作品驗收與獨立交付：可玩的 Web、資產完整性、原生素材契約及部署結果。"
---

# Game Delivery — 發布一個能玩的作品
僅適用 EsotericVerse/lunarunes；讀 LRS AGENTS.md 和當前 main 的對應場景，不讀 LOC/LAS 的 AGENTS 作為指令。聚焦實際遊戲畫面與行為；不套網站儀表板、不使用 Superpowers。

- **交付不是 PR 數。** 本次目標是玩家看到正確畫面、能玩、不卡、資料和符文原畫不缺，再驗證 LRS 自己的建置與 Worker。
- 只操作 `EsotericVerse/lunarunes`；不要替 LOC、LAS 變更 code／設定／Cloudflare。現有 LRS 的 Cloudflare Worker 負責 Web，LAS 只消費 iOS 實體素材。
- Web 與 native 的資產流程是兩套輸出但同一套 LRS 源素材；原生實體素材交由 LOC 既有 IPA 包裝，不由 LAS 或 LRS 建 IPA。不要為了方便混成 URL-only iOS，也不要新增 IPA。
- LRS `main` Merge 不等於發布；正式發布須確定 SHA、明確授權及版本驗收。保留既有 `build:cloudflare`、`check:cloudflare:release` 和必要的 syntax/route/gameplay tests。素材準備在 LRS 發版時執行是正常的，不要假設是重複負擔。
- 區分單元、畫面、互動、效能、Worker 預覽、主線部署、實際使用：哪層通過就只宣稱哪層；需要真實瀏覽器／資料時自己測，工具受限再精確回報。
- 不把遊戲開發拆成每改一段就開 PR 的軟體工程儀式；能安全一次完成的功能與相應驗收應一批交付。
