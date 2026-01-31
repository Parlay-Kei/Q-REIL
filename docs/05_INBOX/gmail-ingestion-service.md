# BE-301: Gmail Ingestion Service Specification

**Sprint:** REIL/Q v0.2 - Gmail-First Inbox Spine
**Owner:** backend-dev
**Status:** ACTIVE
**Priority:** P0

---

## Overview

The Gmail Ingestion Service is a TypeScript/Node.js service that synchronizes Gmail threads, messages, and attachments into REIL's mail tables. It supports initial backfill (30 days) and incremental sync using Gmail's historyId cursor for real-time updates.

**Key Requirements:**
- Idempotent: Re-running does not duplicate data
- Batch processing to avoid rate limits
- SHA-256 hashing for attachment deduplication
- Full ledger event trail
- No PII in logs

---

## 1. Sync Strategy

### 1.1 Initial Backfill (First Sync)

When a mailbox is first connected:

```
Trigger: mailbox.status = 'connected' AND last_synced_at IS NULL
Window: Last 30 days (configurable constant BACKFILL_DAYS = 30)
Method: Gmail API threads.list with date filter
Cursor: Store historyId from first response for next incremental sync
```

**Algorithm:**
1. Calculate `after` timestamp: `now() - 30 days`
2. Call `gmail.users.threads.list({ userId: 'me', q: `after:${unixTimestamp}` })`
3. For each thread: fetch full thread details via `threads.get()`
4. For each message in thread: parse headers, body, attachments
5. Store thread → messages → attachments
6. Capture final `historyId` and store in `mailboxes.last_history_id`

**Rate Limiting:**
- Batch requests: Process 100 threads per batch
- Delay between batches: 1 second
- Exponential backoff on 429 errors

### 1.2 Incremental Sync (Subsequent Syncs)

After initial backfill:

```
Trigger: Scheduled job (every 5 minutes) OR manual refresh
Method: Gmail API history.list using stored historyId
Updates: Only fetch changes since last sync
```

**Algorithm:**
1. Load `mailboxes.last_history_id`
2. Call `gmail.users.history.list({ userId: 'me', startHistoryId })`
3. Process history events:
   - `messagesAdded`: Fetch and ingest new messages
   - `messagesDeleted`: Mark as deleted (soft delete, not implemented in v0.2)
   - `labelsAdded/labelsRemoved`: Update label_ids
4. Update `mailboxes.last_history_id` with latest historyId
5. Update `mailboxes.last_synced_at = now()`

**Edge Cases:**
- If `historyId` expired (410 error): Fall back to full backfill
- If no changes: Update `last_synced_at` only

---

## 2. Implementation Specification

### 2.1 Service Structure

```
05_INBOX/
├── gmail-ingestion/
│   ├── GmailIngestService.ts        # Main service orchestrator
│   ├── GmailApiClient.ts            # Gmail API wrapper
│   ├── MessageParser.ts             # Parse Gmail message format
│   ├── AttachmentDownloader.ts      # Download & hash attachments
│   ├── LedgerWriter.ts              # Write audit events
│   └── types.ts                     # TypeScript interfaces
└── gmail-ingestion-service.md       # This spec
```

### 2.2 GmailIngestService.ts

**Main orchestrator for sync operations.**

