# REIL/Q Database Migrations

**Version:** 1.0.0
**Date:** 2025-12-31
**Owner:** SupabaseArchitect
**Status:** Sprint 0.1 - Initial Design

## Overview

This directory contains SQL migration files for the REIL/Q database schema. Migrations are executed in order and should be idempotent.

---

## Migration Order

Migrations **must** be executed in this order due to foreign key dependencies:

### Phase 1: Foundation (Organization Layer)
1. `00001_create_orgs.sql` - Organizations table
2. `00002_create_users.sql` - Users table (references orgs)
3. `00003_create_user_roles.sql` - User roles table
4. `00004_create_helper_functions.sql` - RLS helper functions

### Phase 2: Contacts Layer
5. `00005_create_contacts.sql` - Contacts table
6. `00006_create_companies.sql` - Companies table
7. `00007_create_contact_relationships.sql` - Contact-company relationships

### Phase 3: Property Layer
8. `00008_create_properties.sql` - Properties table
9. `00009_create_units.sql` - Units table (references properties)

### Phase 4: Transaction Layer
10. `00010_create_deals.sql` - Deals table (references properties)
11. `00011_create_leasing.sql` - Leasing table (references properties, units)
12. `00012_create_deal_parties.sql` - Deal parties (references deals, leasing, contacts)

### Phase 5: Document Layer
13. `00013_create_documents.sql` - Documents table
14. `00014_create_document_versions.sql` - Document versions (references documents)

### Phase 6: Communication Layer
15. `00015_create_message_threads.sql` - Message threads
16. `00016_create_messages.sql` - Messages (references message_threads)

### Phase 7: Event Layer (Audit)
17. `00017_create_events.sql` - Events table (append-only ledger)
18. `00018_create_event_triggers.sql` - Immutability enforcement triggers

### Phase 8: Triggers and Automation
19. `00019_create_updated_at_triggers.sql` - Auto-update updated_at for all tables
20. `00020_create_audit_triggers.sql` - (Optional) Auto-log events on entity changes

### Phase 9: RLS Policies
21. `00021_enable_rls_org_layer.sql` - RLS for orgs, users, user_roles
22. `00022_enable_rls_contact_layer.sql` - RLS for contacts, companies, relationships
23. `00023_enable_rls_property_layer.sql` - RLS for properties, units
24. `00024_enable_rls_transaction_layer.sql` - RLS for deals, leasing, deal_parties
25. `00025_enable_rls_document_layer.sql` - RLS for documents, document_versions
26. `00026_enable_rls_communication_layer.sql` - RLS for message_threads, messages
27. `00027_enable_rls_event_layer.sql` - RLS for events

### Phase 10: Indexes and Performance
28. `00028_create_indexes.sql` - Additional performance indexes
29. `00029_create_full_text_search.sql` - Full-text search indexes

### Phase 11: Seed Data (Development)
30. `00030_seed_development_data.sql` - Development seed data (optional)

---

## Migration File Template

Each migration file should follow this structure:

```sql
-- Migration: {number}_{name}
-- Description: {what this migration does}
-- Author: SupabaseArchitect
-- Date: 2025-12-31

-- ============================================
-- UP MIGRATION
-- ============================================

-- Create table with IF NOT EXISTS for idempotency
CREATE TABLE IF NOT EXISTS public.table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- ... columns
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_table_column ON public.table_name(column);

-- Add comments
COMMENT ON TABLE public.table_name IS 'Description';
COMMENT ON COLUMN public.table_name.column IS 'Description';

-- ============================================
-- DOWN MIGRATION (commented out, for reference)
-- ============================================

-- To rollback this migration, run:
-- DROP TABLE IF EXISTS public.table_name CASCADE;
```

---

## Running Migrations

### Local Development (Supabase CLI)

```bash
# Start local Supabase
supabase start

# Create new migration
supabase migration new migration_name

# Apply migrations
supabase db reset  # Reset and apply all migrations (dev only)

# Or apply incrementally
supabase db push

# Check migration status
supabase migration list
```

### Production Deployment

```bash
# Link to production project
supabase link --project-ref {project-ref}

# Apply migrations
supabase db push --linked

# Or via Dashboard:
# 1. Navigate to SQL Editor
# 2. Paste migration SQL
# 3. Execute
```

---

## Migration Best Practices

### 1. Idempotency
Always use `IF NOT EXISTS` / `IF EXISTS`:
```sql
CREATE TABLE IF NOT EXISTS public.table_name (...);
CREATE INDEX IF NOT EXISTS idx_name ON ...;
ALTER TABLE public.table_name ADD COLUMN IF NOT EXISTS column_name TEXT;
```

### 2. Reversibility
Include DOWN migration in comments for rollback reference:
```sql
-- DOWN MIGRATION:
-- DROP TABLE IF EXISTS public.table_name CASCADE;
-- DROP FUNCTION IF EXISTS function_name();
```

### 3. Dependencies
Ensure foreign keys reference existing tables. Follow migration order.

### 4. Data Safety
- Never drop tables with `CASCADE` in production without backup
- Use soft deletes instead of hard deletes
- Test migrations locally before deploying

