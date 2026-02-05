/**
 * REIL Core Data Access Layer (ENGDEL-REIL-DATA-ACCESS-LAYER-0004).
 * Typed primitives: raw item, normalized item, record, ledger event, document link, search.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  SourceItemRawRow,
  SourceItemNormalizedRow,
  RecordRow,
  RecordLinkRow,
  LedgerEventRow,
  DocumentRow,
  InsertSourceItemRaw,
  UpsertSourceItemNormalized,
  InsertRecord,
  InsertLedgerEvent,
  InsertRecordLink,
} from '../types/reil-core';

export type DalClient = SupabaseClient | null;

export type DalResult<T> = { data: T; error: null } | { data: null; error: Error };

function err<E extends Error>(e: E): { data: null; error: E } {
  return { data: null, error: e };
}

function ok<T>(data: T): { data: T; error: null } {
  return { data, error: null };
}

/**
 * Create a raw source item (append-only; idempotency key unique per org).
 * On conflict (org_id, idempotency_key), returns existing row id if desired or error.
 */
export async function createRawItem(
  client: DalClient,
  orgId: string,
  idempotencyKey: string,
  sourceType: string,
  payload: Record<string, unknown>
): Promise<DalResult<{ id: string }>> {
  if (!client) return err(new Error('Supabase client not configured'));
  const row: InsertSourceItemRaw = {
    org_id: orgId,
    idempotency_key: idempotencyKey,
    source_type: sourceType,
    payload: payload ?? {},
  };
  const { data, error } = await client
    .from('source_items_raw')
    .insert(row)
    .select('id')
    .single();
  if (error) return err(new Error(error.message));
  return ok({ id: (data as { id: string }).id });
}

/**
 * Upsert a normalized source item by (org_id, idempotency_key).
 */
export async function upsertNormalizedItem(
  client: DalClient,
  orgId: string,
  idempotencyKey: string,
  sourceType: string,
  normalizedType: string,
  payload: Record<string, unknown>
): Promise<DalResult<SourceItemNormalizedRow>> {
  if (!client) return err(new Error('Supabase client not configured'));
  const row: UpsertSourceItemNormalized = {
    org_id: orgId,
    idempotency_key: idempotencyKey,
    source_type: sourceType,
    normalized_type: normalizedType,
    payload: payload ?? {},
  };
  const { data, error } = await client
    .from('source_items_normalized')
    .upsert(row, { onConflict: 'org_id,idempotency_key' })
    .select()
    .single();
  if (error) return err(new Error(error.message));
  return ok(data as SourceItemNormalizedRow);
}

/**
 * Create a canonical record (property or deal container).
 */
export async function createRecord(
  client: DalClient,
  orgId: string,
  recordType: 'property' | 'deal',
  recordTypeId: string,
  title: string,
  opts?: { status?: string; ownerId?: string | null; tags?: string[] }
): Promise<DalResult<RecordRow>> {
  if (!client) return err(new Error('Supabase client not configured'));
  const row: InsertRecord = {
    org_id: orgId,
    record_type: recordType,
    record_type_id: recordTypeId,
    title,
    status: opts?.status ?? 'active',
    owner_id: opts?.ownerId ?? null,
    tags: opts?.tags ?? [],
  };
  const { data, error } = await client.from('records').insert(row).select().single();
  if (error) return err(new Error(error.message));
  return ok(data as RecordRow);
}

/**
 * Append a ledger event (append-only).
 */
export async function appendLedgerEvent(
  client: DalClient,
  orgId: string,
  eventType: string,
  entityType: string,
  entityId: string,
  opts?: { actorId?: string | null; actorType?: string; payload?: Record<string, unknown>; correlationId?: string | null }
): Promise<DalResult<{ id: string }>> {
  if (!client) return err(new Error('Supabase client not configured'));
  const row: InsertLedgerEvent = {
    org_id: orgId,
    actor_id: opts?.actorId ?? null,
    actor_type: opts?.actorType ?? 'user',
    event_type: eventType,
    entity_type: entityType,
    entity_id: entityId,
    payload: opts?.payload ?? {},
    correlation_id: opts?.correlationId ?? null,
  };
  const { data, error } = await client
    .from('ledger_events')
    .insert(row)
    .select('id')
    .single();
  if (error) return err(new Error(error.message));
  return ok({ id: (data as { id: string }).id });
}

/**
 * Link a document to a record (many-to-many via record_links).
 */
export async function linkDocumentToRecord(
  client: DalClient,
  orgId: string,
  documentId: string,
  recordId: string,
  linkMethod: 'rule' | 'manual' | 'system',
  opts?: { linkedBy?: string | null }
): Promise<DalResult<{ id: string }>> {
  if (!client) return err(new Error('Supabase client not configured'));
  const row: InsertRecordLink = {
    org_id: orgId,
    source_type: 'document',
    source_id: documentId,
    target_type: 'record',
    target_id: recordId,
    link_method: linkMethod,
    linked_by: opts?.linkedBy ?? null,
  };
  const { data, error } = await client
    .from('record_links')
    .insert(row)
    .select('id')
    .single();
  if (error) return err(new Error(error.message));
  return ok({ id: (data as { id: string }).id });
}