```typescript
import { gmail_v1, google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
import { GmailApiClient } from './GmailApiClient';
import { MessageParser } from './MessageParser';
import { AttachmentDownloader } from './AttachmentDownloader';
import { LedgerWriter } from './LedgerWriter';

export interface SyncOptions {
  mailboxId: string;
  orgId: string;
  forceFullSync?: boolean;
}

export interface SyncResult {
  threadsIngested: number;
  messagesIngested: number;
  attachmentsSaved: number;
  errors: string[];
}

export class GmailIngestService {
  private supabase: ReturnType<typeof createClient>;
  private gmailClient: GmailApiClient;
  private messageParser: MessageParser;
  private attachmentDownloader: AttachmentDownloader;
  private ledger: LedgerWriter;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.gmailClient = new GmailApiClient();
    this.messageParser = new MessageParser();
    this.attachmentDownloader = new AttachmentDownloader(this.supabase);
    this.ledger = new LedgerWriter(this.supabase);
  }

  /**
   * Main entry point for mailbox sync
   */
  async syncMailbox(options: SyncOptions): Promise<SyncResult> {
    const { mailboxId, orgId, forceFullSync } = options;

    // Load mailbox record
    const { data: mailbox, error } = await this.supabase
      .from('mailboxes')
      .select('*')
      .eq('id', mailboxId)
      .single();

    if (error || !mailbox) {
      throw new Error(`Mailbox not found: ${mailboxId}`);
    }

    // Update status to syncing
    await this.supabase
      .from('mailboxes')
      .update({ status: 'syncing' })
      .eq('id', mailboxId);

    const syncType = forceFullSync || !mailbox.last_history_id
      ? 'backfill'
      : 'incremental';

    // Log sync start
    await this.ledger.write({
      event_type: 'SYNC_STARTED',
      org_id: orgId,
      entity_type: 'mailbox',
      entity_id: mailboxId,
      payload: { sync_type: syncType },
    });

    try {
      let result: SyncResult;

      if (syncType === 'backfill') {
        result = await this.performBackfill(mailbox, orgId);
      } else {
        result = await this.performIncrementalSync(mailbox, orgId);
      }

      // Update mailbox status
      await this.supabase
        .from('mailboxes')
        .update({
          status: 'connected',
          last_synced_at: new Date().toISOString(),
          sync_error_message: null,
        })
        .eq('id', mailboxId);

      // Log sync completion
      await this.ledger.write({
        event_type: 'SYNC_COMPLETED',
        org_id: orgId,
        entity_type: 'mailbox',
        entity_id: mailboxId,
        payload: {
          threads_synced: result.threadsIngested,
          messages_synced: result.messagesIngested,
          attachments_saved: result.attachmentsSaved,
        },
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';

      // Update mailbox with error
      await this.supabase
        .from('mailboxes')
        .update({
          status: 'error',
          sync_error_message: errorMessage,
        })
        .eq('id', mailboxId);

      throw err;
    }
  }

  /**
   * Initial backfill: last 30 days
   */
  private async performBackfill(
    mailbox: any,
    orgId: string
  ): Promise<SyncResult> {
    const BACKFILL_DAYS = 30;
    const BATCH_SIZE = 100;
    const DELAY_MS = 1000;

    const result: SyncResult = {
      threadsIngested: 0,
      messagesIngested: 0,
      attachmentsSaved: 0,
      errors: [],
    };

    // Calculate after timestamp (30 days ago)
    const afterDate = new Date();
    afterDate.setDate(afterDate.getDate() - BACKFILL_DAYS);
    const afterUnix = Math.floor(afterDate.getTime() / 1000);

    // Get OAuth client
    const oauth2Client = this.getOAuth2Client(mailbox);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    let pageToken: string | undefined;
    let latestHistoryId: string | undefined;

    do {
      // Fetch thread list
      const listResponse = await gmail.users.threads.list({
        userId: 'me',
        q: `after:${afterUnix}`,
        maxResults: BATCH_SIZE,
        pageToken,
      });

      const threads = listResponse.data.threads || [];
      latestHistoryId = listResponse.data.historyId || latestHistoryId;

      // Process each thread
      for (const thread of threads) {
        try {
          const threadResult = await this.ingestThread(
            gmail,
            thread.id!,
            mailbox,
            orgId
          );
          result.threadsIngested += threadResult.threadsIngested;
          result.messagesIngested += threadResult.messagesIngested;
          result.attachmentsSaved += threadResult.attachmentsSaved;
        } catch (err) {
          result.errors.push(
            `Thread ${thread.id}: ${err instanceof Error ? err.message : 'Unknown error'}`
          );
        }
      }

      pageToken = listResponse.data.nextPageToken || undefined;

      // Rate limiting delay
      if (pageToken) {
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
      }
    } while (pageToken);

    // Store historyId for next incremental sync
    if (latestHistoryId) {
      await this.supabase
        .from('mailboxes')
        .update({ last_history_id: latestHistoryId })
        .eq('id', mailbox.id);
    }

    return result;
  }

  /**
   * Incremental sync using historyId cursor
   */
  private async performIncrementalSync(
    mailbox: any,
    orgId: string
  ): Promise<SyncResult> {
    const result: SyncResult = {
      threadsIngested: 0,
      messagesIngested: 0,
      attachmentsSaved: 0,
      errors: [],
    };

    const oauth2Client = this.getOAuth2Client(mailbox);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    try {
      const historyResponse = await gmail.users.history.list({
        userId: 'me',
        startHistoryId: mailbox.last_history_id,
      });

      const history = historyResponse.data.history || [];
      const latestHistoryId = historyResponse.data.historyId;

      // Process messagesAdded events
      for (const record of history) {
        if (record.messagesAdded) {
          for (const msgAdded of record.messagesAdded) {
            try {
              // Fetch full message
              const msgResponse = await gmail.users.messages.get({
                userId: 'me',
                id: msgAdded.message!.id!,
                format: 'full',
              });

              const message = msgResponse.data;
              const threadId = message.threadId!;

              // Ingest thread (will upsert if exists)
              const threadResult = await this.ingestThread(
                gmail,
                threadId,
                mailbox,
                orgId
              );

              result.threadsIngested += threadResult.threadsIngested;
              result.messagesIngested += threadResult.messagesIngested;
              result.attachmentsSaved += threadResult.attachmentsSaved;
            } catch (err) {
              result.errors.push(
                `Message ${msgAdded.message!.id}: ${err instanceof Error ? err.message : 'Unknown error'}`
              );
            }
          }
        }

        // Handle label changes (update existing messages)
        if (record.labelsAdded || record.labelsRemoved) {
          // TODO: Implement label sync in future iteration
        }
      }

      // Update historyId cursor
      if (latestHistoryId) {
        await this.supabase
          .from('mailboxes')
          .update({ last_history_id: latestHistoryId })
          .eq('id', mailbox.id);
      }
    } catch (err: any) {
      // HistoryId expired (410 error) - fall back to full sync
      if (err.code === 410) {
        return await this.performBackfill(mailbox, orgId);
      }
      throw err;
    }

    return result;
  }

  /**
   * Ingest a single thread with all messages and attachments
   */
  private async ingestThread(
    gmail: gmail_v1.Gmail,
    threadId: string,
    mailbox: any,
    orgId: string
  ): Promise<SyncResult> {
    const result: SyncResult = {
      threadsIngested: 0,
      messagesIngested: 0,
      attachmentsSaved: 0,
      errors: [],
    };

    // Fetch full thread
    const threadResponse = await gmail.users.threads.get({
      userId: 'me',
      id: threadId,
      format: 'full',
    });

    const thread = threadResponse.data;
    const messages = thread.messages || [];

    if (messages.length === 0) return result;

    // Parse thread metadata
    const firstMessage = messages[0];
    const lastMessage = messages[messages.length - 1];

    const subject = this.messageParser.getHeader(firstMessage, 'Subject') || '(No Subject)';
    const snippet = thread.snippet || '';

    // Collect all participant emails
    const participantEmails = new Set<string>();
    messages.forEach((msg) => {
      const from = this.messageParser.getHeader(msg, 'From');
      const to = this.messageParser.getHeader(msg, 'To');
      const cc = this.messageParser.getHeader(msg, 'Cc');

      if (from) this.messageParser.extractEmails(from).forEach((e) => participantEmails.add(e));
      if (to) this.messageParser.extractEmails(to).forEach((e) => participantEmails.add(e));
      if (cc) this.messageParser.extractEmails(cc).forEach((e) => participantEmails.add(e));
    });

    const hasAttachments = messages.some((msg) =>
      msg.payload?.parts?.some((part) => part.filename && part.body?.attachmentId)
    );

    // Upsert thread
    const { data: dbThread, error: threadError } = await this.supabase
      .from('mail_threads')
      .upsert(
        {
          org_id: orgId,
          mailbox_id: mailbox.id,
          provider_thread_id: threadId,
          subject,
          snippet,
          participant_emails: Array.from(participantEmails),
          message_count: messages.length,
          has_attachments: hasAttachments,
          first_message_at: new Date(parseInt(firstMessage.internalDate!)).toISOString(),
          last_message_at: new Date(parseInt(lastMessage.internalDate!)).toISOString(),
          label_ids: firstMessage.labelIds || [],
        },
        { onConflict: 'mailbox_id,provider_thread_id' }
      )
      .select()
      .single();

    if (threadError) {
      throw new Error(`Failed to upsert thread: ${threadError.message}`);
    }

    // Log thread ingestion
    await this.ledger.write({
      event_type: 'THREAD_INGESTED',
      org_id: orgId,
      entity_type: 'mail_thread',
      entity_id: dbThread.id,
      payload: { provider_thread_id: threadId, message_count: messages.length },
    });

    result.threadsIngested = 1;

    // Ingest each message
    for (const message of messages) {
      const msgResult = await this.ingestMessage(
        gmail,
        message,
        dbThread.id,
        mailbox,
        orgId
      );
      result.messagesIngested += msgResult.messagesIngested;
      result.attachmentsSaved += msgResult.attachmentsSaved;
    }

    return result;
  }

  /**
   * Ingest a single message with attachments
   */
  private async ingestMessage(
    gmail: gmail_v1.Gmail,
    message: gmail_v1.Schema$Message,
    threadId: string,
    mailbox: any,
    orgId: string
  ): Promise<SyncResult> {
    const result: SyncResult = {
      threadsIngested: 0,
      messagesIngested: 0,
      attachmentsSaved: 0,
      errors: [],
    };

    const parsed = this.messageParser.parseMessage(message);

    // Upsert message
    const { data: dbMessage, error: msgError } = await this.supabase
      .from('mail_messages')
      .upsert(
        {
          org_id: orgId,
          mailbox_id: mailbox.id,
          thread_id: threadId,
          provider_message_id: message.id!,
          from_email: parsed.fromEmail,
          from_name: parsed.fromName,
          to_emails: parsed.toEmails,
          cc_emails: parsed.ccEmails,
          bcc_emails: parsed.bccEmails,
          subject: parsed.subject,
          snippet: parsed.snippet,
          body_plain: parsed.bodyPlain,
          body_html: parsed.bodyHtml,
          sent_at: new Date(parseInt(message.internalDate!)).toISOString(),
          internal_date: parseInt(message.internalDate!),
          raw_headers: parsed.headers,
          label_ids: message.labelIds || [],
          has_attachments: parsed.attachments.length > 0,
          size_estimate: message.sizeEstimate || 0,
        },
        { onConflict: 'mailbox_id,provider_message_id' }
      )
      .select()
      .single();

    if (msgError) {
      throw new Error(`Failed to upsert message: ${msgError.message}`);
    }

    // Log message ingestion
    await this.ledger.write({
      event_type: 'MESSAGE_INGESTED',
      org_id: orgId,
      entity_type: 'mail_message',
      entity_id: dbMessage.id,
      payload: {
        provider_message_id: message.id!,
        thread_id: threadId,
        from_email: parsed.fromEmail,
      },
    });

    result.messagesIngested = 1;

    // Download and store attachments
    for (const attachment of parsed.attachments) {
      try {
        const attachmentResult = await this.attachmentDownloader.downloadAndStore({
          gmail,
          messageId: message.id!,
          attachmentId: attachment.attachmentId,
          filename: attachment.filename,
          mimeType: attachment.mimeType,
          sizeBytes: attachment.sizeBytes,
          dbMessageId: dbMessage.id,
          mailboxId: mailbox.id,
          orgId,
        });

        result.attachmentsSaved += 1;
      } catch (err) {
        result.errors.push(
          `Attachment ${attachment.filename}: ${err instanceof Error ? err.message : 'Unknown error'}`
        );
      }
    }

    return result;
  }

  /**
   * Create OAuth2 client from mailbox tokens
   */
  private getOAuth2Client(mailbox: any) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: this.decryptToken(mailbox.access_token_encrypted),
      refresh_token: this.decryptToken(mailbox.refresh_token_encrypted),
      expiry_date: mailbox.token_expires_at
        ? new Date(mailbox.token_expires_at).getTime()
        : undefined,
    });

    return oauth2Client;
  }

  /**
   * Decrypt OAuth token (placeholder - implement with crypto library)
   */
  private decryptToken(encrypted: string): string {
    // TODO: Implement AES-256-GCM decryption
    // For now, assume tokens are stored in plaintext (NOT production ready)
    return encrypted;
  }
}
```