### 5. Performance
- Create indexes CONCURRENTLY in production:
  ```sql
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_name ON ...;
  ```
- Avoid long-running migrations during peak hours

---

## Migration Checklist

Before deploying migration to production:

- [ ] Migration file numbered correctly
- [ ] Uses IF NOT EXISTS / IF EXISTS
- [ ] Foreign keys reference existing tables
- [ ] Indexes created for foreign keys
- [ ] Comments added for documentation
- [ ] DOWN migration documented
- [ ] Tested locally with `supabase db reset`
- [ ] No breaking changes without migration path
- [ ] RLS policies defined if creating new table
- [ ] Triggers created if needed (updated_at, etc.)

---

## Common Migration Patterns

### Adding a Column

```sql
-- Safe: allows NULL or has DEFAULT
ALTER TABLE public.table_name
  ADD COLUMN IF NOT EXISTS new_column TEXT DEFAULT 'default_value';

-- Backfill data if needed
UPDATE public.table_name SET new_column = 'value' WHERE new_column IS NULL;

-- Make NOT NULL after backfill
ALTER TABLE public.table_name
  ALTER COLUMN new_column SET NOT NULL;
```

### Renaming a Column

```sql
-- Safe: create new column, copy data, drop old
ALTER TABLE public.table_name
  ADD COLUMN IF NOT EXISTS new_name TEXT;

UPDATE public.table_name SET new_name = old_name;

-- After verifying app works:
ALTER TABLE public.table_name DROP COLUMN IF EXISTS old_name;
```

### Adding Foreign Key

```sql
-- Ensure referenced table exists first
ALTER TABLE public.child_table
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.parent_table(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_child_parent_id ON public.child_table(parent_id);
```

### Creating Trigger

```sql
-- Create trigger function
CREATE OR REPLACE FUNCTION trigger_function_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Logic
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger
DROP TRIGGER IF EXISTS trigger_name ON public.table_name;
CREATE TRIGGER trigger_name
  BEFORE INSERT OR UPDATE ON public.table_name
  FOR EACH ROW EXECUTE FUNCTION trigger_function_name();
```

---

## Rollback Procedures

### Development
```bash
# Reset to clean state
supabase db reset

# Or rollback specific migration
supabase migration repair --status reverted {version}
# Then manually run DOWN migration SQL
```

### Production
```sql
-- Run DOWN migration SQL manually via Dashboard
-- Example:
DROP TABLE IF EXISTS public.table_name CASCADE;

-- Update migration status
UPDATE supabase_migrations.schema_migrations
SET version = version - 1
WHERE version = {version_to_rollback};
```

**Warning:** Rollbacks can cause data loss. Always backup before rollback.

---

## Migration File Naming Convention

Format: `{number}_{description}.sql`

- **Number**: 5-digit zero-padded (00001, 00002, etc.)
- **Description**: Snake_case, descriptive (create_users, add_contact_tags, etc.)

Examples:
- `00001_create_orgs.sql`
- `00015_add_deals_commission_fields.sql`
- `00023_enable_rls_property_layer.sql`

---

## Testing Migrations

### Unit Test (Local)
```bash
# Start fresh
supabase db reset

# Verify all tables created
psql postgresql://postgres:postgres@localhost:54322/postgres -c "\dt public.*"

# Verify RLS enabled
psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';"

# Test with sample data
psql postgresql://postgres:postgres@localhost:54322/postgres -f test_data.sql
```

### Integration Test (Staging)
1. Deploy migrations to staging
2. Run application test suite
3. Verify no breaking changes
4. Test rollback procedure

---

## Migration Dependencies Graph

```
orgs
  ├── users
  │    ├── user_roles
  │    ├── contacts (created_by_user_id)
  │    ├── properties (created_by_user_id)
  │    ├── deals (assigned_to_user_id)
  │    └── events (actor_id)
  ├── contacts
  │    ├── contact_relationships
  │    └── deal_parties
  ├── companies
  │    ├── contact_relationships
  │    └── deal_parties
  ├── properties
  │    ├── units
  │    ├── deals
  │    └── leasing
  ├── deals
  │    ├── deal_parties
  │    ├── documents
  │    └── message_threads
  ├── leasing
  │    ├── deal_parties
  │    ├── documents
  │    └── message_threads
  ├── documents
  │    └── document_versions
  └── message_threads
       └── messages
```

---

## Next Steps

1. **Create migration SQL files** - Populate each migration with actual SQL
2. **Test locally** - Run `supabase db reset` and verify schema
3. **Generate types** - `supabase gen types typescript > types/database.ts`
4. **Deploy to staging** - `supabase db push --linked`
5. **Run integration tests** - Verify app works with new schema
6. **Deploy to production** - After approval

---

## Resources

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Supabase Migrations Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)

---

## Summary

This migration structure provides:
- **30 migration files** organized by layer
- **Clear dependencies** and execution order
- **Idempotent migrations** safe to re-run
- **Rollback procedures** for each phase
- **Best practices** for production deployment

**Migration files are templates** - populate with actual SQL from schema-design.md.
