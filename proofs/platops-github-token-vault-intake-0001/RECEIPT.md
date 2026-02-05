# PLATOPS-GITHUB-TOKEN-VAULT-INTAKE-0001 — Receipt

**Mission:** Vault a GitHub token with permission to edit repo settings for Parlay-Kei/Q-REIL.  
**Objective:** Vault ref resolves to a non-empty token value; receipt created.

---

## Authorized vault ref

| Item | Value |
|------|--------|
| **Vault ref (authorized)** | `VAULT_REF:parlay-kei/github/admin-token` |
| **Use** | Populate `GITHUB_TOKEN` or `GH_TOKEN` for repo settings (e.g. PATCH repo description, PLATOPS-GITHUB-REPO-ABOUT-SET-0001). |
| **Scope required** | GitHub token with `repo` (or admin) for **Parlay-Kei/Q-REIL**. |

---

## Input from Steve (choose one)

1. **Existing vault ref**  
   If a GitHub admin token for Parlay-Kei/Q-REIL is already vaulted, provide the ref (e.g. same path or alternate). Document that ref in **Token source method** below and ensure it resolves before marking acceptance.

2. **Authorize creation**  
   If none exists, authorize Platform Ops to create the vault entry **`parlay-kei/github/admin-token`**. Platform Ops will request the token through the normal secrets intake channel. **No token in chat or in repo.**

---

## Token source method (redacted)

| Field | Value |
|-------|--------|
| **Method** | Secrets intake channel; token requested by Platform Ops; not stored or transmitted in chat, PR, or repo. |
| **Resolution** | Vault ref → env: e.g. `GITHUB_TOKEN` or `GH_TOKEN` set from vault at runtime (CI or local). |
| **Verification** | Run `proofs/platops-github-repo-about-set-0001/apply-and-verify.ps1` with token in env; PATCH succeeds and GET confirms description. |

---

## Redaction rules

- **Never** commit, log, or paste the token value in chat, issues, or PRs.
- **Never** store the token in repo files (e.g. `.env` committed); use vault or local-only `.env.local` (gitignored).
- In receipts and runbooks: refer only to the vault ref or to “token from env (vault)”.
- In scripts: read from `process.env.GITHUB_TOKEN` or `process.env.GH_TOKEN`; do not echo or print the value.

---

## Acceptance

| Criterion | Status |
|----------|--------|
| Vault ref defined / authorized | **Done** — `VAULT_REF:parlay-kei/github/admin-token` |
| Vault ref resolves to non-empty token | **Pending** — operator to confirm after vault entry is created and resolved into env. |
| Receipt created | **Done** — this file. |

---

## Proof metadata

| Item | Value |
|------|--------|
| **Timestamp** | 2026-02-01 (UTC) |
| **Repo** | Parlay-Kei/Q-REIL |
| **Related** | [platops-github-repo-about-set-0001](../platops-github-repo-about-set-0001/RECEIPT.md) (repo About description; requires this token). |

---

## Notes

- After the vault entry exists and the ref resolves: run `apply-and-verify.ps1` from `proofs/platops-github-repo-about-set-0001` to confirm token works for repo settings.
- If Steve provides a different vault path, update **Authorized vault ref** and **Token source method** in this receipt and keep redaction rules unchanged.
