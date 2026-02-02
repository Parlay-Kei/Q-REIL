# PLATOPS-QREIL-PROOFS-INDEX-NORMALIZE-1003-receipt

**Spawn:** PLATOPS-QREIL-PROOFS-INDEX-NORMALIZE-1003  
**Objective:** Ensure previously forced files remain tracked naturally under the new ignore rules; remove any forced-add workarounds from workflows if no longer required.

---

## 1. Previously forced files — now tracked naturally

After ENGDEL-QREIL-PROOFS-GITIGNORE-FIX-1002:

- **`proofs/q-reil/**`** is no longer ignored (root `.gitignore` negations: `!proofs/q-reil/`, `!proofs/q-reil/**`, `!proofs/**/*.md`, `!proofs/**/*.json`).
- Receipts under `proofs/q-reil/*.md` and `proofs/q-reil/*.json` are trackable with **plain `git add`**; no `git add -f` needed.
- Any other `proofs/**/*.md` or `proofs/**/*.json` (e.g. `proofs/qreil-ui-drift/`, `proofs/platops-github-*`) are also allowed by the same rules.

**Verification:** `git check-ignore -v proofs/q-reil/PLATOPS-QREIL-ENV-ASSERT-CI-0801-receipt.md` now reports a negation rule (file is not ignored).

---

## 2. Forced-add workarounds in workflows

| Workflow | Pattern | Action |
|----------|---------|--------|
| `.github/workflows/q-reil-proof-runner.yml` | `[ -f "$f" ] && git add "$f"` (line 506) | **No change.** Uses plain `git add`; no `-f`. With new ignore policy, receipts are no longer ignored, so this continues to work without force-add. |
| Other workflows | — | No `git add` of proof paths (they upload artifacts or run in a different checkout). |

**Conclusion:** No forced-add workarounds were present in the repo; nothing was removed. The proof-runner already uses normal `git add`; it will now succeed because proof paths are no longer ignored.

---

## 3. Summary

- **Index state:** Proof artifacts under `proofs/q-reil/` and `proofs/**/*.md`, `proofs/**/*.json` are tracked naturally under the updated ignore policy.
- **Workflows:** No updates required; no `git add -f` was in use; proof-runner commit step remains valid.
