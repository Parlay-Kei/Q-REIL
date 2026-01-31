# Connector MVP Go/No-Go Matrix

**Last Updated:** 2025-12-31
**Sprint:** 0.1
**Research Status:** Desktop Research (requires verification with direct API testing)

---

## Executive Summary

| Platform | MVP Verdict | Confidence | Primary Blocker | Timeline |
|----------|-------------|------------|-----------------|----------|
| **SkySlope** | CONDITIONAL GO | LOW | Partner access unverified | 2-4 sprints |
| **Yardi** | DEFER | MEDIUM | Certification timeline | 3-4 months |
| **MLS/RESO** | CONDITIONAL GO | MEDIUM-HIGH | Aggregator partnership needed | 2-3 sprints |
| **AIR CRE** | DEFER | LOW | No known API | N/A |

---

## Capability Matrix

### Authentication Status

| Platform | Auth Method | Self-Service | Partner Required | Sandbox |
|----------|-------------|--------------|------------------|---------|
| SkySlope | OAuth 2.0 (likely) | UNKNOWN | LIKELY | UNKNOWN |
| Yardi | OAuth 2.0 + License | NO | YES | YES (partners) |
| MLS/RESO | OAuth 2.0 | NO | YES | YES (via aggregator) |
| AIR CRE | N/A | N/A | UNKNOWN | N/A |

### Read Capabilities

| Platform | Transactions | Documents | Contacts | Properties | Status |
|----------|--------------|-----------|----------|------------|--------|
| SkySlope | EXPECTED | EXPECTED | EXPECTED | N/A | UNVERIFIED |
| Yardi | EXPECTED | LIKELY | EXPECTED | EXPECTED | UNVERIFIED |
| MLS/RESO | N/A | MEDIA | AGENTS | EXPECTED | KNOWN |
| AIR CRE | N/A | FORMS | N/A | N/A | UNLIKELY |

### Write Capabilities

| Platform | Create | Update | Upload Docs | Status |
|----------|--------|--------|-------------|--------|
| SkySlope | UNKNOWN | UNKNOWN | UNKNOWN | UNVERIFIED |
| Yardi | UNLIKELY | LIMITED | UNLIKELY | UNVERIFIED |
| MLS/RESO | NO | NO | NO | KNOWN (read-only) |
| AIR CRE | N/A | N/A | N/A | N/A |

### Real-Time Capabilities

| Platform | Webhooks | Polling Required | Sync Frequency |
|----------|----------|------------------|----------------|
| SkySlope | UNKNOWN | LIKELY | TBD |
| Yardi | UNLIKELY | YES | Daily/Hourly |
| MLS/RESO | RARE | YES | Every 15min-24hr |
| AIR CRE | N/A | N/A | N/A |

### Partner/Access Gates

| Platform | Application | Timeline | Certification | Annual Fee |
|----------|-------------|----------|---------------|------------|
| SkySlope | LIKELY | 2-8 weeks | UNKNOWN | UNKNOWN |
| Yardi | REQUIRED | 8-12 weeks | REQUIRED | YES |
| MLS/RESO | REQUIRED | 2-4 weeks | OPTIONAL | YES (per MLS) |
| AIR CRE | UNKNOWN | UNKNOWN | N/A | UNKNOWN |

---

## Status Legend

| Color | Meaning |
|-------|---------|
| GREEN | Tested and working / Confirmed available |
| YELLOW | Partially working / Untested / Likely available |
| RED | Blocked / Failed / Not available |
| GRAY | Not applicable / Unknown |

---

## Detailed Verdicts

### SkySlope

| Attribute | Assessment |
|-----------|------------|
| **Verdict** | CONDITIONAL GO |
| **Confidence** | LOW |
| **Risk Level** | MEDIUM-HIGH |

**Rationale:**
- SkySlope is the PRIMARY integration target for REIL/Q
- Transaction management is core to the platform
- API existence is expected but unverified
- Partner access process unclear

**Conditions for GO:**
1. Confirm API documentation exists
2. Partner application accepted within 4 weeks
3. Sandbox environment accessible
4. Key endpoints available (transactions, documents)

**MVP Scope (if GO):**
- Read transactions and transaction details
- Pull document list and metadata
- Download documents
- Pull contact/party information
- Polling-based sync (every 15-30 minutes)

