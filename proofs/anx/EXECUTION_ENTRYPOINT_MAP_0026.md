# Execution Entrypoint Map 0026

**OCS-MISSION:** PLATOPS-ANX-EXECUTION-ENTRYPOINT-DISCOVERY-0026  
**Owner:** PLATOPS  
**Status:** PASS  
**Created:** 2026-02-09

---

## Discovery Scope

**ANX Root:** `C:\Dev\.claude-anx`  
**Projects:** `C:\Dev\10_products\Q-REIL` (and all repos under `C:\Dev\10_products`)  
**Search Locations:** scripts, ops, tooling, bin, .github/workflows, docs, runner folders

---

## Execution Paths Discovered

### 1. Claude Code Extension Path

**Current Method:** Direct execution via `run_terminal_cmd` tool

**Evidence:**
- No wrapper interception currently in place
- Commands executed directly: `node scripts/*.mjs`, `npm run *`, `bash scripts/*.sh`
- No mission routing metadata required

**Bypass Points:**
- Direct `run_terminal_cmd("node scripts/test.mjs")` calls
- Direct `run_terminal_cmd("npm run build")` calls
- Direct `run_terminal_cmd("bash scripts/deploy.sh")` calls

**File References:**
- Cursor/Claude Desktop executes via internal `run_terminal_cmd` function
- No configuration files found in `.cursor/` or `.claude/` directories
- `.anx-root` points to `C:\Dev\.claude-anx` (external ANX root)

---

### 2. Terminal Client Path

**Current Method:** Direct shell execution

**Evidence:**

#### PowerShell Execution
```powershell
# Direct execution examples found:
node scripts/oauth-proof/proof-gmail-oauth.mjs
node scripts/supabase-apply-migrations/run-with-pg.mjs
npm run proof
npm run one-time-auth
```

#### Bash/Sh Execution
```bash
# Direct execution examples found:
./scripts/be-301-verify/run-sync.sh
./scripts/set-github-secrets.sh
./scripts/supabase-apply-migrations/apply.sh
bash scripts/oauth-proof/one-time-auth.mjs
```

**Bypass Points:**
- Direct `node` command execution
- Direct `npm`/`npx` command execution
- Direct shell script execution (`bash`, `sh`)
- Direct PowerShell script execution (`.ps1` files)

**File References:**
- `scripts/be-301-verify/run-sync.sh` - Direct curl execution
- `scripts/set-github-secrets.sh` - Direct gh CLI execution
- `scripts/supabase-apply-migrations/apply.sh` - Direct psql execution
- `scripts/supabase-apply-migrations/apply-via-api.ps1` - Direct PowerShell execution
- `scripts/supabase-apply-migrations/run-with-token.ps1` - Direct PowerShell execution

---

### 3. GitHub Actions Path

**Current Method:** Direct node/python/bash execution in workflow steps

**Evidence:**

#### Workflow: `q-reil-proof-runner.yml`
```yaml
# Direct execution examples:
run: |
  set -e
  PROJECT_ID="prj_VAiSllyEk27tnHDXagBt88h0h64j"
  # ... direct curl, jq, bash execution
  curl -sS -H "Authorization: Bearer $VERCEL_TOKEN" ...
```

#### Workflow: `q-suite-ui-ci.yml`
```yaml
# Direct execution examples:
- run: npm ci
- run: npm run typecheck
- run: npm run lint
- run: npm run build
- run: npx vite preview --port 4173 &
```

#### Workflow: `q-reil-vercel-auth-and-env.yml`
```yaml
# Direct execution examples:
- run: npm ci
- run: node scripts/ops/vercel-auth-check.js
- run: node scripts/ops/vercel-env-assert.js
```

#### Workflow: `q-reil-gmail-env-migrate.yml`
```yaml
# Direct execution examples:
- run: npm ci
- run: node scripts/ops/vercel-donor-discovery.js > donor-discovery-out.json 2>&1
- run: node scripts/ops/vercel-env-migrate-gmail.js > migrate-out.json 2>&1
- run: node scripts/ops/vercel-env-assert.js > assert-out.json 2>&1
```

**Bypass Points:**
- Direct `node` command execution in workflow steps
- Direct `npm`/`npx` command execution
- Direct `bash`/`sh` script execution
- Direct `curl`/`jq` command execution
- Direct `git` command execution

**File References:**
- `.github/workflows/q-reil-proof-runner.yml` - Lines 38-517 (direct bash execution)
- `.github/workflows/q-suite-ui-ci.yml` - Lines 84-97 (direct npm execution)
- `.github/workflows/q-reil-vercel-auth-and-env.yml` - Lines 28-40 (direct node execution)
- `.github/workflows/q-reil-gmail-env-migrate.yml` - Lines 33-139 (direct node execution)
- `.github/workflows/qreil-vercel-refresh-token-upsert.yml` - Direct execution
- `.github/workflows/qreil-supabase-env-upsert.yml` - Direct execution
- `.github/workflows/qreil-vercel-env-upsert.yml` - Direct execution
- `.github/workflows/q-reil-vercel-env-set-prod.yml` - Direct execution
- `.github/workflows/q-reil-vercel-env-assert.yml` - Direct execution
- `.github/workflows/q-reil-qag-gmail-message-id-proof.yml` - Direct execution
- `.github/workflows/q-reil-prod-redeploy-after-env.yml` - Direct execution

