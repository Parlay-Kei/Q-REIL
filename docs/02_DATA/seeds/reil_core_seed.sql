-- REIL Core seed fixtures (Lane 2)
-- Idempotent: safe to run multiple times (ON CONFLICT DO NOTHING).
-- Prerequisite: migrations 00001–00040 applied (orgs, users optional, deals, records, source_items_*, ledger_events, record_links with target_type 'record').

-- Seed org (used as VITE_REIL_ORG_ID in UI)
INSERT INTO public.orgs (id, name, slug, settings, subscription_tier, subscription_status, max_users)
VALUES (
  'a0000000-0000-4000-8000-000000000001'::uuid,
  'REIL Seed Org',
  'reil-seed',
  '{}',
  'free',
  'active',
  5
)
ON CONFLICT (id) DO NOTHING;

-- Seed deals (required for records.record_type_id)
INSERT INTO public.deals (id, org_id, name)
VALUES
  ('b0000000-0000-4000-8000-000000000002'::uuid, 'a0000000-0000-4000-8000-000000000001'::uuid, 'Q3 Investment Proposal'),
  ('b0000000-0000-4000-8000-000000000003'::uuid, 'a0000000-0000-4000-8000-000000000001'::uuid, 'Apex Holdings Due Diligence')
ON CONFLICT (id) DO NOTHING;

-- Seed records (canonical record container; record_type_id = deal.id)
INSERT INTO public.records (id, org_id, record_type, record_type_id, title, status)
VALUES
  ('c0000000-0000-4000-8000-000000000010'::uuid, 'a0000000-0000-4000-8000-000000000001'::uuid, 'deal', 'b0000000-0000-4000-8000-000000000002'::uuid, 'Q3 Investment Proposal', 'active'),
  ('c0000000-0000-4000-8000-000000000011'::uuid, 'a0000000-0000-4000-8000-000000000001'::uuid, 'deal', 'b0000000-0000-4000-8000-000000000003'::uuid, 'Apex Holdings Due Diligence', 'active')
ON CONFLICT (id) DO NOTHING;

-- Seed source_items_raw (payload shape matches reilInboxApi / listRawItemsWithNormalizedStatus)
INSERT INTO public.source_items_raw (id, org_id, idempotency_key, source_type, payload)
VALUES
  (
    'd0000000-0000-4000-8000-000000000001'::uuid,
    'a0000000-0000-4000-8000-000000000001'::uuid,
    'gmail:seed-msg-001',
    'gmail',
    '{"subject":"RE: Q3 Investment Proposal - Final Review","from":"james@meridiancp.com","from_name":"James Wilson","snippet":"Following up on our discussion about the investment terms...","attachment_count":2,"created_at":"2026-02-01T10:00:00Z"}'::jsonb
  ),
  (
    'd0000000-0000-4000-8000-000000000002'::uuid,
    'a0000000-0000-4000-8000-000000000001'::uuid,
    'gmail:seed-msg-002',
    'gmail',
    '{"subject":"Due Diligence Documents - Apex Holdings","from":"sarah@apexholdings.com","from_name":"Sarah Chen","snippet":"Please find attached the requested financial statements...","attachment_count":1,"created_at":"2026-02-01T09:00:00Z"}'::jsonb
  ),
  (
    'd0000000-0000-4000-8000-000000000003'::uuid,
    'a0000000-0000-4000-8000-000000000001'::uuid,
    'gmail:seed-msg-003',
    'gmail',
    '{"subject":"Contract Review - Urgent","from":"mtorres@pinnacle.io","from_name":"Michael Torres","snippet":"Our legal team has reviewed the contract...","attachment_count":0,"created_at":"2026-01-31T14:00:00Z"}'::jsonb
  )
ON CONFLICT (org_id, idempotency_key) DO NOTHING;

-- Seed source_items_normalized (same idempotency_key as raw for join)
INSERT INTO public.source_items_normalized (id, org_id, idempotency_key, source_type, normalized_type, payload)
VALUES
  (
    'e0000000-0000-4000-8000-000000000001'::uuid,
    'a0000000-0000-4000-8000-000000000001'::uuid,
    'gmail:seed-msg-001',
    'gmail',
    'message',
    '{"match_confidence":0.9,"review_required":false}'::jsonb
  ),
  (
    'e0000000-0000-4000-8000-000000000002'::uuid,
    'a0000000-0000-4000-8000-000000000001'::uuid,
    'gmail:seed-msg-002',
    'gmail',
    'message',
    '{"match_confidence":0.85,"review_required":true}'::jsonb
  ),
  (
    'e0000000-0000-4000-8000-000000000003'::uuid,
    'a0000000-0000-4000-8000-000000000001'::uuid,
    'gmail:seed-msg-003',
    'gmail',
    'message',
    '{"match_confidence":0.7,"review_required":true}'::jsonb
  )
ON CONFLICT (org_id, idempotency_key) DO NOTHING;

-- Seed ledger_events (append-only; fixed IDs for idempotent rerun)
INSERT INTO public.ledger_events (id, org_id, event_type, entity_type, entity_id, payload)
VALUES
  ('f0000000-0000-4000-8000-000000000001'::uuid, 'a0000000-0000-4000-8000-000000000001'::uuid, 'record.created', 'record', 'c0000000-0000-4000-8000-000000000010'::uuid, '{"title":"Q3 Investment Proposal"}'::jsonb),
  ('f0000000-0000-4000-8000-000000000002'::uuid, 'a0000000-0000-4000-8000-000000000001'::uuid, 'record.created', 'record', 'c0000000-0000-4000-8000-000000000011'::uuid, '{"title":"Apex Holdings Due Diligence"}'::jsonb),
  ('f0000000-0000-4000-8000-000000000003'::uuid, 'a0000000-0000-4000-8000-000000000001'::uuid, 'record.updated', 'record', 'c0000000-0000-4000-8000-000000000010'::uuid, '{"action":"status_check"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Seed one record_link: raw item d...001 linked to record c...010 (message -> record)
INSERT INTO public.record_links (id, org_id, source_type, source_id, target_type, target_id, link_method)
VALUES (
  '90000000-0000-4000-8000-000000000001'::uuid,
  'a0000000-0000-4000-8000-000000000001'::uuid,
  'message',
  'd0000000-0000-4000-8000-000000000001'::uuid,
  'record',
  'c0000000-0000-4000-8000-000000000010'::uuid,
  'manual'
)
ON CONFLICT (source_type, source_id, target_type, target_id) DO NOTHING;
