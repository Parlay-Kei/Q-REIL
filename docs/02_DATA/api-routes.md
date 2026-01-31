# REIL/Q API Routes

**Version:** 1.0.0
**Date:** 2025-12-31
**Owner:** SupabaseArchitect
**Status:** Sprint 0.1 - Initial Design

## Overview

REIL/Q API provides RESTful endpoints for all core entities. Built on Supabase, the API uses:
- **Supabase PostgREST** for auto-generated REST API
- **Supabase Realtime** for live subscriptions
- **Edge Functions** for complex business logic
- **RLS** for security enforcement

---

## API Architecture

### Base URL
```
Production:  https://[project-ref].supabase.co/rest/v1/
Local:       http://localhost:54321/rest/v1/
```

### Authentication
All requests require authentication header:
```
Authorization: Bearer [JWT_TOKEN]
apikey: [ANON_KEY]
```

### Standard Response Format
```typescript
// Success
{
  data: [...],
  count: 100,        // For paginated results
  error: null
}

// Error
{
  data: null,
  error: {
    message: "Error description",
    code: "ERROR_CODE",
    details: "..."
  }
}
```

---

## 1. ORGANIZATION LAYER

### 1.1 Organizations

#### GET /orgs
**Purpose:** Get current user's organization
**Access:** All authenticated users

```typescript
// Request
GET /rest/v1/orgs?id=eq.{org_id}&select=*

// Response
{
  id: "uuid",
  name: "Acme Realty",
  slug: "acme-realty",
  settings: {},
  subscription_tier: "pro",
  subscription_status: "active",
  max_users: 25,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z"
}
```

#### PATCH /orgs
**Purpose:** Update organization settings
**Access:** Admin only

```typescript
// Request
PATCH /rest/v1/orgs?id=eq.{org_id}
{
  name: "New Name",
  settings: {
    branding: { logo_url: "..." },
    features: { enable_leasing: true }
  }
}
```

---

### 1.2 Users

#### GET /users
**Purpose:** List all users in organization
**Access:** All authenticated users

```typescript
// Request
GET /rest/v1/users?select=*,user_roles(*)&order=created_at.desc

// Response
[
  {
    id: "uuid",
    org_id: "uuid",
    email: "user@example.com",
    full_name: "John Doe",
    avatar_url: "https://...",
    phone: "555-1234",
    status: "active",
    user_roles: [
      { role: "agent", scope: "org" }
    ],
    created_at: "2025-01-01T00:00:00Z"
  }
]
```

#### POST /users
**Purpose:** Create new user (invite)
**Access:** Admin only

```typescript
// Request
POST /rest/v1/users
{
  email: "newuser@example.com",
  full_name: "Jane Smith",
  org_id: "{org_id}"
}

// Note: Triggers signup email via Supabase Auth
```

#### PATCH /users
**Purpose:** Update user profile
**Access:** Self or Admin

```typescript
// Request
PATCH /rest/v1/users?id=eq.{user_id}
{
  full_name: "Updated Name",
  phone: "555-5678",
  avatar_url: "https://..."
}
```

#### DELETE /users
**Purpose:** Soft delete user
**Access:** Admin only

```typescript
// Request
PATCH /rest/v1/users?id=eq.{user_id}
{
  deleted_at: "2025-12-31T00:00:00Z",
  status: "inactive"
}
```

---

### 1.3 User Roles

#### GET /user_roles
**Purpose:** Get user roles
**Access:** All authenticated users

```typescript
// Request
GET /rest/v1/user_roles?user_id=eq.{user_id}&select=*
```

#### POST /user_roles
**Purpose:** Assign role to user
**Access:** Admin only

```typescript
// Request
POST /rest/v1/user_roles
{
  user_id: "uuid",
  org_id: "uuid",
  role: "agent",
  scope: "org"
}
```

---

## 2. CONTACT LAYER

### 2.1 Contacts

#### GET /contacts
**Purpose:** List contacts with filtering and search
**Access:** All authenticated users

```typescript
// Basic list
GET /rest/v1/contacts?select=*&order=created_at.desc&limit=50

// Filter by type
GET /rest/v1/contacts?contact_type=eq.buyer&select=*

// Full-text search
GET /rest/v1/contacts?or=(first_name.ilike.*john*,last_name.ilike.*john*,email.ilike.*john*)

// With relationships
GET /rest/v1/contacts?select=*,contact_relationships(company_id,companies(*))
```

