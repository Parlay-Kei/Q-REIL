# REIL/Q Security Baseline

**Version:** 1.0.0
**Last Updated:** 2025-12-31
**Owner:** Lane 6 - QA + Security
**Status:** Active

## Document Purpose

This document establishes the minimum security requirements for the REIL/Q platform. All code, configurations, and deployments MUST comply with these standards. Non-compliance blocks production deployment.

## Threat Model Context

**Platform Classification:** High-risk SaaS application
**Data Sensitivity:** PII, financial data, legal documents, transaction records
**Compliance Requirements:** GDPR, CCPA, SOX (financial record retention), Real Estate Board regulations
**Attack Surface:** Web UI, REST API, email ingestion, third-party connectors

**Primary Threats:**
1. Unauthorized access to transaction data (data breach)
2. PII exposure through logging or error messages
3. Privilege escalation between organizations
4. API abuse and rate limit bypass
5. Supply chain attacks via dependencies
6. Session hijacking and credential theft
7. SQL/NoSQL injection via user inputs
8. Cross-site scripting (XSS) attacks
9. Man-in-the-middle attacks on data in transit
10. Insider threats via insufficient audit logging

---

## 1. Authentication & Authorization

### 1.1 Authentication Method

**Primary:** Supabase Auth with JWT tokens
**Standard:** OAuth 2.0 / OpenID Connect

**Requirements:**

```typescript
// JWT Token Structure
interface JWTPayload {
  sub: string;           // User ID (UUID)
  email: string;         // User email
  org_id: string;        // Current organization ID
  role: string;          // User role in current org
  aud: string;           // Audience (authenticated)
  exp: number;           // Expiration timestamp
  iat: number;           // Issued at timestamp
  iss: string;           // Issuer (Supabase project URL)
}

// Token Validation Requirements
const TOKEN_VALIDATION = {
  algorithm: 'HS256',                    // JWT signing algorithm
  issuerValidation: true,                // Verify iss claim
  audienceValidation: true,              // Verify aud claim
  expirationValidation: true,            // Reject expired tokens
  clockTolerance: 60,                    // 60 seconds for clock skew
  requireSub: true,                      // sub claim is mandatory
  requireOrgId: true,                    // org_id claim is mandatory
};
```

**Implementation Rules:**

- All API endpoints MUST validate JWT signature and expiration
- Tokens MUST be transmitted only via `Authorization: Bearer` header (NEVER in URL parameters)
- Token lifetime: 1 hour (access token), 30 days (refresh token)
- After token expiration, client MUST use refresh token to obtain new access token
- Refresh tokens MUST be stored in httpOnly, secure cookies (NOT localStorage)

### 1.2 Session Management

**Requirements:**

```typescript
const SESSION_CONFIG = {
  // Session Duration
  accessTokenTTL: 3600,           // 1 hour (seconds)
  refreshTokenTTL: 2592000,       // 30 days (seconds)
  inactivityTimeout: 1800,        // 30 minutes (seconds)

  // Session Storage
  storageType: 'httpOnly-cookie', // For refresh tokens
  sameSite: 'lax',                // CSRF protection
  secure: true,                   // HTTPS only

  // Session Validation
  validateOnEachRequest: true,    // Check expiration and signature
  revokeOnPasswordChange: true,   // Invalidate all sessions
  revokeOnRoleChange: true,       // Invalidate all sessions

  // Concurrent Sessions
  maxConcurrentSessions: 5,       // Per user
  notifyOnNewSession: true,       // Email notification
};
```

**Session Termination Events:**

- User-initiated logout
- Password change
- Role/permission change
- Account suspension/deletion
- 30 days of inactivity
- Security event detection (unusual location, multiple failed attempts)

**Anti-Pattern (FORBIDDEN):**

```typescript
// NEVER store tokens in localStorage (vulnerable to XSS)
localStorage.setItem('token', jwt);

// NEVER pass tokens in URL parameters (logged in server logs)
fetch(`/api/data?token=${jwt}`);

// NEVER skip token validation for "internal" requests
if (request.internal) return next(); // FORBIDDEN
```

### 1.3 Password Policies

**Minimum Requirements:**

```typescript
const PASSWORD_POLICY = {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSpecialChar: true,
  preventCommonPasswords: true,    // Check against top 10k list
  preventUserInfo: true,           // No email, name in password
  preventReuse: 5,                 // Cannot reuse last 5 passwords
  maxAge: 90,                      // Force change every 90 days
  lockoutThreshold: 5,             // Lock after 5 failed attempts
  lockoutDuration: 900,            // 15 minutes
};

// Password Strength Validation (Zxcvbn recommended)
import zxcvbn from 'zxcvbn';

function validatePassword(password: string, userInputs: string[]): boolean {
  const result = zxcvbn(password, userInputs);
  return result.score >= 3; // Minimum score: 3/4
}
```

