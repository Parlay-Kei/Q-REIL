# Mission Router Specification

**OCS-MISSION:** PLATOPS-ANX-MISSION-ROUTER-WRAPPER-0022  
**Owner:** PLATOPS  
**Status:** Implemented  
**Version:** 1.0.0

---

## 1. Overview

The Mission Router wrapper (`anx`) enforces that all Claude Code and terminal invocations route through OCS and named agents, not direct execution. This ensures proper mission tracking, agent ownership, and receipt generation.

---

## 2. Requirements

### 2.1 Core Enforcement Rules

Every execution **MUST** include:

1. **Mission ID** - Unique identifier following format: `<DEPARTMENT>-<PROJECT>-<DESCRIPTION>-<NUMBER>`
   - Example: `PLATOPS-ANX-MISSION-ROUTER-WRAPPER-0022`
   - Example: `QAG-AGENT-ARCHITECTURE-ENFORCEMENT-GATE-0025`

2. **Agent Owner** - Department owner agent responsible for the mission
   - Valid agents: `github-admin`, `platops`, `qag`, `engdel`, `relops`, `proops`, `ocs`
   - Example: `github-admin`, `platops`

3. **Receipt Paths** - One or more expected receipt file paths
   - Comma-separated list of paths relative to repository root
   - Example: `proofs/anx/MISSION_ROUTER_PROOF_PACK_0022`
   - Example: `proofs/anx/MISSION_ROUTER_PROOF_PACK_0022,proofs/anx/ADDITIONAL_RECEIPT.md`

### 2.2 Rejection Rules

The wrapper **MUST** reject execution if:

- Mission ID is missing or empty
- Agent owner is missing or empty
- Receipt paths are missing or empty
- Command to execute is missing

When rejection occurs, the wrapper **MUST**:
- Display an error banner
- Print the correct mission template
- Exit with non-zero status code

---

## 3. Implementation

### 3.1 Entrypoint

The wrapper provides two entrypoints:

- **Windows PowerShell:** `anx.ps1`
- **Unix/Linux/Mac:** `anx.sh`

Both implementations enforce the same rules and produce identical behavior.

### 3.2 Usage

#### Windows PowerShell

```powershell
.\anx.ps1 -MissionId <MISSION-ID> -Agent <AGENT-NAME> -Receipts <PATH1>,<PATH2> -- <COMMAND>
```

#### Unix/Linux/Mac

```bash
./anx.sh --mission-id <MISSION-ID> --agent <AGENT-NAME> --receipts <PATH1>,<PATH2> -- <COMMAND>
```

### 3.3 Example

```bash
# Windows PowerShell
.\anx.ps1 -MissionId PLATOPS-ANX-MISSION-ROUTER-WRAPPER-0022 -Agent github-admin -Receipts proofs/anx/MISSION_ROUTER_PROOF_PACK_0022 -- node scripts/test.mjs

# Unix/Linux/Mac
./anx.sh --mission-id PLATOPS-ANX-MISSION-ROUTER-WRAPPER-0022 --agent github-admin --receipts proofs/anx/MISSION_ROUTER_PROOF_PACK_0022 -- node scripts/test.mjs
```

---

## 4. Behavior

### 4.1 Pre-Execution

Before executing the command, the wrapper:

1. Validates all required parameters
2. Displays a compliance banner showing:
   - Mission ID
   - Agent Owner
   - Receipt Targets
3. Creates receipt stub directories if they don't exist
4. Creates receipt stub files if they don't exist

### 4.2 Execution

The wrapper executes the provided command and captures:
- Standard output
- Standard error
- Exit code

### 4.3 Post-Execution

After execution, the wrapper:

1. Displays execution status (success/failure)
2. Shows mission ID and exit code
3. Returns the command's exit code

### 4.4 Receipt Stub Format

Receipt stubs are created with the following format:

