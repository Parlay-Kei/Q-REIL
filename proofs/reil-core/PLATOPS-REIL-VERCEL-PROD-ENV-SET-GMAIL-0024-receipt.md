# PLATOPS-REIL-VERCEL-PROD-ENV-SET-GMAIL-0024 — Receipt

**Mission:** PLATOPS-REIL-VERCEL-PROD-ENV-SET-GMAIL-0024  
**Owner:** PLATOPS  
**Outcome:** q-reil Production has the four Gmail keys and the new refresh token value.  
**Acceptance:** Env assert shows all four keys exist in Production.

---

## Hard rule

**Receipts include key names only, never values.**

---

## Keys (Production)

| Key | Present in Production |
|-----|------------------------|
| GMAIL_CLIENT_ID | *(yes/no)* |
| GMAIL_CLIENT_SECRET | *(yes/no)* |
| GMAIL_REFRESH_TOKEN | *(yes/no)* |
| GMAIL_SENDER_ADDRESS | *(yes/no)* |

---

## Verification

- Run env assert workflow or Vercel CLI/Dashboard check.
- All four keys must exist for **Production** target.
- GMAIL_REFRESH_TOKEN must be the token minted in PLATOPS-REIL-OAUTH-REFRESH-MINT-0023.

---

## References

- [PLATOPS-REIL-OAUTH-REFRESH-MINT-0023-receipt.md](PLATOPS-REIL-OAUTH-REFRESH-MINT-0023-receipt.md)
- Env assert: `.github/workflows/q-reil-vercel-env-assert.yml` (or equivalent)
