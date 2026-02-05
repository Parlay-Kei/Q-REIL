# REIL Core Normalization Rules

**Ticket:** ENGDEL-REIL-NORMALIZE-RULES-0007  
**Owner:** Engineering Delivery  
**Status:** Defined  
**Version:** 1.0.0

---

## 1. Overview

This document defines how raw source items (`source_items_raw`) are mapped into normalized fields stored in `source_items_normalized.payload`. All connectors (Gmail, MLS, Skyslope, etc.) produce raw payloads; the normalization layer extracts canonical fields, assigns confidence per field and per item, and feeds entity resolution.

---

## 2. Normalized Payload Shape

The `source_items_normalized` table stores:

- `idempotency_key`, `source_type`, `normalized_type` (e.g. `message`, `thread`, `document`, `attachment`)
- `payload` (JSONB) — canonical extracted fields plus confidence

### 2.1 Standard Payload Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `detected_parties` | array | No | List of `{ name?, email?, phone?, role?, confidence? }` |
| `detected_record_key` | object | No | `{ address?, parcel_number?, listing_id?, escrow_id?, confidence? }` |
| `document_type` | string | No | One of: `contract`, `disclosure`, `inspection`, `invoice`, `other` |
| `document_type_confidence` | number | No | 0–100 for document_type classification |
| `field_confidence` | object | No | Per-field confidence: `{ parties: number, record_key: number, document_type: number }` |
| `item_confidence` | number | No | Overall item confidence 0–100 (derived or minimum of field confidences) |
| `match_status` | string | No | `matched`, `review_required`, `unmatched` (set by entity resolution) |
| Connector-specific | — | — | Preserve needed keys (e.g. `subject`, `snippet`, `from`, `to` for messages) |

---

## 3. Detected Parties

**Purpose:** Extract people and organizations (names, emails, phones) from the raw payload.

### 3.1 Sources by Connector

- **Gmail (message/thread):** `From`, `To`, `Cc`, `Reply-To` headers; display name vs email; optional body/attachment text extraction.
- **MLS:** Listing agent, buyer agent, party contact fields.
- **Skyslope / Yardi:** Transaction party fields, contact records.
- **Documents/attachments:** Filename, body text, metadata (author, etc.) when available.

### 3.2 Normalized Shape

```json
"detected_parties": [
  {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": null,
    "role": "sender",
    "confidence": 95
  },
  {
    "name": null,
    "email": "escrow@title.com",
    "phone": "+1-555-0100",
    "role": "recipient",
    "confidence": 90
  }
]
```

- **name:** Full or display name; null if not detected.
- **email:** Normalized lowercase; null if not present.
- **phone:** E.164 preferred; null if not present.
- **role:** Connector-specific (e.g. `sender`, `recipient`, `listing_agent`, `buyer`).
- **confidence:** 0–100 for this party’s extraction (e.g. 100 for explicit header, lower for parsed body).

### 3.3 Confidence Rules (Parties)

| Source | Default confidence |
|--------|---------------------|
| Explicit header (From/To/Cc) with email | 95–100 |
| Display name parsed from header | 90–95 |
| Email/phone parsed from body | 70–85 |
| Inferred from filename or metadata | 50–70 |
| Not detected | 0 (omit or confidence 0) |

---

## 4. Detected Record Key

**Purpose:** Extract identifiers that can match or create a Record (property or deal): address, parcel number, listing id, escrow id.

### 4.1 Fields

| Key | Description | Example |
|-----|-------------|---------|
| `address` | Single-line or normalized property address | `"123 Main St, City, ST 12345"` |
| `parcel_number` | Parcel / APN | `"123-456-78"` |
| `listing_id` | MLS or internal listing id | `"MLS-98765"` |
| `escrow_id` | Escrow or transaction id | `"ESC-2024-001"` |

### 4.2 Sources by Connector

- **Gmail:** Subject line, body, attachment filenames; regex/keyword rules for “Address:”, “APN:”, “Listing #”, “Escrow #”, etc.
- **MLS:** Native listing id, address, parcel when provided.
- **Skyslope / Yardi:** Deal id, property address, escrow numbers.

### 4.3 Normalized Shape

```json
"detected_record_key": {
  "address": "123 Main St",
  "parcel_number": "123-456-78",
  "listing_id": null,
  "escrow_id": "ESC-2024-001",
  "confidence": 82
}
```

- **confidence:** 0–100 for the record-key block (e.g. minimum of field-level confidences, or rule-based).

### 4.4 Confidence Rules (Record Key)

| Source | Default confidence |
|--------|---------------------|
| Exact field from connector (MLS/Skyslope) | 95–100 |
| Parsed from structured block (e.g. “Address: 123 Main”) | 85–95 |
| Regex from subject/body | 70–85 |
| Inferred from filename only | 50–70 |
| Not detected | 0 (omit or confidence 0) |

---

## 5. Document Type Classification

**Purpose:** Classify the item (or attachment) as contract, disclosure, inspection, invoice, or other.

### 5.1 Allowed Values

| Value | Description |
|-------|-------------|
| `contract` | Agreement, purchase agreement, lease, amendment |
| `disclosure` | Disclosure form, addendum |
| `inspection` | Inspection report, pest, etc. |
| `invoice` | Invoice, statement, fee sheet |
| `other` | Default when no rule matches |

### 5.2 Sources

- **Filename:** Keywords (e.g. “inspection”, “invoice”, “disclosure”), extension (e.g. PDF).
- **Subject / body:** Keywords and phrases.
- **MIME type / metadata:** Supporting signal only; not sufficient alone for type.

### 5.3 Confidence Rules (Document Type)

| Signal | Default confidence |
|--------|---------------------|
| Strong keyword in filename + extension | 85–95 |
| Subject/body keyword match | 75–90 |
| Weak or single keyword | 50–70 |
| No match (other) | 50 (explicit “other”) or omit |

---

## 6. Confidence Score: Per Field and Per Item

### 6.1 Field-Level Confidence

- **parties:** Aggregate (e.g. min or weighted average) of `detected_parties[].confidence`; store in `field_confidence.parties`.
- **record_key:** From `detected_record_key.confidence`; store in `field_confidence.record_key`.
- **document_type:** From `document_type_confidence`; store in `field_confidence.document_type`.

### 6.2 Item-Level Confidence

- **item_confidence:** 0–100. Recommended: minimum of non-null field confidences, or weighted average if all fields optional.
- If no field is extracted, item_confidence can be 0 or omitted; downstream may treat as “unclassified”.

### 6.3 Stored Shape Example

```json
{
  "detected_parties": [...],
  "detected_record_key": { "address": "123 Main St", "confidence": 88 },
  "document_type": "disclosure",
  "document_type_confidence": 80,
  "field_confidence": {
    "parties": 92,
    "record_key": 88,
    "document_type": 80
  },
  "item_confidence": 80,
  "match_status": "review_required"
}
```

---

## 7. Idempotency and Upsert

- Normalized rows are upserted by `(org_id, idempotency_key)`.
- Same key as raw item (e.g. `gmail:msg:xyz`) or derived (e.g. `gmail:att:hash`).
- Re-running normalization overwrites `payload` and `updated_at`; no new row for same key.

---

## 8. References

- Canonical data model: `docs/reil-core/CANONICAL_DATA_MODEL.md`
- Entity resolution (matching): `docs/reil-core/ENTITY_RESOLUTION.md`
- Schema: `source_items_normalized` in `docs/02_DATA/migrations/00035_reil_source_items_normalized.sql`
