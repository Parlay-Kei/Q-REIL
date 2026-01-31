# REIL/Q Core Schema Design

**Version:** 1.0.0
**Date:** 2025-12-31
**Owner:** SupabaseArchitect
**Status:** Sprint 0.1 - Initial Design

## Overview

REIL/Q is a multi-tenant real estate transaction management platform. This schema provides:
- **Organization isolation** - Strict data separation between orgs
- **Audit trail** - Immutable event ledger for all state changes
- **Flexibility** - Support for sales, leasing, property management
- **Integration readiness** - Clean structure for external connector mapping

## Design Principles

1. **Multi-tenancy First**: Every table (except `orgs`) has `org_id` for isolation
2. **Immutable Audit**: Event ledger captures all changes, cannot be modified
3. **Soft Deletes**: Use `deleted_at` for logical deletion where appropriate
4. **Standard Fields**: All tables include `id`, `created_at`, `updated_at`
5. **UUID Keys**: All primary keys are UUIDs for distributed systems
6. **RLS by Default**: Row Level Security enabled on all tables

---

## Entity Relationship Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        ORGANIZATION LAYER                     │
├─────────────────────────────────────────────────────────────┤
│  orgs → users → user_roles                                   │
└─────────────────────────────────────────────────────────────┘
                          ↓ org_id enforces isolation
┌─────────────────────────────────────────────────────────────┐
│                         CONTACT LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  contacts ←→ contact_relationships ←→ companies              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                        PROPERTY LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  properties → units                                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                       TRANSACTION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  deals / leasing → deal_parties ← contacts                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                        DOCUMENT LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  documents → document_versions                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                      COMMUNICATION LAYER                      │
├─────────────────────────────────────────────────────────────┤
│  message_threads → messages                                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                       EVENT LAYER (LEDGER)                    │
├─────────────────────────────────────────────────────────────┤
│  events (append-only, immutable audit trail)                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. ORGANIZATION LAYER

### 1.1 orgs

**Purpose:** Root entity for multi-tenant isolation. Every organization is a separate tenant.

```sql
CREATE TABLE public.orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- URL-safe identifier
  settings JSONB DEFAULT '{}', -- Org-wide preferences
  subscription_tier TEXT DEFAULT 'free', -- free, pro, enterprise
  subscription_status TEXT DEFAULT 'active', -- active, suspended, cancelled
  max_users INTEGER DEFAULT 5,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_orgs_slug ON public.orgs(slug);
CREATE INDEX idx_orgs_deleted_at ON public.orgs(deleted_at) WHERE deleted_at IS NULL;

-- Comments
COMMENT ON TABLE public.orgs IS 'Root tenant entity for multi-tenant isolation';
COMMENT ON COLUMN public.orgs.slug IS 'URL-safe identifier for org (e.g., "acme-realty")';
COMMENT ON COLUMN public.orgs.settings IS 'Org-wide configuration: branding, defaults, feature flags';
```

**RLS Requirements:**
- Service role only for creation
- Users can SELECT their own org
- Admins can UPDATE their own org

---

### 1.2 users

**Purpose:** User accounts within organizations. Users authenticate via Supabase Auth.

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active', -- active, inactive, suspended
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(org_id, email)
);

-- Indexes
CREATE INDEX idx_users_org_id ON public.users(org_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_status ON public.users(status) WHERE status = 'active';

-- Comments
COMMENT ON TABLE public.users IS 'User accounts within organizations';
COMMENT ON COLUMN public.users.id IS 'References auth.users(id) - synced via trigger on signup';
```

**RLS Requirements:**
- Users can SELECT users in their org
- Admins can INSERT/UPDATE/DELETE users in their org
- Users can UPDATE their own profile

---

### 1.3 user_roles

**Purpose:** Role assignments for users within their organization.

```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- admin, agent, tc, property_manager, viewer
  scope TEXT DEFAULT 'org', -- org (full org access), team, self
  scope_id UUID, -- team_id if scope='team', null if scope='org'
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(user_id, role, scope, scope_id)
);

