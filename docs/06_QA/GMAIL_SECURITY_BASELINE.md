# Gmail Integration Security Baseline - REIL/Q

**Version:** 1.0.0
**Last Updated:** 2025-12-31
**Sprint:** 0.2 - Gmail-First Inbox Spine
**Owner:** Lane 6 - QA + Security
**Status:** Active
**Ticket:** SEC-701

## Document Purpose

This document establishes mandatory security requirements for the Gmail integration in REIL/Q Sprint 0.2. It extends the general SECURITY_BASELINE.md and PII_RULES.md with Gmail-specific controls for OAuth token management, email data handling, and third-party API security.

**Compliance with this baseline is REQUIRED for production deployment.**

---

## Threat Model - Gmail Integration

**Integration Classification:** High-risk third-party connector with PII access
**Data Sensitivity:** Email content (highly sensitive PII), OAuth credentials, attachment data
**Compliance Requirements:** GDPR, CCPA, Gmail API Terms of Service, OAuth 2.0 Security Best Practices

**Primary Threats:**

1. **OAuth Token Theft:** Stolen tokens grant full access to user's Gmail account
2. **Email Content Exposure:** Email bodies contain uncontrolled PII (SSN, financial data, medical info)
3. **PII Leakage via Logs:** Email addresses, subjects, bodies logged during sync operations
4. **Attachment Malware:** Malicious files ingested from emails
5. **Gmail API Quota Abuse:** Rate limit violations causing service disruption
6. **Unauthorized Mailbox Access:** Cross-org access to synced email data
7. **Token Refresh Failures:** Expired tokens blocking sync, user lockout
8. **Data Retention Violations:** Disconnected mailbox data retained indefinitely
9. **Insufficient Audit Trail:** Email access and sync operations not logged
10. **Third-Party API Dependency:** Gmail API downtime or policy changes

---

## 1. OAuth Token Security

### 1.1 Token Storage Requirements

**CRITICAL: OAuth tokens are equivalent to user passwords and MUST be protected with defense-in-depth.**

#### Storage Architecture

```typescript
// Token Storage Schema (from execution packet)
interface MailboxTokens {
  access_token_encrypted: string;   // REQUIRED: AES-256-GCM encrypted
  refresh_token_encrypted: string;  // REQUIRED: AES-256-GCM encrypted
  token_expires_at: timestamp;      // Access token expiration
  last_synced_at: timestamp;        // For monitoring refresh failures
}
```

**Encryption Standard:**

```typescript
// Encryption Configuration
const TOKEN_ENCRYPTION = {
  algorithm: 'AES-256-GCM',
  keyDerivation: 'PBKDF2',
  iterations: 100000,
  saltLength: 32,      // bytes
  ivLength: 12,        // bytes (GCM standard)
  tagLength: 16,       // bytes (authentication tag)
};

// Encryption Key Management
const ENCRYPTION_KEY = process.env.GMAIL_TOKEN_ENCRYPTION_KEY; // 256-bit key
const KEY_ROTATION_INTERVAL = 365; // days

// CRITICAL: Store encryption key in secure secret manager
// - Vercel: Environment variables (encrypted at rest)
// - AWS: Secrets Manager or Parameter Store
// - Never commit to git, never log
```

**Token Encryption Implementation:**

```typescript
import { randomBytes, createCipheriv, createDecipheriv, pbkdf2Sync } from 'crypto';

interface EncryptedToken {
  ciphertext: string;  // Base64 encoded
  iv: string;          // Base64 encoded initialization vector
  tag: string;         // Base64 encoded authentication tag
  salt: string;        // Base64 encoded salt (for key derivation)
}

/**
 * Encrypt OAuth token using AES-256-GCM
 * REQUIRED: Use this function for all token storage
 */
async function encryptToken(
  plaintext: string,
  masterKey: string
): Promise<EncryptedToken> {
  // Generate random salt and IV
  const salt = randomBytes(32);
  const iv = randomBytes(12);

  // Derive encryption key from master key using PBKDF2
  const key = pbkdf2Sync(masterKey, salt, 100000, 32, 'sha256');

  // Create cipher
  const cipher = createCipheriv('aes-256-gcm', key, iv);

  // Encrypt
  let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
  ciphertext += cipher.final('base64');

  // Get authentication tag
  const tag = cipher.getAuthTag();

  return {
    ciphertext,
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    salt: salt.toString('base64'),
  };
}

/**
 * Decrypt OAuth token
 * REQUIRED: Validate authentication tag to prevent tampering
 */
async function decryptToken(
  encrypted: EncryptedToken,
  masterKey: string
): Promise<string> {
  // Decode from base64
  const iv = Buffer.from(encrypted.iv, 'base64');
  const tag = Buffer.from(encrypted.tag, 'base64');
  const salt = Buffer.from(encrypted.salt, 'base64');

  // Derive decryption key
  const key = pbkdf2Sync(masterKey, salt, 100000, 32, 'sha256');

  // Create decipher
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  // Decrypt
  let plaintext = decipher.update(encrypted.ciphertext, 'base64', 'utf8');
  plaintext += decipher.final('utf8');

  return plaintext;
}

// Usage Example
async function storeMailboxTokens(
  mailboxId: string,
  accessToken: string,
  refreshToken: string,
  expiresAt: Date
): Promise<void> {
  const encryptedAccess = await encryptToken(
    accessToken,
    process.env.GMAIL_TOKEN_ENCRYPTION_KEY
  );

  const encryptedRefresh = await encryptToken(
    refreshToken,
    process.env.GMAIL_TOKEN_ENCRYPTION_KEY
  );

  await db.query(
    `UPDATE mailboxes
     SET access_token_encrypted = $1,
         refresh_token_encrypted = $2,
         token_expires_at = $3,
         updated_at = NOW()
     WHERE id = $4`,
    [
      JSON.stringify(encryptedAccess),
      JSON.stringify(encryptedRefresh),
      expiresAt,
      mailboxId,
    ]
  );

  // NEVER log the plaintext tokens
  logger.info('Mailbox tokens stored', {
    metadata: {
      mailbox_id: mailboxId,
      expires_at: expiresAt,
      // NO TOKEN VALUES
    },
  });
}
```

**PROHIBITED Actions:**

```typescript
// NEVER store tokens in plaintext
await db.update('mailboxes', {
  access_token: accessToken,  // FORBIDDEN
});

// NEVER log tokens (even redacted)
logger.info('Token:', accessToken);  // FORBIDDEN
logger.debug('Token prefix:', accessToken.substring(0, 10));  // FORBIDDEN

// NEVER pass tokens in URL parameters
fetch(`/api/gmail/sync?token=${accessToken}`);  // FORBIDDEN

// NEVER store tokens in localStorage or cookies (backend only)
localStorage.setItem('gmail_token', accessToken);  // FORBIDDEN

// NEVER transmit tokens to frontend (use server-side proxy)
res.json({ gmail_token: accessToken });  // FORBIDDEN
```

### 1.2 Token Refresh Policy

**Access Token Lifetime:** 1 hour (Google default)
**Refresh Token Lifetime:** Indefinite (until revoked)
**Refresh Strategy:** Proactive refresh before expiration

```typescript
// Token Refresh Configuration
const REFRESH_POLICY = {
  // Refresh access token when <5 minutes remaining
  refreshThresholdSeconds: 300,

  // Background refresh job (every 30 minutes)
  backgroundRefreshInterval: 1800,

  // Retry policy for failed refreshes
  maxRetries: 3,
  retryBackoff: [5, 15, 60], // seconds

  // Alert if refresh fails after all retries
  alertOnFailure: true,
};

/**
 * Refresh access token using refresh token
 * REQUIRED: Call before every Gmail API request if token near expiration
 */
async function refreshAccessToken(mailboxId: string): Promise<string> {
  const mailbox = await db.query(
    'SELECT refresh_token_encrypted, provider_email FROM mailboxes WHERE id = $1',
    [mailboxId]
  );

  if (!mailbox) {
    throw new Error('Mailbox not found');
  }

  // Decrypt refresh token
  const encryptedRefresh = JSON.parse(mailbox.refresh_token_encrypted);
  const refreshToken = await decryptToken(
    encryptedRefresh,
    process.env.GMAIL_TOKEN_ENCRYPTION_KEY
  );

  // Call Google OAuth token endpoint
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const error = await response.json();

    // Handle revoked refresh token
    if (error.error === 'invalid_grant') {
      await handleRevokedToken(mailboxId);
      throw new Error('Refresh token revoked by user');
    }

    logger.error('Token refresh failed', {
      metadata: {
        mailbox_id: mailboxId,
        email_redacted: piiRedactor.redactEmail(mailbox.provider_email),
        error_code: error.error,
        // NO TOKEN VALUES
      },
    });

    throw new Error('Token refresh failed');
  }

  const tokens = await response.json();

  // Store new access token (refresh token remains the same)
  const encryptedAccess = await encryptToken(
    tokens.access_token,
    process.env.GMAIL_TOKEN_ENCRYPTION_KEY
  );

  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

  await db.query(
    `UPDATE mailboxes
     SET access_token_encrypted = $1,
         token_expires_at = $2,
         status = 'connected',
         updated_at = NOW()
     WHERE id = $3`,
    [JSON.stringify(encryptedAccess), expiresAt, mailboxId]
  );

  // Log successful refresh
  await auditLog.log({
    event_type: 'MAILBOX_TOKEN_REFRESHED',
    entity_type: 'mailbox',
    entity_id: mailboxId,
    actor_type: 'system',
    payload: { expires_at: expiresAt },
  });

  return tokens.access_token;
}

/**
 * Get valid access token (with automatic refresh)
 * REQUIRED: Use this function for all Gmail API calls
 */
async function getValidAccessToken(mailboxId: string): Promise<string> {
  const mailbox = await db.query(
    `SELECT access_token_encrypted, token_expires_at
     FROM mailboxes
     WHERE id = $1 AND status = 'connected'`,
    [mailboxId]
  );

  if (!mailbox) {
    throw new Error('Mailbox not connected');
  }

  // Check if token is expired or near expiration
  const expiresAt = new Date(mailbox.token_expires_at);
  const now = new Date();
  const secondsUntilExpiry = (expiresAt.getTime() - now.getTime()) / 1000;

  if (secondsUntilExpiry < REFRESH_POLICY.refreshThresholdSeconds) {
    // Refresh token
    return await refreshAccessToken(mailboxId);
  }

  // Token still valid, decrypt and return
  const encrypted = JSON.parse(mailbox.access_token_encrypted);
  return await decryptToken(encrypted, process.env.GMAIL_TOKEN_ENCRYPTION_KEY);
}
```

