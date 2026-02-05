/**
 * Gmail ingestion (ENGDEL-REIL-GMAIL-INGEST-0005).
 * Pull messages with checkpointing; for each message createSourceItemRaw (external_id = gmail_message_id);
 * for each attachment createDocumentPointer (external_id = gmail_attachment_id). Idempotent: rerun = zero duplicate inserts.
 * Also persists to mail_* and emits ledger events.
 * OAuth env via getGmailOAuthEnv (docs/reil-core/OAUTH_ENV_CANON.md).
 */
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
import { getGmailOAuthEnv } from './oauthEnvCanon.js';
import { getOAuth2ClientFromMailbox, getOAuth2ClientFromTokensFile, readTokensFile } from './oauth.js';
import { emitEvent, idempotencyKeys, EVENT_TYPES } from './ledger.js';
import { parseMessage, getHeader, participantEmailsFromMessages } from './parser.js';
import { downloadAndStore } from './attachments.js';

const BACKFILL_DAYS = 7;
const BATCH_SIZE = 100;
const DELAY_MS = 500;
const RUN_TAG = '7d';
const SOURCE_TYPE_GMAIL = 'gmail';

async function createMailboxFromTokensFile(supabase, oauth2) {
  const { token: accessToken } = (await oauth2.getAccessToken()) || {};
  if (!accessToken) throw new Error('No access_token; refresh .tokens.json (run refresh-token.mjs)');
  const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!userinfoRes.ok) throw new Error(`userinfo failed: ${userinfoRes.status}; refresh .tokens.json`);
  const userinfo = await userinfoRes.json();
  const providerEmail = userinfo.email;
  if (!providerEmail) throw new Error('userinfo did not return email');

  let org = (await supabase.from('orgs').select('id').limit(1).single()).data;
  if (!org?.id) {
    const { data: inserted } = await supabase.from('orgs').insert({ name: 'Q REIL', slug: 'q-reil' }).select('id').single();
    if (inserted?.id) org = { id: inserted.id };
  }
  if (!org?.id) throw new Error('No org found');
  let user = (await supabase.from('users').select('id').limit(1).single()).data;
  if (!user?.id) {
    const crypto = await import('crypto');
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: providerEmail,
      password: crypto.randomBytes(16).toString('hex'),
      email_confirm: true,
    });
    if (authErr || !authData?.user?.id) throw new Error(`No user; create user in Supabase Auth first: ${authErr?.message || 'unknown'}`);
    const { error: userErr } = await supabase.from('users').insert({ id: authData.user.id, org_id: org.id, email: providerEmail });
    if (userErr) throw new Error(`users insert failed: ${userErr.message}`);
    user = { id: authData.user.id };
  }

  let tokens = readTokensFile();
  const oauthEnv = getGmailOAuthEnv(process.env).env;
  if (!tokens?.refresh_token && oauthEnv.GMAIL_REFRESH_TOKEN?.trim()) {
    tokens = { ...(tokens || {}), refresh_token: oauthEnv.GMAIL_REFRESH_TOKEN.trim() };
  }
  if (!tokens?.refresh_token) throw new Error('No refresh_token in .tokens.json or GMAIL_REFRESH_TOKEN env. Run scripts/oauth-proof/proof-gmail-oauth.mjs or set GMAIL_REFRESH_TOKEN in repo root .env.local.');
  const expiresAt = tokens.expires_at ? new Date(tokens.expires_at).toISOString() : null;
  const row = {
    org_id: org.id,
    user_id: user.id,
    provider: 'gmail',
    provider_email: providerEmail,
    access_token_encrypted: tokens.access_token || '',
    refresh_token_encrypted: tokens.refresh_token,
    token_expires_at: expiresAt,
    status: 'connected',
  };
  const { data: mailbox, error } = await supabase.from('mailboxes').upsert(row, { onConflict: 'org_id,provider_email' }).select('id, org_id').single();
  if (error) throw new Error(`mailbox upsert failed: ${error.message}`);
  return mailbox;
}