#### GET /contacts/:id
**Purpose:** Get single contact with full details
**Access:** All authenticated users

```typescript
// Request
GET /rest/v1/contacts?id=eq.{contact_id}&select=*,contact_relationships(*,companies(*)),deal_parties(deals(*))

// Response
{
  id: "uuid",
  org_id: "uuid",
  first_name: "John",
  last_name: "Doe",
  email: "john@example.com",
  phone: "555-1234",
  contact_type: "buyer",
  address_line1: "123 Main St",
  city: "Austin",
  state: "TX",
  zip: "78701",
  tags: ["vip", "referral"],
  custom_fields: {},
  contact_relationships: [...],
  deal_parties: [...]
}
```

#### POST /contacts
**Purpose:** Create new contact
**Access:** All authenticated users

```typescript
// Request
POST /rest/v1/contacts
{
  org_id: "{org_id}",
  first_name: "John",
  last_name: "Doe",
  email: "john@example.com",
  phone: "555-1234",
  contact_type: "buyer",
  source: "web_form"
}
```

#### PATCH /contacts/:id
**Purpose:** Update contact
**Access:** All authenticated users

```typescript
// Request
PATCH /rest/v1/contacts?id=eq.{contact_id}
{
  phone: "555-5678",
  tags: ["vip", "referral", "hot_lead"]
}
```

#### DELETE /contacts/:id
**Purpose:** Soft delete contact
**Access:** Admin only

```typescript
// Request
PATCH /rest/v1/contacts?id=eq.{contact_id}
{ deleted_at: "2025-12-31T00:00:00Z" }
```

---

### 2.2 Companies

Same pattern as contacts:

```typescript
// List
GET /rest/v1/companies?select=*&order=name.asc

// Get one
GET /rest/v1/companies?id=eq.{company_id}&select=*,contact_relationships(contacts(*))

// Create
POST /rest/v1/companies
{
  org_id: "{org_id}",
  name: "Acme Title",
  company_type: "title_company",
  email: "info@acmetitle.com"
}

// Update
PATCH /rest/v1/companies?id=eq.{company_id}
{ phone: "555-9999" }
```

---

### 2.3 Contact Relationships

#### POST /contact_relationships
**Purpose:** Link contact to company
**Access:** All authenticated users

```typescript
// Request
POST /rest/v1/contact_relationships
{
  org_id: "{org_id}",
  contact_id: "{contact_id}",
  company_id: "{company_id}",
  relationship_type: "employee",
  title: "Senior Agent",
  is_primary: true
}
```

---

## 3. PROPERTY LAYER

### 3.1 Properties

#### GET /properties
**Purpose:** List properties with filtering
**Access:** All authenticated users

```typescript
// Basic list
GET /rest/v1/properties?select=*&order=created_at.desc

// Filter by type
GET /rest/v1/properties?property_type=eq.residential&status=eq.active

// With units (for multi-unit)
GET /rest/v1/properties?select=*,units(*)&property_type=eq.commercial

// Search by address
GET /rest/v1/properties?or=(address_line1.ilike.*main*,city.ilike.*austin*)
```

#### POST /properties
**Purpose:** Create new property
**Access:** All authenticated users

```typescript
// Request
POST /rest/v1/properties
{
  org_id: "{org_id}",
  property_type: "residential",
  subtype: "single_family",
  address_line1: "123 Main St",
  city: "Austin",
  state: "TX",
  zip: "78701",
  bedrooms: 3,
  bathrooms: 2.5,
  square_footage: 2000,
  year_built: 2020
}
```

---

### 3.2 Units

#### GET /units
**Purpose:** List units for a property
**Access:** All authenticated users

```typescript
// Request
GET /rest/v1/units?property_id=eq.{property_id}&select=*
```

#### POST /units
**Purpose:** Add unit to property
**Access:** All authenticated users

```typescript
// Request
POST /rest/v1/units
{
  org_id: "{org_id}",
  property_id: "{property_id}",
  unit_number: "101",
  bedrooms: 2,
  bathrooms: 1,
  rent_amount: 1500,
  status: "vacant"
}
```

---

## 4. TRANSACTION LAYER

### 4.1 Deals

#### GET /deals
**Purpose:** List deals with filtering
**Access:** All authenticated users (filtered by RLS)

