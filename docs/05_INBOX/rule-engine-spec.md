# BE-302: Rule Engine + Linking Endpoints Specification

**Sprint:** REIL/Q v0.2 - Gmail-First Inbox Spine
**Owner:** backend-dev
**Status:** ACTIVE
**Priority:** P0

---

## Overview

The Rule Engine automatically attaches ingested emails to CRM records (Contacts, Companies, Deals, Properties) using configurable matching rules. The Linking Endpoints provide API routes for manual attach/unlink operations and querying linked emails.

**Key Requirements:**
- Auto-attach based on email/domain matching
- Confidence scoring for match quality
- Ambiguity detection (multiple matches)
- Manual attach/unlink via API
- Full ledger audit trail

---

## 1. Auto-Attach Rule Engine

### 1.1 Rule Priority Order

Rules execute in priority order. First match wins.

```
Priority 1: EXACT_EMAIL_MATCH
  - If sender or any recipient matches contacts.email
  - Action: Link thread to Contact
  - Confidence: 100

Priority 2: DOMAIN_MATCH
  - If @domain.com matches companies.domain
  - Action: Link thread to Company
  - Confidence: 80

Priority 3: CONTACT_TO_RECORD_PROMOTION
  - If Contact linked AND Contact has exactly 1 active Deal or Property
  - Action: Also link thread to that Deal/Property
  - Confidence: 70

Priority 4: AMBIGUOUS_MULTI_RECORD
  - If Contact has >1 active records
  - Action: Link only to Contact, do NOT auto-attach to deal/property
  - Action: Set mail_threads.needs_routing = true
  - Confidence: 100 (for contact link)
```

### 1.2 Rule Implementation

#### RuleEngine.ts

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LedgerWriter } from './LedgerWriter';

export interface RuleContext {
  threadId: string;
  messageId: string;
  orgId: string;
  participantEmails: string[]; // sender + all recipients
  fromEmail: string;
  toEmails: string[];
  ccEmails: string[];
}

export interface LinkResult {
  linkId: string;
  sourceType: 'thread' | 'message';
  sourceId: string;
  targetType: 'contact' | 'company' | 'deal' | 'property';
  targetId: string;
  confidence: number;
  ruleName: string;
}

