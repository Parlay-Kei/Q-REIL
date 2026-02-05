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
| **Project ID (GCP)** | *(To be set by GCP Admin; document in runbook and optionally here when created.)* |
| **Client name (exact)** | `q-suite-reil-gmail-connector` |
| **Client type** | OAuth 2.0 / Web application |
| **Purpose** | Q REIL Gmail connector: token issuance (proof/one-time-auth), token refresh, sync. |
| **Authorized redirect URIs** | `http://localhost:8765/callback`, `http://127.0.0.1:8765/callback`; add `http://localhost:<port>/callback` for other proof ports (e.g. 8766–8769, 8770) if used. |
| **APIs enabled** | Gmail API |
| **Env vars (secret store)** | `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET` — see [OAUTH_ENV_MAP.md](./OAUTH_ENV_MAP.md). |
| **Status** | Canonical (only entry for Q REIL Gmail OAuth) |

No other OAuth clients are registered for Q REIL Gmail. Use this client only for connector and proof scripts.

---

## References

- [OPS_901_QSUITE_CANON.md](./OPS_901_QSUITE_CANON.md) — canonical project declaration, deprecations, completion routing
- [OAUTH_CANON.md](./OAUTH_CANON.md) — canonical project, client, variable names
- [OAUTH_ENV_MAP.md](./OAUTH_ENV_MAP.md) — script/env mapping