**Password Storage:**

- NEVER store plaintext passwords
- Supabase Auth handles password hashing (bcrypt, cost factor ≥12)
- Password reset tokens: single-use, 1-hour expiration
- Password reset MUST send email to registered address only

### 1.4 Multi-Factor Authentication (MFA)

**Status:** RECOMMENDED (enforce for admin roles)

**Requirements:**

```typescript
const MFA_CONFIG = {
  // Supported Methods
  methods: ['totp', 'sms'],           // TOTP preferred over SMS

  // Enrollment
  enforceForRoles: ['admin', 'owner'], // Mandatory for privileged roles
  optionalForRoles: ['member'],        // Optional for standard users

  // TOTP Settings
  totpIssuer: 'REIL/Q',
  totpAlgorithm: 'SHA256',
  totpDigits: 6,
  totpPeriod: 30,                      // 30-second window

  // Backup Codes
  backupCodeCount: 10,                 // Generate 10 backup codes
  backupCodeLength: 10,                // 10-character codes
  backupCodeSingleUse: true,           // Each code usable once

  // Recovery
  recoveryEmail: true,                 // Send recovery codes to email
  recoveryCodeExpiration: 3600,        // 1 hour expiration
};
```

**Implementation:**

- Use Supabase Auth MFA (native support)
- Display QR code for TOTP enrollment
- Require MFA verification for:
  - Password changes
  - Email changes
  - Permission escalations
  - API key generation
  - Organization ownership transfer

### 1.5 API Key Management

**Use Case:** Third-party integrations, connectors, webhook signatures

**Requirements:**

```typescript
interface APIKey {
  id: string;              // UUID
  org_id: string;          // Organization owner
  name: string;            // Descriptive name (e.g., "Zapier Integration")
  key_prefix: string;      // First 8 chars for identification (e.g., "sk_live_")
  key_hash: string;        // SHA-256 hash of full key
  scopes: string[];        // Permissions (e.g., ["deals:read", "contacts:write"])
  created_by: string;      // User ID who created the key
  created_at: timestamp;
  last_used_at: timestamp | null;
  expires_at: timestamp | null;
  revoked: boolean;
  ip_whitelist: string[] | null; // Optional IP restrictions
}

const API_KEY_CONFIG = {
  // Key Format
  format: 'sk_{env}_{random}',      // e.g., sk_live_7hg3k9d2f8w1x6c4
  envPrefix: {
    production: 'live',
    development: 'test',
  },
  randomLength: 32,                  // 32 random characters

  // Storage
  hashAlgorithm: 'SHA-256',          // Hash before storing
  displayPrefix: true,               // Show first 8 chars in UI
  displayFull: 'once',               // Show full key only on creation

  // Lifecycle
  defaultExpiration: null,           // No expiration by default
  maxExpiration: 365,                // Maximum 1 year
  warnBeforeExpiration: 30,          // Warn 30 days before expiry

  // Security
  rotationRecommendation: 90,        // Recommend rotation every 90 days
  revokeOnSuspicion: true,           // Revoke if unusual activity detected
  auditUsage: true,                  // Log every API key usage
};
```

**API Key Generation:**

```typescript
import { randomBytes, createHash } from 'crypto';

function generateAPIKey(env: 'production' | 'development'): {
  fullKey: string;
  keyHash: string;
  keyPrefix: string;
} {
  const prefix = env === 'production' ? 'live' : 'test';
  const random = randomBytes(24).toString('base64url'); // 32 chars
  const fullKey = `sk_${prefix}_${random}`;

  const keyHash = createHash('sha256')
    .update(fullKey)
    .digest('hex');

  const keyPrefix = fullKey.substring(0, 15); // sk_live_XXXXXXX

  return { fullKey, keyHash, keyPrefix };
}
```

**API Key Validation:**

