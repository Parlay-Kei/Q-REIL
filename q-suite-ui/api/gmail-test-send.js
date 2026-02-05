/* eslint-env node */
/**
 * ENGDEL-REIL-GMAIL-TEST-ENDPOINT-0004: Internal Gmail test send endpoint.
 * Uses canonical OAuth env via getGmailOAuthEnv (GMAIL_*). See docs/reil-core/OAUTH_ENV_CANON.md.
 * Requires approval_token; enforces allowlist (stratanoble.co@gmail.com). No secrets in logs or response.
 */
import https from 'https';
import { getGmailOAuthEnv } from '../lib/oauthEnvCanon.js';

const ALLOWLIST = ['stratanoble.co@gmail.com'];
const DEFAULT_SENDER = 'stratanoble.co@gmail.com';

function refreshAccessToken(clientId, clientSecret, refreshToken) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }).toString();
    const req = https.request({
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        try {
          const j = JSON.parse(data);
          if (j.access_token) resolve(j.access_token);
          else reject(new Error(j.error || 'No access_token'));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function buildRawMessage(to, subject, body, fromAddress) {
  const from = fromAddress || DEFAULT_SENDER;
  const lines = [
    'From: ' + from,
    'To: ' + to,
    'Subject: ' + subject,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    '',
    body,
  ];
  return Buffer.from(lines.join('\r\n'), 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function sendGmailMessage(accessToken, raw) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ raw });
    const req = https.request({
      hostname: 'gmail.googleapis.com',
      path: '/gmail/v1/users/me/messages/send',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (_) {
            resolve({ id: '(parsed)' });
          }
        } else {
          reject(new Error('Gmail API ' + res.statusCode));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

export default function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ status: 'error', reason: 'Method not allowed' });
  }

  const approvalToken = (req.query?.approval_token || req.body?.approval_token || '').trim();
  if (!approvalToken) {
    return res.status(400).json({ status: 'refused', reason: 'approval_token missing' });
  }

  const to = ((req.query?.to || req.body?.to || '').trim() || DEFAULT_SENDER).toLowerCase();
  if (!ALLOWLIST.includes(to)) {
    return res.status(403).json({ status: 'refused', reason: 'recipient not allowlisted' });
  }

  const subject = (req.query?.subject || req.body?.subject || 'Q REIL Gmail test').trim();
  const bodyText = (req.query?.body_text || req.body?.body_text || req.body?.body || 'Q REIL Gmail test send. No reply needed.').trim();

  const { env: oauthEnv } = getGmailOAuthEnv(process.env);
  const clientId = oauthEnv.GMAIL_CLIENT_ID;
  const clientSecret = oauthEnv.GMAIL_CLIENT_SECRET;
  const refreshToken = oauthEnv.GMAIL_REFRESH_TOKEN;
  const senderAddress = oauthEnv.GMAIL_SENDER_ADDRESS || DEFAULT_SENDER;

  if (!clientId || !clientSecret || !refreshToken) {
    return res.status(503).json({ status: 'error', reason: 'Gmail OAuth not configured' });
  }

  refreshAccessToken(clientId, clientSecret, refreshToken)
    .then((accessToken) => {
      const raw = buildRawMessage(to, subject, bodyText, senderAddress);
      return sendGmailMessage(accessToken, raw);
    })
    .then((message) => {
      const messageId = message.id || '(id)';
      return res.status(200).json({ status: 'Sent', gmail_message_id: messageId });
    })
    .catch((err) => {
      return res.status(500).json({ status: 'error', reason: err.message || 'Send failed' });
    });
}