export async function runSync(options = {}) {
  const { mailboxId, orgId } = options;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(supabaseUrl, supabaseKey);

  let mailbox, oauth2;
  if (mailboxId && orgId) {
    const { data, error } = await supabase.from('mailboxes').select('*').eq('id', mailboxId).single();
    if (error || !data) throw new Error(`Mailbox not found: ${mailboxId}`);
    mailbox = data;
    oauth2 = getOAuth2ClientFromMailbox(mailbox);
  } else {
    oauth2 = getOAuth2ClientFromTokensFile();
    const { data: mailboxes } = await supabase.from('mailboxes').select('id, org_id').limit(1);
    if (mailboxes?.length) {
      mailbox = { id: mailboxes[0].id, org_id: mailboxes[0].org_id };
    } else {
      mailbox = await createMailboxFromTokensFile(supabase, oauth2);
    }
  }

  const orgIdResolved = mailbox.org_id || orgId;
  if (!orgIdResolved) throw new Error('org_id required');
  // Force refresh so we use a fresh access_token (same scopes as refresh_token per Google OAuth2)
  await oauth2.getAccessToken().catch(() => {});
  const gmail = google.gmail({ version: 'v1', auth: oauth2 });
  const keys = idempotencyKeys(mailbox.id || 'script', RUN_TAG);

  // Pre-flight: one minimal Gmail API call; on 403 "not used or disabled", retry once after delay (propagation)
  const projectIdMatch = (msg) => (msg && msg.match(/project\s+(\d+)/)) ? RegExp.$1 : null;
  let preflightOk = false;
  for (let attempt = 0; attempt < 2 && !preflightOk; attempt++) {
    try {
      await gmail.users.getProfile({ userId: 'me' });
      preflightOk = true;
    } catch (preflightErr) {
      const code = preflightErr.code;
      const responseData = preflightErr.response?.data || {};
      const errorObj = responseData.error || responseData;
      const message = (errorObj.message || preflightErr.message || '').toLowerCase();
      const reason = errorObj.errors?.[0]?.reason || errorObj.reason || (errorObj.errors?.[0] ? 'unknown' : '');
      const projectId = projectIdMatch(errorObj.message || preflightErr.message);

      if (code === 403) {
        const isNotUsedOrDisabled = message.includes('has not been used') || message.includes('it is disabled');
        if (isNotUsedOrDisabled && attempt === 0) {
          await new Promise((r) => setTimeout(r, 65000));
          continue;
        }
        if (reason === 'insufficientPermissions' || message.includes('insufficient')) {
          throw new Error('Gmail API 403: insufficient permission (token scope). ' + (errorObj.message || preflightErr.message));
        }
        const hint = projectId
          ? ` Google reports this for project ID ${projectId} (the project that owns your OAuth client). If Gmail API is enabled in a different project, enable it in this project instead, or wait a few minutes if you just enabled it.`
          : '';
        throw new Error('Gmail API 403: ' + (errorObj.message || preflightErr.message) + hint);
      }
      throw preflightErr;
    }
  }

  await supabase.from('mailboxes').update({ status: 'syncing' }).eq('id', mailbox.id);
  const result = {
    threadsIngested: 0,
    messagesIngested: 0,
    attachmentsSaved: 0,
    sourceItemsRawMessages: 0,
    sourceItemsRawAttachments: 0,
    documentsCreated: 0,
    errors: [],
  };

  await emitEvent(supabase, {
    orgId: orgIdResolved,
    eventType: EVENT_TYPES.INGESTION_START,
    entityType: 'mailbox',
    entityId: mailbox.id || orgIdResolved,
    payload: { sync_type: 'backfill', window_days: BACKFILL_DAYS },
  });

  // Poll window: last N days; checkpoint = mailbox.last_synced_at (updated at end)
  const afterDate = new Date();
  afterDate.setDate(afterDate.getDate() - BACKFILL_DAYS);
  const afterUnix = Math.floor(afterDate.getTime() / 1000);
  let pageToken, latestHistoryId;

  try {
    do {
      const listRes = await gmail.users.threads.list({ userId: 'me', q: `after:${afterUnix}`, maxResults: BATCH_SIZE, pageToken });
      const threads = listRes.data.threads || [];
      latestHistoryId = listRes.data.historyId || latestHistoryId;
      for (const th of threads) {
        try {
          const delta = await ingestThread(gmail, supabase, mailbox, orgIdResolved, keys, th.id);
          result.threadsIngested += delta.threadsIngested;
          result.messagesIngested += delta.messagesIngested;
          result.attachmentsSaved += delta.attachmentsSaved;
          result.sourceItemsRawMessages += delta.sourceItemsRawMessages ?? 0;
          result.sourceItemsRawAttachments += delta.sourceItemsRawAttachments ?? 0;
          result.documentsCreated += delta.documentsCreated ?? 0;
        } catch (err) {
          result.errors.push(`Thread ${th.id}: ${err.message}`);
        }
      }
      pageToken = listRes.data.nextPageToken;
      if (pageToken) await new Promise((r) => setTimeout(r, DELAY_MS));
    } while (pageToken);
  } catch (err) {
    if (err.code === 403 && (err.message?.includes('Insufficient') || err.response?.data?.error?.reason === 'insufficientPermissions')) {
      throw new Error('Gmail API: Insufficient Permission. Re-run scripts/oauth-proof/proof-gmail-oauth.mjs to get a token with gmail.readonly scope.');
    }
    throw err;
  }

  if (mailbox.id && latestHistoryId) {
    await supabase.from('mailboxes').update({ last_history_id: latestHistoryId, last_synced_at: new Date().toISOString(), status: 'connected', sync_error_message: null }).eq('id', mailbox.id);
  }

  await emitEvent(supabase, {
    orgId: orgIdResolved,
    eventType: EVENT_TYPES.INGESTION_COMPLETE,
    entityType: 'mailbox',
    entityId: mailbox.id || orgIdResolved,
    payload: {
      threads_synced: result.threadsIngested,
      messages_synced: result.messagesIngested,
      attachments_saved: result.attachmentsSaved,
      source_items_raw_messages: result.sourceItemsRawMessages,
      source_items_raw_attachments: result.sourceItemsRawAttachments,
      documents_created: result.documentsCreated,
    },
  });

  return {
    ok: true,
    ...result,
    scanned: result.messagesIngested,
    inserted_raw: result.sourceItemsRawMessages,
    inserted_docs: result.documentsCreated,
  };
}