export class RuleEngine {
  private supabase: SupabaseClient;
  private ledger: LedgerWriter;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.ledger = new LedgerWriter(this.supabase);
  }

  /**
   * Main entry point: apply all rules to a thread
   */
  async applyRules(context: RuleContext): Promise<LinkResult[]> {
    const results: LinkResult[] = [];

    // Rule 1: EXACT_EMAIL_MATCH
    const contactMatches = await this.exactEmailMatch(context);
    results.push(...contactMatches);

    // If no contact match, try domain match
    if (contactMatches.length === 0) {
      const companyMatches = await this.domainMatch(context);
      results.push(...companyMatches);
    }

    // Rule 3: CONTACT_TO_RECORD_PROMOTION (only if contact matched)
    if (contactMatches.length > 0) {
      const promotionMatches = await this.contactToRecordPromotion(context, contactMatches);
      results.push(...promotionMatches);
    }

    return results;
  }

  /**
   * Rule 1: EXACT_EMAIL_MATCH
   */
  private async exactEmailMatch(context: RuleContext): Promise<LinkResult[]> {
    const results: LinkResult[] = [];

    // Find contacts matching any participant email
    const { data: contacts } = await this.supabase
      .from('contacts')
      .select('id, email')
      .eq('org_id', context.orgId)
      .in('email', context.participantEmails);

    if (!contacts || contacts.length === 0) {
      return results;
    }

    // Link thread to each matching contact
    for (const contact of contacts) {
      const link = await this.createLink({
        orgId: context.orgId,
        sourceType: 'thread',
        sourceId: context.threadId,
        targetType: 'contact',
        targetId: contact.id,
        confidence: 100,
        ruleName: 'EXACT_EMAIL_MATCH',
        linkMethod: 'rule',
      });

      if (link) {
        results.push(link);
      }
    }

    return results;
  }

  /**
   * Rule 2: DOMAIN_MATCH
   */
  private async domainMatch(context: RuleContext): Promise<LinkResult[]> {
    const results: LinkResult[] = [];

    // Extract domains from participant emails
    const domains = new Set<string>();
    context.participantEmails.forEach((email) => {
      const domain = email.split('@')[1]?.toLowerCase();
      if (domain) {
        domains.add(domain);
      }
    });

    if (domains.size === 0) {
      return results;
    }

    // Find companies matching domains
    const { data: companies } = await this.supabase
      .from('companies')
      .select('id, domain')
      .eq('org_id', context.orgId)
      .in('domain', Array.from(domains));

    if (!companies || companies.length === 0) {
      return results;
    }

    // Link thread to each matching company
    for (const company of companies) {
      const link = await this.createLink({
        orgId: context.orgId,
        sourceType: 'thread',
        sourceId: context.threadId,
        targetType: 'company',
        targetId: company.id,
        confidence: 80,
        ruleName: 'DOMAIN_MATCH',
        linkMethod: 'rule',
      });

      if (link) {
        results.push(link);
      }
    }

    return results;
  }

  /**
   * Rule 3: CONTACT_TO_RECORD_PROMOTION
   */
  private async contactToRecordPromotion(
    context: RuleContext,
    contactMatches: LinkResult[]
  ): Promise<LinkResult[]> {
    const results: LinkResult[] = [];

    for (const contactMatch of contactMatches) {
      const contactId = contactMatch.targetId;

      // Find active deals linked to this contact
      const { data: dealLinks } = await this.supabase
        .from('record_links')
        .select('target_id')
        .eq('org_id', context.orgId)
        .eq('source_type', 'contact')
        .eq('source_id', contactId)
        .eq('target_type', 'deal');

      // Find active properties linked to this contact
      const { data: propertyLinks } = await this.supabase
        .from('record_links')
        .select('target_id')
        .eq('org_id', context.orgId)
        .eq('source_type', 'contact')
        .eq('source_id', contactId)
        .eq('target_type', 'property');

      const totalRecords = (dealLinks?.length || 0) + (propertyLinks?.length || 0);

      // Exactly 1 active record: promote
      if (totalRecords === 1) {
        const targetType = dealLinks && dealLinks.length === 1 ? 'deal' : 'property';
        const targetId = dealLinks && dealLinks.length === 1
          ? dealLinks[0].target_id
          : propertyLinks![0].target_id;

        const link = await this.createLink({
          orgId: context.orgId,
          sourceType: 'thread',
          sourceId: context.threadId,
          targetType,
          targetId,
          confidence: 70,
          ruleName: 'CONTACT_TO_RECORD_PROMOTION',
          linkMethod: 'rule',
        });

        if (link) {
          results.push(link);
        }
      }

      // Multiple active records: flag as needs routing
      if (totalRecords > 1) {
        await this.supabase
          .from('mail_threads')
          .update({ needs_routing: true })
          .eq('id', context.threadId);

        // Log ambiguity
        await this.ledger.write({
          event_type: 'EMAIL_AUTO_ATTACHED',
          org_id: context.orgId,
          entity_type: 'mail_thread',
          entity_id: context.threadId,
          payload: {
            rule_name: 'AMBIGUOUS_MULTI_RECORD',
            contact_id: contactId,
            active_record_count: totalRecords,
            needs_routing: true,
          },
        });
      }
    }

    return results;
  }

  /**
   * Create a record link with idempotency
   */
  private async createLink(params: {
    orgId: string;
    sourceType: 'thread' | 'message';
    sourceId: string;
    targetType: 'contact' | 'company' | 'deal' | 'property';
    targetId: string;
    confidence: number;
    ruleName: string;
    linkMethod: 'rule' | 'manual';
    linkedBy?: string;
  }): Promise<LinkResult | null> {
    const {
      orgId,
      sourceType,
      sourceId,
      targetType,
      targetId,
      confidence,
      ruleName,
      linkMethod,
      linkedBy,
    } = params;

    // Check if link already exists (idempotency)
    const { data: existing } = await this.supabase
      .from('record_links')
      .select('id')
      .eq('source_type', sourceType)
      .eq('source_id', sourceId)
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .single();

    if (existing) {
      // Link already exists, skip
      return null;
    }

    // Create link
    const { data: link, error } = await this.supabase
      .from('record_links')
      .insert({
        org_id: orgId,
        source_type: sourceType,
        source_id: sourceId,
        target_type: targetType,
        target_id: targetId,
        confidence,
        link_method: linkMethod,
        rule_name: ruleName,
        linked_by: linkedBy || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create link:', error);
      return null;
    }

    // Log ledger event
    const eventType = linkMethod === 'rule'
      ? 'EMAIL_AUTO_ATTACHED'
      : 'EMAIL_MANUALLY_ATTACHED';

    await this.ledger.write({
      event_type: eventType,
      org_id: orgId,
      entity_type: 'record_link',
      entity_id: link.id,
      payload: {
        source_type: sourceType,
        source_id: sourceId,
        target_type: targetType,
        target_id: targetId,
        rule_name: ruleName,
        confidence,
      },
      actor_id: linkedBy,
    });

    return {
      linkId: link.id,
      sourceType,
      sourceId,
      targetType,
      targetId,
      confidence,
      ruleName,
    };
  }

  /**
   * Manual attach (from API endpoint)
   */
  async manualAttach(params: {
    orgId: string;
    userId: string;
    sourceType: 'thread' | 'message';
    sourceId: string;
    targetType: 'contact' | 'company' | 'deal' | 'property';
    targetId: string;
  }): Promise<LinkResult | null> {
    return await this.createLink({
      ...params,
      confidence: 100,
      ruleName: 'MANUAL_ATTACH',
      linkMethod: 'manual',
      linkedBy: params.userId,
    });
  }

  /**
   * Unlink (from API endpoint)
   */
  async unlink(params: {
    orgId: string;
    userId: string;
    linkId: string;
  }): Promise<void> {
    const { orgId, userId, linkId } = params;

    // Fetch link for audit
    const { data: link } = await this.supabase
      .from('record_links')
      .select('*')
      .eq('id', linkId)
      .eq('org_id', orgId)
      .single();

    if (!link) {
      throw new Error('Link not found');
    }

    // Delete link
    const { error } = await this.supabase
      .from('record_links')
      .delete()
      .eq('id', linkId);

    if (error) {
      throw new Error(`Failed to delete link: ${error.message}`);
    }

    // Log ledger event
    await this.ledger.write({
      event_type: 'EMAIL_UNLINKED',
      org_id: orgId,
      entity_type: 'record_link',
      entity_id: linkId,
      payload: {
        source_type: link.source_type,
        source_id: link.source_id,
        target_type: link.target_type,
        target_id: link.target_id,
      },
      actor_id: userId,
    });
  }
}
```

### 1.3 Triggering Rules

Rules should be triggered automatically after message ingestion:

```typescript
// In GmailIngestService.ts, after ingesting a message:

import { RuleEngine } from './RuleEngine';

async ingestMessage(...) {
  // ... ingest message ...

  // Apply auto-attach rules
  const ruleEngine = new RuleEngine();
  await ruleEngine.applyRules({
    threadId: dbThread.id,
    messageId: dbMessage.id,
    orgId,
    participantEmails: parsed.participantEmails,
    fromEmail: parsed.fromEmail,
    toEmails: parsed.toEmails,
    ccEmails: parsed.ccEmails,
  });
}
```

---

## 2. API Endpoints

### 2.1 Endpoint Overview

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inbox/threads` | List threads with pagination and filters |
| GET | `/api/inbox/threads/:id` | Get thread detail with messages |
| POST | `/api/inbox/link` | Manually attach thread/message to record |
| DELETE | `/api/inbox/link/:id` | Unlink thread/message from record |
| GET | `/api/records/:type/:id/emails` | Get all emails linked to a record |

### 2.2 GET /api/inbox/threads

**List threads with pagination and filters.**

#### Request

```typescript
interface ThreadListRequest {
  page?: number; // default: 1
  limit?: number; // default: 50, max: 100
  unlinkedOnly?: boolean; // default: false
  needsRouting?: boolean; // default: false
  dateFrom?: string; // ISO 8601
  dateTo?: string; // ISO 8601
  search?: string; // search subject/participants
}

// Example: GET /api/inbox/threads?page=1&limit=50&unlinkedOnly=true
```

#### Response

```typescript
interface ThreadListResponse {
  threads: ThreadListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ThreadListItem {
  id: string;
  subject: string;
  snippet: string;
  participantEmails: string[];
  messageCount: number;
  hasAttachments: boolean;
  lastMessageAt: string;
  isRead: boolean;
  needsRouting: boolean;
  linkedRecords: LinkedRecord[]; // what it's attached to
}

interface LinkedRecord {
  linkId: string;
  targetType: 'contact' | 'company' | 'deal' | 'property';
  targetId: string;
  targetName: string; // denormalized for display
  confidence: number;
  linkMethod: 'rule' | 'manual';
  ruleName?: string;
}
```

