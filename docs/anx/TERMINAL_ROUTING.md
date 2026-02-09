# Terminal Client Routing Configuration

**OCS-MISSION:** PLATOPS-TERMINAL-AGENT-ROUTING-PATCH-0024  
**Owner:** PLATOPS  
**Status:** Implemented  
**Version:** 1.0.0

---

## 1. Overview

This document describes how to configure terminal clients to route all command execution through the Mission Router wrapper (`anx`), ensuring compliance with mission routing requirements.

---

## 2. Objective

Ensure terminal client executes missions only via the Mission Router wrapper, preventing direct execution bypass.

---

## 3. Current Invocation Method

Terminal clients typically execute commands through:

1. **Direct command execution** - Commands run directly in shell
2. **Script execution** - Scripts executed without routing
3. **Interactive commands** - User commands bypass wrapper

---

## 4. Configuration Approach

### 4.1 Shell Profile Integration

Configure shell profiles (`.bashrc`, `.zshrc`, `.profile`, `profile.ps1`) to intercept command execution and route through wrapper.

### 4.2 Wrapper Alias

Create shell aliases that automatically route commands through the wrapper when mission routing metadata is present.

### 4.3 Pre-Command Hook

Implement pre-command hooks that validate mission routing before allowing execution.

---

## 5. Implementation Steps

### 5.1 Step 1: PowerShell Profile Configuration

Edit `$PROFILE` (typically `C:\Users\<User>\Documents\PowerShell\Microsoft.PowerShell_profile.ps1`):

```powershell
# Mission Router Integration
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
    if (Test-Path $wrapperPath) {
        & $wrapperPath -MissionId $MissionId -Agent $Agent -Receipts $Receipts -- $Command
    } else {
        Write-Host "ERROR: Mission Router wrapper not found at $wrapperPath" -ForegroundColor Red
    }
}

# Alias for common commands
Set-Alias -Name anx -Value Invoke-AnxWrapper -Scope Global
```

### 5.2 Step 2: Bash/Zsh Profile Configuration

Edit `~/.bashrc` or `~/.zshrc`:

```bash
# Mission Router Integration
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
    if [ -f "$wrapper_path" ]; then
        "$wrapper_path" --mission-id "$mission_id" --agent "$agent" --receipts "$receipts" -- "$@"
    else
        echo "ERROR: Mission Router wrapper not found at $wrapper_path" >&2
        return 1
    fi
}

# Alias
alias anx='anx_wrapper'
```

### 5.3 Step 3: Command Interception

For automatic routing, configure shell to intercept commands:

**PowerShell:**
```powershell
function prompt {
    # Check if mission routing is required
    if ($env:REQUIRE_MISSION_ROUTING -eq "true") {
        Write-Host "⚠ Mission routing required. Use: anx -MissionId <ID> -Agent <AGENT> -Receipts <PATHS> -- <CMD>" -ForegroundColor Yellow
    }
    "PS $($executionContext.SessionState.Path.CurrentLocation)$('>' * ($nestedPromptLevel + 1)) "
}
```

**Bash/Zsh:**
```bash
# Pre-command hook
preexec() {
    if [ "$REQUIRE_MISSION_ROUTING" = "true" ]; then
        echo "⚠ Mission routing required. Use: anx --mission-id <ID> --agent <AGENT> --receipts <PATHS> -- <CMD>" >&2
    fi
}
```

---

## 6. Usage Patterns

### 6.1 Manual Wrapper Invocation

**PowerShell:**
```powershell
.\anx.ps1 -MissionId PLATOPS-ANX-TEST-0024 -Agent github-admin -Receipts proofs/anx/TEST.md -- npm test
```

**Bash/Zsh:**
```bash
./anx.sh --mission-id PLATOPS-ANX-TEST-0024 --agent github-admin --receipts proofs/anx/TEST.md -- npm test
```

### 6.2 Environment Variable Routing

Set environment variables and use wrapper:

**PowerShell:**
```powershell
$env:MISSION_ID = "PLATOPS-ANX-TEST-0024"
$env:AGENT_OWNER = "github-admin"
$env:RECEIPT_PATHS = "proofs/anx/TEST.md"
anx npm test
```