**Blockers:**
- No public developer documentation found
- May be enterprise/partner-only access
- Business relationship may be required

**Fallback if NO-GO:**
- Manual transaction entry in REIL/Q
- CSV import for batch transactions
- Document upload from user
- Target SkySlope integration for v1.1

**Action Items:**
1. Contact SkySlope partnerships IMMEDIATELY
2. Search for developer portal
3. Check Zapier/integration marketplace presence
4. Prepare partner application

---

### Yardi

| Attribute | Assessment |
|-----------|------------|
| **Verdict** | DEFER |
| **Confidence** | MEDIUM |
| **Risk Level** | MEDIUM |

**Rationale:**
- Yardi requires formal Interface License certification
- Certification timeline (8-12 weeks) exceeds MVP window
- Per-customer setup adds complexity
- Cost structure needs business validation

**Why DEFER (not NO-GO):**
- Yardi integration is strategically valuable
- Property management data enriches platform
- Certification is achievable, just slow
- Start process now for v1.1

**Sprint 0.2-0.3 Actions:**
- Begin Yardi certification application
- Design multi-tenant credential architecture
- Prepare for eventual integration
- Identify pilot customer with Yardi

**MVP Workaround:**
- Manual property data entry
- CSV/spreadsheet import for lease data
- Document upload for lease files
- Basic property management without live Yardi sync

**Blockers:**
- Formal certification required
- Per-interface licensing fees
- Each customer needs Yardi-side enablement
- Multi-tenant credential management

---

### MLS/RESO

| Attribute | Assessment |
|-----------|------------|
| **Verdict** | CONDITIONAL GO |
| **Confidence** | MEDIUM-HIGH |
| **Risk Level** | MEDIUM |

**Rationale:**
- MLS data is core value for real estate platforms
- RESO Web API provides standardized access
- Aggregators (Trestle, Bridge) simplify multi-MLS access
- Technical implementation is well-documented

**Conditions for GO:**
1. Aggregator partnership with affordable pilot terms
2. Coverage for MVP pilot markets (3-5 markets)
3. Data use terms align with REIL/Q use case
4. Sandbox access for development

**MVP Scope:**
- Read-only listing data
- Property search and details
- Photos and media
- Agent/office information (for attribution)
- 3-5 pilot markets via aggregator

**Limitations:**
- Read-only (no write capability)
- Primarily residential data
- Compliance/attribution requirements
- Per-market licensing considerations

**Recommended Approach:**
1. Contact Trestle and Bridge for pricing
2. Select aggregator partner
3. Start with pilot markets
4. Implement RESO Web API client

**Fallback if NO-GO:**
- Public property records data
- Manual property entry
- User-provided listing links
- Defer MLS integration to v1.1

---

### AIR CRE

| Attribute | Assessment |
|-----------|------------|
| **Verdict** | DEFER |
| **Confidence** | LOW |
| **Risk Level** | LOW (no dependency) |

**Rationale:**
- AIR CRE is a forms library, not a software platform
- No known public API
- Direct integration likely not feasible
- Document-centric approach is better fit

**Why DEFER (not NO-GO):**
- Partnership may be possible (unverified)
- CRE forms could be valuable feature
- Document extraction tech improving
- May revisit with AI document capabilities

**MVP Approach:**
Document-centric strategy instead of form integration:
1. Accept any lease/CRE document upload
2. User manually enters key deal terms
3. Store documents for reference
4. No dependency on AIR CRE

**Phase 2 Enhancement:**
- AI-powered document extraction
- Auto-populate fields from uploaded documents
- Support any form source (AIR CRE, attorney-drafted, etc.)

**No Blockers for MVP:**
- Document-centric approach has no external dependencies
- Works with any document source
- Simpler implementation
- More flexible for users

---

## MVP Integration Priorities

### Sprint 0.2 Focus

| Priority | Platform | Scope | Risk |
|----------|----------|-------|------|
| **P0** | SkySlope | Verify API, auth spike, basic read | HIGH |
| **P1** | MLS | Aggregator partnership, pilot markets | MEDIUM |
| **P2** | Document Upload | Generic document storage | LOW |

### Sprint 0.3 Focus

| Priority | Platform | Scope | Depends On |
|----------|----------|-------|------------|
| **P0** | SkySlope | Full read integration | Sprint 0.2 success |
| **P1** | MLS | Property search, listing display | Aggregator deal |
| **P2** | Yardi | Begin certification | Application submitted |

