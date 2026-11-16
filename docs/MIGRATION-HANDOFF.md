# LunaRunes independent project — engineering handoff
Date: 2026-11-16
Scope: **LunaRunes only**. Another agent owns **LunArcus** (Auth/SSO/MCP Gateway/Extension/IPA orchestration). Do not concurrently modify that repository or deploy its Worker.

## Project boundary — settled
- **LunaCodex** remains LOC Web and owner of the canonical Scope Routing Table, text/culture/statistics/trace/search, and current live site.
- **LunaRunes** independently owns all runes, drawing, card art, 2D/3D visual effects, current standalone/local board-game code, future **模擬符文人生** and **選戰爭霸**. The latter two are *planned future web games*, do not describe them as completed.
- **LunArcus** is the Luna Protocol connection/orchestration project, owned by another agent.
- One integrated user-facing entry and routing contract does **not** mean one build/deployment. Do not create a fourth repository for iOS or a separate Rune IPA.
- **Web** must reference Rune image/VFX URLs **from independently published Rune assets**, without copying/downloading/regenerating those resources during LOC Web builds.
- **iOS** must contain real, local files and required Rune functionality in the one LOC IPA produced through the cross-repo orchestration. **Do not replace iOS assets with browser URL-only links**. Use pinned source/artifact revisions.

## Verified GitHub state at handoff
- Source snapshot: `EsotericVerse/lunacodex`, `main` **b7521860cbabb93f8d7c56d7c849a832d4251086** (source used in migration snapshot, not a guarantee main never advances).
- `EsotericVerse/lunarunes` `main`: **e255b7a3a56cc5ec648e0d4c135065604faa8579** (LICENSE only at inspection).
- `EsotericVerse/lunarunes` `migration/luna-protocol-separation`: **f6567680cf5293d1d71e0cbb3ba34bbd9970ace9**.
- `EsotericVerse/lunarunes` `migration/independent-deploy`: initially branched at the same **f6567680...**; contains the imported snapshot; handoff doc committed here.
- Migrated snapshot contains **301 tracked files**, including **67** original `assets/lunarunes/cards/00.png`–`66.png` card art files, `assets/pics/**`, `app/lrunes/**`, the tracked Effekseer notice/resources, and scripts to prepare pinned runtime assets. **Do not edit or rename the original card art.**
- Existing one-shot source migration workflow: `.github/workflows/migrate-luna-source.yml`, locked to the source SHA. It is a snapshot importer, **not** the final Rune deployment workflow.
- Critical **not yet done**: no `package.json`, no `next.config.mjs`, no standalone LunaRunes site built, no Rune Cloudflare deployment, no LOC Web cutover, no independent iOS artifact contract.

## Runtime dependencies that need refactoring, not naive deletion
- `app/lrunes/RunesClient.jsx` imports LOC modules for Scope navigation, auth session display, blocks, and editable hero.
- `app/lrunes/RuneUnifiedView.jsx` and `app/lrunes/game/GameBoard.jsx` import LOC-local `packages/zenstack/client-queries` resource-clearing helpers.
- Several Rune 2D/3D/list/daily screens import `app/loc/**`, `app/modular/**`, `packages/zenstack/**`, and `app/seo/**`; isolate into versioned Luna Protocol interfaces, migrate necessary minimal UI/shared packages, and keep ACL/data operations explicit.
- `app/lrunes/rune-directory.mjs` currently points to `LOC_ORIGIN` for Web cards; do not extrapolate that into an iOS URL-only rule.
- `app/lrunes/effekseer/EffekseerStage.jsx` loads `/vendor/effekseer/effekseer.js`, `effekseer.wasm`, effect files, and referenced nested textures. Remote hosting must account for nested relative effect assets, WASM MIME, and CORS.
- `scripts/prepare-rune-runtime-assets.mjs` orchestrates six jobs including pinned imports + sharp derivatives. Make this Rune-only and change LOC Web `prebuild/predev` **only after** independent published art and functional browser routing are verified.
- `app/modular/routing/scope-registry.js` in LunaCodex explicitly recognizes `/lrunes/**`, as does iOS static navigation. Preserve canonical URL behavior through an actual routing edge/redirect/proxy contract.
- Existing `app/lrunes/game/**` is a local board game; do not conflate it with the future two games.