**Background Refresh Job:**

```typescript
/**
 * Background job to refresh tokens for all active mailboxes
 * Schedule: Every 30 minutes via cron
 */
async function refreshAllActiveTokens(): Promise<void> {
  const mailboxes = await db.query(
    `SELECT id, token_expires_at
     FROM mailboxes
     WHERE status = 'connected'
     AND token_expires_at < NOW() + INTERVAL '10 minutes'`
  );

  logger.info('Token refresh job started', {
    metadata: { mailbox_count: mailboxes.length },
  });

  for (const mailbox of mailboxes) {
    try {
      await refreshAccessToken(mailbox.id);
    } catch (error) {
      logger.error('Background token refresh failed', {
        metadata: {
          mailbox_id: mailbox.id,
          error: error.message,
        },
      });
    }
  }

  logger.info('Token refresh job completed');
}
```

### 1.3 Token Revocation Handling

**User-Initiated Revocation:** User disconnects mailbox in UI
**Google-Initiated Revocation:** User revokes access in Google account settings
**System-Initiated Revocation:** Security incident or suspicious activity detected

```typescript
/**
 * Handle token revocation (user or Google-initiated)
 */
async function handleRevokedToken(mailboxId: string): Promise<void> {
  // Update mailbox status
  await db.query(
    `UPDATE mailboxes
     SET status = 'disconnected',
         access_token_encrypted = NULL,
         refresh_token_encrypted = NULL,
         token_expires_at = NULL,
         updated_at = NOW()
     WHERE id = $1`,
    [mailboxId]
  );

  // Log revocation
  await auditLog.log({
    event_type: 'MAILBOX_TOKEN_REVOKED',
    entity_type: 'mailbox',
    entity_id: mailboxId,
    actor_type: 'system',
    payload: { reason: 'token_invalid' },
  });

  // Notify user (email)
  const mailbox = await db.query(
    'SELECT user_id, provider_email FROM mailboxes WHERE id = $1',
    [mailboxId]
  );

  await sendEmail(mailbox.user_id, {
    subject: 'Gmail Connection Disconnected',
    body: `Your Gmail account (${piiRedactor.redactEmail(mailbox.provider_email)}) was disconnected. Please reconnect in settings.`,
  });
}

/**
 * User-initiated disconnect
 * REQUIRED: Revoke token with Google AND delete from database
 */
async function disconnectMailbox(
  mailboxId: string,
  userId: string
): Promise<void> {
  // Verify user owns this mailbox
  const mailbox = await db.query(
    'SELECT user_id, refresh_token_encrypted FROM mailboxes WHERE id = $1',
    [mailboxId]
  );

  if (!mailbox || mailbox.user_id !== userId) {
    throw new Error('Unauthorized: User does not own this mailbox');
  }

  // Decrypt refresh token
  const encrypted = JSON.parse(mailbox.refresh_token_encrypted);
  const refreshToken = await decryptToken(
    encrypted,
    process.env.GMAIL_TOKEN_ENCRYPTION_KEY
  );

  // Revoke token with Google (best effort)
  try {
    await fetch('https://oauth2.googleapis.com/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ token: refreshToken }),
    });
  } catch (error) {
    logger.error('Google token revocation failed', {
      metadata: { mailbox_id: mailboxId },
    });
    // Continue with local cleanup even if Google revocation fails
  }

  // Update mailbox status (don't delete immediately for audit trail)
  await db.query(
    `UPDATE mailboxes
     SET status = 'disconnected',
         access_token_encrypted = NULL,
         refresh_token_encrypted = NULL,
         token_expires_at = NULL,
         updated_at = NOW()
     WHERE id = $1`,
    [mailboxId]
  );

  // Log disconnect
  await auditLog.log({
    event_type: 'MAILBOX_DISCONNECTED',
    entity_type: 'mailbox',
    entity_id: mailboxId,
    actor_id: userId,
    actor_type: 'user',
    payload: { reason: 'user_requested' },
  });

  logger.info('Mailbox disconnected', {
    metadata: { mailbox_id: mailboxId, user_id: userId },
  });
}
```

### 1.4 Token Leak Response Procedure

**If OAuth tokens are leaked (e.g., logged, exposed in error messages, committed to git):**

```typescript
/**
 * INCIDENT RESPONSE: OAuth Token Leak
 * Execute immediately upon detection
 */
async function respondToTokenLeak(
  affectedMailboxIds: string[]
): Promise<void> {
  logger.critical('TOKEN LEAK DETECTED', {
    metadata: {
      affected_count: affectedMailboxIds.length,
      timestamp: new Date().toISOString(),
    },
  });

  for (const mailboxId of affectedMailboxIds) {
    // 1. Immediately revoke all tokens
    await disconnectMailbox(mailboxId, 'system');

    // 2. Mark mailbox as requiring re-authentication
    await db.query(
      `UPDATE mailboxes
       SET status = 'error',
           updated_at = NOW()
       WHERE id = $1`,
      [mailboxId]
    );

    // 3. Log security incident
    await auditLog.log({
      event_type: 'SECURITY_INCIDENT_TOKEN_LEAK',
      entity_type: 'mailbox',
      entity_id: mailboxId,
      actor_type: 'system',
      severity: 'critical',
      payload: {
        incident_type: 'oauth_token_leak',
        response_action: 'tokens_revoked_immediate',
      },
    });

    // 4. Notify user
    const mailbox = await db.query(
      'SELECT user_id, provider_email FROM mailboxes WHERE id = $1',
      [mailboxId]
    );

    await sendUrgentEmail(mailbox.user_id, {
      subject: 'URGENT: Gmail Connection Security Alert',
      body: `We detected a potential security issue with your Gmail connection. We have disconnected your account (${piiRedactor.redactEmail(mailbox.provider_email)}) as a precaution. Please reconnect and review your Google account activity.`,
    });
  }

  // 5. Rotate encryption keys (if leak includes encryption key)
  if (process.env.ROTATION_REQUIRED === 'true') {
    await rotateTokenEncryptionKey();
  }

  // 6. Alert security team
  await sendSecurityAlert({
    type: 'oauth_token_leak',
    affected_count: affectedMailboxIds.length,
    timestamp: new Date(),
  });
}
```

**Prevention Checklist:**

- [ ] Tokens NEVER logged (even in debug mode)
- [ ] Tokens NEVER in error messages
- [ ] Tokens NEVER in URL parameters
- [ ] Tokens NEVER transmitted to frontend
- [ ] Encryption key stored in secure secret manager
- [ ] Pre-commit hooks scan for token patterns
- [ ] CI/CD scans for exposed secrets (GitGuardian, TruffleHog)

---

## 2. PII Handling for Email Data

### 2.1 Email Address Classification

**Email addresses are Direct Identifiers (High Sensitivity PII)**

#### Storage Rules

```typescript
// Email Address Fields (from execution packet)
interface EmailAddresses {
  from_email: string;      // Sender address
  to_emails: string[];     // Recipients
  cc_emails: string[];     // CC recipients
  bcc_emails: string[];    // BCC recipients (if available)
  participant_emails: string[]; // All participants (thread-level)
  provider_email: string;  // Mailbox owner email
}

// PII Classification
const EMAIL_PII_RULES = {
  piiType: 'Direct Identifier',
  sensitivity: 'High',
  encryptionAtRest: false,      // Database encryption sufficient
  maskInLogs: true,             // REQUIRED
  maskInUI: 'partial',          // Show j***e@example.com
  allowedInAudit: false,        // Use redacted version only
  allowedInErrorMessages: false, // NEVER include in errors
  indexForSearch: true,         // Allow search by email (org-scoped)
};
```

#### Logging Rules

```typescript
// NEVER log full email addresses
logger.info('Message synced', {
  metadata: {
    message_id: messageId,
    from_email: message.from_email,  // FORBIDDEN
  },
});

// ALWAYS use redacted version
logger.info('Message synced', {
  metadata: {
    message_id: messageId,
    from_email_redacted: piiRedactor.redactEmail(message.from_email), // REQUIRED
  },
});
```

### 2.2 Email Body Handling

**Email bodies may contain UNCONTROLLED PII of any type (SSN, financial data, medical info, credentials)**

#### Storage Rules

```typescript
// Email Body Storage (from execution packet)
interface EmailBody {
  body_plain: string | null;  // Plain text body
  body_html: string | null;   // HTML body
  snippet: string;            // First 200 chars (for preview)
}

// PII Classification
const EMAIL_BODY_PII_RULES = {
  piiType: 'May Contain Any PII',
  sensitivity: 'Critical',
  encryptionAtRest: true,        // Database encryption (Supabase)
  maskInLogs: 'NEVER_LOG',       // FORBIDDEN to log
  maskInUI: 'none',              // Show full content (org-scoped)
  allowedInAudit: false,         // NEVER in audit logs
  allowedInErrorMessages: false, // NEVER in error messages
  indexForSearch: false,         // NOT indexed (too sensitive)
};
```

**CRITICAL: Email bodies MUST NEVER appear in logs, error messages, or audit trails**

