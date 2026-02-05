#!/usr/bin/env node
/**
 * QAG-REIL-INGEST-SMOKE-0006: Query DB for ingestion smoke evidence.
 * Usage: node verify-ingest-smoke.mjs
 * Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (from .env.local via load-env).
 */
import { createClient } from '@supabase/supabase-js';
import { loadEnv } from './lib/load-env.js';

loadEnv();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error(JSON.stringify({ error: 'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' }));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const out = { at: new Date().toISOString(), counts: {}, sample: {} };

  // source_items_raw: gmail rows (idempotency_key = gmail:<messageId>)
  const { count: rawGmailCount, error: rawErr } = await supabase
    .from('source_items_raw')
    .select('*', { count: 'exact', head: true })
    .eq('source_type', 'gmail');
  if (rawErr) {
    out.error = rawErr.message;
    console.log(JSON.stringify(out, null, 2));
    process.exit(1);
  }
  out.counts.source_items_raw_gmail = rawGmailCount ?? 0;

  // documents: attachment pointers (document_type = 'gmail' in current ingest code)
  const { count: docsGmailCount, error: docsErr } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('document_type', 'gmail');
  if (docsErr) {
    out.counts.documents_gmail = 0;
    out.documents_error = docsErr.message;
  } else {
    out.counts.documents_gmail = docsGmailCount ?? 0;
  }

  // Sample: one raw payload (message)
  const { data: rawOne } = await supabase
    .from('source_items_raw')
    .select('id, idempotency_key, payload')
    .eq('source_type', 'gmail')
    .limit(1)
    .maybeSingle();
  if (rawOne) {
    out.sample.source_items_raw = {
      idempotency_key: rawOne.idempotency_key,
      payload_keys: rawOne.payload ? Object.keys(rawOne.payload) : [],
    };
  }

  // Sample: one document row (attachment pointer)
  const { data: docOne } = await supabase
    .from('documents')
    .select('id, name, storage_path, storage_bucket, document_type')
    .eq('document_type', 'gmail')
    .limit(1)
    .maybeSingle();
  if (docOne) {
    out.sample.documents = {
      id: docOne.id,
      name: docOne.name,
      storage_path: docOne.storage_path,
      storage_bucket: docOne.storage_bucket,
    };
  }

  console.log(JSON.stringify(out, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
