# Q Suite — OAuth client registry (Q REIL Gmail)

**Mission:** OCS-OPS-901-QSUITE-CANON-0051  
**Owner:** OCS  
**Date:** 2026-02-01  
**Scope:** Single canonical OAuth client for Q REIL Gmail. No other clients are registered for this scope.

See [OPS_901_QSUITE_CANON.md](./OPS_901_QSUITE_CANON.md) for canonical project declaration and deprecation of Strata-MAIN, Direct-Cuts, and DSLV for Q REIL usage.

---

## Registered client (single entry)

| Field | Value |
|-------|--------|
| **Project (display)** | Q Suite |
| **Project ID (GCP)** | `qreil-486018` |
| **Client name (exact)** | `q-suite-reil-gmail-connector` |
| **Client type** | OAuth 2.0 / Desktop |
| **Purpose** | Q REIL Gmail connector: token issuance (proof/one-time-auth), token refresh, sync. |
| **Authorized redirect URIs** | `http://localhost` (Desktop client) |
| **APIs enabled** | Gmail API |
| **Env vars (secret store)** | `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET` (canonical) — see [OAUTH_ENV_MAP.md](./OAUTH_ENV_MAP.md). Legacy aliases `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET` removed per OCS-QREIL-OAUTH-CLIENT-CREATE-0006. |
| **Status** | Canonical (only entry for Q REIL Gmail OAuth) |

No other OAuth clients are registered for Q REIL Gmail. Use this client only for connector and proof scripts.

---

## References

- [OPS_901_QSUITE_CANON.md](./OPS_901_QSUITE_CANON.md) — canonical project declaration, deprecations, completion routing
- [OAUTH_CANON.md](./OAUTH_CANON.md) — canonical project, client, variable names
- [OAUTH_ENV_MAP.md](./OAUTH_ENV_MAP.md) — script/env mapping
