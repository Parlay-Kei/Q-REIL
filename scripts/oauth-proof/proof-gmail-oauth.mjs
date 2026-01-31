#!/usr/bin/env node
/**
 * OPS-901 standalone Gmail OAuth proof script.
 * Proves: (1) OAuth connect succeeds, (2) Token refresh via forced refresh.
 * Writes .tokens.json for indefinite agent use. Uses system browser (no Playwright).
 * Env from q-reil/.env.local or scripts/oauth-proof/.env.local or process.env.
 */

import crypto from 'crypto';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { platform } from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORTS = [8765, 8766, 8767, 8768, 8769];
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
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'openid',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

function base64URLEncode(buffer) {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function generateCodeVerifier() {
  return base64URLEncode(crypto.randomBytes(32));
}

function generateCodeChallenge(verifier) {
  return base64URLEncode(
    crypto.createHash('sha256').update(verifier).digest()
  );
}

function generateState() {
  return base64URLEncode(crypto.randomBytes(16));
}

function openBrowser(url) {
  const cmd = platform() === 'win32' ? `start "" "${url}"` : `open "${url}"`;
  exec(cmd, (err) => {
    if (err) console.log('Open this URL in your browser:', url);
  });
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

async function refreshAccessToken(refreshToken, clientId, clientSecret) {
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
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token refresh failed: ${res.status} ${err}`);
  }
  return res.json();
}

function main() {
  loadEnv();
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error('Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET (q-reil/.env.local or env)');
    process.exit(1);
  }

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = generateState();

  const portEnv = process.env.PROOF_PORT ? [Number(process.env.PROOF_PORT)] : PORTS;
  let server;
  let portUsed;
  let redirectUri;

  function handler(req, res) {
    const url = new URL(req.url || '', `http://localhost:${portUsed}`);
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
      res.end(`<p>OAuth error: ${error}. Check redirect URI and consent screen.</p>`);
      server.close();
      process.exit(1);
    }
    if (!code || stateReturned !== state) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Missing code or state mismatch');
      server.close();
      process.exit(1);
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<p>Proof: exchange and refresh in progress. Tokens saved to .tokens.json.</p>');

    (async () => {
      try {
        const tokens = await exchangeCodeForTokens(code, codeVerifier, clientId, clientSecret, redirectUri);
        const expiresAt = Date.now() + (tokens.expires_in || 3600) * 1000;
        fs.writeFileSync(TOKENS_FILE, JSON.stringify({
          refresh_token: tokens.refresh_token,
          access_token: tokens.access_token,
          expires_at: expiresAt,
          scope: tokens.scope,
        }, null, 2), 'utf8');
        console.log('\n--- OAuth success ---');
        console.log('Tokens written to:', TOKENS_FILE);

        const refreshed = await refreshAccessToken(tokens.refresh_token, clientId, clientSecret);
        console.log('\n--- Token refresh success ---');
        console.log('Proof complete. Indefinite agent use: refresh_token in .tokens.json');
      } catch (e) {
        console.error(e);
        process.exit(1);
      }
      server.close();
      process.exit(0);
    })();
  }

  (async () => {
    for (const port of portEnv) {
      server = http.createServer(handler);
      const ok = await new Promise((resolve) => {
        server.on('error', (e) => {
          if (e.code === 'EADDRINUSE') resolve(false);
          else resolve(false);
        });
        server.listen(port, () => resolve(true));
      });
      if (ok) {
        portUsed = port;
        redirectUri = `http://localhost:${port}/callback`;
        if (port !== 8765) console.log(`Port 8765 in use; using ${port}. Add ${redirectUri} to GCP if needed.`);
        break;
      }
      if (port === portEnv[portEnv.length - 1]) {
        console.error('All ports 8765-8769 in use.');
        process.exit(1);
      }
    }

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

    console.log(`Callback server: ${redirectUri}`);
    console.log('Opening system browser...');
    openBrowser(authUrl);
  })();
}

main();
