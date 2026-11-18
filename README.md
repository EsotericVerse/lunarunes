# LunaRunes — modular Rune and game engine

This repository owns the **lo3r@lrs · LunaRunes (lrs)** modules. The canonical, user-selected logical identifiers are:

| Module | Responsibility | Code |
| --- | --- | --- |
| `lrs:rune` | 66 Rune foundation, groups, canonical image identity, source artwork, Three.js/Effekseer/WASM resources | `modules/lrs/rune/` |
| `lrs:boardgame` | Existing local tabletop rules and gameplay | `modules/lrs/boardgame/` |
| `lrs:card` | Card draw algorithms, directions, spreads, moon-phase readings and card text composition | `modules/lrs/card/` |
| `lrs:daily` | Daily Rune records, moon calendar and daily-data contract | `modules/lrs/daily/` |

**SQL is not owned by LRS.** LOC's `loc:dialect` supplies `readRows` and the ZModel-backed column projector to `lrs:card`. The card module does not import database drivers, credentials, LOC authorization or SQL transports.

`LunaCodex` retains the canonical `/lrunes/` Scope routing and Web integration. `LunArcus` owns Auth/SSO/MCP and cross-system communication. **LunaCodex alone owns the existing complete App/IPA build.** LRS provides immutable source and real Rune files to LOC, but never builds an IPA.

## Package consumption

The published **logical module IDs** contain a colon; portable JavaScript module import paths use package subpaths:

```js
import {runeImage} from 'lrs/rune';                 // lrs:rune
import {createLunaRunesGame} from 'lrs/boardgame'; // lrs:boardgame
import {createCardModule} from 'lrs/card';         // lrs:card
import {createDailyModule} from 'lrs/daily';       // lrs:daily
// LOC-side:
// import {createLocRuneCardDialect} from './modules/loc/dialect/lrs-card.mjs';
// const draw = createCardModule(createLocRuneCardDialect());
```

These are import contracts, not a claim that LOC already installs an independently released LRS package. The package is still undergoing migration and is **not published to production**.

The package `files` whitelist excludes generated Web output, immutable artwork, Effekseer effect binaries and WASM. 3D/React/Sharp dependencies are optional peers or project build-only dependencies, not required for a consumer of the pure `lrs/card` module.

`modules/lrs/**` owns Rune business implementation; `app/lrunes/**` contains the original Rune UI and LOC native handoff entries. The retired `modules/lrune/**` duplicate path must not be restored.

## Build and verification

```bash
npm install
npm run check:lrs:modules
npm run check:lrs:consumer
npm run check:lrs:package
npm run dev:web
npm run build:web

npm run art:verify
npm run artifacts:web:art
npm run artifacts:ios:art

# Heavy effects preparation is explicit and Rune-owned:
npm run effects:prepare
npm run artifacts:web
npm run artifacts:ios
```

`dist/web-app` is the standalone Vite/React Web code output; it deliberately excludes original art and WASM. `dist/web` is independently publishable Web asset output, while `dist/ios` consists of real files consumed by **LOC's existing IPA build**. Neither artifact exporter touches LOC's deployment.

`VITE_LRS_ASSET_ORIGIN` selects an independently published Rune Web asset origin; the earlier `VITE_LRUNE_ASSET_ORIGIN` is temporarily supported as a migration alias.

## Repository ownership and release

LRS owns the rune, card, daily and board-game implementation and its original art, effects and Web assets. LOC owns the canonical Scope integration and the sole App/IPA pipeline; LAS owns Auth, OAuth, MCP and Plugins. The current working contract comes from the code, release manifest and tests, not dated migration notes.

Web release assets are assembled by `scripts/assemble-rune-cloudflare.mjs` from `dist/web-app` and `dist/web`; a standalone release must preserve image paths, Effekseer files, WASM and their checksums. Run `npm run build:cloudflare`, `npm run check:cloudflare:release` and `npm run deploy:cloudflare:dry-run` to validate without publishing. The existing `lunarunes` Worker is deployed independently; ordinary LRS releases do not trigger LOC deployment.

For the LOC iOS handoff, `npm run artifacts:ios` produces real files and an artifact manifest. LOC pins the LRS source revision and verifies checksums; iOS assets cannot be replaced with Web URLs. Web and iOS are separate deliveries from the same Rune source.

The authoritative release label is `release/version.json`. It is distinct from the Git commit SHA and from the media checksum. Original artwork identity and attribution are pinned by `contracts/rune-original-art.json`. Migration-era details remain traceable via Git history and the private engineering archive rather than duplicated `docs/` files.

The board-game engine and future game features must be judged from their actual modules and runnable UI; a planned feature is not automatically playable just because its contract or engine exists.
