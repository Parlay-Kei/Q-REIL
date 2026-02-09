# Mission Router Usage Guide

**OCS-MISSION:** PLATOPS-ANX-MISSION-ROUTER-WRAPPER-0022  
**Owner:** PLATOPS  
**Status:** Active  
**Version:** 1.0.0

---

## 1. Quick Start

### Windows PowerShell

```powershell
.\anx.ps1 -MissionId PLATOPS-ANX-MISSION-ROUTER-WRAPPER-0022 -Agent github-admin -Receipts proofs/anx/MISSION_ROUTER_PROOF_PACK_0022 -- node scripts/test.mjs
```

### Unix/Linux/Mac

```bash
./anx.sh --mission-id PLATOPS-ANX-MISSION-ROUTER-WRAPPER-0022 --agent github-admin --receipts proofs/anx/MISSION_ROUTER_PROOF_PACK_0022 -- node scripts/test.mjs
```

---

## 2. Parameter Reference

### 2.1 Required Parameters

| Parameter | PowerShell | Unix/Linux | Description | Example |
|-----------|------------|------------|-------------|---------|
| Mission ID | `-MissionId` | `--mission-id` | Unique mission identifier | `PLATOPS-ANX-MISSION-ROUTER-WRAPPER-0022` |
| Agent Owner | `-Agent` | `--agent` | Department owner agent | `github-admin` |
| Receipt Paths | `-Receipts` | `--receipts` | Comma-separated receipt paths | `proofs/anx/RECEIPT.md` |
| Command | `--` | `--` | Separator before command | `-- node script.mjs` |

### 2.2 Mission ID Format

```
<DEPARTMENT>-<PROJECT>-<DESCRIPTION>-<NUMBER>
```

Examples:
- `PLATOPS-ANX-MISSION-ROUTER-WRAPPER-0022`
- `QAG-AGENT-ARCHITECTURE-ENFORCEMENT-GATE-0025`
- `PLATOPS-CLAUDECODE-AGENT-ROUTING-PATCH-0023`

### 2.3 Agent Owner Values

- `github-admin` - GitHub administration
- `platops` - Platform Operations
- `qag` - QA Gatekeeper
- `engdel` - Engineering Delivery
- `relops` - Release Operations
- `proops` - Product Operations
- `ocs` - Orchestrator

---

## 3. Common Usage Patterns

### 3.1 Running Node.js Scripts

```powershell
# Windows
.\anx.ps1 -MissionId PLATOPS-ANX-TEST-0022 -Agent platops -Receipts proofs/anx/TEST_RECEIPT.md -- node scripts/test.mjs

# Unix/Linux/Mac
./anx.sh --mission-id PLATOPS-ANX-TEST-0022 --agent platops --receipts proofs/anx/TEST_RECEIPT.md -- node scripts/test.mjs
```

### 3.2 Running Shell Scripts

```powershell
# Windows
.\anx.ps1 -MissionId PLATOPS-ANX-DEPLOY-0022 -Agent relops -Receipts proofs/anx/DEPLOY_RECEIPT.md -- bash scripts/deploy.sh

# Unix/Linux/Mac
./anx.sh --mission-id PLATOPS-ANX-DEPLOY-0022 --agent relops --receipts proofs/anx/DEPLOY_RECEIPT.md -- bash scripts/deploy.sh
```

### 3.3 Running PowerShell Scripts

```powershell
.\anx.ps1 -MissionId PLATOPS-ANX-SETUP-0022 -Agent platops -Receipts proofs/anx/SETUP_RECEIPT.md -- powershell scripts/setup.ps1
```

### 3.4 Multiple Receipt Paths

```powershell
# Windows
.\anx.ps1 -MissionId PLATOPS-ANX-MULTI-0022 -Agent qag -Receipts proofs/anx/RECEIPT1.md,proofs/anx/RECEIPT2.md -- node scripts/multi.mjs

# Unix/Linux/Mac
./anx.sh --mission-id PLATOPS-ANX-MULTI-0022 --agent qag --receipts proofs/anx/RECEIPT1.md,proofs/anx/RECEIPT2.md -- node scripts/multi.mjs
```

### 3.5 Commands with Arguments

```powershell
# Windows
.\anx.ps1 -MissionId PLATOPS-ANX-BUILD-0022 -Agent engdel -Receipts proofs/anx/BUILD_RECEIPT.md -- npm run build -- --production

# Unix/Linux/Mac
./anx.sh --mission-id PLATOPS-ANX-BUILD-0022 --agent engdel --receipts proofs/anx/BUILD_RECEIPT.md -- npm run build -- --production
```

---

## 4. Error Scenarios

### 4.1 Missing Mission ID

