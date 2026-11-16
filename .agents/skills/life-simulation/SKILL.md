---
name: life-simulation
description: "模擬符文人生單人遊戲：月回合、八面向、抽八出五、有限資源與人生事件敘事。"
---

# Rune Life Simulation — 模擬符文人生
僅適用 EsotericVerse/lunarunes；讀 LRS AGENTS.md 和當前 main 的對應場景，不讀 LOC/LAS 的 AGENTS 作為指令。聚焦實際遊戲畫面與行為；不套網站儀表板、不使用 Superpowers。

- **定位是單人模擬人生，不是競選、對抗或普通桌遊的套皮。** 張力來自有限時間、行動與資源下「什麼都想要」。
- 一回合為一個月，從 66 張可抽符文選 8 張、執行 5 張、另 3 張未出；趨勢觀察上限 11 張。核對 `LIFE_TURN` 及 `createRuneLifeEngine`。
- 八面向固定：靈魂／出國、連結／朋友、生命／愛情、自然／寵物、礦物／經濟、元素／專精、秩序／學習、無序／娛樂。
- UI 應讓玩家看見月份、剩餘出牌空間、八面向選擇、未出牌及選擇後的人生變化；以人生畫面敘事而非八個後台計數欄位。
- 目前已有**規則核心**，不代表已有完整關卡、數值平衡、事件內容與可玩 UI；未定數值／環境事件由明確 host 提供，禁止自己發明當定稿。
- 為重現 bug 允許注入 seed / deterministic RNG；正式遊戲保留真實隨機性。每月歷史可回看，行動已提交不得被畫面切換悄悄更動。
- 首次驗收至少兩個月的遊玩流：選八／出五／保留三、事件、下一個月、回看，並確認 2D 小螢幕可用。
- 參考：`modules/lrs/boardgame/life-engine.mjs`、`tests/lrs-life-engine.test.mjs`。
