# REIL/Q Row Level Security (RLS) Policies

**Version:** 1.0.0
**Date:** 2025-12-31
**Owner:** SupabaseArchitect
**Status:** Sprint 0.1 - Initial Design

## Overview

Row Level Security (RLS) is the **primary security mechanism** for REIL/Q. All tables have RLS enabled, and policies enforce:

1. **Organization Isolation**: Users can only access data from their organization
2. **Role-Based Access**: Different permissions for admin, agent, tc, property_manager, viewer
3. **Event Immutability**: Events table is append-only (enforced by triggers + RLS)

---

## RLS Principles

### 1. Defense in Depth
- RLS is enabled on ALL public tables
- Policies enforce org_id matching
- Policies check user roles for write operations
- Service role bypasses RLS (used only in secure backend functions)

### 2. Policy Structure
- **USING clause**: Controls which rows are visible (SELECT, UPDATE, DELETE)
- **WITH CHECK clause**: Controls which rows can be inserted/updated (INSERT, UPDATE)

### 3. Role Hierarchy
```
admin > tc > agent > property_manager > viewer
```

---

## Helper Functions

### Get Current User's Org ID

```sql
CREATE OR REPLACE FUNCTION auth.user_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

COMMENT ON FUNCTION auth.user_org_id IS 'Returns the org_id for the current authenticated user';
```

### Check User Role

```sql
CREATE OR REPLACE FUNCTION auth.has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = required_role
      AND deleted_at IS NULL
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

COMMENT ON FUNCTION auth.has_role IS 'Check if current user has a specific role';
```

### Check User Has Any Role

```sql
CREATE OR REPLACE FUNCTION auth.has_any_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = ANY(required_roles)
      AND deleted_at IS NULL
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

COMMENT ON FUNCTION auth.has_any_role IS 'Check if current user has any of the specified roles';
```

### Get User's Role Scope

```sql
CREATE OR REPLACE FUNCTION auth.user_role_scope(user_role TEXT)
RETURNS TEXT AS $$
  SELECT scope FROM public.user_roles
  WHERE user_id = auth.uid()
    AND role = user_role
    AND deleted_at IS NULL
  LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;
```

---

## 1. ORGANIZATION LAYER

### 1.1 orgs

```sql
-- Enable RLS
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;

-- Users can view their own org
CREATE POLICY "Users can view own org"
  ON public.orgs FOR SELECT
  USING (id = auth.user_org_id());

-- Admins can update their own org
CREATE POLICY "Admins can update own org"
  ON public.orgs FOR UPDATE
  USING (id = auth.user_org_id() AND auth.has_role('admin'))
  WITH CHECK (id = auth.user_org_id() AND auth.has_role('admin'));

-- Service role can do anything (backend only)
CREATE POLICY "Service role bypass"
  ON public.orgs FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
```

### 1.2 users

```sql
-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can view users in their org
CREATE POLICY "Users can view org members"
  ON public.users FOR SELECT
  USING (org_id = auth.user_org_id());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() AND
    org_id = auth.user_org_id() -- Prevent org_id change
  );

-- Admins can insert new users in their org
CREATE POLICY "Admins can insert users"
  ON public.users FOR INSERT
  WITH CHECK (
    org_id = auth.user_org_id() AND
    auth.has_role('admin')
  );

-- Admins can update users in their org
CREATE POLICY "Admins can update users"
  ON public.users FOR UPDATE
  USING (org_id = auth.user_org_id() AND auth.has_role('admin'))
  WITH CHECK (org_id = auth.user_org_id() AND auth.has_role('admin'));

-- Admins can soft-delete users in their org
CREATE POLICY "Admins can delete users"
  ON public.users FOR UPDATE -- Soft delete via UPDATE
  USING (org_id = auth.user_org_id() AND auth.has_role('admin'))
  WITH CHECK (org_id = auth.user_org_id() AND auth.has_role('admin'));

-- Service role bypass
CREATE POLICY "Service role bypass"
  ON public.users FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
```

### 1.3 user_roles

```sql
-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can view roles in their org
CREATE POLICY "Users can view org roles"
  ON public.user_roles FOR SELECT
  USING (org_id = auth.user_org_id());

-- Admins can manage roles in their org
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (org_id = auth.user_org_id() AND auth.has_role('admin'))
  WITH CHECK (org_id = auth.user_org_id() AND auth.has_role('admin'));

-- Service role bypass
CREATE POLICY "Service role bypass"
  ON public.user_roles FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
```

---

## 2. CONTACT LAYER

### 2.1 contacts

