# ENGDEL-QREIL-API-HOSTING-DECISION-0504

**Mission:** OCS Phase 4 — Decide correct architecture for Gmail send  
**Spawn:** ENGDEL-QREIL-API-HOSTING-DECISION-0504  
**Date:** 2026-02-02  
**Context:** q-reil Vercel project builds from **q-suite-ui** (Vite). Gmail test send is implemented in **q-suite-ui/api/gmail-test-send.js**. Need a stable, supportable hosting path for this API.

---

## 1. Options

### A) Convert to Vercel-supported full stack (Next.js App Router)

- Migrate the existing Vite + React UI to **Next.js** (App Router).
- Implement Gmail send as **Next.js Route Handler** (e.g. `app/api/gmail-test-send/route.ts`) or **Pages API** (`pages/api/gmail-test-send.ts`).
- Single Vercel project; `/api/*` routes are first-class.
- **Pros:** One repo, one deploy, native /api support.  
- **Cons:** Large refactor (Vite → Next.js), different bundling and config.

### B) Keep Vite UI; separate Vercel serverless or edge project for API

- Keep **q-reil** as Vite-only (static + optional serverless in q-suite-ui/api if Vercel respects it when root = q-suite-ui).
- If `/api` is 404 after Vite deploy: create a **second Vercel project** (e.g. q-reil-api) with root at repo root or a subdir containing only `api/`, or a small Node serverless layout Vercel supports.
- **Pros:** UI stays Vite; API can be minimal and separate.  
- **Cons:** Two projects, two deploys, CORS and base URL to manage; possible repo layout split (e.g. api in separate dir or repo).

### C) Keep Vite UI; Supabase Edge Functions for Gmail send

- Keep **q-reil** as Vite-only; no `/api` on Vercel.
- Implement Gmail test send as a **Supabase Edge Function**; UI calls Supabase function URL (with auth/session as needed).
- **Pros:** No Vercel serverless layout dependency; Supabase already in use (VITE_SUPABASE_*).  
- **Cons:** Gmail OAuth/refresh token and secrets live in Supabase (env/secrets); different runtime and auth model than current Vercel serverless.

---

## 2. Current state and observation

- **q-suite-ui** contains **api/gmail-test-send.js** (Vercel serverless style).
- When Vercel **Root Directory** is **q-suite-ui**, Vercel’s build uses that directory as the project root. **Vercel does deploy serverless functions from an `api/` directory inside the root directory** for non-Next.js projects (e.g. Vite), so **/api/gmail-test-send may continue to work** after Phase 1+2 with no structural change.
- If after Phase 2 redeploy **/api/gmail-test-send** returns **404**, then Vercel is not exposing `q-suite-ui/api/*` for this project/config, and we must adopt B or C (or move to A).

---

## 3. Chosen option (recommendation)

**Primary:** Assume **current layout remains valid** after Phase 2: Root Directory = **q-suite-ui**, Framework = **Vite**. Then **q-suite-ui/api/gmail-test-send.js** is the only API; no change until proven otherwise.

**If 404 after Phase 2:**

- **Recommended:** **Option C — Supabase Edge Function** for Gmail send.  
  - Keeps Vite UI on Vercel unchanged.  
  - Centralizes backend/API-style work in Supabase (already used for app).  
  - Avoids a second Vercel project and CORS/base-URL complexity.  
  - Proof plan: deploy Edge Function, point UI (or smoke test) at function URL, then run Gmail send proof (with approval_token and env in Supabase).

**Alternatives:**

- **Option B** if the team prefers all serverless on Vercel (e.g. second project q-reil-api with only api routes).  
- **Option A** only if a full move to Next.js is already planned for other reasons.

---

## 4. Routes and proof plan

### 4.1 If /api remains live (no 404 after Phase 2)

| Route | Host | Proof |
|-------|------|--------|
| /api/gmail-test-send | q-reil.vercel.app | QAG-QREIL-PROD-SMOKE-0503 already covers GET (refuse) and POST (OAuth configured → Sent). Add Gmail message id proof once env is set and approval_token is valid. |
| /api/gmail-env-check | q-reil.vercel.app | Optional; implement later or leave 404. |

### 4.2 If /api/gmail-test-send is 404 after Phase 2 (Option C)

| Route | Host | Proof |
|-------|------|--------|
| Gmail test send | Supabase Edge Function URL | 1) Deploy Edge Function with Gmail OAuth env in Supabase. 2) Smoke: GET without token → refuse; POST with approval_token + to → 200 and Sent. 3) Gmail message id proof with valid token and stratanoble.co@gmail.com. |

### 4.3 If Option B (separate Vercel API project)

| Route | Host | Proof |
|-------|------|--------|
| /api/gmail-test-send | q-reil-api.vercel.app (or similar) | Same as 4.1; base URL for UI and smoke is the new project URL. |

---

## 5. Verdict rule (OCS)

Do **not** attempt Gmail message id proof until:

1. Production deployment is **READY** (Phase 2), and  
2. The chosen API hosting path (stay with q-suite-ui/api, or Option B/C) is **live** and smoke tests pass.

---

## 6. Summary

| Item | Value |
|------|--------|
| **Chosen option** | Keep current **q-suite-ui/api** if Phase 2 still serves /api; else **Option C (Supabase Edge Function)**. |
| **Routes** | /api/gmail-test-send (and optional /api/gmail-env-check) on q-reil.vercel.app, or Supabase function URL if C. |
| **Proof plan** | Re-run QAG-QREIL-PROD-SMOKE-0503 after Phase 2; if 404 → implement C (or B) and then run smoke + Gmail message id proof. |
