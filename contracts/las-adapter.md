# LRS → LAS Adapter 交接

狀態：LRS 已抽離公開讀取 handler 與 SQL host 的相依；LAS 接收端尚未切換。現行 Cloudflare Worker、Hyperdrive、正式網址、Web/iOS 讀取契約維持運作。

## 職責

- LAS Adapter（Cloudflare）：PostgreSQL／MySQL／MSSQL Dialect、連線及授權、服務端匯入／匯出。大量匯入使用 LAS Container，Hyperdrive 依實際資料庫使用。
- LOC：Galaxy 原始文字、密度與斷層分析、關鍵詞解析。
- LRS：Rune Core、源轉合及四向月相、模擬人生、文字密度推演（Universe）、遊戲 RT 與房間生命週期。不得將 RT 每次操作交給 LAS。
- 既有 LRS 本機 IndexedDB 紀錄與備份目前不變；LAS 接手匯入／匯出時，明確區分本機資料、服務端資料及使用者授權，不自動上傳本機紀錄。

## 現有固定讀取能力（程式介面，不是新增 HTTP 路由）

`readRuneRows(query, {signal}) → {rows}`：只允許 `publicRuneQuery` 已驗證的 silver.runes／runes_etc／runes_group、固定欄位、eq/in、排序、分頁限制。LAS 端須再次驗證操作、資料庫及授權，禁止任意 SQL、URL、schema、表名或角色。外部公開 API 回應格式維持不變。

`readMoonwriterChapter(expected, {signal}) → row | null`：既有閱讀頁的窄介面；僅允許固定章節目錄，保留 UID、title、site=vocus、list=true 條件。現行資料來源 silver.lrunes_galaxy 不屬於 Universe，不更動來源表。閱讀功能最終歸屬另依作者決定，不將真實小說當成模擬資料。

目前由 `index.mjs` 注入 `createLrsCloudflareDataPort(env)`；handler 不再直接建立 SQL 連線。LAS 接收端需交付具體固定操作、身分驗證及資料庫配置後，替換 composition root，驗證原版符文、每日抽牌、閱讀頁、iOS 及取消請求行為，再移除 LRS 的 pg/Kysely、lrs-postgres.mjs、過渡 SQL host、Hyperdrive 與不再使用的 Secret。沒有自動回退或跨 Repo 部署。尚未建立遠端 API 路徑、憑證或資料表。

## Lucus 架構與 LRSLucus 固定關聯

**Lucus = Lucas + Locus = Lucus**，是作者定義的特殊拉丁文字，意為「光之時空定錨點」，意象為 Universe Tree 上的神聖樹林。Lucus 是跨系統共用的語義／結構架構；**LunArcus Protocol** 負責系統間連接與轉換，兩者不可混為一談。

未來概念鏈為 Galaxy → Universe → Universe Tree，Lucus 以細微粒子化的時空定錨元素連接樹上的關係。這仍是未來設計，並不表示完整粒子引擎或 Universe Tree 已經實作。

LRSLucus 是 LRS 在共用 Lucus 架構下的符文領域關係圖，定義位於 `modules/lrs/lucus/lrs-lucus.mjs`：

- 9 個群組、67 個符文字；第 1–8 群各 8 枚，第 9 群為 `[0,65,66]`。
- `0 = 德` 是關聯成員但不抽；`1–66` 是可抽符文。
- `silver.runes_group` 與 `silver.runes` 是現有讀取資料；群組成員關係由 LRS 的 LRSLucus 定義。LAS 只提供受限、已授權的資料讀取，不重排、不推導、不改寫群組成員，也不計算抽牌權重。
- 五張牌的分組集中加權與八角連動屬於 LRS Rune Core，不交由 LAS Adapter 執行。未來跨系統連接使用 Lucus 架構與 LunArcus Protocol；粒子層 payload、身份交換與轉換規則待作者後續定義，不在本契約中預設。

## Universe 命名

LRS 文字密度推演資料表以 universe 為名稱基礎，預留建議名稱 `lrs_universe`。不使用 galaxy 作推演表名稱，不與 LOC Galaxy 混用。原始資料只作來源引用，推演結果、時間軸及模擬密度與原始紀錄分離。現階段無實體表、DDL 或 migration；欄位與實際建表待推演規格及 LAS 連線交接確認。
