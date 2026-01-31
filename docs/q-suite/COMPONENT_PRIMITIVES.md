# Q Suite 2030 Component Primitives

**Mission:** ENGDEL-QSUITE-REIL-PACKAGE-IMPLEMENT-0011 / ENGDEL-QSUITE-IMPORT-AND-WIRE-0002  
**Owner:** Engineering Delivery  
**Date:** 2026-01-30

---

## Overview

The Q Suite 2030 UI uses a consistent set of surface language primitives defined in `q-suite-ui/src/index.css` and implemented across `components/ui/`. These must be preserved across **every REIL page** (background, panel, card, table base). All REIL routes render inside AppShell and use the same primitives.

---

## Background Treatment

**Location:** `index.css` (body, body::before)

| Element | Definition |
|---------|------------|
| Base gradient | Layered radial gradients: cyan (14% 10%), violet (86% 14%), teal (36% 92%) over linear gradient from `--bg-deep` to `--bg-base` |
| Texture | `body::before` — fractal noise SVG overlay, `opacity: 0.025`, `mix-blend-mode: overlay` |
| Light mode | `html.light body` — reduced opacity radials |

**CSS classes:** None (applied to body). Light mode via `html.light`.

---

## Panel Primitive

**Location:** `index.css` — `.panel`, `.panel-elevated`

| Property | Value |
|----------|-------|
| Border radius | `var(--radius-xl)` (20px) |
| Border | `1px solid var(--stroke-hairline)` |
| Background | Radial gradients (cyan, violet) + linear gradient, `backdrop-filter: blur(24px)` |
| Shadow | `var(--shadow-md)`, `inset 0 1px 0 0 rgba(255,255,255,0.06)` |
| Pseudo | `::after` — masked border gradient (cyan → violet → teal), `opacity: 0.35`, `0.55` on hover |

**Usage:** Cards, modals, drawers, elevated surfaces.

---

## Card Primitive

**Location:** `components/ui/Card.tsx`

| Variant | Base classes | Notes |
|---------|--------------|-------|
| default | `panel texture luminous-arc` | Standard card |
| kpi | `panel-elevated texture luminous-arc` | KPI/metric cards |
| activity | `panel texture luminous-arc` | Activity feed items |
| record | `panel-elevated texture luminous-arc` | Record display |
| connector | `panel-elevated texture luminous-arc` | Connector status |

**Subcomponents:** `KPICard`, `ActivityCard`, `ConnectorCard` — all use `panel` + `texture` + `luminous-arc`.

---

## Table Base Styling

**Location:** `components/ui/Table.tsx`

| Element | Classes |
|---------|---------|
| Container | `rounded-xl border border-stroke-hairline overflow-hidden` |
| Inner | `bg-surface-primary/60 backdrop-blur-xl` |
| Header | `sticky top-0 bg-surface-primary/95 backdrop-blur-xl`, `border-b border-stroke-hairline` |
| Cells | `paddingStyles[mode]` (comfortable: px-4 py-3; dense: px-3 py-2) |
| Rows | `border-b border-stroke-hairline`, `hover:bg-surface-hover` when clickable |

**Modes:** `comfortable` | `dense`  
**Loading:** Skeleton rows with `Skeleton variant="text"`  
**Empty:** Centered `emptyMessage` in `py-12`

---

## Timeline Row Definition

**Location:** `components/ui/Timeline.tsx`

| Element | Definition |
|---------|------------|
| Event types | `document`, `email`, `link`, `user`, `deal`, `system` |
| Row structure | Icon (colored by type) + title + description + actor + timestamp |
| Grouping | Optional `groupByDay` — groups by date, shows date headers |
| Styling | `border-l-2 border-stroke-hairline`, icon in `rounded-lg` with type-specific `bg-*-dim` |

---

## Utility Classes (index.css)

| Class | Purpose |
|-------|---------|
| `.texture` | Micro fractal noise overlay on element |
| `.luminous-arc` | Top-edge gradient line (cyan → violet → teal) |
| `.aurora-edge` | Border gradient via `::after` mask |
| `.glass` | `backdrop-blur`, semi-transparent bg |
| `.glass-elevated` | Stronger blur and opacity |

---

## Design Tokens (CSS Variables)

| Category | Tokens |
|----------|--------|
| Background | `--bg-deep`, `--bg-base` |
| Surface | `--surface-primary`, `--surface-elevated`, `--surface-hover` |
| Stroke | `--stroke-hairline`, `--stroke-subtle`, `--stroke-medium` |
| Accent | `--accent-cyan`, `--accent-cyan-dim`, `--accent-violet`, `--accent-teal` |
| Semantic | `--success`, `--warning`, `--danger`, `--info` (+ `-dim` variants) |
| Text | `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-quaternary` |
| Radius | `--radius-sm` (8px), `--radius-md` (12px), `--radius-lg` (16px), `--radius-xl` (20px) |
