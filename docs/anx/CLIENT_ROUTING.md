# Client Routing Configuration

**OCS-MISSION:** PLATOPS-ANX-CLIENT-ROUTING-PATCH-0028  
**Owner:** PLATOPS  
**Status:** Implemented  
**Version:** 1.0.0

---

## 1. Overview

This document describes how to configure Claude Code extension and terminal clients to route all execution through the choke point wrapper (`anx`), ensuring compliance with mission routing requirements.

---

## 2. Objective

Make Claude Code extension and terminal client call the choke point wrapper, not raw mission execution.

---

## 3. Choke Point Wrapper

**Location:** Repository root
- **PowerShell:** `anx.ps1`
- **Unix/Linux/Mac:** `anx.sh`

**Usage:**
```powershell
# PowerShell
.\anx.ps1 -MissionId <MISSION-ID> -Agent <AGENT> -Receipts <PATHS> -- <COMMAND>
```

```bash
# Unix/Linux/Mac
./anx.sh --mission-id <MISSION-ID> --agent <AGENT> --receipts <PATHS> -- <COMMAND>
```

---

## 4. Claude Code Extension Routing

### 4.1 Current State

**Direct Execution Pattern:**
```javascript
run_terminal_cmd("node scripts/test.mjs")
run_terminal_cmd("npm run build")
run_terminal_cmd("bash scripts/deploy.sh")
```

**Problem:** Commands execute directly without mission routing.

### 4.2 Required Change

**Routed Execution Pattern:**
```javascript
run_terminal_cmd("./anx.sh --mission-id PLATOPS-ANX-TEST-0028 --agent github-admin --receipts proofs/anx/TEST.md -- node scripts/test.mjs")
run_terminal_cmd("./anx.sh --mission-id PLATOPS-ANX-TEST-0028 --agent github-admin --receipts proofs/anx/TEST.md -- npm run build")
run_terminal_cmd("./anx.sh --mission-id PLATOPS-ANX-TEST-0028 --agent github-admin --receipts proofs/anx/TEST.md -- bash scripts/deploy.sh")
```

**Solution:** All commands must route through `anx` wrapper.

### 4.3 Enforcement

**Detection:** Script `scripts/anx/detect-claude-code-execution.mjs` detects direct execution by checking for mission routing environment variables.

**Blocking:** If mission routing metadata is missing, execution is blocked with error message.

---

## 5. Terminal Client Routing

### 5.1 Current State

**Direct Execution Patterns:**
```bash
# Direct node execution
node scripts/oauth-proof/proof-gmail-oauth.mjs

# Direct npm execution
npm run proof

# Direct shell script execution
bash scripts/be-301-verify/run-sync.sh

# Direct PowerShell execution
powershell -File scripts/supabase-apply-migrations/apply-via-api.ps1
```

**Problem:** Commands execute directly without mission routing.

### 5.2 Required Change

**Routed Execution Patterns:**
```bash
# Routed node execution
./anx.sh --mission-id PLATOPS-ANX-TEST-0028 --agent github-admin --receipts proofs/anx/TEST.md -- node scripts/oauth-proof/proof-gmail-oauth.mjs

# Routed npm execution
./anx.sh --mission-id PLATOPS-ANX-TEST-0028 --agent github-admin --receipts proofs/anx/TEST.md -- npm run proof

# Routed shell script execution
./anx.sh --mission-id PLATOPS-ANX-TEST-0028 --agent github-admin --receipts proofs/anx/TEST.md -- bash scripts/be-301-verify/run-sync.sh

# Routed PowerShell execution
.\anx.ps1 -MissionId PLATOPS-ANX-TEST-0028 -Agent github-admin -Receipts proofs/anx/TEST.md -- powershell -File scripts/supabase-apply-migrations/apply-via-api.ps1
```

**Solution:** All commands must route through `anx` wrapper.

### 5.3 Shell Profile Integration

#### PowerShell Profile

Edit `$PROFILE`:
```powershell
function Invoke-AnxWrapper {
    param(
        [string]$MissionId = $env:MISSION_ID,
        [string]$Agent = $env:AGENT_OWNER,
        [string]$Receipts = $env:RECEIPT_PATHS,
        [string[]]$Command
    )
    
    if (-not $MissionId -or -not $Agent -or -not $Receipts) {
        Write-Host "ERROR: Mission routing metadata required" -ForegroundColor Red
        Write-Host "Set MISSION_ID, AGENT_OWNER, and RECEIPT_PATHS environment variables" -ForegroundColor Yellow
        return
    }
    
    $wrapperPath = Join-Path $PSScriptRoot "anx.ps1"
    & $wrapperPath -MissionId $MissionId -Agent $Agent -Receipts $Receipts -- $Command
}

Set-Alias -Name anx -Value Invoke-AnxWrapper -Scope Global
```

#### Bash/Zsh Profile

Edit `~/.bashrc` or `~/.zshrc`:
```bash
anx_wrapper() {
    local mission_id="${MISSION_ID}"
    local agent="${AGENT_OWNER}"
    local receipts="${RECEIPT_PATHS}"
    
    if [ -z "$mission_id" ] || [ -z "$agent" ] || [ -z "$receipts" ]; then
        echo "ERROR: Mission routing metadata required" >&2
        echo "Set MISSION_ID, AGENT_OWNER, and RECEIPT_PATHS environment variables" >&2
        return 1
    fi
    
    local wrapper_path="$(dirname "${BASH_SOURCE[0]}")/anx.sh"
    "$wrapper_path" --mission-id "$mission_id" --agent "$agent" --receipts "$receipts" -- "$@"
}

alias anx='anx_wrapper'
```