```typescript
// FORBIDDEN - Email Body Logging
logger.error('Email processing failed', {
  metadata: {
    body: message.body_plain,  // FORBIDDEN
  },
});

logger.debug('Email content:', message.body_html);  // FORBIDDEN

console.log('Parsing email:', {
  subject: message.subject,
  body: message.body_plain,  // FORBIDDEN
});

// CORRECT - No Body in Logs
logger.error('Email processing failed', {
  metadata: {
    message_id: message.id,
    mailbox_id: message.mailbox_id,
    error: 'parsing_failed',
    // NO BODY CONTENT
  },
});
```

#### Error Handling

```typescript
/**
 * REQUIRED: Sanitize errors from email processing
 * Email bodies may appear in stack traces or error messages
 */
function sanitizeEmailError(error: Error, context: {
  messageId: string;
  mailboxId: string;
}): Error {
  // Redact any email content from error message
  let sanitized = error.message;

  // Remove long strings (likely email content)
  sanitized = sanitized.replace(/[a-zA-Z0-9\s]{100,}/g, '[REDACTED]');

  // Remove email patterns
  sanitized = sanitized.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL_REDACTED]');

  // Remove URLs (may contain sensitive parameters)
  sanitized = sanitized.replace(/https?:\/\/[^\s]+/g, '[URL_REDACTED]');

  const sanitizedError = new Error(sanitized);
  sanitizedError.stack = `Email processing error
    Message ID: ${context.messageId}
    Mailbox ID: ${context.mailboxId}
    [Stack trace redacted to prevent PII exposure]`;

  return sanitizedError;
}

// Usage in email sync
try {
  await parseEmailBody(message.body_html);
} catch (error) {
  const sanitized = sanitizeEmailError(error, {
    messageId: message.id,
    mailboxId: message.mailbox_id,
  });

  logger.error('Email parsing failed', {
    metadata: {
      message_id: message.id,
      error: sanitized.message,
      // NO EMAIL CONTENT
    },
  });

  throw sanitized;
}
```

### 2.3 Email Subject Lines

**Subjects may contain PII (addresses, names, deal details)**

```typescript
// Subject Line Rules
const SUBJECT_PII_RULES = {
  piiType: 'May Contain PII',
  sensitivity: 'Medium',
  encryptionAtRest: false,
  maskInLogs: true,              // Redact or truncate
  maskInUI: 'none',              // Show full (org-scoped)
  allowedInAudit: false,         // Use truncated version
  allowedInErrorMessages: false, // NEVER in errors
  indexForSearch: true,          // Allow search (org-scoped)
};

// Logging Rule: Truncate subjects
logger.info('Thread synced', {
  metadata: {
    thread_id: threadId,
    subject_truncated: message.subject?.substring(0, 50) || 'No subject',
    // Truncate to 50 chars to avoid PII exposure
  },
});
```

### 2.4 Attachment Handling

**Attachments may contain ANY PII (contracts, financial docs, IDs, medical records)**

#### Virus Scanning

```typescript
// Attachment Security Configuration
const ATTACHMENT_SECURITY = {
  // Virus Scanning (REQUIRED before storage)
  virusScanRequired: true,
  virusScanProvider: 'ClamAV', // or AWS S3 malware scanning

  // Content Type Validation
  allowedMimeTypes: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ],

  // Size Limits
  maxFileSizeBytes: 25 * 1024 * 1024, // 25 MB (Gmail limit)

  // Forbidden Extensions
  forbiddenExtensions: [
    '.exe', '.bat', '.cmd', '.sh', '.ps1',
    '.vbs', '.js', '.jar', '.app', '.dmg',
  ],

  // Storage
  storageProvider: 'Supabase Storage',
  encryptionAtRest: true, // Supabase default
  accessControl: 'private', // Require signed URLs
  urlExpiration: 3600, // 1 hour signed URL
};

/**
 * REQUIRED: Scan attachment before storage
 */
async function scanAttachment(
  file: Buffer,
  filename: string,
  mimeType: string
): Promise<{ safe: boolean; threat?: string }> {
  // 1. Validate file extension
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  if (ATTACHMENT_SECURITY.forbiddenExtensions.includes(ext)) {
    return { safe: false, threat: 'forbidden_extension' };
  }

  // 2. Validate MIME type
  if (!ATTACHMENT_SECURITY.allowedMimeTypes.includes(mimeType)) {
    return { safe: false, threat: 'forbidden_mime_type' };
  }

  // 3. Validate file size
  if (file.length > ATTACHMENT_SECURITY.maxFileSizeBytes) {
    return { safe: false, threat: 'file_too_large' };
  }

  // 4. Virus scan (using ClamAV or AWS S3 scanning)
  const scanResult = await virusScan(file);
  if (!scanResult.clean) {
    return { safe: false, threat: scanResult.threat };
  }

  return { safe: true };
}

/**
 * Store attachment in Supabase Storage
 */
async function storeAttachment(
  messageId: string,
  attachmentData: {
    filename: string;
    mimeType: string;
    sizeBytes: number;
    content: Buffer;
    providerAttachmentId: string;
  }
): Promise<string> {
  // 1. Security scan
  const scanResult = await scanAttachment(
    attachmentData.content,
    attachmentData.filename,
    attachmentData.mimeType
  );

  if (!scanResult.safe) {
    logger.warn('Attachment blocked', {
      metadata: {
        message_id: messageId,
        filename: attachmentData.filename,
        threat: scanResult.threat,
        // NO FILE CONTENT
      },
    });

    throw new Error(`Attachment blocked: ${scanResult.threat}`);
  }

  // 2. Generate SHA-256 hash (for deduplication)
  const sha256 = createHash('sha256')
    .update(attachmentData.content)
    .digest('hex');

  // 3. Store in Supabase Storage
  const storagePath = `attachments/${messageId}/${sha256}_${attachmentData.filename}`;

  const { error } = await supabase.storage
    .from('mail-attachments')
    .upload(storagePath, attachmentData.content, {
      contentType: attachmentData.mimeType,
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    logger.error('Attachment upload failed', {
      metadata: {
        message_id: messageId,
        filename: attachmentData.filename,
        error: error.message,
        // NO FILE CONTENT
      },
    });

    throw new Error('Attachment upload failed');
  }

  // 4. Store metadata in database
  await db.query(
    `INSERT INTO mail_attachments (
      org_id, mailbox_id, message_id,
      provider_attachment_id, filename, mime_type,
      size_bytes, storage_path, sha256
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      orgId,
      mailboxId,
      messageId,
      attachmentData.providerAttachmentId,
      attachmentData.filename,
      attachmentData.mimeType,
      attachmentData.sizeBytes,
      storagePath,
      sha256,
    ]
  );

  // 5. Log attachment storage
  await auditLog.log({
    event_type: 'ATTACHMENT_SAVED',
    entity_type: 'attachment',
    entity_id: attachmentId,
    payload: {
      message_id: messageId,
      filename: attachmentData.filename,
      mime_type: attachmentData.mimeType,
      size_bytes: attachmentData.sizeBytes,
      sha256: sha256,
      // NO FILE CONTENT
    },
  });

  return storagePath;
}

/**
 * Generate signed URL for attachment download
 * REQUIRED: All attachment access must use signed URLs
 */
async function getAttachmentDownloadURL(
  attachmentId: string,
  userId: string
): Promise<string> {
  // Verify user has access (org-scoped)
  const attachment = await db.query(
    `SELECT a.storage_path, a.org_id
     FROM mail_attachments a
     JOIN mailboxes m ON a.mailbox_id = m.id
     WHERE a.id = $1`,
    [attachmentId]
  );

  // Verify user belongs to org
  const userOrg = await getUserOrg(userId);
  if (userOrg !== attachment.org_id) {
    throw new Error('Unauthorized: User does not have access to this attachment');
  }

  // Generate signed URL (1 hour expiration)
  const { data, error } = await supabase.storage
    .from('mail-attachments')
    .createSignedUrl(attachment.storage_path, 3600);

  if (error) {
    throw new Error('Failed to generate download URL');
  }

  // Log access
  await auditLog.log({
    event_type: 'ATTACHMENT_ACCESSED',
    entity_type: 'attachment',
    entity_id: attachmentId,
    actor_id: userId,
    actor_type: 'user',
    payload: { action: 'download_url_generated' },
  });

  return data.signedUrl;
}
```

#### Content Type Validation

**REQUIRED: Validate actual file content matches declared MIME type**

```typescript
import { fileTypeFromBuffer } from 'file-type';

async function validateAttachmentContent(
  content: Buffer,
  declaredMimeType: string
): Promise<boolean> {
  // Detect actual file type from content
  const detected = await fileTypeFromBuffer(content);

  if (!detected) {
    // Unable to detect file type, reject
    return false;
  }

  // Verify declared MIME type matches detected type
  return detected.mime === declaredMimeType;
}
```

### 2.5 What Can/Cannot Appear in Logs

**Gmail Sync Logging Rules**

```typescript
// ALLOWED in Logs
const ALLOWED_LOG_FIELDS = {
  // IDs (UUIDs are safe)
  message_id: true,
  thread_id: true,
  mailbox_id: true,
  org_id: true,
  user_id: true,
  attachment_id: true,

  // Metadata
  message_count: true,
  sync_duration_ms: true,
  api_calls_made: true,
  has_attachments: true,
  attachment_count: true,

  // Timestamps
  sent_at: true,
  synced_at: true,
  last_history_id: true,

  // Redacted PII
  email_redacted: true,
  subject_truncated: true, // First 50 chars only

  // Status/Errors
  status: true,
  error_code: true,
  error_type: true,
};

