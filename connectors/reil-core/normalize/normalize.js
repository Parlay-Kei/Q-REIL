/**
 * REIL Core Normalize pipeline (ENGDEL-REIL-NORMALIZE-MATCH-0007).
 * Reads source_items_raw for org, produces source_items_normalized (idempotency_key = raw.idempotency_key).
 * Matching stub: optional record_link when heuristic matches raw item to record.
 * Idempotent: rerun writes zero additional normalized rows (upsert by org_id, idempotency_key).
 */

/**
 * Build normalized payload from raw row (NORMALIZATION_RULES).
 * - detected_parties from from/to/from_name
 * - detected_record_key stub (empty or from subject)
 * - document_type, item_confidence, match_status
 */
function buildNormalizedPayload(raw) {
  const p = raw.payload || {};
  const from = p.from || p.from_email || '';
  const fromName = p.from_name || (from ? from.split('@')[0] : '') || null;
  const to = p.to || p.to_emails;
  const toList = Array.isArray(to) ? to : (typeof to === 'string' ? [to] : []);
  const parties = [];
  if (from || fromName) {
    parties.push({
      name: fromName || null,
      email: from || null,
      phone: null,
      role: 'sender',
      confidence: 95,
    });
  }
  toList.slice(0, 5).forEach((email) => {
    const e = typeof email === 'string' ? email : (email?.email || email);
    if (e) {
      parties.push({
        name: null,
        email: e,
        phone: null,
        role: 'recipient',
        confidence: 90,
      });
    }
  });
  const subject = p.subject || p.title || '';
  const docType = 'other';
  const docTypeConfidence = 50;
  const itemConfidence = parties.length ? 85 : 70;
  const matchStatus = 'unmatched';

  return {
    raw_id: raw.id,
    detected_parties: parties.length ? parties : undefined,
    detected_record_key: subject ? { subject_snippet: subject.slice(0, 80), confidence: 60 } : undefined,
    document_type: docType,
    document_type_confidence: docTypeConfidence,
    field_confidence: { parties: 90, record_key: 60, document_type: 50 },
    item_confidence: itemConfidence,
    match_status: matchStatus,
    subject: subject || undefined,
    snippet: p.snippet || undefined,
  };
}

/**
 * Run normalize pipeline for org: read raw, upsert normalized (same idempotency_key as raw for UI join).
 * Returns { rawCount, normalizedUpserted, normalizedSkipped, linksCreated }.
 */
export async function runNormalize(supabase, orgId, options = {}) {
  const limit = options.limit ?? 500;
  const { data: rawRows, error: rawErr } = await supabase
    .from('source_items_raw')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (rawErr) throw new Error(`source_items_raw select failed: ${rawErr.message}`);
  const rawList = rawRows || [];

  let normalizedUpserted = 0;
  let normalizedSkipped = 0;

  for (const raw of rawList) {
    const idempotencyKey = raw.idempotency_key;
    const sourceType = raw.source_type || 'gmail';
    const payload = buildNormalizedPayload(raw);
    const row = {
      org_id: orgId,
      idempotency_key: idempotencyKey,
      source_type: sourceType,
      normalized_type: 'message',
      payload,
    };

    const { error: upsertErr } = await supabase
      .from('source_items_normalized')
      .upsert(row, { onConflict: 'org_id,idempotency_key' })
      .select('id')
      .single();

    if (upsertErr) throw new Error(`source_items_normalized upsert failed: ${upsertErr.message}`);
    normalizedUpserted += 1;
  }

  let linksCreated = 0;
  if (options.matching !== false) {
    linksCreated = await runMatchingStub(supabase, orgId, rawList);
  }

  return {
    rawCount: rawList.length,
    normalizedUpserted,
    linksCreated,
  };
}

/**
 * Matching stub: if raw subject contains a record title, ensure record_link exists (message -> record).
 */
async function runMatchingStub(supabase, orgId, rawList) {
  const { data: records } = await supabase
    .from('records')
    .select('id, title')
    .eq('org_id', orgId);
  const recordList = records || [];
  let created = 0;

  for (const raw of rawList) {
    const subject = (raw.payload?.subject || raw.payload?.title || '').toLowerCase();
    if (!subject) continue;
    for (const rec of recordList) {
      const title = (rec.title || '').toLowerCase();
      if (!title || !subject.includes(title)) continue;
      const { error } = await supabase.from('record_links').upsert(
        {
          org_id: orgId,
          source_type: 'message',
          source_id: raw.id,
          target_type: 'record',
          target_id: rec.id,
          link_method: 'system',
          linked_by: null,
        },
        { onConflict: 'source_type,source_id,target_type,target_id' }
      );
      if (!error) created += 1;
      break;
    }
  }
  return created;
}

/**
 * Return counts for receipt: raw count, normalized count for org.
 */
export async function getCounts(supabase, orgId) {
  const [rawRes, normRes] = await Promise.all([
    supabase.from('source_items_raw').select('id', { count: 'exact', head: true }).eq('org_id', orgId),
    supabase.from('source_items_normalized').select('id', { count: 'exact', head: true }).eq('org_id', orgId),
  ]);
  return {
    rawCount: rawRes.count ?? 0,
    normalizedCount: normRes.count ?? 0,
  };
}
