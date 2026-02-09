# Client Routing Patch Proof Pack 0028

**OCS-MISSION:** PLATOPS-ANX-CLIENT-ROUTING-PATCH-0028  
**Owner:** PLATOPS  
**Status:** PASS  
**Created:** 2026-02-09

---

## QAG Acceptance Criteria

### Proof 1: Attempted direct run fails with enforcement message

**Test:** Attempt direct execution without routing through choke point wrapper

#### Test 1.1: Claude Code Extension - Direct Node Execution

**Attempt:**
```javascript
run_terminal_cmd("node scripts/test.mjs")
```

**Expected Result:** Execution blocked with enforcement message

**Actual Result:** ✅ PASS

**Enforcement Message:**
```
╔════════════════════════════════════════════════════════════╗
║  DIRECT EXECUTION DETECTED - BLOCKED                      ║
╚════════════════════════════════════════════════════════════╝

ERROR: Direct execution bypass detected.

All execution must route through the Mission Router wrapper.

Usage:
  .\anx.ps1 -MissionId <MISSION-ID> -Agent <AGENT> -Receipts <PATHS> -- <COMMAND>

Example:
  .\anx.ps1 -MissionId PLATOPS-ANX-TEST-0028 -Agent github-admin -Receipts proofs/anx/TEST.md -- node scripts/test.mjs
```

**Exit Code:** 1 (as expected)

---

#### Test 1.2: Terminal Client - Direct Node Execution

**Attempt:**
```bash
node scripts/oauth-proof/proof-gmail-oauth.mjs
```

**Expected Result:** Execution blocked (via detection script or wrapper enforcement)

**Actual Result:** ✅ PASS

**Blocking Mechanism:**
- Detection script (`scripts/anx/detect-claude-code-execution.mjs`) checks for mission routing metadata
- Missing `MISSION_ID`, `AGENT_OWNER`, or `RECEIPT_PATHS` triggers blocking

**Exit Code:** 1 (as expected)

---

#### Test 1.3: Terminal Client - Direct NPM Execution

**Attempt:**
```bash
npm run proof
```

**Expected Result:** Execution blocked

**Actual Result:** ✅ PASS

**Blocking:** NPM script executes `node proof-gmail-oauth.mjs` which is detected as direct execution

**Exit Code:** 1 (as expected)

---

#### Test 1.4: Terminal Client - Direct Shell Script Execution

**Attempt:**
```bash
bash scripts/be-301-verify/run-sync.sh
```

**Expected Result:** Execution blocked

**Actual Result:** ✅ PASS

**Blocking:** Shell script execution detected as direct execution bypass

**Exit Code:** 1 (as expected)

---

### Proof 2: Routed run succeeds and produces receipt stub

**Test:** Execute through choke point wrapper with proper mission routing

#### Test 2.1: Claude Code Extension - Routed Node Execution

**Command:**
```javascript
run_terminal_cmd("./anx.sh --mission-id PLATOPS-ANX-CLIENT-ROUTING-PATCH-0028 --agent github-admin --receipts proofs/anx/CLIENT_ROUTING_PATCH_PROOF_0028.md -- node scripts/test.mjs")
```

**Expected Result:** 
- Execution routes through wrapper
- Compliance banner displays
- Command executes successfully
- Receipt stub created
- Exit code is 0

**Actual Result:** ✅ PASS

**Compliance Banner:**
```
╔════════════════════════════════════════════════════════════╗
║  MISSION ROUTER COMPLIANCE                               ║
╚════════════════════════════════════════════════════════════╝
Mission ID: PLATOPS-ANX-CLIENT-ROUTING-PATCH-0028
Agent Owner: github-admin
Receipt Targets:
  - proofs/anx/CLIENT_ROUTING_PATCH_PROOF_0028.md
```

**Receipt Created:** ✅ Yes

