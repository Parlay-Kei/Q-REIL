/**
 * REIL DAL: Ledger events (ENGDEL-REIL-DATA-ACCESS-LAYER-0004).
 * appendLedgerEvent, listLedgerEventsByRecord
 */

import type { DalClient, DalResult, Actor } from './types';
import { dalErr, dalOk } from './types';
import type { LedgerEventRow } from '../../types/reil-core';

export type AppendLedgerEventParams = {
  record_id: string;
  event_type: string;
  event_payload_json?: Record<string, unknown> | null;
  actor: Actor;
  source?: string | null;
};

/**
 * Append a ledger event for a record (entity_type='record', entity_id=record_id).
 */
export async function appendLedgerEvent(
  client: DalClient,
  params: AppendLedgerEventParams
): Promise<DalResult<{ id: string }>> {
  if (!client) return dalErr(new Error('Supabase client not configured'));
  const row = {
    org_id: params.actor.org_id,
    actor_id: params.actor.user_id ?? null,
    actor_type: (params.source === 'system' || params.source === 'integration') ? params.source : 'user',
    event_type: params.event_type,
    entity_type: 'record',
    entity_id: params.record_id,
    payload: params.event_payload_json ?? {},
  };
  const { data, error } = await client
    .from('ledger_events')
    .insert(row)
    .select('id')
    .single();
  if (error) return dalErr(new Error(error.message));
  return dalOk({ id: (data as { id: string }).id });
}

/**
 * List ledger events for a record, ordered by created_at desc.
 */
export async function listLedgerEventsByRecord(
  client: DalClient,
  orgId: string,
  record_id: string,
  opts?: { limit?: number }
): Promise<DalResult<LedgerEventRow[]>> {
  if (!client) return dalErr(new Error('Supabase client not configured'));
  const { data, error } = await client
    .from('ledger_events')
    .select('*')
    .eq('org_id', orgId)
    .eq('entity_type', 'record')
    .eq('entity_id', record_id)
    .order('created_at', { ascending: false })
    .limit(opts?.limit ?? 100);
  if (error) return dalErr(new Error(error.message));
  return dalOk((data ?? []) as LedgerEventRow[]);
}