```sql
-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Users can view contacts in their org
CREATE POLICY "Users can view org contacts"
  ON public.contacts FOR SELECT
  USING (org_id = auth.user_org_id());

-- Users can create contacts in their org
CREATE POLICY "Users can create contacts"
  ON public.contacts FOR INSERT
  WITH CHECK (org_id = auth.user_org_id());

-- Users can update contacts in their org
CREATE POLICY "Users can update org contacts"
  ON public.contacts FOR UPDATE
  USING (org_id = auth.user_org_id())
  WITH CHECK (org_id = auth.user_org_id());

-- Only admins can delete contacts
CREATE POLICY "Admins can delete contacts"
  ON public.contacts FOR DELETE
  USING (org_id = auth.user_org_id() AND auth.has_role('admin'));

-- Service role bypass
CREATE POLICY "Service role bypass"
  ON public.contacts FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
```

### 2.2 companies

Same policies as `contacts`:

```sql
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org companies"
  ON public.companies FOR SELECT
  USING (org_id = auth.user_org_id());

CREATE POLICY "Users can create companies"
  ON public.companies FOR INSERT
  WITH CHECK (org_id = auth.user_org_id());

CREATE POLICY "Users can update org companies"
  ON public.companies FOR UPDATE
  USING (org_id = auth.user_org_id())
  WITH CHECK (org_id = auth.user_org_id());

CREATE POLICY "Admins can delete companies"
  ON public.companies FOR DELETE
  USING (org_id = auth.user_org_id() AND auth.has_role('admin'));

CREATE POLICY "Service role bypass"
  ON public.companies FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
```

### 2.3 contact_relationships

Same policies as `contacts`:

```sql
ALTER TABLE public.contact_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org relationships"
  ON public.contact_relationships FOR SELECT
  USING (org_id = auth.user_org_id());

CREATE POLICY "Users can create relationships"
  ON public.contact_relationships FOR INSERT
  WITH CHECK (org_id = auth.user_org_id());

CREATE POLICY "Users can update org relationships"
  ON public.contact_relationships FOR UPDATE
  USING (org_id = auth.user_org_id())
  WITH CHECK (org_id = auth.user_org_id());

CREATE POLICY "Admins can delete relationships"
  ON public.contact_relationships FOR DELETE
  USING (org_id = auth.user_org_id() AND auth.has_role('admin'));

CREATE POLICY "Service role bypass"
  ON public.contact_relationships FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
```

---

## 3. PROPERTY LAYER

### 3.1 properties

```sql
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org properties"
  ON public.properties FOR SELECT
  USING (org_id = auth.user_org_id());

CREATE POLICY "Users can create properties"
  ON public.properties FOR INSERT
  WITH CHECK (org_id = auth.user_org_id());

CREATE POLICY "Users can update org properties"
  ON public.properties FOR UPDATE
  USING (org_id = auth.user_org_id())
  WITH CHECK (org_id = auth.user_org_id());

CREATE POLICY "Admins can delete properties"
  ON public.properties FOR DELETE
  USING (org_id = auth.user_org_id() AND auth.has_role('admin'));

CREATE POLICY "Service role bypass"
  ON public.properties FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
```

### 3.2 units

Same policies as `properties`:

```sql
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org units"
  ON public.units FOR SELECT
  USING (org_id = auth.user_org_id());

CREATE POLICY "Users can create units"
  ON public.units FOR INSERT
  WITH CHECK (org_id = auth.user_org_id());

CREATE POLICY "Users can update org units"
  ON public.units FOR UPDATE
  USING (org_id = auth.user_org_id())
  WITH CHECK (org_id = auth.user_org_id());

CREATE POLICY "Admins can delete units"
  ON public.units FOR DELETE
  USING (org_id = auth.user_org_id() AND auth.has_role('admin'));

CREATE POLICY "Service role bypass"
  ON public.units FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
```

---

## 4. TRANSACTION LAYER

### 4.1 deals

**More restrictive policies based on roles:**

```sql
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- All users can view deals in their org
CREATE POLICY "Users can view org deals"
  ON public.deals FOR SELECT
  USING (org_id = auth.user_org_id());

-- Agents can create deals in their org
CREATE POLICY "Agents can create deals"
  ON public.deals FOR INSERT
  WITH CHECK (
    org_id = auth.user_org_id() AND
    auth.has_any_role(ARRAY['admin', 'agent', 'tc'])
  );

-- Users can update deals they're assigned to
CREATE POLICY "Users can update assigned deals"
  ON public.deals FOR UPDATE
  USING (
    org_id = auth.user_org_id() AND
    (
      assigned_to_user_id = auth.uid() OR
      auth.has_any_role(ARRAY['admin', 'tc'])
    )
  )
  WITH CHECK (
    org_id = auth.user_org_id() AND
    (
      assigned_to_user_id = auth.uid() OR
      auth.has_any_role(ARRAY['admin', 'tc'])
    )
  );

-- Only admins can delete deals
CREATE POLICY "Admins can delete deals"
  ON public.deals FOR DELETE
  USING (org_id = auth.user_org_id() AND auth.has_role('admin'));

-- Service role bypass
CREATE POLICY "Service role bypass"
  ON public.deals FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
```

