/**
 * REIL DAL: Records (ENGDEL-REIL-DATA-ACCESS-LAYER-0004).
 * createRecord, getRecord, searchRecords, linkRecordToSourceItem
 */

import type { DalClient, DalResult, Actor } from './types';
import { dalErr, dalOk } from './types';
import type { RecordRow, RecordType } from '../../types/reil-core';

export type CreateRecordParams = {
  record_key: string;
  record_type: RecordType;
  title: string;
  status?: string | null;
  fields_json?: Record<string, unknown> | null;
  actor: Actor;
};

export type SearchRecordsParams = {
  query?: string | null;
  status?: string | null;
  date_from?: string | null;
  date_to?: string | null;
  limit?: number;
};

/**
 * Create a canonical record (property or deal container).
 * record_key is used as record_type_id (UUID of property or deal).
 */
export async function createRecord(
  client: DalClient,
  params: CreateRecordParams
): Promise<DalResult<RecordRow>> {
  if (!client) return dalErr(new Error('Supabase client not configured'));
  const row = {
    org_id: params.actor.org_id,
    record_type: params.record_type,
    record_type_id: params.record_key,
    title: params.title,
    status: params.status ?? 'active',
    owner_id: params.actor.user_id ?? null,
    tags: [],
  };
  const { data, error } = await client.from('records').insert(row).select().single();
  if (error) return dalErr(new Error(error.message));
  return dalOk(data as RecordRow);
}

/**
 * Get a single record by id.
 */
export async function getRecord(
  client: DalClient,
  orgId: string,
  record_id: string
): Promise<DalResult<RecordRow>> {
  if (!client) return dalErr(new Error('Supabase client not configured'));
  const { data, error } = await client
    .from('records')
    .select('*')
    .eq('org_id', orgId)
    .eq('id', record_id)
    .single();
  if (error) return dalErr(new Error(error.message));
  return dalOk(data as RecordRow);
}

/**
 * Search records by query (title ilike), status, date range (updated_at).
 */
export async function searchRecords(
  client: DalClient,
  orgId: string,
  opts?: SearchRecordsParams
): Promise<DalResult<RecordRow[]>> {
  if (!client) return dalErr(new Error('Supabase client not configured'));
  let q = client.from('records').select('*').eq('org_id', orgId);
  if (opts?.query) q = q.ilike('title', `%${opts.query}%`);
  if (opts?.status) q = q.eq('status', opts.status);
  if (opts?.date_from) q = q.gte('updated_at', opts.date_from);
  if (opts?.date_to) q = q.lte('updated_at', opts.date_to);
  q = q.order('updated_at', { ascending: false }).limit(opts?.limit ?? 100);
  const { data, error } = await q;
  if (error) return dalErr(new Error(error.message));
  return dalOk((data ?? []) as RecordRow[]);
}

export type LinkRecordToSourceItemParams = {
  record_id: string;
  raw_id: string;
  actor: Actor;
};

/**
 * Link a source item (raw) to a record via record_links.
 * source_type='message', source_id=raw_id, target_type='record', target_id=record_id.
 */
export async function linkRecordToSourceItem(
  client: DalClient,
  params: LinkRecordToSourceItemParams
): Promise<DalResult<{ id: string }>> {
  if (!client) return dalErr(new Error('Supabase client not configured'));
  const row = {
    org_id: params.actor.org_id,
    source_type: 'message',
    source_id: params.raw_id,
    target_type: 'record',
    target_id: params.record_id,
    link_method: 'manual' as const,
    linked_by: params.actor.user_id ?? null,
  };
  const { data, error } = await client
    .from('record_links')
    .insert(row)
    .select('id')
    .single();
  if (error) return dalErr(new Error(error.message));
  return dalOk({ id: (data as { id: string }).id });
}