```typescript
// Middleware for API key authentication
async function validateAPIKey(key: string): Promise<{
  valid: boolean;
  org_id?: string;
  scopes?: string[];
}> {
  // Hash the provided key
  const keyHash = createHash('sha256').update(key).digest('hex');

  // Query database for matching hash
  const apiKey = await db.query(
    'SELECT org_id, scopes, revoked, expires_at FROM api_keys WHERE key_hash = $1',
    [keyHash]
  );

  if (!apiKey) return { valid: false };
  if (apiKey.revoked) return { valid: false };
  if (apiKey.expires_at && new Date() > apiKey.expires_at) {
    return { valid: false };
  }

  // Update last_used_at
  await db.query(
    'UPDATE api_keys SET last_used_at = NOW() WHERE key_hash = $1',
    [keyHash]
  );

  return {
    valid: true,
    org_id: apiKey.org_id,
    scopes: apiKey.scopes,
  };
}
```

**Rotation Process:**

1. Generate new API key
2. Update integration with new key
3. Test integration
4. Revoke old key
5. Audit log rotation event

---

## 2. Data Protection

### 2.1 Encryption at Rest

**Responsibility:** Supabase (PostgreSQL with transparent data encryption)

**Verification Requirements:**

- Confirm Supabase project has encryption at rest enabled (default)
- Verify database backups are encrypted
- Ensure file storage (Supabase Storage) uses AES-256 encryption

**Application-Level Encryption (for highly sensitive fields):**

```typescript
// For fields requiring additional encryption (e.g., SSN, bank accounts)
import { encrypt, decrypt } from './crypto';

interface EncryptedField {
  encrypted: true;
  algorithm: 'AES-256-GCM';
  ciphertext: string;
  iv: string;          // Initialization vector
  tag: string;         // Authentication tag
}

// Encryption key management
const ENCRYPTION_KEY = process.env.FIELD_ENCRYPTION_KEY; // 256-bit key
const KEY_ROTATION_POLICY = 365; // Rotate annually

// Usage example
const encryptedSSN = await encrypt(ssn, ENCRYPTION_KEY);
// Store encryptedSSN in database as JSONB
```

**Prohibited Actions:**

- NEVER store sensitive data in plaintext logs
- NEVER store encryption keys in source code
- NEVER use weak encryption algorithms (DES, MD5, SHA-1)

### 2.2 Encryption in Transit

**Requirements:**

```typescript
const TLS_CONFIG = {
  minVersion: 'TLSv1.3',             // TLS 1.3 minimum
  fallbackVersion: 'TLSv1.2',        // TLS 1.2 acceptable
  cipherSuites: [
    'TLS_AES_256_GCM_SHA384',        // TLS 1.3
    'TLS_CHACHA20_POLY1305_SHA256',  // TLS 1.3
    'TLS_AES_128_GCM_SHA256',        // TLS 1.3
  ],
  hsts: {
    enabled: true,
    maxAge: 31536000,                // 1 year
    includeSubDomains: true,
    preload: true,
  },
  certificateValidation: true,
  allowInsecure: false,              // No HTTP in production
};
```

**Implementation:**

- ALL API requests MUST use HTTPS
- HTTP requests MUST redirect to HTTPS (301 Moved Permanently)
- Set `Strict-Transport-Security` header
- Use valid SSL/TLS certificates (Let's Encrypt or commercial CA)
- Verify certificate chain in API client requests

**Code Example:**

```typescript
// Express.js middleware
app.use((req, res, next) => {
  // Enforce HTTPS in production
  if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
    return res.redirect(301, `https://${req.hostname}${req.url}`);
  }

  // Set HSTS header
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  next();
});
```

### 2.3 PII Field Identification

**Defined PII Fields (see PII_RULES.md for complete list):**

**Contact Entity:**
- `first_name`, `last_name`, `full_name`
- `email`, `phone_primary`, `phone_secondary`
- `address_line1`, `address_line2`, `city`, `state`, `zip`
- `ssn` (if collected)

**User Entity:**
- `email`, `full_name`, `phone`

**Deal Entity:**
- `purchase_price`, `commission_amount`
- `buyer_name`, `seller_name`, `listing_agent`, `buyer_agent`

**Document Entity:**
- `file_content` (may contain PII)
- `extracted_text` (may contain PII)

**Message Entity:**
- `from_address`, `to_addresses`, `cc_addresses`
- `body` (may contain PII)
- `attachments` (may contain PII)

**Audit Ledger:**
- `actor_id`, `ip_address`, `user_agent`

**Tagging Strategy:**

```typescript
// Schema-level PII annotation
interface SchemaField {
  name: string;
  type: string;
  pii: boolean;           // Mark as PII
  piiCategory?: 'contact' | 'financial' | 'medical' | 'legal';
  encryptAtRest?: boolean;
  maskInLogs?: boolean;
  maskInUI?: boolean;
}

