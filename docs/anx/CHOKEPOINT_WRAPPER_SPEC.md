# Choke Point Wrapper Specification

**OCS-MISSION:** PLATOPS-ANX-CHOKEPOINT-WRAPPER-IMPLEMENT-0027  
**Owner:** PLATOPS  
**Status:** Implemented  
**Version:** 1.0.0

---

## 1. Overview

The choke point wrapper (`anx`) is the single required entrypoint that every execution must go through. It enforces mission routing requirements and prevents direct execution bypass.

---

## 2. Objective

Create one required wrapper that every execution must go through, ensuring all missions are properly routed with mission ID, agent owner, and receipt targets.

---

## 3. Wrapper Rules

### 3.1 Rule 1: Refuse to run unless mission ID exists

**Requirement:** Wrapper MUST refuse execution if mission ID is missing or empty.

**Validation:**
- Mission ID must be provided as parameter
- Mission ID must be non-empty after trimming whitespace
- Mission ID format validation (optional but recommended)

**Rejection Behavior:**
- Display error banner
- Print mission template
- Exit with non-zero status code (1)

**Implementation:**
```powershell
# PowerShell
if ([string]::IsNullOrWhiteSpace($MissionId)) {
    Write-Error-Banner "MISSION ID REQUIRED"
    Show-Mission-Template
    exit 1
}
```

```bash
# Unix/Linux/Mac
if [ -z "$MISSION_ID" ]; then
    write_error_banner "MISSION ID REQUIRED"
    show_mission_template
    exit 1
fi
```

---

### 3.2 Rule 2: Refuse to run unless named agent owner exists

**Requirement:** Wrapper MUST refuse execution if agent owner is missing or empty.

**Validation:**
- Agent owner must be provided as parameter
- Agent owner must be non-empty after trimming whitespace
- Agent owner should be from standard list (warning if not)

**Valid Agents:**
- `github-admin`
- `platops`
- `qag`
- `engdel`
- `relops`
- `proops`
- `ocs`

**Rejection Behavior:**
- Display error banner
- Print mission template
- Exit with non-zero status code (1)

**Implementation:**
```powershell
# PowerShell
if ([string]::IsNullOrWhiteSpace($Agent)) {
    Write-Error-Banner "AGENT OWNER REQUIRED"
    Show-Mission-Template
    exit 1
}
```

```bash
# Unix/Linux/Mac
if [ -z "$AGENT" ]; then
    write_error_banner "AGENT OWNER REQUIRED"
    show_mission_template
    exit 1
fi
```

---

### 3.3 Rule 3: Refuse to run unless receipt targets exist

**Requirement:** Wrapper MUST refuse execution if receipt paths are missing or empty.

**Validation:**
- At least one receipt path must be provided
- Receipt paths must be non-empty after trimming
- Receipt paths are comma-separated (PowerShell) or comma-separated (Unix)

**Rejection Behavior:**
- Display error banner
- Print mission template
- Exit with non-zero status code (1)

**Implementation:**
```powershell
# PowerShell
if ($null -eq $Receipts -or $Receipts.Count -eq 0) {
    Write-Error-Banner "RECEIPT PATHS REQUIRED"
    Show-Mission-Template
    exit 1
}
```

```bash
# Unix/Linux/Mac
if [ -z "$RECEIPTS" ]; then
    write_error_banner "RECEIPT PATHS REQUIRED"
    show_mission_template
    exit 1
fi
```

---

### 3.4 Rule 4: Emit routing metadata at start of run

**Requirement:** Wrapper MUST emit routing metadata before executing command.

**Metadata Includes:**
- Mission ID
- Agent Owner
- Receipt Targets (list)
- Execution timestamp (optional)

**Display Format:**
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

**Implementation:**
```powershell
# PowerShell
Write-Compliance-Banner -MissionId $MissionId -Agent $Agent -Receipts $Receipts
```

```bash
# Unix/Linux/Mac
write_compliance_banner "$MISSION_ID" "$AGENT" "$RECEIPTS"
```

---

## 4. Implementation

### 4.1 Entrypoint Location

**Canonical Path:** Repository root
- **PowerShell:** `anx.ps1`
- **Unix/Linux/Mac:** `anx.sh`

