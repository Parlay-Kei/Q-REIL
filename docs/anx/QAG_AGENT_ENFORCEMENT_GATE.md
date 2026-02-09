# QAG Agent Architecture Enforcement Gate

**OCS-MISSION:** QAG-AGENT-ARCHITECTURE-ENFORCEMENT-GATE-0025  
**Owner:** QAG  
**Status:** Implemented  
**Version:** 1.0.0

---

## 1. Overview

The QAG Agent Architecture Enforcement Gate validates that all work products include mission routing metadata and receipt paths. Any work product without agent routing metadata and receipt paths is automatically rejected.

---

## 2. Objective

Ensure that any work product without agent routing metadata and receipt paths is automatically rejected, preventing direct execution bypass.

---

## 3. Gate Rules

The enforcement gate applies four rejection rules:

### 3.1 Gate Rule 1: Reject if no mission ID

**Rule:** Work product must include a valid mission ID.

**Validation:**
- Mission ID must be present and non-empty
- Mission ID must follow format: `<DEPARTMENT>-<PROJECT>-<DESCRIPTION>-<NUMBER>`
- Example: `PLATOPS-ANX-MISSION-ROUTER-WRAPPER-0022`

**Rejection Message:**
```
REJECTED: No mission ID
```

---

### 3.2 Gate Rule 2: Reject if no named agent owner

**Rule:** Work product must specify a named agent owner.

**Validation:**
- Agent owner must be present and non-empty
- Agent owner should be from standard list (warning if not)

**Valid Agents:**
- `github-admin`
- `platops`
- `qag`
- `engdel`
- `relops`
- `proops`
- `ocs`

**Rejection Message:**
```
REJECTED: No named agent owner
```

---

### 3.3 Gate Rule 3: Reject if no receipts

**Rule:** Work product must specify receipt paths.

**Validation:**
- At least one receipt path must be provided
- Receipt paths must be non-empty
- Receipt files should exist (warning if missing)
- Receipt files should contain mission metadata (warning if missing)

**Rejection Message:**
```
REJECTED: No receipt paths
```

---

### 3.4 Gate Rule 4: Reject if direct execution bypass detected

**Rule:** Work product must not indicate direct execution bypass.

**Validation:**
- Work product file must exist
- Work product must contain mission ID in content
- Work product must contain agent owner in content
- Work product should reference receipt paths (warning if missing)

**Rejection Message:**
```
REJECTED: Direct execution bypass detected
```

---

## 4. Implementation

### 4.1 Enforcement Script

The enforcement gate is implemented as `scripts/anx/qag-enforcement-gate.mjs`.

### 4.2 Usage

#### Command Line

```bash
node scripts/anx/qag-enforcement-gate.mjs <MISSION_ID> <AGENT> <RECEIPT_PATHS> [WORK_PRODUCT_PATH]
```

#### Environment Variables

```bash
MISSION_ID=<id> AGENT_OWNER=<agent> RECEIPT_PATHS=<paths> node scripts/anx/qag-enforcement-gate.mjs [WORK_PRODUCT_PATH]
```

#### Example

```bash
node scripts/anx/qag-enforcement-gate.mjs \
  PLATOPS-ANX-MISSION-ROUTER-WRAPPER-0022 \
  github-admin \
  proofs/anx/MISSION_ROUTER_PROOF_PACK_0022.md \
  docs/anx/MISSION_ROUTER_SPEC.md
```

---

## 5. Output Format

### 5.1 Success Output

```
╔════════════════════════════════════════════════════════════╗
║  QAG AGENT ARCHITECTURE ENFORCEMENT GATE                  ║
╚════════════════════════════════════════════════════════════╝

✅ PASS: All gate rules satisfied

Validated:
  ✓ Mission ID: PLATOPS-ANX-MISSION-ROUTER-WRAPPER-0022
  ✓ Agent: github-admin
  ✓ Receipts: proofs/anx/MISSION_ROUTER_PROOF_PACK_0022.md
  ✓ Work Product: docs/anx/MISSION_ROUTER_SPEC.md
```

### 5.2 Rejection Output

```
╔════════════════════════════════════════════════════════════╗
║  QAG AGENT ARCHITECTURE ENFORCEMENT GATE                  ║
╚════════════════════════════════════════════════════════════╝

❌ REJECTED: No mission ID

Errors:
  ✗ Mission ID is missing or empty
```

---

## 6. Integration Points

### 6.1 CI/CD Integration

Integrate the enforcement gate into CI/CD pipelines:

```yaml
# GitHub Actions example
- name: QAG Enforcement Gate
  run: |
    node scripts/anx/qag-enforcement-gate.mjs \
      "${{ env.MISSION_ID }}" \
      "${{ env.AGENT_OWNER }}" \
      "${{ env.RECEIPT_PATHS }}" \
      "${{ github.event.head_commit.message }}"
```

### 6.2 Pre-Commit Hook

Add as pre-commit hook:

```bash
#!/bin/bash
# .git/hooks/pre-commit

MISSION_ID=$(git log -1 --pretty=format:"%s" | grep -oE "[A-Z]+-[A-Z]+(-[A-Z]+)*-\d{4}" | head -1)
AGENT=$(git log -1 --pretty=format:"%s" | grep -oE "(github-admin|platops|qag|engdel|relops|proops|ocs)" | head -1)
RECEIPTS=$(git diff --cached --name-only | grep -E "proofs/.*\.md$" | tr '\n' ',')

if [ -z "$MISSION_ID" ] || [ -z "$AGENT" ] || [ -z "$RECEIPTS" ]; then
    echo "ERROR: Mission routing metadata required in commit message"
    exit 1
fi

node scripts/anx/qag-enforcement-gate.mjs "$MISSION_ID" "$AGENT" "$RECEIPTS"
```

### 6.3 Code Review Integration

Validate work products during code review:

```bash
# Validate all changed files
git diff --name-only origin/main...HEAD | while read file; do
    if [[ "$file" =~ \.(md|js|ts|tsx|mjs)$ ]]; then
        node scripts/anx/qag-enforcement-gate.mjs \
          "$MISSION_ID" \
          "$AGENT" \
          "$RECEIPTS" \
          "$file"
    fi
done
```

---

## 7. Validation Examples

### 7.1 Valid Work Product

**Mission ID:** `PLATOPS-ANX-MISSION-ROUTER-WRAPPER-0022`  
**Agent:** `github-admin`  
**Receipts:** `proofs/anx/MISSION_ROUTER_PROOF_PACK_0022.md`

**Result:** ✅ PASS

---

### 7.2 Missing Mission ID

**Mission ID:** (empty)  
**Agent:** `github-admin`  
**Receipts:** `proofs/anx/TEST.md`

**Result:** ❌ REJECTED: No mission ID

---

### 7.3 Missing Agent Owner

**Mission ID:** `PLATOPS-ANX-TEST-0022`  
**Agent:** (empty)  
**Receipts:** `proofs/anx/TEST.md`

**Result:** ❌ REJECTED: No named agent owner

---

### 7.4 Missing Receipt Paths

**Mission ID:** `PLATOPS-ANX-TEST-0022`  
**Agent:** `github-admin`  
**Receipts:** (empty)

**Result:** ❌ REJECTED: No receipt paths

---

### 7.5 Direct Execution Bypass

**Work Product:** `scripts/test.mjs` (contains no mission metadata)

**Result:** ❌ REJECTED: Direct execution bypass detected

---

## 8. Exit Codes

- `0` - All gate rules satisfied (PASS)
- `1` - One or more gate rules failed (REJECTED)

---

## 9. Warnings vs Errors

### 9.1 Errors (Rejection)

- Missing mission ID
- Missing agent owner
- Missing receipt paths
- Direct execution bypass detected

### 9.2 Warnings (Non-blocking)

- Agent owner not in standard list
- Receipt directory does not exist
- Receipt file does not exist
- Receipt file may not contain mission metadata
- Work product may not reference receipt paths

---

## 10. Troubleshooting

### 10.1 False Positives

If a valid work product is rejected:

1. Verify mission ID format matches: `<DEPARTMENT>-<PROJECT>-<DESCRIPTION>-<NUMBER>`
2. Ensure agent owner is specified
3. Confirm receipt paths are provided
4. Check work product contains mission metadata

### 10.2 Missing Receipt Files

If receipt files don't exist:

- Receipt files are created by the Mission Router wrapper
- Ensure wrapper was invoked before validation
- Check receipt paths are correct

---

## 11. Compliance Checklist

- [ ] Enforcement gate script implemented
- [ ] Gate rules documented
- [ ] Validation logic tested
- [ ] CI/CD integration configured
- [ ] Pre-commit hook installed (optional)
- [ ] Code review integration configured (optional)

---

## 12. References

- [Mission Router Specification](MISSION_ROUTER_SPEC.md)
- [Mission Router Usage Guide](MISSION_ROUTER_USAGE.md)
- [Claude Code Routing](CLAUDECODE_ROUTING.md)
- [Terminal Routing](TERMINAL_ROUTING.md)

---

*Enforcement gate specification for QAG-AGENT-ARCHITECTURE-ENFORCEMENT-GATE-0025. No secrets in this file.*