// Example table definition with PII markers
const contactSchema = {
  id: { type: 'uuid', pii: false },
  org_id: { type: 'uuid', pii: false },
  email: { type: 'string', pii: true, piiCategory: 'contact', maskInLogs: true },
  phone: { type: 'string', pii: true, piiCategory: 'contact', maskInLogs: true },
  ssn: { type: 'string', pii: true, piiCategory: 'contact', encryptAtRest: true, maskInUI: true },
};
```

### 2.4 Data Retention Policies

**Retention Requirements:**

```typescript
const RETENTION_POLICY = {
  // Active Data
  activeDeal: 'indefinite',          // Keep while deal is active
  closedDeal: 2555,                  // 7 years (SOX compliance)

  // Audit Logs
  auditLedger: 2555,                 // 7 years (compliance)
  applicationLogs: 90,               // 90 days
  accessLogs: 365,                   // 1 year

  // User Data
  activeUser: 'indefinite',          // Keep while user is active
  inactiveUser: 1095,                // 3 years after last activity
  deletedUser: 30,                   // 30-day recovery window

  // Documents
  signedDocument: 2555,              // 7 years (legal requirement)
  draftDocument: 365,                // 1 year

  // Soft Deletes
  softDeleteRecovery: 30,            // 30-day recovery window
  softDeletePurge: 'after_recovery', // Purge after recovery window
};
```

**Deletion Process:**

```typescript
// Soft delete (marks as deleted, retains data)
async function softDelete(entityType: string, entityId: string): Promise<void> {
  await db.query(
    `UPDATE ${entityType} SET deleted_at = NOW(), deleted_by = $1 WHERE id = $2`,
    [currentUserId, entityId]
  );

  // Log deletion event
  await auditLog.log({
    event_type: `${entityType}.deleted`,
    entity_id: entityId,
    actor_id: currentUserId,
  });
}

// Hard delete (irreversible, complies with GDPR "right to be forgotten")
async function hardDelete(entityType: string, entityId: string): Promise<void> {
  // Verify recovery window has passed OR explicit user request
  const entity = await db.query(
    `SELECT deleted_at FROM ${entityType} WHERE id = $1`,
    [entityId]
  );

  if (!entity.deleted_at) {
    throw new Error('Cannot hard delete: entity not soft deleted');
  }

  const daysSinceDeletion = (Date.now() - entity.deleted_at.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceDeletion < RETENTION_POLICY.softDeleteRecovery) {
    throw new Error('Cannot hard delete: recovery window not expired');
  }

  // Permanently delete
  await db.query(`DELETE FROM ${entityType} WHERE id = $1`, [entityId]);

  // Log permanent deletion
  await auditLog.log({
    event_type: `${entityType}.purged`,
    entity_id: entityId,
    actor_id: 'system',
  });
}
```

**GDPR Compliance:**

- Honor "Right to be Forgotten" requests within 30 days
- Provide data export in machine-readable format (JSON/CSV)
- Maintain consent records for marketing communications
- Allow users to withdraw consent

---

## 3. Access Control

### 3.1 RBAC Implementation via RLS

**Row-Level Security (RLS) Requirements:**

ALL tables containing organizational data MUST implement RLS policies to enforce multi-tenancy isolation.

**Policy Template:**

```sql
-- Enable RLS on table
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their organization's data
CREATE POLICY "org_isolation_policy" ON contacts
  FOR ALL
  USING (org_id = auth.jwt() ->> 'org_id');

-- Policy: Service role bypasses RLS (for system operations)
CREATE POLICY "service_role_bypass" ON contacts
  FOR ALL
  USING (auth.role() = 'service_role');
```

**Role Definitions:**

```typescript
enum OrgRole {
  OWNER = 'owner',       // Full control, billing, delete org
  ADMIN = 'admin',       // Manage users, settings, no billing
  MEMBER = 'member',     // Create/edit deals, contacts
  VIEWER = 'viewer',     // Read-only access
}