### 2.3 MessageParser.ts

**Parses Gmail API message format into structured data.**

```typescript
import { gmail_v1 } from 'googleapis';
import { decode } from 'he'; // HTML entity decoder

export interface ParsedMessage {
  fromEmail: string;
  fromName: string | null;
  toEmails: string[];
  ccEmails: string[];
  bccEmails: string[];
  subject: string;
  snippet: string;
  bodyPlain: string | null;
  bodyHtml: string | null;
  headers: Record<string, string>;
  attachments: ParsedAttachment[];
}

export interface ParsedAttachment {
  attachmentId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

export class MessageParser {
  /**
   * Parse Gmail message into structured format
   */
  parseMessage(message: gmail_v1.Schema$Message): ParsedMessage {
    const headers = this.parseHeaders(message.payload?.headers || []);

    const fromHeader = headers['from'] || '';
    const { email: fromEmail, name: fromName } = this.parseEmailAddress(fromHeader);

    const toEmails = this.extractEmails(headers['to'] || '');
    const ccEmails = this.extractEmails(headers['cc'] || '');
    const bccEmails = this.extractEmails(headers['bcc'] || '');

    const subject = headers['subject'] || '(No Subject)';
    const snippet = message.snippet || '';

    const { plain, html } = this.extractBody(message.payload);
    const attachments = this.extractAttachments(message.payload);

    return {
      fromEmail,
      fromName,
      toEmails,
      ccEmails,
      bccEmails,
      subject,
      snippet,
      bodyPlain: plain,
      bodyHtml: html,
      headers,
      attachments,
    };
  }

  /**
   * Get header value by name (case-insensitive)
   */
  getHeader(message: gmail_v1.Schema$Message, name: string): string | null {
    const header = message.payload?.headers?.find(
      (h) => h.name?.toLowerCase() === name.toLowerCase()
    );
    return header?.value || null;
  }

  /**
   * Parse headers into key-value map
   */
  private parseHeaders(headers: gmail_v1.Schema$MessagePartHeader[]): Record<string, string> {
    const map: Record<string, string> = {};
    headers.forEach((h) => {
      if (h.name && h.value) {
        map[h.name.toLowerCase()] = h.value;
      }
    });
    return map;
  }

  /**
   * Parse email address from "Name <email@domain.com>" format
   */
  parseEmailAddress(value: string): { email: string; name: string | null } {
    const match = value.match(/^(.*?)\s*<(.+?)>$/);
    if (match) {
      return {
        name: decode(match[1].trim().replace(/^["']|["']$/g, '')),
        email: match[2].trim().toLowerCase(),
      };
    }
    return {
      name: null,
      email: value.trim().toLowerCase(),
    };
  }

  /**
   * Extract all emails from comma-separated header value
   */
  extractEmails(value: string): string[] {
    if (!value) return [];
    const emails = value.split(',').map((v) => {
      const { email } = this.parseEmailAddress(v);
      return email;
    });
    return emails.filter(Boolean);
  }

  /**
   * Extract plain and HTML body from message parts
   */
  private extractBody(
    payload: gmail_v1.Schema$MessagePart | undefined
  ): { plain: string | null; html: string | null } {
    if (!payload) return { plain: null, html: null };

    let plain: string | null = null;
    let html: string | null = null;

    const findBody = (part: gmail_v1.Schema$MessagePart) => {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        plain = this.decodeBase64Url(part.body.data);
      } else if (part.mimeType === 'text/html' && part.body?.data) {
        html = this.decodeBase64Url(part.body.data);
      }

      if (part.parts) {
        part.parts.forEach(findBody);
      }
    };

    findBody(payload);
    return { plain, html };
  }

  /**
   * Extract attachments from message parts
   */
  private extractAttachments(
    payload: gmail_v1.Schema$MessagePart | undefined
  ): ParsedAttachment[] {
    if (!payload) return [];

    const attachments: ParsedAttachment[] = [];

    const findAttachments = (part: gmail_v1.Schema$MessagePart) => {
      if (part.filename && part.body?.attachmentId) {
        attachments.push({
          attachmentId: part.body.attachmentId,
          filename: part.filename,
          mimeType: part.mimeType || 'application/octet-stream',
          sizeBytes: part.body.size || 0,
        });
      }

      if (part.parts) {
        part.parts.forEach(findAttachments);
      }
    };

    findAttachments(payload);
    return attachments;
  }

  /**
   * Decode base64url-encoded data
   */
  private decodeBase64Url(data: string): string {
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    return Buffer.from(base64, 'base64').toString('utf-8');
  }
}
```