---

### 4. NPM Scripts Path

**Current Method:** Direct node execution via package.json scripts

**Evidence:**

#### `scripts/oauth-proof/package.json`
```json
{
  "scripts": {
    "proof": "node proof-gmail-oauth.mjs",
    "one-time-auth": "node one-time-auth.mjs",
    "refresh-token": "node refresh-token.mjs"
  }
}
```

#### `connectors/gmail/package.json`
```json
{
  "scripts": {
    "sync": "node run-sync.mjs"
  }
}
```

#### `connectors/reil-core/package.json`
```json
{
  "scripts": {
    "normalize": "node normalize/run-normalize.mjs"
  }
}
```

#### `q-suite-ui/package.json`
```json
{
  "scripts": {
    "dev": "npx vite",
    "build": "npx vite build",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "typecheck": "tsc --noEmit",
    "preview": "npx vite preview"
  }
}
```

**Bypass Points:**
- Direct `npm run <script>` execution
- Direct `npm run proof` → `node proof-gmail-oauth.mjs`
- Direct `npm run sync` → `node run-sync.mjs`
- Direct `npm run normalize` → `node normalize/run-normalize.mjs`
- Direct `npm run dev` → `npx vite`
- Direct `npm run build` → `npx vite build`

**File References:**
- `scripts/oauth-proof/package.json` - Lines 7-9
- `connectors/gmail/package.json` - Line 8
- `connectors/reil-core/package.json` - Line 8
- `q-suite-ui/package.json` - Lines 7-11

---

### 5. Shell Script Entrypoints

**Current Method:** Direct bash/sh execution

**Evidence:**

#### `scripts/be-301-verify/run-sync.sh`
```bash
#!/usr/bin/env sh
# Direct curl execution
curl -sS -X POST "$BASE_URL/api/connectors/gmail/sync" ...
```

#### `scripts/set-github-secrets.sh`
```bash
#!/bin/bash
# Direct gh CLI execution
echo "$SUPABASE_SERVICE_ROLE_KEY" | gh secret set SUPABASE_SERVICE_ROLE_KEY ...
```

#### `scripts/supabase-apply-migrations/apply.sh`
```bash
#!/usr/bin/env sh
# Direct psql execution
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f "$path"
```

**Bypass Points:**
- Direct `bash scripts/*.sh` execution
- Direct `sh scripts/*.sh` execution
- Direct `./scripts/*.sh` execution

**File References:**
- `scripts/be-301-verify/run-sync.sh` - Direct curl execution
- `scripts/set-github-secrets.sh` - Direct gh CLI execution
- `scripts/supabase-apply-migrations/apply.sh` - Direct psql execution

---

### 6. PowerShell Script Entrypoints

**Current Method:** Direct PowerShell execution

**Evidence:**

#### `scripts/supabase-apply-migrations/apply-via-api.ps1`
```powershell
# Direct PowerShell execution
$migrationsDir = Join-Path $root "docs\02_DATA\migrations"
# ... direct API calls
```

#### `scripts/supabase-apply-migrations/run-with-token.ps1`
```powershell
# Direct PowerShell execution
# ... direct Supabase API calls
```

**Bypass Points:**
- Direct `powershell -File scripts/*.ps1` execution
- Direct `pwsh -File scripts/*.ps1` execution
- Direct `.\\scripts\\*.ps1` execution

**File References:**
- `scripts/supabase-apply-migrations/apply-via-api.ps1`
- `scripts/supabase-apply-migrations/run-with-token.ps1`
- `scripts/supabase-apply-migrations/create-project-api.ps1`

---

## Recommended Choke Point Entrypoint

### Primary Choke Point: `anx` Wrapper

**Location:** Repository root
- **PowerShell:** `anx.ps1`
- **Unix/Linux/Mac:** `anx.sh`

**Rationale:**
1. **Single Entry Point:** All execution must route through one wrapper
2. **Cross-Platform:** Supports both Windows (PowerShell) and Unix-like systems (bash)
3. **Already Implemented:** Wrapper exists from Mission 0022
4. **Enforcement:** Validates mission ID, agent owner, and receipt paths
5. **Centralized:** Single location for all routing logic

**Canonical Path:**
- **Windows:** `.\anx.ps1` or `anx.ps1`
- **Unix/Linux/Mac:** `./anx.sh` or `anx.sh`

