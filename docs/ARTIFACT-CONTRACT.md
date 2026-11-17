# LunaRunes independent artifact contract (migration stage)

Ownership: **LunaRunes** owns Rune images, drawing, 2D/3D modules, Effekseer, WASM, and future Rune game engines. **LunaCodex** owns the public Scope routing contract and the existing LOC Web integration. **LunaCodex** owns the complete existing App/IPA build and native packaging; **LunArcus** owns Auth/SSO/MCP communication, not IPA. This repository does not own an IPA pipeline, Auth, SSO, or MCP.

## Pinned originals

`contracts/rune-original-art.json` contains immutable Git blob SHA-1s and sizes from the pinned LOC source revision. These are not cache keys or a request to regenerate art. It now includes the **67 original numbered Rune card images**, **nine full-size group illustrations**, the exact **Rune card-back icon**, and the tracked **Effekseer attribution file**. Do not rewrite, recolor, or recompress these originals as part of the transfer.

`npm run art:verify` checks all original bytes offline. A missing or altered file fails the command. The branch PR CI performs this verification and checks both art-only deliveries without running heavy effect preparation.

## Separate products, one canonical Rune source

- `npm run artifacts:web:art` creates `dist/web/` with real original art only. It is for the separately served **Rune** Web asset origin. LOC Web must link to published Rune URLs, **not** copy these files at LOC build/deployment time.
- `npm run artifacts:ios:art` creates `dist/ios/` with the real original files. This is a file handoff to the **LOC** App/IPA build process; it is **not an IPA**, an independent native application, or a URL-only substitution.
- `npm run effects:prepare` explicitly performs pinned upstream runtime/effect preparation. It is intentionally never run by normal LOC predev/prebuild, and should be run only when the Rune effect pack needs to be produced/refreshed.
- After preparation, `npm run artifacts:web` and `npm run artifacts:ios` produce full file trees including prepared Effekseer assets and semantic icon files. They fail closed if the required runtime, effect collection, or icons are missing. No network access is performed in either artifact-export command.

Every `dist/{web,ios}/rune-artifacts.json` records the logical file paths, SHA-256 checksums, source commit, target, and whether the effect pack is included. The consumer should pin the selected Rune commit and verify the manifest before shipping. Public paths omit the source-side `public/` prefix, so `public/vendor/effekseer/effekseer.wasm` becomes `vendor/effekseer/effekseer.wasm`; nested effect textures retain their relative paths.

## Not yet certified or switched

This first contract does **not** declare the copied `app/lrunes/**` UI independent. It still references LOC internals such as Scope navigation, authorization, DB querying, and shared UI modules. The Rune standalone Web app build, independent Cloudflare Pages publishing, real MIME/CORS checks, integrated drawing/3D/game regression, canonical LOC Routing Table cutover, and LOC IPA consumption are **pending**.

Do not remove LOC's existing Rune resources or `prebuild`/ `predev` hooks until the separately published Rune runtime, canonical URLs, and iOS real-file handoff have passed functional validation. The existing site must stay operational during migration.
