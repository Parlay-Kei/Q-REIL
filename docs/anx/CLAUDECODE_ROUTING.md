# Claude Code Extension Routing Configuration

**OCS-MISSION:** PLATOPS-CLAUDECODE-AGENT-ROUTING-PATCH-0023  
**Owner:** PLATOPS  
**Status:** Implemented  
**Version:** 1.0.0

---

## 1. Overview

This document describes how to configure Claude Code extension (in Cursor/Claude Desktop) to route all code execution through the Mission Router wrapper (`anx`), ensuring compliance with mission routing requirements.

---

## 2. Objective

Ensure Claude Code extension executes missions only via the Mission Router wrapper, preventing direct execution bypass.

---

## 3. Current Invocation Method

Claude Code extension typically executes commands through:

1. **Direct shell execution** - Commands run directly in terminal
2. **Code execution blocks** - Code snippets executed via `run_terminal_cmd` or similar
3. **File operations** - Scripts executed without routing

---

## 4. Configuration Approach

### 4.1 Detection Script

A drift check script (`scripts/anx/detect-claude-code-execution.mjs`) detects direct execution attempts by checking for mission routing metadata:

- `MISSION_ID` environment variable
- `AGENT_OWNER` environment variable  
- `RECEIPT_PATHS` environment variable

If any are missing, execution is blocked with an error message.

### 4.2 Wrapper Integration

The Mission Router wrapper (`anx.ps1` / `anx.sh`) sets these environment variables before executing commands, ensuring compliance.

---

## 5. Implementation Steps

### 5.1 Step 1: Configure Cursor Settings

Create or update `.cursor/settings.json`:

```json
{
  "terminal.integrated.shell.windows": "C:\\Windows\\System32\\WindowsPowerShell\\ps1.exe",
  "terminal.integrated.shellArgs.windows": [
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-File", "${workspaceFolder}/anx.ps1"
  ],
  "anx.missionRouter.enabled": true,
  "anx.missionRouter.wrapperPath": "${workspaceFolder}/anx.ps1"
}
```

### 5.2 Step 2: Create Pre-Execution Hook

Create `.cursor/hooks/pre-execute.mjs`:

```javascript
#!/usr/bin/env node
/**
 * Pre-execution hook for Claude Code
 * Routes all execution through Mission Router wrapper
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

const MISSION_ID = process.env.MISSION_ID || '';
const AGENT = process.env.AGENT_OWNER || '';
const RECEIPTS = process.env.RECEIPT_PATHS || '';

if (!MISSION_ID || !AGENT || !RECEIPTS) {
    console.error('ERROR: Mission routing metadata required');
    console.error('Set MISSION_ID, AGENT_OWNER, and RECEIPT_PATHS environment variables');
    process.exit(1);
}

// Execution will proceed with wrapper
```

### 5.3 Step 3: Update Code Execution Handler

Modify code execution to use wrapper:

**Before:**
```javascript
run_terminal_cmd("node scripts/test.mjs")
```

**After:**
```javascript
run_terminal_cmd("anx.ps1 -MissionId PLATOPS-ANX-TEST-0022 -Agent github-admin -Receipts proofs/anx/TEST.md -- node scripts/test.mjs")
```

---

## 6. Compliance Banner

When Claude Code executes via the wrapper, a compliance banner is displayed:

```
╔════════════════════════════════════════════════════════════╗
║  MISSION ROUTER COMPLIANCE                               ║
╚════════════════════════════════════════════════════════════╝
Mission ID: PLATOPS-CLAUDECODE-AGENT-ROUTING-PATCH-0023
Agent Owner: github-admin
Receipt Targets:
  - proofs/anx/CLAUDECODE_ROUTING_PATCH_0023.md
```

---

## 7. Drift Detection

### 7.1 Detection Mechanism

The drift check detects direct execution by:

1. Checking for mission routing environment variables
2. Verifying wrapper invocation in process tree
3. Validating receipt file creation

### 7.2 Blocking Direct Execution

If direct execution is detected:

```
╔════════════════════════════════════════════════════════════╗
║  DIRECT EXECUTION DETECTED - BLOCKED                      ║
╚════════════════════════════════════════════════════════════╝

ERROR: Direct execution bypass detected.

All code execution must route through the Mission Router wrapper.

Usage:
  .\anx.ps1 -MissionId <MISSION-ID> -Agent <AGENT> -Receipts <PATHS> -- <COMMAND>
```

---

## 8. Testing

### 8.1 Test 1: Direct Execution (Should Fail)

**Attempt:**
```javascript
run_terminal_cmd("node scripts/test.mjs")
```

**Expected:** Blocked with error message

### 8.2 Test 2: Wrapped Execution (Should Succeed)

**Attempt:**
```javascript
run_terminal_cmd("anx.ps1 -MissionId PLATOPS-ANX-TEST-0022 -Agent github-admin -Receipts proofs/anx/TEST.md -- node scripts/test.mjs")
```

**Expected:** Executes successfully with compliance banner

---

## 9. Integration Points

### 9.1 Cursor IDE

- Terminal integration routes through wrapper
- Code execution blocks use wrapper
- File operations validated

### 9.2 Claude Desktop

- Similar configuration approach
- Environment variable injection
- Pre-execution hooks

---

## 10. Environment Variables

The wrapper sets these environment variables:

- `MISSION_ID` - Mission identifier
- `AGENT_OWNER` - Department owner agent
- `RECEIPT_PATHS` - Comma-separated receipt paths
- `PARENT_PROCESS` - Wrapper process identifier

---

## 11. Troubleshooting

### 11.1 Wrapper Not Found

**Error:** `anx.ps1 : The term 'anx.ps1' is not recognized`

**Solution:** Ensure wrapper is in repository root and executable

### 11.2 Permission Denied

**Error:** `Execution policy prevents running scripts`

**Solution:** 
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 11.3 Environment Variables Not Set

**Error:** Direct execution detected

**Solution:** Ensure wrapper is invoked with all required parameters

---

## 12. Compliance Checklist

- [ ] Cursor settings configured
- [ ] Pre-execution hook installed
- [ ] Code execution routes through wrapper
- [ ] Compliance banner displays
- [ ] Drift detection active
- [ ] Direct execution blocked
- [ ] Receipt stubs created

---

## 13. References

- [Mission Router Specification](MISSION_ROUTER_SPEC.md)
- [Mission Router Usage Guide](MISSION_ROUTER_USAGE.md)
- [QAG Agent Enforcement Gate](QAG_AGENT_ENFORCEMENT_GATE.md)

---

*Configuration guide for PLATOPS-CLAUDECODE-AGENT-ROUTING-PATCH-0023. No secrets in this file.*
