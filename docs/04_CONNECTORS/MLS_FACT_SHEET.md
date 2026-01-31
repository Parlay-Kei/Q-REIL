# MLS/RETS Integration Fact Sheet

**Last Updated:** 2025-12-31
**Research Status:** Desktop Research (Based on known industry standards)
**Sprint:** 0.1

---

## Platform Overview

### MLS Landscape

| Attribute | Details |
|-----------|---------|
| **What is MLS** | Multiple Listing Service - cooperative databases of property listings |
| **Market Structure** | Highly fragmented - 500+ separate MLS organizations in the US |
| **Governing Body** | NAR (National Association of Realtors) sets guidelines |
| **Data Standards** | RESO (Real Estate Standards Organization) |
| **Access Model** | Membership-based (typically through real estate associations) |

### Key Players

| Organization | Role | Notes |
|--------------|------|-------|
| **RESO** | Standards body | Defines data dictionary and Web API spec |
| **NAR** | Industry association | Sets MLS policies |
| **CoreLogic/Trestle** | Major aggregator | Access to many MLSs via single connection |
| **Bridge Interactive** | Major aggregator | Similar to Trestle |
| **Spark API** | Technology provider | Powers many MLS systems |
| **MLS Grid** | Aggregator | Growing national coverage |
| **ListHub** | Distribution network | Listing syndication |

### Fragmentation Reality
```
US MLS Landscape:
├── ~550 separate MLS organizations
├── No single national MLS database
├── Each MLS has own rules and data
├── Regional consolidation happening slowly
└── Must connect to EACH MLS or use aggregator
```

---

## Data Standards: RESO Web API vs RETS

### RETS (Real Estate Transaction Standard) - LEGACY

| Attribute | Details |
|-----------|---------|
| **Status** | Deprecated - sunset deadline was 2018, but many still use |
| **Protocol** | XML over HTTP |
| **Query Language** | DMQL (proprietary) |
| **Authentication** | Basic Auth or Digest Auth |
| **Recommendation** | Avoid for new integrations |

### RESO Web API - CURRENT STANDARD

| Attribute | Details |
|-----------|---------|
| **Status** | Current standard, actively maintained |
| **Protocol** | REST + OData 4.0 |
| **Data Format** | JSON |
| **Authentication** | OAuth 2.0 (client credentials or authorization code) |
| **Data Dictionary** | RESO Data Dictionary 1.7+ |
| **Certification** | RESO certification program for compliance |

### RESO Web API Endpoints (Standard)

| Endpoint | Description | OData Query Support |
|----------|-------------|---------------------|
| `/Property` | Listings (residential, commercial) | Full OData filters |
| `/Member` | Agent/broker records | Standard queries |
| `/Office` | Brokerage offices | Standard queries |
| `/Media` | Photos, documents, virtual tours | By property reference |
| `/OpenHouse` | Open house schedules | Date range queries |
| `/HistoryTransactional` | Listing history | By property reference |

---

## Authentication

| Attribute | Status | Notes |
|-----------|--------|-------|
| **Method** | OAuth 2.0 | Per RESO standard |
| **Grant Types** | Client Credentials, Auth Code | Depends on MLS/aggregator |
| **Token Type** | Bearer | Standard JWT or opaque |
| **Refresh** | Supported | Typical 1hr access, 7-day refresh |

### Multi-MLS Authentication Challenge
```
Each MLS Connection Requires:
├── Separate OAuth credentials
├── Individual membership/licensing
├── Compliance with that MLS's rules
└── Data use agreement
```

---

## API Capabilities

### Data Available

| Data Type | Availability | RESO Standard Field |
|-----------|--------------|---------------------|
| **Listings** | YES | Property resource |
| **Property Details** | YES | 400+ standard fields |
| **List Price/Status** | YES | ListPrice, StandardStatus |
| **Property Photos** | YES | Media resource |
| **Agent/Broker Info** | YES | Member, Office resources |
| **Historical Data** | VARIES | Some MLSs restrict |
| **Market Statistics** | LIMITED | Not standardized |
| **Sold Data** | VARIES | Some MLSs restrict access |

