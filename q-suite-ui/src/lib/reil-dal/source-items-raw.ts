/**
 * REIL DAL: Source items raw (ENGDEL-REIL-DATA-ACCESS-LAYER-0004).
 * createSourceItemRaw, listSourceItemsRaw, getSourceItemRawByExternalId
 */

import type { DalClient, DalResult, Actor } from './types';
import { dalErr, dalOk } from './types';
import type { SourceItemRawRow } from '../../types/reil-core';

export type CreateSourceItemRawParams = {
  external_id: string;
  source: string;
  received_at?: string | null;
  from?: string | null;
  to?: string | string[] | null;
  subject?: string | null;
  body_text?: string | null;
  headers_json?: Record<string, unknown> | null;
  thread_id?: string | null;
  message_id?: string | null;
  attachment_count?: number | null;
  actor: Actor;
};

export type ListSourceItemsRawParams = {
  date_from?: string | null;
  date_to?: string | null;
  sender?: string | null;
  has_attachments?: boolean | null;
  status?: string | null;
  limit?: number;
};

function buildIdempotencyKey(source: string, externalId: string): string {
  return `${source}:${externalId}`;
}

/**
 * Create a raw source item (append-only). Idempotency key = source:external_id.
 * On conflict returns existing row id (caller can treat as success).
 */
export async function createSourceItemRaw(
  client: DalClient,
  params: CreateSourceItemRawParams
): Promise<DalResult<{ id: string }>> {
  if (!client) return dalErr(new Error('Supabase client not configured'));
  const idempotencyKey = buildIdempotencyKey(params.source, params.external_id);
  const payload: Record<string, unknown> = {
    received_at: params.received_at ?? null,
    from: params.from ?? null,
    to: params.to ?? null,
    subject: params.subject ?? null,
    body_text: params.body_text ?? null,
    headers_json: params.headers_json ?? null,
    thread_id: params.thread_id ?? null,
    message_id: params.message_id ?? null,
    attachment_count: params.attachment_count ?? 0,
  };
  const row = {
    org_id: params.actor.org_id,
    idempotency_key: idempotencyKey,
    source_type: params.source,
    payload,
  };
  const { data, error } = await client
    .from('source_items_raw')
    .insert(row)
    .select('id')
    .single();
  if (error) return dalErr(new Error(error.message));
  return dalOk({ id: (data as { id: string }).id });
}

/**
 * List raw source items with optional filters (date range, sender, has_attachments).
 * status is applied to payload if present.
 */
export async function listSourceItemsRaw(
  client: DalClient,
  orgId: string,
  opts?: ListSourceItemsRawParams
): Promise<DalResult<SourceItemRawRow[]>> {
  if (!client) return dalErr(new Error('Supabase client not configured'));
  let q = client
    .from('source_items_raw')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(opts?.limit ?? 100);
  if (opts?.date_from) q = q.gte('created_at', opts.date_from);
  if (opts?.date_to) q = q.lte('created_at', opts.date_to);
  const { data, error } = await q;
  if (error) return dalErr(new Error(error.message));
  let rows = (data ?? []) as SourceItemRawRow[];
  if (opts?.sender) {
    const s = opts.sender.toLowerCase();
    rows = rows.filter((r) => {
      const from = (r.payload?.from as string) ?? (r.payload?.from_email as string) ?? '';
      return String(from).toLowerCase().includes(s);
    });
  }
  if (opts?.has_attachments === true) {
    rows = rows.filter((r) => {
      const n = (r.payload?.attachment_count as number) ?? 0;
      return n > 0;
    });
  }
  if (opts?.has_attachments === false) {
    rows = rows.filter((r) => {
      const n = (r.payload?.attachment_count as number) ?? 0;
      return n === 0;
    });
  }
  if (opts?.status) {
    rows = rows.filter((r) => (r.payload?.status as string) === opts.status);
  }
  return dalOk(rows);
}

/**
 * Get raw source item by external_id (and source to build idempotency key).
 */
export async function getSourceItemRawByExternalId(
  client: DalClient,
  orgId: string,
  external_id: string,
  source: string
): Promise<DalResult<SourceItemRawRow | null>> {
  if (!client) return dalErr(new Error('Supabase client not configured'));
  const idempotencyKey = buildIdempotencyKey(source, external_id);
  const { data, error } = await client
    .from('source_items_raw')
    .select('*')
    .eq('org_id', orgId)
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();
  if (error) return dalErr(new Error(error.message));
  return dalOk(data as SourceItemRawRow | null);
}
