# ENGDEL-QREIL-PROOFS-GITIGNORE-AUDIT-1001

**Spawn:** ENGDEL-QREIL-PROOFS-GITIGNORE-AUDIT-1001  
**Objective:** Locate all `.gitignore` files affecting proofs; identify rules that ignore `proofs/`, `q-reil/proofs/`, or broad patterns matching proofs.

---

## 1. .gitignore files in repo

| File path | Scope |
|-----------|--------|
| `.gitignore` | Repo root |
| `q-suite-ui/.gitignore` | q-suite-ui only |
| `scripts/supabase-apply-migrations/.gitignore` | That script dir only |
| `scripts/oauth-proof/.gitignore` | That script dir only |

---

## 2. Rules affecting proofs

### 2.1 Repo root `.gitignore`

**Full path:** `.gitignore`

**Exact ignore lines:**

```
# MCP configuration with secrets
.mcp.json

# Claude local settings
.claude/settings.local.json
q-reil/
node_modules/
*.zip
```

**Effect on proofs:**

- **`q-reil/`** — In Git, this pattern matches **any** directory named `q-reil` anywhere in the tree. So **`proofs/q-reil/`** is ignored (all contents under `proofs/q-reil/` are untracked unless force-added).
- **`proofs/`** — Not present; top-level `proofs/` is **not** ignored by root `.gitignore`.
- **`*.zip`** — Would ignore any `proofs/**/*.zip`; no impact on `.md`/`.json` receipts.

**Verification:**  
`git check-ignore -v proofs/q-reil/ENGDEL-QREIL-PROOFS-GITIGNORE-AUDIT-1001.md` → `.gitignore:6:q-reil/` (file is ignored).

### 2.2 q-suite-ui/.gitignore

**Full path:** `q-suite-ui/.gitignore`

**Exact ignore lines:** (relevant subset)

```
node_modules
dist
dist-ssr
*.local
.env.local
.env*.local
.tokens.json
.vercel
```

**Effect on proofs:**

- No `proofs/`, `q-reil/`, or `proofs`-related patterns. Proofs live under repo root `proofs/`, not under `q-suite-ui/`, so this file does **not** block proof tracking.

### 2.3 scripts/supabase-apply-migrations/.gitignore

**Lines:** `.env`, `.env.local`

**Effect on proofs:** None (no proofs under this path).

### 2.4 scripts/oauth-proof/.gitignore

**Lines:** `.tokens.json`, `.env`, `.env.local`, `node_modules/`

**Effect on proofs:** None (no proofs under this path).

---

## 3. Summary

| Location | Rule | Blocks proofs? |
|----------|------|-----------------|
| Root `.gitignore` | `q-reil/` | **Yes** — `proofs/q-reil/**` is ignored |
| Root `.gitignore` | `proofs/` | N/A (not present) |
| q-suite-ui/.gitignore | — | No proof-related rules |
| scripts/*/.gitignore | — | No proof-related rules |

**Conclusion:** The only rule that affects proof artifact tracking is **root `.gitignore` line 6: `q-reil/`**. It causes all content under `proofs/q-reil/` (and any other `q-reil/` directory) to be ignored, requiring `git add -f` to track receipts. No other `.gitignore` in the repo explicitly references `proofs/` or `q-reil/proofs/`.