### 2.4 AttachmentDownloader.ts

**Downloads attachments and stores in Supabase Storage with SHA-256 hashing.**

```typescript
import { gmail_v1 } from 'googleapis';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export interface DownloadOptions {
  gmail: gmail_v1.Gmail;
  messageId: string;
  attachmentId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  dbMessageId: string;
  mailboxId: string;
  orgId: string;
}

export class AttachmentDownloader {
  private supabase: SupabaseClient;
  private readonly STORAGE_BUCKET = 'mail-attachments';

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Download attachment from Gmail and store in Supabase Storage
   */
  async downloadAndStore(options: DownloadOptions): Promise<string> {
    const {
      gmail,
      messageId,
      attachmentId,
      filename,
      mimeType,
      sizeBytes,
      dbMessageId,
      mailboxId,
      orgId,
    } = options;

    // Download attachment from Gmail
    const attachmentResponse = await gmail.users.messages.attachments.get({
      userId: 'me',
      messageId,
      id: attachmentId,
    });

    const data = attachmentResponse.data.data!;
    const buffer = Buffer.from(data, 'base64url');

    // Calculate SHA-256 hash
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');

    // Check if attachment already exists (deduplication)
    const { data: existingAttachment } = await this.supabase
      .from('mail_attachments')
      .select('id, storage_path')
      .eq('message_id', dbMessageId)
      .eq('provider_attachment_id', attachmentId)
      .single();

    if (existingAttachment) {
      // Already ingested, skip
      return existingAttachment.id;
    }

    // Generate storage path: org_id/mailbox_id/sha256/filename
    const storagePath = `${orgId}/${mailboxId}/${sha256}/${filename}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await this.supabase.storage
      .from(this.STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: true, // Allow overwrite if same path
      });

    if (uploadError) {
      throw new Error(`Failed to upload attachment: ${uploadError.message}`);
    }

    // Store metadata in database
    const { data: dbAttachment, error: dbError } = await this.supabase
      .from('mail_attachments')
      .insert({
        org_id: orgId,
        mailbox_id: mailboxId,
        message_id: dbMessageId,
        provider_attachment_id: attachmentId,
        filename,
        mime_type: mimeType,
        size_bytes: sizeBytes,
        storage_path: storagePath,
        sha256,
      })
      .select()
      .single();

    if (dbError) {
      throw new Error(`Failed to store attachment metadata: ${dbError.message}`);
    }

    // Log ledger event
    await this.supabase.from('ledger').insert({
      event_type: 'ATTACHMENT_SAVED',
      org_id: orgId,
      entity_type: 'mail_attachment',
      entity_id: dbAttachment.id,
      payload: {
        message_id: dbMessageId,
        filename,
        sha256,
        size_bytes: sizeBytes,
      },
    });

    return dbAttachment.id;
  }
}
```

---

## 3. Idempotency Rules

### 3.1 UNIQUE Constraints

All UNIQUE constraints are defined in the schema:

```sql
-- Prevent duplicate mailbox connections
UNIQUE(org_id, provider_email) ON mailboxes