```typescript
// My deals (assigned to me)
GET /rest/v1/deals?assigned_to_user_id=eq.{user_id}&select=*,properties(*),deal_parties(contacts(*))

// By stage
GET /rest/v1/deals?stage=eq.under_contract&select=*

// Closing this month
GET /rest/v1/deals?closing_date=gte.2025-01-01&closing_date=lt.2025-02-01

// Full deal with parties and documents
GET /rest/v1/deals?id=eq.{deal_id}&select=*,properties(*),deal_parties(contacts(*),companies(*)),documents(*)
```

#### POST /deals
**Purpose:** Create new deal
**Access:** Agent, TC, Admin

```typescript
// Request
POST /rest/v1/deals
{
  org_id: "{org_id}",
  property_id: "{property_id}",
  assigned_to_user_id: "{user_id}",
  deal_name: "123 Main St - Smith Purchase",
  deal_type: "purchase",
  list_price: 500000,
  stage: "lead"
}
```

#### PATCH /deals/:id
**Purpose:** Update deal (stage changes, financials, etc.)
**Access:** Assigned agent, TC, Admin

```typescript
// Update stage
PATCH /rest/v1/deals?id=eq.{deal_id}
{
  stage: "under_contract",
  contract_date: "2025-01-15",
  sale_price: 495000
}
```

---

### 4.2 Leasing

Same pattern as deals:

```typescript
// List active leases
GET /rest/v1/leasing?status=eq.active&select=*,properties(*),units(*)

// Create lease
POST /rest/v1/leasing
{
  org_id: "{org_id}",
  property_id: "{property_id}",
  unit_id: "{unit_id}",
  lease_name: "Unit 101 - Doe",
  rent_amount: 1500,
  start_date: "2025-02-01",
  end_date: "2026-01-31",
  lease_term_months: 12
}
```

---

### 4.3 Deal Parties

#### POST /deal_parties
**Purpose:** Add party to deal/lease
**Access:** All authenticated users

```typescript
// Add buyer to deal
POST /rest/v1/deal_parties
{
  org_id: "{org_id}",
  deal_id: "{deal_id}",
  contact_id: "{contact_id}",
  party_role: "buyer",
  is_primary: true
}

// Add tenant to lease
POST /rest/v1/deal_parties
{
  org_id: "{org_id}",
  lease_id: "{lease_id}",
  contact_id: "{contact_id}",
  party_role: "tenant",
  is_primary: true
}
```

---

## 5. DOCUMENT LAYER

### 5.1 Documents

#### GET /documents
**Purpose:** List documents for an entity
**Access:** All authenticated users

```typescript
// Get deal documents
GET /rest/v1/documents?entity_type=eq.deal&entity_id=eq.{deal_id}&select=*

// Get all documents
GET /rest/v1/documents?select=*&order=created_at.desc
```

#### POST /documents
**Purpose:** Upload document metadata (file upload separate)
**Access:** All authenticated users

**Flow:**
1. Upload file to Supabase Storage
2. Create document record with storage path

```typescript
// Step 1: Upload to storage
const { data, error } = await supabase.storage
  .from('documents')
  .upload(`{org_id}/{entity_type}/{entity_id}/{filename}`, file);

// Step 2: Create document record
POST /rest/v1/documents
{
  org_id: "{org_id}",
  name: "Purchase Agreement.pdf",
  document_type: "contract",
  mime_type: "application/pdf",
  file_size: 102400,
  storage_provider: "supabase",
  storage_path: "{org_id}/deal/{deal_id}/purchase-agreement.pdf",
  storage_bucket: "documents",
  entity_type: "deal",
  entity_id: "{deal_id}",
  visibility: "private"
}
```

#### GET /documents/:id/download
**Purpose:** Get signed URL for download
**Access:** All authenticated users (RLS enforced)

```typescript
// Edge function: /functions/v1/document-download
POST /functions/v1/document-download
{
  document_id: "{document_id}"
}

// Response
{
  signed_url: "https://...",
  expires_at: "2025-12-31T23:59:59Z"
}
```

---

### 5.2 Document Versions

#### GET /document_versions
**Purpose:** Get version history
**Access:** All authenticated users

```typescript
// Request
GET /rest/v1/document_versions?document_id=eq.{document_id}&select=*&order=version_number.desc
```

---

## 6. COMMUNICATION LAYER

### 6.1 Message Threads

#### GET /message_threads
**Purpose:** List threads for an entity or user
**Access:** Participants only

