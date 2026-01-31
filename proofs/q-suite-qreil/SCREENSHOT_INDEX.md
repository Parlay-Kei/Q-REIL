# Q Suite Q REIL Screenshot Index

**Mission:** QAG-QREIL-PACKAGE-PROOF-0014  
**Owner:** QA Gatekeeper  
**Date:** 2026-01-30  
**Scope:** Proof pack screenshots for Q REIL package verification

---

## Screenshot List

All screenshots captured from `http://localhost:5174/` (Q Suite UI dev server). Stored in `proofs/q-suite-qreil/`.

| # | Filename | Route | Purpose |
|---|----------|--------|---------|
| 1 | `qreil-01-home.png` | `/` | Home: Q REIL as nav item; Quick Access tiles. |
| 2 | `qreil-02-apps-tiles.png` | `/apps` | Apps page: Q REIL as first app tile ("Commercial Real Estate package"). |
| 3 | `qreil-03-reil-subnav.png` | `/reil` | Q REIL Overview: REIL subnav visible (Overview, Inbox, Records, Deals, Documents, Ledger). |
| 4 | `qreil-04-dashboard-no-reil-subnav.png` | `/dashboard` | Dashboard: no REIL subnav block (subnav only under Q REIL). |
| 5 | `qreil-05-inbox.png` | `/reil/inbox` | Inbox subroute render; breadcrumb Q REIL > Inbox. |
| 6 | `qreil-06-records.png` | `/reil/records` | Records subroute render; breadcrumb Q REIL > Records. |
| 7 | `qreil-07-deals.png` | `/reil/deals` | Deals subroute render; breadcrumb Q REIL > Deals. |
| 8 | `qreil-08-documents.png` | `/reil/documents` | Documents subroute render; breadcrumb Q REIL > Documents. |
| 9 | `qreil-09-ledger.png` | `/reil/ledger` | Ledger (Activity Ledger) subroute render; breadcrumb Q REIL > Ledger. |

---

## Proof Mapping to Mission Criteria

| Criterion | Screenshots |
|-----------|-------------|
| Q REIL as app tile | 2 (`qreil-02-apps-tiles.png`), 1 (Quick Access) |
| Q REIL as nav item | 1, 2, 3, 4, 5, 6, 7, 8, 9 (sidebar in all) |
| REIL subnav only under Q REIL | 3 (subnav on `/reil`), 4 (no subnav on `/dashboard`) |
| Subroutes render without errors | 5, 6, 7, 8, 9 |
| Visual primitives consistent | 3, 5, 6, 7, 8, 9 (shared shell, typography, accents) |

---

## Capture Environment

- **App:** q-suite-ui (Vite + React)
- **Base URL:** http://localhost:5174/
- **Browser:** Cursor IDE browser (MCP)
- **Date:** 2026-01-30
