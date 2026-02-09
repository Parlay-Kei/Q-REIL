# Ingest Smoke Receipt — OCS-QREIL-GMAIL-INGEST-SMOKE-IDEMPOTENT-0003

**Mission:** OCS-QREIL-GMAIL-INGEST-SMOKE-IDEMPOTENT-0003  
**Owner:** ENGDEL → QAG  
**Date:** 2026-02-09  
**Scope:** Run Gmail ingest twice and prove second run does not duplicate items.

---

## 1. Prerequisites

### OAuth Client

| Field | Value |
|-------|-------|
| **Client ID** | `[REDACTED].apps.googleusercontent.com` |
| **Client Type** | Desktop |
| **GCP Project** | `qreil-486018` |

### Token

| Source | Location | Status |
|--------|----------|--------|
| **Refresh Token** | `scripts/oauth-proof/.tokens.json` or `GMAIL_REFRESH_TOKEN` env | ⏳ To be verified |

### Supabase

| Field | Value |
|-------|-------|
| **Project Ref** | `umzuncubiizoomoxlgts` |
| **Service Role Key** | Set in env (`SUPABASE_SERVICE_ROLE_KEY`) |

---

## 2. Run 1: Initial Ingest

### 2.1 Execute Ingest

**Command:**
```bash
node connectors/gmail/run-sync.mjs
```

**Expected Behavior:**
1. Loads env from repo root `.env.local` (canonical vault)
2. Creates OAuth2 client using `GMAIL_CLIENT_ID` and `GMAIL_CLIENT_SECRET`
3. Reads refresh token and refreshes access token
4. Calls Gmail API to list messages (default: 7-day window)
5. Ingests messages to Supabase `source_items_raw` table
6. Normalizes items (if normalization enabled)

**Success Indicators:**
- ✅ No OAuth errors (`deleted_client`, `unauthorized_client`)
- ✅ No Gmail API errors (`403 Access Not Configured`, `401 Unauthorized`)
- ✅ Sync completes successfully
- ✅ Messages ingested (count: N items)

### 2.2 Record Run 1 Results

| Metric | Value | Evidence |
|--------|-------|----------|
| **Messages ingested** | N items | Sync output or Supabase query |
| **Time window** | 7 days (default) | Sync output |
| **OAuth status** | Success | No errors in output |
| **Gmail API status** | Success | No 403/401 errors |

**Query Supabase:**
```sql
SELECT COUNT(*) as ingested_count 
FROM source_items_raw 
WHERE source = 'gmail' 
AND created_at >= NOW() - INTERVAL '10 minutes';
```

**Expected:** N items ingested

---

## 3. Run 2: Idempotency Test

### 3.1 Execute Second Ingest

**Command:**
```bash
node connectors/gmail/run-sync.mjs
```

**Expected Behavior:**
- Same as Run 1, but should detect existing items and skip duplicates

**Success Indicators:**
- ✅ No OAuth errors
- ✅ No Gmail API errors
- ✅ Sync completes successfully
- ✅ **0 new items ingested** (idempotency working)

### 3.2 Record Run 2 Results

| Metric | Value | Evidence |
|--------|-------|----------|
| **Messages ingested** | 0 items (new) | Sync output or Supabase query |
| **Time window** | Same as Run 1 | Sync output |
| **OAuth status** | Success | No errors in output |
| **Gmail API status** | Success | No 403/401 errors |
| **Idempotency** | ✅ Working | No duplicates created |

**Query Supabase:**
```sql
SELECT COUNT(*) as new_count 
FROM source_items_raw 
WHERE source = 'gmail' 
AND created_at >= NOW() - INTERVAL '10 minutes';
```

**Expected:** 0 new items (or same count as Run 1 if no new messages)

**Verify No Duplicates:**
```sql
SELECT external_id, source, COUNT(*) as count
FROM source_items_raw
WHERE source = 'gmail'
GROUP BY external_id, source
HAVING COUNT(*) > 1;
```

**Expected:** 0 rows (no duplicates)

---

## 4. UI Verification

### 4.1 Check UI Shows Items

**Location:** Q REIL UI (if deployed)

**Expected:**
- ✅ Items appear in inbox/list view
- ✅ Normalized metadata visible (from, to, subject, etc.)
- ✅ No duplicate items shown

**If UI not available:**
- Verify via Supabase queries (see above)

---

## 5. QAG Acceptance Checks

- [ ] **Run 1 ingests N items:**
  - ✅ First ingest run completes successfully
  - ✅ N items ingested to `source_items_raw` table
  - Evidence: Sync output or Supabase query

- [ ] **Run 2 ingests 0 new items:**
  - ✅ Second ingest run completes successfully
  - ✅ 0 new items ingested (same time window)
  - Evidence: Sync output or Supabase query

- [ ] **No duplicates:**
  - ✅ No duplicate `external_id` entries for same `source`
  - Evidence: Supabase query shows 0 duplicates

- [ ] **UI shows items:**
  - ✅ Items visible in UI (if available)
  - ✅ Normalized metadata displayed
  - Evidence: Screenshot or UI inspection

- [ ] **Verdict:** ⏳ **PENDING** — Awaiting execution

---

## 6. Receipt Status

| Criterion | Status |
|-----------|--------|
| Run 1 executed | ⏳ Pending |
| Run 1 ingested N items | ⏳ Pending |
| Run 2 executed | ⏳ Pending |
| Run 2 ingested 0 new items | ⏳ Pending |
| No duplicates verified | ⏳ Pending |
| UI shows items | ⏳ Pending |
| QAG acceptance | ⏳ Pending |

**Status:** **PENDING** — Awaiting execution of ingest runs.

---

## 7. References

- [IDEMPOTENCY_RECEIPT.md](./IDEMPOTENCY_RECEIPT.md) — Detailed idempotency verification receipt
- [OAUTH_REFRESH_TOKEN_MINT_RECEIPT.md](../oauth/OAUTH_REFRESH_TOKEN_MINT_RECEIPT.md) — Refresh token minting receipt
- [docs/q-suite/OAUTH_CANON.md](../../docs/q-suite/OAUTH_CANON.md) — canonical project, client, variable names
