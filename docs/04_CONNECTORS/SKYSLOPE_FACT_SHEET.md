# SkySlope Integration Fact Sheet

**Last Updated:** 2025-12-31
**Research Status:** Desktop Research (Web access unavailable - requires verification)
**Sprint:** 0.1

---

## Platform Overview

| Attribute | Details |
|-----------|---------|
| **Company** | SkySlope, Inc. |
| **Product Type** | Transaction management platform for real estate |
| **Target Users** | Real estate agents, brokers, transaction coordinators (TCs) |
| **Website** | https://skyslope.com |
| **Market Position** | Leading transaction management platform serving residential real estate |
| **User Base** | 500,000+ real estate professionals (estimated) |
| **Geographic Focus** | United States, Canada |

### Core Capabilities
- Digital transaction management
- Document storage and organization
- E-signature integration (via DocuSign, others)
- Compliance tracking and audit trails
- Broker oversight dashboards
- Forms library and management
- Checklist automation

---

## Authentication

| Attribute | Status | Notes |
|-----------|--------|-------|
| **Method** | UNVERIFIED | Likely OAuth 2.0 or API Key |
| **Partner Program Required** | LIKELY YES | Enterprise/partner integrations typically require approval |
| **Sandbox Available** | UNKNOWN | Needs verification via developer portal |
| **Credentials Obtained** | NO | Requires partner application |

### Authentication Details (Needs Verification)
- SkySlope historically offers API access through partner/enterprise agreements
- Public developer portal existence: **UNCONFIRMED**
- Self-service API key generation: **UNLIKELY** (typically requires business relationship)

---

## API Capabilities

### Expected Endpoints (Based on Platform Functionality)

| Endpoint Category | Expected Methods | MVP Use Case | Status |
|-------------------|------------------|--------------|--------|
| Transactions | GET, POST | Pull deal list, create deals | UNVERIFIED |
| Transaction Details | GET, PUT | Pull/update deal details | UNVERIFIED |
| Documents | GET | List documents per transaction | UNVERIFIED |
| Document Download | GET | Download transaction documents | UNVERIFIED |
| Document Upload | POST | Upload documents to transaction | UNVERIFIED |
| Contacts/Parties | GET | Retrieve transaction parties | UNVERIFIED |
| Tasks/Checklists | GET | Pull task status | UNVERIFIED |
| Timeline/Activity | GET | Audit trail, activity history | UNVERIFIED |

### Data Availability Assessment

| Data Type | Expected Availability | Confidence |
|-----------|----------------------|------------|
| Transactions | Yes - core functionality | HIGH |
| Contacts (parties) | Yes - transaction parties | HIGH |
| Documents | Yes - document management is core | HIGH |
| Timeline/History | Likely - audit trail is compliance feature | MEDIUM |
| Task lists | Likely - checklist feature exists | MEDIUM |
| Forms data (field values) | Uncertain - may be PDF-only | LOW |

### Webhooks vs Polling

| Capability | Status | Notes |
|------------|--------|-------|
| **Webhooks Available** | UNKNOWN | Modern platforms typically support |
| **Event Types** | UNKNOWN | Likely: transaction.created, document.uploaded, status.changed |
| **Polling Fallback** | PLAN FOR IT | Assume polling needed until webhooks confirmed |

---

## Constraints

### Rate Limits (Unverified)

| Limit Type | Expected | Notes |
|------------|----------|-------|
| Requests per minute | UNKNOWN | Typical range: 60-100 RPM |
| Requests per day | UNKNOWN | Typical range: 10,000-100,000 |
| Burst limit | UNKNOWN | - |
| Payload size | UNKNOWN | Document uploads may have 10-50MB limits |

### Partner Requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| **Application Required** | LIKELY YES | Enterprise integrations typically gated |
| **Approval Timeline** | UNKNOWN | Estimate 2-8 weeks |
| **Certification Required** | UNKNOWN | May require integration testing |
| **Annual Fee** | UNKNOWN | Partner programs often have tiers |
| **Technical Review** | LIKELY | Security/architecture review probable |

