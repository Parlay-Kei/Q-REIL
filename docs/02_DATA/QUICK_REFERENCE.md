# REIL/Q Database Quick Reference

**Version:** 1.0.0
**Date:** 2025-12-31

## Core Tables (14)

### Organization Layer (3)
```
orgs                    Root tenant entity
├── users               User accounts (references auth.users)
└── user_roles          Role assignments
```

### Contact Layer (3)
```
contacts                Individual people (CRM)
companies               Business entities
contact_relationships   Contact ↔ Company links
```

### Property Layer (2)
```
properties              Real estate properties
└── units               Units within properties (multi-unit)
```

### Transaction Layer (3)
```
deals                   Sales transactions
leasing                 Lease agreements
deal_parties            Links contacts to deals/leases
```

### Document Layer (2)
```
documents               Document metadata + storage refs
└── document_versions   Version history
```

### Communication Layer (2)
```
message_threads         Thread groupings
└── messages            Email/message records
```

### Event Layer (1)
```
events                  Append-only audit ledger (IMMUTABLE)
```

---

## Standard Columns

Every table has:
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
org_id UUID REFERENCES orgs(id)  -- Except orgs table
created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL  -- Except events
deleted_at TIMESTAMPTZ  -- Soft delete on most tables
```

---

## Foreign Key Relationships

```
orgs
 ├─→ users
 │    ├─→ user_roles
 │    ├─→ contacts (created_by_user_id)
 │    ├─→ companies (created_by_user_id)
 │    ├─→ properties (created_by_user_id)
 │    ├─→ deals (assigned_to_user_id)
 │    ├─→ leasing (assigned_to_user_id)
 │    ├─→ documents (created_by_user_id)
 │    ├─→ messages (created_by_user_id)
 │    └─→ events (actor_id)
 ├─→ contacts
 │    ├─→ contact_relationships
 │    └─→ deal_parties
 ├─→ companies
 │    ├─→ contact_relationships
 │    └─→ deal_parties
 ├─→ properties
 │    ├─→ units
 │    ├─→ deals
 │    └─→ leasing
 ├─→ deals
 │    ├─→ deal_parties
 │    ├─→ documents (entity_type='deal')
 │    └─→ message_threads (entity_type='deal')
 ├─→ leasing
 │    ├─→ deal_parties
 │    ├─→ documents (entity_type='lease')
 │    └─→ message_threads (entity_type='lease')
 ├─→ documents
 │    └─→ document_versions
 └─→ message_threads
      └─→ messages
```

---

## Role Hierarchy

```
admin              Full org access, manage users/settings
  ↓
tc                 Manage all deals, documents
  ↓
agent              Manage own deals, properties, contacts
  ↓
property_manager   Manage properties, leasing, units
  ↓
viewer             Read-only access
```

---

## Common Queries

### Get Current User's Org
```sql
SELECT org_id FROM public.users WHERE id = auth.uid();
-- Or use helper: auth.user_org_id()
```

### Check User Role
```sql
SELECT EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = auth.uid() AND role = 'admin'
);
-- Or use helper: auth.has_role('admin')
```

### List User's Deals
```sql
SELECT * FROM public.deals
WHERE org_id = auth.user_org_id()
  AND (assigned_to_user_id = auth.uid() OR auth.has_role('admin'));
```

### Get Deal with Full Context
```sql
SELECT
  d.*,
  p.address_line1,
  json_agg(DISTINCT dp) AS parties,
  json_agg(DISTINCT doc) AS documents
FROM public.deals d
LEFT JOIN public.properties p ON d.property_id = p.id
LEFT JOIN public.deal_parties dp ON d.id = dp.deal_id
LEFT JOIN public.documents doc ON doc.entity_type = 'deal' AND doc.entity_id = d.id
WHERE d.id = '{deal_id}'
GROUP BY d.id, p.id;
```

### Event Audit Trail
```sql
SELECT * FROM public.events
WHERE entity_type = 'deal' AND entity_id = '{deal_id}'
ORDER BY created_at DESC;
```

---

## API Patterns

### Supabase Client (TypeScript)
```typescript
// List with filter
const { data, error } = await supabase
  .from('contacts')
  .select('*')
  .eq('org_id', orgId)
  .eq('contact_type', 'buyer')
  .order('created_at', { ascending: false })
  .limit(50);

