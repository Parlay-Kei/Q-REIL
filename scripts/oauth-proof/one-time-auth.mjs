#!/usr/bin/env node
/**
 * OPS-901 one-time Gmail OAuth via Playwright — for indefinite agent use.
 *
 * Runs a local callback server and opens a browser (Playwright) to complete
 * Google sign-in once. Saves refresh_token (and access_token) to .tokens.json
 * so the app or agent can use refresh_token indefinitely without user interaction.
 *
 * Prerequisites:
 *   - GCP OAuth client (Web) with redirect URI http://localhost:8765/callback
 *   - GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET in env or scripts/oauth-proof/.env.local
 *
 * Usage (from repo root):
 *   cd scripts/oauth-proof && npm install && npm run one-time-auth
 *   Or: node scripts/oauth-proof/one-time-auth.mjs (with env set)
 *
 * After one successful run, .tokens.json contains refresh_token for agent use.
 */

import crypto from 'crypto';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORTS = [8765, 8766, 8767, 8768, 8769];
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'openid',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');
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

function createCallbackServer(port, ctx) {
  const redirectUri = `http://localhost:${port}/callback`;
  ctx.redirectUri = redirectUri;
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url || '', `http://localhost:${port}`);
      if (url.pathname !== '/callback') {
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
        };
        fs.writeFileSync(TOKENS_FILE, JSON.stringify(payload, null, 2), 'utf8');
        console.log('\n--- One-time auth success ---');
        console.log('Tokens written to:', TOKENS_FILE);
        console.log('Use refresh_token for indefinite agent use (no user interaction).');
      } catch (e) {
        console.error(e);
        ctx.error = e.message;
      }
      ctx.done = true;
      server.close();
    });
    server.on('error', reject);
    server.listen(port, () => resolve(server));
  });
}

async function main() {
  loadEnv();
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error('Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET (env or scripts/oauth-proof/.env.local).');
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

  const portEnv = process.env.PROOF_PORT ? [Number(process.env.PROOF_PORT)] : PORTS;
  let server;
  let portUsed;
  for (const port of portEnv) {
    try {
      server = await createCallbackServer(port, ctx);
      portUsed = port;
      break;
    } catch (e) {
      if (e.code === 'EADDRINUSE') {
        if (port === portEnv[portEnv.length - 1]) throw e;
        continue;
      }
      throw e;
    }
  }

  const redirectUri = ctx.redirectUri;
  const authParams = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${authParams.toString()}`;

  if (portUsed !== 8765) {
    console.log(`Port 8765 in use; using ${portUsed}. Add ${redirectUri} to GCP OAuth client redirect URIs if not already there.`);
  }
  console.log(`Callback server: ${redirectUri}`);
  console.log('Launching browser for one-time sign-in...');

  // Use installed Chrome or Edge so Google doesn't show "browser may not be secure"
  const channelEnv = process.env.PW_CHROME_CHANNEL;
  let browser;
  for (const channel of channelEnv ? [channelEnv] : ['chrome', 'msedge', undefined]) {
    try {
      browser = await chromium.launch({
        headless: false,
        channel: channel || undefined,
      });
      if (channel) console.log('Using browser:', channel);
      break;
    } catch (e) {
      if (channel === undefined) throw e;
    }
  }
  const page = await browser.newPage();

  try {
    await page.goto(authUrl, { waitUntil: 'domcontentloaded' });
    // Wait until callback received and tokens saved (server sets ctx.done)
    while (!ctx.done) {
      await new Promise((r) => setTimeout(r, 300));
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  } finally {
    await browser.close();
  }

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
