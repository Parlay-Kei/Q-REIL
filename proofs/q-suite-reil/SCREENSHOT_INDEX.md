# Q Suite REIL Screenshot Index

**Mission:** QAG-QSUITE-REIL-PACKAGE-PROOF-0009  
**Owner:** QA Gatekeeper  
**Date:** 2026-01-30

---

## Screenshot Inventory

| # | Route | File | Description |
|---|-------|------|-------------|
| 1 | `/` | home.png | Suite landing — top nav shows Home, Dashboard, Apps, REIL |
| 2 | `/reil` | reil-overview.png | REIL Overview — subnav visible (Overview, Inbox, Records, Deals, Documents, Ledger) |
| 3 | `/reil/inbox` | reil-inbox.png | Inbox subview — thread list, filters |
| 4 | `/reil/records` | reil-records.png | Records subview — contacts tab |
| 5 | `/reil/deals` | reil-deals.png | Deals subview — deals tab |
| 6 | `/reil/documents` | reil-documents.png | Documents subview — attachment library |
| 7 | `/reil/ledger` | reil-ledger.png | Activity Ledger subview — event timeline |

---

## Location

**Directory:** `proofs/q-suite-reil/screenshots/`

---

## Capture Method

- **Tool:** cursor-ide-browser MCP (browser_navigate, browser_take_screenshot)
- **Dev server:** `cd q-suite-ui && npm run dev` → http://localhost:5173
- **Date captured:** 2026-01-30

---

## Verification Points per Screenshot

| Screenshot | Verifies |
|------------|----------|
| home.png | Top nav: Home, Dashboard, Apps, REIL only; no Inbox/Deals at top level |
| reil-overview.png | REIL subnav block visible; Overview active; shared primitives (KPICard, Button) |
| reil-inbox.png | Inbox in subnav; shared primitives (Card, EmptyState, Tabs) |
| reil-records.png | Records in subnav; shared primitives (Table, Tabs, Card) |
| reil-deals.png | Deals in subnav; shared primitives |
| reil-documents.png | Documents in subnav; shared primitives (Table, EmptyState) |
| reil-ledger.png | Ledger in subnav; shared primitives (Timeline, Table) |