### Sample Property Fields (RESO Data Dictionary)

```json
{
  "ListingKey": "ABC123",
  "ListPrice": 450000,
  "StandardStatus": "Active",
  "PropertyType": "Residential",
  "PropertySubType": "Single Family Residence",
  "BedroomsTotal": 4,
  "BathroomsTotalInteger": 3,
  "LivingArea": 2500,
  "LotSizeSquareFeet": 8000,
  "YearBuilt": 1995,
  "City": "Denver",
  "StateOrProvince": "CO",
  "PostalCode": "80202",
  "Latitude": 39.7392,
  "Longitude": -104.9903,
  "PublicRemarks": "Beautiful home...",
  "ListAgentKey": "AGENT001",
  "ListOfficeKey": "OFFICE001"
}
```

### Write Capabilities

| Operation | Availability | Notes |
|-----------|--------------|-------|
| Create Listing | LIMITED | Typically agents use MLS-specific tools |
| Update Listing | LIMITED | Same as above |
| Status Changes | LIMITED | Most MLSs don't allow external writes |
| **Overall** | READ-ONLY for most integrations | Write access rare for third-party |

### Webhooks vs Polling

| Capability | Status | Notes |
|------------|--------|-------|
| **Webhooks** | RARE | Most MLSs don't support |
| **Polling Required** | YES | Standard approach |
| **Replication** | Supported | Full dataset sync, then delta |
| **ModificationTimestamp** | Standard field | Use for incremental sync |

---

## Constraints

### Rate Limits (Typical)

| Limit Type | Typical Range | Notes |
|------------|---------------|-------|
| Requests per minute | 60-120 | Varies by MLS |
| Daily limit | 10,000-50,000 | May be per-user or per-app |
| Concurrent requests | 2-5 | Often restricted |
| Records per request | 200-500 | Pagination required |

### Licensing Requirements

| Requirement | Details |
|-------------|---------|
| **Membership** | Must be REALTOR member or have data license |
| **Data License Fee** | $500-$5,000/year per MLS |
| **IDX License** | Required for displaying listings |
| **VOW License** | Required for virtual office websites |
| **Usage Restrictions** | Cannot resell data, restrictions on display |
| **Update Requirements** | Must refresh data every 12-24 hours |

### Compliance Requirements
- RESO certification may be required
- Display requirements (broker attribution)
- Data retention limits
- Photo usage rights
- Fair housing compliance

---

## Integration Pathways

### Option 1: Direct MLS Connections
```
Pros:
├── Full data access
├── No middleman fees
└── Custom integration

Cons:
├── Must connect to each MLS separately
├── 100+ integrations for national coverage
├── Each has different rules/contracts
└── Maintenance nightmare
```

### Option 2: Aggregator (Recommended for MVP)
```
Providers:
├── Trestle (CoreLogic) - Wide coverage, enterprise pricing
├── Bridge Interactive - Similar scope
├── MLS Grid - Growing network
├── Spark API - Technology platform
└── ListHub - Syndication-focused

Pros:
├── Single integration point
├── Multiple MLSs via one API
├── Standardized data format
└── Simplified compliance

Cons:
├── Additional cost layer
├── May not cover all markets
├── Data latency possible
└── Dependent on aggregator
```

### Option 3: Hybrid Approach
```
Strategy:
├── Use aggregator for national coverage
├── Direct connections for high-priority markets
└── Phased rollout by market
```

---

## Regional Considerations

### Market Coverage Strategy

| Region | Major MLSs | Aggregator Coverage |
|--------|-----------|---------------------|
| California | CRMLS, MLSListings, BAREIS | Good |
| Texas | HAR, NTREIS, SABOR | Good |
| Florida | Stellar MLS, Miami MLS | Good |
| Northeast | Bright MLS, MLSPIN | Good |
| Midwest | MRED, NorthstarMLS | Good |
| Colorado | REcolorado | Good |

