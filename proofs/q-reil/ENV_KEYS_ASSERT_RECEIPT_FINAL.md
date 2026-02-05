# ENV_KEYS_ASSERT_RECEIPT_FINAL — Names Only

**Mission:** OCS Q REIL Gmail Send Proof with Scope Gate (FINAL)  
**Project:** q-reil (Vercel Production)  
**Date:** 2026-02-02

---

## Gmail API env keys (names only)

The following four environment variable **names** must exist in Vercel q-reil Production for `/api/gmail-test-send` to operate:

| # | Key name |
|---|----------|
| 1 | GMAIL_CLIENT_ID |
| 2 | GMAIL_CLIENT_SECRET |
| 3 | GMAIL_REFRESH_TOKEN |
| 4 | GMAIL_SENDER_ADDRESS |

No values are asserted or recorded in this receipt.

---

## Assertion

Platform Ops confirms (via Vercel Dashboard or CLI) that the above four keys are present for **Production**. After PLATOPS-QREIL-VERCEL-ENV-UPDATE-REFRESH-0303, GMAIL_REFRESH_TOKEN holds the minted token with gmail.send scope.
