# Release Gates - REIL/Q Sprint 0.2 (Gmail Integration)

**Version:** 1.0.0
**Sprint:** 0.2 - Gmail-First Inbox Spine
**Last Updated:** 2025-12-31
**Owner:** pre-deployment-quality-auditor
**Status:** Active
**PRD (v0.1 scope + DoD):** [PRD_Q_REIL_v0.1](../q-reil/PRD_Q_REIL_v0.1.md) — §6 MVP Scope, §10 Definition of Done. v0.1 release = all seven §10 criteria true. See [RELEASE_NOTES_v0.1](../q-reil/RELEASE_NOTES_v0.1.md).

## Document Purpose

This document defines the **mandatory release gates** for Sprint 0.2 (Gmail integration). All gates must pass before code can be merged to `main` and deployed to production. This is a 72-hour sprint with zero tolerance for quality compromises.

**Critical Requirements:**
- All gates must pass - no manual overrides for P0 issues
- Total CI execution time: <12 minutes for fast feedback
- Security gates cannot be skipped
- Database migration gates must validate schema changes
- Deployment gates must verify Gmail OAuth flow end-to-end

---

## Table of Contents

1. [CI/CD Pipeline Architecture](#cicd-pipeline-architecture)
2. [Gate 1: Lint + Type Check](#gate-1-lint--type-check)
3. [Gate 2: Unit Tests](#gate-2-unit-tests)
4. [Gate 3: Integration Tests](#gate-3-integration-tests)
5. [Gate 4: Database Migrations](#gate-4-database-migrations)
6. [Gate 5: Security Scan](#gate-5-security-scan)
7. [Branch Protection Rules](#branch-protection-rules)
8. [Merge Requirements](#merge-requirements)
9. [Deployment Gates](#deployment-gates)
10. [Complete GitHub Actions Workflow](#complete-github-actions-workflow)
11. [Rollback Procedures](#rollback-procedures)
12. [Deployment Checklist](#deployment-checklist)

---

## CI/CD Pipeline Architecture

### High-Level Flow

```
┌────────────────────┐
│ Developer Push     │
│ to feature branch  │
└─────────┬──────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│ Gate 1: Lint + Type Check (PARALLEL)                    │
│ ├─ ESLint (strict)                                      │
│ ├─ TypeScript (noEmit)                                  │
│ └─ Prettier formatting                                  │
│ Duration: ~45 seconds                                   │
│ Blocks: Yes (fast fail)                                 │
└─────────┬───────────────────────────────────────────────┘
          │ PASS
          ▼
┌─────────────────────────────────────────────────────────┐
│ Gate 2: Unit Tests (PARALLEL with Gate 3)               │
│ ├─ Backend unit tests                                   │
│ ├─ Frontend component tests                             │
│ ├─ Rule engine tests (auto-attach logic)                │
│ └─ Coverage check (≥80%)                                │
│ Duration: ~3 minutes                                    │
│ Blocks: Yes                                             │
└─────────┬───────────────────────────────────────────────┘
          │ PASS
          ▼
┌─────────────────────────────────────────────────────────┐
│ Gate 3: Integration Tests (PARALLEL with Gate 2)        │
│ ├─ Gmail OAuth flow test                                │
│ ├─ Message ingestion idempotency test                   │
│ ├─ Attachment storage test                              │
│ └─ Record linking E2E test                              │
│ Duration: ~4 minutes                                    │
│ Services: postgres, redis (for caching)                 │
│ Blocks: Yes                                             │
└─────────┬───────────────────────────────────────────────┘
          │ PASS
          ▼
┌─────────────────────────────────────────────────────────┐
│ Gate 4: Database Migrations (SEQUENTIAL)                │
│ ├─ Migration file validation                            │
│ ├─ Schema diff check                                    │
│ ├─ Rollback test                                        │
│ └─ RLS policy verification                              │
│ Duration: ~2 minutes                                    │
│ Blocks: Yes (critical for data safety)                  │
└─────────┬───────────────────────────────────────────────┘
          │ PASS
          ▼
┌─────────────────────────────────────────────────────────┐
│ Gate 5: Security Scan (PARALLEL)                        │
│ ├─ npm audit (no high/critical CVEs)                    │
│ ├─ gitleaks (secret detection)                          │
│ ├─ Semgrep SAST (SQL injection, XSS, PII leaks)         │
│ └─ OAuth scope validation                               │
│ Duration: ~2 minutes                                    │
│ Blocks: Yes (zero tolerance)                            │
└─────────┬───────────────────────────────────────────────┘
          │ PASS
          ▼
┌─────────────────────────────────────────────────────────┐
│ All Gates Passed                                        │
│ ✅ Ready for code review                                │
│ ✅ Ready to merge (after approval)                      │
└─────────────────────────────────────────────────────────┘
```

### Parallelization Strategy

**Parallel Jobs (Independent):**
- Gate 1 (Lint/Type) → Runs first, blocks others on failure
- Gate 2 (Unit Tests) + Gate 3 (Integration Tests) → Run in parallel
- Gate 5 (Security) → Runs in parallel with others

**Sequential Jobs (Dependent):**
- Gate 4 (Database Migrations) → Runs after Gate 3 (needs test DB)

**Total Pipeline Time:** ~8-10 minutes (optimized for 72-hour sprint velocity)

---

## Gate 1: Lint + Type Check

### 1.1 Purpose

Catch syntax errors, enforce code style, and prevent type errors BEFORE running expensive tests. This is the fastest gate and should fail immediately if code quality is poor.

### 1.2 GitHub Actions Implementation

```yaml
name: Gate 1 - Lint & Type Check

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  lint-and-type-check:
    name: Lint & TypeScript Check
    runs-on: ubuntu-latest
    timeout-minutes: 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npx eslint . --ext .ts,.tsx --max-warnings 0
        continue-on-error: false

      - name: Run TypeScript type check
        run: npx tsc --noEmit
        continue-on-error: false

      - name: Check Prettier formatting
        run: npx prettier --check 'src/**/*.{ts,tsx,json,css,md}'
        continue-on-error: false
```

### 1.3 ESLint Configuration Requirements

**Sprint 0.2 Specific Rules:**

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:security/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-floating-promises": "error",
    "no-console": ["error", { "allow": ["warn", "error"] }],
    "security/detect-object-injection": "error",

    // Gmail-specific rules
    "no-restricted-imports": ["error", {
      "patterns": [{
        "group": ["**/gmail-api/**"],
        "message": "Use centralized Gmail service instead of direct API calls"
      }]
    }]
  }
}
```

### 1.4 TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "ESNext",
    "moduleResolution": "bundler",

    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,

    "skipLibCheck": true
  }
}
```

### 1.5 Pass Criteria

- ESLint: 0 errors, 0 warnings
- TypeScript: 0 type errors
- Prettier: All files formatted correctly
- Duration: <45 seconds

### 1.6 Failure Actions

If Gate 1 fails:
1. Pipeline HALTS immediately
2. Developer runs locally:
   ```bash
   npm run lint:fix
   npm run format
   npm run type-check
   ```
3. Fix issues and re-push

---

## Gate 2: Unit Tests

### 2.1 Purpose

Verify business logic correctness with fast, isolated tests. Focus on:
- Gmail ingestion service (deduplication, idempotency)
- Auto-attach rule engine (email → contact/deal matching)
- Ledger event creation
- OAuth token handling

### 2.2 GitHub Actions Implementation

```yaml
name: Gate 2 - Unit Tests

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

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
          CI: true
          NODE_ENV: test

      - name: Check coverage thresholds
        run: npm run test:coverage
        env:
          CI: true

      - name: Upload coverage report
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          flags: unittests
          fail_ci_if_error: true
          token: ${{ secrets.CODECOV_TOKEN }}
```

### 2.3 Coverage Requirements

**Minimum Coverage (Sprint 0.2):**
- Overall: 80%
- New code: 85% (changed in PR)
- Critical paths: 100% (OAuth flow, ingestion, rule engine)

**Coverage Exceptions:**
- Generated types (Supabase auto-generated)
- Test files themselves
- Mock data/fixtures

### 2.4 Required Test Categories

**Backend Services (Priority P0):**
- `gmail-ingestion.service.test.ts`
  - ✅ Test message deduplication by `provider_message_id`
  - ✅ Test thread deduplication by `provider_thread_id`
  - ✅ Test attachment deduplication by SHA-256
  - ✅ Test idempotency (re-running sync doesn't duplicate)
  - ✅ Test historyId cursor management

- `auto-attach-rules.test.ts`
  - ✅ Test exact email match → Contact link
  - ✅ Test domain match → Company link
  - ✅ Test contact-to-record promotion (1 active deal)
  - ✅ Test ambiguous multi-record case (no auto-attach)
  - ✅ Test confidence scoring

- `ledger-events.test.ts`
  - ✅ Test event creation for all ingestion actions
  - ✅ Test event immutability (append-only)
  - ✅ Test required payload fields

**Frontend Components (Priority P1):**
- `ThreadListItem.test.tsx`
- `MessageBubble.test.tsx`
- `AttachToModal.test.tsx`

### 2.5 Example Test Structure

```typescript
// gmail-ingestion.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GmailIngestionService } from '@/services/gmail-ingestion.service';
import { supabase } from '@/lib/supabase';

describe('GmailIngestionService - Idempotency', () => {
  let service: GmailIngestionService;

  beforeEach(() => {
    service = new GmailIngestionService();
    vi.clearAllMocks();
  });

  it('should not duplicate messages when syncing same message twice', async () => {
    const message = {
      id: 'msg_12345',
      threadId: 'thread_67890',
      from: 'seller@example.com',
      subject: 'Property Inquiry',
    };

    // First sync
    await service.ingestMessage('mailbox_123', message);

    // Second sync (should be no-op)
    await service.ingestMessage('mailbox_123', message);

    // Verify only 1 message in DB
    const { data, error } = await supabase
      .from('mail_messages')
      .select('*')
      .eq('provider_message_id', 'msg_12345');

    expect(data).toHaveLength(1);
  });

  it('should update existing thread when new message arrives', async () => {
    const threadId = 'thread_67890';

    // Ingest first message
    await service.ingestMessage('mailbox_123', {
      id: 'msg_1',
      threadId,
      subject: 'RE: Property',
    });

    // Ingest second message in same thread
    await service.ingestMessage('mailbox_123', {
      id: 'msg_2',
      threadId,
      subject: 'RE: Property',
    });

    // Verify thread has message_count = 2
    const { data } = await supabase
      .from('mail_threads')
      .select('message_count')
      .eq('provider_thread_id', threadId)
      .single();

    expect(data?.message_count).toBe(2);
  });
});
```

### 2.6 Pass Criteria

- All tests pass (0 failures, 0 flaky tests)
- Coverage ≥80% overall, ≥85% for new code
- Duration: <3 minutes

---

## Gate 3: Integration Tests

### 3.1 Purpose

Verify end-to-end flows with real database and external service mocks. Focus on:
- Gmail OAuth connection flow
- Message ingestion → database → ledger event chain
- Attachment upload to Supabase Storage
- Auto-attach rule execution with multiple records

### 3.2 GitHub Actions Implementation

```yaml
name: Gate 3 - Integration Tests

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    timeout-minutes: 15

    services:
      postgres:
        image: supabase/postgres:15.1.0.117
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: reilq_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run database migrations
        run: npx supabase db push
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/reilq_test
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Seed test data
        run: npm run db:seed:test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/reilq_test

      - name: Run integration tests
        run: npm run test:integration
        env:
          CI: true
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/reilq_test
          REDIS_URL: redis://localhost:6379
          GMAIL_CLIENT_ID: ${{ secrets.GMAIL_CLIENT_ID_TEST }}
          GMAIL_CLIENT_SECRET: ${{ secrets.GMAIL_CLIENT_SECRET_TEST }}
          SUPABASE_URL: http://localhost:54321
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY_TEST }}

      - name: Upload test artifacts
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: integration-test-logs
          path: |
            logs/
            coverage/
```

### 3.3 Required Integration Test Suites

**Gmail OAuth Flow (Priority P0):**
```typescript
// test/integration/gmail-oauth.test.ts
describe('Gmail OAuth Connection', () => {
  it('should complete OAuth flow and store encrypted tokens', async () => {
    // 1. Initiate OAuth
    const authUrl = await gmailService.getAuthUrl();
    expect(authUrl).toContain('accounts.google.com/o/oauth2');

    // 2. Exchange code for tokens (mocked)
    const tokens = await gmailService.exchangeCodeForTokens('mock_auth_code');

    // 3. Store in database (encrypted)
    const mailbox = await createMailbox({
      userId: 'user_123',
      providerEmail: 'ashley@example.com',
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    });

    // 4. Verify tokens are encrypted in DB
    const { data } = await supabase
      .from('mailboxes')
      .select('access_token_encrypted')
      .eq('id', mailbox.id)
      .single();

    expect(data?.access_token_encrypted).not.toBe(tokens.access_token);
    expect(data?.access_token_encrypted).toMatch(/^encrypted:/);
  });
});
```

**Message Ingestion Idempotency (Priority P0):**
```typescript
// test/integration/message-ingestion.test.ts
describe('Message Ingestion - Idempotency', () => {
  it('should handle re-ingestion without duplicates', async () => {
    const mailboxId = 'mailbox_123';
    const messages = [
      { id: 'msg_1', threadId: 'thread_1', from: 'buyer@example.com' },
      { id: 'msg_2', threadId: 'thread_1', from: 'seller@example.com' },
    ];

    // First ingestion
    await gmailService.ingestMessages(mailboxId, messages);

    // Second ingestion (simulating re-sync)
    await gmailService.ingestMessages(mailboxId, messages);

    // Verify: exactly 2 messages, 1 thread
    const { data: messagesData } = await supabase
      .from('mail_messages')
      .select('*')
      .eq('mailbox_id', mailboxId);

    const { data: threadsData } = await supabase
      .from('mail_threads')
      .select('*')
      .eq('mailbox_id', mailboxId);

    expect(messagesData).toHaveLength(2);
    expect(threadsData).toHaveLength(1);
  });

  it('should update thread metadata when new message arrives', async () => {
    // Create initial thread with 1 message
    await gmailService.ingestMessages('mailbox_123', [
      { id: 'msg_1', threadId: 'thread_1', sentAt: '2025-12-30T10:00:00Z' },
    ]);

    // Add second message to thread
    await gmailService.ingestMessages('mailbox_123', [
      { id: 'msg_2', threadId: 'thread_1', sentAt: '2025-12-31T12:00:00Z' },
    ]);

    // Verify thread updated
    const { data } = await supabase
      .from('mail_threads')
      .select('message_count, last_message_at')
      .eq('provider_thread_id', 'thread_1')
      .single();

    expect(data?.message_count).toBe(2);
    expect(data?.last_message_at).toBe('2025-12-31T12:00:00Z');
  });
});
```

**Auto-Attach Rule Engine (Priority P0):**
```typescript
// test/integration/auto-attach.test.ts
describe('Auto-Attach Rule Engine', () => {
  beforeEach(async () => {
    // Seed test contacts
    await supabase.from('contacts').insert([
      { id: 'contact_1', email: 'buyer@example.com', org_id: 'org_1' },
      { id: 'contact_2', email: 'seller@example.com', org_id: 'org_1' },
    ]);

    // Seed test deals
    await supabase.from('deals').insert([
      { id: 'deal_1', org_id: 'org_1', stage: 'under_contract' },
    ]);

    // Link contact_1 to deal_1
    await supabase.from('deal_contacts').insert({
      deal_id: 'deal_1',
      contact_id: 'contact_1',
    });
  });

  it('should auto-attach email to contact by exact email match', async () => {
    const message = {
      id: 'msg_1',
      from: 'buyer@example.com',
      subject: 'Offer accepted!',
    };

    await gmailService.ingestMessages('mailbox_1', [message]);
    await ruleEngine.processAutoAttach('mailbox_1', 'msg_1');

    // Verify link created
    const { data } = await supabase
      .from('record_links')
      .select('*')
      .eq('source_type', 'message')
      .eq('target_type', 'contact')
      .eq('target_id', 'contact_1');

    expect(data).toHaveLength(1);
    expect(data?.[0].link_method).toBe('rule');
    expect(data?.[0].rule_name).toBe('EXACT_EMAIL_MATCH');
    expect(data?.[0].confidence).toBe(100);
  });

  it('should promote contact link to deal when contact has exactly 1 active deal', async () => {
    const message = {
      id: 'msg_2',
      from: 'buyer@example.com',
      subject: 'Inspection report',
    };

    await gmailService.ingestMessages('mailbox_1', [message]);
    await ruleEngine.processAutoAttach('mailbox_1', 'msg_2');

    // Verify links: 1 to contact, 1 to deal
    const { data: contactLinks } = await supabase
      .from('record_links')
      .select('*')
      .eq('target_type', 'contact')
      .eq('target_id', 'contact_1');

    const { data: dealLinks } = await supabase
      .from('record_links')
      .select('*')
      .eq('target_type', 'deal')
      .eq('target_id', 'deal_1');

    expect(contactLinks).toHaveLength(1);
    expect(dealLinks).toHaveLength(1);
    expect(dealLinks?.[0].rule_name).toBe('CONTACT_TO_RECORD_PROMOTION');
    expect(dealLinks?.[0].confidence).toBe(70);
  });

  it('should NOT auto-attach to deal when contact has multiple active deals', async () => {
    // Add second deal for contact_1
    await supabase.from('deals').insert({
      id: 'deal_2',
      org_id: 'org_1',
      stage: 'lead',
    });
    await supabase.from('deal_contacts').insert({
      deal_id: 'deal_2',
      contact_id: 'contact_1',
    });

    const message = {
      id: 'msg_3',
      from: 'buyer@example.com',
      subject: 'Multiple deals',
    };

    await gmailService.ingestMessages('mailbox_1', [message]);
    await ruleEngine.processAutoAttach('mailbox_1', 'msg_3');

    // Verify: link to contact ONLY, not to any deal
    const { data: dealLinks } = await supabase
      .from('record_links')
      .select('*')
      .eq('target_type', 'deal');

    expect(dealLinks).toHaveLength(0);
  });
});
```

**Ledger Event Chain (Priority P0):**
```typescript
// test/integration/ledger-events.test.ts
describe('Ledger Event Chain', () => {
  it('should create complete event chain for ingestion flow', async () => {
    // 1. Connect mailbox
    const mailbox = await createMailbox({ email: 'ashley@example.com' });

    // 2. Start sync
    await gmailService.startSync(mailbox.id);

    // 3. Ingest messages
    await gmailService.ingestMessages(mailbox.id, [
      { id: 'msg_1', threadId: 'thread_1', from: 'buyer@example.com' },
    ]);

    // 4. Auto-attach
    await ruleEngine.processAutoAttach(mailbox.id, 'msg_1');

    // Verify ledger event sequence
    const { data: events } = await supabase
      .from('ledger_events')
      .select('*')
      .eq('org_id', mailbox.org_id)
      .order('created_at', { ascending: true });

    expect(events).toMatchObject([
      { event_type: 'MAILBOX_CONNECTED', payload: expect.objectContaining({ mailbox_id: mailbox.id }) },
      { event_type: 'SYNC_STARTED', payload: expect.objectContaining({ sync_type: 'backfill' }) },
      { event_type: 'THREAD_INGESTED', payload: expect.objectContaining({ provider_thread_id: 'thread_1' }) },
      { event_type: 'MESSAGE_INGESTED', payload: expect.objectContaining({ provider_message_id: 'msg_1' }) },
      { event_type: 'EMAIL_AUTO_ATTACHED', payload: expect.objectContaining({ rule_name: 'EXACT_EMAIL_MATCH' }) },
      { event_type: 'SYNC_COMPLETED', payload: expect.objectContaining({ threads_synced: 1, messages_synced: 1 }) },
    ]);
  });
});
```

### 3.4 Pass Criteria

- All integration tests pass (0 failures)
- Database state is clean (no orphaned records)
- Ledger events are created for all actions
- Duration: <4 minutes

---

## Gate 4: Database Migrations

### 4.1 Purpose

Ensure database schema changes are safe, reversible, and don't break existing data. This gate is **critical** for Sprint 0.2 because we're adding 5 new tables (`mailboxes`, `mail_threads`, `mail_messages`, `mail_attachments`, `record_links`).

### 4.2 GitHub Actions Implementation

```yaml
name: Gate 4 - Database Migrations

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  migration-check:
    name: Database Migration Safety Check
    runs-on: ubuntu-latest
    timeout-minutes: 10

    services:
      postgres:
        image: supabase/postgres:15.1.0.117
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: reilq_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Link to Supabase project
        run: supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Check for migration files
        run: |
          if [ -z "$(ls -A supabase/migrations/*.sql 2>/dev/null)" ]; then
            echo "No migration files found. Skipping migration check."
            exit 0
          fi

      - name: Validate migration files
        run: |
          for file in supabase/migrations/*.sql; do
            echo "Validating $file..."
            # Check for common mistakes
            if grep -q "DROP TABLE.*IF NOT EXISTS" "$file"; then
              echo "ERROR: Found DROP TABLE without IF EXISTS check"
              exit 1
            fi
            if grep -q "ALTER TABLE.*DROP COLUMN" "$file" && ! grep -q "-- SAFE: Column is unused" "$file"; then
              echo "ERROR: DROP COLUMN detected without safety comment"
              exit 1
            fi
          done

      - name: Run migrations (forward)
        run: supabase db push
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/reilq_test

      - name: Check schema diff
        run: supabase db diff --check
        continue-on-error: false

      - name: Test migration rollback
        run: |
          # Get latest migration version
          LATEST_VERSION=$(ls -1 supabase/migrations/*.sql | tail -n 1 | sed 's/.*\/\([0-9]*\).*/\1/')
          PREVIOUS_VERSION=$((LATEST_VERSION - 1))

          # Rollback to previous version
          supabase db reset --version $PREVIOUS_VERSION

          # Re-apply latest migration
          supabase db push

      - name: Verify RLS policies
        run: |
          psql $DATABASE_URL -c "
            SELECT schemaname, tablename, COUNT(*) as policy_count
            FROM pg_policies
            WHERE schemaname = 'public'
            AND tablename IN ('mailboxes', 'mail_threads', 'mail_messages', 'mail_attachments', 'record_links')
            GROUP BY schemaname, tablename
            HAVING COUNT(*) = 0;
          "
          if [ $? -eq 0 ]; then
            echo "ERROR: Tables missing RLS policies detected"
            exit 1
          fi
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/reilq_test

      - name: Check for breaking changes
        run: |
          # Ensure no columns removed from existing tables
          supabase db diff --schema public > schema-diff.txt
          if grep -q "DROP COLUMN" schema-diff.txt; then
            echo "ERROR: Breaking schema change detected (DROP COLUMN)"
            cat schema-diff.txt
            exit 1
          fi
```

### 4.3 Migration Safety Checklist

**Required for every migration file:**

```sql
-- Migration: Add Gmail inbox tables
-- Version: 20251231120000
-- Safe: Yes (additive only, no data loss)
-- Rollback: Safe (tables can be dropped)

-- Enable RLS on all new tables
ALTER TABLE mailboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mail_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE mail_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE mail_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE record_links ENABLE ROW LEVEL SECURITY;

-- Create indexes CONCURRENTLY (non-blocking)
CREATE INDEX CONCURRENTLY idx_mail_messages_mailbox_id
  ON mail_messages(mailbox_id);

CREATE INDEX CONCURRENTLY idx_mail_messages_thread_id
  ON mail_messages(thread_id);

CREATE INDEX CONCURRENTLY idx_record_links_source
  ON record_links(source_type, source_id);

CREATE INDEX CONCURRENTLY idx_record_links_target
  ON record_links(target_type, target_id);

-- Add foreign key constraints with ON DELETE CASCADE
ALTER TABLE mail_threads
  ADD CONSTRAINT fk_mail_threads_mailbox
  FOREIGN KEY (mailbox_id) REFERENCES mailboxes(id)
  ON DELETE CASCADE;

-- Verify RLS policies exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'mailboxes'
    AND policyname = 'Users can only see their own mailboxes'
  ) THEN
    RAISE EXCEPTION 'Missing RLS policy for mailboxes';
  END IF;
END $$;
```

### 4.4 RLS Policy Verification

**Sprint 0.2 Required Policies:**

```sql
-- Mailboxes: Users can only see their own org's mailboxes
CREATE POLICY "org_isolation_mailboxes" ON mailboxes
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id');

-- Mail threads: Inherit from mailbox org_id
CREATE POLICY "org_isolation_mail_threads" ON mail_threads
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id');

-- Mail messages: Inherit from mailbox org_id
CREATE POLICY "org_isolation_mail_messages" ON mail_messages
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id');

-- Attachments: Inherit from mailbox org_id
CREATE POLICY "org_isolation_mail_attachments" ON mail_attachments
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id');

-- Record links: Org isolation
CREATE POLICY "org_isolation_record_links" ON record_links
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id');
```

### 4.5 Pass Criteria

- All migrations apply successfully (forward)
- Schema diff shows no unexpected changes
- Rollback succeeds (can revert to previous version)
- All new tables have RLS policies enabled
- No breaking changes to existing tables
- Indexes created with CONCURRENTLY (non-blocking)
- Duration: <2 minutes

---

## Gate 5: Security Scan

### 5.1 Purpose

Identify security vulnerabilities before production deployment. Focus on:
- Gmail OAuth token leakage
- PII (email bodies) in logs
- SQL injection in ingestion queries
- Dependency vulnerabilities (googleapis, supabase-js)

### 5.2 GitHub Actions Implementation

```yaml
name: Gate 5 - Security Scan

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  security-audit:
    name: Security Audit
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Full history for secret scanning

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      # Sub-gate 5.1: Dependency vulnerabilities
      - name: Run npm audit
        run: npm audit --audit-level=high --production
        continue-on-error: false

      # Sub-gate 5.2: Secret detection
      - name: Run gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      # Sub-gate 5.3: SAST (Static Application Security Testing)
      - name: Run Semgrep
        uses: semgrep/semgrep-action@v1
        with:
          config: >-
            p/security-audit
            p/sql-injection
            p/xss
            .semgrep-sprint-02.yml
          generateSarif: true

      - name: Upload Semgrep results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: semgrep.sarif

      # Sub-gate 5.4: OAuth scope validation
      - name: Validate Gmail OAuth scopes
        run: |
          # Ensure only readonly scopes are used
          if grep -r "gmail.modify\|gmail.send" src/; then
            echo "ERROR: Detected non-readonly Gmail scopes"
            exit 1
          fi

          # Verify readonly scope is present
          if ! grep -r "gmail.readonly" src/services/gmail-oauth.service.ts; then
            echo "ERROR: gmail.readonly scope not found"
            exit 1
          fi

      # Sub-gate 5.5: PII leak detection
      - name: Check for PII in logs
        run: |
          # Search for common logging patterns that might leak email content
          if grep -r "console.log.*body_plain\|logger.*body_html" src/; then
            echo "ERROR: Potential PII leak - email body in logs"
            exit 1
          fi

          if grep -r "console.log.*access_token\|logger.*refresh_token" src/; then
            echo "ERROR: OAuth token leak detected in logs"
            exit 1
          fi
```

### 5.3 Semgrep Custom Rules (Sprint 0.2)

**File: `.semgrep-sprint-02.yml`**

```yaml
rules:
  # Prevent email body logging (PII leak)
  - id: gmail-body-logging
    pattern-either:
      - pattern: console.log(..., $BODY.body_plain, ...)
      - pattern: console.log(..., $BODY.body_html, ...)
      - pattern: logger.info({ ..., body_plain: $VAR, ... })
      - pattern: logger.info({ ..., body_html: $VAR, ... })
    message: |
      Do not log email body content (PII). Use snippet or redacted version.
    severity: ERROR
    languages: [typescript]

  # Prevent OAuth token logging
  - id: oauth-token-logging
    pattern-either:
      - pattern: console.log(..., $TOKEN.access_token, ...)
      - pattern: console.log(..., $TOKEN.refresh_token, ...)
      - pattern: logger.info({ ..., access_token: $VAR, ... })
    message: |
      Do not log OAuth tokens. Tokens must be encrypted at rest.
    severity: ERROR
    languages: [typescript]

  # Prevent SQL injection in dynamic queries
  - id: sql-injection-mail-queries
    pattern: |
      supabase.from($TABLE).select($QUERY)
    message: |
      Potential SQL injection. Use parameterized queries.
    severity: WARNING
    languages: [typescript]
    paths:
      include:
        - "src/services/gmail-*.ts"

  # Ensure OAuth scopes are readonly
  - id: gmail-write-scope-usage
    pattern-either:
      - pattern: "'https://www.googleapis.com/auth/gmail.modify'"
      - pattern: "'https://www.googleapis.com/auth/gmail.send'"
    message: |
      Sprint 0.2 is READONLY only. Do not use gmail.modify or gmail.send scopes.
    severity: ERROR
    languages: [typescript]

  # Prevent hardcoded secrets
  - id: hardcoded-gmail-credentials
    pattern-either:
      - pattern: |
          const clientId = "..."
      - pattern: |
          const clientSecret = "..."
    message: |
      Do not hardcode Gmail OAuth credentials. Use environment variables.
    severity: ERROR
    languages: [typescript]
    paths:
      include:
        - "src/**/*.ts"
```

### 5.4 npm Audit Exceptions

**File: `audit-ignore.json`** (if needed)

```json
{
  "ignores": [
    {
      "advisory": "GHSA-example-1234",
      "reason": "Dev dependency only, not in production bundle",
      "expiry": "2026-01-31",
      "approvedBy": "security-lead"
    }
  ]
}
```

### 5.5 Pass Criteria

- npm audit: 0 high/critical vulnerabilities in production dependencies
- gitleaks: 0 secrets detected in commits
- Semgrep: 0 high/critical findings
- OAuth scope validation: Only `gmail.readonly` used
- PII leak check: No email bodies in logs
- Duration: <2 minutes

### 5.6 Failure Actions

**If secret detected:**
1. IMMEDIATELY revoke the secret (Gmail API Console, Supabase dashboard)
2. Remove secret from code
3. Use environment variables: `process.env.GMAIL_CLIENT_SECRET`
4. Rewrite git history if secret is in commits: `git filter-repo --path src/config.ts --invert-paths`

**If PII leak detected:**
1. Replace with redacted logging: `logger.info({ subject, snippet: body_plain.slice(0, 100) })`
2. Add unit test to verify PII is not logged

---

## Branch Protection Rules

### 7.1 GitHub Repository Settings

**Navigate to:** Settings → Branches → Branch protection rules → Add rule

**Branch name pattern:** `main`

**Protection settings:**

```yaml
Branch Protection Configuration:

  ✅ Require a pull request before merging
    ✅ Require approvals: 1
    ✅ Dismiss stale pull request approvals when new commits are pushed
    ✅ Require review from Code Owners (if CODEOWNERS file exists)
    ☐ Restrict who can dismiss pull request reviews (optional)
    ✅ Allow specified actors to bypass required pull requests (emergency only)
      - Repository admins (for hotfixes)

  ✅ Require status checks to pass before merging
    ✅ Require branches to be up to date before merging
    Required status checks:
      - Gate 1 - Lint & Type Check / lint-and-type-check
      - Gate 2 - Unit Tests / unit-tests
      - Gate 3 - Integration Tests / integration-tests
      - Gate 4 - Database Migrations / migration-check
      - Gate 5 - Security Scan / security-audit

  ✅ Require conversation resolution before merging

  ✅ Require signed commits (recommended for compliance)

  ✅ Require linear history (no merge commits, use squash or rebase)

  ✅ Require deployments to succeed before merging
    - Environment: preview (Vercel preview deployment)

  ☐ Lock branch (only for production freeze)

  ✅ Do not allow bypassing the above settings
    Exceptions: Repository admins (with audit log)

  ✅ Restrict who can push to matching branches
    - Only allow: github-actions[bot], release-manager

  ✅ Allow force pushes: Never

  ✅ Allow deletions: Never
```

### 7.2 Required Status Checks

**All checks must pass:**

1. `Gate 1 - Lint & Type Check / lint-and-type-check`
2. `Gate 2 - Unit Tests / unit-tests`
3. `Gate 3 - Integration Tests / integration-tests`
4. `Gate 4 - Database Migrations / migration-check`
5. `Gate 5 - Security Scan / security-audit`

**Optional (but recommended):**
- `codecov/patch` - Coverage check on new code
- `codecov/project` - Overall coverage check

### 7.3 CODEOWNERS File

**File: `.github/CODEOWNERS`**

```
# Sprint 0.2 Code Owners

# Database migrations require approval from backend + infra
/supabase/migrations/          @backend-dev @supabase-admin @infra-deployment-specialist

# Security-sensitive files require security review
/src/services/gmail-oauth.service.ts    @backend-dev @saas-security-auditor
/src/lib/encryption.ts                  @saas-security-auditor
/.github/workflows/*.yml                @github-admin @saas-security-auditor

# Auto-attach rules require backend + product approval
/src/services/auto-attach-rules.ts      @backend-dev @product-owner

# CI/CD configuration requires QA approval
/.github/workflows/                     @github-admin @pre-deployment-quality-auditor
/06_QA/release-gates.md                 @pre-deployment-quality-auditor

# All files (default reviewers)
*                                       @backend-dev @frontend-dev
```

---

## Merge Requirements

### 8.1 Pre-Merge Checklist

**Developer must verify:**

- [ ] All 5 gates passed (green checkmarks in PR)
- [ ] At least 1 approval from code owner
- [ ] All PR comments resolved
- [ ] Branch is up-to-date with `main`
- [ ] No merge conflicts
- [ ] Commit messages follow convention: `feat(gmail): Add message ingestion service`
- [ ] PR description includes:
  - Summary of changes
  - Testing evidence (screenshots for UI, test output for backend)
  - Database migration notes (if applicable)
  - Security considerations (if applicable)

### 8.2 Approval Requirements

**Minimum approvals: 1**

**Required approvers by file type:**

| File Changed | Required Approver |
|--------------|-------------------|
| `/supabase/migrations/*.sql` | `@supabase-admin` or `@backend-dev` |
| `/src/services/gmail-*.ts` | `@backend-dev` |
| `/src/components/**/*.tsx` | `@frontend-dev` or `@ui-ux-design-virtuoso` |
| `/.github/workflows/*.yml` | `@github-admin` or `@pre-deployment-quality-auditor` |
| Security-sensitive files | `@saas-security-auditor` |

### 8.3 Merge Strategy

**Required: Squash and Merge**

- Combines all commits into a single commit on `main`
- Keeps `main` history clean and linear
- Commit message format:
  ```
  feat(gmail): Add Gmail OAuth connection and message ingestion (#123)

  - Implement OAuth 2.0 flow with readonly scopes
  - Add message/thread/attachment ingestion with deduplication
  - Create auto-attach rule engine (email → contact/deal)
  - Add ledger events for all ingestion actions

  Closes #AUTH-101, #BE-301, #BE-302
  ```

**Alternative (if needed): Rebase and Merge**
- Use when preserving individual commits is important
- Only for complex multi-part features

**Forbidden: Merge Commit**
- Creates non-linear history
- Makes bisecting bugs harder

### 8.4 Automated Merge Checks

**Pre-merge validation script:**

```yaml
# .github/workflows/pre-merge-validation.yml
name: Pre-Merge Validation

on:
  pull_request:
    types: [labeled]

jobs:
  validate-merge-ready:
    if: contains(github.event.pull_request.labels.*.name, 'ready-to-merge')
    runs-on: ubuntu-latest

    steps:
      - name: Check all required checks passed
        run: |
          # Use GitHub API to verify all checks passed
          gh pr checks ${{ github.event.pull_request.number }} --required
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Check approval count
        run: |
          APPROVALS=$(gh pr view ${{ github.event.pull_request.number }} --json reviews --jq '[.reviews[] | select(.state == "APPROVED")] | length')
          if [ "$APPROVALS" -lt 1 ]; then
            echo "ERROR: Need at least 1 approval"
            exit 1
          fi

      - name: Check branch is up-to-date
        run: |
          gh pr view ${{ github.event.pull_request.number }} --json mergeable --jq .mergeable
```

---

## Deployment Gates

### 9.1 Preview Deployment (Automatic)

**Trigger:** Every PR commit
**Platform:** Vercel Preview
**Purpose:** Test changes in production-like environment

```yaml
# Vercel automatically deploys previews, but we add checks
name: Preview Deployment Check

on:
  deployment_status:

jobs:
  verify-preview:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest

    steps:
      - name: Run smoke tests on preview
        run: |
          PREVIEW_URL="${{ github.event.deployment_status.target_url }}"

          # Check homepage loads
          curl -f "$PREVIEW_URL" || exit 1

          # Check API health endpoint
          curl -f "$PREVIEW_URL/api/health" || exit 1

          # Check Gmail OAuth initiation (doesn't complete, just checks endpoint)
          curl -f "$PREVIEW_URL/api/gmail/auth/init" -H "Authorization: Bearer ${{ secrets.TEST_TOKEN }}"

      - name: Comment preview URL on PR
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `✅ Preview deployed: ${{ github.event.deployment_status.target_url }}`
            })
```

### 9.2 Production Deployment

**Trigger:** Merge to `main`
**Platform:** Vercel Production
**Approval:** Automatic (if all gates passed)

```yaml
name: Production Deployment

on:
  push:
    branches: [main]

jobs:
  pre-deploy-checks:
    runs-on: ubuntu-latest
    steps:
      - name: Verify main is protected
        run: |
          # Ensure this commit went through PR process
          if [ "${{ github.event.head_commit.author.name }}" == "GitHub" ]; then
            echo "✅ Commit from PR merge"
          else
            echo "ERROR: Direct push to main detected"
            exit 1
          fi

      - name: Check if database migrations exist
        uses: actions/checkout@v4
        run: |
          if [ -n "$(git diff HEAD~1 supabase/migrations/)" ]; then
            echo "::set-output name=migrations_exist::true"
          fi
        id: check-migrations

      - name: Run database migrations
        if: steps.check-migrations.outputs.migrations_exist == 'true'
        run: |
          supabase db push --linked
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_PROJECT_REF: ${{ secrets.SUPABASE_PROJECT_REF }}

  deploy:
    needs: pre-deploy-checks
    runs-on: ubuntu-latest

    steps:
      - name: Deploy to Vercel Production
        uses: vercel/actions-deploy@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          production: true

  post-deploy-checks:
    needs: deploy
    runs-on: ubuntu-latest

    steps:
      - name: Run production smoke tests
        run: |
          # Wait for deployment to propagate
          sleep 30

          # Check production health
          curl -f https://app.reilq.com/api/health || exit 1

          # Verify database connectivity
          curl -f https://app.reilq.com/api/health/db || exit 1

          # Check Gmail OAuth endpoint (doesn't complete flow)
          curl -f https://app.reilq.com/api/gmail/auth/init \
            -H "Authorization: Bearer ${{ secrets.PROD_TEST_TOKEN }}"

      - name: Notify deployment success
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
          payload: |
            {
              "text": "✅ Sprint 0.2 deployed to production",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Sprint 0.2 - Gmail Integration* deployed to production\n\n*Commit:* ${{ github.sha }}\n*Author:* ${{ github.event.head_commit.author.name }}"
                  }
                }
              ]
            }

      - name: Notify deployment failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
          payload: |
            {
              "text": "❌ Production deployment FAILED - Sprint 0.2",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "<!channel> *URGENT:* Production deployment failed\n\n*Commit:* ${{ github.sha }}\n*Logs:* ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
                  }
                }
              ]
            }
```

### 9.3 Deployment Approval (Optional - Manual Gate)

For critical deployments, add manual approval:

```yaml
# .github/workflows/production-deploy.yml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://app.reilq.com

    steps:
      # ... deployment steps
```

**GitHub Settings → Environments → production:**
- Required reviewers: `@tech-lead`, `@product-owner`
- Deployment branches: `main` only
- Environment secrets: `VERCEL_TOKEN`, `SUPABASE_ACCESS_TOKEN`

---

## Complete GitHub Actions Workflow

### 10.1 Main CI/CD Workflow

**File: `.github/workflows/ci-cd.yml`**

```yaml
name: CI/CD Pipeline - Sprint 0.2

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

env:
  NODE_VERSION: '20'
  POSTGRES_VERSION: '15'

jobs:
  # ==================================================
  # Gate 1: Lint & Type Check (Fast Fail)
  # ==================================================
  gate-1-lint:
    name: Gate 1 - Lint & Type Check
    runs-on: ubuntu-latest
    timeout-minutes: 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npx eslint . --ext .ts,.tsx --max-warnings 0

      - name: Run TypeScript check
        run: npx tsc --noEmit

      - name: Check Prettier formatting
        run: npx prettier --check 'src/**/*.{ts,tsx,json,css,md}'

  # ==================================================
  # Gate 2: Unit Tests (Parallel with Gate 3)
  # ==================================================
  gate-2-unit-tests:
    name: Gate 2 - Unit Tests
    needs: gate-1-lint
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit
        env:
          CI: true

      - name: Generate coverage report
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          flags: unittests
          fail_ci_if_error: true
          token: ${{ secrets.CODECOV_TOKEN }}

  # ==================================================
  # Gate 3: Integration Tests (Parallel with Gate 2)
  # ==================================================
  gate-3-integration-tests:
    name: Gate 3 - Integration Tests
    needs: gate-1-lint
    runs-on: ubuntu-latest
    timeout-minutes: 15

    services:
      postgres:
        image: supabase/postgres:15.1.0.117
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: reilq_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Install dependencies
        run: npm ci

      - name: Run database migrations
        run: npx supabase db push
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/reilq_test
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Seed test data
        run: npm run db:seed:test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/reilq_test

      - name: Run integration tests
        run: npm run test:integration
        env:
          CI: true
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/reilq_test
          REDIS_URL: redis://localhost:6379
          GMAIL_CLIENT_ID: ${{ secrets.GMAIL_CLIENT_ID_TEST }}
          GMAIL_CLIENT_SECRET: ${{ secrets.GMAIL_CLIENT_SECRET_TEST }}

      - name: Upload test logs
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: integration-test-logs
          path: logs/

  # ==================================================
  # Gate 4: Database Migrations
  # ==================================================
  gate-4-migrations:
    name: Gate 4 - Database Migrations
    needs: [gate-2-unit-tests, gate-3-integration-tests]
    runs-on: ubuntu-latest
    timeout-minutes: 10

    services:
      postgres:
        image: supabase/postgres:15.1.0.117
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: reilq_test
        ports:
          - 5432:5432

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1

      - name: Validate migration files
        run: |
          for file in supabase/migrations/*.sql; do
            if [ -f "$file" ]; then
              echo "Validating $file..."
              # Check for unsafe operations
              if grep -q "DROP TABLE" "$file" && ! grep -q "IF EXISTS" "$file"; then
                echo "ERROR: Unsafe DROP TABLE in $file"
                exit 1
              fi
            fi
          done

      - name: Run migrations forward
        run: npx supabase db push
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/reilq_test

      - name: Verify RLS policies
        run: |
          TABLES=("mailboxes" "mail_threads" "mail_messages" "mail_attachments" "record_links")
          for table in "${TABLES[@]}"; do
            COUNT=$(psql $DATABASE_URL -t -c "SELECT COUNT(*) FROM pg_policies WHERE tablename='$table';")
            if [ "$COUNT" -eq 0 ]; then
              echo "ERROR: No RLS policies for $table"
              exit 1
            fi
          done
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/reilq_test

      - name: Check schema diff
        run: npx supabase db diff --check

  # ==================================================
  # Gate 5: Security Scan
  # ==================================================
  gate-5-security:
    name: Gate 5 - Security Scan
    needs: gate-1-lint
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run npm audit
        run: npm audit --audit-level=high --production

      - name: Run gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Run Semgrep
        uses: semgrep/semgrep-action@v1
        with:
          config: >-
            p/security-audit
            p/sql-injection
            .semgrep-sprint-02.yml
          generateSarif: true

      - name: Upload Semgrep SARIF
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: semgrep.sarif

      - name: Validate Gmail OAuth scopes
        run: |
          if grep -r "gmail.modify\|gmail.send" src/; then
            echo "ERROR: Non-readonly Gmail scopes detected"
            exit 1
          fi

      - name: Check for PII leaks
        run: |
          if grep -r "console.log.*body_plain\|logger.*body_html" src/; then
            echo "ERROR: Potential PII leak in logs"
            exit 1
          fi

  # ==================================================
  # All Gates Passed
  # ==================================================
  all-gates-passed:
    name: All Gates Passed ✅
    needs: [gate-1-lint, gate-2-unit-tests, gate-3-integration-tests, gate-4-migrations, gate-5-security]
    runs-on: ubuntu-latest

    steps:
      - name: Success notification
        run: |
          echo "✅ All CI gates passed!"
          echo "Ready for code review and merge."

      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ **All CI gates passed!** This PR is ready for review.\n\n**Gates:**\n- ✅ Gate 1: Lint & Type Check\n- ✅ Gate 2: Unit Tests\n- ✅ Gate 3: Integration Tests\n- ✅ Gate 4: Database Migrations\n- ✅ Gate 5: Security Scan'
            })
```

### 10.2 Environment Variables & Secrets

**GitHub Secrets (Settings → Secrets → Actions):**

```
# Supabase
SUPABASE_ACCESS_TOKEN          # Supabase CLI access token
SUPABASE_PROJECT_REF           # Supabase project ID
SUPABASE_ANON_KEY_TEST         # Test environment anon key
SUPABASE_SERVICE_KEY_TEST      # Test environment service key

# Gmail OAuth (Test)
GMAIL_CLIENT_ID_TEST           # Test OAuth client ID
GMAIL_CLIENT_SECRET_TEST       # Test OAuth client secret

# Vercel
VERCEL_TOKEN                   # Vercel deployment token
VERCEL_ORG_ID                  # Vercel organization ID
VERCEL_PROJECT_ID              # Vercel project ID

# Code Coverage
CODECOV_TOKEN                  # Codecov upload token

# Notifications
SLACK_WEBHOOK_URL              # Slack notifications webhook
```

**Environment Variables (.env.example):**

```bash
# DO NOT commit actual values - this is a template

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Gmail OAuth
GMAIL_CLIENT_ID=xxx.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=xxx
GMAIL_REDIRECT_URI=http://localhost:3000/api/gmail/callback

# Database (for local development)
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# Redis (for local development)
REDIS_URL=redis://localhost:6379
```

---

## Rollback Procedures

### 11.1 Rollback Triggers

**Initiate rollback if:**
- Production error rate >5% within 10 minutes of deployment
- Critical feature broken (Gmail OAuth fails, ingestion crashes)
- Database migration causes data corruption
- Security vulnerability discovered in deployed code

### 11.2 Automatic Rollback (Vercel)

Vercel allows instant rollback to previous deployment:

```bash
# List recent deployments
vercel list

# Rollback to previous deployment
vercel rollback <deployment-url>
```

**GitHub Actions Automated Rollback:**

```yaml
name: Auto-Rollback on Failure

on:
  deployment_status:

jobs:
  check-deployment-health:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest

    steps:
      - name: Wait for deployment to stabilize
        run: sleep 60

      - name: Check production health
        id: health-check
        run: |
          HEALTH=$(curl -s https://app.reilq.com/api/health | jq -r .status)
          if [ "$HEALTH" != "ok" ]; then
            echo "::set-output name=healthy::false"
            exit 1
          fi
        continue-on-error: true

      - name: Trigger rollback
        if: steps.health-check.outputs.healthy == 'false'
        run: |
          vercel rollback --token ${{ secrets.VERCEL_TOKEN }}

      - name: Notify team of rollback
        if: steps.health-check.outputs.healthy == 'false'
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
          payload: |
            {
              "text": "🚨 ROLLBACK INITIATED - Production health check failed",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "<!channel> *Production rollback initiated*\n\n*Reason:* Health check failed\n*Deployment:* ${{ github.event.deployment.sha }}\n*Rolled back to:* Previous stable version"
                  }
                }
              ]
            }
```

### 11.3 Database Rollback

**For migration issues:**

```bash
# Connect to production database
supabase db remote commit

# List migrations
supabase migration list

# Rollback to previous version
supabase db reset --version <previous-version>

# Verify rollback
supabase db diff
```

**Emergency database restore:**

```bash
# Restore from Supabase automatic backup
supabase db restore --backup-id <backup-id>
```

### 11.4 Manual Rollback Checklist

If automatic rollback fails:

1. **Stop new deployments:**
   ```bash
   # Lock main branch
   gh api repos/:owner/:repo/branches/main/protection \
     --field lock_branch=true
   ```

2. **Revert code:**
   ```bash
   # Create revert commit
   git revert <bad-commit-sha>
   git push origin main
   ```

3. **Rollback database (if needed):**
   ```bash
   supabase db reset --version <stable-version>
   ```

4. **Verify rollback:**
   ```bash
   # Test critical flows
   curl https://app.reilq.com/api/health
   curl https://app.reilq.com/api/gmail/auth/init
   ```

5. **Notify stakeholders:**
   - Post in #engineering Slack channel
   - Update status page (if applicable)
   - Create incident report

---

## Deployment Checklist

### 12.1 Pre-Deployment Checklist

**Developer checklist (before creating PR):**

- [ ] All tests pass locally: `npm run test`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] No linting errors: `npm run lint`
- [ ] Code formatted: `npm run format`
- [ ] Database migrations tested locally (if applicable)
- [ ] Environment variables documented in `.env.example`
- [ ] PII handling verified (no email bodies in logs)
- [ ] OAuth scopes verified (readonly only)

**Code review checklist:**

- [ ] Code follows project conventions
- [ ] No hardcoded secrets or credentials
- [ ] Error handling is comprehensive
- [ ] Logging is appropriate (no PII)
- [ ] Tests cover critical paths
- [ ] Database migrations are safe and reversible
- [ ] RLS policies are in place for new tables
- [ ] Documentation updated (if needed)

### 12.2 Pre-Production Deployment Checklist

**Before merging to main:**

- [ ] All 5 CI gates passed
- [ ] At least 1 code review approval
- [ ] All PR comments resolved
- [ ] Preview deployment tested manually
- [ ] Database migrations reviewed by DBA/backend lead
- [ ] Security scan passed (no critical findings)
- [ ] Branch is up-to-date with main

### 12.3 Post-Deployment Checklist

**Within 5 minutes of production deployment:**

- [ ] Production health check passes: `https://app.reilq.com/api/health`
- [ ] Database connectivity verified
- [ ] Gmail OAuth initiation endpoint responds
- [ ] Error monitoring dashboard shows no spikes (Sentry, Datadog, etc.)
- [ ] Performance metrics within acceptable range

**Within 30 minutes of production deployment:**

- [ ] Test Gmail connection flow end-to-end in production
- [ ] Verify message ingestion works (test with real Gmail account)
- [ ] Check ledger events are being created
- [ ] Verify auto-attach rules execute correctly
- [ ] Monitor for any user-reported issues

**Within 24 hours of production deployment:**

- [ ] Review production logs for unexpected errors
- [ ] Check database query performance (slow query log)
- [ ] Verify no data integrity issues
- [ ] Monitor Gmail API quota usage
- [ ] Review security alerts (if any)

### 12.4 Sprint 0.2 Success Criteria

**Deployment is successful if:**

1. **Gmail OAuth works:** User can connect Gmail account, see status in UI
2. **Ingestion works:** 50+ messages ingested without duplicates
3. **Attachments stored:** Attachments saved to Supabase Storage with SHA-256 hashing
4. **Auto-attach works:** Emails auto-link to contacts by email match
5. **Manual attach works:** User can manually attach thread to deal/property
6. **Ledger complete:** All ingestion/attachment events visible in audit log
7. **Tests pass:** All 5 CI gates green
8. **No PII leaks:** Email bodies not logged or exposed
9. **No security issues:** No high/critical vulnerabilities
10. **Performance acceptable:** Ingestion completes within 5 minutes for 50 messages

---

## Appendix: Quick Reference

### CI Gate Summary

| Gate | Purpose | Duration | Blocks on Failure |
|------|---------|----------|-------------------|
| Gate 1 | Lint & Type Check | ~45s | Yes (fast fail) |
| Gate 2 | Unit Tests | ~3m | Yes |
| Gate 3 | Integration Tests | ~4m | Yes |
| Gate 4 | Database Migrations | ~2m | Yes |
| Gate 5 | Security Scan | ~2m | Yes |
| **Total** | **All Gates** | **~10m** | **Yes** |

### Required npm Scripts

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx --max-warnings 0",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write 'src/**/*.{ts,tsx,json,css,md}'",
    "format:check": "prettier --check 'src/**/*.{ts,tsx,json,css,md}'",
    "test": "vitest",
    "test:unit": "vitest run --coverage",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:coverage": "vitest run --coverage",
    "db:seed:test": "tsx scripts/seed-test-db.ts"
  }
}
```

### Key Files

```
.github/
  workflows/
    ci-cd.yml                     # Main CI/CD pipeline
    pre-merge-validation.yml       # Pre-merge checks
    production-deploy.yml          # Production deployment
.semgrep-sprint-02.yml            # Security rules
.gitleaks.toml                    # Secret scanning config
.eslintrc.json                    # Linting rules
tsconfig.json                     # TypeScript config
vitest.config.ts                  # Unit test config
vitest.integration.config.ts      # Integration test config
supabase/migrations/              # Database migrations
.env.example                      # Environment variables template
```

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-31 | pre-deployment-quality-auditor | Initial release gates for Sprint 0.2 |

---

**Next Review Date:** 2026-01-02 (post-sprint retrospective)

**Owner:** pre-deployment-quality-auditor
**Approvers:** github-admin, backend-dev, saas-security-auditor
**Status:** ACTIVE - Enforced on all PRs to `main`
