# LunaRunes — modular Rune and game engine

This repository owns the **lo3r@lrs · LunaRunes (lrs)** modules. The canonical, user-selected logical identifiers are:

| Module | Responsibility | Code |
| --- | --- | --- |
| `lrs:rune` | 66 Rune foundation, groups, canonical image identity, source artwork, Three.js/Effekseer/WASM resources | `modules/lrs/rune/` |
| `lrs:boardgame` | Existing local tabletop rules and gameplay | `modules/lrs/boardgame/` |
| `lrs:card` | Card draw algorithms, directions, spreads, moon-phase readings and card text composition | `modules/lrs/card/` |
| `lrs:daily` | Daily Rune records, moon calendar and daily-data contract | `modules/lrs/daily/` |

**SQL is not owned by LRS.** LOC's `loc:dialect` supplies `readRows` and the ZModel-backed column projector to `lrs:card`. The card module does not import database drivers, credentials, LOC authorization or SQL transports.

`LunaCodex` retains the canonical `/lrunes/` Scope routing and Web integration. `LunArcus` owns Luna Protocol, Auth/SSO/MCP and the existing IPA orchestration. LRS provides actual local artifact files for LunArcus, but never builds another IPA.

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

The historical `modules/lrune/**` and `app/lrunes/**` entry paths currently contain compatibility exports. They are not the primary implementation or new module IDs.

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

`dist/web-app` is the standalone Vite/React Web code output; it deliberately excludes original art and WASM. `dist/web` is independently publishable Web asset output, while `dist/ios` consists of the real files handed to LunArcus. Neither artifact exporter touches LOC's deployment.

`VITE_LRS_ASSET_ORIGIN` selects an independently published Rune Web asset origin; the earlier `VITE_LRUNE_ASSET_ORIGIN` is temporarily supported as a migration alias.

## Migration status

Work is on `work/rune-artifact-contract` under PR #1 based on `migration/independent-deploy`. No standalone Rune Cloudflare publishing or LOC live cutover has yet occurred.

LRS `lrs:card` and the LOC `loc:dialect` adapter exist in separate work branches; an integrated LOC import must await a version-pinned LRS delivery and functional validation. Current production drawing, Scope data, daily log and database routing remain untouched. **Do not** remove LOC's heavy Rune prebuild until the full live Rune cutover is verified.

The future Rune-life simulation and election-strategy games remain planned; they are not yet implemented.

[Engineering handoff](docs/MIGRATION-HANDOFF.md) · [Asset integrity/hand-off contract](docs/ARTIFACT-CONTRACT.md)

The canonical three-way architecture and precise IDs `lo3r@loc`, `lo3r@lrs`, `lo3r@las` are documented in [Luna Module Architecture](docs/LUNA-MODULE-ARCHITECTURE.md).

For the existing Cloudflare Worker `lunarunes`, the independent release commands are `npm run build:cloudflare`, `npm run check:cloudflare:release`, and `npm run deploy:cloudflare:dry-run` before enabling a real release. See [Cloudflare deploy](docs/CLOUDFLARE-DEPLOY.md).
