/**
 * REIL DAL: Source items normalized (ENGDEL-REIL-DATA-ACCESS-LAYER-0004).
 * upsertSourceItemNormalized, getNormalizedByRawId
 */

import type { DalClient, DalResult, Actor } from './types';
import { dalErr, dalOk } from './types';
import type { SourceItemNormalizedRow } from '../../types/reil-core';

export type UpsertSourceItemNormalizedParams = {
  raw_id: string;
  record_key?: string | null;
  parties_json?: Record<string, unknown> | unknown[] | null;
  doc_type?: string | null;
  fields_json?: Record<string, unknown> | null;
  confidence?: number | null;
  actor: Actor;
};

/**
 * Upsert normalized item. Idempotency key derived from raw_id (raw:raw_id).
 * Resolves raw row first to get org_id and optional source_type; otherwise uses actor.org_id.
 */
export async function upsertSourceItemNormalized(
  client: DalClient,
  params: UpsertSourceItemNormalizedParams
): Promise<DalResult<SourceItemNormalizedRow>> {
  if (!client) return dalErr(new Error('Supabase client not configured'));
  const idempotencyKey = `normalized:${params.raw_id}`;
  const orgId = params.actor.org_id;
  const payload: Record<string, unknown> = {
    raw_id: params.raw_id,
    record_key: params.record_key ?? null,
    parties_json: params.parties_json ?? null,
    doc_type: params.doc_type ?? null,
    fields_json: params.fields_json ?? null,
    confidence: params.confidence ?? null,
  };
  const row = {
    org_id: orgId,
    idempotency_key: idempotencyKey,
    source_type: 'reil',
    normalized_type: params.doc_type ?? 'message',
    payload,
  };
  const { data, error } = await client
    .from('source_items_normalized')
    .upsert(row, { onConflict: 'org_id,idempotency_key' })
    .select()
    .single();
  if (error) return dalErr(new Error(error.message));
  return dalOk(data as SourceItemNormalizedRow);
}

/**
 * Get normalized item by raw_id (lookup raw row for idempotency_key then fetch normalized).
 */
export async function getNormalizedByRawId(
  client: DalClient,
  orgId: string,
  raw_id: string
): Promise<DalResult<SourceItemNormalizedRow | null>> {
  if (!client) return dalErr(new Error('Supabase client not configured'));
  const idempotencyKey = `normalized:${raw_id}`;
  const { data, error } = await client
    .from('source_items_normalized')
    .select('*')
    .eq('org_id', orgId)
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();
  if (error) return dalErr(new Error(error.message));
  return dalOk(data as SourceItemNormalizedRow | null);
}