## Acceptance and execution order
1. Refresh the source `main` and identify other agents' edits; do not revert or overwrite them.
2. Add standalone Rune package/build/runtime configuration, independently run syntax/build checks without depending on copied LOC application.
3. Keep Rune cards/group art and third-party `public/vendor/effekseer/NOTICE.txt` attribution intact; produce verifiable artifact manifests with pinned checksums.
4. Configure independently served Rune Web/static assets and selective deployment from Rune `main` **without branch previews**. Only publish changed output when needed; avoid routine regeneration of immutable assets.
5. Adapt LOC Web reference paths and navigation to published Rune application/assets only **after** URL/effekseer regression checks. Keep the canonical Scope Routing Table owned by LunaCodex; no duplicates.
6. Supply LunArcus agent with a versioned, immutable Rune Web/iOS artifacts contract; iOS requires actual source/artifact files included during its existing unified IPA process.
7. Verify card draw 2D/3D, daily draw, atlas/list, current board game, mobile navigation, Scope access, asset MIME/CORS, iOS bundle 67 cards. Only then remove redundant LOC Web Rune preparation and old code with narrow, reversible PRs.

## Safety / collaboration
- No Cloudflare Auth/SSO/Worker/Secrets changes from the Rune agent.
- No new IPA or iOS deployment workflow in Rune.
- Do not treat a successful Preview build as complete validation; user keeps previews disabled.
- No mass rollback or unrelated refactor of LOC directories, routing, RLS, SQL Portable, or other concurrent agents' work.
- Use standalone `lunarunes` branches and reviewed PRs; do not merge incomplete Rune build into its `main`.


## 2026-11-16 continuation — lrune module and independent build

The original verified snapshot described above remains immutable as the migration
baseline. The follow-on work is at `work/rune-artifact-contract`, PR #1
(base: `migration/independent-deploy`), **not on Rune main or LOC main**.

- Module identifiers: `lrune` = LunaRunes, `las` = LunArcus, `loc` =
  LunaCodex. They do not rename the repositories or LOC's canonical `lrunes`
  Scope route. Only `lrune` is implemented in this repository.
- `modules/lrune/` now owns pure board-game and reading engines,
  the Effekseer / Three.js VFX implementation, and Rune CSS. The old
  `app/lrunes/**` paths retain small compatibility re-exports/imports.
- `web/` is the **independent Vite 8 / React 19 Web build** with lazy Rune
  game and 3D demo routes; `npm run build:web` produces `dist/web-app/`.
  This build does not bundle original card images, WASM, or VFX resources.
- `contracts/rune-original-art.json` pins 67 cards, nine group illustrations,
  Rune card-back art and Effekseer license attribution; Web and iOS real-file
  asset artifact outputs use distinct `dist/web/` and `dist/ios/` directories.
  `npm run art:verify` and both art-only deliveries passed GitHub CI.
- Independent Web compilation + game-engine smoke test passed GitHub CI.
  Art/Effekseer **runtime playback**, HTTP asset MIME/CORS, a real browser,
  full drawing/data/Scope parity, iOS IPA consumption, and Cloudflare live
  deployment **are not yet verified**.
- `app/lrunes` remains partially coupled to LOC for Silver table reads,
  daily log, Scope home block editing, navigation and charts. Do not remove
  LOC preparation, do not switch production routes, and do not merge this
  work to `main` until all functional acceptance checks are satisfied.
- LunArcus Auth/SSO/MCP/IPA integration remains exclusively owned by its
  separate Agent. The `lrune` module provides file artifacts; it does not
  create another IPA pipeline.

Latest verified CI:
- Web engine/build: https://github.com/EsotericVerse/lunarunes/actions/runs/43803453445
- Original art: https://github.com/EsotericVerse/lunarunes/actions/runs/43803453521