#### Implementation

```typescript
// pages/api/inbox/threads.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Authenticate user
  const session = await getServerSession(req, res);
  if (!session?.user?.orgId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const orgId = session.user.orgId;

  // Parse query params
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const unlinkedOnly = req.query.unlinkedOnly === 'true';
  const needsRouting = req.query.needsRouting === 'true';
  const dateFrom = req.query.dateFrom as string;
  const dateTo = req.query.dateTo as string;
  const search = req.query.search as string;

  const offset = (page - 1) * limit;

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Build query
  let query = supabase
    .from('mail_threads')
    .select('*', { count: 'exact' })
    .eq('org_id', orgId)
    .order('last_message_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (needsRouting) {
    query = query.eq('needs_routing', true);
  }

  if (dateFrom) {
    query = query.gte('last_message_at', dateFrom);
  }

  if (dateTo) {
    query = query.lte('last_message_at', dateTo);
  }

  if (search) {
    query = query.or(`subject.ilike.%${search}%,snippet.ilike.%${search}%`);
  }

  const { data: threads, count, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Fetch linked records for each thread
  const threadIds = threads.map((t) => t.id);
  const { data: links } = await supabase
    .from('record_links')
    .select('*')
    .eq('source_type', 'thread')
    .in('source_id', threadIds);

  // Filter unlinked threads if requested
  let filteredThreads = threads;
  if (unlinkedOnly) {
    const linkedThreadIds = new Set((links || []).map((l) => l.source_id));
    filteredThreads = threads.filter((t) => !linkedThreadIds.has(t.id));
  }

  // Denormalize linked records
  const threadsWithLinks = await Promise.all(
    filteredThreads.map(async (thread) => {
      const threadLinks = (links || []).filter((l) => l.source_id === thread.id);

      const linkedRecords = await Promise.all(
        threadLinks.map(async (link) => {
          // Fetch target record name
          const { data: target } = await supabase
            .from(link.target_type + 's')
            .select('name, email, title')
            .eq('id', link.target_id)
            .single();

          return {
            linkId: link.id,
            targetType: link.target_type,
            targetId: link.target_id,
            targetName: target?.name || target?.email || target?.title || 'Unknown',
            confidence: link.confidence,
            linkMethod: link.link_method,
            ruleName: link.rule_name,
          };
        })
      );

      return {
        id: thread.id,
        subject: thread.subject,
        snippet: thread.snippet,
        participantEmails: thread.participant_emails,
        messageCount: thread.message_count,
        hasAttachments: thread.has_attachments,
        lastMessageAt: thread.last_message_at,
        isRead: thread.is_read,
        needsRouting: thread.needs_routing,
        linkedRecords,
      };
    })
  );

  return res.status(200).json({
    threads: threadsWithLinks,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
}
```

### 2.3 GET /api/inbox/threads/:id

**Get thread detail with all messages and attachments.**

#### Request

```typescript
// Example: GET /api/inbox/threads/550e8400-e29b-41d4-a716-446655440000
```

#### Response

```typescript
interface ThreadDetailResponse {
  thread: ThreadDetail;
}

interface ThreadDetail {
  id: string;
  subject: string;
  snippet: string;
  participantEmails: string[];
  messageCount: number;
  hasAttachments: boolean;
  lastMessageAt: string;
  firstMessageAt: string;
  isRead: boolean;
  needsRouting: boolean;
  linkedRecords: LinkedRecord[];
  messages: MessageDetail[];
}

interface MessageDetail {
  id: string;
  fromEmail: string;
  fromName: string | null;
  toEmails: string[];
  ccEmails: string[];
  subject: string;
  snippet: string;
  bodyPlain: string | null;
  bodyHtml: string | null;
  sentAt: string;
  attachments: AttachmentDetail[];
}

interface AttachmentDetail {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  downloadUrl: string; // presigned URL
}
```

#### Implementation