-- Indexes
CREATE INDEX idx_user_roles_org_id ON public.user_roles(org_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

-- Comments
COMMENT ON TABLE public.user_roles IS 'Role-based access control within organizations';
COMMENT ON COLUMN public.user_roles.role IS 'Role type: admin, agent, tc, property_manager, viewer';
COMMENT ON COLUMN public.user_roles.scope IS 'Access scope: org (all data), team (team only), self (own records)';
```

**Roles Defined:**
- **admin**: Full org access, manage users/settings
- **agent**: Manage own deals, properties, contacts
- **tc** (Transaction Coordinator): Manage deals, documents
- **property_manager**: Manage properties, leasing, units
- **viewer**: Read-only access

**RLS Requirements:**
- Users can SELECT roles in their org
- Admins can INSERT/UPDATE/DELETE roles in their org

---

## 2. CONTACT LAYER

### 2.1 contacts

**Purpose:** Individual people (clients, leads, vendors, etc.)

```sql
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  created_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- Identity
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,

  -- Classification
  contact_type TEXT, -- buyer, seller, tenant, landlord, vendor, agent, other
  tags TEXT[] DEFAULT '{}',

  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  country TEXT DEFAULT 'US',

  -- Metadata
  notes TEXT,
  custom_fields JSONB DEFAULT '{}',
  source TEXT, -- Where contact came from (manual, import, web_form, etc.)
  external_id TEXT, -- ID from external system (SkySlope, etc.)

  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_contacts_org_id ON public.contacts(org_id);
CREATE INDEX idx_contacts_email ON public.contacts(email);
CREATE INDEX idx_contacts_phone ON public.contacts(phone);
CREATE INDEX idx_contacts_contact_type ON public.contacts(contact_type);
CREATE INDEX idx_contacts_created_by_user_id ON public.contacts(created_by_user_id);
CREATE INDEX idx_contacts_external_id ON public.contacts(external_id);
CREATE INDEX idx_contacts_tags ON public.contacts USING GIN(tags);

-- Full-text search
CREATE INDEX idx_contacts_search ON public.contacts USING GIN(
  to_tsvector('english',
    COALESCE(first_name, '') || ' ' ||
    COALESCE(last_name, '') || ' ' ||
    COALESCE(email, '')
  )
);

-- Comments
COMMENT ON TABLE public.contacts IS 'Individual people in the CRM';
COMMENT ON COLUMN public.contacts.contact_type IS 'Role: buyer, seller, tenant, landlord, vendor, agent, other';
```

**RLS Requirements:**
- Users can SELECT/INSERT/UPDATE contacts in their org
- Role-based DELETE (admin only)

---

### 2.2 companies

**Purpose:** Business entities (brokerages, title companies, etc.)

```sql
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  created_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- Identity
  name TEXT NOT NULL,
  legal_name TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,

  -- Classification
  company_type TEXT, -- brokerage, title_company, lender, vendor, client, other
  tags TEXT[] DEFAULT '{}',

  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  country TEXT DEFAULT 'US',

  -- Metadata
  notes TEXT,
  custom_fields JSONB DEFAULT '{}',
  external_id TEXT,

  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_companies_org_id ON public.companies(org_id);
CREATE INDEX idx_companies_name ON public.companies(name);
CREATE INDEX idx_companies_company_type ON public.companies(company_type);
CREATE INDEX idx_companies_external_id ON public.companies(external_id);

-- Comments
COMMENT ON TABLE public.companies IS 'Business entities in the CRM';
```

**RLS Requirements:**
- Same as contacts

---

### 2.3 contact_relationships

**Purpose:** Relationships between contacts and companies (e.g., contact works for company)

```sql
CREATE TABLE public.contact_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,

  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,

  relationship_type TEXT NOT NULL, -- employee, contractor, partner, client, vendor
  title TEXT, -- Job title if employee
  is_primary BOOLEAN DEFAULT false, -- Primary company for this contact

  start_date DATE,
  end_date DATE,

  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(contact_id, company_id, relationship_type)
);

