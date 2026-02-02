# ENGDEL-QREIL-PROOFS-GITIGNORE-FIX-1002-receipt

**Spawn:** ENGDEL-QREIL-PROOFS-GITIGNORE-FIX-1002  
**Objective:** Update ignore rules to allow tracking of `proofs/**/*.md` and `proofs/**/*.json`; continue ignoring secrets and heavy artifacts. Commit changes to main.

---

## Commit

| Field | Value |
|-------|--------|
| **Commit SHA** | `5763105105fba71cf38e72fc433b8a0e9217c8fb` |
| **Short SHA** | `5763105` |
| **Message** | chore(proofs): normalize proof artifacts tracking, allow proofs md/json (ENGDEL 1002) |

---

## Modified ignore files

| File path | Changes |
|-----------|---------|
| `.gitignore` (repo root) | Added negations: `!proofs/q-reil/`, `!proofs/q-reil/**`, `!proofs/**/*.md`, `!proofs/**/*.json`. Added explicit ignore for secrets/heavy: `.env`, `.env.*`, `*.tokens.json`, `.tokens.json`, `dist/`, `.vercel/`. Kept existing: `.mcp.json`, `.claude/settings.local.json`, `q-reil/`, `node_modules/`, `*.zip`. |

**Other .gitignore files:** No changes. `q-suite-ui/.gitignore`, `scripts/supabase-apply-migrations/.gitignore`, and `scripts/oauth-proof/.gitignore` do not block proofs; negation rules were not required there.

---

## Policy summary

- **Allowed:** `proofs/**/*.md`, `proofs/**/*.json`, and all contents of `proofs/q-reil/` (no `git add -f` needed).
- **Still ignored:** `.env*`, `*.tokens.json`, `.tokens.json`, `node_modules`, `dist`, `.vercel`, `*.zip`, `.mcp.json`, `.claude/settings.local.json`, and any other top-level or non-`proofs` `q-reil/` directory.
