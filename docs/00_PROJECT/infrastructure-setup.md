# REIL/Q Infrastructure Setup Guide
## Sprint 0.2 - Gmail-First Inbox Spine

**Version:** 1.0
**Last Updated:** 2025-12-31
**Status:** ACTIVE
**Sprint Window:** 72 hours

---

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Google Cloud Console Setup](#google-cloud-console-setup)
3. [Supabase Configuration](#supabase-configuration)
4. [Local Development Setup](#local-development-setup)
5. [Secrets Management](#secrets-management)
6. [Deployment Environments](#deployment-environments)
7. [Infrastructure Checklist](#infrastructure-checklist)
8. [Runbook for Common Tasks](#runbook-for-common-tasks)

---

## 1. Environment Variables

### Complete Environment Variable Template

```bash
# ============================================================
# SUPABASE CONFIGURATION
# ============================================================
# Get from: https://app.supabase.com/project/YOUR_PROJECT/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# ============================================================
# GOOGLE OAUTH & GMAIL API
# ============================================================
# Get from: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google

# Gmail API Scopes (configured in OAuth consent screen)
# - https://www.googleapis.com/auth/gmail.readonly
# - openid
# - https://www.googleapis.com/auth/userinfo.email

# ============================================================
# ENCRYPTION & SECURITY
# ============================================================
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
TOKEN_ENCRYPTION_KEY=

# NextAuth secret (required for production)
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=

# ============================================================
# APPLICATION CONFIGURATION
# ============================================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# ============================================================
# OPTIONAL: SYNC CONFIGURATION
# ============================================================
# Initial Gmail backfill window (days)
GMAIL_BACKFILL_DAYS=30

# Sync interval (minutes) - for background jobs
GMAIL_SYNC_INTERVAL=15

# Max attachment size (MB)
MAX_ATTACHMENT_SIZE_MB=25

# ============================================================
# MONITORING & LOGGING
# ============================================================
# Sentry DSN (optional)
SENTRY_DSN=

# Log level
LOG_LEVEL=info
```

### Environment Variable Validation Rules

| Variable | Required | Validation | Notes |
|----------|----------|------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Must start with `https://` | Public, client-side accessible |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Valid JWT format | Public, client-side accessible |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Valid JWT format | CRITICAL: Server-side only, never expose |
| `GOOGLE_CLIENT_ID` | Yes | Ends with `.apps.googleusercontent.com` | OAuth 2.0 client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Starts with `GOCSPX-` | CRITICAL: Never commit to git |
| `TOKEN_ENCRYPTION_KEY` | Yes | Min 32 characters, hex format | Used for encrypting OAuth tokens in DB |
| `NEXTAUTH_SECRET` | Yes (prod) | Min 32 characters | Required in production |
| `NEXT_PUBLIC_APP_URL` | Yes | Valid URL | Must match OAuth redirect URI base |

### Critical Security Requirements

- **NEVER** commit `.env.local` to version control
- **NEVER** expose `SUPABASE_SERVICE_ROLE_KEY` to client-side code
- **NEVER** log or transmit `TOKEN_ENCRYPTION_KEY` in plain text
- **ALWAYS** use environment-specific keys (dev/staging/prod)
- **ALWAYS** rotate `TOKEN_ENCRYPTION_KEY` if compromised (see runbook)

---

## 2. Google Cloud Console Setup

### Step 1: Create Google Cloud Project

1. Navigate to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" dropdown → "New Project"
3. Enter project details:
   - **Project Name:** `REIL-Q-Gmail-Integration`
   - **Organization:** (select your org)
   - **Location:** (select parent folder if applicable)
4. Click "Create"
5. Note your **Project ID** (format: `reil-q-gmail-xxxxx`)

### Step 2: Enable Gmail API

1. In your project, navigate to: **APIs & Services → Library**
2. Search for "Gmail API"
3. Click "Gmail API" → "Enable"
4. Wait for activation (usually < 30 seconds)

### Step 3: Configure OAuth Consent Screen

1. Navigate to: **APIs & Services → OAuth consent screen**
2. Select **User Type:**
   - Development/Testing: "Internal" (G Workspace only)
   - Production: "External"
3. Click "Create"

**App Information:**
```
App name: REIL/Q Gmail Integration
User support email: [your support email]
Application home page: https://reil-q.vercel.app (update for production)
Application privacy policy: https://reil-q.vercel.app/privacy
Application terms of service: https://reil-q.vercel.app/terms
```

**Developer Contact Information:**
```
Email: [your dev team email]
```

4. Click "Save and Continue"

**Scopes Configuration:**
1. Click "Add or Remove Scopes"
2. Add these scopes:

| Scope | Description | Required |
|-------|-------------|----------|
| `https://www.googleapis.com/auth/gmail.readonly` | Read Gmail messages and threads | Yes |
| `openid` | OpenID Connect authentication | Yes |
| `https://www.googleapis.com/auth/userinfo.email` | View user email address | Yes |

3. Click "Update" → "Save and Continue"

**Test Users (for External apps in testing):**
1. Add test user emails (max 100 during testing)
2. Click "Save and Continue"

### Step 4: Create OAuth 2.0 Credentials

1. Navigate to: **APIs & Services → Credentials**
2. Click "Create Credentials" → "OAuth client ID"
3. Select **Application type:** "Web application"
4. Configure:

```
Name: REIL/Q Web Client

Authorized JavaScript origins:
- http://localhost:3000
- https://reil-q-dev.vercel.app
- https://reil-q-staging.vercel.app
- https://reil-q.vercel.app

Authorized redirect URIs:
- http://localhost:3000/api/auth/callback/google
- https://reil-q-dev.vercel.app/api/auth/callback/google
- https://reil-q-staging.vercel.app/api/auth/callback/google
- https://reil-q.vercel.app/api/auth/callback/google
```

5. Click "Create"
6. **CRITICAL:** Copy and securely store:
   - Client ID (format: `xxxxx.apps.googleusercontent.com`)
   - Client Secret (format: `GOCSPX-xxxxx`)

### Step 5: Configure API Quotas & Monitoring

1. Navigate to: **APIs & Services → Gmail API → Quotas**
2. Default quotas (as of 2025):
   - **Per-user rate limit:** 250 quota units/second/user
   - **Daily usage:** 1 billion quota units/day

**Request Cost Reference:**
| Operation | Quota Cost |
|-----------|------------|
| `users.messages.list` | 5 units |
| `users.messages.get` | 5 units |
| `users.threads.list` | 5 units |
| `users.threads.get` | 10 units |
| `users.history.list` | 5 units |

**Mitigation Strategy:**
- Implement exponential backoff for 429 errors
- Batch requests where possible
- Use `historyId` for incremental sync (more efficient)
- Cache thread/message metadata

### Step 6: Set Up Service Account (Optional - for background sync)

**Note:** If you need server-to-server sync without user interaction:

1. Navigate to: **APIs & Services → Credentials**
2. Click "Create Credentials" → "Service Account"
3. Configure:
   - **Service account name:** `reil-q-gmail-sync`
   - **Service account ID:** `reil-q-gmail-sync`
   - **Description:** "Background Gmail sync service"
4. Grant role: **Service Account Token Creator**
5. Create and download JSON key
6. Store securely as `GOOGLE_SERVICE_ACCOUNT_KEY` environment variable

**WARNING:** Service accounts require domain-wide delegation for Gmail API (G Workspace only).

---

## 3. Supabase Configuration

### Step 1: Create Supabase Project

1. Navigate to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Configure:
   - **Name:** `REIL-Q-Production` (or `REIL-Q-Dev`)
   - **Database Password:** Generate strong password (store in password manager)
   - **Region:** Choose closest to your users (e.g., `us-east-1`)
   - **Pricing Plan:** Pro (recommended for production)
4. Wait for project provisioning (2-3 minutes)

### Step 2: Configure Storage Bucket for Attachments

1. Navigate to: **Storage** in Supabase dashboard
2. Click "Create a new bucket"
3. Configure bucket:

```
Name: mail-attachments
Public: No (private bucket)
Allowed MIME types: (leave empty for all types)
File size limit: 25 MB
```

4. Click "Create bucket"

**Set Up Row Level Security (RLS) Policies:**

1. Click on `mail-attachments` bucket → "Policies"
2. Create policy: "Users can read their org's attachments"

```sql
CREATE POLICY "Users can read org attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'mail-attachments'
  AND (storage.foldername(name))[1] = auth.jwt() ->> 'org_id'
);
```

3. Create policy: "Service role can manage all attachments"

```sql
CREATE POLICY "Service role full access"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'mail-attachments')
WITH CHECK (bucket_id = 'mail-attachments');
```

### Step 3: Database Schema Migration

**Migration file location:** `d:/SkySlope/REIL-Q/database/migrations/`

**Execute schema creation:**

```bash
# Connect to Supabase database
psql "$SUPABASE_DB_URL"

# Run migrations in order
\i d:/SkySlope/REIL-Q/database/migrations/001_create_mailbox_schema.sql
\i d:/SkySlope/REIL-Q/database/migrations/002_create_rls_policies.sql
\i d:/SkySlope/REIL-Q/database/migrations/003_create_indexes.sql
```

**Verify schema:**

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('mailboxes', 'mail_threads', 'mail_messages', 'mail_attachments', 'record_links');

-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'mail%';
```

### Step 4: Configure RLS Policies

**Critical RLS Requirements:**
- All mail tables MUST enforce org isolation
- Users can only access mail from their own org
- Service role bypasses RLS for background jobs

**Example RLS Policy (apply to all mail tables):**

```sql
-- Enable RLS
ALTER TABLE mailboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mail_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE mail_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE mail_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE record_links ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their org's data
CREATE POLICY "org_isolation_policy" ON mailboxes
FOR ALL TO authenticated
USING (org_id = (auth.jwt() ->> 'org_id')::uuid)
WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- Repeat for all tables with org_id column
```

**Test RLS Policies:**

```sql
-- Set session to simulate user from org A
SET request.jwt.claims = '{"org_id": "11111111-1111-1111-1111-111111111111"}';

-- Should return only org A data
SELECT * FROM mailboxes;

-- Attempt to access org B data (should fail)
INSERT INTO mailboxes (org_id, user_id, provider_email)
VALUES ('22222222-2222-2222-2222-222222222222', '...', 'test@example.com');
-- Expected: ERROR: new row violates row-level security policy
```

### Step 5: Edge Function Configuration (Optional)

**Use case:** Background Gmail sync without blocking API routes

1. Navigate to: **Edge Functions** in Supabase dashboard
2. Create function: `gmail-sync-worker`

```bash
# Deploy edge function
supabase functions deploy gmail-sync-worker \
  --project-ref YOUR_PROJECT_REF
```

**Environment variables for Edge Function:**

```bash
supabase secrets set GOOGLE_CLIENT_ID=xxxxx
supabase secrets set GOOGLE_CLIENT_SECRET=xxxxx
supabase secrets set TOKEN_ENCRYPTION_KEY=xxxxx
```

### Step 6: Database Connection Pooling

For high-traffic production environments:

1. Navigate to: **Project Settings → Database**
2. Note connection strings:
   - **Direct connection:** For migrations (port 5432)
   - **Connection pooling:** For application (port 6543)

**Use connection pooler in production:**

```bash
# Production database URL (pooler mode: transaction)
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

---

## 4. Local Development Setup

### Prerequisites

```bash
# Required tools
- Node.js >= 18.x
- npm >= 9.x
- Git
- PostgreSQL client (psql)

# Optional
- Docker Desktop (for local Supabase)
- Supabase CLI
```

### Step 1: Clone Repository

```bash
# Clone REIL/Q repository
git clone [REPO_URL] d:/SkySlope/REIL-Q
cd d:/SkySlope/REIL-Q

# Checkout Sprint 0.2 branch
git checkout sprint-0.2-gmail
```

### Step 2: Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Verify installation
npm list --depth=0
```

### Step 3: Create .env.local File

```bash
# Copy template
cp .env.example .env.local

# Edit with your values
# NOTE: Use your local environment-specific values
```

**.env.local template (development):**

```bash
# ============================================================
# LOCAL DEVELOPMENT ENVIRONMENT
# ============================================================

# Supabase (use your dev project)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# Google OAuth (use localhost redirect)
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google

# Encryption (generate unique key for dev)
TOKEN_ENCRYPTION_KEY=[run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]

# NextAuth (not required for development, but recommended)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=[run: openssl rand -base64 32]

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Development-specific
LOG_LEVEL=debug
GMAIL_BACKFILL_DAYS=7
```

### Step 4: Validate Environment

Create validation script: `d:/SkySlope/REIL-Q/scripts/verify_env.js`

```javascript
#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const REQUIRED_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'TOKEN_ENCRYPTION_KEY',
  'NEXT_PUBLIC_APP_URL',
];

const OPTIONAL_VARS = [
  'NEXTAUTH_SECRET',
  'GMAIL_BACKFILL_DAYS',
  'LOG_LEVEL',
];

console.log('🔍 REIL/Q Environment Validation\n');

let hasErrors = false;
let hasWarnings = false;

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ CRITICAL: .env.local file not found');
  console.error('   Create it from .env.example template\n');
  process.exit(1);
}

// Load environment variables
require('dotenv').config({ path: envPath });

// Validate required variables
console.log('📋 Required Variables:\n');
REQUIRED_VARS.forEach((varName) => {
  const value = process.env[varName];

  if (!value) {
    console.error(`❌ ${varName}: MISSING`);
    hasErrors = true;
    return;
  }

  // Specific validations
  if (varName === 'NEXT_PUBLIC_SUPABASE_URL' && !value.startsWith('https://')) {
    console.error(`❌ ${varName}: Must start with https://`);
    hasErrors = true;
    return;
  }

  if (varName === 'GOOGLE_CLIENT_ID' && !value.endsWith('.apps.googleusercontent.com')) {
    console.error(`❌ ${varName}: Invalid format (should end with .apps.googleusercontent.com)`);
    hasErrors = true;
    return;
  }

  if (varName === 'GOOGLE_CLIENT_SECRET' && !value.startsWith('GOCSPX-')) {
    console.error(`❌ ${varName}: Invalid format (should start with GOCSPX-)`);
    hasErrors = true;
    return;
  }

  if (varName === 'TOKEN_ENCRYPTION_KEY' && value.length < 32) {
    console.error(`❌ ${varName}: Too short (minimum 32 characters)`);
    hasErrors = true;
    return;
  }

  console.log(`✅ ${varName}: OK`);
});

// Check optional variables
console.log('\n📋 Optional Variables:\n');
OPTIONAL_VARS.forEach((varName) => {
  const value = process.env[varName];

  if (!value) {
    console.warn(`⚠️  ${varName}: Not set (using defaults)`);
    hasWarnings = true;
  } else {
    console.log(`✅ ${varName}: ${value}`);
  }
});

// Production-specific checks
if (process.env.NODE_ENV === 'production') {
  console.log('\n🚀 Production Mode Checks:\n');

  if (!process.env.NEXTAUTH_SECRET) {
    console.error('❌ NEXTAUTH_SECRET: Required in production');
    hasErrors = true;
  }

  if (process.env.NEXT_PUBLIC_APP_URL === 'http://localhost:3000') {
    console.error('❌ NEXT_PUBLIC_APP_URL: Cannot be localhost in production');
    hasErrors = true;
  }
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.error('\n❌ VALIDATION FAILED');
  console.error('   Fix errors above before proceeding\n');
  process.exit(1);
} else if (hasWarnings) {
  console.log('\n⚠️  VALIDATION PASSED WITH WARNINGS');
  console.log('   Review warnings above\n');
  process.exit(0);
} else {
  console.log('\n✅ VALIDATION PASSED');
  console.log('   All required environment variables are configured\n');
  process.exit(0);
}
```

**Run validation:**

```bash
node d:/SkySlope/REIL-Q/scripts/verify_env.js
```

### Step 5: Initialize Database Schema

```bash
# Run migrations
npm run db:migrate

# Seed development data (optional)
npm run db:seed
```

### Step 6: Start Development Server

```bash
# Start Next.js dev server
npm run dev

# Server should start at http://localhost:3000
```

**Verify development environment:**

1. Navigate to: `http://localhost:3000`
2. Check: Supabase connection (should see login page)
3. Test: Gmail OAuth flow (click "Connect Gmail")
4. Verify: OAuth redirect completes successfully

### Optional: Local Supabase with Docker

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  postgres:
    image: supabase/postgres:15.1.0.117
    environment:
      POSTGRES_PASSWORD: your-super-secret-password
      POSTGRES_DB: postgres
    ports:
      - "54322:5432"
    volumes:
      - ./database/migrations:/docker-entrypoint-initdb.d

  studio:
    image: supabase/studio:20230803-64d9bb0
    environment:
      SUPABASE_URL: http://localhost:54321
      STUDIO_PG_META_URL: http://localhost:54321
    ports:
      - "54323:3000"

  kong:
    image: kong:2.8.1
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: /var/lib/kong/kong.yml
    ports:
      - "54321:8000"
    volumes:
      - ./supabase/kong.yml:/var/lib/kong/kong.yml
```

**Start local Supabase:**

```bash
docker-compose up -d

# Update .env.local to use local instance
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
SUPABASE_DB_URL=postgresql://postgres:your-super-secret-password@localhost:54322/postgres
```

---

## 5. Secrets Management

### GitHub Secrets (for CI/CD)

**Repository Settings → Secrets and variables → Actions**

**Required Secrets:**

| Secret Name | Description | Used By |
|-------------|-------------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for migrations | CI migrations job |
| `SUPABASE_DB_URL` | Database connection string | CI test job |
| `GOOGLE_CLIENT_ID` | OAuth client ID | E2E tests |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret | E2E tests |
| `TOKEN_ENCRYPTION_KEY` | Token encryption key | All environments |
| `VERCEL_TOKEN` | Vercel deployment token | Deployment workflow |

**Add secrets via GitHub CLI:**

```bash
# Set secrets for repository
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
gh secret set GOOGLE_CLIENT_SECRET --body "GOCSPX-xxxxx"
gh secret set TOKEN_ENCRYPTION_KEY --body "$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
```

### Vercel Environment Variables

**Vercel Dashboard → Project → Settings → Environment Variables**

**Required for All Environments:**

| Variable | Development | Preview | Production | Notes |
|----------|-------------|---------|------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Dev project | Staging project | Prod project | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dev key | Staging key | Prod key | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Dev key | Staging key | Prod key | Secret |
| `GOOGLE_CLIENT_ID` | Dev client | Staging client | Prod client | Can be same |
| `GOOGLE_CLIENT_SECRET` | Dev secret | Staging secret | Prod secret | Secret |
| `TOKEN_ENCRYPTION_KEY` | Unique key | Unique key | Unique key | Secret |
| `NEXTAUTH_SECRET` | Dev secret | Staging secret | Prod secret | Secret |
| `NEXT_PUBLIC_APP_URL` | Dev URL | Preview URL | Prod URL | Public |

**Set via Vercel CLI:**

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Set environment variable for production
vercel env add GOOGLE_CLIENT_SECRET production
# Paste value when prompted

# Set for all environments
vercel env add TOKEN_ENCRYPTION_KEY
# Select: Production, Preview, Development
```

**Set via Vercel Dashboard:**

1. Navigate to: **Vercel Dashboard → REIL-Q → Settings → Environment Variables**
2. Click "Add New"
3. Configure:
   - **Key:** `GOOGLE_CLIENT_SECRET`
   - **Value:** `GOCSPX-xxxxx`
   - **Environments:** Select Production, Preview, Development
   - **Sensitive:** Check this box
4. Click "Save"

### Production vs Staging Separation

**Environment Isolation Strategy:**

```
Development (local)
├── Supabase: reil-q-dev project
├── Google OAuth: Internal test app
├── Domain: localhost:3000
└── Purpose: Local feature development

Preview (PR branches)
├── Supabase: reil-q-staging project
├── Google OAuth: Test credentials
├── Domain: reil-q-*.vercel.app (ephemeral)
└── Purpose: PR review and QA

Staging (main branch)
├── Supabase: reil-q-staging project
├── Google OAuth: Staging credentials
├── Domain: reil-q-staging.vercel.app
└── Purpose: Pre-production testing

Production (release tag)
├── Supabase: reil-q-production project
├── Google OAuth: Production credentials
├── Domain: reil-q.vercel.app
└── Purpose: Live customer environment
```

**OAuth Redirect URI Configuration:**

Ensure each environment has proper redirect URIs configured in Google Cloud Console:

```
Development: http://localhost:3000/api/auth/callback/google
Preview: https://reil-q-*.vercel.app/api/auth/callback/google (wildcard not supported - add specific URLs)
Staging: https://reil-q-staging.vercel.app/api/auth/callback/google
Production: https://reil-q.vercel.app/api/auth/callback/google
```

---

## 6. Deployment Environments

### Environment Overview

| Environment | Branch | Domain | Supabase Project | Deploy Trigger |
|-------------|--------|--------|------------------|----------------|
| Development | `*` | localhost:3000 | reil-q-dev | Manual (npm run dev) |
| Preview | PR branches | `reil-q-git-*.vercel.app` | reil-q-staging | Auto on PR push |
| Staging | `main` | reil-q-staging.vercel.app | reil-q-staging | Auto on merge to main |
| Production | `release/*` | reil-q.vercel.app | reil-q-production | Manual approval |

### Development Environment

**Purpose:** Local feature development and debugging

**Setup:**
```bash
# Install dependencies
npm install

# Create .env.local (see section 4)
cp .env.example .env.local

# Run migrations
npm run db:migrate

# Start dev server
npm run dev
```

**Database:** Local Supabase (Docker) or remote dev project

**Access:** http://localhost:3000

### Preview Environment (PR Deployments)

**Purpose:** Automated deployments for every pull request

**Configuration:** `vercel.json`

```json
{
  "github": {
    "autoJobCancelation": true,
    "silent": false
  },
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

**Deployment Flow:**
1. Developer opens PR → Vercel auto-deploys to preview URL
2. Preview URL: `https://reil-q-git-[branch-name]-[team].vercel.app`
3. Environment: Uses staging Supabase project
4. Testing: QA team reviews on preview URL
5. Merge: Preview deployment destroyed

**Environment Variables:** Inherit from "Preview" scope in Vercel

### Staging Environment

**Purpose:** Pre-production integration testing

**Configuration:**
- **Branch:** `main`
- **Domain:** `reil-q-staging.vercel.app`
- **Database:** Supabase staging project
- **Deploy:** Auto-deploy on merge to `main`

**Deployment Flow:**
```bash
# Feature merged to main
git checkout main
git pull origin main

# Vercel auto-deploys within 1-2 minutes
# Monitor: https://vercel.com/[team]/reil-q/deployments
```

**Post-Deployment Checks:**
1. Health check: `curl https://reil-q-staging.vercel.app/api/health`
2. OAuth flow: Test Gmail connection
3. Smoke tests: Run critical user flows
4. Logs: Check Vercel logs for errors

### Production Environment

**Purpose:** Live customer-facing environment

**Configuration:**
- **Branch:** `release/*`
- **Domain:** `reil-q.vercel.app`
- **Database:** Supabase production project
- **Deploy:** Manual approval required

**Deployment Workflow:**

```bash
# Step 1: Create release branch from main
git checkout main
git pull origin main
git checkout -b release/v0.2.0

# Step 2: Tag release
git tag -a v0.2.0 -m "Sprint 0.2 - Gmail Integration"
git push origin release/v0.2.0 --tags

# Step 3: Deploy via Vercel CLI (with approval)
vercel --prod

# Step 4: Monitor deployment
vercel logs --follow

# Step 5: Verify production
curl https://reil-q.vercel.app/api/health
```

**Pre-Production Checklist:**

- [ ] All tests passing in CI
- [ ] Staging environment validated
- [ ] Database migrations tested
- [ ] Environment variables verified
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured
- [ ] Stakeholder approval received

**Post-Deployment Verification:**

```bash
# Health check
curl https://reil-q.vercel.app/api/health
# Expected: {"status": "ok", "version": "0.2.0"}

# Database connectivity
curl https://reil-q.vercel.app/api/db/health
# Expected: {"db": "connected", "latency_ms": 45}

# OAuth configuration
curl https://reil-q.vercel.app/api/auth/providers
# Expected: {"providers": ["google"]}
```

**Rollback Procedure:**

```bash
# Option 1: Instant rollback via Vercel dashboard
# Navigate to: Deployments → Find previous stable deployment → "Promote to Production"

# Option 2: Rollback via CLI
vercel rollback https://reil-q-[previous-deployment-id].vercel.app --prod

# Option 3: Revert and redeploy
git revert [commit-hash]
git push origin release/v0.2.0
vercel --prod
```

---

## 7. Infrastructure Checklist

### Pre-Sprint Setup (Complete before Day 1)

**Google Cloud Platform:**
- [ ] Google Cloud project created (`reil-q-gmail-xxxxx`)
- [ ] Gmail API enabled
- [ ] OAuth consent screen configured (app name, scopes, privacy policy)
- [ ] OAuth 2.0 client credentials created
- [ ] Authorized redirect URIs added for all environments
- [ ] Test users added (for external apps in testing)
- [ ] API quotas reviewed and monitoring enabled
- [ ] Client ID and Secret stored in password manager

**Supabase:**
- [ ] Development project created (`reil-q-dev`)
- [ ] Staging project created (`reil-q-staging`)
- [ ] Production project created (`reil-q-production`)
- [ ] Storage bucket created (`mail-attachments`) in each project
- [ ] Storage RLS policies configured
- [ ] Database migrations executed in dev/staging
- [ ] Database indexes created for performance
- [ ] RLS policies tested and verified
- [ ] Connection pooling enabled for production
- [ ] Database backup schedule configured

**Environment Variables:**
- [ ] `.env.local` created for local development
- [ ] `TOKEN_ENCRYPTION_KEY` generated for each environment (dev/staging/prod)
- [ ] `NEXTAUTH_SECRET` generated for each environment
- [ ] All Supabase URLs and keys documented
- [ ] Google OAuth credentials configured per environment
- [ ] Environment validation script executed (`verify_env.js`)
- [ ] No placeholders remain in any environment file

**GitHub:**
- [ ] Repository created or sprint branch created
- [ ] GitHub Secrets configured for CI/CD
- [ ] Branch protection rules enabled for `main`
- [ ] PR template created
- [ ] CI workflow configured (`.github/workflows/ci.yml`)
- [ ] Deployment workflow configured (`.github/workflows/deploy.yml`)

**Vercel:**
- [ ] Project created and linked to repository
- [ ] Environment variables set for Development scope
- [ ] Environment variables set for Preview scope
- [ ] Environment variables set for Production scope
- [ ] Custom domain configured (if applicable)
- [ ] Deployment notifications enabled (Slack/Discord)
- [ ] Production deployment protection enabled (requires approval)

**Local Development:**
- [ ] Dependencies installed (`npm install`)
- [ ] Database migrations run locally
- [ ] Dev server starts without errors (`npm run dev`)
- [ ] OAuth flow tested end-to-end locally
- [ ] Test Gmail account connected successfully

### Mid-Sprint Verification (Day 2)

- [ ] First Gmail sync completed successfully
- [ ] Messages stored in database with correct org isolation
- [ ] Attachments uploaded to Supabase storage
- [ ] RLS policies enforced (verified via test)
- [ ] Ledger events recorded for all operations
- [ ] No duplicate messages created (idempotency verified)
- [ ] OAuth token refresh working
- [ ] Staging deployment successful
- [ ] Preview deployments working for PRs

### Pre-Production Checklist (Day 3 - before production deploy)

- [ ] All P0 tickets completed and merged
- [ ] Integration tests passing in CI
- [ ] Staging environment fully tested
- [ ] Performance benchmarks met (sync speed, API latency)
- [ ] Security review completed
- [ ] Database migrations validated in staging
- [ ] Production environment variables verified (no placeholders)
- [ ] Rollback procedure documented and tested in staging
- [ ] Monitoring and alerts configured
- [ ] Incident response plan documented

---

## 8. Runbook for Common Tasks

### Task 1: Rotate Token Encryption Key

**When to do this:**
- Security audit requires key rotation
- Key potentially compromised
- Regular security maintenance (recommended: quarterly)

**WARNING:** This is a breaking operation. All encrypted tokens will become unreadable.

**Procedure:**

```bash
# Step 1: Generate new encryption key
NEW_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "New key: $NEW_KEY"
# Store securely in password manager

# Step 2: Update environment variables
# - Vercel: Update TOKEN_ENCRYPTION_KEY in all environments
# - GitHub: Update TOKEN_ENCRYPTION_KEY secret
# - Local: Update .env.local

# Step 3: Deploy with new key
vercel env add TOKEN_ENCRYPTION_KEY production
# Paste new key when prompted
vercel --prod

# Step 4: Force re-authentication for all users
# Execute SQL to invalidate all tokens:
psql "$SUPABASE_DB_URL" << EOF
UPDATE mailboxes
SET
  access_token_encrypted = NULL,
  refresh_token_encrypted = NULL,
  status = 'disconnected',
  updated_at = now()
WHERE status = 'connected';
EOF

# Step 5: Notify users
# - Send email: "Please reconnect your Gmail account"
# - In-app notification: "Action required: Reconnect Gmail"

# Step 6: Verify new encryptions work
# - Test OAuth flow
# - Verify new tokens are encrypted with new key
# - Confirm sync works with re-authenticated users
```

### Task 2: Refresh OAuth Credentials

**When to do this:**
- OAuth client secret compromised
- Switching OAuth apps (dev → prod)
- Updating OAuth scopes

**Procedure:**

```bash
# Step 1: Create new OAuth credentials in Google Cloud Console
# (Follow Section 2, Step 4)

# Step 2: Update environment variables
# Development
vercel env add GOOGLE_CLIENT_ID development
vercel env add GOOGLE_CLIENT_SECRET development

# Preview
vercel env add GOOGLE_CLIENT_ID preview
vercel env add GOOGLE_CLIENT_SECRET preview

# Production
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production

# Step 3: Update authorized redirect URIs
# - Add new credentials' redirect URIs
# - Keep old credentials active during transition (7-day overlap)

# Step 4: Deploy to staging first
git checkout main
vercel --env=staging

# Step 5: Test OAuth flow in staging
# - Connect test Gmail account
# - Verify tokens stored correctly
# - Test sync functionality

# Step 6: Deploy to production
vercel --prod

# Step 7: Revoke old credentials (after 7 days)
# - Navigate to Google Cloud Console → Credentials
# - Delete old OAuth client
```

### Task 3: Clear Sync Cursor for Re-sync

**When to do this:**
- User reports missing emails
- Sync got stuck or corrupted
- Need to backfill additional history
- Testing sync logic

**Procedure:**

```bash
# Step 1: Identify affected mailbox
psql "$SUPABASE_DB_URL" << EOF
SELECT
  id,
  provider_email,
  status,
  last_history_id,
  last_synced_at
FROM mailboxes
WHERE provider_email = 'user@example.com';
EOF

# Step 2: Clear sync cursor (forces full re-sync)
psql "$SUPABASE_DB_URL" << EOF
UPDATE mailboxes
SET
  last_history_id = NULL,
  last_synced_at = NULL,
  status = 'connected',
  updated_at = now()
WHERE id = '[mailbox-id]';
EOF

# Step 3: Optionally delete existing data (for clean re-sync)
# WARNING: This deletes all messages/threads for this mailbox
psql "$SUPABASE_DB_URL" << EOF
BEGIN;

DELETE FROM mail_attachments WHERE mailbox_id = '[mailbox-id]';
DELETE FROM mail_messages WHERE mailbox_id = '[mailbox-id]';
DELETE FROM mail_threads WHERE mailbox_id = '[mailbox-id]';

COMMIT;
EOF

# Step 4: Trigger re-sync
# - Via API: POST /api/mailbox/[id]/sync
# - Via UI: Click "Re-sync" button in mailbox settings

# Step 5: Monitor sync progress
psql "$SUPABASE_DB_URL" << EOF
SELECT
  provider_email,
  status,
  last_synced_at,
  (SELECT COUNT(*) FROM mail_threads WHERE mailbox_id = mailboxes.id) as thread_count,
  (SELECT COUNT(*) FROM mail_messages WHERE mailbox_id = mailboxes.id) as message_count
FROM mailboxes
WHERE id = '[mailbox-id]';
EOF
```

### Task 4: Database Migration Deployment

**When to do this:**
- Schema changes required
- Adding new tables/columns
- Updating indexes or constraints

**Procedure:**

```bash
# Step 1: Create migration file
# File: database/migrations/004_add_mail_labels.sql
cat > database/migrations/004_add_mail_labels.sql << 'EOF'
-- Migration: Add mail_labels table
-- Created: 2025-12-31
-- Author: infra-deployment-specialist

BEGIN;

CREATE TABLE IF NOT EXISTS mail_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id),
  mailbox_id UUID NOT NULL REFERENCES mailboxes(id) ON DELETE CASCADE,
  provider_label_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('system', 'user')),
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(mailbox_id, provider_label_id)
);

-- Enable RLS
ALTER TABLE mail_labels ENABLE ROW LEVEL SECURITY;

-- RLS policy
CREATE POLICY "org_isolation_policy" ON mail_labels
FOR ALL TO authenticated
USING (org_id = (auth.jwt() ->> 'org_id')::uuid)
WITH CHECK (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- Indexes
CREATE INDEX idx_mail_labels_mailbox ON mail_labels(mailbox_id);
CREATE INDEX idx_mail_labels_org ON mail_labels(org_id);

COMMIT;
EOF

# Step 2: Test migration in development
psql "$SUPABASE_DB_URL_DEV" -f database/migrations/004_add_mail_labels.sql

# Verify schema
psql "$SUPABASE_DB_URL_DEV" -c "\d mail_labels"

# Step 3: Test rollback (create rollback script)
cat > database/migrations/004_add_mail_labels_rollback.sql << 'EOF'
BEGIN;
DROP TABLE IF EXISTS mail_labels CASCADE;
COMMIT;
EOF

# Step 4: Deploy to staging
psql "$SUPABASE_DB_URL_STAGING" -f database/migrations/004_add_mail_labels.sql

# Step 5: Verify staging application works
curl https://reil-q-staging.vercel.app/api/health

# Step 6: Deploy to production (maintenance window recommended)
echo "Starting production migration at $(date)"

psql "$SUPABASE_DB_URL_PROD" -f database/migrations/004_add_mail_labels.sql

# Step 7: Verify production
psql "$SUPABASE_DB_URL_PROD" -c "SELECT COUNT(*) FROM mail_labels;"

# Step 8: Update migration tracking
psql "$SUPABASE_DB_URL_PROD" << EOF
INSERT INTO schema_migrations (version, name, executed_at)
VALUES ('004', 'add_mail_labels', now());
EOF

echo "Migration completed at $(date)"
```

### Task 5: Monitor Gmail API Quota Usage

**When to do this:**
- Daily monitoring (automated)
- After major sync operations
- When approaching quota limits
- Investigating rate limit errors

**Procedure:**

```bash
# Step 1: Check current quota usage in Google Cloud Console
# Navigate to: APIs & Services → Gmail API → Quotas & System Limits

# Step 2: Query application logs for rate limit errors
# Vercel logs
vercel logs --filter="429" --since=24h

# Step 3: Analyze sync patterns
psql "$SUPABASE_DB_URL" << EOF
SELECT
  DATE_TRUNC('hour', last_synced_at) as sync_hour,
  COUNT(*) as mailbox_syncs,
  SUM((SELECT COUNT(*) FROM mail_messages WHERE mailbox_id = mailboxes.id)) as total_messages
FROM mailboxes
WHERE last_synced_at > NOW() - INTERVAL '24 hours'
GROUP BY sync_hour
ORDER BY sync_hour DESC;
EOF

# Step 4: Implement rate limiting if needed
# Update sync configuration:
# - Reduce sync frequency (GMAIL_SYNC_INTERVAL)
# - Batch requests more aggressively
# - Add exponential backoff

# Step 5: Request quota increase (if necessary)
# - Navigate to Google Cloud Console → Quotas
# - Click quota → "Edit quotas"
# - Provide justification and request increase
```

### Task 6: Investigate Missing Emails

**When to do this:**
- User reports emails not syncing
- Sync completed but message count seems low
- Specific thread/message missing

**Procedure:**

```bash
# Step 1: Verify mailbox status
psql "$SUPABASE_DB_URL" << EOF
SELECT
  id,
  provider_email,
  status,
  last_history_id,
  last_synced_at,
  oauth_scopes,
  token_expires_at
FROM mailboxes
WHERE provider_email = 'user@example.com';
EOF

# Step 2: Check if OAuth token is valid
# - Verify token_expires_at is in the future
# - If expired, check if refresh token exists

# Step 3: Verify Gmail API scopes
# Expected: ['https://www.googleapis.com/auth/gmail.readonly', 'openid', 'email']

# Step 4: Check sync logs in ledger
psql "$SUPABASE_DB_URL" << EOF
SELECT
  event_type,
  payload,
  created_at
FROM ledger_events
WHERE (payload->>'mailbox_id') = '[mailbox-id]'
  AND event_type IN ('SYNC_STARTED', 'SYNC_COMPLETED', 'SYNC_FAILED')
ORDER BY created_at DESC
LIMIT 20;
EOF

# Step 5: Compare message count with Gmail
# - User can check Gmail: Settings → Forwarding and POP/IMAP
# - Query local count:
psql "$SUPABASE_DB_URL" << EOF
SELECT COUNT(*) as local_message_count
FROM mail_messages
WHERE mailbox_id = '[mailbox-id]';
EOF

# Step 6: Check for specific message (if user provides Gmail message ID)
psql "$SUPABASE_DB_URL" << EOF
SELECT id, provider_message_id, subject, sent_at
FROM mail_messages
WHERE mailbox_id = '[mailbox-id]'
  AND provider_message_id = '[gmail-message-id]';
EOF

# Step 7: If not found, trigger manual sync for that thread
# - Get thread ID from Gmail
# - Call sync endpoint: POST /api/mailbox/[id]/sync?thread=[thread-id]

# Step 8: Check for sync errors in application logs
vercel logs --filter="mailbox_id=[mailbox-id]" --since=48h
```

### Task 7: Emergency Rollback

**When to do this:**
- Critical bug detected in production
- Data corruption observed
- System unavailable
- Security incident

**Procedure:**

```bash
# Step 1: IMMEDIATE - Rollback via Vercel dashboard
# Navigate to: Vercel Dashboard → REIL-Q → Deployments
# Find last known good deployment
# Click three dots → "Promote to Production"
# Estimated time: 30 seconds

# Step 2: Verify rollback successful
curl https://reil-q.vercel.app/api/health
# Check response includes previous version number

# Step 3: If database migration was part of issue, rollback schema
# Execute rollback SQL script
psql "$SUPABASE_DB_URL_PROD" -f database/migrations/[version]_rollback.sql

# Step 4: Notify stakeholders
# - Post in #incidents Slack channel
# - Update status page
# - Email affected users (if applicable)

# Step 5: Disable auto-deployments temporarily
# Vercel Dashboard → Settings → Git → Disable "Auto-deploy"

# Step 6: Investigate root cause
# - Review deployment logs
# - Check error monitoring (Sentry)
# - Analyze database state

# Step 7: Create hotfix branch
git checkout -b hotfix/[issue-description]

# Step 8: After fix is ready, deploy to staging first
git push origin hotfix/[issue-description]
vercel --env=staging

# Step 9: Validate fix in staging
# - Run smoke tests
# - Verify issue is resolved
# - No new issues introduced

# Step 10: Deploy hotfix to production
vercel --prod

# Step 11: Re-enable auto-deployments
# Vercel Dashboard → Settings → Git → Enable "Auto-deploy"

# Step 12: Post-mortem documentation
# Create incident report documenting:
# - Timeline of events
# - Root cause analysis
# - Resolution steps
# - Preventive measures
```

---

## Appendix A: Quick Reference Commands

### Environment Validation

```bash
# Validate environment variables
node d:/SkySlope/REIL-Q/scripts/verify_env.js

# Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate NextAuth secret
openssl rand -base64 32
```

### Database Operations

```bash
# Connect to database
psql "$SUPABASE_DB_URL"

# Run migration
psql "$SUPABASE_DB_URL" -f database/migrations/[file].sql

# Backup database
pg_dump "$SUPABASE_DB_URL" > backup_$(date +%Y%m%d).sql

# Restore database
psql "$SUPABASE_DB_URL" < backup_20251231.sql
```

### Vercel Deployments

```bash
# Deploy to production
vercel --prod

# Deploy to staging
vercel --env=staging

# View logs
vercel logs --follow

# Rollback
vercel rollback [deployment-url] --prod

# List deployments
vercel ls
```

### GitHub Secrets

```bash
# Set secret
gh secret set SECRET_NAME --body "secret-value"

# List secrets
gh secret list

# Delete secret
gh secret delete SECRET_NAME
```

---

## Appendix B: Troubleshooting Guide

### Issue: OAuth redirect fails with "redirect_uri_mismatch"

**Symptom:** User clicks "Connect Gmail" → Error: "Error 400: redirect_uri_mismatch"

**Cause:** Redirect URI not authorized in Google Cloud Console

**Resolution:**
1. Check `GOOGLE_REDIRECT_URI` in environment variables
2. Navigate to: Google Cloud Console → Credentials → OAuth 2.0 Client
3. Verify "Authorized redirect URIs" includes exact URL
4. Add missing URI (ensure exact match, including protocol and port)
5. Wait 5 minutes for Google's cache to update
6. Retry OAuth flow

### Issue: "Token encryption failed" error in logs

**Symptom:** Application logs show "TokenEncryptionError: encryption failed"

**Cause:** `TOKEN_ENCRYPTION_KEY` missing or invalid

**Resolution:**
1. Verify `TOKEN_ENCRYPTION_KEY` is set: `vercel env ls`
2. Ensure key is 32+ characters
3. Check key is hex format (0-9, a-f only)
4. Regenerate if necessary (requires user re-authentication)

### Issue: Gmail API rate limit (429 errors)

**Symptom:** Logs show "Error 429: Rate limit exceeded"

**Cause:** Exceeded Gmail API quota (250 units/second/user)

**Resolution:**
1. Implement exponential backoff in sync service
2. Reduce sync frequency temporarily
3. Use batch requests where possible
4. Request quota increase in Google Cloud Console

### Issue: Emails not syncing after initial connection

**Symptom:** Initial sync worked, but no new emails appearing

**Cause:** `historyId` cursor not updating, or OAuth token expired

**Resolution:**
1. Check mailbox status: `SELECT * FROM mailboxes WHERE id = '[id]'`
2. Verify `last_history_id` is updating
3. Check token expiry: `token_expires_at > now()`
4. Trigger manual re-sync (see Runbook Task 3)
5. Check background job logs for errors

### Issue: RLS policy blocking legitimate queries

**Symptom:** User sees "insufficient permissions" or empty results

**Cause:** Row-level security policy misconfigured or JWT claim missing

**Resolution:**
1. Verify user's `org_id` in JWT: Check auth token payload
2. Test RLS policy in Supabase SQL editor:
   ```sql
   SET request.jwt.claims = '{"org_id": "[user-org-id]"}';
   SELECT * FROM mailboxes; -- Should return user's org data
   ```
3. Check RLS policy logic for typos
4. Verify service role key is used for background jobs (bypasses RLS)

---

## Appendix C: Security Considerations

### Data Classification

| Data Type | Classification | Storage | Encryption | Access |
|-----------|---------------|---------|------------|--------|
| Email body content | Sensitive | Supabase (encrypted at rest) | TLS in transit | Org-isolated via RLS |
| OAuth tokens | Critical | Supabase (encrypted column) | AES-256 + TLS | Service role only |
| Attachments | Sensitive | Supabase Storage | Encrypted at rest | Org-isolated via RLS |
| User email addresses | PII | Supabase (encrypted at rest) | TLS in transit | Org-isolated via RLS |
| Gmail metadata | Low | Supabase | TLS in transit | Org-isolated via RLS |

### Security Best Practices

1. **Never log email content or tokens**
   - Use redacted logging: `logger.info('Email synced', { messageId: 'xxx', subject: '[REDACTED]' })`

2. **Rotate credentials regularly**
   - `TOKEN_ENCRYPTION_KEY`: Every 90 days
   - `NEXTAUTH_SECRET`: Every 180 days
   - OAuth credentials: On security audit or breach

3. **Principle of least privilege**
   - Use anon key for client-side operations
   - Use service role only for server-side admin tasks
   - Scope OAuth to readonly unless write required

4. **Audit trail**
   - All email access logged in ledger
   - All admin actions logged
   - Retention: 90 days minimum

5. **Incident response**
   - Document security contacts
   - Maintain rollback procedures
   - Practice incident drills quarterly

---

## Appendix D: Performance Benchmarks

### Expected Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial sync (100 emails) | < 30 seconds | Time from sync start to completion |
| Incremental sync (10 new emails) | < 5 seconds | Using historyId cursor |
| OAuth connection flow | < 3 seconds | User click to token stored |
| Email detail view load | < 500ms | API response time |
| Attachment download | < 2 seconds | For 5MB file |
| Database query latency | < 100ms | P95 response time |

### Monitoring Queries

```sql
-- Check sync performance
SELECT
  provider_email,
  last_synced_at,
  EXTRACT(EPOCH FROM (last_synced_at - created_at)) as sync_duration_seconds,
  (SELECT COUNT(*) FROM mail_messages WHERE mailbox_id = mailboxes.id) as total_messages
FROM mailboxes
ORDER BY last_synced_at DESC
LIMIT 20;

-- Identify slow queries (requires pg_stat_statements extension)
SELECT
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE query LIKE '%mail_%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## Document Status

- **Status:** COMPLETE
- **Reviewed by:** infra-deployment-specialist
- **Last Updated:** 2025-12-31
- **Next Review:** After Sprint 0.2 completion

---

**END OF INFRASTRUCTURE SETUP GUIDE**