-- Indexes
CREATE INDEX idx_contact_relationships_org_id ON public.contact_relationships(org_id);
CREATE INDEX idx_contact_relationships_contact_id ON public.contact_relationships(contact_id);
CREATE INDEX idx_contact_relationships_company_id ON public.contact_relationships(company_id);

-- Comments
COMMENT ON TABLE public.contact_relationships IS 'Links between contacts and companies';
```

**RLS Requirements:**
- Same as contacts

---

## 3. PROPERTY LAYER

### 3.1 properties

**Purpose:** Real estate properties (single-family, multi-unit, commercial)

```sql
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  created_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- Identity
  name TEXT, -- Optional friendly name
  property_type TEXT NOT NULL, -- residential, commercial, industrial, land, mixed_use
  subtype TEXT, -- single_family, condo, townhouse, apartment, etc.

  -- Address
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  country TEXT DEFAULT 'US',
  county TEXT,

  -- Details
  parcel_number TEXT,
  legal_description TEXT,
  square_footage INTEGER,
  lot_size NUMERIC(10,2),
  lot_size_unit TEXT DEFAULT 'sqft', -- sqft, acres
  bedrooms INTEGER,
  bathrooms NUMERIC(3,1),
  year_built INTEGER,

  -- Financial
  assessed_value NUMERIC(12,2),
  market_value NUMERIC(12,2),

  -- Status
  status TEXT DEFAULT 'active', -- active, sold, leased, off_market

  -- Metadata
  notes TEXT,
  custom_fields JSONB DEFAULT '{}',
  external_id TEXT,

  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_properties_org_id ON public.properties(org_id);
CREATE INDEX idx_properties_property_type ON public.properties(property_type);
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_created_by_user_id ON public.properties(created_by_user_id);
CREATE INDEX idx_properties_external_id ON public.properties(external_id);

-- Geospatial index (future: add lat/lng columns)
-- CREATE INDEX idx_properties_location ON public.properties USING GIST(location);

-- Full-text search
CREATE INDEX idx_properties_search ON public.properties USING GIN(
  to_tsvector('english',
    COALESCE(address_line1, '') || ' ' ||
    COALESCE(city, '') || ' ' ||
    COALESCE(state, '')
  )
);

-- Comments
COMMENT ON TABLE public.properties IS 'Real estate properties';
```

**RLS Requirements:**
- Users can SELECT/INSERT/UPDATE properties in their org
- Role-based DELETE

---

### 3.2 units

**Purpose:** Individual units within a property (for multi-unit buildings)

```sql
CREATE TABLE public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,

  -- Identity
  unit_number TEXT NOT NULL,
  unit_name TEXT,

  -- Details
  square_footage INTEGER,
  bedrooms INTEGER,
  bathrooms NUMERIC(3,1),
  floor INTEGER,

  -- Financial
  rent_amount NUMERIC(10,2),
  deposit_amount NUMERIC(10,2),

  -- Status
  status TEXT DEFAULT 'vacant', -- vacant, occupied, maintenance, off_market

  -- Metadata
  notes TEXT,
  custom_fields JSONB DEFAULT '{}',

  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(property_id, unit_number)
);

-- Indexes
CREATE INDEX idx_units_org_id ON public.units(org_id);
CREATE INDEX idx_units_property_id ON public.units(property_id);
CREATE INDEX idx_units_status ON public.units(status);

-- Comments
COMMENT ON TABLE public.units IS 'Units within multi-unit properties';
```

**RLS Requirements:**
- Same as properties

---

## 4. TRANSACTION LAYER

### 4.1 deals

**Purpose:** Real estate sales transactions

```sql
CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  created_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_to_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,

  -- Identity
  deal_name TEXT NOT NULL,
  deal_number TEXT UNIQUE, -- Auto-generated deal number
  deal_type TEXT NOT NULL, -- sale, purchase, listing

  -- Financial
  list_price NUMERIC(12,2),
  sale_price NUMERIC(12,2),
  commission_rate NUMERIC(5,2), -- Percentage
  commission_amount NUMERIC(12,2),

  -- Timeline
  listing_date DATE,
  contract_date DATE,
  closing_date DATE,
  possession_date DATE,

  -- Status
  stage TEXT DEFAULT 'lead', -- lead, listing, under_contract, pending, closed, cancelled
  status TEXT DEFAULT 'active', -- active, closed, cancelled

  -- Metadata
  notes TEXT,
  custom_fields JSONB DEFAULT '{}',
  external_id TEXT,

  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_deals_org_id ON public.deals(org_id);
