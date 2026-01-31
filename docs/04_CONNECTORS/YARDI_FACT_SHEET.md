# Yardi Integration Fact Sheet

**Last Updated:** 2025-12-31
**Research Status:** Desktop Research (Web access unavailable - requires verification)
**Sprint:** 0.1

---

## Platform Overview

| Attribute | Details |
|-----------|---------|
| **Company** | Yardi Systems, Inc. |
| **Product Type** | Property management and accounting software |
| **Target Users** | Property managers, landlords, real estate investors, multifamily operators |
| **Website** | https://www.yardi.com |
| **Market Position** | Industry leader in property management software |
| **User Base** | Manages 14+ million units globally (estimated) |
| **Geographic Focus** | Global (US, Canada, UK, APAC) |

### Product Suite
- **Yardi Voyager** - Enterprise property management platform
- **Yardi Breeze** - Small/mid-size property management
- **RENTCafe** - Marketing and leasing platform
- **Yardi Matrix** - Market data and analytics
- **Yardi Investment Management** - Asset management

### Core Capabilities
- Property accounting and financials
- Lease management and tracking
- Tenant portals and communications
- Maintenance request management
- Reporting and analytics
- Commercial and residential property support

---

## Authentication

| Attribute | Status | Notes |
|-----------|--------|-------|
| **Method** | UNVERIFIED | Likely OAuth 2.0 or API Key with client credentials |
| **Partner Program Required** | YES | Yardi Interface License required |
| **Sandbox Available** | UNKNOWN | Typically available for certified partners |
| **Credentials Obtained** | NO | Requires Yardi partnership |

### Authentication Details
- Yardi uses an **Interface License** model for API access
- Clients must request interface access through their Yardi representative
- Third-party integrations require Yardi certification
- Authentication typically involves:
  - Client ID / Client Secret
  - Database/entity credentials
  - Multi-tenant aware (database per client)

---

## API Capabilities

### Yardi API Ecosystem

Yardi provides multiple integration pathways:

| API Type | Description | Availability |
|----------|-------------|--------------|
| **Yardi API** | Native REST/SOAP APIs | Partner license required |
| **Yardi Marketplace** | Pre-built integrations | Customer request |
| **Bulk Data Exports** | Scheduled data dumps | Customer configured |
| **Third-Party Middleware** | Integration platforms | Via vendors (Entrata, etc.) |

### Expected Endpoints

| Endpoint Category | Expected Methods | MVP Use Case | Status |
|-------------------|------------------|--------------|--------|
| Properties | GET | List properties | UNVERIFIED |
| Units | GET | Unit inventory, status | UNVERIFIED |
| Leases | GET | Active/historical leases | UNVERIFIED |
| Tenants/Contacts | GET | Tenant information | UNVERIFIED |
| Transactions | GET | Financial transactions | UNVERIFIED |
| Charges/Payments | GET | Rent rolls, payment history | UNVERIFIED |
| Maintenance | GET | Work orders | UNVERIFIED |
| Documents | GET | Lease documents | UNVERIFIED |

### Data Availability Assessment

| Data Type | Expected Availability | Confidence |
|-----------|----------------------|------------|
| Properties | Yes - core entity | HIGH |
| Units | Yes - core entity | HIGH |
| Leases | Yes - lease management is core | HIGH |
| Contacts (tenants) | Yes - tenant records | HIGH |
| Financial data | Yes - accounting is core | HIGH |
| Documents | Likely - lease docs, attachments | MEDIUM |
| Market data | Yardi Matrix product (separate) | MEDIUM |

### Webhooks vs Polling

| Capability | Status | Notes |
|------------|--------|-------|
| **Webhooks Available** | UNCERTAIN | Yardi traditionally uses polling/batch |
| **Event Types** | UNKNOWN | If available: lease.signed, payment.received |
| **Polling Fallback** | PLAN FOR IT | Yardi integration typically batch-oriented |
| **Real-time Needs** | Design for eventual consistency | Expect hourly/daily sync |

---

## Constraints

### Rate Limits

| Limit Type | Expected | Notes |
|------------|----------|-------|
| Requests per minute | UNKNOWN | Likely conservative limits |
| Requests per day | UNKNOWN | May be per-database |
| Concurrent connections | UNKNOWN | Multi-tenant considerations |
| Payload size | UNKNOWN | - |

### Partner Requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| **Interface License** | REQUIRED | Yardi charges per interface |
| **Certification** | REQUIRED | Must pass Yardi certification |
| **Approval Timeline** | 4-12 weeks typical | Can be lengthy |
| **Annual Fee** | YES | Varies by integration scope |
| **Security Review** | REQUIRED | SOC 2, security questionnaire |
| **Legal Agreement** | REQUIRED | Interface agreement with Yardi |

