# QAG-QREIL-GMAIL-MESSAGE-ID-PROOF-0705 — Receipt

**Mission:** QAG-QREIL-GMAIL-MESSAGE-ID-PROOF-0705  
**Objective:** Call the live send path and capture gmail_message_id.  
**Date:** 2026-02-02  
**Endpoint:** POST https://q-reil.vercel.app/api/gmail-test-send

---

## Call

**Request:**
```json
{
  "approval_token": "qag-qreil-0702-proof",
  "to": "stratanoble.co@gmail.com",
  "subject": "QAG-QREIL-PROD-SMOKE-0702",
  "body_text": "Q REIL smoke. No reply needed."
}
```

**Result (2026-02-02):**

| Field | Value |
|-------|--------|
| **Status code** | 503 |
| **Response JSON** | `{"status":"error","reason":"Gmail OAuth not configured"}` |
| **gmail_message_id** | *(none — OAuth not configured in Production)* |

---

## Verdict

- **gmail_message_id captured:** No. Production API returns 503 until GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, and GMAIL_SENDER_ADDRESS are set for Production in Vercel.
- **Next step:** After configuring Gmail OAuth env in Vercel Production, rerun POST and record gmail_message_id here and in QAG-REIL-GMAIL-TEST-SEND-PROOF-0005 and ENGDEL-OPS-CORE-GMAIL-SENDER-0061.

---

## Deliverable

| Deliverable | Location |
|------------|----------|
| **Receipt** | `proofs/q-reil/QAG-QREIL-GMAIL-MESSAGE-ID-PROOF-0705-receipt.md` |