-- Prevent duplicate threads per mailbox
UNIQUE(mailbox_id, provider_thread_id) ON mail_threads

-- Prevent duplicate messages per mailbox
UNIQUE(mailbox_id, provider_message_id) ON mail_messages

-- Prevent duplicate attachments per message
UNIQUE(message_id, provider_attachment_id) ON mail_attachments
```

### 3.2 Upsert Patterns

All inserts use upsert with conflict resolution:

```typescript
// Example: Thread upsert
await supabase
  .from('mail_threads')
  .upsert(
    { ...threadData },
    { onConflict: 'mailbox_id,provider_thread_id' }
  );
```

**Behavior:**
- If conflict: UPDATE existing row
- If no conflict: INSERT new row
- Re-running sync will update metadata (snippet, message_count, etc.) but not duplicate

### 3.3 Attachment Deduplication

Attachments are deduplicated by `sha256` hash:

1. Download attachment
2. Calculate SHA-256 hash
3. Storage path includes hash: `org_id/mailbox_id/sha256/filename`
4. Supabase Storage `upsert: true` overwrites if same path
5. Database record uses UNIQUE constraint on `(message_id, provider_attachment_id)`

**Result:** Same attachment received in multiple messages is stored once per unique content hash.

---

## 4. Ledger Events

All ingestion operations write audit events to the `ledger` table.

### 4.1 Event Types

| Event Type | When | Payload |
|------------|------|---------|
| `SYNC_STARTED` | Sync begins | `{ sync_type: 'backfill' \| 'incremental' }` |
| `SYNC_COMPLETED` | Sync finishes | `{ threads_synced, messages_synced, attachments_saved }` |
| `THREAD_INGESTED` | Thread created/updated | `{ provider_thread_id, message_count }` |
| `MESSAGE_INGESTED` | Message created/updated | `{ provider_message_id, thread_id, from_email }` |
| `ATTACHMENT_SAVED` | Attachment stored | `{ message_id, filename, sha256, size_bytes }` |

### 4.2 LedgerWriter Implementation

```typescript
import { SupabaseClient } from '@supabase/supabase-js';