// Permission matrix
const PERMISSIONS = {
  // Deal permissions
  'deal.create': ['owner', 'admin', 'member'],
  'deal.read': ['owner', 'admin', 'member', 'viewer'],
  'deal.update': ['owner', 'admin', 'member'],
  'deal.delete': ['owner', 'admin'],

  // Contact permissions
  'contact.create': ['owner', 'admin', 'member'],
  'contact.read': ['owner', 'admin', 'member', 'viewer'],
  'contact.update': ['owner', 'admin', 'member'],
  'contact.delete': ['owner', 'admin'],

  // User management
  'user.invite': ['owner', 'admin'],
  'user.remove': ['owner', 'admin'],
  'user.change_role': ['owner'],

  // Organization settings
  'org.update': ['owner', 'admin'],
  'org.delete': ['owner'],
  'org.billing': ['owner'],

  // API keys
  'apikey.create': ['owner', 'admin'],
  'apikey.revoke': ['owner', 'admin'],
};
```

**Permission Check Middleware:**

```typescript
// Check if user has required permission
function requirePermission(permission: string) {
  return async (req, res, next) => {
    const user = req.user; // From JWT validation middleware
    const userRole = user.role;

    if (!PERMISSIONS[permission]?.includes(userRole)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Role '${userRole}' does not have permission '${permission}'`,
      });
    }

    next();
  };
}

// Usage in API routes
app.post('/api/deals',
  authenticateJWT,
  requirePermission('deal.create'),
  async (req, res) => {
    // Handler logic
  }
);
```

### 3.2 Principle of Least Privilege

**Guidelines:**

1. **Default Deny:** Start with no permissions, grant only what's needed
2. **Granular Scopes:** Use fine-grained permissions (e.g., `deal.read` instead of `deal.*`)
3. **Time-Limited Elevation:** Temporary admin access expires automatically
4. **Just-In-Time Access:** Grant permissions only when needed, revoke immediately after

**Implementation:**

```typescript
// Temporary permission elevation (e.g., for support access)
interface TemporaryGrant {
  user_id: string;
  org_id: string;
  permission: string;
  granted_by: string;
  granted_at: timestamp;
  expires_at: timestamp;
  reason: string;
}

// Check permission with temporary grants
async function hasPermission(
  userId: string,
  orgId: string,
  permission: string
): Promise<boolean> {
  // Check base role permission
  const user = await getUser(userId, orgId);
  if (PERMISSIONS[permission]?.includes(user.role)) {
    return true;
  }

  // Check temporary grants
  const tempGrant = await db.query(
    `SELECT * FROM temporary_grants
     WHERE user_id = $1 AND org_id = $2 AND permission = $3
     AND expires_at > NOW()`,
    [userId, orgId, permission]
  );

  return tempGrant !== null;
}
```

### 3.3 Admin Action Logging

**Requirements:**

ALL privileged actions MUST be logged to the audit ledger.

**Privileged Actions:**

- User role changes
- User invitation/removal
- Organization settings changes
- API key creation/revocation
- Permission grants
- Data exports
- Bulk operations
- Database migrations (for audit trail)

**Logging Example:**

```typescript
// Middleware to log admin actions
function auditAdminAction(actionType: string) {
  return async (req, res, next) => {
    const startTime = Date.now();

    // Capture original response methods
    const originalJson = res.json.bind(res);

    res.json = (body) => {
      const duration = Date.now() - startTime;

      // Log to audit ledger
      auditLog.log({
        event_type: actionType,
        actor_id: req.user.id,
        actor_type: 'user',
        entity_type: req.params.entityType || 'unknown',
        entity_id: req.params.id || null,
        payload: {
          request_body: req.body,
          response_status: res.statusCode,
          duration_ms: duration,
        },
        source: 'api',
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
      });

      return originalJson(body);
    };

    next();
  };
}

// Usage
app.put('/api/users/:id/role',
  authenticateJWT,
  requirePermission('user.change_role'),
  auditAdminAction('user.role_changed'),
  async (req, res) => {
    // Handler logic
  }
);
```

### 3.4 Sensitive Operation Confirmations

**Irreversible Actions Requiring Confirmation:**

- Organization deletion
- User removal
- API key revocation
- Data export
- Bulk delete operations

**Implementation:**

```typescript
// Two-step confirmation for sensitive operations
interface ConfirmationToken {
  token: string;
  operation: string;
  entity_id: string;
  user_id: string;
  expires_at: timestamp;
}

// Step 1: Request confirmation
app.post('/api/orgs/:id/delete-request', async (req, res) => {
  const confirmationToken = generateSecureToken();

  await db.insert('confirmation_tokens', {
    token: confirmationToken,
    operation: 'org.delete',
    entity_id: req.params.id,
    user_id: req.user.id,
    expires_at: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
  });

  // Send confirmation email
  await sendEmail(req.user.email, {
    subject: 'Confirm Organization Deletion',
    body: `Click here to confirm: ${FRONTEND_URL}/confirm/${confirmationToken}`,
  });

  res.json({ message: 'Confirmation email sent' });
});

// Step 2: Execute with valid token
app.post('/api/orgs/:id/delete-confirm', async (req, res) => {
  const { token } = req.body;

  const confirmation = await db.query(
    'SELECT * FROM confirmation_tokens WHERE token = $1 AND expires_at > NOW()',
    [token]
  );

  if (!confirmation || confirmation.entity_id !== req.params.id) {
    return res.status(400).json({ error: 'Invalid or expired confirmation token' });
  }

  // Execute deletion
  await deleteOrganization(req.params.id);

  // Invalidate token
  await db.delete('confirmation_tokens', { token });

  res.json({ message: 'Organization deleted' });
});
```

---

## 4. Infrastructure Security

### 4.1 Environment Variable Management

**Requirements:**

```typescript
// Environment variable structure
const ENV_VARS = {
  // Supabase
  SUPABASE_URL: 'required',
  SUPABASE_ANON_KEY: 'required',      // Public, safe to expose
  SUPABASE_SERVICE_KEY: 'secret',     // NEVER expose to client

  // Database
  DATABASE_URL: 'secret',             // Connection string with credentials

  // Encryption
  FIELD_ENCRYPTION_KEY: 'secret',     // 256-bit encryption key

  // External Services
  SENDGRID_API_KEY: 'secret',
  AWS_ACCESS_KEY_ID: 'secret',
  AWS_SECRET_ACCESS_KEY: 'secret',

  // Application
  NODE_ENV: 'required',               // production | development | test
  FRONTEND_URL: 'required',
  API_BASE_URL: 'required',

  // Feature Flags
  ENABLE_MFA: 'optional',
  ENABLE_API_KEYS: 'optional',
};
```

**Storage Rules:**

- NEVER commit `.env` files to version control
- Use `.env.example` with dummy values for documentation
- Store secrets in secure secret manager (Vercel Env Vars, AWS Secrets Manager, HashiCorp Vault)
- Rotate secrets when team members leave
- Use different secrets for each environment (dev, staging, prod)

**.env.example:**

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Encryption (generate with: openssl rand -hex 32)
FIELD_ENCRYPTION_KEY=

# Email Service
SENDGRID_API_KEY=

# Application
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:3001
```

**Validation:**

```typescript
// Validate environment variables on startup
import { z } from 'zod';

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_KEY: z.string().min(1),
  DATABASE_URL: z.string().url(),
  FIELD_ENCRYPTION_KEY: z.string().length(64), // 32 bytes = 64 hex chars
  NODE_ENV: z.enum(['development', 'production', 'test']),
  FRONTEND_URL: z.string().url(),
});

try {
  envSchema.parse(process.env);
} catch (error) {
  console.error('Environment validation failed:', error);
  process.exit(1);
}
```

### 4.2 Secret Rotation Policies

**Rotation Schedule:**

```typescript
const ROTATION_SCHEDULE = {
  // Database credentials
  databasePassword: 90,              // Every 90 days

  // API keys
  serviceApiKeys: 180,               // Every 6 months
  userApiKeys: 365,                  // Recommend annual rotation

  // Encryption keys
  fieldEncryptionKey: 365,           // Annual rotation with re-encryption

  // JWT signing keys
  jwtSigningKey: 180,                // Every 6 months (Supabase managed)

  // External service keys
  sendgridApiKey: 180,               // Every 6 months
  awsAccessKeys: 90,                 // Every 90 days
};
```

**Rotation Process:**

1. Generate new secret
2. Deploy new secret to production (dual-key support)
3. Monitor for errors
4. Deprecate old secret after grace period
5. Revoke old secret
6. Update documentation

**Automated Rotation Script:**

```typescript
// Example: Rotate Supabase service key
async function rotateSupabaseServiceKey(): Promise<void> {
  console.log('Starting Supabase service key rotation...');

  // Step 1: Generate new key via Supabase dashboard or API
  // (Manual step - Supabase doesn't support automated key rotation)

  // Step 2: Update environment variables in deployment platform
  await updateEnvironmentVariable('SUPABASE_SERVICE_KEY', newKey);

  // Step 3: Trigger redeployment
  await triggerRedeployment();

  // Step 4: Wait for health check
  await waitForHealthCheck();

  // Step 5: Log rotation event
  await auditLog.log({
    event_type: 'security.secret_rotated',
    actor_type: 'system',
    payload: { secret_type: 'supabase_service_key' },
  });

  console.log('Rotation complete!');
}
```

### 4.3 Network Security (Supabase Managed)

**Supabase Network Controls:**

- Database: Not publicly accessible (proxied via Supabase API)
- API: Rate limiting via Supabase (configurable)
- Storage: Private by default, requires signed URLs

**Application-Level Controls:**

```typescript
// Rate limiting for API endpoints
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,    // 15 minutes
  max: 100,                     // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.',

  // Custom key generator (per user + IP)
  keyGenerator: (req) => {
    return `${req.user?.id || 'anonymous'}_${req.ip}`;
  },
});