### 4.2 leasing

Same policies as `deals`:

```sql
ALTER TABLE public.leasing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org leases"
  ON public.leasing FOR SELECT
  USING (org_id = auth.user_org_id());

CREATE POLICY "Property managers can create leases"
  ON public.leasing FOR INSERT
  WITH CHECK (
    org_id = auth.user_org_id() AND
    auth.has_any_role(ARRAY['admin', 'property_manager', 'agent'])
  );

CREATE POLICY "Users can update assigned leases"
  ON public.leasing FOR UPDATE
  USING (
    org_id = auth.user_org_id() AND
    (
      assigned_to_user_id = auth.uid() OR
      auth.has_any_role(ARRAY['admin', 'property_manager'])
    )
  )
  WITH CHECK (
    org_id = auth.user_org_id() AND
    (
      assigned_to_user_id = auth.uid() OR
      auth.has_any_role(ARRAY['admin', 'property_manager'])
    )
  );

CREATE POLICY "Admins can delete leases"
  ON public.leasing FOR DELETE
  USING (org_id = auth.user_org_id() AND auth.has_role('admin'));

CREATE POLICY "Service role bypass"
  ON public.leasing FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
```

### 4.3 deal_parties

```sql
ALTER TABLE public.deal_parties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org deal parties"
  ON public.deal_parties FOR SELECT
  USING (org_id = auth.user_org_id());

CREATE POLICY "Users can manage deal parties"
  ON public.deal_parties FOR ALL
  USING (org_id = auth.user_org_id())
  WITH CHECK (org_id = auth.user_org_id());

CREATE POLICY "Service role bypass"
  ON public.deal_parties FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
```

---

## 5. DOCUMENT LAYER

### 5.1 documents

```sql
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Users can view documents in their org
CREATE POLICY "Users can view org documents"
  ON public.documents FOR SELECT
  USING (org_id = auth.user_org_id());

-- Users can upload documents
CREATE POLICY "Users can upload documents"
  ON public.documents FOR INSERT
  WITH CHECK (org_id = auth.user_org_id());

-- Users can update their own documents
CREATE POLICY "Users can update own documents"
  ON public.documents FOR UPDATE
  USING (
    org_id = auth.user_org_id() AND
    (created_by_user_id = auth.uid() OR auth.has_any_role(ARRAY['admin', 'tc']))
  )
  WITH CHECK (
    org_id = auth.user_org_id() AND
    (created_by_user_id = auth.uid() OR auth.has_any_role(ARRAY['admin', 'tc']))
  );

-- Users can delete their own documents, admins can delete any
CREATE POLICY "Users can delete own documents"
  ON public.documents FOR DELETE
  USING (
    org_id = auth.user_org_id() AND
    (created_by_user_id = auth.uid() OR auth.has_role('admin'))
  );

-- Service role bypass
CREATE POLICY "Service role bypass"
  ON public.documents FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
```

### 5.2 document_versions

```sql
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

-- Users can view document versions in their org
CREATE POLICY "Users can view org document versions"
  ON public.document_versions FOR SELECT
  USING (org_id = auth.user_org_id());

-- System creates versions (via service role)
CREATE POLICY "Service role bypass"
  ON public.document_versions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
```

---

## 6. COMMUNICATION LAYER

### 6.1 message_threads

```sql
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;

-- Users can view threads they participate in
CREATE POLICY "Users can view participating threads"
  ON public.message_threads FOR SELECT
  USING (
    org_id = auth.user_org_id() AND
    (
      auth.uid() = ANY(participant_user_ids) OR
      auth.has_role('admin')
    )
  );

-- Users can create threads
CREATE POLICY "Users can create threads"
  ON public.message_threads FOR INSERT
  WITH CHECK (
    org_id = auth.user_org_id() AND
    auth.uid() = ANY(participant_user_ids)
  );

-- Participants can update threads
CREATE POLICY "Participants can update threads"
  ON public.message_threads FOR UPDATE
  USING (
    org_id = auth.user_org_id() AND
    (auth.uid() = ANY(participant_user_ids) OR auth.has_role('admin'))
  )
  WITH CHECK (
    org_id = auth.user_org_id() AND
    (auth.uid() = ANY(participant_user_ids) OR auth.has_role('admin'))
  );

-- Service role bypass
CREATE POLICY "Service role bypass"
  ON public.message_threads FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
```

