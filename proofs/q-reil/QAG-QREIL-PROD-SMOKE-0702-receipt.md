# QAG-QREIL-PROD-SMOKE-0702 — Receipt

**Mission:** QAG-QREIL-PROD-SMOKE-0702  
**Objective:** Smoke production endpoints; record status codes and response JSON.  
**Date:** 2026-02-02  
**Runner:** local (PowerShell Invoke-WebRequest)  
**Prod domain:** https://q-reil.vercel.app

---

## 1. GET https://q-reil.vercel.app/

| Field | Value |
|-------|--------|
| **Status code** | 200 |
| **Response** | HTML (Q Suite UI). |

---

## 2. GET https://q-reil.vercel.app/api/gmail-test-send

| Field | Value |
|-------|--------|
| **Status code** | 400 |
| **Response JSON** | `{"status":"refused","reason":"approval_token missing"}` |

**Classification:** `/api/gmail-test-send` **exists** (not 404). API is live; GET refused for missing approval_token.

---

## 3. POST https://q-reil.vercel.app/api/gmail-test-send

**Request body:**
```json
{
  "approval_token": "qag-qreil-0702-proof",
  "to": "stratanoble.co@gmail.com",
  "subject": "QAG-QREIL-PROD-SMOKE-0702",
  "body_text": "Q REIL smoke. No reply needed."
}
```

| Field | Value |
|-------|--------|
| **Status code** | 503 |
| **Response JSON** | `{"status":"error","reason":"Gmail OAuth not configured"}` |

---

## API classification

- **/api/gmail-test-send exists:** Yes (GET 400, POST 503; not 404).
- **Route:** Phase 3B — Vercel env assert; then Phase 4 (gmail_message_id proof when OAuth configured).

---

## Deliverable

| Deliverable | Location |
|------------|----------|
| **Receipt** | `proofs/q-reil/QAG-QREIL-PROD-SMOKE-0702-receipt.md` |