### Data Residency & Compliance
- Data likely hosted in US data centers
- SOC 2 compliance expected (verify)
- GDPR considerations for any international data

---

## Hard Blocks

### Confirmed Blockers
- **NONE CONFIRMED** - Requires direct verification

### Potential Blockers (To Investigate)
1. **Partner Program Gate** - API access may require formal business agreement
2. **No Public Documentation** - Developer portal existence unconfirmed
3. **Enterprise-Only API** - May only be available to enterprise customers
4. **Long Approval Timeline** - Partner approval could exceed MVP timeline

---

## Spike Results

### Auth Spike
| Attribute | Value |
|-----------|-------|
| Date executed | NOT YET EXECUTED |
| Result | PENDING |
| Evidence | N/A |
| Blocker | Need API credentials / partner access |

### Data Pull Spike
| Attribute | Value |
|-----------|-------|
| Date executed | NOT YET EXECUTED |
| Result | PENDING |
| Sample data | N/A |

### Document Pull Spike
| Attribute | Value |
|-----------|-------|
| Date executed | NOT YET EXECUTED |
| Result | PENDING |
| Evidence | N/A |

---

## Integration Alternatives

If direct API integration is blocked:

### Alternative 1: SkySlope Forms + DocuSign API
- Use DocuSign API to access signed documents
- Limitation: Only captures signed docs, not full transaction

### Alternative 2: Manual Export/Import
- CSV export from SkySlope
- Manual document download
- User uploads to REIL/Q

### Alternative 3: Email Integration
- Parse SkySlope notification emails
- Extract document links
- Limitation: Fragile, not recommended

### Alternative 4: Browser Extension
- Chrome extension to capture data from SkySlope UI
- User-initiated sync
- Technical complexity: HIGH

---

## Action Items for Verification

### Immediate (Day 1-2)
- [ ] Visit https://developers.skyslope.com - check if developer portal exists
- [ ] Contact SkySlope sales/partnerships about API access
- [ ] Search for SkySlope on Zapier/integration platforms for clues
- [ ] Check if SkySlope has public Postman collections
- [ ] Search GitHub for SkySlope API wrappers/examples

### Short-term (Week 1)
- [ ] Submit partner program application if required
- [ ] Obtain sandbox credentials
- [ ] Execute authentication spike
- [ ] Document actual endpoints available

---

## MVP Recommendation

| Attribute | Assessment |
|-----------|------------|
| **Verdict** | CONDITIONAL GO |
| **Confidence** | LOW (needs verification) |
| **Rationale** | SkySlope is the primary integration target. Must verify API availability. |
| **Timeline Estimate** | 2-4 sprints (if API available), unknown (if partner-gated) |
| **Risk Level** | MEDIUM-HIGH |

### Conditional Factors
1. **IF** public API available with reasonable terms: **GO**
2. **IF** partner program with <4 week approval: **GO** (start application immediately)
3. **IF** partner program with >8 week approval: **DEFER** (use manual import for MVP)
4. **IF** no API available: **NO-GO** (pivot to alternative strategy)

### Fallback Strategy
- Manual document upload in MVP
- CSV transaction import
- Target direct integration for v1.1

---

## References

- SkySlope Website: https://skyslope.com
- SkySlope Help Center: https://help.skyslope.com (if exists)
- Integration Partners (may provide clues): Zapier, Dotloop, others

---

## Notes

> **Research Limitation:** This fact sheet was compiled without web access. All technical details marked as UNVERIFIED require confirmation through direct research and API testing. The assessment represents reasonable assumptions based on industry patterns for similar platforms.

> **Next Steps:** Priority is establishing contact with SkySlope to confirm API availability and initiate any required partner agreements.
