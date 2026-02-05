# Lane 1 — Missing Inputs Register

**Owner:** OCS  
**Purpose:** Minimal inputs required before or during Lane 1 execution. No secrets.  
**Kickoff:** [OCS_KICKOFF_REIL_LANE1_GMAIL_TO_LIVE.md](OCS_KICKOFF_REIL_LANE1_GMAIL_TO_LIVE.md)

---

## 1. OAuth consent operator and Google account

| Field | Value |
|-------|--------|
| **Why** | Refresh token mint (0023) needs an interactive consent flow once. |
| **Discovery status** | PENDING (Platform Ops to confirm if a token already exists in vault or receipts). |
| **If NOT FOUND** | Minimal input: which Google account performs consent. Default: `stratanoble.co@gmail.com`. |

---

## 2. Where the Gmail refresh token is stored (Vercel env vs vault vs GitHub secret)

| Field | Value |
|-------|--------|
| **Why** | Runtime ingest needs the token; pointer must be known. |
| **Discovery status** | PENDING (Platform Ops inventory). |
| **If NOT FOUND** | Minimal input: pick store. Default per directive: **Vercel Production env**. |

---

## 3. Which Gmail label or query scope we ingest

| Field | Value |
|-------|--------|
| **Why** | Ingest run must be deterministic for idempotency (0026). |
| **Discovery status** | PENDING (Engineering Delivery to read run-sync defaults). |
| **If NOT FOUND** | Minimal input: INBOX only or include SENT. Default: **INBOX only**. |

---

## References

- OAuth pointer discovery: PLATOPS-REIL-OAUTH-POINTER-DISCOVERY-0032
- Execution routing: [OCS_LANE1_EXEC_ROUTING_0031_0038.md](OCS_LANE1_EXEC_ROUTING_0031_0038.md)