**Error:**
```
╔════════════════════════════════════════════════════════════╗
║  MISSION ROUTER ERROR                                    ║
╚════════════════════════════════════════════════════════════╝
MISSION ID REQUIRED
Every run must include a mission ID.
```

**Solution:** Add `-MissionId` (PowerShell) or `--mission-id` (Unix) parameter.

### 4.2 Missing Agent Owner

**Error:**
```
╔════════════════════════════════════════════════════════════╗
║  MISSION ROUTER ERROR                                    ║
╚════════════════════════════════════════════════════════════╝
AGENT OWNER REQUIRED
Every mission must specify a department owner agent.
```

**Solution:** Add `-Agent` (PowerShell) or `--agent` (Unix) parameter.

### 4.3 Missing Receipt Paths

**Error:**
```
╔════════════════════════════════════════════════════════════╝
║  MISSION ROUTER ERROR                                    ║
╚════════════════════════════════════════════════════════════╝
RECEIPT PATHS REQUIRED
Every mission must specify expected receipt paths.
```

**Solution:** Add `-Receipts` (PowerShell) or `--receipts` (Unix) parameter.

### 4.4 Missing Command

**Error:**
```
╔════════════════════════════════════════════════════════════╗
║  MISSION ROUTER ERROR                                    ║
╚════════════════════════════════════════════════════════════╝
COMMAND REQUIRED
No command provided after -- separator.
```

**Solution:** Add `--` separator followed by the command to execute.

---

## 5. Receipt Stub Generation

The wrapper automatically creates receipt stub files if they don't exist. The stub includes:

- Mission ID
- Agent Owner
- Receipt Path
- Creation Timestamp
- Placeholder for execution details

**Example Receipt Stub:**

```markdown
# Mission Receipt Stub

**Mission:** PLATOPS-ANX-MISSION-ROUTER-WRAPPER-0022
**Owner:** github-admin
**Receipt Path:** proofs/anx/MISSION_ROUTER_PROOF_PACK_0022.md
**Created:** 2026-02-09 14:30:00

---

## Execution Summary

*Receipt stub created by Mission Router wrapper. Replace this with actual execution details.*
```

---

## 6. Compliance Banner

Every successful execution displays a compliance banner:

```
╔════════════════════════════════════════════════════════════╗
║  MISSION ROUTER COMPLIANCE                               ║
╚════════════════════════════════════════════════════════════╝
Mission ID: PLATOPS-ANX-MISSION-ROUTER-WRAPPER-0022
Agent Owner: github-admin
Receipt Targets:
  - proofs/anx/MISSION_ROUTER_PROOF_PACK_0022.md
```

---

## 7. Exit Codes

- `0` - Command executed successfully
- `1` - Validation error (missing parameters)
- `N` - Command's exit code (passed through)

---

## 8. Best Practices

1. **Always use mission IDs** - Never execute commands without routing through the wrapper
2. **Specify correct agent** - Use the appropriate department owner agent
3. **Create receipt paths** - Define receipt paths before execution
4. **Update receipts** - Replace stub content with actual execution details
5. **Follow mission ID format** - Use consistent naming convention

---

## 9. Integration Examples

### 9.1 CI/CD Integration

```yaml
# GitHub Actions example
- name: Run mission
  run: |
    ./anx.sh --mission-id PLATOPS-ANX-CI-0022 \
             --agent platops \
             --receipts proofs/anx/CI_RECEIPT.md \
             -- npm test
```

### 9.2 Local Development

```powershell
# PowerShell example
.\anx.ps1 -MissionId PLATOPS-ANX-DEV-0022 -Agent engdel -Receipts proofs/anx/DEV_RECEIPT.md -- npm run dev
```

---

## 10. Troubleshooting

### 10.1 Permission Denied (Unix/Linux/Mac)

**Error:** `Permission denied: ./anx.sh`

**Solution:** Make script executable:
```bash
chmod +x anx.sh
```

### 10.2 Execution Policy (PowerShell)

**Error:** `Execution policy prevents running scripts`

**Solution:** Set execution policy:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 10.3 Receipt Directory Creation Fails

**Error:** Cannot create receipt directory

**Solution:** Ensure write permissions in repository root or receipt parent directory.

---

## 11. References

- [Mission Router Specification](MISSION_ROUTER_SPEC.md)
- [QAG Agent Enforcement Gate](QAG_AGENT_ENFORCEMENT_GATE.md)
- [Claude Code Routing](CLAUDECODE_ROUTING.md)
- [Terminal Routing](TERMINAL_ROUTING.md)

---

*Usage guide for PLATOPS-ANX-MISSION-ROUTER-WRAPPER-0022. No secrets in this file.*