export interface LedgerEvent {
  event_type: string;
  org_id: string;
  entity_type: string;
  entity_id: string;
  payload: Record<string, any>;
  actor_id?: string;
}

export class LedgerWriter {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async write(event: LedgerEvent): Promise<void> {
    const { error } = await this.supabase.from('ledger').insert({
      event_type: event.event_type,
      org_id: event.org_id,
      entity_type: event.entity_type,
      entity_id: event.entity_id,
      payload: event.payload,
      actor_id: event.actor_id || null,
      occurred_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Failed to write ledger event:', error);
      // Don't throw - ledger failure should not block ingestion
    }
  }
}
```

---

## 5. Security & Privacy

### 5.1 Token Encryption

OAuth tokens MUST be encrypted before storing in `mailboxes` table:

```typescript
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY!; // 32-byte key
const ALGORITHM = 'aes-256-gcm';

function encryptToken(plaintext: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decryptToken(encrypted: string): string {
  const parts = encrypted.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const ciphertext = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

### 5.2 No PII in Logs

**NEVER log:**
- Email body content (`body_plain`, `body_html`)
- Email addresses (except in structured ledger events)
- OAuth tokens
- Attachment contents

**Safe to log:**
- Message IDs
- Thread IDs
- Message counts
- Sync status
- Error messages (sanitized)

---

## 6. Rate Limiting & Error Handling

### 6.1 Gmail API Quotas

| Operation | Quota | Strategy |
|-----------|-------|----------|
| `threads.list` | 100 req/sec | Batch 100 threads, 1s delay between batches |
| `threads.get` | 100 req/sec | Same as above |
| `messages.get` | 100 req/sec | Same as above |
| `attachments.get` | 100 req/sec | Download sequentially with delay |

### 6.2 Exponential Backoff

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 5
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;

      // Don't retry on auth errors
      if (err.code === 401 || err.code === 403) {
        throw err;
      }

      // Exponential backoff on rate limit (429)
      if (err.code === 429) {
        const delayMs = Math.pow(2, i) * 1000; // 1s, 2s, 4s, 8s, 16s
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }

      // Don't retry on other client errors
      if (err.code >= 400 && err.code < 500) {
        throw err;
      }

      // Retry on server errors (5xx)
      if (err.code >= 500) {
        const delayMs = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }

      throw err;
    }
  }

