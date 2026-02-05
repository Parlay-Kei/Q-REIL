# QAG-QREIL-PROD-ENDPOINT-SMOKE-0403 Receipt

**Spawn:** QAG-QREIL-PROD-ENDPOINT-SMOKE-0403  
**Date:** 2026-02-02  
**Base URL:** https://q-reil.vercel.app  

Production smoke tests were run against the **currently live** deployment (q-reil.vercel.app). No secrets included in responses below.

---

## 1. GET /api/gmail-test-send (missing approval_token → should refuse)

| Field | Value |
|-------|--------|
| **URL** | https://q-reil.vercel.app/api/gmail-test-send |
| **Method** | GET |
| **Timestamp** | 2026-02-02 (smoke run) |
| **Status code** | 400 |
| **Response JSON** | `{"status":"refused","reason":"approval_token missing"}` |

**Expected:** Refuse when approval_token is missing. **Result:** MATCH.

---

## 2. GET /api/gmail-env-check (if exists → report booleans)

| Field | Value |
|-------|--------|
| **URL** | https://q-reil.vercel.app/api/gmail-env-check |
| **Method** | GET |
| **Timestamp** | 2026-02-02 (smoke run) |
| **Status code** | 404 |
| **Response** | The page could not be found (NOT_FOUND) |

**Expected:** If the endpoint exists, it should report booleans. **Result:** Endpoint does **not** exist in production (404). No gmail-env-check route is implemented in the repo (see Phase 1 receipt).

---

## 3. POST /api/gmail-test-send with approval_token and to=stratanoble.co@gmail.com

| Field | Value |
|-------|--------|
| **URL** | https://q-reil.vercel.app/api/gmail-test-send?approval_token=smoke-test&to=stratanoble.co@gmail.com |
| **Method** | POST |
| **Timestamp** | 2026-02-02 (smoke run) |
| **Status code** | 503 |
| **Response JSON** | `{"status":"error","reason":"Gmail OAuth not configured"}` |

**Expected:** With valid approval_token and allowlisted `to`, success would return 200 and a message id; missing env returns 503. **Result:** 503 with "Gmail OAuth not configured" — env vars (GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN) are not set or not visible in production. **No secrets in response.**

---

## Summary

| Endpoint | Status | Behavior |
|----------|--------|----------|
| /api/gmail-test-send (no token) | 400 | Refuses as expected |
| /api/gmail-env-check | 404 | Not implemented |
| /api/gmail-test-send (with token + to) | 503 | Gmail OAuth not configured |

**Verdict (Phase 3 only):** Endpoint behavior matches expected logic (refuse when no token; 503 when OAuth not configured). **Platform Ops:** If Gmail send is required in production, complete env visibility and set GMAIL_* in Vercel (Project q-reil → Settings → Environment Variables), then redeploy.
