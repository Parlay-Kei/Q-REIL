/**
 * Gmail OAuth: get OAuth2 client from mailbox record, GMAIL_REFRESH_TOKEN env, or .tokens.json (script use).
 * Canonical env via getGmailOAuthEnv (docs/reil-core/OAUTH_ENV_CANON.md): GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN.
 * When using .tokens.json, client_id in file must match env (hard-fail guard).
 * When .tokens.json has client_secret_sha256, env secret hash must match (hard-fail guard).
 */
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import { getGmailOAuthEnv } from './oauthEnvCanon.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const TOKENS_FILE = path.join(ROOT, 'scripts/oauth-proof/.tokens.json');

function getCanonicalCreds() {
  const { env } = getGmailOAuthEnv(process.env);
  return { clientId: env.GMAIL_CLIENT_ID, clientSecret: env.GMAIL_CLIENT_SECRET };
}

function sha256Hex(str) {
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
}

const OAUTH_SECRET_MISMATCH_HINT =
  'Remediation: The client secret in env does not match the secret that issued the token. Set GMAIL_CLIENT_SECRET (or legacy GOOGLE_OAUTH_CLIENT_SECRET) in repo root .env.local to the same OAuth client secret used when the token was minted, or re-run node scripts/oauth-proof/proof-gmail-oauth.mjs with the current client to obtain a new token.';

/** Minimal debug receipt when refresh fails. Never logs tokens or secrets. */
export function logRefreshFailureReceipt(opts) {
  const receipt = {
    receipt: 'oauth_refresh_failure',
    token_endpoint: opts.tokenEndpoint ?? 'https://oauth2.googleapis.com/token',
    grant_type: opts.grantType ?? 'refresh_token',
    refresh_token_present: opts.refreshTokenPresent ?? null,
    error: opts.error ?? null,
    error_description: opts.errorDescription ?? null,
  };
  console.error(JSON.stringify(receipt));
}

export function createOAuth2Client() {
  const { clientId, clientSecret } = getCanonicalCreds();
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:8765/callback';
  if (!clientId || !clientSecret) {
    throw new Error('Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET (canonical vault: repo root .env.local or env). See docs/reil-core/OAUTH_ENV_CANON.md.');
  }
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getOAuth2ClientFromMailbox(mailbox) {
  const oauth2 = createOAuth2Client();
  const accessToken = mailbox.access_token_encrypted || '';
  const refreshToken = mailbox.refresh_token_encrypted || '';
  const expiry = mailbox.token_expires_at ? new Date(mailbox.token_expires_at).getTime() : undefined;
  oauth2.setCredentials({ access_token: accessToken, refresh_token: refreshToken, expiry_date: expiry });
  return oauth2;
}

const GMAIL_READONLY_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';

const OAUTH_CLIENT_MISMATCH_HINT =
  'Remediation: Use the same OAuth client as when the token was issued. Either (1) set GMAIL_CLIENT_ID/GMAIL_CLIENT_SECRET in repo root .env.local to match the client that issued the token in .tokens.json, or (2) re-run node scripts/oauth-proof/proof-gmail-oauth.mjs with the current client to obtain a new token.';

export function getOAuth2ClientFromTokensFile() {
  const { env: oauthEnv } = getGmailOAuthEnv(process.env);
  const envRefreshToken = oauthEnv.GMAIL_REFRESH_TOKEN;
  if (envRefreshToken && envRefreshToken.trim()) {
    const oauth2 = createOAuth2Client();
    oauth2.setCredentials({ refresh_token: envRefreshToken.trim(), expiry_date: 0 });
    return oauth2;
  }

  if (!fs.existsSync(TOKENS_FILE)) {
    throw new Error(`No .tokens.json at ${TOKENS_FILE} and GMAIL_REFRESH_TOKEN not set. Run scripts/oauth-proof/proof-gmail-oauth.mjs first, or set GMAIL_REFRESH_TOKEN in repo root .env.local.`);
  }
  const tokens = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));

  const { clientId: envClientId, clientSecret: envSecret } = getCanonicalCreds();
  const tokenClientId = tokens.client_id;
  if (tokenClientId && envClientId && tokenClientId !== envClientId) {
    throw new Error(
      `OAuth client mismatch: GMAIL_CLIENT_ID in env (or .env.local) does not match the client that issued the token in .tokens.json. Token was issued for client_id ...${String(tokenClientId).slice(-20)}; env has ...${String(envClientId).slice(-20)}. ${OAUTH_CLIENT_MISMATCH_HINT}`
    );
  }

  const storedSecretHash = tokens.client_secret_sha256;
  if (storedSecretHash && envSecret) {
    const envSecretHash = sha256Hex(envSecret);
    if (envSecretHash !== storedSecretHash) {
      throw new Error(
        `OAuth secret mismatch: GMAIL_CLIENT_SECRET in env does not match the secret that issued the token in .tokens.json (client_secret_sha256 in file differs from current env). ${OAUTH_SECRET_MISMATCH_HINT}`
      );
    }
  }

  // Per Google OAuth2: refreshed access_token has the SAME scopes as refresh_token. If stored scope
  // doesn't include gmail.readonly, the token will never have it until user re-authorizes.
  const scopeStr = tokens.scope || '';
  if (scopeStr && !scopeStr.includes('gmail.readonly')) {
    throw new Error(
      `Token in .tokens.json does not include gmail.readonly (scope: ${scopeStr.split(' ').slice(0, 2).join(' ') || 'none'}...). Re-run: node scripts/oauth-proof/proof-gmail-oauth.mjs and grant "View your email messages and settings".`
    );
  }
  const oauth2 = createOAuth2Client();
  // Set expiry in the past so the client always refreshes and uses the refresh_token's scopes
  oauth2.setCredentials({
    refresh_token: tokens.refresh_token,
    expiry_date: 0,
  });
  return oauth2;
}

export function readTokensFile() {
  if (!fs.existsSync(TOKENS_FILE)) return null;
  return JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
}