// FORBIDDEN in Logs
const FORBIDDEN_LOG_FIELDS = {
  // Email Content
  body_plain: 'NEVER',
  body_html: 'NEVER',
  snippet: 'NEVER', // May contain PII

  // Full Email Addresses
  from_email: 'NEVER',
  to_emails: 'NEVER',
  cc_emails: 'NEVER',
  participant_emails: 'NEVER',

  // Full Subject Lines
  subject: 'NEVER', // Use subject_truncated instead

  // OAuth Tokens
  access_token: 'NEVER',
  refresh_token: 'NEVER',

  // Attachment Content
  file_content: 'NEVER',
  attachment_data: 'NEVER',

  // Headers (may contain sensitive routing info)
  raw_headers: 'NEVER',
};

// Logging Helper (enforces rules)
function logGmailSync(event: {
  type: string;
  mailboxId: string;
  data: any;
}): void {
  const sanitized = {
    mailbox_id: event.mailboxId,
    // Include only safe fields
    ...Object.keys(event.data)
      .filter(key => ALLOWED_LOG_FIELDS[key])
      .reduce((acc, key) => ({ ...acc, [key]: event.data[key] }), {}),
  };

  logger.info(event.type, { metadata: sanitized });
}
```

---

## 3. Data Access Controls

### 3.1 Org-Level Isolation

**CRITICAL: Email data MUST be isolated by organization (multi-tenancy)**

#### Row-Level Security (RLS)

```sql
-- mailboxes table
ALTER TABLE mailboxes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation_mailboxes" ON mailboxes
  FOR ALL
  USING (org_id = auth.jwt() ->> 'org_id');

-- mail_threads table
ALTER TABLE mail_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation_threads" ON mail_threads
  FOR ALL
  USING (org_id = auth.jwt() ->> 'org_id');

-- mail_messages table
ALTER TABLE mail_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation_messages" ON mail_messages
  FOR ALL
  USING (org_id = auth.jwt() ->> 'org_id');

-- mail_attachments table
ALTER TABLE mail_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation_attachments" ON mail_attachments
  FOR ALL
  USING (org_id = auth.jwt() ->> 'org_id');

-- Service role bypass (for system operations)
CREATE POLICY "service_role_bypass_mailboxes" ON mailboxes
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "service_role_bypass_threads" ON mail_threads
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "service_role_bypass_messages" ON mail_messages
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "service_role_bypass_attachments" ON mail_attachments
  FOR ALL
  USING (auth.role() = 'service_role');
```

### 3.2 User Role Permissions

**RBAC for Email Data**

```typescript
// Gmail Permission Matrix
const GMAIL_PERMISSIONS = {
  // View email content
  'email.read': ['owner', 'admin', 'member', 'viewer'],

  // Connect/disconnect mailbox
  'mailbox.connect': ['owner', 'admin', 'member'], // Own mailbox only
  'mailbox.disconnect': ['owner', 'admin', 'member'], // Own mailbox only

  // Delete synced data
  'mailbox.delete_data': ['owner', 'admin'], // Admin can delete any mailbox

  // Manual attach/unlink
  'email.attach': ['owner', 'admin', 'member'],
  'email.unlink': ['owner', 'admin', 'member'],

  // View audit logs
  'email.audit': ['owner', 'admin'],
};

/**
 * Verify user can access mailbox
 */
async function canAccessMailbox(
  userId: string,
  mailboxId: string
): Promise<boolean> {
  const mailbox = await db.query(
    `SELECT m.user_id, m.org_id, om.role
     FROM mailboxes m
     JOIN org_members om ON m.org_id = om.org_id
     WHERE m.id = $1 AND om.user_id = $2`,
    [mailboxId, userId]
  );

  if (!mailbox) {
    return false; // User not in org
  }

  // User can access if:
  // 1. They own the mailbox, OR
  // 2. They have email.read permission in the org
  return (
    mailbox.user_id === userId ||
    GMAIL_PERMISSIONS['email.read'].includes(mailbox.role)
  );
}

/**
 * Verify user can disconnect mailbox
 */
async function canDisconnectMailbox(
  userId: string,
  mailboxId: string
): Promise<boolean> {
  const mailbox = await db.query(
    `SELECT m.user_id, m.org_id, om.role
     FROM mailboxes m
     JOIN org_members om ON m.org_id = om.org_id
     WHERE m.id = $1 AND om.user_id = $2`,
    [mailboxId, userId]
  );

  if (!mailbox) {
    return false;
  }

  // User can disconnect if:
  // 1. They own the mailbox, OR
  // 2. They are owner/admin in the org
  return (
    mailbox.user_id === userId ||
    ['owner', 'admin'].includes(mailbox.role)
  );
}
```

### 3.3 Who Can See Email Content

```typescript
// Access Control for Email Content
const EMAIL_ACCESS_RULES = {
  // Thread/Message Content
  canViewContent: {
    description: 'View email subject, body, attachments',
    allowedRoles: ['owner', 'admin', 'member', 'viewer'],
    requiresSameOrg: true,
    requiresMailboxConnected: false, // Can view historical data
  },

  // Email Search
  canSearchEmails: {
    description: 'Search emails by subject, sender, content',
    allowedRoles: ['owner', 'admin', 'member', 'viewer'],
    requiresSameOrg: true,
    orgScopedOnly: true, // Cannot search across orgs
  },

  // Attachment Download
  canDownloadAttachment: {
    description: 'Download email attachments',
    allowedRoles: ['owner', 'admin', 'member', 'viewer'],
    requiresSameOrg: true,
    generateSignedURL: true, // Use time-limited signed URLs
  },
};

/**
 * API Endpoint: Get Message Content
 */
app.get('/api/inbox/messages/:id', authenticateJWT, async (req, res) => {
  const message = await db.query(
    `SELECT m.*, t.subject as thread_subject
     FROM mail_messages m
     JOIN mail_threads t ON m.thread_id = t.id
     WHERE m.id = $1`,
    [req.params.id]
  );

  // RLS automatically enforces org isolation
  if (!message) {
    return res.status(404).json({ error: 'Message not found' });
  }

  // Check role permission
  const userRole = req.user.role;
  if (!EMAIL_ACCESS_RULES.canViewContent.allowedRoles.includes(userRole)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  // Log access
  await auditLog.log({
    event_type: 'EMAIL_VIEWED',
    entity_type: 'message',
    entity_id: message.id,
    actor_id: req.user.id,
    actor_type: 'user',
    payload: {
      thread_id: message.thread_id,
      // NO EMAIL CONTENT IN AUDIT LOG
    },
  });

  res.json(message);
});
```

### 3.4 Who Can Disconnect Mailbox

```typescript
/**
 * API Endpoint: Disconnect Mailbox
 * Authorization: Owner of mailbox OR org admin
 */
app.post('/api/mailboxes/:id/disconnect', authenticateJWT, async (req, res) => {
  const mailboxId = req.params.id;
  const userId = req.user.id;

  // Check permission
  const canDisconnect = await canDisconnectMailbox(userId, mailboxId);
  if (!canDisconnect) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Only mailbox owner or org admin can disconnect',
    });
  }

  // Execute disconnect
  await disconnectMailbox(mailboxId, userId);

  res.json({ success: true });
});
```

### 3.5 Who Can Delete Email Data

```typescript
/**
 * Delete Synced Email Data
 * Authorization: Org admin only (destructive action)
 */
app.delete('/api/mailboxes/:id/data', authenticateJWT, async (req, res) => {
  const mailboxId = req.params.id;
  const userId = req.user.id;

  // Verify user is admin in the org
  const mailbox = await db.query(
    `SELECT m.org_id, om.role
     FROM mailboxes m
     JOIN org_members om ON m.org_id = om.org_id
     WHERE m.id = $1 AND om.user_id = $2`,
    [mailboxId, userId]
  );

  if (!mailbox || !['owner', 'admin'].includes(mailbox.role)) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Only org admin can delete email data',
    });
  }

  // Require confirmation (two-step process)
  if (!req.body.confirmed) {
    return res.status(400).json({
      error: 'Confirmation required',
      message: 'Set confirmed: true to proceed with deletion',
    });
  }

  // Delete data (cascade will handle related records)
  await db.transaction(async (tx) => {
    // Delete attachments from storage
    const attachments = await tx.query(
      'SELECT storage_path FROM mail_attachments WHERE mailbox_id = $1',
      [mailboxId]
    );

    for (const att of attachments) {
      await supabase.storage
        .from('mail-attachments')
        .remove([att.storage_path]);
    }

    // Delete database records (cascade via FK)
    await tx.query('DELETE FROM mail_threads WHERE mailbox_id = $1', [mailboxId]);
    await tx.query('DELETE FROM mail_messages WHERE mailbox_id = $1', [mailboxId]);
    await tx.query('DELETE FROM mail_attachments WHERE mailbox_id = $1', [mailboxId]);

    // Keep mailbox record for audit trail (set status to disconnected)
    await tx.query(
      `UPDATE mailboxes
       SET status = 'disconnected',
           access_token_encrypted = NULL,
           refresh_token_encrypted = NULL,
           last_history_id = NULL,
           updated_at = NOW()
       WHERE id = $1`,
      [mailboxId]
    );
  });

  // Log deletion
  await auditLog.log({
    event_type: 'MAILBOX_DATA_DELETED',
    entity_type: 'mailbox',
    entity_id: mailboxId,
    actor_id: userId,
    actor_type: 'user',
    severity: 'high',
    payload: { reason: 'admin_requested' },
  });

  res.json({ success: true });
});
```

### 3.6 Service Role Restrictions

**Service role (backend system) has elevated permissions but MUST be restricted**

```typescript
// Service Role Usage Rules
const SERVICE_ROLE_RULES = {
  // ALLOWED: Background sync operations
  canSyncEmails: true,
  canRefreshTokens: true,
  canWriteAuditLogs: true,

  // FORBIDDEN: User-facing operations
  canReadEmailViaAPI: false, // Must use user JWT
  canDisconnectUserMailbox: false, // Requires user authorization
  canDeleteUserData: false, // Requires admin authorization

  // Logging: All service role actions MUST be logged
  auditAllActions: true,
};

