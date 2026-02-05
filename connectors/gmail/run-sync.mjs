#!/usr/bin/env node
/**
 * Run Gmail 7-day ingestion. Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY;
 * GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET (canonical); optional GMAIL_REFRESH_TOKEN (vault-only).
 * Env from canonical source: repo root .env.local first. See docs/reil-core/OAUTH_ENV_CANON.md.
 * Tokens: scripts/oauth-proof/.tokens.json (run proof-gmail-oauth.mjs first) or GMAIL_REFRESH_TOKEN.
 */
import { loadEnv } from './lib/load-env.js';
import { getGmailOAuthEnv } from './lib/oauthEnvCanon.js';
import { runSync } from './lib/ingest.js';
import { logRefreshFailureReceipt, readTokensFile } from './lib/oauth.js';

loadEnv();
const selected = process.env.LOAD_ENV_SELECTED_FILE || '(not set)';
const { env: oauthEnv, missing } = getGmailOAuthEnv(process.env);
const clientId = oauthEnv.GMAIL_CLIENT_ID;
const clientSecret = oauthEnv.GMAIL_CLIENT_SECRET;
console.error(JSON.stringify({
  receipt: 'oauth_env_sanity',
  client_id_present: !!clientId,
  client_secret_present: !!clientSecret,
  client_id_redacted: clientId ? `...${String(clientId).slice(-8)}` : '(missing)',
  client_secret_redacted: clientSecret ? '[REDACTED]' : '(missing)',
  load_env_selected_file: selected,
  missing_canon_keys: missing,
}));

async function main() {
  try {
  const opts = {};
  for (const a of process.argv.slice(2)) {
    if (a.startsWith('--mailbox-id=')) opts.mailboxId = a.slice('--mailbox-id='.length);
    if (a.startsWith('--org-id=')) opts.orgId = a.slice('--org-id='.length);
  }
  const result = await runSync(opts);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.errors?.length ? 1 : 0);
  } catch (err) {
    const msg = err.message || '';
    const isAuthRefreshError = msg.includes('401') || msg.includes('invalid_grant') || msg.includes('unauthorized_client') || msg.includes('invalid_client');
    if (isAuthRefreshError) {
      const tokens = readTokensFile();
      const responseData = err.response?.data;
      logRefreshFailureReceipt({
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
        grantType: 'refresh_token',
        refreshTokenPresent: !!(tokens?.refresh_token || getGmailOAuthEnv(process.env).env.GMAIL_REFRESH_TOKEN),
        error: responseData?.error ?? err.code ?? err.message ?? 'unknown',
        errorDescription: responseData?.error_description ?? (responseData?.error ? null : msg) ?? null,
      });
    }
    const apiDisabled = msg.includes('403') && (msg.includes('has not been used') || msg.includes('is disabled') || msg.includes('Access Not Configured'));
    if (apiDisabled) {
      const projectNumMatch = msg.match(/project\s*\[?(\d+)\]?/i) || msg.match(/project[_\s]+(?:id|number)[^\d]*(\d+)/i);
      const projectNum = projectNumMatch ? projectNumMatch[1] : null;
      console.error(err.message);
      console.error('');
      console.error('Enable the Gmail API in the same Google Cloud project where your OAuth client is defined (the project for GMAIL_CLIENT_ID).');
      if (projectNum) {
        console.error('Google reported project number:', projectNum);
        console.error('Direct link to enable Gmail API for that project:');
        console.error(`https://console.cloud.google.com/apis/library/gmail.googleapis.com?project=${projectNum}`);
      } else {
        console.error('In Cloud Console: select your project (e.g. Q SUITE), then APIs & Services → Library → search "Gmail API" → Enable.');
        console.error('https://console.cloud.google.com/apis/library/gmail.googleapis.com');
      }
    } else {
      console.error(err);
    }
    process.exit(1);
  }
}

main();
