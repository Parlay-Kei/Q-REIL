# PLATOPS-QREIL-VERCEL-ENV-ASSERT-PROD-0704 — Receipt

**Mission:** PLATOPS-QREIL-VERCEL-ENV-ASSERT-PROD-0704  
**Objective:** Assert presence of Gmail OAuth env keys in Vercel project q-reil Production (names only, no values).  
**Date:** 2026-02-02  
**Project:** q-reil (prj_VAiSllyEk27tnHDXagBt88h0h64j)  
**Target:** Production

---

## Keys to assert (names only)

| Key | Purpose |
|-----|----------|
| **GMAIL_CLIENT_ID** | OAuth 2.0 client ID |
| **GMAIL_CLIENT_SECRET** | OAuth 2.0 client secret |
| **GMAIL_REFRESH_TOKEN** | OAuth refresh token |
| **GMAIL_SENDER_ADDRESS** | Sender email for send-mail |

---

## Assertion method

- **API:** `GET https://api.vercel.com/v10/projects/{projectId}/env?teamId={teamId}` with `Authorization: Bearer VERCEL_TOKEN`.
- **Runner:** VERCEL_TOKEN was not set in the execution environment; direct API assertion was not performed.

---

## Evidence from smoke (Phase 2)

- **POST /api/gmail-test-send** returned **503** with `{"status":"error","reason":"Gmail OAuth not configured"}`.
- Therefore at least one of the above keys is missing in Production, or the serverless function does not have access to them.

---

## Verdict

- **Keys asserted via API:** No (token not available).
- **Keys to configure for gmail_message_id proof:** GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, GMAIL_SENDER_ADDRESS (Production).

---

## Deliverable

| Deliverable | Location |
|------------|----------|
| **Receipt** | `proofs/q-reil/PLATOPS-QREIL-VERCEL-ENV-ASSERT-PROD-0704-receipt.md` |
