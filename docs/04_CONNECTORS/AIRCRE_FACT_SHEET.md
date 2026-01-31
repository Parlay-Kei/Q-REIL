# AIR CRE Integration Fact Sheet

**Last Updated:** 2025-12-31
**Research Status:** Desktop Research (Web access unavailable - requires verification)
**Sprint:** 0.1

---

## Platform Overview

| Attribute | Details |
|-----------|---------|
| **Company** | AIR CRE (formerly AIR Commercial Real Estate Association) |
| **Product Type** | Commercial real estate forms and documents |
| **Target Users** | Commercial real estate brokers, agents, landlords, tenants |
| **Website** | https://www.aircre.com |
| **Market Position** | Primary provider of standardized CRE forms in California |
| **Geographic Focus** | California (primary), expanding |

### What is AIR CRE?

AIR CRE is best known for its **standardized commercial real estate forms library**:
- Lease agreements (office, retail, industrial)
- Purchase agreements
- Letters of intent
- Listing agreements
- Amendments and addenda
- Estoppel certificates
- Sublease forms

### Industry Context
```
AIR CRE Forms are:
├── Industry standard in California CRE
├── Legally reviewed and updated regularly
├── Recognized by courts and lenders
├── Required by many CRE brokerages
└── Similar to what CAR is for residential (REPC)
```

---

## Platform Capabilities

### Form Delivery Methods (Historical)

| Method | Description | Status |
|--------|-------------|--------|
| **Print Library** | Physical form books | Legacy |
| **PDF Downloads** | Static PDF forms | Available |
| **Form Filling Software** | AIR Forms software | Available |
| **Online Platform** | Web-based form completion | Available |
| **Integration Partners** | Third-party form platforms | Unknown |

### Form Categories

| Category | Example Forms | CRE Relevance |
|----------|---------------|---------------|
| **Leases** | Standard Industrial Lease, Office Lease | Core |
| **Purchase/Sale** | Purchase Agreement, Option to Purchase | Core |
| **LOI** | Letter of Intent (various types) | Core |
| **Listing** | Exclusive Right to Lease/Sell | Core |
| **Amendments** | Lease Amendment, Extension | Common |
| **Specialized** | Build-to-Suit, Ground Lease | Specialized |

---

## Authentication

| Attribute | Status | Notes |
|-----------|--------|-------|
| **Public API** | UNCONFIRMED | Likely no public API |
| **Partner Integration** | UNKNOWN | May have select partners |
| **Member Portal** | YES | Account-based access |
| **Credentials Obtained** | NO | N/A |

### Access Model Assessment
- AIR CRE is primarily a **forms provider**, not a software platform
- API availability: **UNLIKELY** for direct integration
- More likely integration paths: partnerships, embedded forms, or document generation

---

## API Capabilities

### Expected Reality: No Traditional API

Based on AIR CRE's business model as a forms library provider:

| Capability | Expected Status | Rationale |
|------------|-----------------|-----------|
| REST API | UNLIKELY | Forms business, not software platform |
| Form Data API | UNLIKELY | Forms are PDF-based |
| Document Generation | POSSIBLY | May have form-fill endpoints |
| Webhook Events | UNLIKELY | No real-time data model |

### Alternative Integration Approaches

#### Approach 1: Form Template Integration
```
Concept:
├── License AIR CRE forms for use in REIL/Q
├── Build custom form-filling engine
├── Pre-fill forms with transaction data
└── Generate completed PDFs

Technical:
├── PDF form fields mapping
├── Data validation per form type
├── PDF generation library
└── E-signature integration
```

#### Approach 2: Partnership/Embed Model
```
Concept:
├── Partner with AIR CRE
├── Embed their form-filling tool
├── Pass data via URL parameters or API
└── Receive completed documents back

Technical:
├── OAuth or SSO integration
├── iFrame or redirect flow
├── Callback for completed docs
└── Document storage integration
```

#### Approach 3: Export/Import Workflow
```
Concept:
├── User fills form on AIR CRE platform
├── Downloads completed PDF
├── Uploads to REIL/Q
└── REIL/Q extracts data from PDF

Technical:
├── PDF parsing/OCR
├── Form field extraction
├── Data mapping to REIL schema
└── Manual validation step
```

---

## Data Available

### Form Field Data (If Integration Exists)

| Data Type | Fields | Mapping to REIL/Q |
|-----------|--------|-------------------|
| **Property Info** | Address, APN, square footage, zoning | Property entity |
| **Party Info** | Landlord, tenant, broker names/contacts | Contacts |
| **Deal Terms** | Rent, term length, options, TI allowance | Transaction details |
| **Dates** | Effective date, expiration, option dates | Timeline |
| **Financial** | Security deposit, rent schedule, CAM | Financials |

### Document Types (Output)

| Document | AIR Form Numbers | Use Case |
|----------|------------------|----------|
| Standard Lease | Various by property type | Executed lease storage |
| Letter of Intent | LOI forms | Deal pipeline |
| Purchase Agreement | Purchase forms | Sale transactions |
| Amendments | Amendment forms | Lease modifications |

---

## Constraints

### Licensing Model

| Aspect | Status | Notes |
|--------|--------|-------|
| **Form License Required** | YES | Cannot reproduce forms without license |
| **Per-Use Pricing** | UNKNOWN | May charge per form or subscription |
| **Redistribution** | RESTRICTED | Forms are copyrighted |
| **White-Label** | UNKNOWN | May require visible AIR CRE branding |

### Technical Constraints
- Forms are likely PDF-based with limited structured data
- No standard API means custom integration work
- Form field mapping requires manual effort per form type
- Updates to forms require re-mapping

