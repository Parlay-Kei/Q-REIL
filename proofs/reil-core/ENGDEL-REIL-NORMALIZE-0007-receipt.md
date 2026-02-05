# ENGDEL-REIL-NORMALIZE-RULES-0007 Receipt

**Ticket:** ENGDEL-REIL-NORMALIZE-RULES-0007  
**Owner:** Engineering Delivery  
**Status:** Delivered  
**Deliverable:** Normalization rules that map raw items into normalized fields; documentation and receipt.

---

## 1. Deliverables

| Deliverable | Location | Description |
|-------------|----------|-------------|
| Normalization rules | `docs/reil-core/NORMALIZATION_RULES.md` | Rules for mapping raw → normalized fields |
| Receipt | `proofs/reil-core/ENGDEL-REIL-NORMALIZE-0007-receipt.md` | This file |

---

## 2. Normalized Fields Defined

### 2.1 Detected Parties (names, emails, phones)

- **Shape:** `payload.detected_parties` — array of `{ name?, email?, phone?, role?, confidence? }`.
- **Sources:** Gmail headers (From/To/Cc), MLS/Skyslope party fields, document metadata.
- **Confidence:** Per-party 0–100; stored in each entry and aggregated in `field_confidence.parties`.

See `docs/reil-core/NORMALIZATION_RULES.md` §3.

### 2.2 Detected Record Key (address, parcel number, listing id, escrow id)

- **Shape:** `payload.detected_record_key` — `{ address?, parcel_number?, listing_id?, escrow_id?, confidence? }`.
- **Sources:** Subject/body/filename regex, connector-native fields (MLS, Skyslope).
- **Confidence:** Per-block 0–100; stored in `detected_record_key.confidence` and `field_confidence.record_key`.

See `docs/reil-core/NORMALIZATION_RULES.md` §4.

### 2.3 Document Type Classification

- **Values:** `contract`, `disclosure`, `inspection`, `invoice`, `other`.
- **Shape:** `payload.document_type`, `payload.document_type_confidence`.
- **Sources:** Filename/subject/body keywords; fallback `other` with confidence 50 or omit.

See `docs/reil-core/NORMALIZATION_RULES.md` §5.

### 2.4 Confidence Score (per field and per item)

- **Per field:** `payload.field_confidence` — `{ parties?, record_key?, document_type? }` (0–100 each).
- **Per item:** `payload.item_confidence` — 0–100 (e.g. minimum of non-null field confidences).

See `docs/reil-core/NORMALIZATION_RULES.md` §6.

---

## 3. Acceptance

- [x] Detected parties (names, emails, phones) defined with confidence
- [x] Detected record key (address, parcel number, listing id, escrow id) defined with confidence
- [x] Document type classification (contract, disclosure, inspection, invoice, other) defined
- [x] Confidence score per field and per item defined
- [x] Deliverable: `docs/reil-core/NORMALIZATION_RULES.md` created
- [x] Deliverable: `proofs/reil-core/ENGDEL-REIL-NORMALIZE-0007-receipt.md` created
