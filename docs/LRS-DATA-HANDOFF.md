# LRS-only data handoff and cutover

This file governs **LunaRunes only**. It does not change any other repository,
database, SQL dialect implementation, cloud resource, permission or Worker.

## Data ownership

`contracts/lrs-data-ownership.json` is the sole handoff allowlist:

| Data | Identity | Exposure on existing LRS Worker |
| --- | --- | --- |
| `runes` | `rune_id` | Public read, field-limited |
| `runes_etc` | `rune_id + dir + type + current_moon` | Public read, field-limited |
| `runes_group` | `group_id` | Public read, field-limited |
| `lrunes_blocks` | `uid` | Only the existing public Hero reader |
| `lrunes_daily` | `record_id` | **Private; no public read/write endpoint** |
| `lrunes_anchor` | `uid` | **Private; no public read/write endpoint** |
| `lrunes_galaxy` | `uid` | **Private; no public read/write endpoint** |

The last three types are **not** authorized for public Worker access. A
later, independently verified LRS account/authorization gate is required before
private data can be activated. An export bundle grants no permissions.

## Owner-controlled migration procedure

1. The owner decides which database is the LRS source, which is the LRS
   destination, which engine to use, and when the destination becomes active.
   Existing `LRS_DATABASE_URL` and all other live bindings remain unchanged
   until then. Neither LRS code nor agents select an URL or create a database.
2. Using the owner's own approved read/export procedure, prepare exactly seven
   **UTF-8 JSONL** files in a local folder:
   `runes.jsonl`, `runes_etc.jsonl`, `runes_group.jsonl`,
   `lrunes_blocks.jsonl`, `lrunes_daily.jsonl`,
   `lrunes_anchor.jsonl`, `lrunes_galaxy.jsonl`. Each nonempty line is a
   JSON object with the contract's original primary key. Export all rows in
   the selected LRS scope; never mix in other systems' tables.
3. Run `node scripts/lrs-data-handoff.mjs pack <source-jsonl-folder>
   <source-bundle-folder>`. It validates the full table allowlist,
   primary-key uniqueness and known baseline counts (67 Rune definitions,
   nine groups), and writes an immutable-content fingerprint manifest.
   It **does not connect to PostgreSQL, MSSQL, LOC or LAS**.
4. After the owner separately imports those records into an isolated target,
   export the same seven tables from that target. Run
   `node scripts/lrs-data-handoff.mjs pack <target-jsonl-folder>
   <target-bundle-folder>`.
5. Run `node scripts/lrs-data-handoff.mjs compare <source-bundle-folder>
   <target-bundle-folder>`. It verifies source and target counts, identities
   and content hashes. Row order does not matter; differing data **fails**.
   No private record bodies are logged.
6. Successful parity is **necessary, not sufficient**, for production
   cutover. Separately verify target schema/data types, application
   functionality, authorization for private records, rollback plan and
   the owner's explicit switch decision. Do not delete the source or
   activate the new target automatically.

For an existing snapshot, `node scripts/lrs-data-handoff.mjs verify
<bundle-folder>` checks the source files against their manifest.

### Security and code boundaries

- Keep private export folders **outside the repository** or under ignored
  `.lrs-data-transfer/`; never commit JSONL or database URLs.
- The handoff uses Node standard libraries only and is engine-neutral;
  PostgreSQL/MSSQL adapter implementation is **not** part of this task.
- The current Worker public read allowlist remains restricted to four table
  families and existing Hero restrictions. Migration does not enable
  `lrunes_daily`, `lrunes_anchor` or `lrunes_galaxy` on that endpoint.
- LRS game/reading/daily business code must consume an LRS-owned data port;
  do not depend on another repository's source code, connection string,
  session, grant, database switch or data migration.
- No automatic grants, background import, cross-repo writes, new Workers,
  dev/Preview deployments, schema DDL, SQL dialect tests or secret reads.
- This tooling cannot actually export, import or cut over a real DB by
  itself. Real movement must wait for the operator-controlled endpoints and
  the authenticated private-data API; **do not treat manifest parity as
  proof of online functional parity**.
