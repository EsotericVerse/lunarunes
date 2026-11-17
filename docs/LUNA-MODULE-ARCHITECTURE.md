# lo3r 三分天下 · Module Architecture

Formal system identities are `lo3r@loc`, `lo3r@lrs`, `lo3r@las` (not email addresses, npm package names, or replacements for existing domains/routes). The internal prefixes are `loc`, `lrs`, and `las`.

| Identity | Project | Positioning | Implemented module namespace |
| --- | --- | --- | --- |
| `lo3r@loc` | **LunaCodex（月典／玄鑒）** | **Language of Codex** · 語言典鑒框架 | `loc` |
| `lo3r@lrs` | **LunaRunes（月符／符韻）** | **Symbolic Language Galaxy** · 符號式語言星系 | `lrs` |
| `lo3r@las` | **LunArcus（虹月）** | Former Galaxy-Link; Luna Protocol bridge | `las` |

## loc — LunaCodex
`loc:galaxy` (ZModel Galaxy and Anchor) · `loc:time` · `loc:locus` · `loc:site` · `loc:dialect`.

LOC owns SQL compilation, physical driver dialects, ZModel field projection, database routing, authorization, and the existing Scope Routing Table. Cross-module data access must be an explicit port, not a SQL client copied into a Rune package.

## lrs — LunaRunes
`lrs:rune` (Rune foundation and assets) · `lrs:boardgame` (local tabletop) · `lrs:card` (card draw, spreads, reading) · `lrs:daily` (daily Rune records, calendar, trend and transfer).

- `lrs:card` accepts a read-only port supplied by LOC `loc:dialect` and keeps the card calculation in LRS.
- `lrs:daily` is a **sibling** of `lrs:card`. Its pure moon-river behavior and host-injected read/time contract are under `modules/lrs/daily`. The full LOC-coupled daily UI, analytics, remote writes and transfer handling are not yet moved or deployed.
- `lrs:rune` owns original card images and the Effekseer/Three.js/WASM content. Building the lightweight `lrs/card` import does **not** include 3D art or effect binaries.
- `lrs:boardgame` owns its own game rules; planned Rune-life simulation and election-strategy games are future work.

## las — LunArcus
`las:auth` · `las:plugins` (including extension) · `las:mcp` · `las:tunnel` (cross-system communication). **LOC exclusively owns the App/IPA packaging**, not LAS.

LAS development is assigned to another Agent; this migration does not alter LAS, its SSO or MCP. The Rune repository exports version-pinned source and real assets for **LOC** to consume during its existing App/IPA build.

## Delivery and migration constraints
LOC Web links to separately deployed Rune art/VFX URLs; LOC iOS packages actual Rune files from a pinned LRS revision through LOC's existing IPA workflow. Existing LOC routing remains canonical, the existing `/lrunes/` Scope URL stays intact, and the legacy `lrune` namespace is only a temporary compatibility facade.

The LRS branch `work/rune-artifact-contract` is still a Draft PR against `migration/independent-deploy`, not production. The LOC `loc:dialect` adapter is in its own work branch. Do not remove LOC's current build preparation or switch production URLs until independent deployment and behavioral parity are verified.
