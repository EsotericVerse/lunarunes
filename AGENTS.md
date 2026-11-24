# LunaRunes / LRS AGENTS

**Agent 回覆精簡**：對作者的日常說明、進度、測試與交付回報，預設採用 `.agents/skills/caveman/SKILL.md`，刪去冗語但不刪事實、錯誤、風險及驗證結果；文字保持 `zh-tw-writing` 所定的自然台灣中文。這是 Agent 回覆方式，不改寫符文、原創歌詞、遊戲 UI、文件或程式碼，不新增測試與工作流程。

LRS 是獨立的符文、美術與遊戲創作專案。作者決定符文語意、玩法、畫面與美感；Agent 是實作協作者，不是作品裁判。以實際可玩的畫面、手感及必要效能改善為工作依據。不要為遊戲與藝術強加一般 SaaS 工程、政策關卡或固定測試。Skills（包含 Superpowers）只按本次問題需要選用，不因技能名稱一律禁用，也不讓 Skill 自動增加強制流程。

## 創作與功能
- 可抽符文為 1–66；第零符「德」不抽。原始卡面、四方向位、月相和已定義的規則不擅改。
- `lrs:rune`：符文圖像素材、3D、Effekseer（不包含 LOC Scope Hero/編輯）；`lrs:card`：抽牌（含 `card/daily` 的每日抽牌、解析與本機紀錄）；`lrs:boardgame`：遊戲及獨立模擬人生核心。
- 按作者指定意象與實際畫面直接修改；需要時才按需查閱 `.agents/SKILL-INDEX.md` 和相關 Skills。不要一次載入全部。
- 不以自編測試、主觀評分、政策或文書替代作者實際驗收；遇到錯誤直接修正，不改符文定義。

## 專案隔離與部署
- LOC 唯一持有 `lrunes` Scope 入口、Hero 編排、可編輯區塊及主站導覽。LRS 的 `/` 僅列出自己的符文功能路徑，不發布 LOC Scope 副本；不要讀取 `silver.lrunes_blocks`。
- 以 `EsotericVerse/lunarunes` 為本次工作範圍；未經授權不修改 LOC／LAS 的程式、資料庫、預覽、部署或 IPA。確實需要跨專案交付或通知時，提出具體契約與影響，不因 LRS 自己的變更就自動連帶觸發其他 Repo。
- LRS Web 原始碼以此 Repo 為準；`main` 是正式交付基準。依變更範圍、風險與協作狀況選擇 Git 流程：範圍明確、低風險的小修可依既有權限與分支保護直接提交 main；功能開發、較大調整、需要隔離或多人協作的改動，使用分支及 PR。Draft 適合尚未完成的工作；完成必要驗證、符合合併條件且無具體阻礙時，轉為 Ready 並自行完成正常合併，不把 Draft 或 Preview 當作交付終點。使用者有指定流程時依其要求。Build／Preview／Deploy 各按實際需要安排。**同一份有效建置輸入、同一建置目標已有成功產物或可用 Preview 時，沿用既有結果，不再觸發相同的 Build 或 Preview Build；命中 Build Cache 仍是一次建置，不是重複執行的理由。** 需要再次驗證時，直接使用既有 Preview URL、部署版本或產物；不要為同一項驗證另開 PR、空提交、重跑 Workflow 或重建 Preview。依程式碼及實際影響建置的依賴、設定、環境與目標判斷是否有變更，不單憑 commit SHA 或分支名稱判定必須重建。新變更、失敗且已排除原因（或有證據屬暫時性故障）、必要的不同建置目標或無法沿用產物時，才執行對應建置；正式部署如需獨立產物，依既有流程完成，不把 Preview 與正式環境混為一談。資源充裕時善用有實際用途的並行建置，不因節省額度排斥分支、PR 或必要驗證，也不以固定次數或固定順序代替判斷。Preview 由 Agent 按需使用，不以作者親自查看 Preview 作為正常合併的固定前提；交付以 main 和實際生效狀態為準。
- 先核對當下 `package.json`、`wrangler.json`、GitHub Workflows 與 Cloudflare Builds 的有效設定，再選擇實際建置、預覽及部署入口；不把舊指令當永久規格。可重用產物時避免無必要的重複建置，Build、Preview、Deploy、合併各自依實際結果回報。
- `wrangler.json` 指向既有 `lunarunes` Worker；只服務 LRS 自己的靜態資源與 API，以現有程式碼路由為準，不擴增其他用途。不擅自改 Cloudflare DNS／Access／Token／Secret／網域設定，不自行 Grant 或延長授權。
- IPA 只由 LRS GitHub Actions 的 `LRS IPA` 手動打包，不跨 Repo。iOS 素材隨 App 打包，Web 使用獨立已發布素材。
- 不為形式新增無必要的測試或檢查 Workflow；若本次問題確有必要，可新增或修改對應測試並核實結果，不因「不設額外」而禁止驗證。Cloudflare Access 等外部權限狀態以當下設定為準，不自行重建、Grant、延長權限或使用跨 Repo 大權杖。
- 保留原始素材、著作權與第三方授權；著作權修改由作者決定。

## 文字與交付
- 繁體中文說明遵循 `.agents/skills/zh-tw-writing/SKILL.md`；不干涉原創故事及符文語言。
- 完成後分別報告實際修改、測試／Build、Preview、合併、部署及畫面驗收：有做就附證據，未執行或不適用就明說；任何單層成功均不等同整體功能驗證。