### 4.2 Usage

#### Windows PowerShell
```powershell
.\anx.ps1 -MissionId <MISSION-ID> -Agent <AGENT-NAME> -Receipts <PATH1>,<PATH2> -- <COMMAND>
```

#### Unix/Linux/Mac
```bash
./anx.sh --mission-id <MISSION-ID> --agent <AGENT-NAME> --receipts <PATH1>,<PATH2> -- <COMMAND>
```

### 4.3 Example

```powershell
# PowerShell
.\anx.ps1 -MissionId PLATOPS-ANX-CHOKEPOINT-WRAPPER-IMPLEMENT-0027 -Agent platops -Receipts proofs/anx/CHOKEPOINT_WRAPPER_PROOF_0027.md -- node scripts/test.mjs
```

```bash
# Unix/Linux/Mac
./anx.sh --mission-id PLATOPS-ANX-CHOKEPOINT-WRAPPER-IMPLEMENT-0027 --agent platops --receipts proofs/anx/CHOKEPOINT_WRAPPER_PROOF_0027.md -- node scripts/test.mjs
```

---

## 5. Behavior

### 5.1 Pre-Execution

Before executing the command, the wrapper:

1. Validates mission ID (Rule 1)
2. Validates agent owner (Rule 2)
3. Validates receipt paths (Rule 3)
4. Emits routing metadata (Rule 4)
5. Creates receipt stub directories if needed
6. Creates receipt stub files if needed

### 5.2 Execution

The wrapper executes the provided command and:
- Captures standard output
- Captures standard error
- Captures exit code

### 5.3 Post-Execution

After execution, the wrapper:
- Displays execution status (success/failure)
- Shows mission ID and exit code
- Returns the command's exit code

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

## 7. Compliance Banner

The compliance banner MUST be displayed before command execution:

```
╔════════════════════════════════════════════════════════════╗
║  MISSION ROUTER COMPLIANCE                               ║
╚════════════════════════════════════════════════════════════╝
Mission ID: PLATOPS-ANX-CHOKEPOINT-WRAPPER-IMPLEMENT-0027
Agent Owner: platops
Receipt Targets:
  - proofs/anx/CHOKEPOINT_WRAPPER_PROOF_0027.md
```

---

## 8. Receipt Stub Generation

The wrapper automatically creates receipt stub files with:

- Mission ID
- Agent Owner
- Receipt Path
- Creation Timestamp
- Placeholder for execution details

**Example Receipt Stub:**
```markdown
# Mission Receipt Stub

**Mission:** PLATOPS-ANX-CHOKEPOINT-WRAPPER-IMPLEMENT-0027
**Owner:** platops
**Receipt Path:** proofs/anx/CHOKEPOINT_WRAPPER_PROOF_0027.md
**Created:** 2026-02-09 10:30:00

---

## Execution Summary

*Receipt stub created by Mission Router wrapper. Replace this with actual execution details.*
```

---

## 9. Exit Codes

- `0` - Success (command executed successfully)
- `1` - Validation failure (missing required parameters)
- `N` - Command exit code (passes through command's exit code)

---

## 10. Integration Requirements

### 10.1 All Execution Must Route Through Wrapper

- Claude Code extension → `anx` wrapper
- Terminal client → `anx` wrapper
- GitHub Actions → `anx` wrapper
- NPM scripts → `anx` wrapper
- Shell scripts → `anx` wrapper
- PowerShell scripts → `anx` wrapper

### 10.2 No Direct Execution Allowed

- Direct `node` execution → BLOCKED
- Direct `npm` execution → BLOCKED
- Direct `bash` execution → BLOCKED
- Direct `powershell` execution → BLOCKED

---

## 11. References

- [Execution Entrypoint Map](../proofs/anx/EXECUTION_ENTRYPOINT_MAP_0026.md)
- [Mission Router Specification](MISSION_ROUTER_SPEC.md)
- [Mission Router Usage Guide](MISSION_ROUTER_USAGE.md)

---

*Specification for PLATOPS-ANX-CHOKEPOINT-WRAPPER-IMPLEMENT-0027. No secrets in this file.*
