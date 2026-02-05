# QAG-REIL-NORMALIZE-MATCH-QA-0009 Proof

**Ticket:** QAG-REIL-NORMALIZE-MATCH-QA-0009  
**Owner:** QA Gatekeeper  
**Status:** Verification criteria and evidence template  
**Deliverable:** Evidence that normalized rows are created, matches create or attach to a record, and low-confidence flows land in Review Required.

---

## 1. Prerequisites

- Supabase project with migrations applied (`source_items_raw`, `source_items_normalized`, `records`, `record_links`, etc.).
- Normalization pipeline implemented per `docs/reil-core/NORMALIZATION_RULES.md`.
- Entity resolution (matching) implemented per `docs/reil-core/ENTITY_RESOLUTION.md`.
- Test data: raw items that produce at least one high-confidence match, one low-confidence case, and one ambiguous case (if feasible).

---

## 2. Verification Steps

### 2.1 Normalized Rows Created

**Step:** Run normalization on raw items (e.g. after ingestion or via a normalization job).

**Evidence:**

- **source_items_normalized:** Rows exist for each raw item (or per idempotency_key policy). Query:
  - `SELECT id, idempotency_key, normalized_type, payload->'detected_parties' AS parties, payload->'detected_record_key' AS record_key, payload->'document_type' AS doc_type, payload->'item_confidence' AS item_conf FROM source_items_normalized WHERE org_id = :org_id LIMIT 20;`
- **Payload shape:** For at least one row, `payload` contains:
  - `detected_parties` (array, possibly empty), and/or
  - `detected_record_key` (object, possibly empty), and/or
  - `document_type` (string), and
  - `item_confidence` or `field_confidence` (numbers).

**Example evidence table:**

| Check | Query / action | Expected | Actual |
|-------|----------------|----------|--------|
| Normalized rows exist | `SELECT COUNT(*) FROM source_items_normalized WHERE org_id = :org_id` | ≥ 1, matches or derives from raw count | _fill after run_ |
| Payload has parties/record_key/doc_type | Inspect one row `payload` | Has at least one of detected_parties, detected_record_key, document_type | _fill after run_ |
| Confidence present | Same row `payload` | Has item_confidence and/or field_confidence | _fill after run_ |

---

### 2.2 Matches Create or Attach to a Record

**Step:** For a normalized item that has a high-confidence match (exact or fuzzy ≥ threshold), run matching (or ensure pipeline runs matching after normalization).

**Evidence:**

- **record_links:** A row exists with `source_type` = document/message/thread as appropriate, `target_type` = record, `target_id` = a valid record id, `link_method` = rule or system, and `confidence` ≥ threshold.
- **Query example:**  
  `SELECT rl.id, rl.source_type, rl.source_id, rl.target_type, rl.target_id, rl.confidence, rl.link_method, rl.rule_name FROM record_links rl WHERE rl.target_type = 'record' AND rl.org_id = :org_id ORDER BY rl.linked_at DESC LIMIT 10;`

**Example evidence table:**

| Check | Query / action | Expected | Actual |
|-------|----------------|----------|--------|
| Link to record exists | Query `record_links` where target_type = 'record' | ≥ 1 row for high-confidence match scenario | _fill after run_ |
| Confidence ≥ threshold | Same row(s) `confidence` | ≥ configured threshold (e.g. 70) | _fill after run_ |
| link_method | Same row(s) | rule or system (not manual for auto-match) | _fill after run_ |

---

### 2.3 Low-Confidence Flows Land in Review Required

**Step:** Use a normalized item that has no exact match and best fuzzy score below threshold (or force a test case with low score).

**Evidence:**

- **No record_links row** created for that item (for target_type = record).
- **Normalized payload:** For that item, `payload.match_status` = `'review_required'` (or equivalent). Optionally `payload.match_confidence` < threshold and/or `payload.candidate_record_ids` present.
- **Query example:**  
  `SELECT id, idempotency_key, payload->'match_status' AS match_status, payload->'match_confidence' AS match_conf FROM source_items_normalized WHERE org_id = :org_id AND (payload->>'match_status') = 'review_required' LIMIT 10;`

**Example evidence table:**

| Check | Query / action | Expected | Actual |
|-------|----------------|----------|--------|
| No auto-link for low confidence | Ensure no record_links row for source_id of low-confidence item | No row with link_method = rule/system for that source | _fill after run_ |
| match_status = review_required | Select normalized rows where match_status = 'review_required' | ≥ 1 row when low-confidence scenario is run | _fill after run_ |
| match_confidence below threshold | payload.match_confidence for those rows | < configured threshold (e.g. 70) | _fill after run_ |

---

## 3. Run Output (Evidence Snippet)

Attach or paste a short summary, e.g.:

- **Normalization run:** Count of rows upserted into `source_items_normalized`, and sample idempotency_key list.
- **Matching run:** Count of links created (rule/system), count of items left in Review Required.
- **Sample payload (high-confidence):** One normalized row that got a record link (redact PII if needed).
- **Sample payload (review_required):** One normalized row with `match_status = 'review_required'`.

---

## 4. Verdict

- **Normalized rows created:** _Pass / Fail / Blocked (reason)_  
- **Matches create or attach to a record:** _Pass / Fail / Blocked (reason)_  
- **Low-confidence flows land in Review Required:** _Pass / Fail / Blocked (reason)_  

**Overall:** _Pass / Fail_

---

*Proof template for QAG-REIL-NORMALIZE-MATCH-QA-0009. Fill “Actual” and “Verdict” after running normalization and matching and executing the queries above.*
