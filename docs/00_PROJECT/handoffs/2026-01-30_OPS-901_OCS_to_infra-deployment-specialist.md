# OCS: Manual tasks — Invoke infra-deployment-specialist (OPS-901)

**Dispatched:** 2026-01-30  
**From:** OCS (orchestrator)  
**To:** infra-deployment-specialist  
**Mission ID:** QREIL OPS-901  
**Type:** Manual (GCP Console + Vercel dashboard + proof collection)

**PRD alignment:** PRD_Q_REIL_v0.1 §6 (MVP scope: Gmail OAuth), §10 (DoD #1 Gmail OAuth E2E), §11 (dependencies).

---

## Task

Execute the **OPS-901 runbook** and post the **5-point proof pack**. No OAuth code changes in app until proof is posted. Target: unblock AUTH-101.

### Authority

- **Runbook:** [docs/q-reil/receipts/OPS-901_OAUTH_PROOF.md](../../q-reil/receipts/OPS-901_OAUTH_PROOF.md) (steps 1–6).
- **Redirect URIs:** [docs/q-reil/receipts/OPS-901_REDIRECT_URIS.md](../../q-reil/receipts/OPS-901_REDIRECT_URIS.md).
- **Secret store:** [docs/q-reil/receipts/OPS-901_SECRET_STORE_REFERENCE.md](../../q-reil/receipts/OPS-901_SECRET_STORE_REFERENCE.md).
- **Proof script (optional):** [scripts/oauth-proof/README.md](../../scripts/oauth-proof/README.md) — run `node scripts/oauth-proof/proof-gmail-oauth.mjs` after adding `http://localhost:8765/callback` to GCP redirect URIs; script proves OAuth + token refresh and prints evidence for points 4 and 5.

### Manual steps (summary)

1. **Google Cloud:** Non-personal project → enable Gmail API → configure OAuth consent screen → create OAuth client (Web) → add the three redirect URIs from OPS-901_REDIRECT_URIS.md.
2. **Vercel:** [q-reil → Settings → Environment Variables](https://vercel.com/strata-nobles-projects/q-reil/settings/environment-variables) — add `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` (Production + Preview).
3. **Proof:** Run minimal OAuth test with test user; force token refresh; fill in all 5 proof points and checkboxes in OPS-901_OAUTH_PROOF.md.

### Completion

- [ ] All 7 acceptance criteria in OPS-901_OAUTH_PROOF.md satisfied.
- [ ] All 5 proof points evidenced (screenshots/notes) in OPS-901_OAUTH_PROOF.md.
- [ ] Receipt status in OPS-901_OAUTH_PROOF.md, OPS-901_REDIRECT_URIS.md, OPS-901_SECRET_STORE_REFERENCE.md set to completed.
- [ ] [RECEIPTS.md](../../q-reil/RECEIPTS.md) §5 OPS-901 status updated to Done; AUTH-101 unblocked.

---

**Receipts:** `docs/q-reil/receipts/OPS-901_*.md`, `docs/q-reil/RECEIPTS.md`.