```typescript
// pages/api/inbox/threads/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res);
  if (!session?.user?.orgId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const orgId = session.user.orgId;
  const threadId = req.query.id as string;

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch thread
  const { data: thread, error: threadError } = await supabase
    .from('mail_threads')
    .select('*')
    .eq('id', threadId)
    .eq('org_id', orgId)
    .single();

  if (threadError || !thread) {
    return res.status(404).json({ error: 'Thread not found' });
  }

  // Fetch linked records
  const { data: links } = await supabase
    .from('record_links')
    .select('*')
    .eq('source_type', 'thread')
    .eq('source_id', threadId);

  const linkedRecords = await Promise.all(
    (links || []).map(async (link) => {
      const { data: target } = await supabase
        .from(link.target_type + 's')
        .select('name, email, title')
        .eq('id', link.target_id)
        .single();

      return {
        linkId: link.id,
        targetType: link.target_type,
        targetId: link.target_id,
        targetName: target?.name || target?.email || target?.title || 'Unknown',
        confidence: link.confidence,
        linkMethod: link.link_method,
        ruleName: link.rule_name,
      };
    })
  );

  // Fetch messages
  const { data: messages } = await supabase
    .from('mail_messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('sent_at', { ascending: true });

  // Fetch attachments for all messages
  const messageIds = (messages || []).map((m) => m.id);
  const { data: attachments } = await supabase
    .from('mail_attachments')
    .select('*')
    .in('message_id', messageIds);

  // Build message details with attachments
  const messageDetails = await Promise.all(
    (messages || []).map(async (msg) => {
      const msgAttachments = (attachments || []).filter(
        (att) => att.message_id === msg.id
      );

      const attachmentDetails = await Promise.all(
        msgAttachments.map(async (att) => {
          // Generate presigned download URL (1 hour expiry)
          const { data: urlData } = await supabase.storage
            .from('mail-attachments')
            .createSignedUrl(att.storage_path, 3600);

          return {
            id: att.id,
            filename: att.filename,
            mimeType: att.mime_type,
            sizeBytes: att.size_bytes,
            downloadUrl: urlData?.signedUrl || '',
          };
        })
      );

      return {
        id: msg.id,
        fromEmail: msg.from_email,
        fromName: msg.from_name,
        toEmails: msg.to_emails,
        ccEmails: msg.cc_emails,
        subject: msg.subject,
        snippet: msg.snippet,
        bodyPlain: msg.body_plain,
        bodyHtml: msg.body_html,
        sentAt: msg.sent_at,
        attachments: attachmentDetails,
      };
    })
  );

  return res.status(200).json({
    thread: {
      id: thread.id,
      subject: thread.subject,
      snippet: thread.snippet,
      participantEmails: thread.participant_emails,
      messageCount: thread.message_count,
      hasAttachments: thread.has_attachments,
      lastMessageAt: thread.last_message_at,
      firstMessageAt: thread.first_message_at,
      isRead: thread.is_read,
      needsRouting: thread.needs_routing,
      linkedRecords,
      messages: messageDetails,
    },
  });
}
```

### 2.4 POST /api/inbox/link

**Manually attach a thread or message to a record.**

#### Request

```typescript
interface LinkRequest {
  sourceType: 'thread' | 'message';
  sourceId: string;
  targetType: 'contact' | 'company' | 'deal' | 'property';
  targetId: string;
}

// Example POST /api/inbox/link
// Body: { "sourceType": "thread", "sourceId": "...", "targetType": "deal", "targetId": "..." }
```

#### Response

```typescript
interface LinkResponse {
  success: true;
  link: {
    id: string;
    sourceType: string;
    sourceId: string;
    targetType: string;
    targetId: string;
    confidence: number;
    linkMethod: string;
  };
}
```

#### Implementation

```typescript
// pages/api/inbox/link.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { RuleEngine } from '@/services/RuleEngine';
import { z } from 'zod';

const linkSchema = z.object({
  sourceType: z.enum(['thread', 'message']),
  sourceId: z.string().uuid(),
  targetType: z.enum(['contact', 'company', 'deal', 'property']),
  targetId: z.string().uuid(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res);
  if (!session?.user?.orgId || !session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const orgId = session.user.orgId;
  const userId = session.user.id;

  // Validate request body
  const validation = linkSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.errors });
  }

  const { sourceType, sourceId, targetType, targetId } = validation.data;

  const ruleEngine = new RuleEngine();

  try {
    const link = await ruleEngine.manualAttach({
      orgId,
      userId,
      sourceType,
      sourceId,
      targetType,
      targetId,
    });

    if (!link) {
      return res.status(409).json({ error: 'Link already exists' });
    }

    return res.status(201).json({
      success: true,
      link: {
        id: link.linkId,
        sourceType: link.sourceType,
        sourceId: link.sourceId,
        targetType: link.targetType,
        targetId: link.targetId,
        confidence: link.confidence,
        linkMethod: 'manual',
      },
    });
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Internal server error',
    });
  }
}
```