/**
 * Service role authentication (backend only)
 */
const supabaseService = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY, // NEVER expose to frontend
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Gmail Sync Service (runs as service role)
 */
async function syncMailbox(mailboxId: string): Promise<void> {
  // Use service role client (bypasses RLS)
  const mailbox = await supabaseService
    .from('mailboxes')
    .select('*')
    .eq('id', mailboxId)
    .single();

  // ... sync logic ...

  // Log service action
  await auditLog.log({
    event_type: 'SYNC_COMPLETED',
    entity_type: 'mailbox',
    entity_id: mailboxId,
    actor_type: 'system', // Service role
    payload: {
      threads_synced: threadsCount,
      messages_synced: messagesCount,
    },
  });
}
```

---

## 4. Disconnect/Delete Requirements

### 4.1 Disconnect Mailbox Flow

**User-initiated disconnect (keeps synced data, stops future syncs)**

```typescript
/**
 * Disconnect Flow (Step-by-Step)
 */
async function disconnectMailboxFlow(
  mailboxId: string,
  userId: string
): Promise<void> {
  // Step 1: Verify authorization
  const canDisconnect = await canDisconnectMailbox(userId, mailboxId);
  if (!canDisconnect) {
    throw new Error('Unauthorized to disconnect this mailbox');
  }

  // Step 2: Revoke OAuth tokens with Google
  const mailbox = await db.query(
    'SELECT refresh_token_encrypted FROM mailboxes WHERE id = $1',
    [mailboxId]
  );

  if (mailbox.refresh_token_encrypted) {
    const encrypted = JSON.parse(mailbox.refresh_token_encrypted);
    const refreshToken = await decryptToken(
      encrypted,
      process.env.GMAIL_TOKEN_ENCRYPTION_KEY
    );

    // Revoke with Google (best effort)
    try {
      await fetch('https://oauth2.googleapis.com/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token: refreshToken }),
      });
    } catch (error) {
      logger.error('Google token revocation failed', {
        metadata: { mailbox_id: mailboxId },
      });
      // Continue with disconnect even if revocation fails
    }
  }

  // Step 3: Update mailbox status
  await db.query(
    `UPDATE mailboxes
     SET status = 'disconnected',
         access_token_encrypted = NULL,
         refresh_token_encrypted = NULL,
         token_expires_at = NULL,
         updated_at = NOW()
     WHERE id = $1`,
    [mailboxId]
  );

  // Step 4: Cancel any pending sync jobs
  await cancelSyncJob(mailboxId);

  // Step 5: Log disconnect event
  await auditLog.log({
    event_type: 'MAILBOX_DISCONNECTED',
    entity_type: 'mailbox',
    entity_id: mailboxId,
    actor_id: userId,
    actor_type: 'user',
    payload: {
      reason: 'user_requested',
      tokens_revoked: true,
    },
  });

  // Step 6: Notify user (email confirmation)
  await sendEmail(userId, {
    subject: 'Gmail Mailbox Disconnected',
    body: 'Your Gmail mailbox has been disconnected. Synced emails remain accessible. You can reconnect anytime.',
  });

  logger.info('Mailbox disconnected', {
    metadata: {
      mailbox_id: mailboxId,
      user_id: userId,
    },
  });
}
```

### 4.2 What Happens to Synced Data on Disconnect

**Retention Policy for Disconnected Mailboxes**

```typescript
// Data Retention After Disconnect
const DISCONNECT_RETENTION = {
  // Synced data retention
  keepSyncedData: true, // Threads, messages, attachments remain

  // OAuth tokens
  deleteTokens: true, // Tokens deleted immediately

  // Sync jobs
  cancelFutureSync: true, // No more syncs scheduled

  // Data access
  allowReadAccess: true, // Users can still view historical emails

  // Reconnection
  allowReconnect: true, // User can reconnect same mailbox

  // Auto-delete after period
  autoDeleteAfterDays: null, // No auto-delete (admin can manually delete)
};

/**
 * Query synced data after disconnect
 * ALLOWED: Users can view historical data even after disconnect
 */
app.get('/api/mailboxes/:id/threads', authenticateJWT, async (req, res) => {
  const mailboxId = req.params.id;

  // Verify user has access (org-scoped, RLS enforced)
  const threads = await db.query(
    `SELECT * FROM mail_threads
     WHERE mailbox_id = $1
     ORDER BY last_message_at DESC
     LIMIT 50`,
    [mailboxId]
  );

  // Works even if mailbox is disconnected
  res.json(threads);
});

/**
 * Reconnect mailbox (re-use existing mailbox record)
 */
async function reconnectMailbox(
  mailboxId: string,
  userId: string,
  newTokens: {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  }
): Promise<void> {
  // Verify user owns mailbox
  const mailbox = await db.query(
    'SELECT user_id, status FROM mailboxes WHERE id = $1',
    [mailboxId]
  );

  if (mailbox.user_id !== userId) {
    throw new Error('Unauthorized');
  }

  if (mailbox.status !== 'disconnected') {
    throw new Error('Mailbox is not disconnected');
  }

  // Encrypt new tokens
  const encryptedAccess = await encryptToken(
    newTokens.accessToken,
    process.env.GMAIL_TOKEN_ENCRYPTION_KEY
  );

  const encryptedRefresh = await encryptToken(
    newTokens.refreshToken,
    process.env.GMAIL_TOKEN_ENCRYPTION_KEY
  );

  // Update mailbox
  await db.query(
    `UPDATE mailboxes
     SET access_token_encrypted = $1,
         refresh_token_encrypted = $2,
         token_expires_at = $3,
         status = 'connected',
         updated_at = NOW()
     WHERE id = $4`,
    [
      JSON.stringify(encryptedAccess),
      JSON.stringify(encryptedRefresh),
      newTokens.expiresAt,
      mailboxId,
    ]
  );

  // Log reconnection
  await auditLog.log({
    event_type: 'MAILBOX_RECONNECTED',
    entity_type: 'mailbox',
    entity_id: mailboxId,
    actor_id: userId,
    actor_type: 'user',
  });

  // Resume sync (incremental from last_history_id)
  await scheduleSyncJob(mailboxId, 'incremental');
}
```

### 4.3 Data Retention Policy

```typescript
// Data Retention Configuration
const EMAIL_RETENTION_POLICY = {
  // Active mailbox (connected)
  activeMailbox: 'indefinite', // Keep all synced data

  // Disconnected mailbox
  disconnectedMailbox: 'indefinite', // Keep until admin deletes

  // Deleted mailbox (user-requested deletion)
  deletedMailbox: 30, // 30-day recovery window

  // Hard delete (permanent)
  hardDeleteAfter: 30, // Purge 30 days after soft delete

  // Compliance override (GDPR right to be forgotten)
  gdprDeleteRequest: 'immediate', // Hard delete immediately
};

/**
 * Soft Delete Mailbox (30-day recovery)
 */
async function softDeleteMailbox(
  mailboxId: string,
  userId: string
): Promise<void> {
  await db.query(
    `UPDATE mailboxes
     SET status = 'deleted',
         deleted_at = NOW(),
         deleted_by = $1
     WHERE id = $2`,
    [userId, mailboxId]
  );

  // Schedule hard delete after 30 days
  await scheduleHardDelete(mailboxId, 30);

  await auditLog.log({
    event_type: 'MAILBOX_SOFT_DELETED',
    entity_type: 'mailbox',
    entity_id: mailboxId,
    actor_id: userId,
    actor_type: 'user',
    payload: {
      recovery_window_days: 30,
    },
  });
}

/**
 * Hard Delete Mailbox (permanent, irreversible)
 */
async function hardDeleteMailbox(mailboxId: string): Promise<void> {
  // Verify recovery window has passed
  const mailbox = await db.query(
    'SELECT deleted_at FROM mailboxes WHERE id = $1',
    [mailboxId]
  );

  if (!mailbox.deleted_at) {
    throw new Error('Mailbox not soft deleted');
  }

  const daysSinceDeletion =
    (Date.now() - new Date(mailbox.deleted_at).getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceDeletion < EMAIL_RETENTION_POLICY.deletedMailbox) {
    throw new Error('Recovery window not expired');
  }

  // Delete all associated data
  await db.transaction(async (tx) => {
    // Delete attachments from storage
    const attachments = await tx.query(
      'SELECT storage_path FROM mail_attachments WHERE mailbox_id = $1',
      [mailboxId]
    );

    for (const att of attachments) {
      await supabase.storage
        .from('mail-attachments')
        .remove([att.storage_path]);
    }

    // Delete database records (cascade)
    await tx.query('DELETE FROM mail_threads WHERE mailbox_id = $1', [mailboxId]);
    await tx.query('DELETE FROM mail_messages WHERE mailbox_id = $1', [mailboxId]);
    await tx.query('DELETE FROM mail_attachments WHERE mailbox_id = $1', [mailboxId]);
    await tx.query('DELETE FROM record_links WHERE source_type = $1 AND source_id IN (SELECT id FROM mail_messages WHERE mailbox_id = $2)', ['message', mailboxId]);

    // Delete mailbox record
    await tx.query('DELETE FROM mailboxes WHERE id = $1', [mailboxId]);
  });

  // Log permanent deletion
  await auditLog.log({
    event_type: 'MAILBOX_PURGED',
    entity_type: 'mailbox',
    entity_id: mailboxId,
    actor_type: 'system',
    severity: 'high',
    payload: {
      reason: 'retention_policy',
    },
  });
}
```

### 4.4 GDPR Right to Delete

```typescript
/**
 * GDPR Right to be Forgotten (immediate hard delete)
 */
