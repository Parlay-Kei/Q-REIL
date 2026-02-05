#!/usr/bin/env node
/**
 * Run REIL Core normalize pipeline (ENGDEL-REIL-NORMALIZE-MATCH-0007).
 * Usage: node connectors/reil-core/normalize/run-normalize.mjs [orgId]
 * Env: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY.
 * Loads .env.local from repo root if present.
 */
import { createClient } from '@supabase/supabase-js';
import { runNormalize, getCounts } from './normalize.js';
import { loadEnv } from '../../gmail/lib/load-env.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');
process.chdir(repoRoot);
loadEnv();

const SEED_ORG_ID = 'a0000000-0000-4000-8000-000000000001';
const orgId = process.argv[2] || process.env.REIL_ORG_ID || SEED_ORG_ID;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_URL)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const before = await getCounts(supabase, orgId);
  console.log('Before run:', before);

  const result = await runNormalize(supabase, orgId);
  console.log('Run result:', result);

  const after = await getCounts(supabase, orgId);
  console.log('After run:', after);

  if (after.normalizedCount < before.rawCount) {
    console.warn('Warning: normalized count', after.normalizedCount, '< raw count', before.rawCount);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