### Considerations by Market Type
- **Urban markets:** Well-served by aggregators
- **Rural markets:** May need direct connections
- **Commercial RE:** Different data sources (CoStar, LoopNet, CREXi)

---

## Hard Blocks

### Confirmed Challenges
1. **Fragmentation** - No single national MLS API
2. **Membership Required** - Cannot access without proper licensing
3. **Read-Only** - Write access generally not available
4. **Compliance Burden** - Display rules, attribution requirements
5. **Cost Per Market** - Fees accumulate across markets

### Potential Blockers
- Some MLSs don't allow third-party access at all
- Data use restrictions may conflict with REIL/Q use case
- Historical/sold data often restricted
- Aggregator pricing may not fit business model

---

## Spike Results

### Auth Spike
| Attribute | Value |
|-----------|-------|
| Date executed | NOT YET EXECUTED |
| Result | PENDING |
| Evidence | N/A |
| Blocker | Need MLS membership or aggregator account |

### Data Pull Spike
| Attribute | Value |
|-----------|-------|
| Date executed | NOT YET EXECUTED |
| Result | PENDING |
| Sample data | N/A |

---

## Recommended Integration Strategy

### Phase 1: MVP (Sprint 0.2-0.3)
1. Partner with single aggregator (Trestle or Bridge)
2. Start with 3-5 pilot markets
3. Implement read-only listing sync
4. Basic property search capability

### Phase 2: Expansion (v1.1+)
1. Add more markets through aggregator
2. Direct connections for high-value markets
3. Historical data integration
4. Market analytics features

### Phase 3: Scale (v2.0+)
1. National coverage
2. Multiple aggregator relationships
3. Commercial MLS integration
4. Predictive analytics on market data

---

## Action Items for Verification

### Immediate (Day 1-2)
- [ ] Contact Trestle (CoreLogic) for pricing and coverage info
- [ ] Contact Bridge Interactive for comparison
- [ ] Review RESO certification requirements
- [ ] Identify pilot markets for MVP

### Short-term (Week 1-2)
- [ ] Select aggregator partner
- [ ] Obtain sandbox credentials
- [ ] Execute authentication spike
- [ ] Test property data retrieval

---

## MVP Recommendation

| Attribute | Assessment |
|-----------|------------|
| **Verdict** | CONDITIONAL GO |
| **Confidence** | MEDIUM-HIGH |
| **Rationale** | MLS data is core value for real estate platform; aggregators simplify access |
| **Timeline Estimate** | 2-3 sprints via aggregator |
| **Risk Level** | MEDIUM |

### Conditional Factors
1. **IF** aggregator provides affordable pilot terms: **GO**
2. **IF** aggregator covers MVP pilot markets: **GO**
3. **IF** pricing requires large upfront commitment: **DEFER**
4. **IF** data use terms conflict with REIL/Q: **EVALUATE**

### MVP Scope
- Read-only listing data
- 3-5 pilot markets
- Basic property search
- Photo/media integration
- Agent/office data for attribution

### Fallback Strategy
- Manual property entry
- Public records data (less comprehensive)
- User-provided listing links
- Zillow/Redfin embeds (terms permitting)

---

## References

- RESO: https://www.reso.org
- RESO Web API: https://www.reso.org/reso-web-api/
- RESO Data Dictionary: https://ddwiki.reso.org
- Trestle: https://www.corelogic.com/products/trestle/
- Bridge Interactive: https://www.bridgeinteractive.com

---

## Notes

> **Key Insight:** MLS integration is feasible but requires aggregator partnership or significant direct-connection effort. The RESO Web API standard makes the technical implementation straightforward; the complexity is in the business relationships and compliance.

> **Strategic Recommendation:** Start aggregator conversations immediately. The business/licensing setup takes longer than the technical integration.

> **Commercial Real Estate Note:** Standard MLS data is primarily residential. Commercial RE data requires different sources (CoStar, CREXi, LoopNet) - separate research needed if CRE is in scope.