### 2.5 DELETE /api/inbox/link/:id

**Unlink a thread or message from a record.**

#### Request

```typescript
// Example: DELETE /api/inbox/link/550e8400-e29b-41d4-a716-446655440000
```

#### Response

```typescript
interface UnlinkResponse {
  success: true;
  message: string;
}
```

#### Implementation

```typescript
// pages/api/inbox/link/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { RuleEngine } from '@/services/RuleEngine';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res);
  if (!session?.user?.orgId || !session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const orgId = session.user.orgId;
  const userId = session.user.id;
  const linkId = req.query.id as string;

  const ruleEngine = new RuleEngine();

  try {
    await ruleEngine.unlink({ orgId, userId, linkId });

    return res.status(200).json({
      success: true,
      message: 'Link removed successfully',
    });
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Internal server error',
    });
  }
}
```

### 2.6 GET /api/records/:type/:id/emails

**Get all emails linked to a specific record.**

#### Request

```typescript
// Example: GET /api/records/deal/550e8400-e29b-41d4-a716-446655440000/emails?page=1&limit=20
```

#### Response

```typescript
interface RecordEmailsResponse {
  emails: RecordEmail[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

interface RecordEmail {
  linkId: string;
  sourceType: 'thread' | 'message';
  sourceId: string;
  subject: string;
  snippet: string;
  fromEmail: string;
  fromName: string | null;
  sentAt: string;
  hasAttachments: boolean;
  confidence: number;
  linkMethod: 'rule' | 'manual';
  ruleName?: string;
}
```

#### Implementation

```typescript
// pages/api/records/[type]/[id]/emails.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res);
  if (!session?.user?.orgId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const orgId = session.user.orgId;
  const recordType = req.query.type as string;
  const recordId = req.query.id as string;

  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const offset = (page - 1) * limit;

  const validTypes = ['contact', 'company', 'deal', 'property', 'unit', 'leasing'];
  if (!validTypes.includes(recordType)) {
    return res.status(400).json({ error: 'Invalid record type' });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch all links to this record
  const { data: links, count } = await supabase
    .from('record_links')
    .select('*', { count: 'exact' })
    .eq('target_type', recordType)
    .eq('target_id', recordId)
    .eq('org_id', orgId)
    .in('source_type', ['thread', 'message'])
    .order('linked_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (!links) {
    return res.status(200).json({ emails: [], pagination: { page, limit, total: 0 } });
  }

  // Fetch thread/message details
  const emails = await Promise.all(
    links.map(async (link) => {
      if (link.source_type === 'thread') {
        const { data: thread } = await supabase
          .from('mail_threads')
          .select('subject, snippet, last_message_at')
          .eq('id', link.source_id)
          .single();

        // Get first message for from_email
        const { data: firstMessage } = await supabase
          .from('mail_messages')
          .select('from_email, from_name')
          .eq('thread_id', link.source_id)
          .order('sent_at', { ascending: true })
          .limit(1)
          .single();

        return {
          linkId: link.id,
          sourceType: 'thread',
          sourceId: link.source_id,
          subject: thread?.subject || '(No Subject)',
          snippet: thread?.snippet || '',
          fromEmail: firstMessage?.from_email || '',
          fromName: firstMessage?.from_name || null,
          sentAt: thread?.last_message_at || '',
          hasAttachments: false, // TODO: check thread.has_attachments
          confidence: link.confidence,
          linkMethod: link.link_method,
          ruleName: link.rule_name,
        };
      } else {
        const { data: message } = await supabase
          .from('mail_messages')
          .select('*')
          .eq('id', link.source_id)
          .single();

        return {
          linkId: link.id,
          sourceType: 'message',
          sourceId: link.source_id,
          subject: message?.subject || '(No Subject)',
          snippet: message?.snippet || '',
          fromEmail: message?.from_email || '',
          fromName: message?.from_name || null,
          sentAt: message?.sent_at || '',
          hasAttachments: message?.has_attachments || false,
          confidence: link.confidence,
          linkMethod: link.link_method,
          ruleName: link.rule_name,
        };
      }
    })
  );

  return res.status(200).json({
    emails,
    pagination: {
      page,
      limit,
      total: count || 0,
    },
  });
}
```

---

## 3. TypeScript Interfaces

### 3.1 Database Types

