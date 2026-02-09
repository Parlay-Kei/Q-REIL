#!/usr/bin/env node
/**
 * PLATOPS Discovery: Find canonical stores and key names for Gmail OAuth credentials
 * Mission: OCS-QREIL-GMAIL-AUTH-CANON-AND-TOKEN-0001
 * 
 * Discovers:
 * 1. Canonical secret stores (Vercel Production, repo root .env.local)
 * 2. Current env var key names (canonical vs legacy)
 * 3. Token file state (.tokens.json)
 * 4. Mismatch evidence (client_id mismatch, unauthorized_client)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getGmailOAuthEnv } from '../../connectors/gmail/lib/oauthEnvCanon.js';
import { loadEnv } from '../../connectors/gmail/lib/load-env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const TOKENS_FILE = path.join(__dirname, '.tokens.json');

// Canonical stores (priority order)
const CANONICAL_STORES = [
  { name: 'Vercel Production', path: 'Vercel API (prj_VAiSllyEk27tnHDXagBt88h0h64j)', type: 'vercel' },
  { name: 'Repo root .env.local', path: path.join(ROOT, '.env.local'), type: 'file' },
  { name: 'scripts/oauth-proof/.env.local', path: path.join(__dirname, '.env.local'), type: 'file' },
  { name: 'connectors/gmail/.env.local', path: path.join(ROOT, 'connectors/gmail/.env.local'), type: 'file' },
  { name: 'q-reil/.env.local', path: path.join(ROOT, 'q-reil/.env.local'), type: 'file' },
];

const CANONICAL_KEYS = ['GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET', 'GMAIL_REFRESH_TOKEN', 'GMAIL_SENDER_ADDRESS'];
const LEGACY_ALIASES = ['GOOGLE_OAUTH_CLIENT_ID', 'GOOGLE_OAUTH_CLIENT_SECRET'];

function checkFileStore(storePath) {
  if (!fs.existsSync(storePath)) {
    return { exists: false, keys: {} };
  }
  const content = fs.readFileSync(storePath, 'utf8').replace(/\r\n/g, '\n');
  const keys = {};
  for (const line of content.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)\s*$/);
    if (m) {
      const key = m[1];
      const value = m[2].trim().replace(/^["']|["']\s*$/g, '');
      if (CANONICAL_KEYS.includes(key) || LEGACY_ALIASES.includes(key)) {
        keys[key] = value ? '[PRESENT]' : '[EMPTY]';
      }
    }
  }
  return { exists: true, keys };
}

function checkTokensFile() {
  if (!fs.existsSync(TOKENS_FILE)) {
    return { exists: false, client_id: null, has_refresh_token: false };
  }
  try {
    const tokens = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
    return {
      exists: true,
      client_id: tokens.client_id ? `...${String(tokens.client_id).slice(-20)}` : null,
      client_secret_sha256: tokens.client_secret_sha256 ? '[PRESENT]' : null,
      has_refresh_token: !!tokens.refresh_token,
      scope: tokens.scope || null,
    };
  } catch (e) {
    return { exists: true, error: e.message };
  }
}

function main() {
  console.error(JSON.stringify({
    receipt: 'platrops_discovery_start',
    mission: 'OCS-QREIL-GMAIL-AUTH-CANON-AND-TOKEN-0001',
    timestamp_iso: new Date().toISOString(),
  }));

  // Load env from canonical sources
  loadEnv();
  const selectedFile = process.env.LOAD_ENV_SELECTED_FILE || '(not set)';

  // Get normalized env with source tracking
  const { env: oauthEnv, missing, source } = getGmailOAuthEnv(process.env, { includeSource: true });

  // Check stores
  const stores = [];
  for (const store of CANONICAL_STORES) {
    if (store.type === 'file') {
      const check = checkFileStore(store.path);
      stores.push({
        name: store.name,
        path: store.path,
        exists: check.exists,
        keys_found: Object.keys(check.keys),
      });
    } else if (store.type === 'vercel') {
      stores.push({
        name: store.name,
        path: store.path,
        exists: 'unknown',
        note: 'Requires VERCEL_TOKEN to check via API',
      });
    }
  }

  // Check tokens file
  const tokensState = checkTokensFile();

  // Identify mismatch
  const mismatch = {
    detected: false,
    evidence: [],
  };

  if (tokensState.exists && tokensState.client_id && oauthEnv.GMAIL_CLIENT_ID) {
    // We can't compare full client_id without exposing it, but we can check if they're different
    // The actual comparison happens at runtime in oauth.js
    mismatch.evidence.push({
      type: 'client_id_comparison_needed',
      note: 'Token file has client_id; env has GMAIL_CLIENT_ID. Runtime will compare.',
    });
  }

  if (tokensState.exists && !tokensState.client_id) {
    mismatch.evidence.push({
      type: 'token_file_missing_client_id',
      note: '.tokens.json exists but lacks client_id field. Token may be from old format.',
    });
  }

  // Output discovery receipt
  const discovery = {
    receipt: 'platrops_discovery_complete',
    canonical_stores: stores,
    env_loaded_from: selectedFile,
    canonical_keys_present: Object.keys(oauthEnv),
    canonical_keys_missing: missing,
    key_sources: source || {},
    tokens_file_state: tokensState,
    mismatch_evidence: mismatch.evidence,
    canonical_key_names: CANONICAL_KEYS,
    legacy_aliases: LEGACY_ALIASES,
  };

  console.error(JSON.stringify(discovery, null, 2));
  console.log('\n--- Discovery Summary ---');
  console.log('Canonical stores checked:', stores.length);
  console.log('Env loaded from:', selectedFile);
  console.log('Canonical keys present:', Object.keys(oauthEnv).join(', ') || '(none)');
  console.log('Canonical keys missing:', missing.join(', ') || '(none)');
  console.log('Tokens file exists:', tokensState.exists);
  if (tokensState.exists) {
    console.log('Token has client_id:', !!tokensState.client_id);
    console.log('Token has refresh_token:', tokensState.has_refresh_token);
  }
  
  return discovery;
}

main().catch((err) => {
  console.error(JSON.stringify({
    receipt: 'platrops_discovery_error',
    error: err.message,
    stack: err.stack,
  }));
  process.exit(1);
});
