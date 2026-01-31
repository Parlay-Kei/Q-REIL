# Gmail Ingestion Regression Tests

**Sprint:** REIL/Q v0.2 - Gmail-First Inbox Spine
**Ticket:** QA-801
**Owner:** backend-qa-automation-tester
**Status:** READY FOR EXECUTION
**Created:** 2025-12-31

---

## Table of Contents

1. [Test Categories](#test-categories)
2. [Mock Gmail Fixtures](#mock-gmail-fixtures)
3. [Unit Tests](#unit-tests)
4. [Integration Tests](#integration-tests)
5. [End-to-End Tests](#end-to-end-tests)
6. [Test Utilities](#test-utilities)
7. [CI Configuration](#ci-configuration)
8. [Coverage Thresholds](#coverage-thresholds)
9. [QA Approval Checklist](#qa-approval-checklist)

---

## Test Categories

### 1. Unit Tests
- Gmail API client wrapper functions
- Data transformation utilities (Gmail → REIL schema)
- Rule engine logic (isolated)
- Idempotency key generation
- SHA-256 hashing for attachments

### 2. Integration Tests
- Database persistence layer
- Mailbox sync flow with mock Gmail API
- Rule engine with database queries
- Ledger event emission
- Org isolation enforcement

### 3. End-to-End Tests
- Full OAuth → Sync → Attach → View flow
- 30-day backfill simulation
- Incremental sync with historyId
- Multi-user, multi-org scenarios
- Error recovery and retry logic

---

## Mock Gmail Fixtures

### Sample Thread JSON

```json
{
  "id": "thread_18cf2a4b9e6d1234",
  "historyId": "4839201",
  "messages": [
    {
      "id": "msg_18cf2a4b9e6d1234",
      "threadId": "thread_18cf2a4b9e6d1234",
      "labelIds": ["INBOX", "UNREAD"],
      "snippet": "Hi Ashley, I wanted to follow up on the property at 123 Main St...",
      "payload": {
        "headers": [
          {
            "name": "From",
            "value": "John Buyer <john.buyer@gmail.com>"
          },
          {
            "name": "To",
            "value": "Ashley Agent <ashley@reilcrm.com>"
          },
          {
            "name": "Subject",
            "value": "Re: 123 Main St - Property Inquiry"
          },
          {
            "name": "Date",
            "value": "Wed, 25 Dec 2024 14:32:15 -0800"
          }
        ],
        "parts": [
          {
            "mimeType": "text/plain",
            "body": {
              "data": "SGkgQXNobGV5LCBJIHdhbnRlZCB0byBmb2xsb3cgdXAgb24gdGhlIHByb3BlcnR5IGF0IDEyMyBNYWluIFN0Li4u"
            }
          },
          {
            "mimeType": "text/html",
            "body": {
              "data": "PGh0bWw+PGJvZHk+SGkgQXNobGV5LCBJIHdhbnRlZCB0byBmb2xsb3cgdXAgb24gdGhlIHByb3BlcnR5IGF0IDEyMyBNYWluIFN0Li4uPC9ib2R5PjwvaHRtbD4="
            }
          }
        ]
      },
      "internalDate": "1735168335000",
      "sizeEstimate": 4563
    }
  ]
}
```

### Sample Message with Attachment

```json
{
  "id": "msg_18cf2c7d4a1e5678",
  "threadId": "thread_18cf2a4b9e6d1234",
  "labelIds": ["INBOX"],
  "snippet": "Attached is the purchase agreement for your review...",
  "payload": {
    "headers": [
      {
        "name": "From",
        "value": "John Buyer <john.buyer@gmail.com>"
      },
      {
        "name": "To",
        "value": "Ashley Agent <ashley@reilcrm.com>"
      },
      {
        "name": "Subject",
        "value": "Re: Purchase Agreement - 123 Main St"
      },
      {
        "name": "Date",
        "value": "Thu, 26 Dec 2024 09:15:42 -0800"
      }
    ],
    "parts": [
      {
        "mimeType": "text/plain",
        "body": {
          "data": "QXR0YWNoZWQgaXMgdGhlIHB1cmNoYXNlIGFncmVlbWVudCBmb3IgeW91ciByZXZpZXcu"
        }
      },
      {
        "filename": "Purchase_Agreement_123MainSt.pdf",
        "mimeType": "application/pdf",
        "body": {
          "attachmentId": "att_ANGjdJ8wvY4Kx1234567890",
          "size": 245678
        }
      }
    ]
  },
  "internalDate": "1735236942000",
  "sizeEstimate": 246892
}
```

### Sample Attachment Metadata

```json
{
  "attachmentId": "att_ANGjdJ8wvY4Kx1234567890",
  "filename": "Purchase_Agreement_123MainSt.pdf",
  "mimeType": "application/pdf",
  "size": 245678,
  "data": "JVBERi0xLjQKJeLjz9MKMyAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL1Jlc291cmNlcz...",
  "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

### Test Data for 50+ Messages Scenario

```typescript
export const BULK_MESSAGE_FIXTURE = {
  threads: Array.from({ length: 25 }, (_, threadIdx) => ({
    id: `thread_bulk_${String(threadIdx).padStart(4, '0')}`,
    historyId: String(4800000 + threadIdx),
    messages: Array.from({ length: 2 + (threadIdx % 3) }, (_, msgIdx) => ({
      id: `msg_bulk_${String(threadIdx).padStart(4, '0')}_${msgIdx}`,
      threadId: `thread_bulk_${String(threadIdx).padStart(4, '0')}`,
      labelIds: msgIdx === 0 ? ["INBOX", "UNREAD"] : ["INBOX"],
      snippet: `Test message ${msgIdx + 1} in thread ${threadIdx + 1}`,
      payload: {
        headers: [
          {
            name: "From",
            value: `sender${threadIdx % 10}@testdomain.com`
          },
          {
            name: "To",
            value: "ashley@reilcrm.com"
          },
          {
            name: "Subject",
            value: `Test Thread ${threadIdx + 1} - Message ${msgIdx + 1}`
          },
          {
            name: "Date",
            value: new Date(Date.now() - (threadIdx * 86400000 + msgIdx * 3600000)).toUTCString()
          }
        ],
        parts: [
          {
            mimeType: "text/plain",
            body: {
              data: Buffer.from(`This is test message ${msgIdx + 1} in thread ${threadIdx + 1}`).toString('base64')
            }
          }
        ]
      },
      internalDate: String(Date.now() - (threadIdx * 86400000 + msgIdx * 3600000)),
      sizeEstimate: 1200 + (threadIdx * 10)
    }))
  }))
};
```

---

## Unit Tests

### Test Suite: Gmail Data Transformers

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import {
  transformGmailThreadToREIL,
  transformGmailMessageToREIL,
  extractParticipantEmails,
  decodeBase64Body,
  generateIdempotencyKey
} from '../services/gmail/transformers';

describe('Gmail Data Transformers', () => {
  describe('transformGmailThreadToREIL', () => {
    it('should transform Gmail thread to REIL schema', () => {
      const gmailThread = {
        id: 'thread_123',
        messages: [
          {
            id: 'msg_1',
            payload: {
              headers: [
                { name: 'Subject', value: 'Test Subject' },
                { name: 'From', value: 'sender@example.com' },
                { name: 'To', value: 'recipient@example.com' }
              ]
            },
            snippet: 'Test snippet',
            internalDate: '1735168335000'
          }
        ]
      };

      const result = transformGmailThreadToREIL(gmailThread, 'mailbox-uuid', 'org-uuid');

      expect(result).toMatchObject({
        provider_thread_id: 'thread_123',
        mailbox_id: 'mailbox-uuid',
        org_id: 'org-uuid',
        subject: 'Test Subject',
        snippet: 'Test snippet',
        participant_emails: expect.arrayContaining(['sender@example.com', 'recipient@example.com']),
        message_count: 1,
        has_attachments: false,
        first_message_at: expect.any(Date),
        last_message_at: expect.any(Date)
      });
    });

    it('should handle thread with no subject', () => {
      const gmailThread = {
        id: 'thread_456',
        messages: [
          {
            id: 'msg_2',
            payload: { headers: [] },
            snippet: 'No subject thread',
            internalDate: '1735168335000'
          }
        ]
      };

      const result = transformGmailThreadToREIL(gmailThread, 'mailbox-uuid', 'org-uuid');

      expect(result.subject).toBeNull();
      expect(result.snippet).toBe('No subject thread');
    });

    it('should detect attachments in thread', () => {
      const gmailThread = {
        id: 'thread_789',
        messages: [
          {
            id: 'msg_3',
            payload: {
              headers: [],
              parts: [
                {
                  filename: 'document.pdf',
                  body: { attachmentId: 'att_123' }
                }
              ]
            },
            snippet: 'Message with attachment',
            internalDate: '1735168335000'
          }
        ]
      };

      const result = transformGmailThreadToREIL(gmailThread, 'mailbox-uuid', 'org-uuid');

      expect(result.has_attachments).toBe(true);
    });
  });

  describe('extractParticipantEmails', () => {
    it('should extract unique emails from headers', () => {
      const headers = [
        { name: 'From', value: 'sender@example.com' },
        { name: 'To', value: 'recipient1@example.com, recipient2@example.com' },
        { name: 'Cc', value: 'cc@example.com' }
      ];

      const emails = extractParticipantEmails(headers);

      expect(emails).toEqual([
        'sender@example.com',
        'recipient1@example.com',
        'recipient2@example.com',
        'cc@example.com'
      ]);
    });

    it('should handle email addresses with display names', () => {
      const headers = [
        { name: 'From', value: 'John Doe <john@example.com>' },
        { name: 'To', value: 'Jane Smith <jane@example.com>, Bob <bob@example.com>' }
      ];

      const emails = extractParticipantEmails(headers);

      expect(emails).toEqual(['john@example.com', 'jane@example.com', 'bob@example.com']);
    });

    it('should deduplicate emails', () => {
      const headers = [
        { name: 'From', value: 'sender@example.com' },
        { name: 'To', value: 'sender@example.com, recipient@example.com' }
      ];

      const emails = extractParticipantEmails(headers);

      expect(emails).toHaveLength(2);
      expect(emails).toContain('sender@example.com');
      expect(emails).toContain('recipient@example.com');
    });
  });

  describe('decodeBase64Body', () => {
    it('should decode base64url encoded body', () => {
      const encoded = Buffer.from('Hello World').toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const decoded = decodeBase64Body(encoded);

      expect(decoded).toBe('Hello World');
    });

    it('should handle empty body', () => {
      const decoded = decodeBase64Body('');
      expect(decoded).toBe('');
    });
  });

  describe('generateIdempotencyKey', () => {
    it('should generate consistent key for same input', () => {
      const key1 = generateIdempotencyKey('mailbox-123', 'msg-456');
      const key2 = generateIdempotencyKey('mailbox-123', 'msg-456');

      expect(key1).toBe(key2);
    });

    it('should generate different keys for different inputs', () => {
      const key1 = generateIdempotencyKey('mailbox-123', 'msg-456');
      const key2 = generateIdempotencyKey('mailbox-123', 'msg-789');

      expect(key1).not.toBe(key2);
    });
  });
});
```

### Test Suite: SHA-256 Hashing

```typescript
import { describe, it, expect } from 'vitest';
import { generateSHA256, compareAttachmentHashes } from '../services/gmail/attachments';

describe('Attachment SHA-256 Utilities', () => {
  it('should generate SHA-256 hash from buffer', async () => {
    const buffer = Buffer.from('test content');
    const hash = await generateSHA256(buffer);

    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('should generate same hash for same content', async () => {
    const buffer1 = Buffer.from('identical content');
    const buffer2 = Buffer.from('identical content');

    const hash1 = await generateSHA256(buffer1);
    const hash2 = await generateSHA256(buffer2);

    expect(hash1).toBe(hash2);
  });

  it('should generate different hash for different content', async () => {
    const buffer1 = Buffer.from('content A');
    const buffer2 = Buffer.from('content B');

    const hash1 = await generateSHA256(buffer1);
    const hash2 = await generateSHA256(buffer2);

    expect(hash1).not.toBe(hash2);
  });

  it('should detect duplicate attachments by hash', async () => {
    const existingHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    const newBuffer = Buffer.from('');
    const newHash = await generateSHA256(newBuffer);

    const isDuplicate = compareAttachmentHashes(existingHash, newHash);

    expect(isDuplicate).toBe(true);
  });
});
```

---

## Integration Tests

### Test Suite: Gmail Ingestion Idempotency

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createSupabaseClient } from '../lib/supabase';
import { GmailIngestionService } from '../services/gmail/ingestion';
import { SAMPLE_THREAD_FIXTURE, SAMPLE_MESSAGE_FIXTURE } from './fixtures/gmail';

describe('Gmail Ingestion Idempotency', () => {
  let supabase: any;
  let ingestionService: GmailIngestionService;
  let testOrgId: string;
  let testMailboxId: string;

  beforeEach(async () => {
    supabase = createSupabaseClient();
    ingestionService = new GmailIngestionService(supabase);

    // Create test org and mailbox
    const { data: org } = await supabase
      .from('orgs')
      .insert({ name: 'Test Org - Gmail Idempotency' })
      .select()
      .single();
    testOrgId = org.id;

    const { data: mailbox } = await supabase
      .from('mailboxes')
      .insert({
        org_id: testOrgId,
        user_id: org.owner_id,
        provider: 'gmail',
        provider_email: 'test@example.com',
        status: 'connected'
      })
      .select()
      .single();
    testMailboxId = mailbox.id;
  });

  afterEach(async () => {
    // Cleanup test data
    await supabase.from('orgs').delete().eq('id', testOrgId);
  });

  it('should not create duplicate threads on re-sync', async () => {
    // First sync
    await ingestionService.ingestThread(SAMPLE_THREAD_FIXTURE, testMailboxId, testOrgId);

    const { count: count1 } = await supabase
      .from('mail_threads')
      .select('*', { count: 'exact' })
      .eq('mailbox_id', testMailboxId);

    expect(count1).toBe(1);

    // Re-sync same thread
    await ingestionService.ingestThread(SAMPLE_THREAD_FIXTURE, testMailboxId, testOrgId);

    const { count: count2 } = await supabase
      .from('mail_threads')
      .select('*', { count: 'exact' })
      .eq('mailbox_id', testMailboxId);

    expect(count2).toBe(1); // Should still be 1
  });

  it('should not create duplicate messages on re-sync', async () => {
    // Ingest thread first
    await ingestionService.ingestThread(SAMPLE_THREAD_FIXTURE, testMailboxId, testOrgId);

    const { count: count1 } = await supabase
      .from('mail_messages')
      .select('*', { count: 'exact' })
      .eq('mailbox_id', testMailboxId);

    expect(count1).toBe(1);

    // Re-sync same thread
    await ingestionService.ingestThread(SAMPLE_THREAD_FIXTURE, testMailboxId, testOrgId);

    const { count: count2 } = await supabase
      .from('mail_messages')
      .select('*', { count: 'exact' })
      .eq('mailbox_id', testMailboxId);

    expect(count2).toBe(1); // Should still be 1
  });

  it('should not create duplicate attachments with same sha256', async () => {
    const messageWithAttachment = {
      ...SAMPLE_MESSAGE_FIXTURE,
      payload: {
        ...SAMPLE_MESSAGE_FIXTURE.payload,
        parts: [
          {
            filename: 'document.pdf',
            mimeType: 'application/pdf',
            body: {
              attachmentId: 'att_123',
              size: 1000,
              data: 'base64data'
            }
          }
        ]
      }
    };

    // First ingest
    await ingestionService.ingestMessage(messageWithAttachment, testMailboxId, testOrgId);

    const { count: count1 } = await supabase
      .from('mail_attachments')
      .select('*', { count: 'exact' })
      .eq('mailbox_id', testMailboxId);

    expect(count1).toBe(1);

    // Re-ingest same message
    await ingestionService.ingestMessage(messageWithAttachment, testMailboxId, testOrgId);

    const { count: count2 } = await supabase
      .from('mail_attachments')
      .select('*', { count: 'exact' })
      .eq('mailbox_id', testMailboxId);

    expect(count2).toBe(1); // Should still be 1 (deduplicated by sha256)
  });

  it('should update thread metadata on re-sync', async () => {
    // First sync
    await ingestionService.ingestThread(SAMPLE_THREAD_FIXTURE, testMailboxId, testOrgId);

    const { data: thread1 } = await supabase
      .from('mail_threads')
      .select('*')
      .eq('provider_thread_id', SAMPLE_THREAD_FIXTURE.id)
      .single();

    expect(thread1.message_count).toBe(1);

    // Update thread with new message
    const updatedThread = {
      ...SAMPLE_THREAD_FIXTURE,
      messages: [
        ...SAMPLE_THREAD_FIXTURE.messages,
        {
          ...SAMPLE_THREAD_FIXTURE.messages[0],
          id: 'msg_new_in_thread'
        }
      ]
    };

    await ingestionService.ingestThread(updatedThread, testMailboxId, testOrgId);

    const { data: thread2 } = await supabase
      .from('mail_threads')
      .select('*')
      .eq('provider_thread_id', SAMPLE_THREAD_FIXTURE.id)
      .single();

    expect(thread2.message_count).toBe(2);
    expect(thread2.updated_at).not.toBe(thread1.updated_at);
  });
});
```

### Test Suite: Auto-Attach Rule Engine

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createSupabaseClient } from '../lib/supabase';
import { RuleEngine } from '../services/rules/engine';
import { LedgerService } from '../services/ledger';

describe('Auto-Attach Rule Engine', () => {
  let supabase: any;
  let ruleEngine: RuleEngine;
  let ledgerService: LedgerService;
  let testOrgId: string;
  let testContactId: string;
  let testCompanyId: string;
  let testDealId: string;

  beforeEach(async () => {
    supabase = createSupabaseClient();
    ruleEngine = new RuleEngine(supabase);
    ledgerService = new LedgerService(supabase);

    // Create test org
    const { data: org } = await supabase
      .from('orgs')
      .insert({ name: 'Test Org - Rule Engine' })
      .select()
      .single();
    testOrgId = org.id;

    // Create test contact
    const { data: contact } = await supabase
      .from('contacts')
      .insert({
        org_id: testOrgId,
        email: 'john.buyer@gmail.com',
        first_name: 'John',
        last_name: 'Buyer'
      })
      .select()
      .single();
    testContactId = contact.id;

    // Create test company
    const { data: company } = await supabase
      .from('companies')
      .insert({
        org_id: testOrgId,
        name: 'Acme Corp',
        domain: 'acmecorp.com'
      })
      .select()
      .single();
    testCompanyId = company.id;

    // Create test deal
    const { data: deal } = await supabase
      .from('deals')
      .insert({
        org_id: testOrgId,
        contact_id: testContactId,
        name: 'Test Deal',
        status: 'active'
      })
      .select()
      .single();
    testDealId = deal.id;
  });

  afterEach(async () => {
    await supabase.from('orgs').delete().eq('id', testOrgId);
  });

  it('should link thread to contact by exact email match', async () => {
    const threadData = {
      id: 'thread-uuid',
      org_id: testOrgId,
      from_email: 'john.buyer@gmail.com',
      participant_emails: ['john.buyer@gmail.com', 'ashley@reilcrm.com']
    };

    const links = await ruleEngine.executeAutoAttachRules(threadData, 'thread');

    expect(links).toHaveLength(1);
    expect(links[0]).toMatchObject({
      source_type: 'thread',
      source_id: 'thread-uuid',
      target_type: 'contact',
      target_id: testContactId,
      confidence: 100,
      link_method: 'rule',
      rule_name: 'EXACT_EMAIL_MATCH'
    });

    // Verify ledger event
    const events = await ledgerService.getEvents({
      org_id: testOrgId,
      event_type: 'EMAIL_AUTO_ATTACHED'
    });

    expect(events).toHaveLength(1);
    expect(events[0].payload).toMatchObject({
      rule_name: 'EXACT_EMAIL_MATCH',
      confidence: 100
    });
  });

  it('should link thread to company by domain match', async () => {
    const threadData = {
      id: 'thread-uuid-2',
      org_id: testOrgId,
      from_email: 'contact@acmecorp.com',
      participant_emails: ['contact@acmecorp.com', 'ashley@reilcrm.com']
    };

    const links = await ruleEngine.executeAutoAttachRules(threadData, 'thread');

    expect(links).toHaveLength(1);
    expect(links[0]).toMatchObject({
      source_type: 'thread',
      source_id: 'thread-uuid-2',
      target_type: 'company',
      target_id: testCompanyId,
      confidence: 80,
      link_method: 'rule',
      rule_name: 'DOMAIN_MATCH'
    });
  });

  it('should promote to deal when contact has 1 active deal', async () => {
    const threadData = {
      id: 'thread-uuid-3',
      org_id: testOrgId,
      from_email: 'john.buyer@gmail.com',
      participant_emails: ['john.buyer@gmail.com']
    };

    const links = await ruleEngine.executeAutoAttachRules(threadData, 'thread');

    // Should have 2 links: contact + deal
    expect(links).toHaveLength(2);

    const contactLink = links.find(l => l.target_type === 'contact');
    const dealLink = links.find(l => l.target_type === 'deal');

    expect(contactLink).toMatchObject({
      target_id: testContactId,
      confidence: 100,
      rule_name: 'EXACT_EMAIL_MATCH'
    });

    expect(dealLink).toMatchObject({
      target_id: testDealId,
      confidence: 70,
      rule_name: 'CONTACT_TO_RECORD_PROMOTION'
    });
  });

  it('should NOT promote when contact has multiple deals', async () => {
    // Create second deal for same contact
    await supabase
      .from('deals')
      .insert({
        org_id: testOrgId,
        contact_id: testContactId,
        name: 'Second Deal',
        status: 'active'
      });

    const threadData = {
      id: 'thread-uuid-4',
      org_id: testOrgId,
      from_email: 'john.buyer@gmail.com',
      participant_emails: ['john.buyer@gmail.com']
    };

    const links = await ruleEngine.executeAutoAttachRules(threadData, 'thread');

    // Should only link to contact, not deal
    expect(links).toHaveLength(1);
    expect(links[0]).toMatchObject({
      target_type: 'contact',
      target_id: testContactId
    });
  });

  it('should flag as needs_routing when ambiguous', async () => {
    // Create second deal
    await supabase
      .from('deals')
      .insert({
        org_id: testOrgId,
        contact_id: testContactId,
        name: 'Ambiguous Deal',
        status: 'active'
      });

    const threadData = {
      id: 'thread-uuid-5',
      org_id: testOrgId,
      from_email: 'john.buyer@gmail.com',
      participant_emails: ['john.buyer@gmail.com']
    };

    await ruleEngine.executeAutoAttachRules(threadData, 'thread');

    // Check thread is flagged
    const { data: thread } = await supabase
      .from('mail_threads')
      .select('needs_routing')
      .eq('id', 'thread-uuid-5')
      .single();

    expect(thread.needs_routing).toBe(true);
  });

  it('should set correct confidence scores', async () => {
    const threadData = {
      id: 'thread-uuid-6',
      org_id: testOrgId,
      from_email: 'john.buyer@gmail.com',
      participant_emails: ['john.buyer@gmail.com']
    };

    const links = await ruleEngine.executeAutoAttachRules(threadData, 'thread');

    const confidenceScores = links.map(l => ({ type: l.target_type, confidence: l.confidence }));

    expect(confidenceScores).toEqual(
      expect.arrayContaining([
        { type: 'contact', confidence: 100 },
        { type: 'deal', confidence: 70 }
      ])
    );
  });
});
```

### Test Suite: Edge Cases

```typescript
import { describe, it, expect } from 'vitest';
import { GmailIngestionService } from '../services/gmail/ingestion';
import { GmailAPIClient } from '../services/gmail/client';

describe('Edge Cases', () => {
  let ingestionService: GmailIngestionService;
  let gmailClient: GmailAPIClient;

  beforeEach(() => {
    ingestionService = new GmailIngestionService();
    gmailClient = new GmailAPIClient();
  });

  it('should handle empty thread subject', async () => {
    const threadWithoutSubject = {
      id: 'thread_no_subject',
      messages: [
        {
          id: 'msg_1',
          payload: {
            headers: [
              { name: 'From', value: 'sender@example.com' },
              { name: 'To', value: 'recipient@example.com' }
              // No Subject header
            ]
          },
          snippet: 'Message without subject',
          internalDate: '1735168335000'
        }
      ]
    };

    const result = await ingestionService.ingestThread(
      threadWithoutSubject,
      'mailbox-id',
      'org-id'
    );

    expect(result.subject).toBeNull();
    expect(result.snippet).toBe('Message without subject');
  });

  it('should handle missing sender email', async () => {
    const messageWithoutSender = {
      id: 'msg_no_sender',
      payload: {
        headers: [
          { name: 'To', value: 'recipient@example.com' },
          { name: 'Subject', value: 'No sender' }
        ]
      },
      snippet: 'Message without sender',
      internalDate: '1735168335000'
    };

    await expect(
      ingestionService.ingestMessage(messageWithoutSender, 'mailbox-id', 'org-id')
    ).rejects.toThrow('Missing required field: from_email');
  });

  it('should handle very large attachments', async () => {
    const largeAttachment = {
      attachmentId: 'att_large',
      filename: 'large_file.zip',
      mimeType: 'application/zip',
      size: 100 * 1024 * 1024 // 100MB
    };

    const result = await ingestionService.processAttachment(
      largeAttachment,
      'message-id',
      'mailbox-id',
      'org-id'
    );

    // Should queue for async processing
    expect(result.status).toBe('queued');
    expect(result.storage_path).toBeNull();
  });

  it('should handle rate limit errors gracefully', async () => {
    // Mock rate limit response
    gmailClient.mockRateLimitError();

    const result = await gmailClient.fetchMessages('user@example.com', {
      maxResults: 50
    });

    expect(result.error).toMatchObject({
      code: 429,
      message: expect.stringContaining('Rate Limit Exceeded')
    });
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it('should handle token refresh during sync', async () => {
    let tokenRefreshCount = 0;

    gmailClient.onTokenExpired(() => {
      tokenRefreshCount++;
      return gmailClient.refreshAccessToken();
    });

    // Simulate sync that encounters expired token
    await gmailClient.fetchMessages('user@example.com', { maxResults: 100 });

    expect(tokenRefreshCount).toBe(1);
  });

  it('should handle malformed email addresses', async () => {
    const headers = [
      { name: 'From', value: 'not-an-email' },
      { name: 'To', value: 'also-invalid' }
    ];

    const emails = extractParticipantEmails(headers);

    // Should filter out invalid emails
    expect(emails).toHaveLength(0);
  });

  it('should handle messages with no body parts', async () => {
    const messageWithoutBody = {
      id: 'msg_no_body',
      payload: {
        headers: [
          { name: 'From', value: 'sender@example.com' },
          { name: 'To', value: 'recipient@example.com' }
        ],
        parts: []
      },
      snippet: 'Empty message',
      internalDate: '1735168335000'
    };

    const result = await ingestionService.ingestMessage(
      messageWithoutBody,
      'mailbox-id',
      'org-id'
    );

    expect(result.body_plain).toBeNull();
    expect(result.body_html).toBeNull();
  });
});
```

---

## End-to-End Tests

### Test Suite: Full Sync Flow

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createSupabaseClient } from '../lib/supabase';
import { GmailSyncOrchestrator } from '../services/gmail/orchestrator';
import { MockGmailAPI } from './mocks/gmail-api';
import { BULK_MESSAGE_FIXTURE } from './fixtures/gmail';

describe('Full Sync Flow', () => {
  let supabase: any;
  let syncOrchestrator: GmailSyncOrchestrator;
  let mockGmailAPI: MockGmailAPI;
  let testOrgId: string;
  let testUserId: string;
  let testMailboxId: string;

  beforeEach(async () => {
    supabase = createSupabaseClient();
    mockGmailAPI = new MockGmailAPI();
    syncOrchestrator = new GmailSyncOrchestrator(supabase, mockGmailAPI);

    // Create test org and user
    const { data: org } = await supabase
      .from('orgs')
      .insert({ name: 'Test Org - Full Sync' })
      .select()
      .single();
    testOrgId = org.id;
    testUserId = org.owner_id;

    const { data: mailbox } = await supabase
      .from('mailboxes')
      .insert({
        org_id: testOrgId,
        user_id: testUserId,
        provider: 'gmail',
        provider_email: 'ashley@example.com',
        status: 'connected'
      })
      .select()
      .single();
    testMailboxId = mailbox.id;

    // Load mock data
    mockGmailAPI.loadFixture(BULK_MESSAGE_FIXTURE);
  });

  afterEach(async () => {
    await supabase.from('orgs').delete().eq('id', testOrgId);
  });

  it('should complete initial 30-day backfill', async () => {
    const startTime = Date.now();

    const result = await syncOrchestrator.performInitialBackfill(testMailboxId);

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(result).toMatchObject({
      status: 'completed',
      threads_synced: 25,
      messages_synced: expect.any(Number),
      attachments_synced: 0
    });

    expect(result.messages_synced).toBeGreaterThanOrEqual(50);
    expect(duration).toBeLessThan(30000); // Should complete within 30 seconds

    // Verify data in database
    const { count: threadCount } = await supabase
      .from('mail_threads')
      .select('*', { count: 'exact' })
      .eq('mailbox_id', testMailboxId);

    expect(threadCount).toBe(25);

    // Verify ledger events
    const events = await supabase
      .from('ledger')
      .select('*')
      .eq('org_id', testOrgId)
      .in('event_type', ['SYNC_STARTED', 'SYNC_COMPLETED'])
      .order('created_at', { ascending: true });

    expect(events.data).toHaveLength(2);
    expect(events.data[0].event_type).toBe('SYNC_STARTED');
    expect(events.data[1].event_type).toBe('SYNC_COMPLETED');
  });

  it('should handle incremental sync with historyId', async () => {
    // Perform initial sync
    await syncOrchestrator.performInitialBackfill(testMailboxId);

    const { data: mailbox1 } = await supabase
      .from('mailboxes')
      .select('last_history_id')
      .eq('id', testMailboxId)
      .single();

    expect(mailbox1.last_history_id).not.toBeNull();

    const initialHistoryId = mailbox1.last_history_id;

    // Add new messages to mock API
    mockGmailAPI.addNewMessages([
      {
        id: 'msg_incremental_1',
        threadId: 'thread_new',
        historyId: String(parseInt(initialHistoryId) + 100)
      }
    ]);

    // Perform incremental sync
    const result = await syncOrchestrator.performIncrementalSync(testMailboxId);

    expect(result).toMatchObject({
      status: 'completed',
      messages_synced: 1,
      used_history_id: initialHistoryId
    });

    // Verify history ID updated
    const { data: mailbox2 } = await supabase
      .from('mailboxes')
      .select('last_history_id')
      .eq('id', testMailboxId)
      .single();

    expect(parseInt(mailbox2.last_history_id)).toBeGreaterThan(parseInt(initialHistoryId));
  });

  it('should emit correct ledger events', async () => {
    await syncOrchestrator.performInitialBackfill(testMailboxId);

    const events = await supabase
      .from('ledger')
      .select('*')
      .eq('org_id', testOrgId)
      .order('created_at', { ascending: true });

    const eventTypes = events.data.map((e: any) => e.event_type);

    expect(eventTypes).toEqual(
      expect.arrayContaining([
        'SYNC_STARTED',
        'THREAD_INGESTED',
        'MESSAGE_INGESTED',
        'SYNC_COMPLETED'
      ])
    );

    // Verify event payloads
    const syncCompleted = events.data.find((e: any) => e.event_type === 'SYNC_COMPLETED');
    expect(syncCompleted.payload).toMatchObject({
      mailbox_id: testMailboxId,
      threads_synced: expect.any(Number),
      messages_synced: expect.any(Number)
    });
  });

  it('should respect org isolation', async () => {
    // Create second org
    const { data: org2 } = await supabase
      .from('orgs')
      .insert({ name: 'Test Org 2' })
      .select()
      .single();

    const { data: mailbox2 } = await supabase
      .from('mailboxes')
      .insert({
        org_id: org2.id,
        user_id: org2.owner_id,
        provider: 'gmail',
        provider_email: 'other@example.com',
        status: 'connected'
      })
      .select()
      .single();

    // Sync both mailboxes
    await syncOrchestrator.performInitialBackfill(testMailboxId);
    await syncOrchestrator.performInitialBackfill(mailbox2.id);

    // Verify org 1 can only see its threads
    const { data: org1Threads } = await supabase
      .from('mail_threads')
      .select('*')
      .eq('org_id', testOrgId);

    const { data: org2Threads } = await supabase
      .from('mail_threads')
      .select('*')
      .eq('org_id', org2.id);

    expect(org1Threads.every((t: any) => t.org_id === testOrgId)).toBe(true);
    expect(org2Threads.every((t: any) => t.org_id === org2.id)).toBe(true);

    // Cleanup org 2
    await supabase.from('orgs').delete().eq('id', org2.id);
  });

  it('should handle sync errors and retry logic', async () => {
    // Force API error on first attempt
    mockGmailAPI.forceError('NETWORK_ERROR', { times: 2 });

    const result = await syncOrchestrator.performInitialBackfill(testMailboxId, {
      maxRetries: 3,
      retryDelay: 100
    });

    expect(result.status).toBe('completed');
    expect(result.retry_count).toBe(2);
  });

  it('should update mailbox status during sync', async () => {
    const syncPromise = syncOrchestrator.performInitialBackfill(testMailboxId);

    // Check status during sync
    await new Promise(resolve => setTimeout(resolve, 100));

    const { data: mailboxDuring } = await supabase
      .from('mailboxes')
      .select('status')
      .eq('id', testMailboxId)
      .single();

    expect(mailboxDuring.status).toBe('syncing');

    await syncPromise;

    // Check status after sync
    const { data: mailboxAfter } = await supabase
      .from('mailboxes')
      .select('status, last_synced_at')
      .eq('id', testMailboxId)
      .single();

    expect(mailboxAfter.status).toBe('connected');
    expect(mailboxAfter.last_synced_at).not.toBeNull();
  });
});
```

---

## Test Utilities

### Mock Gmail API Client

```typescript
// tests/mocks/gmail-api.ts

export class MockGmailAPI {
  private threads: any[] = [];
  private messages: any[] = [];
  private errorConfig: { type: string; times: number } | null = null;
  private callCount: number = 0;

  loadFixture(fixture: any) {
    this.threads = fixture.threads || [];
    this.messages = fixture.messages || [];
  }

  addNewMessages(messages: any[]) {
    this.messages.push(...messages);
  }

  forceError(errorType: string, options: { times: number }) {
    this.errorConfig = { type: errorType, times: options.times };
    this.callCount = 0;
  }

  async fetchThreads(email: string, options: any = {}) {
    this.callCount++;

    if (this.errorConfig && this.callCount <= this.errorConfig.times) {
      throw new Error(this.errorConfig.type);
    }

    const maxResults = options.maxResults || 100;
    const pageToken = options.pageToken || null;

    // Simulate pagination
    const startIndex = pageToken ? parseInt(pageToken) : 0;
    const endIndex = Math.min(startIndex + maxResults, this.threads.length);
    const nextPageToken = endIndex < this.threads.length ? String(endIndex) : null;

    return {
      threads: this.threads.slice(startIndex, endIndex),
      nextPageToken,
      resultSizeEstimate: this.threads.length
    };
  }

  async fetchMessage(email: string, messageId: string) {
    const message = this.messages.find(m => m.id === messageId);
    if (!message) {
      throw new Error(`Message ${messageId} not found`);
    }
    return message;
  }

  async fetchAttachment(email: string, messageId: string, attachmentId: string) {
    return {
      data: 'base64_encoded_attachment_data',
      size: 1000
    };
  }

  mockRateLimitError() {
    this.forceError('RATE_LIMIT_EXCEEDED', { times: 1 });
  }
}
```

### Test Data Factories

```typescript
// tests/factories/gmail-data.ts

import { faker } from '@faker-js/faker';

export class GmailDataFactory {
  static createThread(overrides: any = {}) {
    return {
      id: faker.string.alphanumeric(16),
      historyId: faker.string.numeric(7),
      messages: [this.createMessage()],
      ...overrides
    };
  }

  static createMessage(overrides: any = {}) {
    return {
      id: faker.string.alphanumeric(16),
      threadId: faker.string.alphanumeric(16),
      labelIds: ['INBOX'],
      snippet: faker.lorem.sentence(),
      payload: {
        headers: [
          { name: 'From', value: faker.internet.email() },
          { name: 'To', value: faker.internet.email() },
          { name: 'Subject', value: faker.lorem.sentence() },
          { name: 'Date', value: new Date().toUTCString() }
        ],
        parts: [
          {
            mimeType: 'text/plain',
            body: {
              data: Buffer.from(faker.lorem.paragraph()).toString('base64')
            }
          }
        ]
      },
      internalDate: String(Date.now()),
      sizeEstimate: faker.number.int({ min: 1000, max: 10000 }),
      ...overrides
    };
  }

  static createAttachment(overrides: any = {}) {
    return {
      attachmentId: faker.string.alphanumeric(32),
      filename: faker.system.fileName(),
      mimeType: faker.system.mimeType(),
      size: faker.number.int({ min: 1000, max: 1000000 }),
      data: faker.string.alphanumeric(100),
      ...overrides
    };
  }

  static createBulkThreads(count: number) {
    return Array.from({ length: count }, () => this.createThread());
  }
}
```

### Database Seeding Helpers

```typescript
// tests/helpers/database.ts

import { createSupabaseClient } from '../../lib/supabase';

export class DatabaseTestHelper {
  private supabase: any;
  private createdOrgs: string[] = [];

  constructor() {
    this.supabase = createSupabaseClient();
  }

  async createTestOrg(name: string = 'Test Org') {
    const { data: org } = await this.supabase
      .from('orgs')
      .insert({ name })
      .select()
      .single();

    this.createdOrgs.push(org.id);
    return org;
  }

  async createTestMailbox(orgId: string, userEmail: string) {
    const { data: mailbox } = await this.supabase
      .from('mailboxes')
      .insert({
        org_id: orgId,
        user_id: (await this.getUserByOrg(orgId)).id,
        provider: 'gmail',
        provider_email: userEmail,
        status: 'connected'
      })
      .select()
      .single();

    return mailbox;
  }

  async createTestContact(orgId: string, email: string) {
    const { data: contact } = await this.supabase
      .from('contacts')
      .insert({
        org_id: orgId,
        email,
        first_name: 'Test',
        last_name: 'Contact'
      })
      .select()
      .single();

    return contact;
  }

  async createTestDeal(orgId: string, contactId: string, status: string = 'active') {
    const { data: deal } = await this.supabase
      .from('deals')
      .insert({
        org_id: orgId,
        contact_id: contactId,
        name: 'Test Deal',
        status
      })
      .select()
      .single();

    return deal;
  }

  async getUserByOrg(orgId: string) {
    const { data: org } = await this.supabase
      .from('orgs')
      .select('owner_id')
      .eq('id', orgId)
      .single();

    const { data: user } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', org.owner_id)
      .single();

    return user;
  }

  async cleanupAll() {
    for (const orgId of this.createdOrgs) {
      await this.supabase.from('orgs').delete().eq('id', orgId);
    }
    this.createdOrgs = [];
  }
}
```

### Assertion Helpers for Ledger Events

```typescript
// tests/helpers/ledger-assertions.ts

export class LedgerAssertions {
  private supabase: any;

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  async assertEventEmitted(
    orgId: string,
    eventType: string,
    payloadMatchers: any = {}
  ) {
    const { data: events } = await this.supabase
      .from('ledger')
      .select('*')
      .eq('org_id', orgId)
      .eq('event_type', eventType)
      .order('created_at', { ascending: false })
      .limit(1);

    expect(events).toHaveLength(1);
    expect(events[0].payload).toMatchObject(payloadMatchers);

    return events[0];
  }

  async assertEventSequence(orgId: string, expectedTypes: string[]) {
    const { data: events } = await this.supabase
      .from('ledger')
      .select('event_type')
      .eq('org_id', orgId)
      .order('created_at', { ascending: true });

    const actualTypes = events.map((e: any) => e.event_type);

    expect(actualTypes).toEqual(expect.arrayContaining(expectedTypes));
  }

  async assertNoEventsOfType(orgId: string, eventType: string) {
    const { count } = await this.supabase
      .from('ledger')
      .select('*', { count: 'exact' })
      .eq('org_id', orgId)
      .eq('event_type', eventType);

    expect(count).toBe(0);
  }

  async getEventCount(orgId: string, eventType?: string) {
    let query = this.supabase
      .from('ledger')
      .select('*', { count: 'exact' })
      .eq('org_id', orgId);

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const { count } = await query;
    return count;
  }
}
```

---

## CI Configuration

### Test Commands for package.json

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:unit": "vitest run --config vitest.config.unit.ts",
    "test:integration": "vitest run --config vitest.config.integration.ts",
    "test:e2e": "vitest run --config vitest.config.e2e.ts",
    "test:gmail": "vitest run --grep gmail-ingestion",
    "test:ci": "vitest run --coverage --reporter=junit --reporter=default"
  },
  "devDependencies": {
    "@faker-js/faker": "^8.0.0",
    "@vitest/coverage-v8": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "vitest": "^1.0.0"
  }
}
```

### GitHub Actions Workflow Snippet

```yaml
# .github/workflows/gmail-ingestion-tests.yml

name: Gmail Ingestion Tests

on:
  push:
    branches: [main, develop]
    paths:
      - 'services/gmail/**'
      - 'services/rules/**'
      - 'tests/gmail/**'
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit
        env:
          NODE_ENV: test

      - name: Upload unit test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: unit-test-results
          path: test-results/

  integration-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 20

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: reil_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run database migrations
        run: npm run db:migrate:test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/reil_test

      - name: Run integration tests
        run: npm run test:integration
        env:
          NODE_ENV: test
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/reil_test
          SUPABASE_URL: ${{ secrets.SUPABASE_TEST_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_TEST_ANON_KEY }}

      - name: Upload integration test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: integration-test-results
          path: test-results/

  e2e-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: reil_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run database migrations
        run: npm run db:migrate:test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/reil_test

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          NODE_ENV: test
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/reil_test
          SUPABASE_URL: ${{ secrets.SUPABASE_TEST_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_TEST_ANON_KEY }}

      - name: Upload E2E test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: e2e-test-results
          path: test-results/

  coverage-report:
    runs-on: ubuntu-latest
    needs: [unit-tests, integration-tests, e2e-tests]
    timeout-minutes: 15

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate coverage report
        run: npm run test:coverage
        env:
          NODE_ENV: test

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/coverage-final.json
          flags: gmail-ingestion
          fail_ci_if_error: true

      - name: Check coverage thresholds
        run: |
          node scripts/check-coverage-thresholds.js
```

### Vitest Configuration Files

```typescript
// vitest.config.unit.ts

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'unit',
    include: ['**/*.unit.test.ts'],
    exclude: ['node_modules', 'dist'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/*.test.ts', '**/mocks/**', '**/fixtures/**']
    }
  }
});
```

```typescript
// vitest.config.integration.ts

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'integration',
    include: ['**/*.integration.test.ts'],
    exclude: ['node_modules', 'dist'],
    environment: 'node',
    setupFiles: ['./tests/setup/integration.ts'],
    testTimeout: 30000,
    hookTimeout: 30000
  }
});
```

```typescript
// vitest.config.e2e.ts

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'e2e',
    include: ['**/*.e2e.test.ts'],
    exclude: ['node_modules', 'dist'],
    environment: 'node',
    setupFiles: ['./tests/setup/e2e.ts'],
    testTimeout: 60000,
    hookTimeout: 30000,
    poolOptions: {
      threads: {
        singleThread: true
      }
    }
  }
});
```

---

## Coverage Thresholds

### Required Coverage Metrics

```json
{
  "coverage": {
    "gmail-ingestion": {
      "statements": 85,
      "branches": 80,
      "functions": 85,
      "lines": 85
    },
    "rule-engine": {
      "statements": 90,
      "branches": 85,
      "functions": 90,
      "lines": 90
    },
    "data-transformers": {
      "statements": 95,
      "branches": 90,
      "functions": 95,
      "lines": 95
    },
    "overall": {
      "statements": 85,
      "branches": 80,
      "functions": 85,
      "lines": 85
    }
  }
}
```

### Coverage Threshold Checker Script

```javascript
// scripts/check-coverage-thresholds.js

const fs = require('fs');
const path = require('path');

const coveragePath = path.join(__dirname, '../coverage/coverage-summary.json');
const thresholdsPath = path.join(__dirname, '../coverage-thresholds.json');

const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
const thresholds = JSON.parse(fs.readFileSync(thresholdsPath, 'utf8'));

let passed = true;

console.log('\n=== Coverage Threshold Check ===\n');

Object.entries(thresholds.coverage).forEach(([module, limits]) => {
  const moduleCoverage = coverage[module] || coverage.total;

  Object.entries(limits).forEach(([metric, threshold]) => {
    const actual = moduleCoverage[metric].pct;
    const status = actual >= threshold ? 'PASS' : 'FAIL';

    if (status === 'FAIL') {
      passed = false;
    }

    console.log(
      `[${status}] ${module}.${metric}: ${actual}% (threshold: ${threshold}%)`
    );
  });
});

console.log('\n================================\n');

if (!passed) {
  console.error('Coverage thresholds not met!');
  process.exit(1);
}

console.log('All coverage thresholds met!');
process.exit(0);
```

---

## QA Approval Checklist

**PRD (scope + DoD):** All acceptance for Q REIL v0.1 must align with [PRD_Q_REIL_v0.1](../q-reil/PRD_Q_REIL_v0.1.md) — §6 MVP Scope, §10 Definition of Done. v0.1 is complete only when all seven §10 criteria are true.

### Test Execution Verification

**Test Suite:** Gmail Ingestion Regression Tests
**Sprint:** REIL/Q v0.2
**Test Date:** _________________
**Tested By:** _________________

#### Unit Tests

- [ ] **Gmail Data Transformers** - All tests pass
  - [ ] Thread transformation
  - [ ] Message transformation
  - [ ] Participant email extraction
  - [ ] Base64 decoding
  - [ ] Idempotency key generation

- [ ] **SHA-256 Hashing** - All tests pass
  - [ ] Hash generation
  - [ ] Hash consistency
  - [ ] Duplicate detection

#### Integration Tests

- [ ] **Idempotency** - All tests pass
  - [ ] No duplicate threads on re-sync
  - [ ] No duplicate messages on re-sync
  - [ ] No duplicate attachments with same SHA-256
  - [ ] Thread metadata updates correctly

- [ ] **Rule Engine** - All tests pass
  - [ ] Exact email match to contact
  - [ ] Domain match to company
  - [ ] Promotion to deal (1 active deal)
  - [ ] No promotion (multiple deals)
  - [ ] Ambiguous case flagging
  - [ ] Correct confidence scores

- [ ] **Edge Cases** - All tests pass
  - [ ] Empty subject handling
  - [ ] Missing sender handling
  - [ ] Large attachment handling
  - [ ] Rate limit error handling
  - [ ] Token refresh handling

#### End-to-End Tests

- [ ] **Full Sync Flow** - All tests pass
  - [ ] 30-day backfill completion
  - [ ] Incremental sync with historyId
  - [ ] Ledger event emission
  - [ ] Org isolation enforcement
  - [ ] Error recovery and retry
  - [ ] Mailbox status updates

#### Performance Benchmarks

- [ ] **Initial Backfill** (50+ messages)
  - [ ] Completes in < 30 seconds
  - [ ] No memory leaks detected
  - [ ] Database connections properly released

- [ ] **Incremental Sync**
  - [ ] Completes in < 5 seconds
  - [ ] Uses historyId cursor correctly

- [ ] **Rule Engine Execution**
  - [ ] Processes 100 threads in < 10 seconds
  - [ ] Database queries optimized (< 5 queries per thread)

#### Security Verification

- [ ] **Data Isolation**
  - [ ] Org-level RLS policies enforced
  - [ ] No cross-org data leakage
  - [ ] User permissions respected

- [ ] **PII Protection**
  - [ ] Email bodies not logged
  - [ ] Token encryption verified
  - [ ] Sensitive headers redacted in logs

#### Data Integrity

- [ ] **Database Constraints**
  - [ ] Unique constraints enforced
  - [ ] Foreign key relationships valid
  - [ ] Cascade deletes working correctly

- [ ] **Ledger Completeness**
  - [ ] All ingestion events logged
  - [ ] All auto-attach events logged
  - [ ] Event payloads complete and valid

#### CI/CD Integration

- [ ] **GitHub Actions**
  - [ ] Unit tests run on push
  - [ ] Integration tests run on PR
  - [ ] E2E tests run nightly
  - [ ] Coverage reports generated

- [ ] **Coverage Thresholds**
  - [ ] Overall coverage >= 85%
  - [ ] Gmail ingestion >= 85%
  - [ ] Rule engine >= 90%
  - [ ] No critical paths uncovered

### Production Readiness Assessment

#### Code Quality

- [ ] All tests passing in CI
- [ ] No linter errors
- [ ] No TypeScript errors
- [ ] Code reviewed and approved

#### Documentation

- [ ] Test scenarios documented
- [ ] Mock fixtures explained
- [ ] Setup instructions clear
- [ ] Troubleshooting guide included

#### Deployment Readiness

- [ ] Database migrations tested
- [ ] Rollback plan documented
- [ ] Feature flags configured
- [ ] Monitoring alerts set up

### Sign-Off

**QA Engineer:**

Name: ________________________
Signature: ____________________
Date: _________________________

**Engineering Lead:**

Name: ________________________
Signature: ____________________
Date: _________________________

**Product Owner:**

Name: ________________________
Signature: ____________________
Date: _________________________

---

## Notes and Known Issues

### Current Limitations

1. **Large Attachment Handling**: Attachments > 100MB are queued for async processing. Monitor queue depth.

2. **Rate Limiting**: Gmail API has quota of 250 quota units/user/second. Backoff strategy implemented but may slow initial sync for high-volume mailboxes.

3. **Token Refresh**: Background job refreshes tokens 5 minutes before expiry. Manual intervention required if refresh fails.

4. **Rule Engine Performance**: Rule execution with >1000 contacts may require database query optimization (add indexes).

### Future Enhancements

- Parallel message processing for faster backfill
- Smart batching for Gmail API requests
- Machine learning confidence scoring for rule engine
- Webhook integration for real-time push notifications

---

**Document Version:** 1.0
**Last Updated:** 2025-12-31
**Status:** READY FOR EXECUTION
**Next Review:** After Sprint 0.2 completion
