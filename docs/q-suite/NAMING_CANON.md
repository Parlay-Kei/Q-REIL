# Q Suite Naming Canon

**Mission:** OCS-QSUITE-NAMING-AND-IA-0010  
**Owner:** OCS  
**Date:** 2026-01-30  
**Scope:** Canonical product naming for Q Suite and its app packages

---

## 1. Q REIL

| Term | Canonical value | Usage |
|------|-----------------|--------|
| **App name** | **Q REIL** | Apps tile, left nav, page titles, breadcrumbs, command palette |
| **App description** | **Commercial Real Estate package** | Apps tile, tooltips, onboarding |
| **Tagline (optional)** | Evidence linking & intelligence. Connect threads, documents, and deals. | REIL Overview / marketing copy |

**Constraint:** Inbox, Deals, Documents, and Ledger are **subviews** of Q REIL. They must not appear as top-level suite nav items or as separate app tiles; they appear only inside Q REIL (e.g. REIL subnav, REIL routes).

---

## 2. Q Suite

| Term | Canonical value |
|------|-----------------|
| **Suite name** | Q Suite |
| **Vendor / byline** | by Strata Noble (or as configured) |
| **Document title (shell)** | Q Suite by Strata Noble |
| **Do not use** | "Command Center UI" (removed from all UI and titles) |

### Route-aware document titles

| Context | Pattern / example |
|---------|---------------------|
| Shell / default | Q Suite by Strata Noble |
| Home / landing | Q Suite |
| Dashboard (suite overview) | Q Control Center \| Q Suite |
| REIL overview | Q REIL · Overview \| Q Suite |
| REIL subviews | [Subview] \| Q REIL \| Q Suite (e.g. Inbox \| Q REIL \| Q Suite) |
| Deal / thread detail | [Name] \| Q REIL \| Q Suite |

---

## 3. Where "Q REIL" Appears

- **Apps page:** Single tile labeled **Q REIL** with description *Commercial Real Estate package*.
- **Left nav (sidebar):** One top-level entry **Q REIL** → `/reil`; REIL subnav (Overview, Inbox, Records, Deals, Documents, Ledger) visible only when inside `/reil` routes.
- **Page titles:** REIL area pages use title pattern `Q REIL · [Subview]` or `[Subview] | Q REIL` (e.g. "Inbox | Q REIL", "Q REIL · Overview").
- **Breadcrumbs:** When inside REIL, breadcrumb root is **Q REIL** (e.g. Q REIL > Inbox, Q REIL > Deals > [Deal name]).
- **Command palette / search:** Quick actions and results reference **Q REIL** and subview names (e.g. "Open Q REIL", "Q REIL Inbox").

---

## 4. References

- **Suite IA:** [IA_NAV_SPEC.md](./IA_NAV_SPEC.md)
- **Route map:** [ROUTE_MAP.md](./ROUTE_MAP.md)
- **REIL subnav:** [../q-reil/REIL_SUBNAV_SPEC.md](../q-reil/REIL_SUBNAV_SPEC.md)
