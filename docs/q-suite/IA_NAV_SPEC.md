# Q Suite Information Architecture & Navigation Spec

**Mission:** OCS-QSUITE-NAMING-AND-IA-0010 / OCS-QSUITE-REIL-PACKAGE-IA-0005  
**Owner:** OCS  
**Date:** 2026-01-30  
**Architecture:** Q REIL as app package with subviews; QCC v2 as suite control plane

---

## 1. Package Model

The Q Suite is composed of:

| Layer | Role | Scope |
|-------|------|--------|
| **Suite** | Shell, global nav, theme, command bar | Home, Dashboard, Apps, Settings |
| **QCC v2** | Control plane | Users, roles, connectors, audit, health |
| **Q REIL** | App package (Commercial Real Estate) | Overview, Inbox, Records, Deals, Documents, Ledger |

Q REIL is treated as a **single app package** with six subviews. It appears as one top-level entry in the suite nav (labeled **Q REIL**); all subviews are reached via REIL subnav only. Naming canon: [NAMING_CANON.md](./NAMING_CANON.md).

---

## 2. Suite-Level Navigation (Top Nav)

Top-level suite nav is **clean** and does not duplicate REIL subviews.

| Entry | Path | Notes |
|-------|------|--------|
| Home | `/` | Suite landing |
| Dashboard | `/dashboard` | Suite overview |
| Apps | `/apps` | App switcher |
| **Q REIL** | `/reil` | Q REIL package entry (workspace landing / Overview) |
| — | — | No top-level Inbox, Records, Deals, Documents, Ledger |

**Bottom (suite):**
| Entry | Path |
|-------|------|
| Settings | `/settings` |

---

## 3. QCC v2 Control Plane

QCC v2 remains the suite control plane for:

- **Users** — user management, invites, permissions
- **Roles** — role definitions and assignments
- **Connectors** — connector config, OAuth, sync status
- **Audit** — audit log and compliance views
- **Health** — system health, sync status, diagnostics

Access to QCC v2 is via Settings and/or Dashboard entry points (not duplicated in top nav). REIL does not own these concerns; they stay at suite level.

---

## 4. Q REIL Package Entry

- **Single top-level entry:** Q REIL → `/reil`
- **Subviews** are only available inside the REIL area via REIL subnav (see REIL_SUBNAV_SPEC.md).
- No duplicate top-level links for Inbox, Deals, Documents, Ledger outside Q REIL.

---

## 5. Route Summary

| Area | Routes |
|------|--------|
| Suite | `/`, `/dashboard`, `/apps`, `/settings` |
| Q REIL (package) | `/reil`, `/reil/inbox`, `/reil/records`, `/reil/deals`, `/reil/documents`, `/reil/ledger` + detail routes |
| QCC v2 | Accessed via Settings/Dashboard (users, roles, connectors, audit, health) |

---

## 6. References

- **Route map:** [ROUTE_MAP.md](./ROUTE_MAP.md)
- **REIL subnav:** [../q-reil/REIL_SUBNAV_SPEC.md](../q-reil/REIL_SUBNAV_SPEC.md)
- **REIL route structure:** [../q-reil/REIL_ROUTE_STRUCTURE.md](../q-reil/REIL_ROUTE_STRUCTURE.md)
