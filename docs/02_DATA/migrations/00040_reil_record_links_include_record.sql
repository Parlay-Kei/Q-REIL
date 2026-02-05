-- Migration: 00040_reil_record_links_include_record
-- Ticket: PLATOPS-REIL-SUPABASE-SCHEMA-0003
-- Description: Allow target_type 'record' in record_links for canonical record linking
-- Dependencies: 00030_create_mail_tables.sql, 00036_reil_records.sql

ALTER TABLE public.record_links
  DROP CONSTRAINT IF EXISTS record_links_target_type_check;

ALTER TABLE public.record_links
  ADD CONSTRAINT record_links_target_type_check
  CHECK (target_type IN ('contact', 'company', 'deal', 'property', 'unit', 'leasing', 'record'));

COMMENT ON TABLE public.record_links IS 'REIL Core: many-to-many links (source document/message to target record/contact/etc)';
