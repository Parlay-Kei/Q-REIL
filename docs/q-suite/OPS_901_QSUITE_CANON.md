# OPS-901 — Q Suite as canonical Google Cloud project (Q REIL Gmail OAuth)

**Mission:** OCS-OPS-901-QSUITE-CANON-0051  
**Owner:** OCS  
**Date:** 2026-02-01  
**Scope:** Declare Q SUITE as the only canonical Google Cloud project for Q REIL Gmail OAuth; deprecate alternate projects; define completion routing.

---

## 1. Canonical project declaration

**Q SUITE** is the **only** canonical Google Cloud project for Q REIL Gmail OAuth.

| Term | Canonical value |
|------|-----------------|
| **Project (display)** | Q Suite |
| **Purpose** | Gmail API + OAuth 2.0 Web client for Q REIL connector, proof scripts, and sync. |
| **Usage** | All Q REIL Gmail OAuth flows (proof script, one-time-auth, refresh, `connectors/gmail/run-sync.mjs`) MUST use credentials from this project only. |

No other GCP project may be used for Q REIL Gmail OAuth. A single OAuth 2.0 Web application client within Q SUITE is the canonical client (see [OAUTH_CLIENT_REGISTRY.md](./OAUTH_CLIENT_REGISTRY.md)).

---

## 2. Deprecated OAuth clients (Q REIL usage)

The following projects and any OAuth clients therein are **deprecated** for Q REIL Gmail OAuth usage. Do not create or use Gmail OAuth clients in these projects for Q REIL.

| Project / org | Status | Notes |
|---------------|--------|--------|
| **Strata-MAIN** | Deprecated for Q REIL | Any Gmail OAuth clients in Strata-MAIN are not canonical for Q REIL. Migrate to Q SUITE. |
| **Direct-Cuts** | Deprecated for Q REIL | Do not use Direct-Cuts GCP OAuth clients for Q REIL Gmail connector or proof scripts. |
| **DSLV** | Deprecated for Q REIL | Do not use DSLV GCP OAuth clients for Q REIL Gmail connector or proof scripts. |

Canonical credentials and client ID/secret for Q REIL MUST come from the Q SUITE project only. See [OAUTH_CANON.md](./OAUTH_CANON.md) and [OAUTH_CLIENT_REGISTRY.md](./OAUTH_CLIENT_REGISTRY.md).

---

## 3. OPS-901 completion routing

OPS-901 completion is routed in order: **GCP Admin** → **Platform Ops** → **BEQA**.

| Step | Role | Responsibility |
|------|------|----------------|
| **1** | **GCP Admin** | Create or designate the Q SUITE GCP project; create the single OAuth 2.0 Web application client; enable Gmail API; configure consent screen and redirect URIs per [OAUTH_CANON.md](./OAUTH_CANON.md). Hand off project ID and client details to Platform Ops. |
| **2** | **Platform Ops** | Store `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` in the designated secret store (e.g. Vercel env, CI secrets, repo root `.env.local` per [OAUTH_ENV_MAP.md](./OAUTH_ENV_MAP.md)); update runbooks and [OAUTH_CLIENT_REGISTRY.md](./OAUTH_CLIENT_REGISTRY.md). Hand off receipt to BEQA. |
| **3** | **BEQA** | Verify Gmail connector and OAuth against canonical setup per [OAUTH_CANON.md](./OAUTH_CANON.md) §6.2 and BE-301 handoff; confirm no use of alternate project or client; complete OPS-901 proof pack and close OPS-901. |

Receipts and proof: [00_PROJECT/handoffs/2026-01-30_OPS-901_OCS_to_infra-deployment-specialist.md](../00_PROJECT/handoffs/2026-01-30_OPS-901_OCS_to_infra-deployment-specialist.md), [proofs/q-reil/OPS_901_QSUITE_OAUTH_CONFIG_RECEIPT.md](../../proofs/q-reil/OPS_901_QSUITE_OAUTH_CONFIG_RECEIPT.md) (GCP Admin), BE-301 handoff, [OAUTH_CLIENT_REGISTRY.md](./OAUTH_CLIENT_REGISTRY.md).

---

## 4. References

- [OAUTH_CANON.md](./OAUTH_CANON.md) — canonical project, client, variable names
- [OAUTH_CLIENT_REGISTRY.md](./OAUTH_CLIENT_REGISTRY.md) — single canonical client entry
- [OAUTH_ENV_MAP.md](./OAUTH_ENV_MAP.md) — env and script mapping
- [OAUTH_CANON_IMPLEMENTED.md](./OAUTH_CANON_IMPLEMENTED.md) — implemented canonicalization
- OPS-901 handoff: [00_PROJECT/handoffs/2026-01-30_OPS-901_OCS_to_infra-deployment-specialist.md](../00_PROJECT/handoffs/2026-01-30_OPS-901_OCS_to_infra-deployment-specialist.md)
