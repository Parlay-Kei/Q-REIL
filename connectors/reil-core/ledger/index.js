/**
 * REIL Core Ledger service (ENGDEL-REIL-LEDGER-ENGINE-0009).
 * Append-only write; timeline read. No update path for ledger rows.
 * Idempotency: optional idempotency_key in payload; if present, duplicate key skips insert and returns existing id.
 */

/**
 * Append a ledger event (append-only).
 * @param {object} supabase - Supabase client (service role)
 * @param {string} orgId - org_id
 * @param {object} event - { event_type, record_id, payload?, idempotency_key?, actor_id?, actor_type? }
 * @returns {Promise<{ id: string } | { error: Error }>}
 */
export async function append(supabase, orgId, event) {
  const {
    event_type,
    record_id,
    payload = {},
    idempotency_key,
    actor_id = null,
    actor_type = 'user',
  } = event;

  if (!event_type || !record_id) {
    return { error: new Error('event_type and record_id required') };
  }

  const finalPayload = { ...payload };
  if (idempotency_key) finalPayload.idempotency_key = idempotency_key;

  if (idempotency_key) {
    const { data: rows } = await supabase
      .from('ledger_events')
      .select('id, payload')
      .eq('org_id', orgId)
      .eq('entity_type', 'record')
      .eq('entity_id', record_id);
    const existing = (rows ?? []).find((r) => (r.payload && r.payload.idempotency_key) === idempotency_key);
    if (existing) return { id: existing.id };
  }

  const row = {
    org_id: orgId,
    actor_id: actor_id ?? null,
    actor_type: actor_type ?? 'user',
    event_type,
    entity_type: 'record',
    entity_id: record_id,
    payload: finalPayload,
    correlation_id: null,
  };

  const { data, error } = await supabase
    .from('ledger_events')
    .insert(row)
    .select('id')
    .single();

  if (error) return { error: new Error(error.message) };
  return { id: data.id };
}

/**
 * Timeline: ordered events for a record (created_at desc).
 * @param {object} supabase - Supabase client
 * @param {string} orgId - org_id
 * @param {string} recordId - record id (entity_id)
 * @param {object} opts - { limit?: number }
 * @returns {Promise<{ events: object[] } | { error: Error }>}
 */
export async function timeline(supabase, orgId, recordId, opts = {}) {
  const limit = opts.limit ?? 100;
  const { data, error } = await supabase
    .from('ledger_events')
    .select('*')
    .eq('org_id', orgId)
    .eq('entity_type', 'record')
    .eq('entity_id', recordId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return { error: new Error(error.message) };
  return { events: data ?? [] };
}
