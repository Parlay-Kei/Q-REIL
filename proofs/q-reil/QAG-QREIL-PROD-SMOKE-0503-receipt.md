# QAG-QREIL-PROD-SMOKE-0503 — Receipt

**Mission:** OCS Phase 3 — QAG resmoke production routes  
**Spawn:** QAG-QREIL-PROD-SMOKE-0503  
**Date:** 2026-02-02  
**Base URL:** https://q-reil.vercel.app

---

## 1. Scope

Call and record responses for:

1. **GET** `/api/gmail-test-send` (no approval_token → expect refuse).  
2. **GET** `/api/gmail-env-check` (expect 404 unless implemented).  
3. **POST** `/api/gmail-test-send` with `approval_token` and `to=stratanoble.co@gmail.com`.

---

## 2. Results (2026-02-02)

*Note: At run time, production was serving the last READY deployment (pre–Phase 1 Vite config). If Phase 2 redeploy has since completed with Root Directory = q-suite-ui, re-run this smoke and add a "Post–Phase 2" subsection.*

### 2.1 GET https://q-reil.vercel.app/api/gmail-test-send (no approval_token)

| Field | Value |
|-------|--------|
| **Expected** | Refuse (400 or 403); body indicates approval_token missing or invalid. |
| **HTTP status** | 400 (PowerShell Invoke-WebRequest treats non-2xx as exception; body returned). |
| **Response body** | `{"status":"refused","reason":"approval_token missing"}` |
| **Verdict** | **PASS** — endpoint refuses when approval_token is missing. |

### 2.2 GET https://q-reil.vercel.app/api/gmail-env-check

| Field | Value |
|-------|--------|
| **Expected** | 404 unless implemented. |
| **HTTP status** | 404 (Content not found). |
| **Verdict** | **PASS** — 404 as expected (not implemented). |

### 2.3 POST https://q-reil.vercel.app/api/gmail-test-send

**Request:**  
- Method: POST  
- Content-Type: application/json  
- Body: `{"approval_token":"test","to":"stratanoble.co@gmail.com"}`  

| Field | Value |
|-------|--------|
| **Expected** | With valid approval_token and env configured: 200 and Sent. With invalid token or missing env: 400/403/503 and JSON reason. |
| **HTTP status** | Non-2xx (400/403/503). |
| **Response body** | `{"status":"error","reason":"Gmail OAuth not configured"}` |
| **Verdict** | **PASS** — endpoint exists and responds; correctly indicates Gmail OAuth not configured (env vars not set or not valid). No secrets in response. |

---

## 3. Branch rule (OCS)

If **/api/gmail-test-send** is **404** after a successful Vite deploy (Phase 2), that is **expected** when Vite is used and serverless functions are not in a Vercel-supported location for that root. In that case, **Route Engineering Delivery** must implement serverless functions in a Vercel-supported location or split into two Vercel projects (UI vs API). See **Phase 4: ENGDEL-QREIL-API-HOSTING-DECISION-0504**.

At this run, **/api/gmail-test-send** was **not** 404 (it returned 400 and 503 with JSON bodies), so the current production deployment exposes the API. After Phase 2 (Vite subdir deploy), re-run this smoke; if 404 appears, proceed per Phase 4.

---

## 4. Gmail message ID proof

Do **not** attempt Gmail message id proof until:

1. Production deployment is **READY** (Phase 2 complete), and  
2. The chosen API hosting path (Phase 4) is live.

---

## 5. Summary

| Route | Method | Result | Verdict |
|-------|--------|--------|--------|
| /api/gmail-test-send | GET (no token) | 400, approval_token missing | PASS |
| /api/gmail-env-check | GET | 404 | PASS (expected) |
| /api/gmail-test-send | POST (token + to) | error, Gmail OAuth not configured | PASS (endpoint live, env not set) |
