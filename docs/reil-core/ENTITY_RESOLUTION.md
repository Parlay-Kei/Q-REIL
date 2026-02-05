# REIL Core Entity Resolution (Matching)

**Ticket:** ENGDEL-REIL-ENTITY-RESOLUTION-0008  
**Owner:** Engineering Delivery  
**Status:** Defined  
**Version:** 1.0.0

---

## 1. Overview

Entity resolution matches normalized source items to canonical entities (Records, Contacts). Rules run in order: exact match first, then fuzzy fallback up to a threshold. When confidence is below the threshold, items are placed in **Review Required** and are **never auto-merged**.

---

## 2. Matching Order

### 2.1 Priority

1. **Exact match rules** — Run first. High confidence (e.g. 95–100).
2. **Fuzzy fallback** — Run only when no exact match; apply threshold (e.g. ≥ 70).
3. **Below threshold** — Do not create or attach link; set **Review Required** state.

### 2.2 Never Auto-Merge Below Threshold

- If the best candidate score is below the configured threshold (e.g. 70), the system must **not** create a `record_links` row.
- Instead, store match candidates and status on the normalized item (e.g. `payload.match_status = 'review_required'`, `payload.candidate_record_ids`, `payload.match_confidence`).
- A human or separate workflow can later promote a candidate to a real link (e.g. via manual attach).

---

## 3. Exact Match Rules

### 3.1 Record Key Exact Match

- **Input:** `detected_record_key` from normalized payload (address, parcel_number, listing_id, escrow_id).
- **Rule:** Query `records` (and underlying property/deal tables if needed) by:
  - **address:** Normalize (lowercase, trim, collapse spaces); exact or canonical form match.
  - **parcel_number:** Exact string match (after normalization).
  - **listing_id:** Exact match on external listing id.
  - **escrow_id:** Exact match on escrow/transaction id.
- **Output:** If exactly one record matches → attach with `link_method = 'rule'`, `confidence = 95–100`, `rule_name = 'record_key_exact'`.
- **Ambiguity:** If more than one record matches → do not auto-attach; set Review Required with candidate IDs.

### 3.2 Contact (Party) Exact Match

- **Input:** `detected_parties[].email` (and optionally phone).
- **Rule:** Query contacts by `email` (normalized lowercase). Exact match.
- **Output:** If exactly one contact matches → can link to Contact; if that contact has exactly one active Record, optionally also link to Record (per CONTACT_TO_RECORD_PROMOTION). Confidence 95–100.
- **Ambiguity:** Multiple contacts or multiple records → link only to Contact if unique; otherwise Review Required.

### 3.3 Rule Names (for ledger/debug)

- `record_key_exact` — Record matched by address/parcel/listing/escrow.
- `contact_email_exact` — Contact matched by email.
- `contact_to_record_promotion` — Record linked via single Contact–Record association.

---

## 4. Fuzzy Fallback

### 4.1 When to Run

- Only when **no** exact match rule produced a link.
- Apply to record key and/or party fields as configured.

### 4.2 Record Key Fuzzy

- **Address:** Normalize; then use similarity (e.g. trigram, Levenshtein) or token overlap. Score 0–100.
- **Parcel / listing / escrow:** Typo-tolerant match (e.g. one character difference); score 85–95.
- **Threshold:** Only consider candidates with score ≥ configured threshold (e.g. 70). If best score < threshold → Review Required; do not create link.

### 4.3 Party Fuzzy

- **Email:** Domain match or typo-tolerant local part; score typically 70–90.
- **Name:** Token overlap or similarity; score 70–85. Use only as supporting signal; prefer email/phone for identity.
- **Threshold:** Same as above; never auto-merge below threshold.

### 4.4 Fuzzy Rule Names

- `record_key_fuzzy` — Record matched by fuzzy address/parcel/listing/escrow.
- `contact_email_fuzzy` — Contact matched by fuzzy email/name.

---

## 5. Review Required State

### 5.1 When to Set

- No exact match **and** best fuzzy score < threshold.
- Exact or fuzzy match produced **multiple** candidates (ambiguity).
- Explicit rule (e.g. AMBIGUOUS_MULTI_RECORD) that defers to human.

### 5.2 Where to Store

- **Normalized item payload:**
  - `match_status`: `'review_required'`
  - `candidate_record_ids`: `[uuid, ...]` (optional; top N candidates)
  - `candidate_contact_ids`: `[uuid, ...]` (optional)
  - `match_confidence`: best score (0–100)
  - `match_rule`: rule name that produced candidates (or `null`)

- **No `record_links` row** is created for Review Required items until a human (or approved workflow) confirms.

### 5.3 Downstream Behavior

- UI/API can list items with `match_status = 'review_required'` for a review queue.
- Manual attach creates a `record_links` row with `link_method = 'manual'` and optional `confidence = 100`.

---

## 6. Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `MATCH_THRESHOLD` | Minimum confidence (0–100) to auto-attach | 70 |
| `FUZZY_ENABLED` | Whether to run fuzzy fallback | true |
| `MAX_CANDIDATES_REVIEW` | Max candidate IDs to store for review | 5 |

---

## 7. References

- Normalization rules: `docs/reil-core/NORMALIZATION_RULES.md`
- Record links schema: `record_links` in `docs/02_DATA/migrations/00030_create_mail_tables.sql` (confidence, link_method, rule_name)
- Rule engine (inbox): `docs/05_INBOX/rule-engine-spec.md`