// Stricter limits for sensitive endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,                       // Only 5 login attempts per 15 minutes
  skipSuccessfulRequests: true, // Don't count successful logins
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
```

**CORS Configuration:**

```typescript
import cors from 'cors';

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://app.reilq.com',
      'https://staging.reilq.com',
    ];

    // Allow no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,              // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,                  // Cache preflight for 24 hours
};

app.use(cors(corsOptions));
```

### 4.4 Dependency Vulnerability Scanning

**Requirements:**

- Run `npm audit` on every pull request
- Block merges if high/critical vulnerabilities exist
- Update dependencies monthly
- Monitor security advisories (GitHub Dependabot, Snyk)

**npm audit Configuration:**

```json
// package.json
{
  "scripts": {
    "audit": "npm audit --audit-level=high",
    "audit:fix": "npm audit fix",
    "audit:check": "npm audit --audit-level=critical --production"
  }
}
```

**CI/CD Integration (GitHub Actions):**

```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on: [pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm audit --audit-level=high

  dependency-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/dependency-review-action@v4
        with:
          fail-on-severity: high
```

**Allowed Exceptions:**

```json
// .npmrc
audit-level=high
audit-ignore-dev=false

// Document exceptions in SECURITY.md
```

---

## 5. Application Security

### 5.1 Input Validation

**Validation Strategy:**

```typescript
import { z } from 'zod';

// Define schemas for all inputs
const createDealSchema = z.object({
  org_id: z.string().uuid(),
  address: z.string().min(1).max(500),
  city: z.string().min(1).max(100),
  state: z.string().length(2),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/),
  purchase_price: z.number().positive().max(1_000_000_000),
  stage: z.enum(['lead', 'under_contract', 'closed', 'dead']),
  listing_agent_id: z.string().uuid().optional(),
});

