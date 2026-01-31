# CRE Deal Stage Defaults

**Mission:** PRODOPS-REIL-CRE-PACKAGE-COPY-0007  
**Owner:** Product Ops  
**Date:** 2026-01-30  
**Scope:** Initial deal stage set for Commercial Real Estate package — defaults, marked as configurable

---

## 1. Overview

This document defines the default deal stage set for the CRE (Commercial Real Estate) package in REIL. Stages are **configurable** per organization; these defaults reflect common CRE leasing and sales workflows.

---

## 2. Configurability

| Attribute | Value |
|-----------|-------|
| **Configurable** | Yes |
| **Scope** | Org-level or package-level |
| **Storage** | `deal_stages` or equivalent config table |
| **Override** | Admins may add, remove, reorder, or rename stages |

---

## 3. Default Stage Sets

CRE supports two primary transaction types. Default stages are provided for each.

### 3.1 Leasing Pipeline (Default)

For lease transactions (office, retail, industrial, etc.).

| Order | Stage ID | Label | Description |
|-------|----------|-------|-------------|
| 1 | `lead` | Lead | Initial inquiry or prospect |
| 2 | `loi_draft` | LOI Draft | Letter of Intent in preparation |
| 3 | `loi_negotiation` | LOI Negotiation | LOI terms under discussion |
| 4 | `loi_executed` | LOI Executed | LOI signed by parties |
| 5 | `lease_draft` | Lease Draft | Lease document in preparation |
| 6 | `lease_negotiation` | Lease Negotiation | Lease terms under discussion |
| 7 | `lease_executed` | Lease Executed | Lease signed |
| 8 | `due_diligence` | Due Diligence | Tenant/landlord due diligence (if applicable) |
| 9 | `commencement` | Commencement | Lease commenced / move-in |
| 10 | `closed_won` | Closed Won | Transaction complete |
| 11 | `closed_lost` | Closed Lost | Deal terminated |

### 3.2 Sales Pipeline (Alternative Default)

For purchase/sale transactions.

| Order | Stage ID | Label | Description |
|-------|----------|-------|-------------|
| 1 | `lead` | Lead | Initial inquiry or prospect |
| 2 | `loi` | LOI | Letter of Intent |
| 3 | `psa` | PSA | Purchase and Sale Agreement |
| 4 | `due_diligence` | Due Diligence | Buyer due diligence period |
| 5 | `closing` | Closing | Pre-closing / closing in progress |
| 6 | `closed_won` | Closed Won | Sale closed |
| 7 | `closed_lost` | Closed Lost | Deal terminated |

---

## 4. Stage Metadata (Configurable)

Each stage may include optional metadata for UI and workflow:

| Field | Type | Purpose |
|-------|------|---------|
| `id` | string | Unique identifier (e.g., `loi_executed`) |
| `label` | string | Display label |
| `order` | number | Sort order in pipeline |
| `description` | string | Optional tooltip/help text |
| `is_terminal` | boolean | Closed Won / Closed Lost |
| `probability` | number | Optional win probability (0–100) |
| `color` | string | Optional badge/kanban color |

---

## 5. Evidence Checklist Defaults (Per Stage)

Suggested evidence items per stage. **Configurable** per org.

### Leasing Pipeline

| Stage | Suggested Evidence Items |
|-------|--------------------------|
| Lead | Initial contact email, meeting notes |
| LOI Draft | LOI draft, term sheet |
| LOI Negotiation | LOI revisions, negotiation correspondence |
| LOI Executed | Signed LOI |
| Lease Draft | Lease draft, exhibits |
| Lease Negotiation | Lease revisions, redlines |
| Lease Executed | Executed lease, amendments |
| Due Diligence | Estoppel, SNDA, financials (if applicable) |
| Commencement | Certificate of occupancy, move-in docs |
| Closed Won | Final executed documents, commission agreement |
| Closed Lost | Termination notice, lost deal notes |

### Sales Pipeline

| Stage | Suggested Evidence Items |
|-------|--------------------------|
| Lead | Initial contact, property tour notes |
| LOI | LOI, term sheet |
| PSA | Purchase and Sale Agreement |
| Due Diligence | Inspection report, title, environmental |
| Closing | Closing statement, deed, wire confirmation |
| Closed Won | Recorded deed, commission agreement |
| Closed Lost | Termination notice, lost deal notes |

---

## 6. Schema Reference (Proposed)

```sql
-- Example: deal_stages config table (conceptual)
CREATE TABLE IF NOT EXISTS public.deal_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  pipeline_type TEXT NOT NULL DEFAULT 'leasing',  -- 'leasing' | 'sales'
  stage_id TEXT NOT NULL,                         -- e.g., 'loi_executed'
  label TEXT NOT NULL,
  "order" INT NOT NULL,
  description TEXT,
  is_terminal BOOLEAN DEFAULT FALSE,
  probability INT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(org_id, pipeline_type, stage_id)
);
```

---

## 7. Migration from Generic Stages

The current DealWorkspace uses generic stages:

- Lead → Qualification → Proposal → Negotiation → Closed Won

For CRE package, these map conceptually to:

| Generic | CRE Leasing | CRE Sales |
|---------|-------------|-----------|
| Lead | Lead | Lead |
| Qualification | LOI Draft / LOI Negotiation | LOI |
| Proposal | LOI Executed / Lease Draft | PSA |
| Negotiation | Lease Negotiation | Due Diligence |
| Closed Won | Closed Won / Commencement | Closed Won |

---

## 8. References

- [CRE_LABELS_AND_COPY.md](./CRE_LABELS_AND_COPY.md)
- [REIL_ROUTE_STRUCTURE.md](./REIL_ROUTE_STRUCTURE.md)
- [AIR CRE Fact Sheet](../04_CONNECTORS/AIRCRE_FACT_SHEET.md)