/**
 * Search records by key fields: title (ilike), status, record_type, owner_id, tags.
 */
export async function searchRecordsByKeyFields(
  client: DalClient,
  orgId: string,
  opts?: {
    titleContains?: string;
    status?: string;
    recordType?: 'property' | 'deal';
    ownerId?: string | null;
    tag?: string;
    limit?: number;
  }
): Promise<DalResult<RecordRow[]>> {
  if (!client) return err(new Error('Supabase client not configured'));
  let q = client.from('records').select('*').eq('org_id', orgId);
  if (opts?.titleContains) q = q.ilike('title', `%${opts.titleContains}%`);
  if (opts?.status) q = q.eq('status', opts.status);
  if (opts?.recordType) q = q.eq('record_type', opts.recordType);
  if (opts?.ownerId !== undefined) q = opts.ownerId === null ? q.is('owner_id', null) : q.eq('owner_id', opts.ownerId);
  if (opts?.tag) q = q.contains('tags', [opts.tag]);
  q = q.order('updated_at', { ascending: false }).limit(opts?.limit ?? 100);
  const { data, error } = await q;
  if (error) return err(new Error(error.message));
  return ok((data ?? []) as RecordRow[]);
}

/**
 * Get a single record by id.
 */
export async function getRecordById(
  client: DalClient,
  orgId: string,
  recordId: string
): Promise<DalResult<RecordRow>> {
  if (!client) return err(new Error('Supabase client not configured'));
  const { data, error } = await client
    .from('records')
    .select('*')
    .eq('org_id', orgId)
    .eq('id', recordId)
    .single();
  if (error) return err(new Error(error.message));
  return ok(data as RecordRow);
}

/**
 * List ledger events for an entity (e.g. entity_type='record', entity_id=recordId), ordered by created_at desc.
 */
export async function getLedgerEventsForEntity(
  client: DalClient,
  orgId: string,
  entityType: string,
  entityId: string,
  opts?: { limit?: number }
): Promise<DalResult<LedgerEventRow[]>> {
  if (!client) return err(new Error('Supabase client not configured'));
  const { data, error } = await client
    .from('ledger_events')
    .select('*')
    .eq('org_id', orgId)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })
    .limit(opts?.limit ?? 100);
  if (error) return err(new Error(error.message));
  return ok((data ?? []) as LedgerEventRow[]);
}

/**
 * Get record_links where target is this record (attached docs, linked contacts).
 */
export async function getRecordLinksForRecord(
  client: DalClient,
  orgId: string,
  recordId: string
): Promise<DalResult<RecordLinkRow[]>> {
  if (!client) return err(new Error('Supabase client not configured'));
  const { data, error } = await client
    .from('record_links')
    .select('*')
    .eq('org_id', orgId)
    .eq('target_type', 'record')
    .eq('target_id', recordId)
    .order('linked_at', { ascending: false });
  if (error) return err(new Error(error.message));
  return ok((data ?? []) as RecordLinkRow[]);
}

/**
 * Get record_links by source (e.g. source_type='message', source_id=raw item id).
 * Returns links keyed by source_id for Inbox list join.
 */
export async function getRecordLinksBySource(
  client: DalClient,
  orgId: string,
  sourceType: string,
  sourceIds: string[]
): Promise<DalResult<RecordLinkRow[]>> {
  if (!client) return err(new Error('Supabase client not configured'));
  if (sourceIds.length === 0) return ok([]);
  const { data, error } = await client
    .from('record_links')
    .select('*')
    .eq('org_id', orgId)
    .eq('source_type', sourceType)
    .in('source_id', sourceIds)
    .order('linked_at', { ascending: false });
  if (error) return err(new Error(error.message));
  return ok((data ?? []) as RecordLinkRow[]);
}

/**
 * Link a source item (e.g. message/raw item) to a record; upserts record_links and appends ledger event (record_linked).
 */
export async function linkSourceItemToRecord(
  client: DalClient,
  orgId: string,
  sourceType: string,
  sourceId: string,
  recordId: string,
  linkMethod: 'rule' | 'manual' | 'system',
  opts?: { linkedBy?: string | null }
): Promise<DalResult<{ linkId: string; eventId: string }>> {
  if (!client) return err(new Error('Supabase client not configured'));
  const row: InsertRecordLink = {
    org_id: orgId,
    source_type: sourceType,
    source_id: sourceId,
    target_type: 'record',
    target_id: recordId,
    link_method: linkMethod,
    linked_by: opts?.linkedBy ?? null,
  };
  const { data: linkData, error: linkErr } = await client
    .from('record_links')
    .upsert(row, { onConflict: 'source_type,source_id,target_type,target_id' })
    .select('id')
    .single();
  if (linkErr) return err(new Error(linkErr.message));
  const linkId = (linkData as { id: string }).id;
  const eventResult = await appendLedgerEvent(
    client,
    orgId,
    'record_linked',
    'record',
    recordId,
    { payload: { source_type: sourceType, source_id: sourceId }, actorType: 'user' }
  );
  if (eventResult.error) return err(eventResult.error);
  return ok({ linkId, eventId: eventResult.data!.id });
}

