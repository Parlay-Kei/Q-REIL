#!/usr/bin/env node
/**
 * Apply Q-REIL migrations to project umzuncubiizoomoxlgts via Supabase Management API.
 * Reads SUPABASE_ACCESS_TOKEN from c:\\Dev\\Direct-Cuts\\.env.local
 * Usage: node apply-via-api.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const MIGRATIONS_DIR = path.join(ROOT, 'docs', '02_DATA', 'migrations');
const PROJECT_REF = 'umzuncubiizoomoxlgts';
const ENV_PATH = 'c:\\Dev\\Direct-Cuts\\.env.local';

const ORDER = [
  '00001_create_orgs.sql', '00002_create_users.sql', '00003_create_user_roles.sql',
  '00004_create_helper_functions.sql', '00017_create_events.sql', '00018_create_event_triggers.sql',
  '00019_create_updated_at_triggers.sql', '00021_enable_rls_org_layer.sql',
  '00030_create_mail_tables.sql', '00031_mail_rls_policies.sql', '00032_mail_upsert_service_role.sql',
];

function getToken() {
  if (!fs.existsSync(ENV_PATH)) throw new Error(`Not found: ${ENV_PATH}`);
  const content = fs.readFileSync(ENV_PATH, 'utf8');
  const m = content.match(/^SUPABASE_ACCESS_TOKEN=(.+)$/m);
  if (!m) throw new Error('SUPABASE_ACCESS_TOKEN not found');
  return m[1].trim();
}

async function runMigration(token, sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
}

async function main() {
  const token = getToken();
  for (const f of ORDER) {
    const filePath = path.join(MIGRATIONS_DIR, f);
    if (!fs.existsSync(filePath)) {
      console.log(`Skip (missing): ${f}`);
      continue;
    }
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`Applying ${f} ...`);
    try {
      await runMigration(token, sql);
      console.log('  OK');
    } catch (e) {
      console.error('  Error:', e.message);
      process.exit(1);
    }
  }
  console.log('Done.');
}

main();