```markdown
# Mission Receipt Stub

**Mission:** <MISSION-ID>
**Owner:** <AGENT-NAME>
**Receipt Path:** <RECEIPT-PATH>
**Created:** <TIMESTAMP>

---

## Execution Summary

*Receipt stub created by Mission Router wrapper. Replace this with actual execution details.*
```

---

## 5. Compliance Banner

The compliance banner displays:

```
╔════════════════════════════════════════════════════════════╗
║  MISSION ROUTER COMPLIANCE                               ║
╚════════════════════════════════════════════════════════════╝
Mission ID: <MISSION-ID>
Agent Owner: <AGENT-NAME>
Receipt Targets:
  - <RECEIPT-PATH-1>
  - <RECEIPT-PATH-2>
```

---

## 6. Error Handling

### 6.1 Missing Mission ID

```
╔════════════════════════════════════════════════════════════╗
║  MISSION ROUTER ERROR                                    ║
╚════════════════════════════════════════════════════════════╝
MISSION ID REQUIRED
Every run must include a mission ID.
```

### 6.2 Missing Agent Owner

```
╔════════════════════════════════════════════════════════════╗
║  MISSION ROUTER ERROR                                    ║
╚════════════════════════════════════════════════════════════╝
AGENT OWNER REQUIRED
Every mission must specify a department owner agent.
```

### 6.3 Missing Receipt Paths

```
╔════════════════════════════════════════════════════════════╗
║  MISSION ROUTER ERROR                                    ║
╚════════════════════════════════════════════════════════════╝
RECEIPT PATHS REQUIRED
Every mission must specify expected receipt paths.
```

---

## 7. Mission ID Format

Mission IDs follow the pattern:

```
<DEPARTMENT>-<PROJECT>-<DESCRIPTION>-<NUMBER>
```

Where:
- **DEPARTMENT**: Department code (e.g., `PLATOPS`, `QAG`, `OCS`)
- **PROJECT**: Project identifier (e.g., `ANX`, `CLAUDECODE`, `TERMINAL`)
- **DESCRIPTION**: Brief description in uppercase with hyphens
- **NUMBER**: Four-digit mission number (e.g., `0022`)

Examples:
- `PLATOPS-ANX-MISSION-ROUTER-WRAPPER-0022`
- `QAG-AGENT-ARCHITECTURE-ENFORCEMENT-GATE-0025`
- `PLATOPS-CLAUDECODE-AGENT-ROUTING-PATCH-0023`

---

## 8. Agent Owner Values

Valid agent owner values:

- `github-admin` - GitHub administration agent
- `platops` - Platform Operations
- `qag` - QA Gatekeeper
- `engdel` - Engineering Delivery
- `relops` - Release Operations
- `proops` - Product Operations
- `ocs` - Orchestrator

---

## 9. Receipt Path Format

Receipt paths are relative to the repository root and typically follow:

```
proofs/<category>/<RECEIPT_NAME>.md
```

Examples:
- `proofs/anx/MISSION_ROUTER_PROOF_PACK_0022.md`
- `proofs/anx/CLAUDECODE_ROUTING_PATCH_0023.md`
- `proofs/anx/QAG_ENFORCEMENT_PROOF_0025.md`

---

## 10. Integration Points

The Mission Router wrapper integrates with:

1. **Claude Code Extension** - All code execution routes through the wrapper
2. **Terminal Client** - All terminal commands route through the wrapper
3. **QAG Enforcement Gate** - Validates mission routing metadata

---

## 11. Exit Codes

- `0` - Success (command executed successfully)
- `1` - Validation failure (missing required parameters)
- `N` - Command exit code (passes through command's exit code)

---

## 12. References

- [Mission Router Usage Guide](MISSION_ROUTER_USAGE.md)
- [QAG Agent Enforcement Gate](QAG_AGENT_ENFORCEMENT_GATE.md)
- [Claude Code Routing Documentation](CLAUDECODE_ROUTING.md)
- [Terminal Routing Documentation](TERMINAL_ROUTING.md)

---

*Specification for PLATOPS-ANX-MISSION-ROUTER-WRAPPER-0022. No secrets in this file.*
