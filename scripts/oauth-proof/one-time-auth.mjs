#!/usr/bin/env node
/**
 * OPS-901 one-time Gmail OAuth — for indefinite agent use.
 *
 * Runs a local callback server and opens the system default browser to complete
 * Google sign-in once. Saves refresh_token (and access_token) to .tokens.json
 * so the app or agent can use refresh_token indefinitely without user interaction.
 *
 * Hardened for Mission 0015:
 *   - Forces endpoint to https://accounts.google.com/o/oauth2/v2/auth
 *   - Forces redirect_uri to http://127.0.0.1:8765/callback (fallback: http://localhost:8765/callback)
 *   - Uses system default browser (avoids webviews that trigger "browser may not be secure")
 *   - Always prints auth URL to console
 *
 * Prerequisites:
 *   - GCP OAuth client (Web) with redirect URI http://127.0.0.1:8765/callback or http://localhost:8765/callback
 *   - GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET (canonical) in env or .env.local. See docs/reil-core/OAUTH_ENV_CANON.md.
 *
 * Usage (from repo root):
 *   node scripts/oauth-proof/one-time-auth.mjs (with env set)
 *
 * After one successful run, .tokens.json contains refresh_token for agent use.
 */

import crypto from 'crypto';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { platform } from 'os';
import { getGmailOAuthEnv } from '../../connectors/gmail/lib/oauthEnvCanon.js';

function sha256Hex(str) {
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_PORT = 8765;
const DEFAULT_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'openid',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');
const TOKENS_FILE = path.join(__dirname, '.tokens.json');

/** Resolve scopes: env GMAIL_OAUTH_SCOPES (space-separated) overrides default. */
function getScopes() {
  const env = (process.env.GMAIL_OAUTH_SCOPES || '').trim();
  return env || DEFAULT_SCOPES;
}

/** Open URL in system default browser (cross-platform). */
function openBrowser(url) {
  const plat = platform();
  let cmd;
  if (plat === 'win32') {
    cmd = `start "" "${url}"`;
  } else if (plat === 'darwin') {
    cmd = `open "${url}"`;
  } else {
    cmd = `xdg-open "${url}"`;
  }
  exec(cmd, (err) => {
    if (err) {
      console.error('Failed to open browser automatically. Please open this URL manually:');
      console.error(url);
    }
  });
}

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

function base64URLEncode(buffer) {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function generateCodeVerifier() {
  return base64URLEncode(crypto.randomBytes(32));
}

function generateCodeChallenge(verifier) {
  return base64URLEncode(crypto.createHash('sha256').update(verifier).digest());
}

function generateState() {
  return base64URLEncode(crypto.randomBytes(16));
}

async function exchangeCodeForTokens(code, codeVerifier, clientId, clientSecret, redirectUri) {
  const params = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
    code_verifier: codeVerifier,
  });
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${err}`);
  }
  return res.json();
}

function createCallbackServer(port, ctx, pathPrefix = '/callback', use127 = false) {
  const host = use127 ? '127.0.0.1' : 'localhost';
  const base = `http://${host}:${port}`;
  const redirectUri = pathPrefix ? `${base}${pathPrefix}` : base.replace(/\/$/, '') || base;
  ctx.redirectUri = redirectUri;
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url || '', `http://${host}:${port}`);
      const pathname = url.pathname || '/';
      const match = pathPrefix === '' || pathPrefix === '/'
        ? (pathname === '/' || pathname === '')
        : pathname === pathPrefix || pathname === pathPrefix + '/';
      if (!match) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const code = url.searchParams.get('code');
      const stateReturned = url.searchParams.get('state');
      const error = url.searchParams.get('error');
      if (error) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(
          `<p>OAuth error: ${error}. Check redirect URI and consent screen. Close this tab.</p>`
        );
        ctx.done = true;
        ctx.error = error;
        server.close();
        return;
      }
      if (!code || stateReturned !== ctx.state) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Missing code or state mismatch');
        ctx.done = true;
        server.close();
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(
        '<p>One-time auth success. Tokens saved to .tokens.json. You can close this tab.</p>'
      );

      try {
        const tokens = await exchangeCodeForTokens(
          code,
          ctx.codeVerifier,
          ctx.clientId,
          ctx.clientSecret,
          ctx.redirectUri
        );
        const expiresAt = Date.now() + (tokens.expires_in || 3600) * 1000;
        const payload = {
          refresh_token: tokens.refresh_token,
          access_token: tokens.access_token,
          expires_at: expiresAt,
          scope: tokens.scope,
          client_id: ctx.clientId,
          redirect_uri: ctx.redirectUri,
          client_secret_sha256: sha256Hex(ctx.clientSecret),
        };
        fs.writeFileSync(TOKENS_FILE, JSON.stringify(payload, null, 2), 'utf8');
        console.log('\n--- One-time auth success ---');
        console.log('Tokens written to:', TOKENS_FILE);
        console.log('Use refresh_token for indefinite agent use (no user interaction).');
        console.error(JSON.stringify({
          receipt: 'oauth_mint_success',
          timestamp_iso: new Date().toISOString(),
          scope_list: (tokens.scope || '').split(/\s+/).filter(Boolean),
          refresh_token_present: !!tokens.refresh_token,
        }));
      } catch (e) {
        console.error(e);
        ctx.error = e.message;
      }
      ctx.done = true;
      server.close();
    });
    server.on('error', reject);
    server.listen(port, host, () => resolve(server));
  });
}