**Bash/Zsh:**
```bash
export MISSION_ID="PLATOPS-ANX-TEST-0024"
export AGENT_OWNER="github-admin"
export RECEIPT_PATHS="proofs/anx/TEST.md"
anx npm test
```

---

## 7. Compliance Banner

When terminal executes via the wrapper, a compliance banner is displayed:

```
╔════════════════════════════════════════════════════════════╗
║  MISSION ROUTER COMPLIANCE                               ║
╚════════════════════════════════════════════════════════════╝
Mission ID: PLATOPS-TERMINAL-AGENT-ROUTING-PATCH-0024
Agent Owner: github-admin
Receipt Targets:
  - proofs/anx/TERMINAL_ROUTING_PATCH_0024.md
```

---

## 8. Drift Detection

### 8.1 Detection Mechanism

The drift check detects direct execution by:

1. Checking for mission routing environment variables
2. Verifying wrapper invocation in command history
3. Validating receipt file creation

### 8.2 Blocking Direct Execution

If direct execution is detected:

```
╔════════════════════════════════════════════════════════════╗
║  DIRECT EXECUTION DETECTED - BLOCKED                      ║
╚════════════════════════════════════════════════════════════╝

ERROR: Direct execution bypass detected.

All terminal execution must route through the Mission Router wrapper.

Usage:
  .\anx.ps1 -MissionId <MISSION-ID> -Agent <AGENT> -Receipts <PATHS> -- <COMMAND>
```

---

## 9. Testing

### 9.1 Test 1: Direct Execution (Should Fail)

**Attempt:**
```bash
npm test
```

**Expected:** Warning displayed (if `REQUIRE_MISSION_ROUTING=true`) or execution blocked

### 9.2 Test 2: Wrapped Execution (Should Succeed)

**Attempt:**
```bash
./anx.sh --mission-id PLATOPS-ANX-TEST-0024 --agent github-admin --receipts proofs/anx/TEST.md -- npm test
```

**Expected:** Executes successfully with compliance banner

---

## 10. Integration Points

### 10.1 PowerShell Terminal

- Profile integration routes through wrapper
- Command aliases use wrapper
- Pre-command hooks validate routing

### 10.2 Bash/Zsh Terminal

- Profile integration routes through wrapper
- Function aliases use wrapper
- Pre-execution hooks validate routing

### 10.3 Windows Command Prompt

- Batch file wrapper routes through PowerShell wrapper
- Environment variable injection
- Pre-execution validation

---

## 11. Environment Variables

The wrapper sets these environment variables:

- `MISSION_ID` - Mission identifier
- `AGENT_OWNER` - Department owner agent
- `RECEIPT_PATHS` - Comma-separated receipt paths
- `PARENT_PROCESS` - Wrapper process identifier
- `REQUIRE_MISSION_ROUTING` - Flag to enforce routing (optional)

---

## 12. Troubleshooting

### 12.1 Profile Not Loading

**Error:** Alias `anx` not found

**Solution:** 
- Ensure profile file exists and is sourced
- Check profile path: `$PROFILE` (PowerShell) or `~/.bashrc` (Bash)

### 12.2 Permission Denied

**Error:** Cannot execute wrapper script

**Solution:** 
```bash
chmod +x anx.sh  # Unix/Linux/Mac
```

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser  # PowerShell
```

### 12.3 Environment Variables Not Set

**Error:** Mission routing metadata required

**Solution:** Set `MISSION_ID`, `AGENT_OWNER`, and `RECEIPT_PATHS` environment variables

---

## 13. Compliance Checklist

- [ ] Shell profile configured
- [ ] Wrapper alias created
- [ ] Pre-command hooks installed
- [ ] Command execution routes through wrapper
- [ ] Compliance banner displays
- [ ] Drift detection active
- [ ] Direct execution blocked
- [ ] Receipt stubs created

---

## 14. References

- [Mission Router Specification](MISSION_ROUTER_SPEC.md)
- [Mission Router Usage Guide](MISSION_ROUTER_USAGE.md)
- [Claude Code Routing](CLAUDECODE_ROUTING.md)
- [QAG Agent Enforcement Gate](QAG_AGENT_ENFORCEMENT_GATE.md)

---

*Configuration guide for PLATOPS-TERMINAL-AGENT-ROUTING-PATCH-0024. No secrets in this file.*
