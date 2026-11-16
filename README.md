# LunaRunes · `lrune` module

**LunaRunes is the independent Rune and game-engine repository** (module ID `lrune`). It owns card art, original Rune drawing, 2D/3D visualizations, the Effekseer/Three.js/WebAssembly effect runtime, today's local tabletop game, and the future Rune-life simulation and election-strategy games. The future games are **not implemented yet**.

## Luna module boundaries

| Module ID | Repository | Responsibility |
| --- | --- | --- |
| `loc` | [LunaCodex](https://github.com/EsotericVerse/lunacodex) | Text/culture/statistics/trace/search and canonical Scope Routing Table |
| `lrune` | **LunaRunes** | Rune data logic, original artwork, VFX and game engines |
| `las` | [LunArcus](https://github.com/EsotericVerse/lunarcus) | Luna Protocol connections, Auth/SSO/MCP and the existing unified IPA orchestration |

These are **module names**, not instructions to rename repositories or LOC's established `/lrunes/` Scope URL. LunaRunes does **not** build an IPA.

## Work in progress

The source was transferred on `migration/independent-deploy`. The ongoing work is on `work/rune-artifact-contract` (PR #1). `main` is not yet the production Rune application.

- `modules/lrune/game/` — local board-game rules and data
- `modules/lrune/draw/` — pure drawing mode and spread interpretation
- `modules/lrune/vfx/` — 3D effects, Three.js, semantic glyphs, effect mappings
- `modules/lrune/art/`, `modules/lrune/styles/` — original Rune visuals and styling
- `app/lrunes/` — compatibility imports and remaining LOC-coupled features undergoing separation
- `web/` — independent Rune Web app (Vite + React, heavy modules lazy-loaded)
- `assets/` — immutable authored Rune card and group artwork
- `contracts/` — pinned original-art integrity and artifact contracts
- `scripts/` — effect preparation and separate artifact packaging

## Commands

```bash
npm install
npm run check:lrune:core
npm run dev:web
npm run build:web
npm run art:verify
npm run artifacts:web:art
npm run artifacts:ios:art
# Only when explicitly preparing/updating the pinned effect pack:
npm run effects:prepare
npm run artifacts:web
npm run artifacts:ios
```

`dist/web-app/` contains the independent Web JavaScript, CSS and HTML; **no Rune artwork or WASM is regenerated in that build**. `dist/web/` and `dist/ios/` are separate *real file* asset exports. The iOS file export is passed to **LunArcus**, which remains the only owner of IPA packaging.

For independently hosted assets, build the Rune Web app with `VITE_LRUNE_ASSET_ORIGIN` pointing to the published Rune asset origin. This only applies to Web asset URLs; it never changes how LunArcus bundles actual files.

The standalone Web shell currently validates original-art display, the local tabletop UI, and a 3D effect demonstration. LOC's canonical drawing, daily logs, database reads, full Scope integration and Cloudflare production cutover remain migration tasks. **Do not remove LOC's current Rune build/asset paths or announce migration complete before those checks pass.**

[Engineering handoff](docs/MIGRATION-HANDOFF.md) · [Artifact contract](docs/ARTIFACT-CONTRACT.md)