// Validation middleware
function validateBody(schema: z.ZodSchema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }
  };
}

// Usage
app.post('/api/deals',
  authenticateJWT,
  validateBody(createDealSchema),
  async (req, res) => {
    // req.body is now validated and typed
  }
);
```

**Sanitization:**

```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize HTML content (e.g., email bodies)
function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a'],
    ALLOWED_ATTR: ['href', 'target'],
  });
}

// Strip all HTML tags
function stripHTML(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}
```

### 5.2 SQL Injection Prevention

**Rules:**

- ALWAYS use parameterized queries
- NEVER concatenate user input into SQL strings
- Use ORM (Prisma, Drizzle) or query builder (Kysely) when possible

**Safe Practices:**

```typescript
// SAFE: Parameterized query
const contacts = await db.query(
  'SELECT * FROM contacts WHERE org_id = $1 AND email = $2',
  [orgId, email]
);

// SAFE: Prisma ORM
const contacts = await prisma.contact.findMany({
  where: {
    org_id: orgId,
    email: email,
  },
});

// UNSAFE: String concatenation (FORBIDDEN)
const query = `SELECT * FROM contacts WHERE email = '${email}'`; // NEVER DO THIS
```

**RLS as Defense-in-Depth:**

Even with parameterized queries, RLS policies provide an additional layer of protection against logic errors.

### 5.3 XSS Prevention

**React Auto-Escaping:**

React automatically escapes content in JSX, preventing most XSS attacks.

**Dangerous Patterns to Avoid:**

```typescript
// UNSAFE: dangerouslySetInnerHTML without sanitization
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// SAFE: Sanitize first
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />

// UNSAFE: href with javascript: protocol
<a href={userProvidedUrl}>Click</a>

// SAFE: Validate URL protocol
function isSafeUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}
```

**Content Security Policy (CSP):**

```typescript
// Set CSP headers
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co",
      "frame-ancestors 'none'",
    ].join('; ')
  );
  next();
});
```

### 5.4 CSRF Protection

**Token-Based Protection:**

```typescript
import csrf from 'csurf';

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  },
});

// Apply to state-changing endpoints
app.post('/api/deals', csrfProtection, async (req, res) => {
  // Handler logic
});

// Send CSRF token to client
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

**SameSite Cookie Attribute:**

