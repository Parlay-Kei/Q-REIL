# OAuth env canonical contract (REIL)

**Mission:** OCS-REIL-OAUTH-ENV-CANON-KICKOFF-0017  
**Owner:** OCS  
**Purpose:** Single canonical OAuth env key contract for Gmail. All downstream missions and code reference this contract. Legacy aliases are supported only for backward compatibility; runtime MUST normalize to canonical names.

---

## Canonical keys

| Key | Purpose |
|-----|--------|
| **GMAIL_CLIENT_ID** | OAuth 2.0 client ID (e.g. `*.apps.googleusercontent.com`) |
| **GMAIL_CLIENT_SECRET** | OAuth 2.0 client secret |
| **GMAIL_REFRESH_TOKEN** | OAuth refresh token (minted for the same client as above) |
| **GMAIL_SENDER_ADDRESS** | Sender email address for Gmail send (e.g. for test-send endpoint) |

---

## Legacy aliases (absorbed)

These names MUST NOT be read directly by application or script code. A single mapping module reads canonical first, then falls back to aliases, and returns only canonical key names.

| Legacy alias | Canonical key |
|--------------|---------------|
| GOOGLE_OAUTH_CLIENT_ID | GMAIL_CLIENT_ID |
| GOOGLE_OAUTH_CLIENT_SECRET | GMAIL_CLIENT_SECRET |

**Note:** `GMAIL_REFRESH_TOKEN` and `GMAIL_SENDER_ADDRESS` are already canonical in many places; no alias is defined for them in this contract.

---

## References

- **Mission index:** [MISSION_INDEX.md](MISSION_INDEX.md) — all downstream missions reference this canon.
- **Implementation:** Single source of truth mapping and runtime normalization — see mission PLATOPS-REIL-OAUTH-ENV-CANON-IMPLEMENT-0018 (e.g. `connectors/gmail/lib/oauthEnvCanon.js`).
- **CI:** Env assert workflow reports canonical key presence; Lane 1 readiness requires canonical keys in Production — see mission PLATOPS-REIL-VERCEL-ENV-ASSERT-CANON-UPDATE-0019.