async function gdprDeleteMailbox(
  mailboxId: string,
  userId: string
): Promise<void> {
  // Verify user owns mailbox
  const mailbox = await db.query(
    'SELECT user_id FROM mailboxes WHERE id = $1',
    [mailboxId]
  );

  if (mailbox.user_id !== userId) {
    throw new Error('Unauthorized');
  }

  // Immediate hard delete (no recovery window)
  await db.transaction(async (tx) => {
    // Delete attachments from storage
    const attachments = await tx.query(
      'SELECT storage_path FROM mail_attachments WHERE mailbox_id = $1',
      [mailboxId]
    );

    for (const att of attachments) {
      await supabase.storage
        .from('mail-attachments')
        .remove([att.storage_path]);
    }

    // Delete all data
    await tx.query('DELETE FROM mail_threads WHERE mailbox_id = $1', [mailboxId]);
    await tx.query('DELETE FROM mail_messages WHERE mailbox_id = $1', [mailboxId]);
    await tx.query('DELETE FROM mail_attachments WHERE mailbox_id = $1', [mailboxId]);
    await tx.query('DELETE FROM mailboxes WHERE id = $1', [mailboxId]);
  });

  // Log GDPR deletion (retain for compliance)
  await auditLog.log({
    event_type: 'GDPR_DELETE_REQUEST',
    entity_type: 'mailbox',
    entity_id: mailboxId,
    actor_id: userId,
    actor_type: 'user',
    severity: 'high',
    payload: {
      reason: 'gdpr_right_to_be_forgotten',
      deletion_type: 'immediate_hard_delete',
    },
  });

  logger.info('GDPR deletion completed', {
    metadata: {
      mailbox_id: mailboxId,
      user_id: userId,
    },
  });
}
```

---

## 5. Rate Limiting

### 5.1 Gmail API Quota Awareness

**Gmail API Quotas (as of 2025):**

```typescript
// Gmail API Quotas (per project, per day)
const GMAIL_QUOTAS = {
  // Free tier (default)
  quotaPerDay: 1_000_000_000, // 1 billion quota units/day
  quotaPerUser: 250, // Per user per second

  // Specific operations (cost in quota units)
  listMessages: 5, // messages.list
  getMessage: 5, // messages.get
  batchGet: 2, // Per message in batch (max 100 per request)
  modifyMessage: 5, // messages.modify
  sendMessage: 100, // messages.send (out of scope for Sprint 0.2)
  listHistory: 2, // history.list
  getProfile: 2, // users.getProfile

  // Batch request limits
  batchMaxRequests: 100, // Max 100 requests per batch
  batchMaxSizeBytes: 10_485_760, // 10 MB max batch size
};

// Rate Limit Configuration
const RATE_LIMIT_CONFIG = {
  // Per-user rate limit (Gmail API limit: 250 qps/user)
  perUserQPS: 200, // Conservative limit (buffer for spikes)

  // Per-project rate limit (total across all users)
  perProjectQPS: 1000, // Adjust based on expected user count

  // Backoff strategy for quota errors
  initialBackoffMs: 1000, // 1 second
  maxBackoffMs: 60000, // 60 seconds
  backoffMultiplier: 2, // Exponential backoff

  // Sync batch size (messages per sync)
  syncBatchSize: 50, // Fetch 50 messages per API call

  // Incremental sync interval
  incrementalSyncIntervalMs: 300000, // 5 minutes
};
```

### 5.2 Per-User Rate Limits

```typescript
/**
 * Rate limiter for Gmail API calls (per user)
 */
class GmailRateLimiter {
  private userTokens: Map<string, { tokens: number; lastRefill: number }> =
    new Map();

  private readonly tokensPerSecond = RATE_LIMIT_CONFIG.perUserQPS;
  private readonly maxTokens = this.tokensPerSecond * 10; // 10-second burst

  /**
   * Acquire token for API call (blocks until available)
   */
  async acquire(userId: string): Promise<void> {
    const now = Date.now();
    let bucket = this.userTokens.get(userId);

    if (!bucket) {
      bucket = { tokens: this.maxTokens, lastRefill: now };
      this.userTokens.set(userId, bucket);
    }

    // Refill tokens based on time elapsed
    const elapsedSeconds = (now - bucket.lastRefill) / 1000;
    bucket.tokens = Math.min(
      this.maxTokens,
      bucket.tokens + elapsedSeconds * this.tokensPerSecond
    );
    bucket.lastRefill = now;

    // Wait if no tokens available
    if (bucket.tokens < 1) {
      const waitMs = ((1 - bucket.tokens) / this.tokensPerSecond) * 1000;
      await new Promise(resolve => setTimeout(resolve, waitMs));
      bucket.tokens = 1;
    }

    // Consume token
    bucket.tokens -= 1;
  }
}

const rateLimiter = new GmailRateLimiter();

/**
 * Gmail API client with rate limiting
 */
class GmailClient {
  private accessToken: string;
  private userId: string;

  constructor(accessToken: string, userId: string) {
    this.accessToken = accessToken;
    this.userId = userId;
  }

  /**
   * Call Gmail API with automatic rate limiting
   */
  async call(
    endpoint: string,
    options?: RequestInit
  ): Promise<any> {
    // Acquire rate limit token
    await rateLimiter.acquire(this.userId);

    // Make API call
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/${endpoint}`,
      {
        ...options,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      }
    );

    // Handle quota exceeded error
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const waitMs = retryAfter
        ? parseInt(retryAfter) * 1000
        : RATE_LIMIT_CONFIG.initialBackoffMs;

      logger.warn('Gmail API quota exceeded', {
        metadata: {
          user_id: this.userId,
          endpoint,
          retry_after_ms: waitMs,
        },
      });

      // Wait and retry
      await new Promise(resolve => setTimeout(resolve, waitMs));
      return this.call(endpoint, options);
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gmail API error: ${error.error?.message || 'Unknown'}`);
    }

    return response.json();
  }

  /**
   * List messages (with pagination)
   */
  async listMessages(query?: {
    q?: string;
    labelIds?: string[];
    maxResults?: number;
    pageToken?: string;
  }): Promise<{ messages: any[]; nextPageToken?: string }> {
    const params = new URLSearchParams();
    if (query?.q) params.set('q', query.q);
    if (query?.labelIds) params.set('labelIds', query.labelIds.join(','));
    if (query?.maxResults) params.set('maxResults', query.maxResults.toString());
    if (query?.pageToken) params.set('pageToken', query.pageToken);

    return this.call(`users/me/messages?${params.toString()}`);
  }

  /**
   * Get message details (batch)
   */
  async batchGetMessages(messageIds: string[]): Promise<any[]> {
    if (messageIds.length > GMAIL_QUOTAS.batchMaxRequests) {
      throw new Error('Batch size exceeds maximum (100)');
    }

    // Build batch request
    const boundary = '===============' + Math.random().toString(36).substring(7);
    const batchBody = messageIds
      .map(
        (id, index) =>
          `--${boundary}\r\n` +
          `Content-Type: application/http\r\n` +
          `Content-ID: <item${index}>\r\n\r\n` +
          `GET /gmail/v1/users/me/messages/${id}?format=full\r\n\r\n`
      )
      .join('') + `--${boundary}--`;

    // Acquire rate limit token (single batch = 1 token)
    await rateLimiter.acquire(this.userId);

    const response = await fetch('https://gmail.googleapis.com/batch/gmail/v1', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': `multipart/mixed; boundary=${boundary}`,
      },
      body: batchBody,
    });

    if (!response.ok) {
      throw new Error('Batch request failed');
    }

    // Parse batch response
    const text = await response.text();
    const parts = text.split(/--batch_[\w-]+/);
    const messages = parts
      .filter(part => part.includes('HTTP/1.1 200'))
      .map(part => {
        const jsonStart = part.indexOf('{');
        return JSON.parse(part.substring(jsonStart));
      });

    return messages;
  }

  /**
   * List history (incremental sync)
   */
  async listHistory(startHistoryId: string): Promise<{
    history: any[];
    historyId: string;
  }> {
    return this.call(
      `users/me/history?startHistoryId=${startHistoryId}&historyTypes=messageAdded&historyTypes=messageDeleted`
    );
  }
}
```

### 5.3 Backoff Strategies

```typescript
/**
 * Exponential backoff for retries
 */
class ExponentialBackoff {
  private attempt = 0;
  private readonly maxAttempts = 5;
  private readonly initialDelayMs = RATE_LIMIT_CONFIG.initialBackoffMs;
  private readonly maxDelayMs = RATE_LIMIT_CONFIG.maxBackoffMs;
  private readonly multiplier = RATE_LIMIT_CONFIG.backoffMultiplier;