### 6.2 messages

```sql
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages in their org
CREATE POLICY "Users can view org messages"
  ON public.messages FOR SELECT
  USING (org_id = auth.user_org_id());

-- Users can create messages
CREATE POLICY "Users can create messages"
  ON public.messages FOR INSERT
  WITH CHECK (org_id = auth.user_org_id());

-- Users can update their own messages
CREATE POLICY "Users can update own messages"
  ON public.messages FOR UPDATE
  USING (
    org_id = auth.user_org_id() AND
    created_by_user_id = auth.uid()
  )
  WITH CHECK (
    org_id = auth.user_org_id() AND
    created_by_user_id = auth.uid()
  );

-- Service role bypass
CREATE POLICY "Service role bypass"
  ON public.messages FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
```

---

## 7. EVENT LAYER

### 7.1 events

**CRITICAL: Append-only table. No UPDATE or DELETE allowed.**

```sql
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Users can view events for entities they have access to
CREATE POLICY "Users can view org events"
  ON public.events FOR SELECT
  USING (org_id = auth.user_org_id());

-- Users can insert events (audit trail)
CREATE POLICY "Users can insert events"
  ON public.events FOR INSERT
  WITH CHECK (org_id = auth.user_org_id());

-- NO UPDATE POLICY (handled by triggers)
-- NO DELETE POLICY (handled by triggers)

-- Service role can INSERT (for system events)
CREATE POLICY "Service role can insert events"
  ON public.events FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Service role can SELECT (for audits/reporting)
CREATE POLICY "Service role can view events"
  ON public.events FOR SELECT
  USING (auth.jwt() ->> 'role' = 'service_role');
```

**Note:** UPDATE and DELETE are prevented by triggers (see schema-design.md), but we don't create RLS policies for them either.

---

## 8. TESTING RLS POLICIES

### Test Setup

```sql
-- Create test org
INSERT INTO public.orgs (id, name, slug) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Test Org 1', 'test-org-1');

-- Create test users
INSERT INTO public.users (id, org_id, email, full_name) VALUES
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'admin@test.com', 'Admin User'),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'agent@test.com', 'Agent User');

-- Assign roles
INSERT INTO public.user_roles (user_id, org_id, role) VALUES
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'admin'),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'agent');
```

### Test Queries

```sql
-- Set user context
SET LOCAL app.current_user_id = '22222222-2222-2222-2222-222222222222';
SET LOCAL request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

-- Test SELECT
SELECT * FROM public.contacts; -- Should see only org's contacts

-- Test INSERT
INSERT INTO public.contacts (org_id, first_name, last_name, email)
VALUES (auth.user_org_id(), 'John', 'Doe', 'john@example.com');

-- Test UPDATE
UPDATE public.contacts SET phone = '555-1234' WHERE id = '...';

-- Test DELETE (should fail for non-admin)
DELETE FROM public.contacts WHERE id = '...';
```

---

## 9. SECURITY CHECKLIST

Before production deployment:

- [ ] RLS enabled on ALL public tables
- [ ] Helper functions created and tested
- [ ] All policies cover SELECT, INSERT, UPDATE, DELETE
- [ ] Service role policies exist for backend operations
- [ ] Events table is truly append-only (test UPDATE/DELETE rejection)
- [ ] No anon key in client code for sensitive operations
- [ ] Service role key stored securely (environment variables)
- [ ] Storage bucket policies configured
- [ ] Realtime subscriptions filtered by org_id
- [ ] Test multi-tenant isolation (User A can't see User B's org data)

---

## 10. PERFORMANCE CONSIDERATIONS

### Index org_id for RLS

All RLS policies check `org_id = auth.user_org_id()`. Ensure indexes exist:

```sql
-- Already created in schema-design.md, but verify:
CREATE INDEX IF NOT EXISTS idx_{table}_org_id ON public.{table}(org_id);
```

### Monitor RLS Query Plans

```sql
EXPLAIN ANALYZE
SELECT * FROM public.contacts WHERE org_id = auth.user_org_id();
```

If slow, consider:
- Partitioning large tables by org_id
- Materialized views for reporting
- Cached function results

---

## Summary

This RLS policy set provides:
- **Org isolation**: Users only see their org's data
- **Role-based access**: Admin, agent, tc, property_manager, viewer roles
- **Immutable audit**: Events table append-only
- **Granular control**: Deal assignment, document ownership
- **Defense in depth**: Multiple layers of security checks

**Next Steps:**
1. Implement helper functions
2. Apply RLS policies in migrations
3. Test with multiple users/orgs
4. Generate TypeScript types with RLS-aware queries
