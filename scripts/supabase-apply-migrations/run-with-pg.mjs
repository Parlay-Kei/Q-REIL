#!/usr/bin/env node
/**
 * Apply Q-REIL migrations using Node pg client. No psql required.
 * Requires: SUPABASE_DB_URL (from Supabase Dashboard → Settings → Database → Connection string)
 * Usage: set SUPABASE_DB_URL=postgresql://... && node run-with-pg.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const MIGRATIONS_DIR = path.join(ROOT, 'docs', '02_DATA', 'migrations');

// Minimal order for Gmail ingestion: skip 00004 (auth schema), 00019 (needs contacts/properties/etc.)
const ORDER = [
  '00001_create_orgs.sql', '00002_create_users.sql', '00003_create_user_roles.sql',
  '00004_create_helper_functions.sql', '00017_create_events.sql', '00018_create_event_triggers.sql',
  '00021_enable_rls_org_layer.sql',
  '00030_create_mail_tables.sql', '00031_mail_rls_policies.sql', '00032_mail_upsert_service_role.sql',
];

function getDbUrl() {
  let url = process.env.SUPABASE_DB_URL;
  if (!url) {
    const envPath = path.join(__dirname, '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8').replace(/\r\n/g, '\n');
      const m = content.match(/SUPABASE_DB_URL\s*=\s*(.+)/m);
      if (m) url = m[1].trim().replace(/^["']|["']\s*$|["']$/g, '');
    }
  }
  if (!url) {
    console.error('Set SUPABASE_DB_URL (from Supabase Dashboard → Settings → Database → Connection string).');
    console.error('  Option A: Create this file with one line: SUPABASE_DB_URL=postgresql://...');
    console.error('    ' + path.join(__dirname, '.env.local'));
    console.error('  Option B: In PowerShell: $env:SUPABASE_DB_URL = "postgresql://..."; node run-with-pg.mjs');
    process.exit(1);
  }
  return url;
}

async function main() {
  const connectionString = getDbUrl();
  const client = new Client({ connectionString });
  try {
    await client.connect();
    for (const f of ORDER) {
      const filePath = path.join(MIGRATIONS_DIR, f);
      if (!fs.existsSync(filePath)) {
        console.log(`Skip (missing): ${f}`);
        continue;
      }
      const sql = fs.readFileSync(filePath, 'utf8');
      console.log(`Applying ${f} ...`);
      try {
        await client.query(sql);
        console.log('  OK');
      } catch (e) {
        const msg = e.message || '';
        if (msg.includes('permission denied for schema auth')) {
          console.error('  Skipped (run this file in Dashboard SQL Editor: auth schema requires elevated role):', f);
          continue;
        }
        if (msg.includes('function auth.user_org_id() does not exist') || msg.includes('function auth.has_role') && msg.includes('does not exist')) {
          console.error('  Skipped (run 00004_create_helper_functions.sql in Dashboard first, then re-run this script):', f);
          continue;
        }
        console.error('  Error:', msg);
        process.exit(1);
      }
    }
    console.log('Done.');
  } finally {
    await client.end();
  }
}

main();