CREATE INDEX idx_deals_property_id ON public.deals(property_id);
CREATE INDEX idx_deals_assigned_to_user_id ON public.deals(assigned_to_user_id);
CREATE INDEX idx_deals_stage ON public.deals(stage);
CREATE INDEX idx_deals_status ON public.deals(status);
CREATE INDEX idx_deals_closing_date ON public.deals(closing_date);
CREATE INDEX idx_deals_external_id ON public.deals(external_id);

-- Comments
COMMENT ON TABLE public.deals IS 'Real estate sales transactions';
```

**RLS Requirements:**
- Users can SELECT deals in their org
- Agents can INSERT/UPDATE deals they're assigned to
- Admins/TCs can INSERT/UPDATE all deals in org

---

### 4.2 leasing

**Purpose:** Lease agreements

```sql
CREATE TABLE public.leasing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  created_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_to_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,

  -- Identity
  lease_name TEXT NOT NULL,
  lease_number TEXT UNIQUE,

  -- Financial
  rent_amount NUMERIC(10,2) NOT NULL,
  deposit_amount NUMERIC(10,2),
  late_fee_amount NUMERIC(10,2),

  -- Timeline
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  lease_term_months INTEGER,

  -- Payment
  payment_frequency TEXT DEFAULT 'monthly', -- monthly, bi_weekly, weekly
  payment_due_day INTEGER DEFAULT 1, -- Day of month/week

  -- Status
  status TEXT DEFAULT 'draft', -- draft, active, expired, terminated

  -- Metadata
  notes TEXT,
  custom_fields JSONB DEFAULT '{}',
  external_id TEXT,

  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_leasing_org_id ON public.leasing(org_id);
CREATE INDEX idx_leasing_property_id ON public.leasing(property_id);
CREATE INDEX idx_leasing_unit_id ON public.leasing(unit_id);
CREATE INDEX idx_leasing_assigned_to_user_id ON public.leasing(assigned_to_user_id);
CREATE INDEX idx_leasing_status ON public.leasing(status);
CREATE INDEX idx_leasing_start_date ON public.leasing(start_date);
CREATE INDEX idx_leasing_end_date ON public.leasing(end_date);

-- Comments
COMMENT ON TABLE public.leasing IS 'Lease agreements';
```

**RLS Requirements:**
- Same as deals

---

### 4.3 deal_parties

**Purpose:** Links contacts to deals/leases with specific roles

```sql
CREATE TABLE public.deal_parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,

  -- Can link to either deals or leasing
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  lease_id UUID REFERENCES public.leasing(id) ON DELETE CASCADE,

  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,

  -- Role
  party_role TEXT NOT NULL, -- buyer, seller, tenant, landlord, agent, tc, attorney, lender, etc.
  is_primary BOOLEAN DEFAULT false, -- Primary contact for this role

  -- Metadata
  notes TEXT,

  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CHECK (deal_id IS NOT NULL OR lease_id IS NOT NULL),
  UNIQUE(deal_id, contact_id, party_role),
  UNIQUE(lease_id, contact_id, party_role)
);

-- Indexes
CREATE INDEX idx_deal_parties_org_id ON public.deal_parties(org_id);
CREATE INDEX idx_deal_parties_deal_id ON public.deal_parties(deal_id);
CREATE INDEX idx_deal_parties_lease_id ON public.deal_parties(lease_id);
CREATE INDEX idx_deal_parties_contact_id ON public.deal_parties(contact_id);
CREATE INDEX idx_deal_parties_company_id ON public.deal_parties(company_id);
CREATE INDEX idx_deal_parties_party_role ON public.deal_parties(party_role);

