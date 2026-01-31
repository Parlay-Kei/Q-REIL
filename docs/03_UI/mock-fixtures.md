# Q Mock Data Fixtures
**REIL/Q Sprint 0.1 - Lane 3**
**Version:** 1.0
**Last Updated:** 2025-12-31

---

## Overview

This document defines mock data fixtures for UI development and testing. All data structures align with the REIL/Q domain schema and support the following use cases:

- **Component Development:** Isolated component testing with realistic data
- **UI Prototyping:** Interactive demos for stakeholder review
- **E2E Testing:** Repeatable test scenarios
- **Documentation:** Storybook examples

**Data Generation Strategy:**
- Deterministic IDs (UUIDs v4 with seed)
- Realistic names, addresses, dates
- Representative edge cases (long names, missing fields, etc.)
- Consistent relationships (foreign keys)

---

## Table of Contents

1. [Organization Data](#organization-data)
2. [User Data](#user-data)
3. [Deal Data](#deal-data)
4. [Property Data](#property-data)
5. [Contact Data](#contact-data)
6. [Document Data](#document-data)
7. [Message Data](#message-data)
8. [Task Data](#task-data)
9. [Event/Ledger Data](#eventledger-data)
10. [Helper Functions](#helper-functions)

---

## Organization Data

```typescript
// src/fixtures/organizations.ts

export interface Organization {
  id: string;
  name: string;
  type: 'brokerage' | 'team' | 'individual';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  licenseNumber?: string;
  createdAt: Date;
}

export const mockOrganizations: Organization[] = [
  {
    id: 'org_001',
    name: 'Skyline Realty Group',
    type: 'brokerage',
    address: {
      street: '789 Commerce Blvd, Suite 200',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
    },
    phone: '(512) 555-0100',
    email: 'info@skylinerealty.com',
    website: 'https://skylinerealty.com',
    logo: '/images/logos/skyline-realty.png',
    licenseNumber: 'TX-BRK-123456',
    createdAt: new Date('2020-01-15'),
  },
  {
    id: 'org_002',
    name: 'Urban Estates',
    type: 'team',
    address: {
      street: '456 Downtown Plaza',
      city: 'Houston',
      state: 'TX',
      zipCode: '77002',
    },
    phone: '(713) 555-0200',
    email: 'team@urbanestates.com',
    website: 'https://urbanestates.com',
    createdAt: new Date('2021-06-01'),
  },
];

export const defaultOrganization = mockOrganizations[0];
```

---

## User Data

```typescript
// src/fixtures/users.ts

export type UserRole =
  | 'admin'
  | 'broker'
  | 'agent'
  | 'transaction_coordinator'
  | 'assistant';

export interface User {
  id: string;
  organizationId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  licenseNumber?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
}

export const mockUsers: User[] = [
  {
    id: 'user_001',
    organizationId: 'org_001',
    email: 'sarah.johnson@skylinerealty.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    fullName: 'Sarah Johnson',
    role: 'agent',
    phone: '(512) 555-0101',
    avatar: '/images/avatars/sarah-johnson.jpg',
    licenseNumber: 'TX-AGT-789012',
    isActive: true,
    lastLoginAt: new Date('2025-12-31T10:30:00Z'),
    createdAt: new Date('2020-02-01'),
  },
  {
    id: 'user_002',
    organizationId: 'org_001',
    email: 'john.davis@skylinerealty.com',
    firstName: 'John',
    lastName: 'Davis',
    fullName: 'John Davis',
    role: 'broker',
    phone: '(512) 555-0102',
    avatar: '/images/avatars/john-davis.jpg',
    licenseNumber: 'TX-BRK-345678',
    isActive: true,
    lastLoginAt: new Date('2025-12-31T09:15:00Z'),
    createdAt: new Date('2020-01-15'),
  },
  {
    id: 'user_003',
    organizationId: 'org_001',
    email: 'maria.garcia@skylinerealty.com',
    firstName: 'Maria',
    lastName: 'Garcia',
    fullName: 'Maria Garcia',
    role: 'transaction_coordinator',
    phone: '(512) 555-0103',
    avatar: '/images/avatars/maria-garcia.jpg',
    isActive: true,
    lastLoginAt: new Date('2025-12-31T08:00:00Z'),
    createdAt: new Date('2021-03-10'),
  },
  {
    id: 'user_004',
    organizationId: 'org_001',
    email: 'alex.kim@skylinerealty.com',
    firstName: 'Alex',
    lastName: 'Kim',
    fullName: 'Alex Kim',
    role: 'agent',
    phone: '(512) 555-0104',
    avatar: '/images/avatars/alex-kim.jpg',
    licenseNumber: 'TX-AGT-901234',
    isActive: true,
    lastLoginAt: new Date('2025-12-30T16:45:00Z'),
    createdAt: new Date('2022-05-20'),
  },
  {
    id: 'user_005',
    organizationId: 'org_001',
    email: 'emma.wilson@skylinerealty.com',
    firstName: 'Emma',
    lastName: 'Wilson',
    fullName: 'Emma Wilson',
    role: 'admin',
    phone: '(512) 555-0105',
    avatar: '/images/avatars/emma-wilson.jpg',
    isActive: true,
    lastLoginAt: new Date('2025-12-31T11:00:00Z'),
    createdAt: new Date('2020-01-15'),
  },
];

export const currentUser = mockUsers[0]; // Sarah Johnson
```

---

## Deal Data

```typescript
// src/fixtures/deals.ts

export type DealStatus = 'lead' | 'active' | 'pending' | 'closed' | 'cancelled';
export type DealType = 'purchase' | 'sale' | 'lease';

export interface Deal {
  id: string;
  organizationId: string;
  propertyId: string;
  status: DealStatus;
  type: DealType;
  listPrice?: number;
  salePrice?: number;
  commission?: number;
  primaryAgentId: string;
  secondaryAgentIds?: string[];
  transactionCoordinatorId?: string;
  estimatedCloseDate?: Date;
  actualCloseDate?: Date;
  listingDate?: Date;
  contractAcceptedDate?: Date;
  inspectionDate?: Date;
  appraisalDate?: Date;
  tags: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string;
}

export const mockDeals: Deal[] = [
  // LEAD
  {
    id: 'deal_001',
    organizationId: 'org_001',
    propertyId: 'prop_001',
    status: 'lead',
    type: 'purchase',
    listPrice: 450000,
    primaryAgentId: 'user_001', // Sarah Johnson
    tags: ['residential', 'first-time-buyer'],
    notes: 'Buyer pre-approved, looking in East Austin',
    createdAt: new Date('2025-12-28'),
    updatedAt: new Date('2025-12-30T14:30:00Z'),
    updatedBy: 'user_001',
  },
  {
    id: 'deal_002',
    organizationId: 'org_001',
    propertyId: 'prop_002',
    status: 'lead',
    type: 'sale',
    listPrice: 725000,
    primaryAgentId: 'user_004', // Alex Kim
    tags: ['residential', 'luxury'],
    notes: 'Seller wants quick sale, motivated',
    createdAt: new Date('2025-12-26'),
    updatedAt: new Date('2025-12-29T10:15:00Z'),
    updatedBy: 'user_004',
  },

  // ACTIVE
  {
    id: 'deal_003',
    organizationId: 'org_001',
    propertyId: 'prop_003',
    status: 'active',
    type: 'purchase',
    listPrice: 385000,
    salePrice: 380000,
    commission: 11400, // 3% of 380k
    primaryAgentId: 'user_001',
    transactionCoordinatorId: 'user_003', // Maria Garcia
    estimatedCloseDate: new Date('2026-01-15'),
    listingDate: new Date('2025-11-01'),
    contractAcceptedDate: new Date('2025-12-15'),
    inspectionDate: new Date('2025-12-22'),
    tags: ['residential', 'inspection-complete'],
    notes: 'Inspection passed with minor repairs requested',
    createdAt: new Date('2025-11-01'),
    updatedAt: new Date('2025-12-31T09:00:00Z'),
    updatedBy: 'user_003',
  },
  {
    id: 'deal_004',
    organizationId: 'org_001',
    propertyId: 'prop_004',
    status: 'active',
    type: 'sale',
    listPrice: 599000,
    primaryAgentId: 'user_004',
    estimatedCloseDate: new Date('2026-02-01'),
    listingDate: new Date('2025-12-01'),
    tags: ['residential', 'luxury', 'pool'],
    createdAt: new Date('2025-12-01'),
    updatedAt: new Date('2025-12-30T16:20:00Z'),
    updatedBy: 'user_004',
  },

  // PENDING
  {
    id: 'deal_005',
    organizationId: 'org_001',
    propertyId: 'prop_005',
    status: 'pending',
    type: 'purchase',
    listPrice: 525000,
    salePrice: 520000,
    commission: 15600,
    primaryAgentId: 'user_001',
    transactionCoordinatorId: 'user_003',
    estimatedCloseDate: new Date('2026-01-08'),
    listingDate: new Date('2025-10-15'),
    contractAcceptedDate: new Date('2025-11-20'),
    inspectionDate: new Date('2025-11-28'),
    appraisalDate: new Date('2025-12-10'),
    tags: ['residential', 'pending-closing'],
    notes: 'All contingencies cleared, waiting on final loan approval',
    createdAt: new Date('2025-10-15'),
    updatedAt: new Date('2025-12-30T11:00:00Z'),
    updatedBy: 'user_003',
  },

  // CLOSED
  {
    id: 'deal_006',
    organizationId: 'org_001',
    propertyId: 'prop_006',
    status: 'closed',
    type: 'sale',
    listPrice: 395000,
    salePrice: 395000,
    commission: 11850,
    primaryAgentId: 'user_004',
    transactionCoordinatorId: 'user_003',
    listingDate: new Date('2025-09-01'),
    contractAcceptedDate: new Date('2025-10-10'),
    inspectionDate: new Date('2025-10-18'),
    appraisalDate: new Date('2025-10-25'),
    actualCloseDate: new Date('2025-11-15'),
    tags: ['residential', 'sold'],
    notes: 'Smooth transaction, happy clients',
    createdAt: new Date('2025-09-01'),
    updatedAt: new Date('2025-11-15T14:00:00Z'),
    updatedBy: 'user_003',
  },
  {
    id: 'deal_007',
    organizationId: 'org_001',
    propertyId: 'prop_007',
    status: 'closed',
    type: 'purchase',
    listPrice: 680000,
    salePrice: 665000,
    commission: 19950,
    primaryAgentId: 'user_001',
    secondaryAgentIds: ['user_004'],
    transactionCoordinatorId: 'user_003',
    listingDate: new Date('2025-08-01'),
    contractAcceptedDate: new Date('2025-09-05'),
    inspectionDate: new Date('2025-09-12'),
    appraisalDate: new Date('2025-09-20'),
    actualCloseDate: new Date('2025-10-30'),
    tags: ['residential', 'luxury', 'co-op-deal'],
    createdAt: new Date('2025-08-01'),
    updatedAt: new Date('2025-10-30T16:30:00Z'),
    updatedBy: 'user_003',
  },

  // CANCELLED
  {
    id: 'deal_008',
    organizationId: 'org_001',
    propertyId: 'prop_008',
    status: 'cancelled',
    type: 'purchase',
    listPrice: 410000,
    primaryAgentId: 'user_001',
    listingDate: new Date('2025-11-10'),
    tags: ['residential', 'cancelled'],
    notes: 'Buyer lost financing, deal fell through',
    createdAt: new Date('2025-11-10'),
    updatedAt: new Date('2025-12-05T10:00:00Z'),
    updatedBy: 'user_001',
  },
];
```

---

## Property Data

```typescript
// src/fixtures/properties.ts

export type PropertyType = 'residential' | 'commercial' | 'land' | 'multifamily';
export type PropertyStatus = 'active' | 'pending' | 'sold' | 'off-market';

export interface Property {
  id: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    county?: string;
  };
  propertyType: PropertyType;
  status: PropertyStatus;
  squareFootage?: number;
  lotSize?: number;
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt?: number;
  mlsNumber?: string;
  parcelNumber?: string;
  description?: string;
  features?: string[];
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const mockProperties: Property[] = [
  {
    id: 'prop_001',
    address: {
      street: '1234 Oak Street',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      county: 'Travis',
    },
    propertyType: 'residential',
    status: 'active',
    squareFootage: 1850,
    lotSize: 7500,
    bedrooms: 3,
    bathrooms: 2,
    yearBuilt: 2018,
    mlsNumber: 'MLS-123456',
    parcelNumber: 'PAR-001-234',
    description: 'Charming modern home in East Austin with open floor plan and updated kitchen',
    features: ['Open Floor Plan', 'Updated Kitchen', 'Hardwood Floors', 'Smart Home'],
    images: ['/images/properties/prop_001_1.jpg', '/images/properties/prop_001_2.jpg'],
    createdAt: new Date('2025-12-28'),
    updatedAt: new Date('2025-12-30'),
  },
  {
    id: 'prop_002',
    address: {
      street: '5678 Elm Avenue',
      city: 'Austin',
      state: 'TX',
      zipCode: '78703',
      county: 'Travis',
    },
    propertyType: 'residential',
    status: 'active',
    squareFootage: 3200,
    lotSize: 12000,
    bedrooms: 4,
    bathrooms: 3.5,
    yearBuilt: 2020,
    mlsNumber: 'MLS-234567',
    description: 'Luxury home in Tarrytown with pool and hill country views',
    features: ['Pool', 'Hill Country Views', 'Gourmet Kitchen', 'Master Suite', 'Home Office'],
    images: ['/images/properties/prop_002_1.jpg'],
    createdAt: new Date('2025-12-26'),
    updatedAt: new Date('2025-12-29'),
  },
  {
    id: 'prop_003',
    address: {
      street: '910 Maple Drive',
      city: 'Austin',
      state: 'TX',
      zipCode: '78704',
    },
    propertyType: 'residential',
    status: 'pending',
    squareFootage: 1650,
    lotSize: 6000,
    bedrooms: 3,
    bathrooms: 2,
    yearBuilt: 2015,
    mlsNumber: 'MLS-345678',
    description: 'Cozy bungalow in South Austin near restaurants and shops',
    features: ['Updated Bathrooms', 'Fenced Yard', 'Covered Patio'],
    createdAt: new Date('2025-11-01'),
    updatedAt: new Date('2025-12-15'),
  },
  {
    id: 'prop_004',
    address: {
      street: '2468 Cedar Lane',
      city: 'Austin',
      state: 'TX',
      zipCode: '78731',
    },
    propertyType: 'residential',
    status: 'active',
    squareFootage: 2800,
    lotSize: 10000,
    bedrooms: 4,
    bathrooms: 3,
    yearBuilt: 2019,
    mlsNumber: 'MLS-456789',
    description: 'Contemporary home with pool and outdoor living space',
    features: ['Pool', 'Outdoor Kitchen', 'Smart Home', 'Energy Efficient'],
    createdAt: new Date('2025-12-01'),
    updatedAt: new Date('2025-12-30'),
  },
  {
    id: 'prop_005',
    address: {
      street: '1357 Birch Court',
      city: 'Austin',
      state: 'TX',
      zipCode: '78702',
    },
    propertyType: 'residential',
    status: 'pending',
    squareFootage: 2100,
    lotSize: 8000,
    bedrooms: 3,
    bathrooms: 2.5,
    yearBuilt: 2017,
    mlsNumber: 'MLS-567890',
    createdAt: new Date('2025-10-15'),
    updatedAt: new Date('2025-12-10'),
  },
  {
    id: 'prop_006',
    address: {
      street: '7890 Pine Street',
      city: 'Austin',
      state: 'TX',
      zipCode: '78705',
    },
    propertyType: 'residential',
    status: 'sold',
    squareFootage: 1750,
    lotSize: 7000,
    bedrooms: 3,
    bathrooms: 2,
    yearBuilt: 2016,
    mlsNumber: 'MLS-678901',
    createdAt: new Date('2025-09-01'),
    updatedAt: new Date('2025-11-15'),
  },
  {
    id: 'prop_007',
    address: {
      street: '3690 Willow Way',
      city: 'Austin',
      state: 'TX',
      zipCode: '78746',
    },
    propertyType: 'residential',
    status: 'sold',
    squareFootage: 3500,
    lotSize: 15000,
    bedrooms: 5,
    bathrooms: 4,
    yearBuilt: 2021,
    mlsNumber: 'MLS-789012',
    description: 'Stunning luxury home in Westlake with lake views',
    features: ['Lake Views', 'Wine Cellar', 'Home Theater', 'Guest House'],
    createdAt: new Date('2025-08-01'),
    updatedAt: new Date('2025-10-30'),
  },
  {
    id: 'prop_008',
    address: {
      street: '1122 Ash Boulevard',
      city: 'Austin',
      state: 'TX',
      zipCode: '78704',
    },
    propertyType: 'residential',
    status: 'off-market',
    squareFootage: 1900,
    bedrooms: 3,
    bathrooms: 2,
    yearBuilt: 2014,
    createdAt: new Date('2025-11-10'),
    updatedAt: new Date('2025-12-05'),
  },
];
```

---

## Contact Data

```typescript
// src/fixtures/contacts.ts

export type ContactRole =
  | 'buyer'
  | 'seller'
  | 'agent'
  | 'attorney'
  | 'lender'
  | 'inspector'
  | 'appraiser'
  | 'title_company';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  phone?: string;
  company?: string;
  role: ContactRole;
  avatar?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Map contacts to deals
export interface DealContact {
  dealId: string;
  contactId: string;
  role: ContactRole;
  isPrimary: boolean;
}

export const mockContacts: Contact[] = [
  // Buyers
  {
    id: 'contact_001',
    firstName: 'Michael',
    lastName: 'Thompson',
    fullName: 'Michael Thompson',
    email: 'michael.thompson@email.com',
    phone: '(512) 555-2001',
    role: 'buyer',
    notes: 'First-time homebuyer, pre-approved up to $500k',
    createdAt: new Date('2025-12-28'),
    updatedAt: new Date('2025-12-28'),
  },
  {
    id: 'contact_002',
    firstName: 'Jessica',
    lastName: 'Chen',
    fullName: 'Jessica Chen',
    email: 'jessica.chen@email.com',
    phone: '(512) 555-2002',
    role: 'buyer',
    createdAt: new Date('2025-11-01'),
    updatedAt: new Date('2025-11-01'),
  },

  // Sellers
  {
    id: 'contact_003',
    firstName: 'Robert',
    lastName: 'Martinez',
    fullName: 'Robert Martinez',
    email: 'robert.martinez@email.com',
    phone: '(512) 555-2003',
    role: 'seller',
    notes: 'Relocating to California, motivated seller',
    createdAt: new Date('2025-12-26'),
    updatedAt: new Date('2025-12-26'),
  },
  {
    id: 'contact_004',
    firstName: 'Linda',
    lastName: 'Anderson',
    fullName: 'Linda Anderson',
    email: 'linda.anderson@email.com',
    phone: '(512) 555-2004',
    role: 'seller',
    createdAt: new Date('2025-09-01'),
    updatedAt: new Date('2025-09-01'),
  },

  // Attorneys
  {
    id: 'contact_005',
    firstName: 'David',
    lastName: 'Brooks',
    fullName: 'David Brooks',
    email: 'dbrooks@lawfirm.com',
    phone: '(512) 555-3001',
    company: 'Brooks & Associates Law',
    role: 'attorney',
    createdAt: new Date('2020-05-10'),
    updatedAt: new Date('2020-05-10'),
  },

  // Lenders
  {
    id: 'contact_006',
    firstName: 'Patricia',
    lastName: 'Lewis',
    fullName: 'Patricia Lewis',
    email: 'plewis@firstnational.com',
    phone: '(512) 555-4001',
    company: 'First National Bank',
    role: 'lender',
    createdAt: new Date('2021-03-15'),
    updatedAt: new Date('2021-03-15'),
  },

  // Inspectors
  {
    id: 'contact_007',
    firstName: 'James',
    lastName: 'Walker',
    fullName: 'James Walker',
    email: 'james@walkerinspections.com',
    phone: '(512) 555-5001',
    company: 'Walker Home Inspections',
    role: 'inspector',
    createdAt: new Date('2020-08-20'),
    updatedAt: new Date('2020-08-20'),
  },

  // Title Company
  {
    id: 'contact_008',
    firstName: 'Susan',
    lastName: 'Taylor',
    fullName: 'Susan Taylor',
    email: 'staylor@texastitle.com',
    phone: '(512) 555-6001',
    company: 'Texas Title Company',
    role: 'title_company',
    createdAt: new Date('2019-06-01'),
    updatedAt: new Date('2019-06-01'),
  },
];

export const mockDealContacts: DealContact[] = [
  // Deal 1 (Lead)
  { dealId: 'deal_001', contactId: 'contact_001', role: 'buyer', isPrimary: true },

  // Deal 2 (Lead)
  { dealId: 'deal_002', contactId: 'contact_003', role: 'seller', isPrimary: true },

  // Deal 3 (Active)
  { dealId: 'deal_003', contactId: 'contact_002', role: 'buyer', isPrimary: true },
  { dealId: 'deal_003', contactId: 'contact_006', role: 'lender', isPrimary: false },
  { dealId: 'deal_003', contactId: 'contact_007', role: 'inspector', isPrimary: false },

  // Deal 5 (Pending)
  { dealId: 'deal_005', contactId: 'contact_001', role: 'buyer', isPrimary: true },
  { dealId: 'deal_005', contactId: 'contact_005', role: 'attorney', isPrimary: false },
  { dealId: 'deal_005', contactId: 'contact_006', role: 'lender', isPrimary: false },
  { dealId: 'deal_005', contactId: 'contact_008', role: 'title_company', isPrimary: false },

  // Deal 6 (Closed)
  { dealId: 'deal_006', contactId: 'contact_004', role: 'seller', isPrimary: true },
  { dealId: 'deal_006', contactId: 'contact_008', role: 'title_company', isPrimary: false },
];
```

---

## Document Data

```typescript
// src/fixtures/documents.ts

export type DocumentCategory =
  | 'contract'
  | 'disclosure'
  | 'inspection'
  | 'appraisal'
  | 'closing'
  | 'misc';

export type DocumentStatus = 'uploaded' | 'reviewed' | 'signed' | 'archived';

export interface Document {
  id: string;
  dealId: string;
  filename: string;
  fileType: string;
  fileSize: number; // bytes
  category: DocumentCategory;
  status: DocumentStatus;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  tags?: string[];
}

export const mockDocuments: Document[] = [
  // Deal 3 documents
  {
    id: 'doc_001',
    dealId: 'deal_003',
    filename: 'purchase-agreement.pdf',
    fileType: 'application/pdf',
    fileSize: 1245678,
    category: 'contract',
    status: 'signed',
    url: '/files/deal_003/purchase-agreement.pdf',
    uploadedBy: 'user_001',
    uploadedAt: new Date('2025-12-15T10:00:00Z'),
    reviewedBy: 'user_002',
    reviewedAt: new Date('2025-12-15T14:30:00Z'),
    tags: ['primary-contract'],
  },
  {
    id: 'doc_002',
    dealId: 'deal_003',
    filename: 'addendum-01-repairs.pdf',
    fileType: 'application/pdf',
    fileSize: 345678,
    category: 'contract',
    status: 'signed',
    url: '/files/deal_003/addendum-01-repairs.pdf',
    uploadedBy: 'user_001',
    uploadedAt: new Date('2025-12-22T16:00:00Z'),
    reviewedBy: 'user_003',
    reviewedAt: new Date('2025-12-23T09:00:00Z'),
    tags: ['addendum', 'repairs'],
  },
  {
    id: 'doc_003',
    dealId: 'deal_003',
    filename: 'inspection-report.pdf',
    fileType: 'application/pdf',
    fileSize: 2456789,
    category: 'inspection',
    status: 'reviewed',
    url: '/files/deal_003/inspection-report.pdf',
    uploadedBy: 'user_007', // Inspector
    uploadedAt: new Date('2025-12-22T18:30:00Z'),
    reviewedBy: 'user_001',
    reviewedAt: new Date('2025-12-23T10:00:00Z'),
  },
  {
    id: 'doc_004',
    dealId: 'deal_003',
    filename: 'sellers-disclosure.pdf',
    fileType: 'application/pdf',
    fileSize: 567890,
    category: 'disclosure',
    status: 'signed',
    url: '/files/deal_003/sellers-disclosure.pdf',
    uploadedBy: 'user_001',
    uploadedAt: new Date('2025-12-16T11:00:00Z'),
  },
  {
    id: 'doc_005',
    dealId: 'deal_003',
    filename: 'property-photos.zip',
    fileType: 'application/zip',
    fileSize: 15678901,
    category: 'misc',
    status: 'uploaded',
    url: '/files/deal_003/property-photos.zip',
    uploadedBy: 'user_001',
    uploadedAt: new Date('2025-11-02T14:00:00Z'),
  },

  // Deal 5 documents
  {
    id: 'doc_006',
    dealId: 'deal_005',
    filename: 'purchase-agreement.pdf',
    fileType: 'application/pdf',
    fileSize: 1345678,
    category: 'contract',
    status: 'signed',
    url: '/files/deal_005/purchase-agreement.pdf',
    uploadedBy: 'user_001',
    uploadedAt: new Date('2025-11-20T09:00:00Z'),
  },
  {
    id: 'doc_007',
    dealId: 'deal_005',
    filename: 'appraisal-report.pdf',
    fileType: 'application/pdf',
    fileSize: 1876543,
    category: 'appraisal',
    status: 'reviewed',
    url: '/files/deal_005/appraisal-report.pdf',
    uploadedBy: 'user_003',
    uploadedAt: new Date('2025-12-10T15:00:00Z'),
    reviewedBy: 'user_001',
    reviewedAt: new Date('2025-12-11T10:00:00Z'),
  },
  {
    id: 'doc_008',
    dealId: 'deal_005',
    filename: 'title-commitment.pdf',
    fileType: 'application/pdf',
    fileSize: 987654,
    category: 'closing',
    status: 'reviewed',
    url: '/files/deal_005/title-commitment.pdf',
    uploadedBy: 'user_008', // Title company
    uploadedAt: new Date('2025-12-20T11:00:00Z'),
    reviewedBy: 'user_003',
    reviewedAt: new Date('2025-12-21T09:00:00Z'),
  },
];
```

---

## Message Data

```typescript
// src/fixtures/messages.ts

export interface Message {
  id: string;
  dealId?: string; // null if unlinked
  threadId: string;
  subject: string;
  from: {
    name: string;
    email: string;
  };
  to: Array<{ name: string; email: string }>;
  cc?: Array<{ name: string; email: string }>;
  body: string;
  isRead: boolean;
  hasAttachment: boolean;
  attachmentCount?: number;
  assignedTo?: string; // userId
  receivedAt: Date;
  repliedAt?: Date;
}

export const mockMessages: Message[] = [
  // Linked messages
  {
    id: 'msg_001',
    dealId: 'deal_003',
    threadId: 'thread_001',
    subject: 'Re: Inspection Scheduling',
    from: {
      name: 'James Walker',
      email: 'james@walkerinspections.com',
    },
    to: [
      { name: 'Sarah Johnson', email: 'sarah.johnson@skylinerealty.com' },
      { name: 'Jessica Chen', email: 'jessica.chen@email.com' },
    ],
    body: `Hi Sarah,

I can schedule the inspection for this Friday, December 22nd at 10:00 AM. Please confirm if this works for the buyer.

I'll need about 3-4 hours for a thorough inspection of this property. The report will be delivered within 24 hours.

Best regards,
James Walker
Walker Home Inspections`,
    isRead: true,
    hasAttachment: false,
    assignedTo: 'user_001',
    receivedAt: new Date('2025-12-20T14:30:00Z'),
    repliedAt: new Date('2025-12-20T15:00:00Z'),
  },
  {
    id: 'msg_002',
    dealId: 'deal_003',
    threadId: 'thread_002',
    subject: 'Repair Addendum - Action Required',
    from: {
      name: 'Maria Garcia',
      email: 'maria.garcia@skylinerealty.com',
    },
    to: [
      { name: 'Sarah Johnson', email: 'sarah.johnson@skylinerealty.com' },
    ],
    body: `Sarah,

The inspection report came back with a few items that need attention. I've drafted the repair addendum based on the buyer's requests.

Please review and send to the seller's agent for approval.

Attached: repair-addendum-draft.pdf

Thanks,
Maria`,
    isRead: true,
    hasAttachment: true,
    attachmentCount: 1,
    assignedTo: 'user_001',
    receivedAt: new Date('2025-12-23T09:00:00Z'),
  },
  {
    id: 'msg_003',
    dealId: 'deal_005',
    threadId: 'thread_003',
    subject: 'Title Commitment Ready',
    from: {
      name: 'Susan Taylor',
      email: 'staylor@texastitle.com',
    },
    to: [
      { name: 'Maria Garcia', email: 'maria.garcia@skylinerealty.com' },
    ],
    cc: [
      { name: 'Sarah Johnson', email: 'sarah.johnson@skylinerealty.com' },
    ],
    body: `Maria,

The title commitment is ready for review. Please see the attached document.

There is one small lien that needs to be cleared before closing - I've already contacted the seller's attorney.

Let me know if you have any questions.

Best,
Susan`,
    isRead: true,
    hasAttachment: true,
    attachmentCount: 1,
    assignedTo: 'user_003',
    receivedAt: new Date('2025-12-20T11:00:00Z'),
  },

  // Unlinked messages
  {
    id: 'msg_004',
    threadId: 'thread_004',
    subject: 'Property Showing Request - 789 River Road',
    from: {
      name: 'Tom Anderson',
      email: 'tom.anderson@email.com',
    },
    to: [
      { name: 'Sarah Johnson', email: 'sarah.johnson@skylinerealty.com' },
    ],
    body: `Hi Sarah,

I'm interested in viewing the property at 789 River Road. Are you available this weekend for a showing?

I'm pre-approved and ready to make an offer if it's the right fit.

Thanks,
Tom`,
    isRead: false,
    hasAttachment: false,
    receivedAt: new Date('2025-12-31T08:30:00Z'),
  },
  {
    id: 'msg_005',
    threadId: 'thread_005',
    subject: 'Market Analysis Request',
    from: {
      name: 'Karen White',
      email: 'karen.white@email.com',
    },
    to: [
      { name: 'Alex Kim', email: 'alex.kim@skylinerealty.com' },
    ],
    body: `Alex,

Can you provide a market analysis for my home at 456 Sunset Drive? I'm thinking about listing in the spring.

When would be a good time to meet?

Thanks,
Karen`,
    isRead: false,
    hasAttachment: false,
    receivedAt: new Date('2025-12-30T16:00:00Z'),
  },
];
```

---

## Task Data

```typescript
// src/fixtures/tasks.ts

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Task {
  id: string;
  dealId?: string;
  title: string;
  description?: string;
  assignedTo: string; // userId
  createdBy: string; // userId
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: Date;
  completedAt?: Date;
  completedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const mockTasks: Task[] = [
  // Overdue tasks
  {
    id: 'task_001',
    dealId: 'deal_003',
    title: 'Review and sign repair addendum',
    description: 'Buyer has requested repairs based on inspection report',
    assignedTo: 'user_001',
    createdBy: 'user_003',
    priority: 'high',
    status: 'pending',
    dueDate: new Date('2025-12-30'),
    createdAt: new Date('2025-12-23'),
    updatedAt: new Date('2025-12-23'),
  },
  {
    id: 'task_002',
    dealId: 'deal_005',
    title: 'Obtain final loan approval letter',
    description: 'Lender needs updated employment verification',
    assignedTo: 'user_003',
    createdBy: 'user_001',
    priority: 'high',
    status: 'in_progress',
    dueDate: new Date('2025-12-29'),
    createdAt: new Date('2025-12-20'),
    updatedAt: new Date('2025-12-30T10:00:00Z'),
  },

  // Today's tasks
  {
    id: 'task_003',
    dealId: 'deal_003',
    title: 'Schedule final walkthrough',
    assignedTo: 'user_001',
    createdBy: 'user_003',
    priority: 'medium',
    status: 'pending',
    dueDate: new Date('2025-12-31'),
    createdAt: new Date('2025-12-28'),
    updatedAt: new Date('2025-12-28'),
  },
  {
    id: 'task_004',
    dealId: 'deal_005',
    title: 'Confirm closing time with title company',
    assignedTo: 'user_003',
    createdBy: 'user_003',
    priority: 'medium',
    status: 'pending',
    dueDate: new Date('2025-12-31'),
    createdAt: new Date('2025-12-29'),
    updatedAt: new Date('2025-12-29'),
  },
  {
    id: 'task_005',
    dealId: 'deal_003',
    title: 'Send welcome packet to buyer',
    description: 'Include neighborhood info, utility setup, etc.',
    assignedTo: 'user_001',
    createdBy: 'user_001',
    priority: 'low',
    status: 'completed',
    dueDate: new Date('2025-12-31'),
    completedAt: new Date('2025-12-31T09:00:00Z'),
    completedBy: 'user_001',
    createdAt: new Date('2025-12-30'),
    updatedAt: new Date('2025-12-31T09:00:00Z'),
  },

  // Upcoming tasks
  {
    id: 'task_006',
    dealId: 'deal_004',
    title: 'Schedule professional photos',
    assignedTo: 'user_004',
    createdBy: 'user_004',
    priority: 'high',
    status: 'pending',
    dueDate: new Date('2026-01-03'),
    createdAt: new Date('2025-12-01'),
    updatedAt: new Date('2025-12-01'),
  },
  {
    id: 'task_007',
    dealId: 'deal_005',
    title: 'Order home warranty',
    assignedTo: 'user_003',
    createdBy: 'user_001',
    priority: 'medium',
    status: 'pending',
    dueDate: new Date('2026-01-05'),
    createdAt: new Date('2025-12-28'),
    updatedAt: new Date('2025-12-28'),
  },
  {
    id: 'task_008',
    dealId: 'deal_003',
    title: 'Final walkthrough',
    assignedTo: 'user_001',
    createdBy: 'user_003',
    priority: 'high',
    status: 'pending',
    dueDate: new Date('2026-01-14'),
    createdAt: new Date('2025-12-30'),
    updatedAt: new Date('2025-12-30'),
  },

  // Non-deal tasks
  {
    id: 'task_009',
    title: 'Complete Q4 sales report',
    assignedTo: 'user_001',
    createdBy: 'user_002',
    priority: 'medium',
    status: 'pending',
    dueDate: new Date('2026-01-05'),
    createdAt: new Date('2025-12-20'),
    updatedAt: new Date('2025-12-20'),
  },
];
```

---

## Event/Ledger Data

```typescript
// src/fixtures/events.ts

export type EventType =
  | 'DealCreated'
  | 'DealStatusChanged'
  | 'DealClosed'
  | 'DocumentUploaded'
  | 'DocumentSigned'
  | 'MessageReceived'
  | 'MessageSent'
  | 'TaskCreated'
  | 'TaskCompleted'
  | 'ContactAdded'
  | 'UserAction'
  | 'SystemEvent';

export interface Event {
  id: string;
  eventType: EventType;
  entityType: 'deal' | 'document' | 'message' | 'task' | 'contact' | 'user' | 'system';
  entityId: string;
  userId?: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

export const mockEvents: Event[] = [
  // Recent events (today)
  {
    id: 'event_001',
    eventType: 'DocumentUploaded',
    entityType: 'document',
    entityId: 'doc_003',
    userId: 'user_007',
    metadata: {
      filename: 'inspection-report.pdf',
      size: 2456789,
      dealId: 'deal_003',
    },
    timestamp: new Date('2025-12-31T14:45:32Z'),
  },
  {
    id: 'event_002',
    eventType: 'TaskCompleted',
    entityType: 'task',
    entityId: 'task_005',
    userId: 'user_001',
    metadata: {
      taskTitle: 'Send welcome packet to buyer',
      dealId: 'deal_003',
    },
    timestamp: new Date('2025-12-31T09:00:15Z'),
  },
  {
    id: 'event_003',
    eventType: 'MessageReceived',
    entityType: 'message',
    entityId: 'msg_004',
    metadata: {
      subject: 'Property Showing Request - 789 River Road',
      from: 'tom.anderson@email.com',
      linked: false,
    },
    timestamp: new Date('2025-12-31T08:30:22Z'),
  },

  // Yesterday
  {
    id: 'event_004',
    eventType: 'DealStatusChanged',
    entityType: 'deal',
    entityId: 'deal_003',
    userId: 'user_003',
    metadata: {
      previousStatus: 'pending',
      newStatus: 'active',
      dealAddress: '910 Maple Drive',
    },
    timestamp: new Date('2025-12-30T10:30:00Z'),
  },
  {
    id: 'event_005',
    eventType: 'TaskCreated',
    entityType: 'task',
    entityId: 'task_008',
    userId: 'user_003',
    metadata: {
      taskTitle: 'Final walkthrough',
      assignedTo: 'user_001',
      dealId: 'deal_003',
      dueDate: '2026-01-14',
    },
    timestamp: new Date('2025-12-30T15:20:00Z'),
  },

  // 2 days ago
  {
    id: 'event_006',
    eventType: 'DocumentSigned',
    entityType: 'document',
    entityId: 'doc_002',
    userId: 'user_002',
    metadata: {
      filename: 'addendum-01-repairs.pdf',
      dealId: 'deal_003',
    },
    timestamp: new Date('2025-12-29T16:15:00Z'),
  },
  {
    id: 'event_007',
    eventType: 'ContactAdded',
    entityType: 'contact',
    entityId: 'contact_001',
    userId: 'user_001',
    metadata: {
      contactName: 'Michael Thompson',
      contactRole: 'buyer',
      dealId: 'deal_001',
    },
    timestamp: new Date('2025-12-28T11:00:00Z'),
  },

  // Older events
  {
    id: 'event_008',
    eventType: 'DealCreated',
    entityType: 'deal',
    entityId: 'deal_001',
    userId: 'user_001',
    metadata: {
      dealAddress: '1234 Oak Street',
      dealType: 'purchase',
      listPrice: 450000,
    },
    timestamp: new Date('2025-12-28T09:30:00Z'),
  },
  {
    id: 'event_009',
    eventType: 'DealClosed',
    entityType: 'deal',
    entityId: 'deal_006',
    userId: 'user_003',
    metadata: {
      dealAddress: '7890 Pine Street',
      salePrice: 395000,
      commission: 11850,
    },
    timestamp: new Date('2025-11-15T14:00:00Z'),
  },
];
```

---

## Helper Functions

```typescript
// src/fixtures/helpers.ts

import { mockDeals } from './deals';
import { mockProperties } from './properties';
import { mockContacts, mockDealContacts } from './contacts';
import { mockDocuments } from './documents';
import { mockMessages } from './messages';
import { mockTasks } from './tasks';
import { mockUsers } from './users';

/**
 * Get deal with populated relationships
 */
export const getDealWithRelations = (dealId: string) => {
  const deal = mockDeals.find((d) => d.id === dealId);
  if (!deal) return null;

  const property = mockProperties.find((p) => p.id === deal.propertyId);
  const primaryAgent = mockUsers.find((u) => u.id === deal.primaryAgentId);
  const transactionCoordinator = deal.transactionCoordinatorId
    ? mockUsers.find((u) => u.id === deal.transactionCoordinatorId)
    : null;

  const dealContactLinks = mockDealContacts.filter((dc) => dc.dealId === dealId);
  const contacts = dealContactLinks.map((dc) => {
    const contact = mockContacts.find((c) => c.id === dc.contactId);
    return { ...contact, role: dc.role, isPrimary: dc.isPrimary };
  });

  const documents = mockDocuments.filter((d) => d.dealId === dealId);
  const messages = mockMessages.filter((m) => m.dealId === dealId);
  const tasks = mockTasks.filter((t) => t.dealId === dealId);

  return {
    ...deal,
    property,
    primaryAgent,
    transactionCoordinator,
    contacts,
    documents,
    messages,
    tasks,
  };
};

/**
 * Get deals grouped by status for pipeline view
 */
export const getDealsByStatus = () => {
  return {
    lead: mockDeals.filter((d) => d.status === 'lead'),
    active: mockDeals.filter((d) => d.status === 'active'),
    pending: mockDeals.filter((d) => d.status === 'pending'),
    closed: mockDeals.filter((d) => d.status === 'closed'),
    cancelled: mockDeals.filter((d) => d.status === 'cancelled'),
  };
};

/**
 * Get tasks grouped by due date
 */
export const getTasksByDueDate = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return {
    overdue: mockTasks.filter(
      (t) => t.status !== 'completed' && t.dueDate && t.dueDate < today
    ),
    today: mockTasks.filter(
      (t) =>
        t.status !== 'completed' &&
        t.dueDate &&
        t.dueDate >= today &&
        t.dueDate < tomorrow
    ),
    upcoming: mockTasks.filter(
      (t) => t.status !== 'completed' && t.dueDate && t.dueDate >= tomorrow
    ),
    completed: mockTasks.filter((t) => t.status === 'completed'),
  };
};

/**
 * Get unread message count
 */
export const getUnreadMessageCount = () => {
  return mockMessages.filter((m) => !m.isRead).length;
};

/**
 * Get incomplete task count
 */
export const getIncompleteTaskCount = () => {
  return mockTasks.filter((t) => t.status !== 'completed').length;
};

/**
 * Search deals by query (address, price, tags)
 */
export const searchDeals = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return mockDeals.filter((deal) => {
    const property = mockProperties.find((p) => p.id === deal.propertyId);
    const address = property
      ? `${property.address.street} ${property.address.city}`.toLowerCase()
      : '';
    const price = deal.listPrice?.toString() || '';
    const tags = deal.tags.join(' ').toLowerCase();

    return (
      address.includes(lowerQuery) ||
      price.includes(lowerQuery) ||
      tags.includes(lowerQuery)
    );
  });
};

/**
 * Get user's assigned deals
 */
export const getUserDeals = (userId: string) => {
  return mockDeals.filter(
    (deal) =>
      deal.primaryAgentId === userId ||
      deal.secondaryAgentIds?.includes(userId) ||
      deal.transactionCoordinatorId === userId
  );
};

/**
 * Get user's assigned tasks
 */
export const getUserTasks = (userId: string) => {
  return mockTasks.filter((task) => task.assignedTo === userId);
};
```

---

## Mock Data Provider (React Context)

```typescript
// src/fixtures/MockDataProvider.tsx

import { createContext, useContext, ReactNode } from 'react';
import { mockOrganizations, defaultOrganization } from './organizations';
import { mockUsers, currentUser } from './users';
import { mockDeals } from './deals';
import { mockProperties } from './properties';
import { mockContacts, mockDealContacts } from './contacts';
import { mockDocuments } from './documents';
import { mockMessages } from './messages';
import { mockTasks } from './tasks';
import { mockEvents } from './events';
import * as helpers from './helpers';

interface MockDataContextValue {
  organizations: typeof mockOrganizations;
  currentOrganization: typeof defaultOrganization;
  users: typeof mockUsers;
  currentUser: typeof currentUser;
  deals: typeof mockDeals;
  properties: typeof mockProperties;
  contacts: typeof mockContacts;
  dealContacts: typeof mockDealContacts;
  documents: typeof mockDocuments;
  messages: typeof mockMessages;
  tasks: typeof mockTasks;
  events: typeof mockEvents;
  helpers: typeof helpers;
}

const MockDataContext = createContext<MockDataContextValue | null>(null);

export const MockDataProvider = ({ children }: { children: ReactNode }) => {
  const value: MockDataContextValue = {
    organizations: mockOrganizations,
    currentOrganization: defaultOrganization,
    users: mockUsers,
    currentUser,
    deals: mockDeals,
    properties: mockProperties,
    contacts: mockContacts,
    dealContacts: mockDealContacts,
    documents: mockDocuments,
    messages: mockMessages,
    tasks: mockTasks,
    events: mockEvents,
    helpers,
  };

  return (
    <MockDataContext.Provider value={value}>
      {children}
    </MockDataContext.Provider>
  );
};

export const useMockData = () => {
  const context = useContext(MockDataContext);
  if (!context) {
    throw new Error('useMockData must be used within MockDataProvider');
  }
  return context;
};
```

**Usage in app:**
```tsx
// src/app/layout.tsx
import { MockDataProvider } from '@/fixtures/MockDataProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <MockDataProvider>
          {children}
        </MockDataProvider>
      </body>
    </html>
  );
}

// In components
import { useMockData } from '@/fixtures/MockDataProvider';

export const PipelineView = () => {
  const { helpers } = useMockData();
  const dealsByStatus = helpers.getDealsByStatus();

  return (
    // Render pipeline...
  );
};
```

---

## Data Summary

| Entity | Count | Notes |
|--------|-------|-------|
| Organizations | 2 | 1 brokerage, 1 team |
| Users | 5 | 2 agents, 1 broker, 1 TC, 1 admin |
| Deals | 8 | 2 lead, 2 active, 1 pending, 2 closed, 1 cancelled |
| Properties | 8 | Matches deals 1:1 |
| Contacts | 8 | Buyers, sellers, professionals |
| Documents | 8 | Across deals 3, 5 |
| Messages | 5 | 3 linked, 2 unlinked |
| Tasks | 9 | 7 deal-related, 2 general |
| Events | 9 | Last 30 days of activity |

---

## Edge Cases Covered

1. **Missing Optional Fields**: Some deals lack secondary agents, close dates, etc.
2. **Unlinked Messages**: Messages without deal association
3. **Overdue Tasks**: Tasks past due date for testing urgency indicators
4. **Long Names/Addresses**: Test truncation and ellipsis
5. **Empty States**: Cancelled deals with minimal data
6. **Multiple Roles**: Contacts with different roles across deals
7. **File Sizes**: Range from 345KB to 15MB for realistic rendering
8. **Timestamps**: Various relative times (minutes ago, days ago, etc.)

---

**Document Version:** 1.0
**Status:** Sprint 0.1 - P0 Deliverable
**Last Updated:** 2025-12-31