```typescript
// My threads
GET /rest/v1/message_threads?participant_user_ids=cs.{auth.uid()}&select=*,messages(*)

// Deal threads
GET /rest/v1/message_threads?entity_type=eq.deal&entity_id=eq.{deal_id}&select=*
```

#### POST /message_threads
**Purpose:** Create new thread
**Access:** All authenticated users

```typescript
// Request
POST /rest/v1/message_threads
{
  org_id: "{org_id}",
  subject: "123 Main St - Questions",
  thread_type: "email",
  entity_type: "deal",
  entity_id: "{deal_id}",
  participant_user_ids: ["{user_id_1}", "{user_id_2}"]
}
```

---

### 6.2 Messages

#### GET /messages
**Purpose:** Get messages in thread
**Access:** Thread participants

```typescript
// Request
GET /rest/v1/messages?thread_id=eq.{thread_id}&select=*&order=created_at.asc
```

#### POST /messages
**Purpose:** Add message to thread
**Access:** Thread participants

```typescript
// Request
POST /rest/v1/messages
{
  org_id: "{org_id}",
  thread_id: "{thread_id}",
  message_type: "email",
  direction: "outbound",
  subject: "Re: Questions",
  body: "Here are the answers...",
  from_email: "agent@acmerealty.com",
  to_emails: ["client@example.com"]
}
```

---

## 7. EVENT LAYER

### 7.1 Events

#### GET /events
**Purpose:** Get audit trail for entity
**Access:** All authenticated users (read-only)

```typescript
// Get deal events
GET /rest/v1/events?entity_type=eq.deal&entity_id=eq.{deal_id}&select=*&order=created_at.desc

// Get user activity
GET /rest/v1/events?actor_id=eq.{user_id}&select=*&order=created_at.desc&limit=100

// Filter by event type
GET /rest/v1/events?event_type=eq.status_changed&entity_type=eq.deal
```

#### POST /events
**Purpose:** Log custom event
**Access:** All authenticated users (append-only)

```typescript
// Request
POST /rest/v1/events
{
  org_id: "{org_id}",
  actor_id: "{user_id}",
  event_type: "custom_action",
  entity_type: "deal",
  entity_id: "{deal_id}",
  payload: {
    action: "sent_email",
    to: "client@example.com",
    subject: "Update on your deal"
  }
}
```

**Note:** Most events are auto-generated by triggers, not manually inserted.

---

## 8. EDGE FUNCTIONS

Custom business logic that can't be handled by PostgREST alone.

### 8.1 Document Operations

#### POST /functions/v1/document-upload
**Purpose:** Handle multi-step document upload
**Access:** Authenticated users

```typescript
// Request
POST /functions/v1/document-upload
Content-Type: multipart/form-data

file: [binary]
org_id: "uuid"
entity_type: "deal"
entity_id: "uuid"
document_type: "contract"

// Response
{
  document_id: "uuid",
  storage_path: "...",
  version_number: 1
}
```

#### POST /functions/v1/document-download
**Purpose:** Generate signed download URL
**Access:** Authenticated users

```typescript
// Request
POST /functions/v1/document-download
{ document_id: "uuid" }

// Response
{ signed_url: "https://...", expires_in: 3600 }
```

---

### 8.2 Event Logging

#### POST /functions/v1/log-event
**Purpose:** Log complex events with validation
**Access:** Authenticated users

```typescript
// Request
POST /functions/v1/log-event
{
  event_type: "deal_stage_changed",
  entity_type: "deal",
  entity_id: "uuid",
  payload: {
    from_stage: "lead",
    to_stage: "under_contract",
    contract_date: "2025-01-15"
  }
}
```

---

### 8.3 Message Processing

#### POST /functions/v1/process-incoming-email
**Purpose:** Process incoming email (webhook from email provider)
**Access:** Service role (webhook)

```typescript
// Request (from email provider webhook)
POST /functions/v1/process-incoming-email
{
  from: "client@example.com",
  to: "agent@acmerealty.com",
  subject: "Re: 123 Main St",
  body: "...",
  html_body: "...",
  external_message_id: "msg_123",
  external_thread_id: "thread_456"
}

// Response
{ thread_id: "uuid", message_id: "uuid" }
```

---

### 8.4 Deal Pipeline

#### POST /functions/v1/move-deal-stage
**Purpose:** Move deal to next stage with validation
**Access:** Assigned agent, TC, Admin

