# Idempotency Receipt — OCS-QREIL-GMAIL-INGEST-SMOKE-IDEMPOTENT-0003

**Mission:** OCS-QREIL-GMAIL-INGEST-SMOKE-IDEMPOTENT-0003  
**Owner:** ENGDEL → QAG  
**Date:** 2026-02-09  
**Scope:** Prove Gmail ingest is idempotent across two runs (no duplicates).

---

## 1. Idempotency Mechanism

### 1.1 Idempotency Key

**Table:** `source_items_raw`

**Key Fields:**
- `source` — Source identifier (e.g., `'gmail'`)
- `external_id` — External message ID (e.g., Gmail message ID)

**Constraint:** Unique constraint on `(source, external_id)` prevents duplicates.

### 1.2 Expected Behavior

| Run | Time Window | Messages Available | Items Ingested | Reason |
|-----|-------------|-------------------|----------------|--------|
| **Run 1** | 7 days | M messages | N items | New items inserted |
| **Run 2** | 7 days (same) | M messages (same) | 0 items | Items already exist (idempotency) |

**Note:** If new messages arrive between Run 1 and Run 2, only new messages should be ingested.

---

## 2. Test Procedure

### 2.1 Baseline: Count Before Run 1

**Query:**
```sql
SELECT COUNT(*) as baseline_count 
FROM source_items_raw 
WHERE source = 'gmail';
```

**Record:** Baseline count = B items

### 2.2 Run 1: Initial Ingest

**Command:**
```bash
node connectors/gmail/run-sync.mjs
```

**Query After Run 1:**
```sql
SELECT COUNT(*) as after_run1_count 
FROM source_items_raw 
WHERE source = 'gmail';
```

**Record:**
- After Run 1 count = R1 items
- Items ingested in Run 1 = R1 - B = N items

**Expected:** N > 0 (unless mailbox is empty)

### 2.3 Run 2: Idempotency Test

**Command:**
```bash
node connectors/gmail/run-sync.mjs
```

**Query After Run 2:**
```sql
SELECT COUNT(*) as after_run2_count 
FROM source_items_raw 
WHERE source = 'gmail';
```

**Record:**
- After Run 2 count = R2 items
- Items ingested in Run 2 = R2 - R1 = 0 items (expected)

**Expected:** R2 = R1 (no new items if no new messages)

### 2.4 Verify No Duplicates

**Query:**
```sql
SELECT external_id, source, COUNT(*) as count
FROM source_items_raw
WHERE source = 'gmail'
GROUP BY external_id, source
HAVING COUNT(*) > 1;
```

**Expected:** 0 rows (no duplicates)

---

## 3. Edge Cases

### 3.1 New Messages Between Runs

**Scenario:** New messages arrive between Run 1 and Run 2.

**Expected Behavior:**
- Run 2 should ingest only new messages
- Existing messages should not be duplicated

**Verification:**
```sql
-- Messages ingested in Run 2 (new since Run 1)
SELECT COUNT(*) as new_messages
FROM source_items_raw
WHERE source = 'gmail'
AND created_at > '<run1_timestamp>';
```

**Expected:** Count matches number of new messages (if any)

### 3.2 Same Message ID, Different Source

**Scenario:** Same `external_id` but different `source`.

**Expected Behavior:**
- Should be allowed (different sources)
- No conflict (idempotency key is `(source, external_id)`)

**Verification:**
```sql
SELECT external_id, COUNT(DISTINCT source) as source_count
FROM source_items_raw
WHERE external_id IN (
  SELECT external_id FROM source_items_raw WHERE source = 'gmail' LIMIT 10
)
GROUP BY external_id
HAVING COUNT(DISTINCT source) > 1;
```

**Expected:** Allowed (different sources can have same external_id)

---

## 4. Evidence Collection

### 4.1 Run 1 Evidence

| Metric | Value | Evidence Location |
|--------|-------|-------------------|
| **Baseline count** | B items | Supabase query before Run 1 |
| **After Run 1 count** | R1 items | Supabase query after Run 1 |
| **Items ingested** | N = R1 - B | Calculated |
| **Sync output** | Success | `connectors/gmail/run-sync.mjs` output |

### 4.2 Run 2 Evidence

| Metric | Value | Evidence Location |
|--------|-------|-------------------|
| **After Run 2 count** | R2 items | Supabase query after Run 2 |
| **Items ingested** | 0 = R2 - R1 | Calculated |
| **Sync output** | Success | `connectors/gmail/run-sync.mjs` output |

### 4.3 Duplicate Check Evidence

| Metric | Value | Evidence Location |
|--------|-------|-------------------|
| **Duplicate count** | 0 rows | Supabase query (GROUP BY with HAVING) |

---

## 5. QAG Acceptance Checks

- [ ] **Run 1 ingests N items:**
  - ✅ First ingest run completes successfully
  - ✅ N items ingested (N = R1 - B)
  - Evidence: Supabase query results

- [ ] **Run 2 ingests 0 new items:**
  - ✅ Second ingest run completes successfully
  - ✅ 0 new items ingested (R2 = R1)
  - Evidence: Supabase query results

- [ ] **No duplicates:**
  - ✅ No duplicate `(source, external_id)` pairs
  - Evidence: Supabase query returns 0 rows

- [ ] **Idempotency proven:**
  - ✅ Same time window, same messages → 0 new items
  - Evidence: Run 1 and Run 2 results

- [ ] **Verdict:** ⏳ **PENDING** — Awaiting execution

---

## 6. Receipt Status

| Criterion | Status |
|-----------|--------|
| Baseline count recorded | ⏳ Pending |
| Run 1 executed | ⏳ Pending |
| Run 1 count recorded | ⏳ Pending |
| Run 2 executed | ⏳ Pending |
| Run 2 count recorded | ⏳ Pending |
| Duplicate check executed | ⏳ Pending |
| Idempotency proven | ⏳ Pending |
| QAG acceptance | ⏳ Pending |

**Status:** **PENDING** — Awaiting execution of ingest runs and verification.

---

## 7. References

- [INGEST_SMOKE_RECEIPT.md](./INGEST_SMOKE_RECEIPT.md) — Ingest smoke test receipt
- [OAUTH_REFRESH_TOKEN_MINT_RECEIPT.md](../oauth/OAUTH_REFRESH_TOKEN_MINT_RECEIPT.md) — Refresh token minting receipt
- [docs/q-suite/OAUTH_CANON.md](../../docs/q-suite/OAUTH_CANON.md) — canonical project, client, variable names