```typescript
// Set SameSite attribute on all cookies
app.use(session({
  cookie: {
    sameSite: 'lax',     // Prevents CSRF via cross-site requests
    secure: true,        // HTTPS only
    httpOnly: true,      // No JavaScript access
  },
}));
```

### 5.5 Error Handling

**Secure Error Responses:**

```typescript
// Production error handler (DO NOT leak internal details)
app.use((err, req, res, next) => {
  // Log full error internally
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    user: req.user?.id,
    url: req.url,
    method: req.method,
  });

  // Return generic error to client in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred. Please try again later.',
      request_id: req.id, // For support debugging
    });
  }

  // Return detailed error in development
  res.status(500).json({
    error: err.name,
    message: err.message,
    stack: err.stack,
  });
});
```

**Validation Errors:**

```typescript
// Return specific validation errors (safe to expose)
catch (error) {
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      error: 'Validation Error',
      details: error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }
}
```

---

## 6. Security Headers

**Required HTTP Security Headers:**

```typescript
import helmet from 'helmet';

app.use(helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.supabase.co"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },

  // Strict Transport Security
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },

  // X-Frame-Options
  frameguard: {
    action: 'deny',
  },

  // X-Content-Type-Options
  noSniff: true,

  // X-XSS-Protection (legacy, but still useful)
  xssFilter: true,

  // Referrer-Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
}));
```

---

## 7. Incident Response

### 7.1 Security Incident Classification

**Severity Levels:**

- **Critical:** Active breach, data exfiltration, ransomware
- **High:** Vulnerability actively exploited, privilege escalation
- **Medium:** Vulnerability discovered, no evidence of exploitation
- **Low:** Security misconfiguration, no immediate risk

### 7.2 Incident Response Playbook

**Steps:**

1. **Detection:** Monitor logs, alerts, user reports
2. **Containment:** Isolate affected systems, revoke compromised credentials
3. **Eradication:** Remove malware, patch vulnerabilities
4. **Recovery:** Restore from backups, verify integrity
5. **Post-Mortem:** Document incident, improve defenses

**Contacts:**

- Security Lead: [TBD]
- Infrastructure Lead: [TBD]
- Legal/Compliance: [TBD]

### 7.3 Breach Notification Requirements

**GDPR:** Notify supervisory authority within 72 hours if PII is compromised
**CCPA:** Notify affected California residents without unreasonable delay
**SOX:** Report material breaches affecting financial data

---

## 8. Compliance Checklist

**Pre-Production Security Review:**

- [ ] All API endpoints require authentication
- [ ] RLS policies enabled on all multi-tenant tables
- [ ] PII fields identified and protected
- [ ] Input validation on all user inputs
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitization, CSP)
- [ ] CSRF protection on state-changing endpoints
- [ ] Rate limiting on all public endpoints
- [ ] Security headers configured (Helmet.js)
- [ ] TLS 1.3 enforced, HTTP redirects to HTTPS
- [ ] Error messages do not leak internal details
- [ ] Audit logging for all privileged actions
- [ ] MFA available for admin users
- [ ] API keys stored as hashes, not plaintext
- [ ] Environment variables secured (no .env in git)
- [ ] Dependency vulnerabilities resolved (npm audit)
- [ ] Data retention policies implemented
- [ ] Incident response plan documented

---

## 9. Security Training

**Required Training for Developers:**

- OWASP Top 10 awareness
- Secure coding practices
- PII handling guidelines
- Incident response procedures

**Annual Security Review:** All developers must complete security training annually.

---

## Appendix A: Security Tools

**Recommended Tools:**

- **SAST:** ESLint with security plugins, Semgrep
- **Dependency Scanning:** npm audit, Snyk, Dependabot
- **Secret Scanning:** GitGuardian, TruffleHog, gitleaks
- **API Testing:** Postman, Insomnia, curl
- **Penetration Testing:** Burp Suite, OWASP ZAP (annual third-party pentest recommended)

---

## Appendix B: Secure Development Lifecycle

**Phase 1: Design**
- Threat modeling
- Security requirements definition

**Phase 2: Development**
- Secure coding practices
- Code review with security focus

**Phase 3: Testing**
- Security testing (SAST, DAST)
- Penetration testing

**Phase 4: Deployment**
- Security configuration review
- Vulnerability scanning

**Phase 5: Maintenance**
- Patch management
- Security monitoring

---

## Document Revision History

| Version | Date       | Author      | Changes                     |
|---------|------------|-------------|-----------------------------|
| 1.0.0   | 2025-12-31 | Lane 6 - QA | Initial security baseline   |

---

**Next Review Date:** 2026-03-31 (Quarterly review required)
