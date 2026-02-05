# ENGDEL-REIL-ENTITY-RESOLUTION-0008 Receipt

**Ticket:** ENGDEL-REIL-ENTITY-RESOLUTION-0008  
**Owner:** Engineering Delivery  
**Status:** Delivered  
**Deliverable:** Matching logic (exact → fuzzy with threshold; Review Required when low confidence; never auto-merge below threshold) and test cases.

---

## 1. Deliverables

| Deliverable | Location | Description |
|-------------|----------|-------------|
| Entity resolution spec | `docs/reil-core/ENTITY_RESOLUTION.md` | Matching order, exact/fuzzy rules, Review Required, config |
| Receipt | `proofs/reil-core/ENGDEL-REIL-ENTITY-RESOLUTION-0008-receipt.md` | This file (with test cases) |

---

## 2. Implemented Behavior

### 2.1 Exact Match Rules First

- **Record key exact:** Match by address, parcel_number, listing_id, escrow_id (normalized, exact). Confidence 95–100. Rule name: `record_key_exact`.
- **Contact exact:** Match by email (normalized lowercase). Confidence 95–100. Rule name: `contact_email_exact`, `contact_to_record_promotion` when single Record.
- **Order:** Record key exact runs first; then contact exact; first successful link wins (per policy).

Documented in `docs/reil-core/ENTITY_RESOLUTION.md` §3.

### 2.2 Fuzzy Fallback with Threshold

- **When:** Only when no exact match produced a link.
- **Record key fuzzy:** Address/parcel/listing/escrow similarity (e.g. trigram, typo-tolerant). Rule name: `record_key_fuzzy`.
- **Party fuzzy:** Email/name similarity. Rule name: `contact_email_fuzzy`.
- **Threshold:** Configurable (default 70). Only candidates with score ≥ threshold are eligible for auto-attach.

Documented in `docs/reil-core/ENTITY_RESOLUTION.md` §4.

### 2.3 Review Required When Confidence Is Low

- **When:** Best candidate score < threshold, or multiple candidates (ambiguity).
- **Where:** Normalized item `payload.match_status = 'review_required'`, `payload.candidate_record_ids`, `payload.match_confidence`, `payload.match_rule`.
- **Effect:** No `record_links` row created; item appears in review queue for manual resolution.

Documented in `docs/reil-core/ENTITY_RESOLUTION.md` §5.

### 2.4 Never Auto-Merge Below Threshold

- **Rule:** If best score < `MATCH_THRESHOLD` (e.g. 70), the system must **not** create a `record_links` row.
- **Enforcement:** Matching implementation must check threshold before inserting any rule/system link.

Documented in `docs/reil-core/ENTITY_RESOLUTION.md` §2.2, §4.2, §4.3.

---

## 3. Test Cases

### 3.1 Exact Match — Record Key

| Case | Input | Expected |
|------|--------|----------|
| E1 | Normalized item with `detected_record_key.address = "123 Main St"`; one Record with title/address "123 Main St" | One link created; `link_method = 'rule'`, `confidence = 95–100`, `rule_name = 'record_key_exact'` |
| E2 | Same address, two Records match | No link; `match_status = 'review_required'`, `candidate_record_ids` length 2 |
| E3 | Same; zero Records match | No link; `match_status = 'review_required'` or `'unmatched'`; optional `candidate_record_ids = []` |

### 3.2 Exact Match — Contact (Email)

| Case | Input | Expected |
|------|--------|----------|
| E4 | Normalized item with party email `jane@example.com`; one Contact with email `jane@example.com` | Link to Contact; if Contact has exactly one active Record, link to Record too |
| E5 | Same email; two Contacts | Link only to Contact if unique match; else Review Required |
| E6 | Same email; Contact has two active Records | Link to Contact only; `match_status = 'review_required'` for Record; do not auto-attach to Record |

### 3.3 Fuzzy Fallback with Threshold

| Case | Input | Expected |
|------|--------|----------|
| F1 | No exact match; fuzzy best score 75, threshold 70 | One link created (best candidate); `confidence = 75`, `rule_name` fuzzy |
| F2 | No exact match; fuzzy best score 65, threshold 70 | No link; `match_status = 'review_required'`, `match_confidence = 65` |
| F3 | No exact match; fuzzy best score 70, threshold 70 | One link created (boundary) |

### 3.4 Never Auto-Merge Below Threshold

| Case | Input | Expected |
|------|--------|----------|
| N1 | Best candidate score 69, threshold 70 | No `record_links` row; normalized payload has `match_status = 'review_required'` |
| N2 | Best candidate score 70, threshold 70 | One `record_links` row created |
| N3 | Best candidate score 0 (no match) | No link; `match_status = 'unmatched'` or `'review_required'` |

### 3.5 Review Required State

| Case | Input | Expected |
|------|--------|----------|
| R1 | Ambiguous (multiple candidates) | `payload.match_status = 'review_required'`, `candidate_record_ids` or `candidate_contact_ids` populated |
| R2 | Below threshold | Same; no `record_links` row |
| R3 | Manual attach after review | New `record_links` row with `link_method = 'manual'`; optional `confidence = 100` |

---

## 4. Acceptance

- [x] Exact match rules defined and run first
- [x] Fuzzy fallback with configurable threshold defined
- [x] Review Required state defined when confidence is low or ambiguous
- [x] Never auto-merge below threshold specified and test cases added
- [x] Deliverable: `proofs/reil-core/ENGDEL-REIL-ENTITY-RESOLUTION-0008-receipt.md` with test cases
- [x] Spec: `docs/reil-core/ENTITY_RESOLUTION.md` created