/**
 * List raw items with normalized status for Inbox. Filters: sender (payload), date range (created_at), source_type, review_required (payload).
 */
export async function listRawItemsWithNormalizedStatus(
  client: DalClient,
  orgId: string,
  opts?: {
    senderContains?: string;
    dateFrom?: string;
    dateTo?: string;
    sourceType?: string;
    reviewRequired?: boolean;
    limit?: number;
  }
): Promise<
  DalResult<
    { raw: SourceItemRawRow; normalized: SourceItemNormalizedRow | null }[]
  >
> {
  if (!client) return err(new Error('Supabase client not configured'));
  let rawQ = client
    .from('source_items_raw')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(opts?.limit ?? 100);
  if (opts?.sourceType) rawQ = rawQ.eq('source_type', opts.sourceType);
  if (opts?.dateFrom) rawQ = rawQ.gte('created_at', opts.dateFrom);
  if (opts?.dateTo) rawQ = rawQ.lte('created_at', opts.dateTo);
  const { data: rawRows, error: rawErr } = await rawQ;
  if (rawErr) return err(new Error(rawErr.message));
  const rawList = (rawRows ?? []) as SourceItemRawRow[];
  if (rawList.length === 0) return ok([]);
  const keys = rawList.map((r) => r.idempotency_key);
  const { data: normRows } = await client
    .from('source_items_normalized')
    .select('*')
    .eq('org_id', orgId)
    .in('idempotency_key', keys);
  const normByKey: Record<string, SourceItemNormalizedRow> = {};
  ((normRows ?? []) as SourceItemNormalizedRow[]).forEach((n) => {
    normByKey[n.idempotency_key] = n;
  });
  const combined = rawList.map((raw) => ({
    raw,
    normalized: normByKey[raw.idempotency_key] ?? null,
  }));
  let filtered = combined;
  if (opts?.senderContains) {
    const s = opts.senderContains.toLowerCase();
    filtered = filtered.filter(({ raw }) => {
      const from = (raw.payload?.from as string) ?? (raw.payload?.from_email as string) ?? '';
      return String(from).toLowerCase().includes(s);
    });
  }
  if (opts?.reviewRequired === true) {
    filtered = filtered.filter(({ raw }) => (raw.payload?.review_required as boolean) === true);
  }
  return ok(filtered);
}

/**
 * Get one raw item by id.
 */
export async function getRawItemById(
  client: DalClient,
  orgId: string,
  rawId: string
): Promise<DalResult<SourceItemRawRow>> {
  if (!client) return err(new Error('Supabase client not configured'));
  const { data, error } = await client
    .from('source_items_raw')
    .select('*')
    .eq('org_id', orgId)
    .eq('id', rawId)
    .single();
  if (error) return err(new Error(error.message));
  return ok(data as SourceItemRawRow);
}

/**
 * Get normalized item by idempotency key (optional, for detail view).
 */
export async function getNormalizedItemByKey(
  client: DalClient,
  orgId: string,
  idempotencyKey: string
): Promise<DalResult<SourceItemNormalizedRow | null>> {
  if (!client) return err(new Error('Supabase client not configured'));
  const { data, error } = await client
    .from('source_items_normalized')
    .select('*')
    .eq('org_id', orgId)
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();
  if (error) return err(new Error(error.message));
  return ok(data as SourceItemNormalizedRow | null);
}

/**
 * Get a single document by id.
 */
export async function getDocumentById(
  client: DalClient,
  orgId: string,
  documentId: string
): Promise<DalResult<DocumentRow | null>> {
  if (!client) return err(new Error('Supabase client not configured'));
  const { data, error } = await client
    .from('documents')
    .select('*')
    .eq('org_id', orgId)
    .eq('id', documentId)
    .maybeSingle();
  if (error) return err(new Error(error.message));
  return ok(data as DocumentRow | null);
}

/**
 * List documents for an org (for export and Documents page).
 */
export async function listDocuments(
  client: DalClient,
  orgId: string,
  opts?: { limit?: number; documentType?: string }
): Promise<DalResult<DocumentRow[]>> {
  if (!client) return err(new Error('Supabase client not configured'));
  let q = client
    .from('documents')
    .select('*')
    .eq('org_id', orgId)
    .order('updated_at', { ascending: false })
    .limit(opts?.limit ?? 500);
  if (opts?.documentType) q = q.eq('document_type', opts.documentType);
  const { data, error } = await q;
  if (error) return err(new Error(error.message));
  return ok((data ?? []) as DocumentRow[]);
}
