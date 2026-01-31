# Q Suite UI Deploy Receipt

**Mission:** PLATOPS-QSUITE-BUILD-DEPLOY-0003  
**Owner:** Platform Ops  
**Date:** 2026-01-30  
**Status:** PENDING

---

## Deployment Target

| Item | Value |
|------|-------|
| Platform | Vercel |
| Team | strata-nobles-projects |
| Project | q-suite-ui (to be provisioned) |

---

## Vercel Configuration

- **Config file:** `q-suite-ui/vercel.json`
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Root directory:** `q-suite-ui` (set in Vercel project settings)

---

## Provisioning Steps

1. Create Vercel project for q-suite-ui (or link existing)
2. Set root directory to `q-suite-ui`
3. Connect Git repo for auto-deploys
4. Add environment variables via Vercel UI (vault references; no secrets in repo)

---

## Status

**Not yet deployed.** Build passes locally and in CI. Deploy when Vercel project is provisioned.
