/**
 * Ledger: emit events to public.events. Optional idempotency if ledger_ingestion_idempotency exists.
 */
const EVENT_TYPES = {
  INGESTION_START: 'sync.started',
  INGESTION_COMPLETE: 'sync.completed',
  THREAD_INGESTED: 'thread.ingested',
  MESSAGE_INGESTED: 'message.ingested',
  ATTACHMENT_INGESTED: 'attachment.saved',
};

export async function emitEvent(supabase, opts) {
  const { orgId, eventType, entityType, entityId, payload } = opts;
  const { data, error } = await supabase.from('events').insert({
    org_id: orgId,
    actor_id: null,
    actor_type: 'integration',
    event_type: eventType,
    entity_type: entityType,
    entity_id: entityId,
    payload: payload || {},
    correlation_id: null,
  }).select('id').single();
  if (error) throw new Error(`Ledger insert failed: ${error.message}`);
  return data?.id;
}

export function idempotencyKeys(mailboxId, runTag = '7d') {
  return {
    ingestionStart: `gmail:ingest:start:${mailboxId}:${runTag}`,
    ingestionComplete: `gmail:ingest:complete:${mailboxId}:${runTag}`,
    thread: (providerThreadId) => `gmail:thread:${mailboxId}:${providerThreadId}`,
    message: (providerMessageId) => `gmail:message:${mailboxId}:${providerMessageId}`,
    attachment: (messageId, attachmentId) => `gmail:attachment:${mailboxId}:${messageId}:${attachmentId}`,
  };
}

export { EVENT_TYPES };