```typescript
// types/database.ts

export interface Mailbox {
  id: string;
  org_id: string;
  user_id: string;
  provider: 'gmail' | 'microsoft';
  provider_email: string;
  provider_subject_id: string | null;
  oauth_scopes: string[];
  access_token_encrypted: string;
  refresh_token_encrypted: string;
  token_expires_at: string | null;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  last_history_id: string | null;
  last_synced_at: string | null;
  sync_error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface MailThread {
  id: string;
  org_id: string;
  mailbox_id: string;
  provider_thread_id: string;
  subject: string;
  snippet: string;
  participant_emails: string[];
  message_count: number;
  has_attachments: boolean;
  last_message_at: string;
  first_message_at: string;
  is_read: boolean;
  needs_routing: boolean;
  label_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface MailMessage {
  id: string;
  org_id: string;
  mailbox_id: string;
  thread_id: string;
  provider_message_id: string;
  from_email: string;
  from_name: string | null;
  to_emails: string[];
  cc_emails: string[];
  bcc_emails: string[];
  subject: string;
  snippet: string;
  body_plain: string | null;
  body_html: string | null;
  sent_at: string;
  internal_date: number;
  raw_headers: Record<string, string>;
  label_ids: string[];
  has_attachments: boolean;
  size_estimate: number;
  created_at: string;
}

export interface MailAttachment {
  id: string;
  org_id: string;
  mailbox_id: string;
  message_id: string;
  provider_attachment_id: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  storage_path: string;
  sha256: string;
  created_at: string;
}

export interface RecordLink {
  id: string;
  org_id: string;
  source_type: 'message' | 'thread' | 'attachment' | 'document';
  source_id: string;
  target_type: 'contact' | 'company' | 'deal' | 'property' | 'unit' | 'leasing';
  target_id: string;
  confidence: number;
  link_method: 'rule' | 'manual' | 'system';
  rule_name: string | null;
  linked_by: string | null;
  linked_at: string;
}
```

### 3.2 API Request/Response Types

```typescript
// types/api.ts

// Thread List
export interface ThreadListRequest {
  page?: number;
  limit?: number;
  unlinkedOnly?: boolean;
  needsRouting?: boolean;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface ThreadListResponse {
  threads: ThreadListItem[];
  pagination: PaginationMeta;
}

export interface ThreadListItem {
  id: string;
  subject: string;
  snippet: string;
  participantEmails: string[];
  messageCount: number;
  hasAttachments: boolean;
  lastMessageAt: string;
  isRead: boolean;
  needsRouting: boolean;
  linkedRecords: LinkedRecord[];
}

// Thread Detail
export interface ThreadDetailResponse {
  thread: ThreadDetail;
}

export interface ThreadDetail extends ThreadListItem {
  firstMessageAt: string;
  messages: MessageDetail[];
}

export interface MessageDetail {
  id: string;
  fromEmail: string;
  fromName: string | null;
  toEmails: string[];
  ccEmails: string[];
  subject: string;
  snippet: string;
  bodyPlain: string | null;
  bodyHtml: string | null;
  sentAt: string;
  attachments: AttachmentDetail[];
}

export interface AttachmentDetail {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  downloadUrl: string;
}

export interface LinkedRecord {
  linkId: string;
  targetType: 'contact' | 'company' | 'deal' | 'property';
  targetId: string;
  targetName: string;
  confidence: number;
  linkMethod: 'rule' | 'manual';
  ruleName?: string;
}

// Manual Link
export interface LinkRequest {
  sourceType: 'thread' | 'message';
  sourceId: string;
  targetType: 'contact' | 'company' | 'deal' | 'property';
  targetId: string;
}

export interface LinkResponse {
  success: true;
  link: {
    id: string;
    sourceType: string;
    sourceId: string;
    targetType: string;
    targetId: string;
    confidence: number;
    linkMethod: string;
  };
}

// Unlink
export interface UnlinkResponse {
  success: true;
  message: string;
}

// Record Emails
export interface RecordEmailsResponse {
  emails: RecordEmail[];
  pagination: PaginationMeta;
}

export interface RecordEmail {
  linkId: string;
  sourceType: 'thread' | 'message';
  sourceId: string;
  subject: string;
  snippet: string;
  fromEmail: string;
  fromName: string | null;
  sentAt: string;
  hasAttachments: boolean;
  confidence: number;
  linkMethod: 'rule' | 'manual';
  ruleName?: string;
}

// Shared
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}
```

---

## 4. Ledger Events

