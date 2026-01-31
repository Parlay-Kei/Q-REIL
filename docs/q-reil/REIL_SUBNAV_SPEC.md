# REIL Subnav Spec

**Mission:** OCS-QSUITE-NAMING-AND-IA-0010  
**Owner:** OCS  
**Date:** 2026-01-30  
**Scope:** Q REIL app package subviews and subnav behavior

---

## 1. Q REIL as App Package

Q REIL (Commercial Real Estate package) is a single app package with six subviews. The REIL subnav is shown **only when the user is inside the REIL area** (path starts with `/reil`). It is not shown on Home, Dashboard, Apps, or Settings. Naming canon: [../q-suite/NAMING_CANON.md](../q-suite/NAMING_CANON.md).

---

## 2. Subview Definitions

| Subview | Path | Purpose |
|---------|------|---------|
| **Overview** | `/reil` | REIL workspace landing: KPIs, recent activity, quick links |
| **Inbox** | `/reil/inbox` | Email threads, linking, triage |
| **Records** | `/reil/records` | Contacts, companies, properties (record CRM) |
| **Deals** | `/reil/deals` | Deal pipeline and workspaces |
| **Documents** | `/reil/documents` | Document library and linking |
| **Ledger** | `/reil/ledger` | Activity/audit ledger for REIL events |

---

## 3. Subnav Order

When inside REIL, the subnav order is:

1. Overview → `/reil`
2. Inbox → `/reil/inbox`
3. Records → `/reil/records`
4. Deals → `/reil/deals`
5. Documents → `/reil/documents`
6. Ledger → `/reil/ledger`

---

## 4. Display Rules

- **Visibility:** REIL subnav block is visible when `pathname.startsWith('/reil')`.
- **Active state:** The subnav item whose `path` matches the current path (or prefix for detail routes) is highlighted.
- **Detail routes:** `/reil/inbox/:threadId`, `/reil/deals/:dealId`, `/reil/records/:id` keep the parent subnav (Inbox, Deals, Records) active; no extra subnav entries for detail pages.

---

## 5. Top-Level Constraint

Inbox, Records, Deals, Documents, and Ledger must **not** appear as top-level suite nav items. They exist only under REIL subnav. This keeps the suite nav clean and reinforces Q REIL as one package.

---

## 6. References

- **Suite IA:** [../q-suite/IA_NAV_SPEC.md](../q-suite/IA_NAV_SPEC.md)
- **Route map:** [../q-suite/ROUTE_MAP.md](../q-suite/ROUTE_MAP.md)
- **REIL route structure:** [REIL_ROUTE_STRUCTURE.md](./REIL_ROUTE_STRUCTURE.md)
