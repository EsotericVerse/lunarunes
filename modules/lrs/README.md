# LunaRunes private module · `@lo3r/lrs`

This is an **internal, not published** npm-style package under the existing LRS
repository. The root `package.json` remains the independent LunaRunes Web Worker;
this nested package contains the source-only `lrs:rune`, `lrs:card`,
`lrs:daily` and `lrs:boardgame` modules.

The module is marked `"private": true`. **Never run npm publish**. Neither
LOC nor LAS updates automatically when its `version` changes.

## Internal development use

Local adjacent checkouts may use an explicit file dependency, for example:

```json
{
  "dependencies": {
    "@lo3r/lrs": "file:../lunarunes/modules/lrs"
  }
}
```

Then import from `@lo3r/lrs/rune`, `@lo3r/lrs/card`,
`@lo3r/lrs/daily`, or `@lo3r/lrs/boardgame`.

**Important:** `file:` is for local development, NOT a portable Cloudflare
build dependency and NOT an immutable version pin. To use this package in
a remote CI build, the consumer must obtain an intentionally selected LRS
revision through its existing authorized source checkout and install from that
folder. No website deployment, registry publication, global npm installation,
or cross-project automatic update is involved.

The module has **no SQL driver** dependencies. PostgreSQL access remains the
separate LRS Worker concern; LOC owns its own portable SQL dialect modules.

Images, Effekseer, WASM and the card PDF stay in LRS's separately built assets,
not this package. LAS retains its real-file IPA artifact handoff.