  throw lastError!;
}
```

---

## 7. Testing Strategy

### 7.1 Unit Tests

```typescript
// Test: Message parser extracts emails correctly
describe('MessageParser', () => {
  it('should parse email address with name', () => {
    const parser = new MessageParser();
    const result = parser.parseEmailAddress('John Doe <john@example.com>');
    expect(result.email).toBe('john@example.com');
    expect(result.name).toBe('John Doe');
  });

  it('should extract multiple emails from comma-separated list', () => {
    const parser = new MessageParser();
    const result = parser.extractEmails('john@example.com, jane@example.com');
    expect(result).toEqual(['john@example.com', 'jane@example.com']);
  });
});

// Test: SHA-256 hashing for attachments
describe('AttachmentDownloader', () => {
  it('should calculate correct SHA-256 hash', async () => {
    const buffer = Buffer.from('test content');
    const expectedHash = crypto.createHash('sha256').update(buffer).digest('hex');
    // ... test implementation
  });
});
```

### 7.2 Integration Tests

```typescript
// Test: Idempotency - re-running sync should not duplicate
describe('GmailIngestService', () => {
  it('should not duplicate threads on re-sync', async () => {
    const service = new GmailIngestService();

    // First sync
    await service.syncMailbox({ mailboxId: 'test-id', orgId: 'org-1' });

    const { count: count1 } = await supabase
      .from('mail_threads')
      .select('*', { count: 'exact', head: true })
      .eq('mailbox_id', 'test-id');

    // Second sync (should upsert, not duplicate)
    await service.syncMailbox({ mailboxId: 'test-id', orgId: 'org-1' });

    const { count: count2 } = await supabase
      .from('mail_threads')
      .select('*', { count: 'exact', head: true })
      .eq('mailbox_id', 'test-id');

    expect(count1).toBe(count2);
  });
});
```

---

## 8. Deployment

### 8.1 Environment Variables

```bash
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
GOOGLE_REDIRECT_URI=https://app.reil.com/api/auth/gmail/callback