// Get with relationships
const { data, error } = await supabase
  .from('deals')
  .select('*, properties(*), deal_parties(*, contacts(*))')
  .eq('id', dealId)
  .single();

// Insert
const { data, error } = await supabase
  .from('contacts')
  .insert({
    org_id: orgId,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com'
  })
  .select()
  .single();

// Update
const { data, error } = await supabase
  .from('deals')
  .update({ stage: 'under_contract' })
  .eq('id', dealId)
  .select()
  .single();

// Realtime subscription
const subscription = supabase
  .channel('deals-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'deals',
    filter: `org_id=eq.${orgId}`
  }, (payload) => {
    console.log('Deal changed:', payload);
  })
  .subscribe();
```

---

## Migration Commands

### Local Development
```bash
# Start Supabase
supabase start

# Create new migration
supabase migration new migration_name

# Apply all migrations (reset DB)
supabase db reset

# Apply incrementally
supabase db push

# Check status
supabase migration list

# Generate TypeScript types
supabase gen types typescript --local > types/database.ts
```

### Production
```bash
# Link project
supabase link --project-ref {ref}

# Apply migrations
supabase db push --linked

# Or via Dashboard SQL Editor
```

---

## Security Checklist

- [ ] RLS enabled on all tables
- [ ] org_id filtered in all policies
- [ ] Service role key in env vars (not client)
- [ ] Events table UPDATE/DELETE blocked
- [ ] Test org isolation (no cross-org data leaks)
- [ ] Storage bucket policies configured
- [ ] Realtime filtered by org_id

---

## Performance Tips

- All foreign keys have indexes
- Use `.eq('org_id', orgId)` in all queries (uses index)
- Pagination with `.range(start, end)`
- Full-text search on contacts, properties, messages
- JSONB GIN indexes for custom_fields
- Monitor with Dashboard > Query Performance

---

## Common Enums

### User Roles
`admin`, `agent`, `tc`, `property_manager`, `viewer`

### Contact Types
`buyer`, `seller`, `tenant`, `landlord`, `vendor`, `agent`, `other`

### Property Types
`residential`, `commercial`, `industrial`, `land`, `mixed_use`

### Deal Stages
`lead`, `listing`, `under_contract`, `pending`, `closed`, `cancelled`

### Deal Types
`sale`, `purchase`, `listing`

### Lease Status
`draft`, `active`, `expired`, `terminated`

### Document Types
`contract`, `disclosure`, `inspection`, `photo`, `other`

### Event Types
`created`, `updated`, `deleted`, `status_changed`, `assigned`, `document_uploaded`, `message_sent`, `integration_sync`

---

## File Locations

```
d:/SkySlope/REIL-Q/02_DATA/
├── schema-design.md           Full schema documentation
├── rls-policies.md            RLS policy reference
├── api-routes.md              API endpoint guide
├── SPRINT_0.1_SUMMARY.md      Sprint summary
├── QUICK_REFERENCE.md         This file
└── migrations/
    ├── README.md              Migration guide
    ├── 00001_create_orgs.sql
    ├── 00002_create_users.sql
    ├── 00004_create_helper_functions.sql
    ├── 00017_create_events.sql
    ├── 00018_create_event_triggers.sql
    ├── 00019_create_updated_at_triggers.sql
    └── 00021_enable_rls_org_layer.sql
```

---

## Next Sprint (0.2)

Priority tasks:
1. Complete remaining 23 migration files
2. Deploy to local Supabase and test
3. Generate TypeScript types
4. Create seed data for development
5. Implement edge functions (document upload, etc.)

---

## Support

For questions or issues:
- Review schema-design.md for entity details
- Review rls-policies.md for security patterns
- Review api-routes.md for API examples
- Check migrations/README.md for deployment guides