-- Comments
COMMENT ON TABLE public.deal_parties IS 'Links contacts to deals/leases with specific roles';
```

**RLS Requirements:**
- Same as deals

---

## 5. DOCUMENT LAYER

### 5.1 documents

**Purpose:** Document metadata and storage references

```sql
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  created_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- Identity
  name TEXT NOT NULL,
  document_type TEXT, -- contract, disclosure, inspection, photo, other
  mime_type TEXT,
  file_size INTEGER, -- bytes

  -- Storage
  storage_provider TEXT DEFAULT 'supabase', -- supabase, s3, skyslope, etc.
  storage_path TEXT NOT NULL, -- Path in storage bucket
  storage_bucket TEXT DEFAULT 'documents',

  -- Relationships (polymorphic - can attach to any entity)
  entity_type TEXT, -- deal, lease, contact, property, etc.
  entity_id UUID,

  -- Security
  visibility TEXT DEFAULT 'private', -- private, org, public

  -- Metadata
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  external_id TEXT,

  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_documents_org_id ON public.documents(org_id);
CREATE INDEX idx_documents_created_by_user_id ON public.documents(created_by_user_id);
CREATE INDEX idx_documents_entity_type_id ON public.documents(entity_type, entity_id);
CREATE INDEX idx_documents_document_type ON public.documents(document_type);
CREATE INDEX idx_documents_tags ON public.documents USING GIN(tags);

-- Comments
COMMENT ON TABLE public.documents IS 'Document metadata and storage references';
COMMENT ON COLUMN public.documents.entity_type IS 'Entity this doc is attached to: deal, lease, contact, property';
```

**RLS Requirements:**
- Users can SELECT documents in their org
- Users can INSERT documents
- Users can UPDATE/DELETE own documents
- Admins can UPDATE/DELETE all docs in org

---

### 5.2 document_versions

**Purpose:** Version history for documents

```sql
CREATE TABLE public.document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  created_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

  version_number INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,

  change_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(document_id, version_number)
);

-- Indexes
CREATE INDEX idx_document_versions_org_id ON public.document_versions(org_id);
CREATE INDEX idx_document_versions_document_id ON public.document_versions(document_id);

-- Comments
COMMENT ON TABLE public.document_versions IS 'Version history for documents';
```

**RLS Requirements:**
- Same as documents

---

## 6. COMMUNICATION LAYER

### 6.1 message_threads

**Purpose:** Group related messages together

```sql
CREATE TABLE public.message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,

  -- Identity
  subject TEXT,
  thread_type TEXT DEFAULT 'email', -- email, sms, note, internal

  -- Relationships
  entity_type TEXT, -- deal, lease, contact, property
  entity_id UUID,

  -- Participants
  participant_user_ids UUID[] DEFAULT '{}',
  participant_contact_ids UUID[] DEFAULT '{}',

  -- Status
  status TEXT DEFAULT 'active', -- active, archived

  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_message_threads_org_id ON public.message_threads(org_id);
CREATE INDEX idx_message_threads_entity_type_id ON public.message_threads(entity_type, entity_id);
CREATE INDEX idx_message_threads_participant_user_ids ON public.message_threads USING GIN(participant_user_ids);

-- Comments
COMMENT ON TABLE public.message_threads IS 'Group related messages together';
```

**RLS Requirements:**
- Users can SELECT threads they participate in
- Users can INSERT threads
- Users can UPDATE threads they participate in

---

### 6.2 messages

**Purpose:** Email/message records linked from inbox

```sql
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES public.message_threads(id) ON DELETE SET NULL,
  created_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- Identity
  message_type TEXT DEFAULT 'email', -- email, sms, note, internal
  direction TEXT, -- inbound, outbound

  -- Email fields
  subject TEXT,
  body TEXT,
  body_html TEXT,
  from_email TEXT,
  to_emails TEXT[] DEFAULT '{}',
  cc_emails TEXT[] DEFAULT '{}',
  bcc_emails TEXT[] DEFAULT '{}',

  -- Metadata
  external_id TEXT, -- ID from external system (Gmail, etc.)
  external_thread_id TEXT, -- Thread ID from external system
  metadata JSONB DEFAULT '{}',

  -- Status
  status TEXT DEFAULT 'received', -- received, sent, failed, draft

  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_messages_org_id ON public.messages(org_id);