### Business Constraints
- Licensing fees unknown
- Geographic limitation (California-centric)
- May compete with AIR CRE's own software offerings

---

## Hard Blocks

### Confirmed Challenges
1. **No Known Public API** - AIR CRE is a forms provider, not API-first
2. **Licensing Required** - Cannot use forms without proper licensing
3. **PDF-Based** - Forms are documents, not structured data
4. **Regional Focus** - California-centric, limited for national platform

### Potential Blockers
- AIR CRE may not be interested in third-party integration
- Competing with their own form-filling software
- Form licensing costs may not fit business model
- Form updates create maintenance burden

---

## Spike Results

### API Discovery Spike
| Attribute | Value |
|-----------|-------|
| Date executed | NOT YET EXECUTED |
| Result | PENDING |
| Finding | Need to confirm if any API exists |

### Partnership Inquiry
| Attribute | Value |
|-----------|-------|
| Date executed | NOT YET EXECUTED |
| Result | PENDING |
| Contact | Need to reach AIR CRE partnerships |

---

## Alternative Solutions

If direct AIR CRE integration is not feasible:

### Alternative 1: Build Own Form Library
```
Approach:
├── Create REIL/Q CRE form templates
├── Consult with CRE attorney for compliance
├── Not AIR CRE branded
└── Full control over form data

Considerations:
├── Legal review costs
├── Slower adoption (not industry standard)
├── Flexibility in form design
└── No licensing dependencies
```

### Alternative 2: Partner with Form Software Vendors
```
Options:
├── DotLoop (has CRE forms)
├── DocuSign (form templates)
├── Skyslope (if they have CRE)
└── Other CRE-specific platforms

Benefits:
├── May have better APIs
├── E-signature included
├── Industry acceptance
```

### Alternative 3: Document-Centric Approach
```
Approach:
├── Accept any PDF lease/document
├── User manually enters key terms
├── Store documents for reference
└── Don't try to generate forms

Benefits:
├── Works with any form source
├── Simpler implementation
├── User flexibility
├── No form licensing issues
```

### Alternative 4: Form-Agnostic Data Extraction
```
Approach:
├── User uploads any lease document
├── AI/ML extracts key terms
├── User validates extracted data
└── REIL/Q stores structured data

Technical:
├── Document AI (Google, Azure, AWS)
├── Custom extraction models
├── Confidence scoring
└── Human-in-the-loop validation
```

---

## CRE Market Context

### Why This Matters

| Factor | Impact |
|--------|--------|
| **California Focus** | AIR CRE is CA-centric; national CRE needs other forms |
| **Form Fragmentation** | Different states/markets use different standard forms |
| **Custom Leases** | Many CRE deals use heavily customized documents |
| **Attorney-Drafted** | Larger deals often have custom legal documents |

### Other CRE Form Sources

| Source | Coverage | Notes |
|--------|----------|-------|
| **AIR CRE** | California | Industry standard for CA |
| **BOMA** | National | Building owners/managers |
| **State-specific** | Varies | Local RE associations |
| **Brokerage-specific** | Internal | CBRE, JLL, Cushman have own forms |
| **Attorney-drafted** | Custom | Large deals |

---

## Action Items for Verification

### Immediate (Day 1-2)
- [ ] Visit https://www.aircre.com and review available services
- [ ] Look for developer/API documentation
- [ ] Contact AIR CRE about partnership/integration options
- [ ] Research form licensing terms and costs

### Short-term (Week 1)
- [ ] Evaluate alternative form sources
- [ ] Prototype PDF form-fill approach
- [ ] Assess document extraction as alternative
- [ ] Decision on integration vs. document-centric approach

---

## MVP Recommendation

| Attribute | Assessment |
|-----------|------------|
| **Verdict** | DEFER (Direct Integration) / GO (Document-Centric) |
| **Confidence** | LOW (for API integration) |
| **Rationale** | AIR CRE likely lacks public API; document-centric approach more practical |
| **Timeline Estimate** | N/A for direct integration; 1-2 sprints for document approach |
| **Risk Level** | LOW (with document-centric approach) |

### Recommended MVP Strategy

**Do NOT build AIR CRE integration for MVP. Instead:**

1. **Document Upload Approach**
   - Allow users to upload any lease/CRE document
   - Manual entry of key terms (rent, term, parties)
   - Store documents for reference
   - Clean, simple user experience

2. **Phase 2 Enhancement**
   - AI-powered document extraction
   - Auto-populate fields from uploaded leases
   - User validation workflow

3. **Phase 3 (If Warranted)**
   - Explore AIR CRE partnership
   - Form generation capabilities
   - Tight integration if partnership materializes

### Fallback Strategy
- Document-centric approach IS the fallback
- Works regardless of AIR CRE integration availability
- More flexible for different form sources
- Simpler implementation

---

## References

- AIR CRE: https://www.aircre.com
- AIR Forms: https://www.aircre.com/air-cre-forms (verify)

---

## Notes

> **Key Insight:** AIR CRE is a forms library, not a software platform with APIs. Direct integration is likely not feasible in the traditional sense.

> **Strategic Recommendation:** Focus on document-centric approach for MVP. CRE deals involve varied document sources (AIR CRE, attorney-drafted, brokerage forms), so flexibility is more valuable than tight AIR CRE integration.

> **CRE Reality:** Commercial real estate transactions are document-heavy but less standardized than residential. A system that handles any document type is more practical than one tied to specific form providers.

> **Research Needed:** Direct contact with AIR CRE to confirm integration possibilities. Their partnership/technology team would have definitive answers.