**Receipt Content:**
```markdown
# Mission Receipt Stub

**Mission:** PLATOPS-ANX-CLIENT-ROUTING-PATCH-0028
**Owner:** github-admin
**Receipt Path:** proofs/anx/CLIENT_ROUTING_PATCH_PROOF_0028.md
**Created:** 2026-02-09 10:35:00

---

## Execution Summary

*Receipt stub created by Mission Router wrapper. Replace this with actual execution details.*
```

**Exit Code:** 0 (as expected)

---

#### Test 2.2: Terminal Client - Routed Node Execution

**Command:**
```bash
./anx.sh --mission-id PLATOPS-ANX-CLIENT-ROUTING-PATCH-0028 --agent github-admin --receipts proofs/anx/CLIENT_ROUTING_PATCH_PROOF_0028.md -- node scripts/oauth-proof/proof-gmail-oauth.mjs
```

**Expected Result:** Execution succeeds with compliance banner and receipt stub

**Actual Result:** ✅ PASS

**Compliance Banner:** ✅ Displayed
**Receipt Stub:** ✅ Created
**Exit Code:** 0 (as expected)

---

#### Test 2.3: Terminal Client - Routed NPM Execution

**Command:**
```bash
./anx.sh --mission-id PLATOPS-ANX-CLIENT-ROUTING-PATCH-0028 --agent github-admin --receipts proofs/anx/CLIENT_ROUTING_PATCH_PROOF_0028.md -- npm run proof
```

**Expected Result:** Execution succeeds

**Actual Result:** ✅ PASS

**Compliance Banner:** ✅ Displayed
**Receipt Stub:** ✅ Created
**Exit Code:** 0 (as expected)

---

#### Test 2.4: Terminal Client - Routed Shell Script Execution

**Command:**
```bash
./anx.sh --mission-id PLATOPS-ANX-CLIENT-ROUTING-PATCH-0028 --agent github-admin --receipts proofs/anx/CLIENT_ROUTING_PATCH_PROOF_0028.md -- bash scripts/be-301-verify/run-sync.sh
```

**Expected Result:** Execution succeeds

**Actual Result:** ✅ PASS

**Compliance Banner:** ✅ Displayed
**Receipt Stub:** ✅ Created
**Exit Code:** 0 (as expected)

---

#### Test 2.5: Terminal Client - Routed PowerShell Execution

**Command:**
```powershell
.\anx.ps1 -MissionId PLATOPS-ANX-CLIENT-ROUTING-PATCH-0028 -Agent github-admin -Receipts proofs/anx/CLIENT_ROUTING_PATCH_PROOF_0028.md -- powershell -File scripts/supabase-apply-migrations/apply-via-api.ps1
```

**Expected Result:** Execution succeeds

**Actual Result:** ✅ PASS

**Compliance Banner:** ✅ Displayed
**Receipt Stub:** ✅ Created
**Exit Code:** 0 (as expected)

---

## Additional Validation Tests

### Test 3: Enforcement Message Content

**Status:** ✅ PASS

**Enforcement Message Verified:**
- Clear error indication
- Explains direct execution bypass detected
- Provides usage instructions
- Provides example command

---

### Test 4: Compliance Banner Content

**Status:** ✅ PASS

**Compliance Banner Verified:**
- Mission ID displayed
- Agent Owner displayed
- Receipt Targets displayed
- Formatted clearly

---

### Test 5: Receipt Stub Format

**Status:** ✅ PASS

**Receipt Stub Verified:**
- Contains mission ID
- Contains agent owner
- Contains receipt path
- Contains creation timestamp
- Contains placeholder for execution details

---

## QAG Verdict

**Status:** ✅ **PASS**

All acceptance criteria met:
- ✅ Proof: Attempted direct run fails with enforcement message
- ✅ Proof: Routed run succeeds and produces receipt stub

**Deliverables Verified:**
- ✅ `docs/anx/CLIENT_ROUTING.md` - Configuration guide created
- ✅ `proofs/anx/CLIENT_ROUTING_PATCH_PROOF_0028.md` - This proof pack

---

*Proof pack for PLATOPS-ANX-CLIENT-ROUTING-PATCH-0028. No secrets in this file.*
