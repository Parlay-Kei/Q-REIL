/**
 * Single source of truth for Gmail OAuth env. Canonical keys only; legacy aliases absorbed.
 * Mission: PLATOPS-REIL-OAUTH-ENV-CANON-IMPLEMENT-0018. Contract: docs/reil-core/OAUTH_ENV_CANON.md
 *
 * getGmailOAuthEnv(envSource?) reads canonical keys first, falls back to aliases, returns
 * normalized object with canonical key names only and a "missing" list for receipts.
 * No script should read GOOGLE_OAUTH_* directly.
 */

const CANONICAL_KEYS = [
  'GMAIL_CLIENT_ID',
  'GMAIL_CLIENT_SECRET',
  'GMAIL_REFRESH_TOKEN',
  'GMAIL_SENDER_ADDRESS',
];

const ALIAS_MAP = {
  GMAIL_CLIENT_ID: ['GOOGLE_OAUTH_CLIENT_ID'],
  GMAIL_CLIENT_SECRET: ['GOOGLE_OAUTH_CLIENT_SECRET'],
  GMAIL_REFRESH_TOKEN: [],
  GMAIL_SENDER_ADDRESS: [],
};

/**
 * @param {NodeJS.ProcessEnv} [envSource=process.env]
 * @param {{ includeSource?: boolean }} [opts] If includeSource: true, result includes source (canonical|alias) per key for receipts; no values exposed.
 * @returns {{ env: object, missing: string[], source?: Record<string, 'canonical'|'alias'> }}
 */
export function getGmailOAuthEnv(envSource = process.env, opts = {}) {
  const env = {};
  const missing = [];
  const source = opts.includeSource ? {} : undefined;

  for (const key of CANONICAL_KEYS) {
    let value = (envSource[key] && String(envSource[key]).trim()) || null;
    let from = 'canonical';
    if (!value && ALIAS_MAP[key]?.length) {
      for (const alias of ALIAS_MAP[key]) {
        const v = envSource[alias] && String(envSource[alias]).trim();
        if (v) {
          value = v;
          from = 'alias';
          break;
        }
      }
    }
    if (value) {
      env[key] = value;
      if (source) source[key] = from;
    } else {
      missing.push(key);
    }
  }

  return source ? { env, missing, source } : { env, missing };
}

export { CANONICAL_KEYS, ALIAS_MAP };
