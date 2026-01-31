# OPS-901 — Redirect URIs (Gmail OAuth)

**Mission ID:** QREIL OPS-901  
**Owner:** infra-deployment-specialist  
**Purpose:** Canonical list of authorized redirect URIs for Q REIL Gmail OAuth (Web client).  
**PRD ref:** PRD_Q_REIL_v0.1 §6 (MVP scope), §10 (DoD #1 Gmail OAuth).

---

## Authorized redirect URIs

Configure **exactly** these in Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client (Web application) → Authorized redirect URIs:

| Environment | Base URL | Callback path | Full redirect URI |
|-------------|----------|----------------|--------------------|
| **Local** | `http://localhost:3000` | `/api/connectors/gmail/oauth/callback` | `http://localhost:3000/api/connectors/gmail/oauth/callback` |
| **Preview (Vercel)** | `https://q-reil-strata-nobles-projects.vercel.app` | `/api/connectors/gmail/oauth/callback` | `https://q-reil-strata-nobles-projects.vercel.app/api/connectors/gmail/oauth/callback` |
| **Production (Vercel)** | `https://q-reil.vercel.app` | `/api/connectors/gmail/oauth/callback` | `https://q-reil.vercel.app/api/connectors/gmail/oauth/callback` |
| **Proof script (optional)** | `http://localhost:8765` | `/callback` | `http://localhost:8765/callback` |
| **Proof fallback ports** | `http://localhost:8766` … `8769` | `/callback` | `http://localhost:8766/callback` … `http://localhost:8769/callback` |

---

## Copy-paste list (for GCP Console)

```
http://localhost:3000/api/connectors/gmail/oauth/callback
https://q-reil-strata-nobles-projects.vercel.app/api/connectors/gmail/oauth/callback
https://q-reil.vercel.app/api/connectors/gmail/oauth/callback
http://localhost:8765/callback
http://localhost:8766/callback
http://localhost:8767/callback
http://localhost:8768/callback
http://localhost:8769/callback
```

Proof script uses system browser and port fallback (8765–8769); add all so agent runs without manual steps.

---

## Verification

- [ ] All three URIs added in GCP OAuth client (Web application).
- [ ] No trailing slashes on URIs.
- [ ] Callback path matches app route: `api/connectors/gmail/oauth/callback` (no OAuth app code until proof posted; path reserved per spec).

**Receipt status:** _To be completed by infra-deployment-specialist after GCP configuration._
