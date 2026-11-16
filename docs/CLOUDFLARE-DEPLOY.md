# Independent LunaRunes Cloudflare Worker

This uses the **existing Cloudflare Worker named `lunarunes`** created by the owner, separate from LOC's `loc` Pages project. It is not an Auth, SSO, MCP or IPA service.

LRS produces two independent components: the Vite Web code in `dist/web-app`, and the pinned authored Rune images/Effekseer/WASM asset pack in `dist/web`. Only the LRS release step combines them into `dist/cloudflare` for the standalone Worker. The LOC build must never invoke this pipeline.

## Cloudflare Workers Builds settings

- Repository: `EsotericVerse/lunarunes`
- Build command: `npm run build:cloudflare`
- Deploy command: `npm run deploy:cloudflare` (uses `wrangler.jsonc` and static assets-only mode)
- Root: `/`
- Node.js: 24 (required by the cf toolchain)
- Git branch: use migration staging until full Rune functional validation, then release from the approved main branch
- No LOC Pages project or LOC automatic deploy setting is changed

The source has `wrangler.jsonc` targeting `lunarunes`. Source builds run `effects:prepare` explicitly **in this LRS repo only**; the effects are not processed in LOC's `prebuild` or `predev`.

```sh
npm install
npm run check:lrs:modules
npm run check:lrs:consumer
npm run build:cloudflare
npm run deploy:cloudflare
```

`scripts/assemble-rune-cloudflare.mjs` validates the checksum manifest of each delivered original/effect asset and preserves the published paths used by card UI and 3D effects. It explicitly maps original `assets/pics/*.jpg` to the runtime URL `pics/*.jpg`; it never rewrites the source art.

**Do not change the current `lrunes.lo3rwang.cc` routing, remove LOC Rune asset preparation, or move the published Scope Routing Table until this Worker delivers a complete Rune app, all 67 card URLs, Effekseer WASM and effect textures with correct MIME, and full 2D/3D/daily function parity.** LRS does not package IPA/APK; LunArcus handles that.

The `wrangler.jsonc` matches the existing Cloudflare Worker deployment command `npx wrangler deploy`. It serves the independently assembled `dist/cloudflare` static assets. There is no duplicate `cf` configuration. A newly created Worker may initially have workers.dev disabled and no Git build trigger; verify and enable independently after Cloudflare Git connection exists. Do not reuse LOC's build token or connect LRS to the LOC Pages project.

## Verified Cloudflare environment (2026-11-16, corrected)

The owner already configured the Cloudflare Worker `lunarunes`, connected GitHub repository `EsotericVerse/lunarunes`, and created the dedicated `lunarunes build token`. These are existing resources, **not missing resources**, and should not be recreated.

Correct inspection **requires the Worker internal `tag`**, not the Worker name: GET `/accounts/{account_id}/builds/workers/{script_tag}`. The earlier 404 was caused by querying the wrong identifier; do not treat it as a missing repository connection. `workers-ci.write` may still be required for the *connector's* build-config PATCH operation, but that is not evidence the owner omitted the Git connection.

At the last inspection, the build config points to `main` (which does not yet contain the release code), had an empty build command, deployed via `npx wrangler deploy`, used its dedicated build token and caching, and had `auto_build_enabled:false`. Preserve auto-build disabled until the release candidate has passed independent dry-run and live smoke checks.

For independent testing, the **candidate branch** is `work/rune-artifact-contract`; do not silently publish the partial `main` branch. After testing, merge through the intended migration PR and set production branch deliberately. Do not change LOC Pages, LOC Auth, or existing SSO/Worker tokens.

Local/CI verification, no Cloudflare write:

```sh
npm install
npm run check:lrs:modules
npm run check:lrs:consumer
npm run build:cloudflare
npm run check:cloudflare:release
npm run deploy:cloudflare:dry-run
```

The real `npm run deploy:cloudflare` command must only execute after those checks pass and the independent Worker release is approved. Real iOS files still go through LunArcus' existing IPA packaging flow; no web URL substitute or new IPA workflow.