# Token encryption
TOKEN_ENCRYPTION_KEY=<32-byte hex string>

# Sync configuration
BACKFILL_DAYS=30
SYNC_INTERVAL_MINUTES=5
```

### 8.2 Scheduled Job

Run incremental sync every 5 minutes:

```typescript
// Example: Node-cron scheduler
import cron from 'node-cron';
import { GmailIngestService } from './GmailIngestService';

const service = new GmailIngestService();

// Every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('Running incremental sync...');

  // Fetch all connected mailboxes
  const { data: mailboxes } = await supabase
    .from('mailboxes')
    .select('id, org_id')
    .eq('status', 'connected');

  for (const mailbox of mailboxes || []) {
    try {
      await service.syncMailbox({
        mailboxId: mailbox.id,
        orgId: mailbox.org_id,
      });
    } catch (err) {
      console.error(`Sync failed for mailbox ${mailbox.id}:`, err);
    }
  }
});
```

---

## 9. Acceptance Criteria

- [ ] Service can perform initial backfill (30 days)
- [ ] Service can perform incremental sync using historyId
- [ ] Re-running sync does not duplicate threads/messages/attachments
- [ ] Attachments are stored in Supabase Storage with SHA-256 hashing
- [ ] All operations write ledger events
- [ ] OAuth tokens are encrypted at rest
- [ ] No PII (email bodies, tokens) in logs
- [ ] Rate limits respected (no 429 errors under normal load)
- [ ] HistoryId expiration (410) falls back to full sync
- [ ] Unit tests pass for MessageParser and AttachmentDownloader
- [ ] Integration test confirms idempotency

---

**Document Version:** 1.0
**Last Updated:** 2025-12-31
**Status:** READY FOR IMPLEMENTATION
