#!/usr/bin/env node
/**
 * Get a fresh access_token using the refresh_token in .tokens.json (indefinite agent use).
 * Requires GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET (canonical) in env or .env.local.
 * See docs/reil-core/OAUTH_ENV_CANON.md.
 *
 * Usage: node scripts/oauth-proof/refresh-token.mjs
 * Output: JSON with access_token, expires_in (or error).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logRefreshFailureReceipt } from '../../connectors/gmail/lib/oauth.js';
import { getGmailOAuthEnv } from '../../connectors/gmail/lib/oauthEnvCanon.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_FILE = path.join(__dirname, '.tokens.json');
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

function loadEnv() {
  const ROOT = path.resolve(__dirname, '../..');
  const candidates = [
    path.join(ROOT, '.env.local'),
    path.join(__dirname, '.env.local'),
    path.join(ROOT, 'connectors/gmail/.env.local'),
    path.join(ROOT, 'q-reil/.env.local'),
    path.join(process.cwd(), '.env.local'),
  ];
  for (const envPath of candidates) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8').replace(/\r\n/g, '\n');
      for (const line of content.split('\n')) {
        const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)\s*$/);
        if (m && !process.env[m[1]]) {
          const val = m[2].trim().replace(/^["']|["']\s*$/g, '');
          process.env[m[1]] = val;
        }
      }
      process.env.LOAD_ENV_SELECTED_FILE = envPath;
      return envPath;
    }
  }
  process.env.LOAD_ENV_SELECTED_FILE = '';
  return null;
}

function printEnvSanityReceipt() {
  const { env: oauthEnv, missing } = getGmailOAuthEnv(process.env);
  const clientId = oauthEnv.GMAIL_CLIENT_ID;
  const clientSecret = oauthEnv.GMAIL_CLIENT_SECRET;
  const selected = process.env.LOAD_ENV_SELECTED_FILE || '(not set)';
  console.error(JSON.stringify({
    receipt: 'oauth_env_sanity',
    client_id_present: !!clientId,
    client_secret_present: !!clientSecret,
    client_id_redacted: clientId ? `...${String(clientId).slice(-8)}` : '(missing)',
    client_secret_redacted: clientSecret ? '[REDACTED]' : '(missing)',
    load_env_selected_file: selected,
    missing_canon_keys: missing,
  }));
}

async function main() {
  loadEnv();
  printEnvSanityReceipt();
  const { env: oauthEnv, missing } = getGmailOAuthEnv(process.env);
  const clientId = oauthEnv.GMAIL_CLIENT_ID;
  const clientSecret = oauthEnv.GMAIL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error(JSON.stringify({ error: 'Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET (canonical). See docs/reil-core/OAUTH_ENV_CANON.md', missing_canon_keys: missing }));
    process.exit(1);
  }
  if (!fs.existsSync(TOKENS_FILE)) {
    console.error(JSON.stringify({ error: 'Run one-time-auth first to create .tokens.json' }));
    process.exit(1);
  }
  const tokens = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
  const refreshToken = tokens.refresh_token;
  if (!refreshToken) {
    console.error(JSON.stringify({ error: 'No refresh_token in .tokens.json' }));
    process.exit(1);
  }
  const params = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
  });
  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    logRefreshFailureReceipt({
      tokenEndpoint: TOKEN_ENDPOINT,
      grantType: 'refresh_token',
      refreshTokenPresent: !!refreshToken,
      error: data.error ?? 'unknown',
      errorDescription: data.error_description ?? null,
    });
    console.error(JSON.stringify({ error: data.error_description || data.error || 'Refresh failed' }));
    process.exit(1);
  }
  console.log(JSON.stringify({
    access_token: data.access_token,
    expires_in: data.expires_in,
  }));
}

main();
