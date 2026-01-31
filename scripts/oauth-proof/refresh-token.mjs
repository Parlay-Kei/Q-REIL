#!/usr/bin/env node
/**
 * Get a fresh access_token using the refresh_token in .tokens.json (indefinite agent use).
 * Requires GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET in env or .env.local.
 *
 * Usage: node scripts/oauth-proof/refresh-token.mjs
 * Output: JSON with access_token, expires_in (or error).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_FILE = path.join(__dirname, '.tokens.json');

function loadEnv() {
  const candidates = [
    path.join(__dirname, '.env.local'),
    path.join(__dirname, '../../q-reil/.env.local'),
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
    }
  }
}

async function main() {
  loadEnv();
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error(JSON.stringify({ error: 'Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET' }));
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
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(JSON.stringify({ error: data.error_description || data.error || 'Refresh failed' }));
    process.exit(1);
  }
  console.log(JSON.stringify({
    access_token: data.access_token,
    expires_in: data.expires_in,
  }));
}

main();
