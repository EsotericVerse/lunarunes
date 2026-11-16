# Independent LunaRunes Cloudflare Worker

This uses the **existing Cloudflare Worker named `lunarunes`** created by the owner, separate from LOC's `loc` Pages project. It is not an Auth, SSO, MCP or IPA service.

LRS produces two independent components: the Vite Web code in `dist/web-app`, and the pinned authored Rune images/Effekseer/WASM asset pack in `dist/web`. Only the LRS release step combines them into `dist/cloudflare` for the standalone Worker. The LOC build must never invoke this pipeline.

## Cloudflare Workers Builds settings

- Repository: `EsotericVerse/lunarunes`
- Build command: `npm run build:cloudflare`
- Deploy command: `npx cf deploy dist/cloudflare` (uses `cloudflare.config.ts` and static assets-only mode)
- Root: `/`
- Node.js: 24 (required by the cf toolchain)
- Git branch: use migration staging until full Rune functional validation, then release from the approved main branch
- No LOC Pages project or LOC automatic deploy setting is changed

The source has `cloudflare.config.ts` targeting `lunarunes`. Source builds run `effects:prepare` explicitly **in this LRS repo only**; the effects are not processed in LOC's `prebuild` or `predev`.

```sh
npm install
npm run check:lrs:modules
npm run check:lrs:consumer
npm run build:cloudflare
npx cf deploy dist/cloudflare
```

`scripts/assemble-rune-cloudflare.mjs` validates the checksum manifest of each delivered original/effect asset and preserves the published paths used by card UI and 3D effects. It explicitly maps original `assets/pics/*.jpg` to the runtime URL `pics/*.jpg`; it never rewrites the source art.

**Do not change the current `lrunes.lo3rwang.cc` routing, remove LOC Rune asset preparation, or move the published Scope Routing Table until this Worker delivers a complete Rune app, all 67 card URLs, Effekseer WASM and effect textures with correct MIME, and full 2D/3D/daily function parity.** LRS does not package IPA/APK; LunArcus handles that.

The `cloudflare.config.ts` is deliberately the new `cf` CLI configuration (not a duplicate Wrangler config). A newly created Worker may initially have workers.dev disabled and no Git build trigger; verify and enable independently after Cloudflare Git connection exists. Do not reuse LOC's build token or connect LRS to the LOC Pages project.

## Verified Cloudflare environment (2026-11-16)

The owner created a **Worker**, not a Pages project. The authenticated Cloudflare account reports an existing `lunarunes` Worker and a dedicated `lunarunes build token`. However the Worker currently has **no Workers Builds configuration or Git trigger**, and both `workers.dev` and Worker previews are disabled.

An attempt to register `EsotericVerse/lunarunes` with the Workers Builds repository connection API returned **HTTP 403** because this connector lacks `workers-ci.write` (Workers CI Write). The API explicitly requests reconnecting with that scope. No existing LOC Pages project, tokens, DNS, Worker source, or Auth configuration were modified.

To enable Cloudflare's own independent build:
1. Reconnect the Cloudflare integration granting **Workers CI Write**, or finish **lunarunes Worker → Settings → Builds → Connect → GitHub** in Cloudflare.
2. Choose `EsotericVerse/lunarunes`, use the migration branch while testing, root `/`, build command `npm run build:cloudflare`, deploy command `npx cf deploy dist/cloudflare`, Node.js 24, and the **existing lunarunes Build Token**.
3. Inspect the first live build and check card assets, `.wasm` MIME, Effekseer textures, dynamic game code, and permissions. Only then enable public access and route LOC asset links to the published Rune Worker.

A successful GitHub CI Vite compilation is not a successful Cloudflare Worker release. The dedicated Worker has **not yet been connected or deployed** by this branch.