### Deferred to v1.1+

| Platform | Scope | Timeline |
|----------|-------|----------|
| Yardi | Full integration | After certification (Q2) |
| AIR CRE | Evaluate partnership | If demand warrants |
| MLS Write | N/A | Not available |

---

## Risk Assessment

### High Risk Items

| Risk | Platform | Mitigation |
|------|----------|------------|
| SkySlope API doesn't exist | SkySlope | Contact partnerships; have fallback plan |
| Partner approval delays | All | Start applications immediately |
| Cost exceeds budget | MLS, Yardi | Negotiate pilot terms; phase rollout |

### Medium Risk Items

| Risk | Platform | Mitigation |
|------|----------|------------|
| Rate limits too restrictive | All | Design for batch/queue processing |
| Missing critical endpoints | SkySlope | Document gaps; design workarounds |
| Multi-tenant complexity | Yardi, MLS | Design credential management early |

### Low Risk Items

| Risk | Platform | Mitigation |
|------|----------|------------|
| AIR CRE has no API | AIR CRE | Document-centric approach ready |
| Form licensing issues | AIR CRE | Don't depend on specific forms |

---

## Recommendations

### Immediate Actions (This Week)

1. **SkySlope:** Contact partnerships team; locate developer portal; submit partner application
2. **MLS:** Contact Trestle and Bridge Interactive for pricing/coverage
3. **Yardi:** Begin certification application process
4. **AIR CRE:** Confirm no API via direct contact; proceed with document approach

### Architecture Decisions Needed

1. **Credential Storage:** Design secure multi-tenant credential management
2. **Sync Strategy:** Polling vs webhooks; sync frequency; conflict resolution
3. **Data Model:** Map external data to REIL/Q schema
4. **Error Handling:** Retry logic; degraded functionality; user notifications

### Business Decisions Needed

1. **Aggregator Selection:** MLS aggregator partner choice
2. **Pilot Markets:** Which 3-5 markets for MLS pilot
3. **Yardi Investment:** Confirm willingness to pursue certification
4. **Fallback UX:** Design manual entry flows as backup

---

## Success Metrics for Sprint 0.2

| Metric | Target | Measurement |
|--------|--------|-------------|
| SkySlope API confirmed | Yes/No | Documentation found, access obtained |
| SkySlope auth spike | Complete | Successful authentication |
| MLS aggregator selected | 1 partner | Contract/pilot terms agreed |
| Yardi application submitted | Yes | Application in process |
| Fallback flows designed | Complete | Manual entry UX ready |

---

## Handoff Notes

### For Backend Development

- Expect multi-tenant credential architecture needs
- Plan for polling-based sync (webhooks unreliable)
- Design for partial integration (some platforms, some data)
- Build abstraction layer for connector interfaces

### For Product/Business

- Partner applications needed for SkySlope, MLS, Yardi
- Licensing costs to be determined (MLS, Yardi)
- MVP can launch with manual entry fallbacks
- Direct integrations are sprint 0.3+ features

### For Project Orchestrator

- SkySlope integration is highest risk/highest value
- De-risk by contacting partnerships this week
- MLS integration is feasible with aggregator
- Yardi is strategic but not MVP-critical

---

## Appendix: Verification Checklist

### SkySlope
- [ ] Developer portal exists at developers.skyslope.com
- [ ] Partner application process documented
- [ ] Sandbox credentials obtainable
- [ ] REST API with OAuth 2.0
- [ ] Transaction endpoints available
- [ ] Document endpoints available

### Yardi
- [ ] Interface License application submitted
- [ ] Certification requirements documented
- [ ] Timeline confirmed
- [ ] Cost structure understood
- [ ] Pilot customer identified

### MLS
- [ ] Trestle pricing received
- [ ] Bridge pricing received
- [ ] Coverage maps reviewed
- [ ] Pilot markets selected
- [ ] Data use terms acceptable

### AIR CRE
- [ ] Direct contact made
- [ ] API existence confirmed/denied
- [ ] Partnership options explored
- [ ] Document approach validated

---

*This matrix will be updated as verification activities complete. Current assessments are based on desktop research and industry knowledge; all technical details require hands-on verification.*