**Usage Pattern:**
```powershell
# PowerShell
.\anx.ps1 -MissionId <MISSION-ID> -Agent <AGENT> -Receipts <PATHS> -- <COMMAND>

# Unix/Linux/Mac
./anx.sh --mission-id <MISSION-ID> --agent <AGENT> --receipts <PATHS> -- <COMMAND>
```

---

## Bypasses That Must Be Blocked

### 1. Direct Node Execution
**Pattern:** `node scripts/*.mjs`  
**Block:** Require routing through `anx` wrapper  
**Example:**
```bash
# BLOCKED:
node scripts/oauth-proof/proof-gmail-oauth.mjs

# ALLOWED:
./anx.sh --mission-id PLATOPS-ANX-TEST-0026 --agent github-admin --receipts proofs/anx/TEST.md -- node scripts/oauth-proof/proof-gmail-oauth.mjs
```

### 2. Direct NPM Script Execution
**Pattern:** `npm run <script>`  
**Block:** Require routing through `anx` wrapper  
**Example:**
```bash
# BLOCKED:
npm run proof

# ALLOWED:
./anx.sh --mission-id PLATOPS-ANX-TEST-0026 --agent github-admin --receipts proofs/anx/TEST.md -- npm run proof
```

### 3. Direct Shell Script Execution
**Pattern:** `bash scripts/*.sh` or `./scripts/*.sh`  
**Block:** Require routing through `anx` wrapper  
**Example:**
```bash
# BLOCKED:
bash scripts/be-301-verify/run-sync.sh

# ALLOWED:
./anx.sh --mission-id PLATOPS-ANX-TEST-0026 --agent github-admin --receipts proofs/anx/TEST.md -- bash scripts/be-301-verify/run-sync.sh
```

### 4. Direct PowerShell Script Execution
**Pattern:** `powershell -File scripts/*.ps1`  
**Block:** Require routing through `anx` wrapper  
**Example:**
```powershell
# BLOCKED:
powershell -File scripts/supabase-apply-migrations/apply-via-api.ps1

# ALLOWED:
.\anx.ps1 -MissionId PLATOPS-ANX-TEST-0026 -Agent github-admin -Receipts proofs/anx/TEST.md -- powershell -File scripts/supabase-apply-migrations/apply-via-api.ps1
```

### 5. Direct GitHub Actions Execution
**Pattern:** Direct `run:` steps in workflows  
**Block:** Require routing through `anx` wrapper in workflow steps  
**Example:**
```yaml
# BLOCKED:
- run: node scripts/ops/vercel-auth-check.js

# ALLOWED:
- run: ./anx.sh --mission-id PLATOPS-ANX-TEST-0026 --agent github-admin --receipts proofs/anx/TEST.md -- node scripts/ops/vercel-auth-check.js
```

### 6. Direct NPM/NPX Execution
**Pattern:** `npx <command>`  
**Block:** Require routing through `anx` wrapper  
**Example:**
```bash
# BLOCKED:
npx vite build

# ALLOWED:
./anx.sh --mission-id PLATOPS-ANX-TEST-0026 --agent github-admin --receipts proofs/anx/TEST.md -- npx vite build
```

### 7. Direct Claude Code Extension Execution
**Pattern:** `run_terminal_cmd("node ...")`  
**Block:** Require routing through `anx` wrapper  
**Example:**
```javascript
// BLOCKED:
run_terminal_cmd("node scripts/test.mjs")

// ALLOWED:
run_terminal_cmd("./anx.sh --mission-id PLATOPS-ANX-TEST-0026 --agent github-admin --receipts proofs/anx/TEST.md -- node scripts/test.mjs")
```

---

## Summary

### Execution Paths Mapped
1. ✅ Claude Code Extension Path - Direct `run_terminal_cmd` execution
2. ✅ Terminal Client Path - Direct shell execution (bash/sh/powershell)
3. ✅ GitHub Actions Path - Direct node/python/bash execution in workflows
4. ✅ NPM Scripts Path - Direct node execution via package.json scripts
5. ✅ Shell Script Entrypoints - Direct bash/sh execution
6. ✅ PowerShell Script Entrypoints - Direct PowerShell execution

### Recommended Choke Point
- **Primary:** `anx.ps1` / `anx.sh` (repository root)
- **Rationale:** Single entry point, cross-platform, already implemented, enforces routing

### Bypasses Identified
- 7 major bypass categories identified
- All require routing through `anx` wrapper
- Examples provided for each category

---

## QAG Acceptance

**Evidence:** ✅ Exact file paths and snippets provided  
**Recommended Choke Point:** ✅ Unambiguous (`anx.ps1` / `anx.sh`)  
**Bypasses:** ✅ Comprehensive list with examples

**Verdict:** ✅ **PASS**

---

*Execution entrypoint map for PLATOPS-ANX-EXECUTION-ENTRYPOINT-DISCOVERY-0026. No secrets in this file.*