CREATE INDEX idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX idx_messages_created_by_user_id ON public.messages(created_by_user_id);
CREATE INDEX idx_messages_external_id ON public.messages(external_id);
CREATE INDEX idx_messages_external_thread_id ON public.messages(external_thread_id);

-- Full-text search
CREATE INDEX idx_messages_search ON public.messages USING GIN(
  to_tsvector('english',
    COALESCE(subject, '') || ' ' ||
    COALESCE(body, '')
  )
);

-- Comments
COMMENT ON TABLE public.messages IS 'Email and message records';
```

**RLS Requirements:**
- Users can SELECT messages in their org
- Users can INSERT messages
- Users can UPDATE own messages

---

## 7. EVENT LAYER (AUDIT LEDGER)

### 7.1 events

**Purpose:** Immutable append-only audit trail for all state changes

```sql
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,

  -- Actor
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  actor_type TEXT DEFAULT 'user', -- user, system, integration

  -- Event classification
  event_type TEXT NOT NULL, -- created, updated, deleted, status_changed, etc.
  entity_type TEXT NOT NULL, -- deal, contact, property, document, etc.
  entity_id UUID NOT NULL,

  -- Event data
  payload JSONB NOT NULL DEFAULT '{}', -- Full event data (before/after, changes, etc.)

  -- Correlation
  correlation_id UUID, -- Group related events (e.g., bulk import)

  -- Immutability enforced by triggers
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_events_org_id ON public.events(org_id);
CREATE INDEX idx_events_entity_type_id ON public.events(entity_type, entity_id);
CREATE INDEX idx_events_event_type ON public.events(event_type);
CREATE INDEX idx_events_actor_id ON public.events(actor_id);
CREATE INDEX idx_events_created_at ON public.events(created_at DESC);
CREATE INDEX idx_events_correlation_id ON public.events(correlation_id);
CREATE INDEX idx_events_payload ON public.events USING GIN(payload);

-- Comments
COMMENT ON TABLE public.events IS 'Immutable append-only audit trail';
COMMENT ON COLUMN public.events.payload IS 'Event data: before/after state, changes, metadata';
COMMENT ON COLUMN public.events.correlation_id IS 'Group related events (bulk operations, workflows)';

-- Immutability enforcement
-- Prevent UPDATE and DELETE (only INSERT allowed)
CREATE RULE events_no_update AS ON UPDATE TO public.events DO INSTEAD NOTHING;
CREATE RULE events_no_delete AS ON DELETE TO public.events DO INSTEAD NOTHING;

-- Alternative: Use trigger for more control
CREATE OR REPLACE FUNCTION prevent_events_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Events table is append-only. UPDATE and DELETE operations are not allowed.';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_events_update
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION prevent_events_mutation();

CREATE TRIGGER prevent_events_delete
  BEFORE DELETE ON public.events
  FOR EACH ROW EXECUTE FUNCTION prevent_events_mutation();
