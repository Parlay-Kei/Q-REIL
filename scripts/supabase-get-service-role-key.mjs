#!/usr/bin/env node
/**
 * Get Supabase service role key for Q REIL project.
 * Requires SUPABASE_ACCESS_TOKEN in environment or c:\Dev\Direct-Cuts\.env.local
 * Usage: node scripts/supabase-get-service-role-key.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_REF = 'umzuncubiizoomoxlgts';
const ENV_PATH = 'c:\\Dev\\Direct-Cuts\\.env.local';

function getToken() {
  // Try environment variable first
  if (process.env.SUPABASE_ACCESS_TOKEN) {
    return process.env.SUPABASE_ACCESS_TOKEN;
  }
  
  // Try Direct-Cuts .env.local
  if (fs.existsSync(ENV_PATH)) {
    const content = fs.readFileSync(ENV_PATH, 'utf8');
    const m = content.match(/^SUPABASE_ACCESS_TOKEN=(.+)$/m);
    if (m) {
      return m[1].trim();
    }
  }
  
  throw new Error('SUPABASE_ACCESS_TOKEN not found. Set it in env or c:\\Dev\\Direct-Cuts\\.env.local');
}

async function getServiceRoleKey(token) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys?reveal=true`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API keys: ${res.status} ${text}`);
  }
  const keys = await res.json();
  const sr = Array.isArray(keys) 
    ? keys.find((k) => k.name === 'service_role') 
    : keys?.find?.((k) => k.name === 'service_role');
  if (!sr?.api_key) {
    throw new Error('service_role key not found in API response');
  }
  return sr.api_key;
}

async function main() {
  try {
    const token = getToken();
    const serviceRoleKey = await getServiceRoleKey(token);
    console.log('Service role key retrieved successfully.');
    console.log('\nTo set as GitHub secret:');
    console.log(`gh secret set SUPABASE_SERVICE_ROLE_KEY --body "${serviceRoleKey}"`);
    console.log('\nTo set in Vercel (via workflow, requires VERCEL_TOKEN):');
    console.log('Run: gh workflow run "Q REIL Supabase Env Upsert"');
  } catch (error) {
    console.error('Error:', error.message);
    console.error('\nTo get the service role key manually:');
    console.error('1. Go to: https://supabase.com/dashboard/project/umzuncubiizoomoxlgts/settings/api');
    console.error('2. Copy the "service_role" key');
    console.error('3. Set as GitHub secret: gh secret set SUPABASE_SERVICE_ROLE_KEY --body "<key-value>"');
    process.exit(1);
  }
}

main();