### Cost Considerations
- Yardi charges **per-interface fees**
- Costs typically passed to end customers
- May require minimum volume commitments
- Annual maintenance/support fees

---

## Hard Blocks

### Confirmed Blockers
- **NONE CONFIRMED** - Requires direct verification

### Known Challenges
1. **Partner Program Gate** - Yardi has formal certification requirements
2. **Client-Initiated** - Each customer must enable the interface on their Yardi instance
3. **Per-Client Credentials** - Multi-tenant architecture requires credentials per customer
4. **Long Approval Timeline** - Certification can take 2-3 months
5. **Cost Structure** - Interface fees may impact business model

### Potential Blockers
- Data access may be limited to what customer has licensed
- Some Yardi modules may not expose APIs
- Different Yardi products (Voyager vs Breeze) have different API capabilities

---

## Spike Results

### Auth Spike
| Attribute | Value |
|-----------|-------|
| Date executed | NOT YET EXECUTED |
| Result | PENDING |
| Evidence | N/A |
| Blocker | Requires Yardi partner certification |

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

### Alternative 1: Third-Party Middleware
- Use existing Yardi connectors (Zapier, MRI, etc.)
- Faster to implement
- Cost: subscription to middleware

### Alternative 2: Bulk Export/Import
- Scheduled data exports from Yardi
- CSV/Excel upload to REIL/Q
- Manual process, not real-time

### Alternative 3: RENTCafe Integration
- Yardi's marketing/leasing platform may have different API access
- More modern API design
- Limited to leasing workflows

### Alternative 4: Customer-Specific Integration
- Work with specific customer's Yardi admin
- Custom reports/exports
- Not scalable for multiple customers

### Alternative 5: Yardi Marketplace
- Publish REIL/Q as Yardi Marketplace partner
- Longer timeline, higher commitment
- Better long-term positioning

---

## Multi-Tenant Architecture Considerations

Yardi's architecture creates specific integration patterns:

```
Each Customer Has:
├── Separate Yardi database
├── Own set of API credentials
├── Specific modules licensed
└── Unique configuration

REIL/Q Must:
├── Store per-customer credentials
├── Handle per-customer rate limits
├── Manage credential refresh
└── Support varied data models
```

---

## Action Items for Verification

### Immediate (Day 1-2)
- [ ] Contact Yardi partnerships team
- [ ] Request information on Interface License program
- [ ] Identify certification requirements and timeline
- [ ] Determine cost structure for REIL/Q use case

### Short-term (Week 1-2)
- [ ] Submit Yardi interface certification application
- [ ] Identify pilot customer with Yardi (if available)
- [ ] Obtain sandbox access
- [ ] Review Yardi API documentation

### Medium-term (Week 3-4)
- [ ] Complete certification process
- [ ] Execute authentication spike
- [ ] Test data retrieval with sandbox

---

## MVP Recommendation

| Attribute | Assessment |
|-----------|------------|
| **Verdict** | DEFER |
| **Confidence** | MEDIUM |
| **Rationale** | Yardi requires formal certification with timeline exceeding MVP scope |
| **Timeline Estimate** | 3-4 months for certification, 1-2 sprints for integration |
| **Risk Level** | MEDIUM |

### Decision Rationale
1. Yardi integration is valuable but not MVP-critical
2. Certification timeline (8-12 weeks) extends beyond MVP delivery
3. Per-customer setup complexity adds implementation burden
4. Cost structure needs business validation

### Recommended Approach
1. **Sprint 0.1:** Begin Yardi certification process (application, paperwork)
2. **Sprint 0.2-0.3:** Continue certification, design integration architecture
3. **Sprint 0.4+:** Implement integration once certified

### Fallback Strategy for MVP
- Manual CSV export/import for property data
- Spreadsheet upload for lease information
- Target direct Yardi integration for v1.1

---

## References

- Yardi Website: https://www.yardi.com
- Yardi API Info: https://www.yardi.com/products/yardi-api/ (verify)
- Yardi Marketplace: https://www.yardi.com/products/yardi-marketplace/

---

## Notes

> **Research Limitation:** This fact sheet was compiled without web access. All technical details marked as UNVERIFIED require confirmation. Yardi's partner program details are based on industry knowledge and typical enterprise software patterns.

> **Key Insight:** Yardi integration is a strategic investment requiring formal partnership. Start the certification process early even if integration is deferred past MVP.

> **Customer Dependency:** Each REIL/Q customer using Yardi will need to enable the interface in their Yardi instance. This creates customer onboarding complexity.