---

## 6. Acceptance Criteria

### 6.1 Attempted Direct Run Fails

**Test:** Attempt direct execution without routing

**Claude Code:**
```javascript
run_terminal_cmd("node scripts/test.mjs")
```

**Terminal:**
```bash
node scripts/test.mjs
```

**Expected Result:** Execution blocked with enforcement message

**Enforcement Message:**
```
╔════════════════════════════════════════════════════════════╗
║  DIRECT EXECUTION DETECTED - BLOCKED                      ║
╚════════════════════════════════════════════════════════════╝

ERROR: Direct execution bypass detected.

All execution must route through the Mission Router wrapper.

Usage:
  .\anx.ps1 -MissionId <MISSION-ID> -Agent <AGENT> -Receipts <PATHS> -- <COMMAND>
```

**Exit Code:** 1

---

### 6.2 Routed Run Succeeds

**Test:** Execute through choke point wrapper

**Claude Code:**
```javascript
run_terminal_cmd("./anx.sh --mission-id PLATOPS-ANX-TEST-0028 --agent github-admin --receipts proofs/anx/TEST.md -- node scripts/test.mjs")
```

**Terminal:**
```bash
./anx.sh --mission-id PLATOPS-ANX-TEST-0028 --agent github-admin --receipts proofs/anx/TEST.md -- node scripts/test.mjs
```

**Expected Result:** 
- Execution routes through wrapper
- Compliance banner displays
- Command executes successfully
- Receipt stub created
- Exit code is 0

**Compliance Banner:**
```
╔════════════════════════════════════════════════════════════╗
║  MISSION ROUTER COMPLIANCE                               ║
╚════════════════════════════════════════════════════════════╝
Mission ID: PLATOPS-ANX-TEST-0028
Agent Owner: github-admin
Receipt Targets:
  - proofs/anx/TEST.md
```

**Receipt Created:** ✅ Yes

**Exit Code:** 0

---

## 7. Implementation Checklist

### 7.1 Claude Code Extension

- [ ] Update all `run_terminal_cmd` calls to use `anx` wrapper
- [ ] Configure detection script to block direct execution
- [ ] Test direct execution blocking
- [ ] Test routed execution success

### 7.2 Terminal Client

- [ ] Update shell profiles (PowerShell/Bash/Zsh)
- [ ] Create wrapper aliases
- [ ] Test direct execution blocking
- [ ] Test routed execution success

### 7.3 Documentation

- [ ] Document Claude Code routing patterns
- [ ] Document terminal client routing patterns
- [ ] Provide examples for common commands
- [ ] Include troubleshooting guide

---

## 8. Common Command Patterns

### 8.1 Node.js Scripts

**Before:**
```bash
node scripts/oauth-proof/proof-gmail-oauth.mjs
```

**After:**
```bash
./anx.sh --mission-id PLATOPS-ANX-TEST-0028 --agent github-admin --receipts proofs/anx/TEST.md -- node scripts/oauth-proof/proof-gmail-oauth.mjs
```

### 8.2 NPM Scripts

**Before:**
```bash
npm run proof
```

**After:**
```bash
./anx.sh --mission-id PLATOPS-ANX-TEST-0028 --agent github-admin --receipts proofs/anx/TEST.md -- npm run proof
```

### 8.3 Shell Scripts

**Before:**
```bash
bash scripts/be-301-verify/run-sync.sh
```

**After:**
```bash
./anx.sh --mission-id PLATOPS-ANX-TEST-0028 --agent github-admin --receipts proofs/anx/TEST.md -- bash scripts/be-301-verify/run-sync.sh
```

### 8.4 PowerShell Scripts

**Before:**
```powershell
powershell -File scripts/supabase-apply-migrations/apply-via-api.ps1
```

**After:**
```powershell
.\anx.ps1 -MissionId PLATOPS-ANX-TEST-0028 -Agent github-admin -Receipts proofs/anx/TEST.md -- powershell -File scripts/supabase-apply-migrations/apply-via-api.ps1
```

---

## 9. Troubleshooting

### 9.1 Wrapper Not Found

**Error:** `anx.sh: command not found`

**Solution:** Ensure wrapper is in repository root and executable:
```bash
chmod +x anx.sh
```

### 9.2 Permission Denied

**Error:** `Permission denied: ./anx.sh`

**Solution:** Make script executable:
```bash
chmod +x anx.sh
```

### 9.3 Execution Policy (PowerShell)

**Error:** `Execution policy prevents running scripts`

**Solution:** Set execution policy:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 10. References

- [Choke Point Wrapper Specification](CHOKEPOINT_WRAPPER_SPEC.md)
- [Execution Entrypoint Map](../proofs/anx/EXECUTION_ENTRYPOINT_MAP_0026.md)
- [Mission Router Specification](MISSION_ROUTER_SPEC.md)

---

*Configuration guide for PLATOPS-ANX-CLIENT-ROUTING-PATCH-0028. No secrets in this file.*