async function ingestThread(gmail, supabase, mailbox, orgId, keys, providerThreadId) {
  const result = { threadsIngested: 0, messagesIngested: 0, attachmentsSaved: 0, sourceItemsRawMessages: 0, sourceItemsRawAttachments: 0, documentsCreated: 0 };
  const threadRes = await gmail.users.threads.get({ userId: 'me', id: providerThreadId, format: 'full' });
  const thread = threadRes.data;
  const messages = thread.messages || [];
  if (messages.length === 0) return result;

  const firstMsg = messages[0], lastMsg = messages[messages.length - 1];
  const subject = getHeader(firstMsg, 'Subject') || '(No Subject)';
  const snippet = thread.snippet || '';
  const participantEmails = participantEmailsFromMessages(messages);
  const hasAttachments = messages.some((m) => (m.payload?.parts || []).some((p) => p.filename && p.body?.attachmentId));

  const { data: dbThread, error: threadErr } = await supabase.from('mail_threads').upsert({
    org_id: orgId,
    mailbox_id: mailbox.id,
    provider_thread_id: providerThreadId,
    subject,
    snippet,
    participant_emails: participantEmails,
    message_count: messages.length,
    has_attachments: hasAttachments,
    first_message_at: new Date(Number(firstMsg.internalDate)).toISOString(),
    last_message_at: new Date(Number(lastMsg.internalDate)).toISOString(),
    label_ids: firstMsg.labelIds || [],
  }, { onConflict: 'mailbox_id,provider_thread_id' }).select().single();
  if (threadErr) throw new Error(threadErr.message);
  if (!dbThread) throw new Error('Thread upsert returned no row');

  await emitEvent(supabase, { orgId, eventType: EVENT_TYPES.THREAD_INGESTED, entityType: 'mail_thread', entityId: dbThread.id, payload: { provider_thread_id: providerThreadId, message_count: messages.length } });
  result.threadsIngested = 1;

  for (const msg of messages) {
    const parsed = parseMessage(msg);
    const { data: dbMessage, error: msgErr } = await supabase.from('mail_messages').upsert({
      org_id: orgId,
      mailbox_id: mailbox.id,
      thread_id: dbThread.id,
      provider_message_id: msg.id,
      from_email: parsed.fromEmail,
      from_name: parsed.fromName,
      to_emails: parsed.toEmails,
      cc_emails: parsed.ccEmails,
      bcc_emails: parsed.bccEmails,
      subject: parsed.subject,
      snippet: parsed.snippet,
      body_plain: parsed.bodyPlain,
      body_html: parsed.bodyHtml,
      sent_at: new Date(Number(msg.internalDate)).toISOString(),
      internal_date: Number(msg.internalDate),
      raw_headers: parsed.headers,
      label_ids: msg.labelIds || [],
      has_attachments: parsed.attachments.length > 0,
      size_estimate: msg.sizeEstimate || 0,
    }, { onConflict: 'mailbox_id,provider_message_id' }).select().single();
    if (msgErr) throw new Error(msgErr.message);
    if (!dbMessage) continue;

    await emitEvent(supabase, { orgId, eventType: EVENT_TYPES.MESSAGE_INGESTED, entityType: 'mail_message', entityId: dbMessage.id, payload: { provider_message_id: msg.id, thread_id: dbThread.id, from_email: parsed.fromEmail } });
    result.messagesIngested += 1;

    // REIL source_items_raw: one row per message, external_id = gmail_message_id (DAL idempotency source:external_id)
    const msgIdempotencyKey = `${SOURCE_TYPE_GMAIL}:${msg.id}`;
    const { data: existingRaw } = await supabase
      .from('source_items_raw')
      .select('id')
      .eq('org_id', orgId)
      .eq('idempotency_key', msgIdempotencyKey)
      .maybeSingle();
    if (!existingRaw) {
      const payload = {
        received_at: new Date(Number(msg.internalDate)).toISOString(),
        from: parsed.fromEmail || null,
        to: parsed.toEmails?.length ? parsed.toEmails : null,
        subject: parsed.subject || null,
        body_text: parsed.bodyPlain || null,
        headers_json: parsed.headers || null,
        thread_id: providerThreadId || null,
        message_id: msg.id || null,
        attachment_count: parsed.attachments?.length ?? 0,
      };
      const { error: rawMsgErr } = await supabase.from('source_items_raw').insert({
        org_id: orgId,
        idempotency_key: msgIdempotencyKey,
        source_type: SOURCE_TYPE_GMAIL,
        payload,
      });
      if (!rawMsgErr) result.sourceItemsRawMessages += 1;
    }

    for (const att of parsed.attachments) {
      try {
        const { id: attachmentId, storage_path, storage_bucket, sha256 } = await downloadAndStore(supabase, gmail, {
          messageId: msg.id,
          attachmentId: att.attachmentId,
          filename: att.filename,
          mimeType: att.mimeType,
          sizeBytes: att.sizeBytes,
          dbMessageId: dbMessage.id,
          mailboxId: mailbox.id,
          orgId,
        });
        await emitEvent(supabase, { orgId, eventType: EVENT_TYPES.ATTACHMENT_INGESTED, entityType: 'mail_attachment', entityId: attachmentId, payload: { provider_message_id: msg.id, provider_attachment_id: att.attachmentId, filename: att.filename, size_bytes: att.sizeBytes } });
        result.attachmentsSaved += 1;

        // REIL documents: createDocumentPointer with external_id = gmail_attachment_id (idempotent: skip if ext:attachmentId exists)
        let documentId = null;
        if (storage_path) {
          const extTag = `ext:${att.attachmentId}`;
          const { data: existingDoc } = await supabase
            .from('documents')
            .select('id')
            .eq('org_id', orgId)
            .contains('tags', [extTag])
            .maybeSingle();
          if (existingDoc?.id) {
            documentId = existingDoc.id;
          } else {
            const tags = [`source:${SOURCE_TYPE_GMAIL}`, extTag];
            if (sha256) tags.push(`sha256:${sha256}`);
            const { data: docRow, error: docErr } = await supabase.from('documents').insert({
              org_id: orgId,
              created_by_user_id: null,
              name: att.filename || 'attachment',
              document_type: SOURCE_TYPE_GMAIL,
              storage_path,
              storage_bucket: storage_bucket || 'mail-attachments',
              mime_type: att.mimeType || null,
              file_size: att.sizeBytes ?? null,
              tags,
            }).select('id').single();
            if (!docErr && docRow?.id) {
              documentId = docRow.id;
              result.documentsCreated += 1;
            }
          }
        }
      } catch (e) {}
    }
  }
  return result;
}