```

**Event Types:**
- `created` - Entity created
- `updated` - Entity updated
- `deleted` - Entity deleted (soft delete)
- `status_changed` - Status transition
- `assigned` - Assigned to user
- `document_uploaded` - Document added
- `message_sent` - Message sent
- `integration_sync` - External sync event

**Payload Structure:**
```json
{
  "before": { /* previous state */ },
  "after": { /* new state */ },
  "changes": { /* diff */ },
  "metadata": {
    "ip_address": "1.2.3.4",
    "user_agent": "Mozilla/...",
    "source": "web_app"
  }
}
```

**RLS Requirements:**
- Users can INSERT events
- Users can SELECT events for entities they can access
- NOBODY can UPDATE or DELETE (enforced by triggers)

---

## 8. SUPPORT TABLES

### 8.1 Standard Triggers

All tables need an `updated_at` auto-update trigger:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to each table:
CREATE TRIGGER update_{table_name}_updated_at
  BEFORE UPDATE ON public.{table_name}
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 8.2 Event Logging Triggers

Auto-log changes to events table:

```sql
CREATE OR REPLACE FUNCTION log_entity_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Log INSERT
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.events (org_id, actor_id, event_type, entity_type, entity_id, payload)
    VALUES (
      NEW.org_id,
      current_setting('app.current_user_id', true)::UUID,
      'created',
      TG_TABLE_NAME,
      NEW.id,
      jsonb_build_object('after', to_jsonb(NEW))
    );
    RETURN NEW;
  END IF;

  -- Log UPDATE
  IF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.events (org_id, actor_id, event_type, entity_type, entity_id, payload)
    VALUES (
      NEW.org_id,
      current_setting('app.current_user_id', true)::UUID,
      'updated',
      TG_TABLE_NAME,
      NEW.id,
      jsonb_build_object('before', to_jsonb(OLD), 'after', to_jsonb(NEW))
    );
    RETURN NEW;
  END IF;

  -- Log DELETE
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO public.events (org_id, actor_id, event_type, entity_type, entity_id, payload)
    VALUES (
      OLD.org_id,
      current_setting('app.current_user_id', true)::UUID,
      'deleted',
      TG_TABLE_NAME,
      OLD.id,
      jsonb_build_object('before', to_jsonb(OLD))
    );
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply to each table that needs audit logging
```

---

## 9. MIGRATION DEPENDENCIES

Migrations must be applied in this order:

1. **Foundation**: `orgs`, `users`, `user_roles`
2. **Contacts**: `contacts`, `companies`, `contact_relationships`
3. **Properties**: `properties`, `units`
4. **Transactions**: `deals`, `leasing`, `deal_parties`
5. **Documents**: `documents`, `document_versions`
6. **Communication**: `message_threads`, `messages`
7. **Events**: `events` (with immutability triggers)
8. **Triggers**: `updated_at` triggers for all tables
9. **Audit**: Event logging triggers (optional, may add later)

---

## 10. FUTURE ENHANCEMENTS

### Phase 2 (Post-MVP)
- **Teams**: Add `teams` table for sub-org grouping
- **Tasks**: Add task management for deals
- **Calendar**: Add calendar events and reminders
- **Webhooks**: Add webhook subscriptions
- **Integrations**: Add integration credentials/configs

### Phase 3 (Advanced)
- **Geospatial**: Add PostGIS for property location queries
- **Full-text**: Improve search with dedicated search tables
- **Analytics**: Add materialized views for reporting
- **Partitioning**: Partition events table by date for performance

---

## 11. DESIGN RATIONALE

### Why UUID Primary Keys?
- Distributed system friendly (no coordination needed)
- Security (no sequential ID enumeration)
- Easy merging of data from multiple sources

### Why Soft Deletes?
- Audit trail preservation
- Data recovery capability
- Prevent cascade deletion surprises
- Event ledger can still reference deleted entities

### Why JSONB Custom Fields?
- Flexibility for org-specific customization
- No schema changes needed for custom fields
- Indexable with GIN indexes
- Common pattern in multi-tenant SaaS

### Why Separate Deals and Leasing?
- Different financial models (sale vs recurring rent)
- Different lifecycles and workflows
- Different document requirements
- Prevents NULL field sprawl in single table

### Why Polymorphic Relationships?
- Documents can attach to any entity
- Messages can link to any entity
- Events track any entity
- Reduces table explosion
- Trade-off: Lose foreign key constraints (handled in app layer)

---

## Summary

This schema provides:
- **14 core tables** covering all REIL/Q domains
- **Strict multi-tenancy** with org_id isolation
- **Immutable audit trail** via events table
- **Flexible relationships** via polymorphic patterns
- **Search-ready** with GIN indexes and full-text
- **Integration-ready** with external_id fields
- **Security-ready** with RLS requirements defined

**Next Steps:**
1. Create migration SQL files
2. Define RLS policies in detail
3. Document API routes
4. Generate TypeScript types
