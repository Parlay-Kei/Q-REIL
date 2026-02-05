# Vercel Project Config Receipt — Q REIL Canonical Align (QREIL-VERCEL-CANONICAL-ALIGN-0002)

**Mission:** PLATOPS-MISSION: QREIL-VERCEL-CANONICAL-ALIGN-0002  
**Owner:** Platform Ops  
**Date:** 2026-02-01  
**Project:** q-reil (q-reil.vercel.app)  
**Project ID:** prj_VAiSllyEk27tnHDXagBt88h0h64j  
**Team:** team_DLPOODpWbIp8OubK6ngvbM1v (Strata Noble's projects)

**Canonical source:** [ops/canonical/QREIL_REPO.json](../../ops/canonical/QREIL_REPO.json)

---

## 1. Target configuration (canonical)

| Setting | Value | Source |
|--------|--------|--------|
| **Git repository** | **Parlay-Kei/Q-REIL** (`https://github.com/Parlay-Kei/Q-REIL.git`) | QREIL_REPO.json `repo_url` |
| **Production branch** | **main** | QREIL_REPO.json `production_branch` |
| **Root Directory** | **q-suite-ui** | QREIL_REPO.json `app_root` |
| **Framework** | **Vite** | QREIL_REPO.json `framework` |
| **Build command** | **npm run build** | QREIL_REPO.json `build`; q-suite-ui/vercel.json |
| **Output directory** | **dist** | QREIL_REPO.json `output`; q-suite-ui/vercel.json |
| **Env vars (production)** | **VITE_SUPABASE_URL**, **VITE_SUPABASE_ANON_KEY** | q-suite-ui/.env.example; ENV_PARITY_CHECK.md |

---

## 2. How to apply (Vercel Dashboard)

These settings cannot be changed via the Vercel MCP; apply them in the Vercel Dashboard (or Vercel API/CLI).

### 2.1 Git

- **Vercel Dashboard** → **Strata Noble's projects** → **q-reil** → **Settings** → **Git**
- **Connect Git Repository**: connect (or reconnect) to **Parlay-Kei/Q-REIL** (`https://github.com/Parlay-Kei/Q-REIL.git`)
- **Production Branch**: **main**

### 2.2 General (build)

- **Settings** → **General**
- **Root Directory**: set to **q-suite-ui** (leave "Include source files outside of the Root Directory" unchecked unless needed)
- **Framework Preset**: **Vite**
- **Build Command**: **npm run build**
- **Output Directory**: **dist**

These match [q-suite-ui/vercel.json](../../q-suite-ui/vercel.json); with Root Directory = q-suite-ui, Vercel will use that file.

### 2.3 Environment variables

- **Settings** → **Environment Variables**
- Add (for **Production**, and optionally Preview/Development as needed):
  - **VITE_SUPABASE_URL** = your Supabase project URL (e.g. `https://xxx.supabase.co`)
  - **VITE_SUPABASE_ANON_KEY** = your Supabase anon/public key

See [ENV_PARITY_CHECK.md](./ENV_PARITY_CHECK.md) and [q-suite-ui/.env.example](../../q-suite-ui/.env.example).

---

## 3. Pre-alignment state (observed 2026-02-01)

| Check | Value |
|-------|--------|
| **Framework** | nextjs |
| **Latest deployment** | dpl_4QYuindMVA86X8eZkawJ5cyPCx1w |
| **Git SHA (deployment)** | 21954142c54324c409482969222daaa9cc9ef46a |
| **Git message** | "Initial commit from Create Next App" |
| **Branch** | main |

The project was wired to a different repo (Next.js). After applying the target configuration above, redeploy and record the new deployment in [REDEPLOY_RECEIPT.md](./REDEPLOY_RECEIPT.md).

---

## 4. Summary — alignment checklist

| # | Check | Action |
|---|--------|--------|
| 1 | Repo | Connect Git to **Parlay-Kei/Q-REIL**; production branch **main**. |
| 2 | Root Directory | Set to **q-suite-ui**. |
| 3 | Framework / build | Framework **Vite**; Build **npm run build**; Output **dist** (per vercel.json). |
| 4 | Env vars | Add **VITE_SUPABASE_URL** and **VITE_SUPABASE_ANON_KEY**. |
| 5 | Redeploy | Push to **main** or use **Redeploy** in Vercel; record new deployment id and commit SHA in REDEPLOY_RECEIPT.md. |