async function main() {
  loadEnv();
  printEnvSanityReceipt();
  const { env: oauthEnv, missing } = getGmailOAuthEnv(process.env);
  const clientId = oauthEnv.GMAIL_CLIENT_ID;
  const clientSecret = oauthEnv.GMAIL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error('Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET (canonical). See docs/reil-core/OAUTH_ENV_CANON.md. Missing:', missing?.length ? missing : 'client credentials');
    process.exit(1);
  }

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = generateState();

  const ctx = {
    clientId,
    clientSecret,
    codeVerifier,
    state,
    done: false,
    error: null,
    redirectUri: null,
  };

  const scopes = getScopes();
  let server;
  let redirectUri;
  let portUsed = DEFAULT_PORT;
  
  // Force redirect_uri to http://127.0.0.1:8765/callback with fallback http://localhost:8765/callback
  // Try 127.0.0.1 first (preferred for Google OAuth security)
  let use127 = true;
  try {
    server = await createCallbackServer(DEFAULT_PORT, ctx, '/callback', use127);
    redirectUri = `http://127.0.0.1:${DEFAULT_PORT}/callback`;
  } catch (e) {
    if (e.code === 'EADDRINUSE') {
      // Fallback to localhost if 127.0.0.1:8765 is in use
      use127 = false;
      try {
        server = await createCallbackServer(DEFAULT_PORT, ctx, '/callback', use127);
        redirectUri = `http://localhost:${DEFAULT_PORT}/callback`;
      } catch (e2) {
        if (e2.code === 'EADDRINUSE') {
          console.error(`Port ${DEFAULT_PORT} is in use. Please free the port and try again.`);
          process.exit(1);
        }
        throw e2;
      }
    } else {
      throw e;
    }
  }

  // Force endpoint to https://accounts.google.com/o/oauth2/v2/auth
  const authParams = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    access_type: 'offline',
    prompt: 'consent',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${authParams.toString()}`;

  // Always print auth URL to console
  console.log('--- OAuth Authorization URL ---');
  console.log(authUrl);
  console.log('---');
  console.log(`Callback server: ${redirectUri}`);
  console.log(`Scopes: ${scopes}`);
  console.log('Opening system default browser...');

  // Open auth URL in system default browser (avoid webviews/Playwright)
  openBrowser(authUrl);

  // Wait until callback received and tokens saved (server sets ctx.done)
  while (!ctx.done) {
    await new Promise((r) => setTimeout(r, 300));
  }
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (ctx.error) {
    console.error('OAuth error:', ctx.error);
    process.exit(1);
  }
  console.log('Done. For agent use: read refresh_token from', TOKENS_FILE);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
