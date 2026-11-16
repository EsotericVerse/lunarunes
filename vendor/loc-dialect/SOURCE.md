# LOC dialect: isolated, pinned module-only consumer

- **Owner:** `EsotericVerse/lunacodex`, `modules/loc/dialect/`
- **Source:** [LOC PR #1732](https://github.com/EsotericVerse/lunacodex/pull/1732), commit `0f6ce0af4255a5ef5122fec0419933f54fecf8ca`
- **Original source blob SHA:** `65259840058c0ef2e251f7ca59731950263f1135`
- **Package identity:** `@lo3r/loc-dialect`, private and not published.

Only the two files comprising this **single server-side dialect module** are pinned here. LRS deploys from its own Git checkout and does not clone, install, bundle or build the LOC framework. This is a deliberately versioned source snapshot until the module is published separately; syncs must be explicit, reviewed and test-verified, never silently pulled from LOC `main` at deployment time.

LRS retains its own secret `LRS_DATABASE_URL`, SQL read allowlist, fixed table/column projections, HTTP validation, error masking and Cloudflare Worker deployment. `loc:dialect` only creates the request-scoped Kysely database client. No LOC Galaxy, Z-Model, Scope, OAuth, Hero, or native packaging code is imported.