```typescript
// Request
POST /functions/v1/move-deal-stage
{
  deal_id: "uuid",
  new_stage: "under_contract",
  contract_date: "2025-01-15",
  notes: "Offer accepted"
}

// Validates:
// - Required fields for stage
// - Stage transition rules
// - User permissions

// Response
{
  deal: { /* updated deal */ },
  event_id: "uuid"
}
```

---

## 9. REALTIME SUBSCRIPTIONS

### Subscribe to Changes

```typescript
// Subscribe to deals table
const subscription = supabase
  .channel('deals-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'deals',
      filter: `org_id=eq.${orgId}`
    },
    (payload) => {
      console.log('Deal changed:', payload);
    }
  )
  .subscribe();

// Subscribe to specific deal
const dealSubscription = supabase
  .channel(`deal-${dealId}`)
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'deals',
      filter: `id=eq.${dealId}`
    },
    (payload) => {
      console.log('This deal changed:', payload);
    }
  )
  .subscribe();
```

### Subscribe to Events (Activity Feed)

```typescript
// Real-time activity feed
const eventsSubscription = supabase
  .channel('activity-feed')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'events',
      filter: `org_id=eq.${orgId}`
    },
    (payload) => {
      console.log('New event:', payload.new);
      // Update UI activity feed
    }
  )
  .subscribe();
```

---

## 10. PAGINATION

### Using Range Headers

```typescript
// Get items 0-49 (first page)
GET /rest/v1/contacts?select=*&order=created_at.desc
Headers:
  Range: 0-49

// Response includes:
Content-Range: 0-49/500  // showing items 0-49 of 500 total

// Next page (items 50-99)
GET /rest/v1/contacts?select=*&order=created_at.desc
Headers:
  Range: 50-99
```

### Using offset and limit

```typescript
// Alternative: use limit and offset
GET /rest/v1/contacts?select=*&order=created_at.desc&limit=50&offset=0
```

---

## 11. FILTERING AND OPERATORS

### Common Filters

```typescript
// Equals
?column=eq.value

// Not equals
?column=neq.value

// Greater than
?column=gt.100

// Less than
?column=lt.100

// Like (case-sensitive)
?column=like.*search*

// iLike (case-insensitive)
?column=ilike.*search*

// In array
?column=in.(value1,value2,value3)

// Is null
?column=is.null

// Not null
?column=not.is.null

// Array contains
?tags=cs.{vip}

// Array overlaps
?tags=ov.{vip,referral}
```

### Combining Filters

```typescript
// AND (default)
?status=eq.active&contact_type=eq.buyer

// OR
?or=(status.eq.active,status.eq.pending)

// Complex
?and=(status.eq.active,or(contact_type.eq.buyer,contact_type.eq.seller))
```

---

## 12. BATCH OPERATIONS

### Bulk Insert

```typescript
POST /rest/v1/contacts
[
  { org_id: "uuid", first_name: "John", last_name: "Doe", email: "john@example.com" },
  { org_id: "uuid", first_name: "Jane", last_name: "Smith", email: "jane@example.com" }
]

// Returns array of created records
```

### Bulk Update

```typescript
PATCH /rest/v1/contacts?id=in.(uuid1,uuid2,uuid3)
{ tags: ["bulk_updated"] }
```

---

## 13. ERROR HANDLING

### HTTP Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `204 No Content` - Success, no response body
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Missing/invalid auth
- `403 Forbidden` - RLS policy violation
- `404 Not Found` - Resource not found
- `409 Conflict` - Unique constraint violation
- `500 Internal Server Error` - Server error

### Error Response Format

```typescript
{
  code: "PGRST116",
  details: "Results contain 0 rows, but expected 1",
  hint: null,
  message: "Row not found"
}
```

---

## 14. TYPESCRIPT CLIENT

### Supabase Client Setup

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Type-safe queries
const { data: contacts, error } = await supabase
  .from('contacts')
  .select('*, contact_relationships(*, companies(*))')
  .eq('org_id', orgId);
```

---

## Summary

This API provides:
- **REST endpoints** for all 14 core tables
- **Realtime subscriptions** for live updates
- **Edge functions** for complex logic
- **Type safety** via generated TypeScript types
- **RLS enforcement** for security
- **Flexible querying** with PostgREST operators

**Next Steps:**
1. Generate TypeScript types: `supabase gen types typescript`
2. Implement edge functions
3. Set up storage buckets and policies
4. Configure realtime for needed tables
5. Write integration tests
