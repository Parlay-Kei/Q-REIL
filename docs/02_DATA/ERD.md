# REIL/Q Entity Relationship Diagram

**Version:** 1.0.0
**Date:** 2025-12-31

## Complete Entity Relationship Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          ORGANIZATION LAYER                                   │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│       orgs          │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ slug (UNIQUE)       │
│ settings (JSONB)    │
│ subscription_tier   │
│ max_users           │
│ created_at          │
│ updated_at          │
└─────────────────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────────┐           ┌─────────────────────┐
│       users         │           │    user_roles       │
├─────────────────────┤           ├─────────────────────┤
│ id (PK, FK auth)    │───────────│ user_id (FK)        │
│ org_id (FK orgs)    │     1:N   │ org_id (FK orgs)    │
│ email               │           │ role (enum)         │
│ full_name           │           │ scope               │
│ avatar_url          │           │ scope_id            │
│ phone               │           │ created_at          │
│ status              │           │ updated_at          │
│ created_at          │           └─────────────────────┘
│ updated_at          │
└─────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│                            CONTACT LAYER                                      │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐           ┌─────────────────────┐
│     contacts        │           │     companies       │
├─────────────────────┤           ├─────────────────────┤
│ id (PK)             │           │ id (PK)             │
│ org_id (FK orgs)    │           │ org_id (FK orgs)    │
│ first_name          │           │ name                │
│ last_name           │           │ legal_name          │
│ email               │           │ website             │
│ phone               │           │ email               │
│ contact_type        │           │ company_type        │
│ address_*           │           │ address_*           │
│ tags (array)        │           │ tags (array)        │
│ custom_fields (JSON)│           │ custom_fields (JSON)│
│ external_id         │           │ external_id         │
│ created_at          │           │ created_at          │
│ updated_at          │           │ updated_at          │
└─────────────────────┘           └─────────────────────┘
         │                                   │
         │                                   │
         │         ┌─────────────────────────┐
         │         │ contact_relationships   │
         │         ├─────────────────────────┤
         └─────────│ contact_id (FK)         │
             N:M   │ company_id (FK)         │
                   │ relationship_type       │
                   │ title                   │
                   │ is_primary              │
                   └─────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│                           PROPERTY LAYER                                      │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│    properties       │
├─────────────────────┤
│ id (PK)             │
│ org_id (FK orgs)    │
│ name                │
│ property_type       │
│ subtype             │
│ address_*           │
│ parcel_number       │
│ square_footage      │
│ bedrooms            │
│ bathrooms           │
│ year_built          │
│ assessed_value      │
│ status              │
│ custom_fields (JSON)│
│ external_id         │
│ created_at          │
│ updated_at          │
└─────────────────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────────┐
│       units         │
├─────────────────────┤
│ id (PK)             │
│ org_id (FK orgs)    │
│ property_id (FK)    │
│ unit_number         │
│ square_footage      │
│ bedrooms            │
│ bathrooms           │
│ rent_amount         │
│ deposit_amount      │
│ status              │
│ created_at          │
│ updated_at          │
└─────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│                         TRANSACTION LAYER                                     │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐           ┌─────────────────────┐
│       deals         │           │      leasing        │
├─────────────────────┤           ├─────────────────────┤
│ id (PK)             │           │ id (PK)             │
│ org_id (FK orgs)    │           │ org_id (FK orgs)    │
│ property_id (FK)    │           │ property_id (FK)    │
│ assigned_to (FK usr)│           │ unit_id (FK)        │
│ deal_name           │           │ assigned_to (FK usr)│
│ deal_number         │           │ lease_name          │
│ deal_type           │           │ lease_number        │
│ list_price          │           │ rent_amount         │
│ sale_price          │           │ deposit_amount      │
│ commission_*        │           │ start_date          │
│ listing_date        │           │ end_date            │
│ contract_date       │           │ lease_term_months   │
│ closing_date        │           │ payment_frequency   │
│ stage               │           │ status              │
│ status              │           │ custom_fields (JSON)│
│ custom_fields (JSON)│           │ external_id         │
│ external_id         │           │ created_at          │
│ created_at          │           │ updated_at          │
│ updated_at          │           └─────────────────────┘
└─────────────────────┘
         │                                   │
         │                                   │
         │         ┌─────────────────────────┐
         │         │    deal_parties         │
         │         ├─────────────────────────┤
         └─────────│ deal_id (FK, nullable)  │
                   │ lease_id (FK, nullable) │
                   │ contact_id (FK)         │◄────┐
                   │ company_id (FK)         │     │
                   │ party_role              │     │ From
                   │ is_primary              │     │ contacts
                   └─────────────────────────┘     │ layer


