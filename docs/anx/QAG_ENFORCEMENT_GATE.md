# QAG Enforcement Gate

**OCS-MISSION:** QAG-ANX-ENFORCEMENT-GATE-0029  
**Owner:** QAG  
**Status:** Implemented  
**Version:** 1.0.0

---

## 1. Overview

The QAG Enforcement Gate automatically rejects any work product created outside the routed mission system. This ensures all work products include proper mission routing metadata.

---

## 2. Objective

Automatically reject any work product created outside the routed mission system, ensuring compliance with mission routing requirements.

---

## 3. Gate Rules

### 3.1 Gate Rule 1: Reject if no mission ID

**Rule:** Work product MUST include a valid mission ID.

**Validation:**
- Mission ID must be present and non-empty
- Mission ID must follow format: `<DEPARTMENT>-<PROJECT>-<DESCRIPTION>-<NUMBER>`
- Example: `PLATOPS-ANX-ENFORCEMENT-GATE-0029`

**Rejection Message:**
```
REJECTED: No mission ID
```

**Implementation:**
```javascript
if (!missionId || missionId.trim() === '') {
    this.errors.push('Mission ID is missing or empty');
    return false;
}
```

---

### 3.2 Gate Rule 2: Reject if no agent owner

**Rule:** Work product MUST specify a named agent owner.

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
REJECTED: No agent owner
```

**Implementation:**
```javascript
if (!agent || agent.trim() === '') {
    this.errors.push('Agent owner is missing or empty');
    return false;
}
```

---

### 3.3 Gate Rule 3: Reject if no receipt pack

**Rule:** Work product MUST specify receipt paths.

**Validation:**
- At least one receipt path must be provided
- Receipt paths must be non-empty
- Receipt files should exist (warning if missing)

**Rejection Message:**
```
REJECTED: No receipt pack
```

**Implementation:**
```javascript
if (!receiptPaths || receiptPaths.length === 0) {
    this.errors.push('Receipt paths are missing or empty');
    return false;
}
```

---

## 4. Implementation

### 4.1 Enforcement Script

**Location:** `scripts/anx/qag-enforcement-gate.mjs`

**Usage:**
```bash
node scripts/anx/qag-enforcement-gate.mjs <MISSION_ID> <AGENT> <RECEIPT_PATHS> [WORK_PRODUCT_PATH]
```

**Environment Variables:**
```bash
MISSION_ID=<id> AGENT_OWNER=<agent> RECEIPT_PATHS=<paths> node scripts/anx/qag-enforcement-gate.mjs [WORK_PRODUCT_PATH]
```

### 4.2 Example

```bash
node scripts/anx/qag-enforcement-gate.mjs \
  QAG-ANX-ENFORCEMENT-GATE-0029 \
  qag \
  proofs/anx/QAG_ENFORCEMENT_PROOF_0029.md \
  docs/anx/QAG_ENFORCEMENT_GATE.md
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
  ✓ Mission ID: QAG-ANX-ENFORCEMENT-GATE-0029
  ✓ Agent: qag
  ✓ Receipts: proofs/anx/QAG_ENFORCEMENT_PROOF_0029.md
  ✓ Work Product: docs/anx/QAG_ENFORCEMENT_GATE.md
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

Integrate into GitHub Actions workflows:

```yaml
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

**Mission ID:** `QAG-ANX-ENFORCEMENT-GATE-0029`  
**Agent:** `qag`  
**Receipts:** `proofs/anx/QAG_ENFORCEMENT_PROOF_0029.md`

**Result:** ✅ PASS

---

### 7.2 Missing Mission ID

**Mission ID:** (empty)  
**Agent:** `qag`  
**Receipts:** `proofs/anx/TEST.md`

**Result:** ❌ REJECTED: No mission ID

---

### 7.3 Missing Agent Owner

**Mission ID:** `QAG-ANX-TEST-0029`  
**Agent:** (empty)  
**Receipts:** `proofs/anx/TEST.md`

**Result:** ❌ REJECTED: No agent owner

---

### 7.4 Missing Receipt Pack

**Mission ID:** `QAG-ANX-TEST-0029`  
**Agent:** `qag`  
**Receipts:** (empty)

**Result:** ❌ REJECTED: No receipt pack

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

### 10.2 Missing Receipt Files

If receipt files don't exist:

- Receipt files are created by the choke point wrapper
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

- [Choke Point Wrapper Specification](CHOKEPOINT_WRAPPER_SPEC.md)
- [Client Routing Configuration](CLIENT_ROUTING.md)
- [Execution Entrypoint Map](../proofs/anx/EXECUTION_ENTRYPOINT_MAP_0026.md)

---

*Enforcement gate specification for QAG-ANX-ENFORCEMENT-GATE-0029. No secrets in this file.*
