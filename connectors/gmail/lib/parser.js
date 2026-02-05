/**
 * Parse Gmail API message: headers, body, attachments.
 */
function decodeBase64Url(data) {
  if (!data) return '';
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(base64, 'base64').toString('utf-8');
}

function parseHeaders(headers) {
  const map = {};
  for (const h of headers || []) {
    if (h.name && h.value) map[h.name.toLowerCase()] = h.value;
  }
  return map;
}

function parseEmailAddress(value) {
  if (!value) return { email: '', name: null };
  const m = value.match(/^(.*?)\s*<(.+?)>$/);
  if (m) return { name: m[1].trim().replace(/^["']|["']$/g, '') || null, email: m[2].trim().toLowerCase() };
  return { name: null, email: value.trim().toLowerCase() };
}

function extractEmails(value) {
  if (!value) return [];
  return value.split(',').map((v) => parseEmailAddress(v.trim()).email).filter(Boolean);
}

function extractBody(part) {
  let plain = null, html = null;
  function find(p) {
    if (!p) return;
    if (p.mimeType === 'text/plain' && p.body?.data) plain = decodeBase64Url(p.body.data);
    else if (p.mimeType === 'text/html' && p.body?.data) html = decodeBase64Url(p.body.data);
    if (p.parts) p.parts.forEach(find);
  }
  find(part);
  return { plain, html };
}

function extractAttachments(part) {
  const out = [];
  function find(p) {
    if (!p) return;
    if (p.filename && p.body?.attachmentId) {
      out.push({ attachmentId: p.body.attachmentId, filename: p.filename, mimeType: p.mimeType || 'application/octet-stream', sizeBytes: p.body.size || 0 });
    }
    if (p.parts) p.parts.forEach(find);
  }
  find(part);
  return out;
}

export function parseMessage(message) {
  const headers = parseHeaders(message.payload?.headers);
  const fromHeader = headers['from'] || '';
  const { email: fromEmail, name: fromName } = parseEmailAddress(fromHeader);
  const { plain, html } = extractBody(message.payload);
  return {
    fromEmail,
    fromName,
    toEmails: extractEmails(headers['to'] || ''),
    ccEmails: extractEmails(headers['cc'] || ''),
    bccEmails: extractEmails(headers['bcc'] || ''),
    subject: headers['subject'] || '(No Subject)',
    snippet: message.snippet || '',
    bodyPlain: plain,
    bodyHtml: html,
    headers,
    attachments: extractAttachments(message.payload),
  };
}

export function getHeader(message, name) {
  const header = message.payload?.headers?.find((h) => h.name && h.name.toLowerCase() === name.toLowerCase());
  return header?.value ?? null;
}

export function participantEmailsFromMessages(messages) {
  const set = new Set();
  for (const msg of messages || []) {
    const from = getHeader(msg, 'From'), to = getHeader(msg, 'To'), cc = getHeader(msg, 'Cc');
    if (from) extractEmails(from).forEach((e) => set.add(e));
    if (to) extractEmails(to).forEach((e) => set.add(e));
    if (cc) extractEmails(cc).forEach((e) => set.add(e));
  }
  return Array.from(set);
}
