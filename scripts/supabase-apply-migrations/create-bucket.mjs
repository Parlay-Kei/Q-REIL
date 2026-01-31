#!/usr/bin/env node
/**
 * Create storage bucket mail-attachments in Q-REIL Supabase project.
 * Reads SUPABASE_ACCESS_TOKEN from c:\Dev\Direct-Cuts\.env.local, fetches service_role via API, creates bucket.
 * Usage: node create-bucket.mjs
 */
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const PROJECT_REF = 'umzuncubiizoomoxlgts';
const ENV_PATH = 'c:\\Dev\\Direct-Cuts\\.env.local';
const BUCKET = 'mail-attachments';

function getToken() {
  if (!fs.existsSync(ENV_PATH)) throw new Error(`Not found: ${ENV_PATH}`);
  const content = fs.readFileSync(ENV_PATH, 'utf8');
  const m = content.match(/^SUPABASE_ACCESS_TOKEN=(.+)$/m);
  if (!m) throw new Error('SUPABASE_ACCESS_TOKEN not found');
  return m[1].trim();
}

async function getServiceRoleKey(token) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys?reveal=true`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`API keys: ${res.status} ${await res.text()}`);
  const keys = await res.json();
  const sr = Array.isArray(keys) ? keys.find((k) => k.name === 'service_role') : keys?.find?.((k) => k.name === 'service_role');
  if (!sr?.api_key) throw new Error('service_role key not found');
  return sr.api_key;
}

async function main() {
  const token = getToken();
  const serviceRoleKey = await getServiceRoleKey(token);
  const url = `https://${PROJECT_REF}.supabase.co`;
  const supabase = createClient(url, serviceRoleKey);
  const { data, error } = await supabase.storage.createBucket(BUCKET, { public: false });
  if (error) {
    if (error.message?.includes('already exists')) {
      console.log(`Bucket "${BUCKET}" already exists.`);
      return;
    }
    throw error;
  }
  console.log(`Bucket "${BUCKET}" created.`, data);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
