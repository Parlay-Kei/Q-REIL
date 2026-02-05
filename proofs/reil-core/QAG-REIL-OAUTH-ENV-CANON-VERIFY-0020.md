# QAG-REIL-OAUTH-ENV-CANON-VERIFY-0020

**Mission:** QAG-REIL-OAUTH-ENV-CANON-VERIFY-0020  
**Owner:** QAG  
**Outcome:** Prove runtime normalization is working and the same client is used end to end.

---

## Verdict: *(PASS | BLOCKED)*

*(QAG fills after verification.)*

---

## Acceptance

- [ ] Env assert receipt shows **canonical keys present** in Production for the q-reil project in Vercel (see PLATOPS-REIL-VERCEL-ENV-ASSERT-CANON-0019-receipt.md).
- [ ] Token validation script reads canonical keys and reports a clean "present" check (`node scripts/oauth-proof/refresh-token.mjs`).
- [ ] If token exchange still fails with `unauthorized_client`, the receipt states **"client mismatch"** explicitly and points to:
  - The exact client id in use (last 6 chars only),
  - Where it was sourced (canonical vs alias),
  - No secrets exposed.

---

## Client source (if mismatch)

| Field | Value |
|-------|--------|
| Client ID (last 6 chars) | *(redacted)* |
| Sourced from | canonical / alias |
| Notes | *(e.g. "client mismatch: token minted with different client")* |

---

## Evidence

- Env assert run: *(link to workflow run or receipt)*
- Token validation run: *(output snippet or receipt)*
