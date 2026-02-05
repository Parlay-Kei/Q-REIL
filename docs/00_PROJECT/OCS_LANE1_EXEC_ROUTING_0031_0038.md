# Lane 1 — OCS Execution Routing (0031–0038)

**Owner:** OCS  
**Purpose:** Paste-ready missions for agents. Run without manual UI steps unless unavoidable.  
**Kickoff:** [OCS_KICKOFF_REIL_LANE1_GMAIL_TO_LIVE.md](OCS_KICKOFF_REIL_LANE1_GMAIL_TO_LIVE.md)  
**Missing inputs:** [OCS_LANE1_MISSING_INPUTS_REGISTER.md](OCS_LANE1_MISSING_INPUTS_REGISTER.md)

---

## OCS Mission: LANE1 EXEC TRUTH AUDIT

| Field | Value |
|-------|--------|
| **Owner** | OCS |
| **Mission ID** | OCS-REIL-LANE1-AUDIT-EXEC-0031 |

**Prompt:**

Read all receipts referenced in your Lane 1 summary for 0021 to 0030.

Classify each mission as one of: **IN PLACE**, **EXECUTED**, **VERIFIED**, or **MISSING EVIDENCE**.

If any receipt exists but lacks concrete evidence fields (timestamps, counts, run output), mark it **MISSING EVIDENCE**.

Output a one page verdict: **Lane 1 PASS** or **Lane 1 BLOCKED**, with the exact missing evidence list and file paths.

**Acceptance criteria:**

- No secrets printed.
- Every ✅ claim is backed by receipt evidence or downgraded.

**Receipt path:** [proofs/reil-core/OCS-REIL-LANE1-AUDIT-EXEC-0031-verdict.md](../../proofs/reil-core/OCS-REIL-LANE1-AUDIT-EXEC-0031-verdict.md)

---

## Platform Ops: OAuth pointer discovery and token existence check

| Field | Value |
|-------|--------|
| **Owner** | Platform Ops |
| **Mission ID** | PLATOPS-REIL-OAUTH-POINTER-DISCOVERY-0032 |

**Prompt:**

Run Pointer Discovery Standard for Q REIL Gmail OAuth.

Locate any existing refresh token pointer in any store: repo docs, proofs, Vercel env names, GitHub secret names.

Confirm whether 0023 is already executed by checking for a filled receipt with real run evidence.

Produce a receipt with the canonical pointer names only and evidence paths.

**Acceptance criteria:**

- FOUND or NOT FOUND with a single minimal input.
- No values exposed.

---

## Platform Ops: OAuth mint execution (only if NOT FOUND)

| Field | Value |
|-------|--------|
| **Owner** | Platform Ops |
| **Mission ID** | PLATOPS-REIL-OAUTH-MINT-EXEC-0033 |

**Prompt:**

Preconditions: PLATOPS-0032 returns NOT FOUND or no valid token evidence.

Execute the one time Google consent flow to mint refresh token for the test mailbox.

Store token in the discovered canonical store (prefer Vercel prod env unless constrained).

Update `proofs/reil-core/PLATOPS-REIL-OAUTH-REFRESH-MINT-0023-receipt.md` with real timestamp and validation evidence (token present, scope list, redaction compliance).

**Stop conditions:**

If interactive consent requires a human operator, return **BLOCKED** with the minimal input “which Google account performs consent”.

---

## Platform Ops: Vercel prod env set verification

| Field | Value |
|-------|--------|
| **Owner** | Platform Ops |
| **Mission ID** | PLATOPS-REIL-VERCEL-PROD-ENV-VERIFY-0034 |

**Prompt:**

Verify the four Gmail keys in Vercel Production exist by name only.

If missing, set them and record verification.

Update `proofs/reil-core/PLATOPS-REIL-VERCEL-PROD-ENV-SET-GMAIL-0024-receipt.md` with evidence.

**Acceptance criteria:**

- Names only, no values.
- Evidence includes env inventory output redacted.

---

## Engineering Delivery: Ingest run execution

| Field | Value |
|-------|--------|
| **Owner** | Engineering Delivery |
| **Mission ID** | ENGDEL-REIL-GMAIL-INGEST-EXEC-0035 |

**Prompt:**

Preconditions: OAuth token exists and prod env pointer resolved.

Run the ingest job using canonical env resolution.

Record exit status, raw row count inserted, and attachment handling path if present.

Fill `proofs/reil-core/ENGDEL-REIL-GMAIL-INGEST-RUN-0025-receipt.md` with evidence.

**Acceptance criteria:**

- Exit 0.
- At least 1 raw row inserted, unless mailbox is empty, then document as EMPTY DATA with proof.

---

## QA Gatekeeper: Smoke plus idempotency proof

| Field | Value |
|-------|--------|
| **Owner** | QA Gatekeeper |
| **Mission ID** | QAG-REIL-INGEST-SMOKE-IDEMPOTENT-EXEC-0036 |

**Prompt:**

Run ingest twice with identical parameters.

Capture before and after counts per run and confirm zero duplicates on run two.

Stamp **PASS** or **FAIL** in `proofs/reil-core/QAG-REIL-GMAIL-INGEST-SMOKE-IDEMPOTENT-0026.md`.

**Acceptance criteria:**

- Second run produces zero duplicates.
- Evidence includes counts and a query or report reference path.

---

## Release Ops: Redeploy after env and live UI verification

| Field | Value |
|-------|--------|
| **Owner** | Release Ops |
| **Mission ID** | RELOPS-REIL-PROD-REDEPLOY-VERIFY-0037 |

**Prompt:**

Redeploy production after env is confirmed.

Verify Q Suite Inbox loads and shows live items when rows exist.

Verify safe fallback shows seed items when live is empty.

Update `proofs/reil-core/RELOPS-REIL-PROD-REDEPLOY-AFTER-GMAIL-0028-receipt.md`.

**Acceptance criteria:**

- Production READY.
- Inbox behavior matches spec.
- Evidence includes prod URL and commit SHA.

---

## OCS: Closeout (only after all above are VERIFIED)

| Field | Value |
|-------|--------|
| **Owner** | OCS |
| **Mission ID** | OCS-REIL-LANE1-CLOSEOUT-0038 |

**Prompt:**

Preconditions: 0031 verdict says VERIFIED for 0023 to 0028 and 0026 PASS.

Mark Lane 1 **PASS** and **REIL Live Data Enabled** in `docs/reil-core/REIL_CORE_CLOSEOUT.md`.

Update `docs/reil-core/MISSION_INDEX.md` with final links.

**Acceptance criteria:**

- No PASS without evidence.
- Link table is complete.

---

## Execution order

1. **0031** — OCS: Lane 1 exec truth audit (read receipts, classify, output verdict).
2. **0032** — PLATOPS: OAuth pointer discovery (FOUND / NOT FOUND).
3. **0033** — PLATOPS: OAuth mint (only if 0032 NOT FOUND).
4. **0034** — PLATOPS: Vercel prod env verify/set.
5. **0035** — ENGDEL: Ingest run.
6. **0036** — QAG: Ingest smoke + idempotency.
7. **0037** — RELOPS: Redeploy and live UI verify.
8. **0038** — OCS: Closeout (only after 0031 verdict VERIFIED and 0026 PASS).