All rule engine and linking operations write ledger events.

### 4.1 Event Types

| Event Type | Trigger | Payload |
|------------|---------|---------|
| `EMAIL_AUTO_ATTACHED` | Rule engine links | `{ source_type, source_id, target_type, target_id, rule_name, confidence }` |
| `EMAIL_MANUALLY_ATTACHED` | User manually links | `{ source_type, source_id, target_type, target_id }` |
| `EMAIL_UNLINKED` | User unlinks | `{ source_type, source_id, target_type, target_id }` |
| `AMBIGUOUS_MULTI_RECORD` | Contact has >1 active record | `{ contact_id, active_record_count, needs_routing: true }` |

### 4.2 Example Ledger Entries

```json
{
  "event_type": "EMAIL_AUTO_ATTACHED",
  "org_id": "550e8400-e29b-41d4-a716-446655440000",
  "entity_type": "record_link",
  "entity_id": "660f9511-f39c-52e5-b827-557766551111",
  "payload": {
    "source_type": "thread",
    "source_id": "770g0622-g40d-63f6-c938-668877662222",
    "target_type": "contact",
    "target_id": "880h1733-h51e-74g7-d049-779988773333",
    "rule_name": "EXACT_EMAIL_MATCH",
    "confidence": 100
  },
  "actor_id": null,
  "occurred_at": "2025-12-31T12:00:00Z"
}
```

---

## 5. Testing Strategy

### 5.1 Unit Tests

```typescript
// Test: EXACT_EMAIL_MATCH rule
describe('RuleEngine - EXACT_EMAIL_MATCH', () => {
  it('should link thread to contact when sender email matches', async () => {
    const ruleEngine = new RuleEngine();

    // Create test contact
    const { data: contact } = await supabase
      .from('contacts')
      .insert({ org_id: 'test-org', email: 'john@example.com', name: 'John Doe' })
      .select()
      .single();

    // Apply rule
    const results = await ruleEngine.applyRules({
      threadId: 'test-thread',
      messageId: 'test-message',
      orgId: 'test-org',
      participantEmails: ['john@example.com', 'other@example.com'],
      fromEmail: 'john@example.com',
      toEmails: ['other@example.com'],
      ccEmails: [],
    });

    expect(results).toHaveLength(1);
    expect(results[0].targetType).toBe('contact');
    expect(results[0].targetId).toBe(contact.id);
    expect(results[0].ruleName).toBe('EXACT_EMAIL_MATCH');
    expect(results[0].confidence).toBe(100);
  });
});

// Test: CONTACT_TO_RECORD_PROMOTION rule
describe('RuleEngine - CONTACT_TO_RECORD_PROMOTION', () => {
  it('should promote to deal when contact has exactly 1 active deal', async () => {
    // ... test implementation
  });

  it('should flag as needs_routing when contact has >1 active records', async () => {
    // ... test implementation
  });
});
```

### 5.2 Integration Tests

```typescript
// Test: Manual attach endpoint
describe('POST /api/inbox/link', () => {
  it('should create link and return 201', async () => {
    const response = await fetch('/api/inbox/link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceType: 'thread',
        sourceId: 'test-thread-id',
        targetType: 'deal',
        targetId: 'test-deal-id',
      }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.link.linkMethod).toBe('manual');
  });

  it('should return 409 if link already exists', async () => {
    // ... test implementation
  });
});
```

---

## 6. Acceptance Criteria

- [ ] Rule engine correctly applies EXACT_EMAIL_MATCH
- [ ] Rule engine correctly applies DOMAIN_MATCH
- [ ] Rule engine correctly promotes Contact to Deal/Property when exactly 1 active record
- [ ] Rule engine flags threads as needs_routing when Contact has >1 active records
- [ ] GET /api/inbox/threads returns paginated threads with linked records
- [ ] GET /api/inbox/threads/:id returns thread detail with messages and attachments
- [ ] POST /api/inbox/link creates manual link and logs ledger event
- [ ] DELETE /api/inbox/link/:id removes link and logs ledger event
- [ ] GET /api/records/:type/:id/emails returns all linked emails for a record
- [ ] All endpoints respect org isolation (users can only see their org's data)
- [ ] All linking operations write ledger events
- [ ] Unit tests pass for all rule logic
- [ ] Integration tests pass for all endpoints

---

**Document Version:** 1.0
**Last Updated:** 2025-12-31
**Status:** READY FOR IMPLEMENTATION