  /**
   * Execute function with exponential backoff
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    while (this.attempt < this.maxAttempts) {
      try {
        return await fn();
      } catch (error) {
        this.attempt++;

        if (this.attempt >= this.maxAttempts) {
          throw new Error(`Max retries (${this.maxAttempts}) exceeded: ${error.message}`);
        }

        // Calculate delay with jitter
        const delay = Math.min(
          this.initialDelayMs * Math.pow(this.multiplier, this.attempt - 1),
          this.maxDelayMs
        );
        const jitter = Math.random() * 0.3 * delay; // 30% jitter
        const waitMs = delay + jitter;

        logger.warn('Retrying with backoff', {
          metadata: {
            attempt: this.attempt,
            max_attempts: this.maxAttempts,
            wait_ms: Math.round(waitMs),
            error: error.message,
          },
        });

        await new Promise(resolve => setTimeout(resolve, waitMs));
      }
    }

    throw new Error('Unreachable');
  }
}

/**
 * Sync messages with backoff
 */
async function syncMessages(mailboxId: string): Promise<void> {
  const backoff = new ExponentialBackoff();

  await backoff.execute(async () => {
    const accessToken = await getValidAccessToken(mailboxId);
    const userId = (await db.query('SELECT user_id FROM mailboxes WHERE id = $1', [mailboxId])).user_id;

    const gmail = new GmailClient(accessToken, userId);

    // Fetch messages
    const result = await gmail.listMessages({
      maxResults: RATE_LIMIT_CONFIG.syncBatchSize,
    });

    // Process messages
    for (const message of result.messages) {
      await ingestMessage(mailboxId, message.id);
    }
  });
}
```

---

## 6. Logging Rules

### 6.1 What to Log

**REQUIRED Logging Events**

```typescript
// Required Gmail Audit Events
const REQUIRED_AUDIT_EVENTS = {
  // Connection lifecycle
  MAILBOX_CONNECTED: {
    payload: ['mailbox_id', 'provider_email_redacted', 'oauth_scopes'],
  },
  MAILBOX_DISCONNECTED: {
    payload: ['mailbox_id', 'reason', 'tokens_revoked'],
  },
  MAILBOX_TOKEN_REFRESHED: {
    payload: ['mailbox_id', 'expires_at'],
  },
  MAILBOX_TOKEN_REVOKED: {
    payload: ['mailbox_id', 'reason'],
  },

  // Sync operations
  SYNC_STARTED: {
    payload: ['mailbox_id', 'sync_type', 'last_history_id'],
  },
  SYNC_COMPLETED: {
    payload: ['mailbox_id', 'threads_synced', 'messages_synced', 'duration_ms'],
  },
  SYNC_FAILED: {
    payload: ['mailbox_id', 'error_code', 'error_message_sanitized'],
  },

  // Data ingestion
  THREAD_INGESTED: {
    payload: ['thread_id', 'provider_thread_id', 'message_count'],
  },
  MESSAGE_INGESTED: {
    payload: ['message_id', 'thread_id', 'provider_message_id', 'has_attachments'],
  },
  ATTACHMENT_SAVED: {
    payload: ['attachment_id', 'message_id', 'filename', 'mime_type', 'size_bytes', 'sha256'],
  },

  // User actions
  EMAIL_VIEWED: {
    payload: ['message_id', 'thread_id'],
  },
  EMAIL_AUTO_ATTACHED: {
    payload: ['link_id', 'source_type', 'source_id', 'target_type', 'target_id', 'rule_name', 'confidence'],
  },
  EMAIL_MANUALLY_ATTACHED: {
    payload: ['link_id', 'source_type', 'source_id', 'target_type', 'target_id'],
  },
  EMAIL_UNLINKED: {
    payload: ['link_id', 'reason'],
  },
  ATTACHMENT_ACCESSED: {
    payload: ['attachment_id', 'action'],
  },

  // Data deletion
  MAILBOX_DATA_DELETED: {
    payload: ['mailbox_id', 'reason'],
  },
  MAILBOX_SOFT_DELETED: {
    payload: ['mailbox_id', 'recovery_window_days'],
  },
  MAILBOX_PURGED: {
    payload: ['mailbox_id', 'reason'],
  },
  GDPR_DELETE_REQUEST: {
    payload: ['mailbox_id', 'reason', 'deletion_type'],
  },

  // Errors
  GMAIL_API_ERROR: {
    payload: ['mailbox_id', 'endpoint', 'error_code', 'http_status'],
  },
  GMAIL_QUOTA_EXCEEDED: {
    payload: ['mailbox_id', 'operation', 'retry_after_ms'],
  },

  // Security incidents
  SECURITY_INCIDENT_TOKEN_LEAK: {
    payload: ['mailbox_id', 'incident_type', 'response_action'],
    severity: 'critical',
  },
  UNAUTHORIZED_ACCESS_ATTEMPT: {
    payload: ['mailbox_id', 'user_id', 'action_attempted'],
    severity: 'high',
  },
};
```

### 6.2 What NOT to Log

**FORBIDDEN in All Logs**

```typescript
// NEVER log these fields
const FORBIDDEN_LOG_FIELDS = [
  // OAuth tokens
  'access_token',
  'refresh_token',
  'authorization_code',

  // Email content
  'body_plain',
  'body_html',
  'snippet', // May contain PII

  // Full PII
  'from_email', // Use redacted version
  'to_emails',
  'cc_emails',
  'bcc_emails',
  'participant_emails',
  'subject', // Use truncated version

  // Attachment content
  'file_content',
  'attachment_data',

  // Headers
  'raw_headers', // May contain sensitive routing info

  // Encryption keys
  'encryption_key',
  'master_key',
];

// Validation function (run in CI/CD)
function validateLogStatement(code: string): { valid: boolean; violations: string[] } {
  const violations: string[] = [];

  FORBIDDEN_LOG_FIELDS.forEach(field => {
    const regex = new RegExp(`(logger|console)\\.(log|info|warn|error|debug).*${field}`, 'i');
    if (regex.test(code)) {
      violations.push(`Forbidden field "${field}" found in log statement`);
    }
  });

  return {
    valid: violations.length === 0,
    violations,
  };
}
```

### 6.3 Log Retention Period

```typescript
// Log Retention Configuration
const LOG_RETENTION = {
  // Audit ledger (compliance requirement)
  auditLogs: 2555, // 7 years (SOX, GDPR)

  // Application logs
  applicationLogs: 90, // 90 days

  // Error logs
  errorLogs: 180, // 6 months

  // Access logs
  accessLogs: 365, // 1 year

  // Security incident logs
  securityLogs: 2555, // 7 years

  // Debug logs
  debugLogs: 7, // 7 days (not in production)
};

// Log rotation (daily)
// - Application logs: Rotate daily, compress, delete after 90 days
// - Audit logs: Retain in database (indexed), archive after 2 years
```

### 6.4 Audit Log Access Controls

```typescript
/**
 * Who can access audit logs
 */
const AUDIT_LOG_ACCESS = {
  // View audit logs
  'audit.read': ['owner', 'admin'],

  // Export audit logs
  'audit.export': ['owner'],

  // Search audit logs
  'audit.search': ['owner', 'admin'],

  // View security incidents
  'audit.security': ['owner', 'admin'],
};

/**
 * API Endpoint: Query Audit Logs
 */
app.get('/api/audit/gmail', authenticateJWT, async (req, res) => {
  // Check permission
  if (!AUDIT_LOG_ACCESS['audit.read'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Query audit logs (org-scoped)
  const logs = await db.query(
    `SELECT *
     FROM audit_ledger
     WHERE org_id = $1
     AND event_type LIKE 'MAILBOX_%' OR event_type LIKE 'EMAIL_%'
     ORDER BY created_at DESC
     LIMIT 100`,
    [req.user.org_id]
  );

  res.json(logs);
});
```

---

## 7. Incident Response

### 7.1 Token Leak Response Procedure

**See Section 1.4 for detailed procedure**

**Summary:**
1. Revoke all affected tokens immediately
2. Mark mailboxes as requiring re-authentication
3. Log security incident
4. Notify affected users
5. Rotate encryption keys (if needed)
6. Alert security team

### 7.2 Unauthorized Access Detection

```typescript
/**
 * Detect anomalous access patterns
 */
async function detectAnomalousEmailAccess(
  userId: string,
  orgId: string
): Promise<boolean> {
  // Detect bulk email viewing (possible data exfiltration)
  const recentViews = await db.query(
    `SELECT COUNT(*) as count
     FROM audit_ledger
     WHERE actor_id = $1
     AND org_id = $2
     AND event_type = 'EMAIL_VIEWED'
     AND created_at > NOW() - INTERVAL '10 minutes'`,
    [userId, orgId]
  );

  // Alert if >50 emails viewed in 10 minutes
  if (recentViews.count > 50) {
    await auditLog.log({
      event_type: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      entity_type: 'user',
      entity_id: userId,
      actor_type: 'system',
      severity: 'high',
      payload: {
        anomaly_type: 'bulk_email_access',
        email_count: recentViews.count,
        time_window_minutes: 10,
      },
    });

    // Notify admin
    await sendSecurityAlert({
      type: 'anomalous_email_access',
      user_id: userId,
      org_id: orgId,
      email_count: recentViews.count,
    });

    return true;
  }

  // Detect access from unusual IP
  const userIPs = await db.query(
    `SELECT DISTINCT ip_address
     FROM audit_ledger
     WHERE actor_id = $1
     AND created_at > NOW() - INTERVAL '30 days'`,
    [userId]
  );

  const currentIP = getCurrentRequestIP();
  if (!userIPs.some(ip => ip === currentIP)) {
    logger.warn('Email access from new IP', {
      metadata: {
        user_id: userId,
        ip_redacted: piiRedactor.redactIP(currentIP),
      },
    });

    // Consider requiring MFA verification for new IPs
  }

  return false;
}
```

### 7.3 User Notification Requirements

```typescript
/**
 * Notify user of security events
 */
async function notifySecurityEvent(
  userId: string,
  event: {
    type: 'token_leak' | 'unauthorized_access' | 'mailbox_disconnected';
    severity: 'low' | 'medium' | 'high' | 'critical';
    details: string;
  }
): Promise<void> {
  const user = await db.query('SELECT email FROM users WHERE id = $1', [userId]);

  // Send email notification
  await sendEmail(user.email, {
    subject: `Security Alert: ${event.type}`,
    body: `
      We detected a security event related to your Gmail integration:

      Type: ${event.type}
      Severity: ${event.severity}
      Details: ${event.details}

      If you did not initiate this action, please contact support immediately.

      REIL/Q Security Team
    `,
    priority: event.severity === 'critical' ? 'urgent' : 'normal',
  });

  // Log notification
  await auditLog.log({
    event_type: 'SECURITY_NOTIFICATION_SENT',
    entity_type: 'user',
    entity_id: userId,
    actor_type: 'system',
    payload: {
      notification_type: event.type,
      severity: event.severity,
    },
  });
}
```

---

## 8. Backend Implementation Checklist

### 8.1 Pre-Deployment Security Checklist

**REQUIRED: All items MUST be checked before production deployment**

```typescript
// Security Checklist for Backend Team
const GMAIL_SECURITY_CHECKLIST = [
  // OAuth Token Security
  {
    id: 'SEC-001',
    requirement: 'Tokens encrypted at rest using AES-256-GCM',
    status: 'pending', // 'pending' | 'complete' | 'blocked'
    verification: 'Code review + unit tests',
  },
  {
    id: 'SEC-002',
    requirement: 'Encryption key stored in secure secret manager (not in code)',
    status: 'pending',
    verification: 'Environment variable audit',
  },
  {
    id: 'SEC-003',
    requirement: 'Tokens NEVER logged (even in debug mode)',
    status: 'pending',
    verification: 'Code scan + pre-commit hooks',
  },
  {
    id: 'SEC-004',
    requirement: 'Refresh token rotation implemented',
    status: 'pending',
    verification: 'Integration tests',
  },
  {
    id: 'SEC-005',
    requirement: 'Token revocation handled (user + Google-initiated)',
    status: 'pending',
    verification: 'Integration tests',
  },

  // PII Handling
  {
    id: 'SEC-006',
    requirement: 'Email bodies NEVER logged',
    status: 'pending',
    verification: 'Code scan + log review',
  },
  {
    id: 'SEC-007',
    requirement: 'Email addresses redacted in logs',
    status: 'pending',
    verification: 'Log sample review',
  },
  {
    id: 'SEC-008',
    requirement: 'PII redacted in error messages',
    status: 'pending',
    verification: 'Error handling tests',
  },
  {
    id: 'SEC-009',
    requirement: 'Subjects truncated/redacted in logs',
    status: 'pending',
    verification: 'Log sample review',
  },

  // Attachments
  {
    id: 'SEC-010',
    requirement: 'Virus scanning implemented for all attachments',
    status: 'pending',
    verification: 'Integration tests + malware test samples',
  },
  {
    id: 'SEC-011',
    requirement: 'Content type validation (MIME type check)',
    status: 'pending',
    verification: 'Unit tests',
  },
  {
    id: 'SEC-012',
    requirement: 'Forbidden file extensions blocked',
    status: 'pending',
    verification: 'Unit tests',
  },
  {
    id: 'SEC-013',
    requirement: 'Attachments stored with signed URLs (not public)',
    status: 'pending',
    verification: 'Storage configuration review',
  },

  // Access Controls
  {
    id: 'SEC-014',
    requirement: 'RLS policies enabled on all email tables',
    status: 'pending',
    verification: 'Database schema review + RLS tests',
  },
  {
    id: 'SEC-015',
    requirement: 'Org isolation enforced (multi-tenancy)',
    status: 'pending',
    verification: 'Integration tests (cross-org access attempts)',
  },
  {
    id: 'SEC-016',
    requirement: 'RBAC permissions enforced (viewer, member, admin, owner)',
    status: 'pending',
    verification: 'Permission tests',
  },
  {
    id: 'SEC-017',
    requirement: 'Service role restricted (audit all actions)',
    status: 'pending',
    verification: 'Service role usage audit',
  },

  // Data Lifecycle
  {
    id: 'SEC-018',
    requirement: 'Disconnect flow implemented (revoke tokens, cancel sync)',
    status: 'pending',
    verification: 'Integration tests',
  },
  {
    id: 'SEC-019',
    requirement: 'Data retention policy implemented (30-day recovery)',
    status: 'pending',
    verification: 'Soft delete tests',
  },
  {
    id: 'SEC-020',
    requirement: 'GDPR right-to-delete supported (immediate hard delete)',
    status: 'pending',
    verification: 'GDPR compliance tests',
  },

  // Rate Limiting
  {
    id: 'SEC-021',
    requirement: 'Gmail API rate limiting implemented (per-user)',
    status: 'pending',
    verification: 'Load tests + quota monitoring',
  },
  {
    id: 'SEC-022',
    requirement: 'Exponential backoff for retries',
    status: 'pending',
    verification: 'Retry tests',
  },
  {
    id: 'SEC-023',
    requirement: 'Quota monitoring and alerts',
    status: 'pending',
    verification: 'Monitoring dashboard',
  },

  // Logging & Audit
  {
    id: 'SEC-024',
    requirement: 'All Gmail operations logged to audit ledger',
    status: 'pending',
    verification: 'Audit log completeness check',
  },
  {
    id: 'SEC-025',
    requirement: 'Forbidden fields NEVER in logs (tokens, bodies, full emails)',
    status: 'pending',
    verification: 'Log validation script',
  },
  {
    id: 'SEC-026',
    requirement: 'Audit logs retained for 7 years',
    status: 'pending',
    verification: 'Database retention policy',
  },
  {
    id: 'SEC-027',
    requirement: 'Security incidents logged and alerted',
    status: 'pending',
    verification: 'Security alert tests',
  },

  // Incident Response
  {
    id: 'SEC-028',
    requirement: 'Token leak response procedure documented',
    status: 'pending',
    verification: 'Runbook review',
  },
  {
    id: 'SEC-029',
    requirement: 'Unauthorized access detection implemented',
    status: 'pending',
    verification: 'Anomaly detection tests',
  },
  {
    id: 'SEC-030',
    requirement: 'User notification system for security events',
    status: 'pending',
    verification: 'Notification tests',
  },

  // Testing
  {
    id: 'SEC-031',
    requirement: 'Security tests included in CI/CD',
    status: 'pending',
    verification: 'CI/CD pipeline review',
  },
  {
    id: 'SEC-032',
    requirement: 'Pre-commit hooks scan for tokens/PII',
    status: 'pending',
    verification: 'Pre-commit hook tests',
  },
  {
    id: 'SEC-033',
    requirement: 'Dependency vulnerability scan passes (npm audit)',
    status: 'pending',
    verification: 'CI/CD security scan',
  },
];

/**
 * Generate checklist status report
 */
function generateChecklistReport(): {
  total: number;
  complete: number;
  pending: number;
  blocked: number;
  readyForProduction: boolean;
} {
  const total = GMAIL_SECURITY_CHECKLIST.length;
  const complete = GMAIL_SECURITY_CHECKLIST.filter(item => item.status === 'complete').length;
  const pending = GMAIL_SECURITY_CHECKLIST.filter(item => item.status === 'pending').length;
  const blocked = GMAIL_SECURITY_CHECKLIST.filter(item => item.status === 'blocked').length;

  return {
    total,
    complete,
    pending,
    blocked,
    readyForProduction: pending === 0 && blocked === 0,
  };
}
```

### 8.2 CI/CD Security Gates

```yaml
# .github/workflows/gmail-security-check.yml
name: Gmail Security Check

on: [pull_request]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # 1. Secret scanning
      - name: Scan for secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
          head: HEAD

      # 2. PII logging detection
      - name: Check for PII in logs
        run: |
          # Search for console.log with forbidden fields
          if grep -r "console\.log.*\(access_token\|refresh_token\|body_plain\|body_html\|from_email\)" src/; then
            echo "ERROR: Forbidden PII logging detected"
            exit 1
          fi

      # 3. Token encryption validation
      - name: Verify token encryption
        run: |
          # Ensure tokens are encrypted before storage
          if grep -r "access_token:" src/ | grep -v "access_token_encrypted"; then
            echo "ERROR: Plaintext token storage detected"
            exit 1
          fi

      # 4. Dependency vulnerabilities
      - name: npm audit
        run: |
          npm audit --audit-level=high

      # 5. RLS policy check
      - name: Verify RLS policies
        run: |
          # Check that RLS is enabled on email tables
          if ! grep -q "ALTER TABLE mailboxes ENABLE ROW LEVEL SECURITY" migrations/; then
            echo "ERROR: RLS not enabled on mailboxes table"
            exit 1
          fi

      # 6. Checklist validation
      - name: Security checklist
        run: |
          # Ensure checklist is complete
          npm run security:checklist
```

---

## 9. Summary

### 9.1 Critical Requirements (MUST-HAVE for Production)

1. **OAuth tokens encrypted at rest** using AES-256-GCM
2. **Email bodies NEVER logged** in any logs
3. **PII redacted** in all logs and error messages
4. **Disconnect flow** implemented with token revocation
5. **Rate limiting** enforced to prevent Gmail API quota exhaustion
6. **Audit events** logged for all Gmail operations
7. **RLS policies** enabled for multi-tenant isolation
8. **Virus scanning** for all attachments
9. **GDPR right-to-delete** supported
10. **Security checklist** 100% complete

### 9.2 Compliance Summary

| Regulation | Requirement | Implementation |
|------------|-------------|----------------|
| **GDPR** | Right to be forgotten | Immediate hard delete API |
| **GDPR** | Data portability | Export API with JSON/CSV |
| **GDPR** | Data breach notification | 72-hour incident response |
| **CCPA** | Data access request | Export API |
| **SOX** | Audit trail retention | 7-year audit log retention |
| **Gmail API Terms** | Quota compliance | Rate limiting + monitoring |
| **OAuth 2.0 Best Practices** | Token security | Encrypted storage, rotation |

### 9.3 Next Steps

1. **Backend Team**: Review and implement checklist items (SEC-001 to SEC-033)
2. **QA Team**: Create test cases for security requirements
3. **DevOps Team**: Configure CI/CD security gates
4. **Security Team**: Conduct pre-production security audit
5. **Legal Team**: Review compliance with Gmail API Terms of Service

---

## Document Revision History

| Version | Date       | Author                    | Changes                          |
|---------|------------|---------------------------|----------------------------------|
| 1.0.0   | 2025-12-31 | saas-security-auditor     | Initial Gmail security baseline  |

---

**Next Review Date:** 2026-01-31 (Monthly review required during beta)

**Approval Required From:**
- [ ] Backend Lead
- [ ] Security Lead
- [ ] Legal/Compliance Team
- [ ] Project Orchestrator

---

**END OF DOCUMENT**