┌──────────────────────────────────────────────────────────────────────────────┐
│                          DOCUMENT LAYER                                       │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│     documents       │
├─────────────────────┤
│ id (PK)             │
│ org_id (FK orgs)    │
│ created_by (FK usr) │
│ name                │
│ document_type       │
│ mime_type           │
│ file_size           │
│ storage_provider    │
│ storage_path        │
│ storage_bucket      │
│ entity_type         │──── Polymorphic: deal, lease, contact, property
│ entity_id           │
│ visibility          │
│ tags (array)        │
│ custom_fields (JSON)│
│ external_id         │
│ created_at          │
│ updated_at          │
└─────────────────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────────┐
│ document_versions   │
├─────────────────────┤
│ id (PK)             │
│ org_id (FK orgs)    │
│ document_id (FK)    │
│ version_number      │
│ storage_path        │
│ file_size           │
│ mime_type           │
│ change_notes        │
│ created_at          │
└─────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│                       COMMUNICATION LAYER                                     │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│  message_threads    │
├─────────────────────┤
│ id (PK)             │
│ org_id (FK orgs)    │
│ subject             │
│ thread_type         │
│ entity_type         │──── Polymorphic: deal, lease, contact, property
│ entity_id           │
│ participant_user_ids│──── Array of user IDs
│ participant_contact_│──── Array of contact IDs
│ status              │
│ created_at          │
│ updated_at          │
└─────────────────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────────┐
│      messages       │
├─────────────────────┤
│ id (PK)             │
│ org_id (FK orgs)    │
│ thread_id (FK)      │
│ created_by (FK usr) │
│ message_type        │
│ direction           │
│ subject             │
│ body                │
│ body_html           │
│ from_email          │
│ to_emails (array)   │
│ cc_emails (array)   │
│ external_id         │
│ external_thread_id  │
│ metadata (JSONB)    │
│ status              │
│ created_at          │
│ updated_at          │
└─────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│                      EVENT LAYER (AUDIT LEDGER)                               │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│       events        │
├─────────────────────┤
│ id (PK)             │
│ org_id (FK orgs)    │
│ actor_id (FK users) │
│ actor_type          │
│ event_type          │
│ entity_type         │──── Polymorphic: any entity
│ entity_id           │
│ payload (JSONB)     │──── before/after state, changes, metadata
│ correlation_id      │
│ created_at          │──── IMMUTABLE - no updated_at
└─────────────────────┘
         ▲
         │
         │ Triggers prevent UPDATE/DELETE
         │ Append-only audit trail


┌──────────────────────────────────────────────────────────────────────────────┐
│                         KEY RELATIONSHIPS                                     │
└──────────────────────────────────────────────────────────────────────────────┘

1. org_id Foreign Keys (Multi-Tenancy)
   All tables (except orgs) → orgs.id
   Enforces org isolation via RLS

2. User References
   users.id → Multiple tables for ownership/assignment
   - contacts.created_by_user_id
   - properties.created_by_user_id
   - deals.assigned_to_user_id
   - documents.created_by_user_id
   - events.actor_id

3. Deal/Lease Parties
   deal_parties → contacts (N:1)
   deal_parties → companies (N:1, optional)
   deal_parties → deals OR leasing (mutually exclusive)

4. Polymorphic References
   documents.entity_type/entity_id → Any entity
   message_threads.entity_type/entity_id → Any entity
   events.entity_type/entity_id → Any entity

5. Property Hierarchy
   properties (1:N) → units
   properties (1:N) → deals
   properties + units (1:N) → leasing


┌──────────────────────────────────────────────────────────────────────────────┐
│                         CARDINALITY LEGEND                                    │
└──────────────────────────────────────────────────────────────────────────────┘

1:1   One-to-One
1:N   One-to-Many
N:M   Many-to-Many (via junction table)

FK    Foreign Key
PK    Primary Key

(nullable)  Optional foreign key
(UNIQUE)    Unique constraint
(array)     PostgreSQL array type
(JSON/JSONB) JSON/JSONB column
```

---

## Cascading Behaviors

### ON DELETE CASCADE
When parent deleted, child automatically deleted:
- orgs → all child records
- users → user_roles, events.actor_id
- properties → units
- deals → deal_parties
- leasing → deal_parties
- documents → document_versions
- message_threads → messages

### ON DELETE SET NULL
When parent deleted, child FK set to NULL (orphaned):
- users → contacts.created_by_user_id
- users → properties.created_by_user_id
- users → deals.assigned_to_user_id
- properties → deals.property_id
- contacts → deal_parties.contact_id (SET NULL)

### ON DELETE RESTRICT (default)
Prevent deletion if children exist - must delete children first.

---

## Index Coverage

All foreign keys have indexes:
```
idx_{table}_org_id           All tables (critical for RLS)
idx_{table}_{foreign_key}    All foreign keys
idx_{table}_created_at       Most tables
idx_{table}_status           Status columns
idx_{table}_tags             GIN indexes for arrays
idx_{table}_search           Full-text search (contacts, properties, messages)
idx_{table}_payload          GIN indexes for JSONB
```

---

## Data Flow Examples

### Creating a Deal
```
1. Create property (or use existing)
2. Create contacts (buyer, seller, agents)
3. Create deal (references property)
4. Add deal_parties (link contacts to deal with roles)
5. Upload documents (attach to deal via entity_type/entity_id)
6. All changes logged to events table
```

### Contact with Company Affiliation
```
1. Create company (brokerage)
2. Create contact (agent)
3. Create contact_relationship (agent works for brokerage)
4. Contact can now be linked to deals with company context
```

### Multi-Unit Lease
```
1. Create property (apartment building)
2. Create units (unit 101, 102, etc.)
3. Create contact (tenant)
4. Create lease (references property + specific unit)
5. Add deal_parties (tenant role)
6. Lease documents attached
```

---

## Summary Statistics

- **Total Tables:** 14
- **Total Foreign Keys:** ~25
- **Polymorphic Relationships:** 3 (documents, message_threads, events)
- **Many-to-Many Junctions:** 3 (user_roles, contact_relationships, deal_parties)
- **Soft Delete Tables:** 13 (all except events)
- **Immutable Tables:** 1 (events)
- **Tables with Full-Text Search:** 3 (contacts, properties, messages)
- **Tables with JSONB Fields:** 11 (custom_fields, settings, metadata, payload)

---

## Notes

1. **Multi-Tenancy:** Every query filtered by org_id via RLS
2. **Audit Trail:** Events table captures all changes immutably
3. **Flexibility:** JSONB custom_fields allow org-specific extensions
4. **Integration:** external_id fields map to external systems
5. **Security:** RLS enabled on all tables, enforced at database level
