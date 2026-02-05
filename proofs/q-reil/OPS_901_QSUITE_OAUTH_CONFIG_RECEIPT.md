# OPS-901 Q Suite OAuth Config Receipt — GCP Admin

**Mission:** GCPADMIN-OPS-901-QSUITE-OAUTH-CONFIG-0052  
**Owner:** GCP Admin  
**Date:** 2026-02-01  
**Scope:** GCP project Q SUITE — Gmail API, OAuth consent screen, and OAuth 2.0 Web application client for the Gmail connector. Client ID and secret delivered to Platform Ops via secure handoff; no raw secrets in this receipt.

---

## 1. Summary

| Item | Value |
|------|--------|
| **GCP project (display)** | Q Suite |
| **OAuth client name (exact)** | `q-suite-reil-gmail-connector` |
| **Client type** | Web application |
| **Handoff** | Client ID and Client secret copied to secure handoff channel for Platform Ops |

**Secrets:** This receipt does **not** contain Client ID or Client secret. Those are provided only through the secure handoff channel.

---

## 2. APIs

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Gmail API enabled | ☐ Confirmed | *(Screenshot: APIs & Services → Enabled APIs showing Gmail API)* |

**Screenshot placeholder:**  
*Add screenshot: GCP Console → APIs & Services → Enabled APIs — Gmail API listed.*

---

## 3. OAuth consent screen

| Requirement | Value / Status | Evidence |
|-------------|----------------|----------|
| User type | External | ☐ Confirmed |
| Publishing status | Testing or In Production | ☐ Confirmed |
| If Testing: target Gmail as Test User | *(N/A if In Production)* | ☐ Added if Testing |
| Authorized scopes include | `gmail.readonly`, `openid`, `userinfo.email` | ☐ Confirmed |

**Scope values (for reference):**
- `https://www.googleapis.com/auth/gmail.readonly`
- `openid`
- `https://www.googleapis.com/auth/userinfo.email`

**Screenshot placeholder:**  
*Add screenshot: OAuth consent screen config (User type, Publishing status, Scopes).*

---

## 4. Credentials — OAuth client

| Field | Value |
|-------|--------|
| **Client name (exact)** | `q-suite-reil-gmail-connector` |
| **Type** | Web application |
| **Authorized redirect URIs** | `http://localhost:8765/callback`, `http://127.0.0.1:8765/callback` |

| Requirement | Status | Evidence |
|-------------|--------|----------|
| OAuth client ID created (Web application) | ☐ Done | *(Screenshot: Credentials → client name and type)* |
| Name matches exactly: `q-suite-reil-gmail-connector` | ☐ Done | — |
| Redirect URIs include localhost and 127.0.0.1 on port 8765 | ☐ Done | — |
| Client ID and Client secret copied to secure handoff for Platform Ops | ☐ Done | *(Do not paste secrets here)* |

**Screenshot placeholder:**  
*Add screenshot: APIs & Services → Credentials → OAuth 2.0 Client IDs — entry `q-suite-reil-gmail-connector` (no secret visible).*

---

## 5. Handoff to Platform Ops

- [ ] Client ID and Client secret delivered via secure handoff channel.
- [ ] Platform Ops will set `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` per [OAUTH_ENV_MAP.md](../../docs/q-suite/OAUTH_ENV_MAP.md) and [OAUTH_CLIENT_REGISTRY.md](../../docs/q-suite/OAUTH_CLIENT_REGISTRY.md).

---

## 6. References

- [OPS_901_QSUITE_CANON.md](../../docs/q-suite/OPS_901_QSUITE_CANON.md) — canonical project, completion routing
- [OAUTH_CANON.md](../../docs/q-suite/OAUTH_CANON.md) — canonical client and scopes
- [OAUTH_CLIENT_REGISTRY.md](../../docs/q-suite/OAUTH_CLIENT_REGISTRY.md) — single canonical client entry
- [OAUTH_ENV_MAP.md](../../docs/q-suite/OAUTH_ENV_MAP.md) — env and script mapping

---

## 7. Receipt status

| Criterion | Status |
|-----------|--------|
| Gmail API enabled | ☐ |
| OAuth consent: External, Testing or In Production; scopes gmail.readonly, openid, userinfo.email | ☐ |
| OAuth client `q-suite-reil-gmail-connector` (Web app) created with required redirect URIs | ☐ |
| Client ID and secret delivered to Platform Ops (secure channel; not in this receipt) | ☐ |
| Screenshots attached (no raw secrets) | ☐ |

**Receipt complete when all checkboxes are checked and screenshot placeholders are filled.**
