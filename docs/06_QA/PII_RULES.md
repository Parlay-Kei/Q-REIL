# PII Handling Rules - REIL/Q Platform

**Version:** 1.0.0
**Last Updated:** 2025-12-31
**Owner:** Lane 6 - QA + Security
**Status:** Active

## Document Purpose

This document defines Personally Identifiable Information (PII) handling requirements for the REIL/Q platform. Compliance with these rules is MANDATORY to meet GDPR, CCPA, and industry regulations.

**Violation of these rules may result in:**
- Legal penalties (up to 4% of annual revenue under GDPR)
- Reputational damage
- Loss of customer trust
- Code review rejection and deployment blocks

---

## 1. PII Definition

**Personally Identifiable Information (PII)** is any data that can be used to identify, contact, or locate a specific individual, either alone or when combined with other information.

**PII Categories:**

1. **Direct Identifiers:** Uniquely identify an individual
   - Full name
   - Email address
   - Phone number
   - Social Security Number (SSN)
   - Driver's license number
   - Passport number

2. **Quasi-Identifiers:** Can identify an individual when combined
   - Street address
   - City + ZIP code
   - Date of birth
   - IP address
   - Device identifiers

3. **Sensitive PII:** Requires additional protection
   - SSN, tax ID
   - Financial account numbers
   - Medical information
   - Biometric data (fingerprints, facial recognition)
   - Credentials (passwords, API keys)

---

## 2. PII Field Inventory

### 2.1 User Entity

**Table:** `users`

| Field Name      | PII Type           | Sensitivity | Encryption at Rest | Mask in Logs | Mask in UI |
|-----------------|-----------------------|-------------|--------------------|--------------|----- ------|
| `id`            | N/A (UUID)            | Low         | No                 | No           | No         |
| `email`         | Direct Identifier     | High        | No                 | **Yes**      | Partial    |
| `full_name`     | Direct Identifier     | Medium      | No                 | **Yes**      | No         |
| `phone`         | Direct Identifier     | Medium      | No                 | **Yes**      | Partial    |
| `created_at`    | N/A                   | Low         | No                 | No           | No         |
| `last_login_at` | Behavioral            | Low         | No                 | No           | No         |

**Masking Examples:**
- Email: `john.doe@example.com` → `j***e@example.com`
- Phone: `+1-555-123-4567` → `+1-***-***-4567`

### 2.2 Contact Entity

**Table:** `contacts`

| Field Name        | PII Type           | Sensitivity | Encryption at Rest | Mask in Logs | Mask in UI |
|-------------------|-----------------------|-------------|--------------------|--------------|----- ------|
| `id`              | N/A (UUID)            | Low         | No                 | No           | No         |
| `org_id`          | N/A (UUID)            | Low         | No                 | No           | No         |
| `first_name`      | Direct Identifier     | Medium      | No                 | **Yes**      | No         |
| `last_name`       | Direct Identifier     | Medium      | No                 | **Yes**      | No         |
| `email`           | Direct Identifier     | High        | No                 | **Yes**      | Partial    |
| `phone_primary`   | Direct Identifier     | Medium      | No                 | **Yes**      | Partial    |
| `phone_secondary` | Direct Identifier     | Medium      | No                 | **Yes**      | Partial    |
| `address_line1`   | Quasi-Identifier      | Medium      | No                 | **Yes**      | No         |
| `address_line2`   | Quasi-Identifier      | Low         | No                 | **Yes**      | No         |
| `city`            | Quasi-Identifier      | Low         | No                 | No           | No         |
| `state`           | Quasi-Identifier      | Low         | No                 | No           | No         |
| `zip`             | Quasi-Identifier      | Low         | No                 | No           | No         |
| `ssn`             | **Sensitive PII**     | **Critical**| **Yes**            | **Yes**      | **Yes**    |
| `date_of_birth`   | Quasi-Identifier      | Medium      | No                 | **Yes**      | Partial    |

**Masking Examples:**
- SSN: `123-45-6789` → `***-**-6789`
- Date of Birth: `1985-06-15` → `****-**-15` (show day only)

### 2.3 Deal Entity

**Table:** `deals`

| Field Name          | PII Type           | Sensitivity | Encryption at Rest | Mask in Logs | Mask in UI |
|---------------------|--------------------|-------------|--------------------|--------------|----- ------|
| `id`                | N/A (UUID)         | Low         | No                 | No           | No         |
| `org_id`            | N/A (UUID)         | Low         | No                 | No           | No         |
| `address`           | Quasi-Identifier   | Medium      | No                 | **Yes**      | No         |
| `city`              | Quasi-Identifier   | Low         | No                 | No           | No         |
| `state`             | Quasi-Identifier   | Low         | No                 | No           | No         |
| `zip`               | Quasi-Identifier   | Low         | No                 | No           | No         |
| `purchase_price`    | Financial Data     | Medium      | No                 | **Yes**      | No         |
| `commission_amount` | Financial Data     | Medium      | No                 | **Yes**      | No         |
| `buyer_name`        | Direct Identifier  | Medium      | No                 | **Yes**      | No         |
| `seller_name`       | Direct Identifier  | Medium      | No                 | **Yes**      | No         |
| `listing_agent_id`  | N/A (UUID ref)     | Low         | No                 | No           | No         |
| `buyer_agent_id`    | N/A (UUID ref)     | Low         | No                 | No           | No         |

**Masking Examples:**
- Purchase Price: `$450,000` → `$***,***`
- Address: `123 Main St` → `*** Main St`

### 2.4 Document Entity

**Table:** `documents`

| Field Name       | PII Type           | Sensitivity | Encryption at Rest | Mask in Logs | Mask in UI |
|------------------|--------------------|-------------|--------------------|--------------|----- ------|
| `id`             | N/A (UUID)         | Low         | No                 | No           | No         |
| `org_id`         | N/A (UUID)         | Low         | No                 | No           | No         |
| `file_name`      | Metadata           | Low         | No                 | No           | No         |
| `file_content`   | **May Contain PII**| **High**    | **Yes** (Supabase) | **Never Log**| N/A        |
| `extracted_text` | **May Contain PII**| **High**    | No                 | **Never Log**| N/A        |
| `file_url`       | Metadata           | Low         | No                 | No           | No         |
| `uploaded_by`    | N/A (UUID ref)     | Low         | No                 | No           | No         |

**Special Handling:**
- NEVER log `file_content` or `extracted_text`
- Use signed URLs with expiration for downloads
- Scan extracted text for PII before logging errors

### 2.5 Message Entity

**Table:** `messages`

| Field Name      | PII Type           | Sensitivity | Encryption at Rest | Mask in Logs | Mask in UI |
|-----------------|--------------------|-------------|--------------------|--------------|----- ------|
| `id`            | N/A (UUID)         | Low         | No                 | No           | No         |
| `org_id`        | N/A (UUID)         | Low         | No                 | No           | No         |
| `from_address`  | Direct Identifier  | High        | No                 | **Yes**      | Partial    |
| `to_addresses`  | Direct Identifier  | High        | No                 | **Yes**      | Partial    |
| `cc_addresses`  | Direct Identifier  | High        | No                 | **Yes**      | Partial    |
| `subject`       | May Contain PII    | Medium      | No                 | **Yes**      | No         |
| `body`          | **May Contain PII**| **High**    | No                 | **Never Log**| N/A        |
| `attachments`   | **May Contain PII**| **High**    | **Yes** (Supabase) | **Never Log**| N/A        |

**Masking Examples:**
- Email addresses in to/cc: Mask as described in User entity

### 2.6 Audit Ledger Entity

**Table:** `audit_ledger`

| Field Name       | PII Type           | Sensitivity | Encryption at Rest | Mask in Logs | Mask in UI |
|------------------|--------------------|-------------|--------------------|--------------|----- ------|
| `id`             | N/A (UUID)         | Low         | No                 | No           | No         |
| `org_id`         | N/A (UUID)         | Low         | No                 | No           | No         |
| `actor_id`       | N/A (UUID ref)     | Low         | No                 | No           | No         |
| `ip_address`     | Quasi-Identifier   | Medium      | No                 | **Yes**      | Partial    |
| `user_agent`     | Behavioral         | Low         | No                 | No           | No         |
| `payload`        | **May Contain PII**| **Varies**  | No                 | **Sanitize** | N/A        |

**IP Address Masking:**
- IPv4: `192.168.1.100` → `192.168.*.***`
- IPv6: `2001:0db8:85a3::8a2e:0370:7334` → `2001:0db8:****:****:****:****:****:****`

**Payload Sanitization:**
- NEVER include raw PII fields in payload
- Use redacted versions (e.g., `email_redacted: "j***e@example.com"`)
- Store entity IDs instead of full objects

---

## 3. Logging Rules

### 3.1 Prohibited Logging

**NEVER log the following in ANY logs (application, access, error):**

- Passwords or password hashes
- API keys, tokens, secrets
- Social Security Numbers
- Full credit card numbers
- Full email addresses (use masked version)
- Full phone numbers (use masked version)
- File contents from documents or messages
- Email bodies or message content
- IP addresses in full (use masked version)
- Session tokens or JWTs

**Example - FORBIDDEN:**

```typescript
// NEVER DO THIS
console.log('User login:', {
  email: user.email,              // FORBIDDEN: Full email
  password: password,             // FORBIDDEN: Password
  phone: user.phone,              // FORBIDDEN: Full phone
  ssn: contact.ssn,               // FORBIDDEN: SSN
});

// NEVER DO THIS
logger.error('Message processing failed', {
  body: message.body,             // FORBIDDEN: May contain PII
  from: message.from_address,     // FORBIDDEN: Email
});
```

### 3.2 Redaction Patterns

**Implement automatic PII redaction for logs:**

```typescript
// PII Redaction Utility
class PIIRedactor {
  // Email redaction: john.doe@example.com → j***e@example.com
  static redactEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) {
      return `***@${domain}`;
    }
    return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`;
  }

  // Phone redaction: +1-555-123-4567 → +1-***-***-4567
  static redactPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 4) return '***';
    return phone.replace(/\d(?=\d{4})/g, '*');
  }

  // SSN redaction: 123-45-6789 → ***-**-6789
  static redactSSN(ssn: string): string {
    return ssn.replace(/^\d{3}-\d{2}/, '***-**');
  }

  // IP address redaction: 192.168.1.100 → 192.168.*.**
  static redactIP(ip: string): string {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.*.**`;
    }
    // IPv6: Just show first two segments
    const v6parts = ip.split(':');
    return `${v6parts[0]}:${v6parts[1]}:****:****:****:****:****:****`;
  }

  // Address redaction: 123 Main St → *** Main St
  static redactAddress(address: string): string {
    return address.replace(/^\d+/, '***');
  }

  // Financial amount redaction: $450,000 → $***,***
  static redactAmount(amount: number | string): string {
    return '$***,***';
  }

  // Name redaction: John Doe → J*** D***
  static redactName(name: string): string {
    return name
      .split(' ')
      .map(part => part[0] + '*'.repeat(part.length - 1))
      .join(' ');
  }

  // Generic string redaction (for unknown PII)
  static redactString(value: string): string {
    if (value.length <= 4) return '***';
    return value.substring(0, 2) + '***' + value.substring(value.length - 2);
  }

  // Redact object (recursively redact known PII fields)
  static redactObject(obj: any, piiFields: string[]): any {
    const redacted = { ...obj };

    for (const key of Object.keys(redacted)) {
      if (piiFields.includes(key)) {
        // Redact based on field name pattern
        if (key.includes('email')) {
          redacted[key] = this.redactEmail(redacted[key]);
        } else if (key.includes('phone')) {
          redacted[key] = this.redactPhone(redacted[key]);
        } else if (key.includes('ssn')) {
          redacted[key] = this.redactSSN(redacted[key]);
        } else if (key.includes('ip')) {
          redacted[key] = this.redactIP(redacted[key]);
        } else if (key.includes('address')) {
          redacted[key] = this.redactAddress(redacted[key]);
        } else if (key.includes('name')) {
          redacted[key] = this.redactName(redacted[key]);
        } else {
          redacted[key] = this.redactString(redacted[key]);
        }
      }
    }

    return redacted;
  }
}

// Export singleton
export const piiRedactor = PIIRedactor;
```

### 3.3 Safe Logging Practices

**Use structured logging with automatic PII redaction:**

```typescript
import winston from 'winston';
import { piiRedactor } from './pii-redactor';

// PII-aware fields (from schema definitions)
const PII_FIELDS = [
  'email', 'phone', 'phone_primary', 'phone_secondary',
  'ssn', 'first_name', 'last_name', 'full_name',
  'address', 'address_line1', 'address_line2',
  'ip_address', 'from_address', 'to_addresses', 'cc_addresses',
  'body', 'file_content', 'extracted_text',
  'purchase_price', 'commission_amount',
  'buyer_name', 'seller_name',
];

// Custom format to redact PII
const redactPII = winston.format((info) => {
  if (typeof info.metadata === 'object') {
    info.metadata = piiRedactor.redactObject(info.metadata, PII_FIELDS);
  }
  return info;
});

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    redactPII(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Usage example
logger.info('User login', {
  metadata: {
    user_id: userId,
    email: user.email,           // Will be automatically redacted
    ip_address: req.ip,          // Will be automatically redacted
    success: true,
  },
});

// Output in log file:
// {
//   "level": "info",
//   "message": "User login",
//   "metadata": {
//     "user_id": "123e4567-e89b-12d3-a456-426614174000",
//     "email": "j***e@example.com",        // Redacted
//     "ip_address": "192.168.*.**",        // Redacted
//     "success": true
//   },
//   "timestamp": "2025-12-31T12:00:00.000Z"
// }
```

### 3.4 Error Message Sanitization

**Sanitize errors before sending to client or logging:**

```typescript
// Error sanitization middleware
function sanitizeError(error: Error): {
  message: string;
  code?: string;
} {
  // Check if error message contains PII patterns
  const containsEmail = /@/.test(error.message);
  const containsPhone = /\d{3}-\d{3}-\d{4}/.test(error.message);
  const containsSSN = /\d{3}-\d{2}-\d{4}/.test(error.message);

  if (containsEmail || containsPhone || containsSSN) {
    // Redact PII from error message
    let sanitized = error.message;

    // Redact emails
    sanitized = sanitized.replace(/[\w.-]+@[\w.-]+\.\w+/g, match =>
      piiRedactor.redactEmail(match)
    );

    // Redact phones
    sanitized = sanitized.replace(/\d{3}-\d{3}-\d{4}/g, match =>
      piiRedactor.redactPhone(match)
    );

    // Redact SSNs
    sanitized = sanitized.replace(/\d{3}-\d{2}-\d{4}/g, '***-**-****');

    return { message: sanitized };
  }

  // No PII detected, return as-is
  return { message: error.message };
}

// Usage in API error handler
app.use((err, req, res, next) => {
  const sanitized = sanitizeError(err);

  logger.error('API error', {
    metadata: {
      error: sanitized.message,
      url: req.url,
      method: req.method,
      user_id: req.user?.id,
    },
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message: sanitized.message,
  });
});
```

### 3.5 Audit Log PII Handling

**The audit ledger (`audit_ledger` table) requires special handling:**

```typescript
// Audit log event with PII-safe payload
async function logAuditEvent(event: {
  event_type: string;
  entity_type: string;
  entity_id: string;
  actor_id: string;
  changes?: any; // Changes made (redact PII)
}) {
  const piiSafePayload = {
    // Include non-PII metadata
    entity_type: event.entity_type,
    entity_id: event.entity_id,

    // Redact changes if present
    changes: event.changes
      ? piiRedactor.redactObject(event.changes, PII_FIELDS)
      : null,
  };

  await db.insert('audit_ledger', {
    org_id: getCurrentOrgId(),
    actor_id: event.actor_id,
    actor_type: 'user',
    event_type: event.event_type,
    entity_type: event.entity_type,
    entity_id: event.entity_id,
    payload: piiSafePayload,
    ip_address: piiRedactor.redactIP(getClientIP()),
    user_agent: getUserAgent(),
  });
}

// Example usage
await logAuditEvent({
  event_type: 'contact.updated',
  entity_type: 'contact',
  entity_id: contactId,
  actor_id: userId,
  changes: {
    email: { from: oldEmail, to: newEmail }, // Will be redacted in payload
    phone: { from: oldPhone, to: newPhone }, // Will be redacted in payload
  },
});
```

---

## 4. Display Rules (UI)

### 4.1 Masking in UI

**When to mask PII in the UI:**

1. **Public-facing pages:** NEVER display PII
2. **Dashboard previews:** Mask email, phone (show last 4 digits)
3. **Data tables:** Mask columns with sensitive data by default (allow toggle)
4. **Export confirmations:** Warn before exporting full PII

**React Component for Masked Data:**

```typescript
import React, { useState } from 'react';
import { piiRedactor } from '@/lib/pii-redactor';

interface MaskedFieldProps {
  value: string;
  type: 'email' | 'phone' | 'ssn' | 'address';
  allowReveal?: boolean; // Allow user to reveal full value
}

export function MaskedField({ value, type, allowReveal = false }: MaskedFieldProps) {
  const [revealed, setRevealed] = useState(false);

  const getMaskedValue = () => {
    if (revealed) return value;

    switch (type) {
      case 'email':
        return piiRedactor.redactEmail(value);
      case 'phone':
        return piiRedactor.redactPhone(value);
      case 'ssn':
        return piiRedactor.redactSSN(value);
      case 'address':
        return piiRedactor.redactAddress(value);
      default:
        return piiRedactor.redactString(value);
    }
  };

  return (
    <span className="masked-field">
      <span className="masked-value">{getMaskedValue()}</span>
      {allowReveal && (
        <button
          onClick={() => setRevealed(!revealed)}
          className="reveal-button"
          aria-label={revealed ? 'Hide value' : 'Reveal value'}
        >
          {revealed ? 'Hide' : 'Show'}
        </button>
      )}
    </span>
  );
}

// Usage
<MaskedField value={contact.email} type="email" allowReveal={true} />
<MaskedField value={contact.ssn} type="ssn" allowReveal={false} />
```

### 4.2 Copy/Export Restrictions

**Prevent accidental PII exposure:**

```typescript
// Disable text selection for sensitive fields
const SensitiveField = styled.span`
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
`;

// Warn before bulk export
function ExportButton({ onExport }: { onExport: () => void }) {
  const [confirmed, setConfirmed] = useState(false);

  const handleExport = () => {
    if (!confirmed) {
      const consent = window.confirm(
        'This export contains PII. Ensure you have proper authorization and handle the file securely. Continue?'
      );
      if (!consent) return;
      setConfirmed(true);
    }

    onExport();
  };

  return <button onClick={handleExport}>Export Contacts (PII)</button>;
}
```

### 4.3 Screenshot Considerations

**Prevent PII capture in screenshots:**

```html
<!-- Mark sensitive sections as secure (Android, some browsers) -->
<div data-secure="true" className="secure-content">
  <!-- PII content here -->
</div>

<style>
  /* Blur sensitive content on screenshot (CSS filter) */
  .secure-content {
    filter: blur(0);
  }

  @media print, screen and (max-width: 0) {
    /* Triggered during screenshot on some devices */
    .secure-content {
      filter: blur(10px);
    }
  }
</style>
```

**Note:** CSS-based screenshot protection is not foolproof. Primary defense is user training.

### 4.4 Data Table Display

**Best practices for displaying PII in tables:**

```typescript
// Data table with PII column marking
const columns = [
  { field: 'id', header: 'ID', pii: false },
  { field: 'email', header: 'Email', pii: true, maskByDefault: true },
  { field: 'phone', header: 'Phone', pii: true, maskByDefault: true },
  { field: 'full_name', header: 'Name', pii: true, maskByDefault: false },
  { field: 'created_at', header: 'Created', pii: false },
];

function DataTable({ data, columns }) {
  const [maskedColumns, setMaskedColumns] = useState(
    new Set(columns.filter(c => c.maskByDefault).map(c => c.field))
  );

  const toggleMask = (field: string) => {
    setMaskedColumns(prev => {
      const next = new Set(prev);
      if (next.has(field)) {
        next.delete(field);
      } else {
        next.add(field);
      }
      return next;
    });
  };

  return (
    <table>
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col.field}>
              {col.header}
              {col.pii && (
                <button onClick={() => toggleMask(col.field)}>
                  {maskedColumns.has(col.field) ? 'Show' : 'Hide'}
                </button>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map(row => (
          <tr key={row.id}>
            {columns.map(col => (
              <td key={col.field}>
                {col.pii && maskedColumns.has(col.field)
                  ? piiRedactor.redactString(row[col.field])
                  : row[col.field]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## 5. Storage and Transmission

### 5.1 Database Storage

**RLS policies MUST isolate PII by organization:**

```sql
-- Example: contacts table RLS
CREATE POLICY "org_isolation" ON contacts
  FOR ALL
  USING (org_id = auth.jwt() ->> 'org_id');
```

**Encryption at rest:**

- Supabase handles database encryption (AES-256)
- Application-level encryption for highly sensitive fields (SSN):

```typescript
import { encrypt, decrypt } from '@/lib/crypto';

// Before storing SSN
const encryptedSSN = await encrypt(ssn, process.env.FIELD_ENCRYPTION_KEY);
await db.update('contacts', { ssn: encryptedSSN }, { id: contactId });

// When retrieving SSN
const contact = await db.query('SELECT ssn FROM contacts WHERE id = $1', [contactId]);
const decryptedSSN = await decrypt(contact.ssn, process.env.FIELD_ENCRYPTION_KEY);
```

### 5.2 API Transmission

**Always use HTTPS for API requests:**

```typescript
// API client configuration
const apiClient = axios.create({
  baseURL: process.env.API_BASE_URL,
  httpsAgent: new https.Agent({
    minVersion: 'TLSv1.3', // Enforce TLS 1.3
  }),
});

// Never send PII in URL parameters
// BAD: /api/users?email=john@example.com
// GOOD: POST /api/users with email in body

// Validate SSL certificates
apiClient.interceptors.request.use(config => {
  if (config.url.startsWith('http://')) {
    throw new Error('HTTPS required for API requests');
  }
  return config;
});
```

### 5.3 Email Transmission

**When sending emails containing PII:**

```typescript
// Use encrypted email service (e.g., SendGrid with TLS)
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Example: Send password reset email
async function sendPasswordResetEmail(email: string, resetToken: string) {
  // Redact email in logs
  logger.info('Sending password reset', {
    metadata: {
      email_redacted: piiRedactor.redactEmail(email),
    },
  });

  const msg = {
    to: email, // Full email (not logged)
    from: 'noreply@reilq.com',
    subject: 'Password Reset Request',
    html: `
      <p>Click the link below to reset your password:</p>
      <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">
        Reset Password
      </a>
      <p>This link expires in 1 hour.</p>
    `,
  };

  await sgMail.send(msg);
}
```

**Never include sensitive PII in email subject lines:**

- BAD: "Your SSN verification: 123-45-6789"
- GOOD: "Your account verification"

### 5.4 Third-Party Integrations

**When sharing data with third parties (e.g., Zapier, connectors):**

1. **Obtain explicit consent** from users
2. **Minimize data sharing** (only send required fields)
3. **Use OAuth scopes** to limit access
4. **Audit all data transfers** in audit ledger

```typescript
// Log third-party data access
await auditLog.log({
  event_type: 'data.exported_to_third_party',
  actor_type: 'connector',
  entity_type: 'contact',
  entity_id: contactId,
  payload: {
    service: 'zapier',
    fields_shared: ['email', 'full_name'], // Log which fields were shared
    consent_given: true,
  },
});
```

---

## 6. Data Subject Rights (GDPR/CCPA)

### 6.1 Right to Access

**Users can request a copy of their data:**

```typescript
// Generate data export for user
async function exportUserData(userId: string): Promise<any> {
  const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  const contacts = await db.query('SELECT * FROM contacts WHERE org_id = $1', [user.org_id]);
  const deals = await db.query('SELECT * FROM deals WHERE org_id = $1', [user.org_id]);

  return {
    user: user,
    contacts: contacts,
    deals: deals,
    exported_at: new Date().toISOString(),
  };
}

// API endpoint
app.get('/api/users/me/export', authenticateJWT, async (req, res) => {
  const data = await exportUserData(req.user.id);

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=my-data.json');
  res.json(data);

  // Log export
  await auditLog.log({
    event_type: 'user.data_exported',
    actor_id: req.user.id,
    entity_type: 'user',
    entity_id: req.user.id,
  });
});
```

### 6.2 Right to Rectification

**Users can update their PII:**

```typescript
// Update user profile
app.patch('/api/users/me', authenticateJWT, async (req, res) => {
  const updates = req.body; // Validated via Zod

  await db.update('users', updates, { id: req.user.id });

  // Log update
  await auditLog.log({
    event_type: 'user.profile_updated',
    actor_id: req.user.id,
    entity_type: 'user',
    entity_id: req.user.id,
    payload: {
      fields_updated: Object.keys(updates),
    },
  });

  res.json({ success: true });
});
```

### 6.3 Right to Erasure ("Right to be Forgotten")

**Users can request deletion of their data:**

```typescript
// Hard delete user and all associated data
async function deleteUserData(userId: string): Promise<void> {
  const user = await db.query('SELECT org_id FROM users WHERE id = $1', [userId]);

  // Check if user is the only owner
  const ownersCount = await db.query(
    'SELECT COUNT(*) FROM org_members WHERE org_id = $1 AND role = $2',
    [user.org_id, 'owner']
  );

  if (ownersCount === 1) {
    throw new Error('Cannot delete last organization owner');
  }

  // Delete user data
  await db.transaction(async (tx) => {
    // Remove from organization
    await tx.delete('org_members', { user_id: userId });

    // Delete user account
    await tx.delete('users', { id: userId });

    // Note: Contacts, deals belong to org, not user, so they remain
  });

  // Log deletion (retain for compliance)
  await auditLog.log({
    event_type: 'user.deleted',
    actor_id: 'system',
    entity_type: 'user',
    entity_id: userId,
    payload: { reason: 'user_request' },
  });
}

// API endpoint
app.delete('/api/users/me', authenticateJWT, async (req, res) => {
  await deleteUserData(req.user.id);
  res.json({ success: true });
});
```

### 6.4 Right to Data Portability

**Provide data in machine-readable format (JSON, CSV):**

```typescript
// Export as CSV
import { Parser } from 'json2csv';

app.get('/api/contacts/export', authenticateJWT, async (req, res) => {
  const contacts = await db.query(
    'SELECT * FROM contacts WHERE org_id = $1',
    [req.user.org_id]
  );

  const parser = new Parser({
    fields: ['first_name', 'last_name', 'email', 'phone_primary'],
  });

  const csv = parser.parse(contacts);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
  res.send(csv);

  // Log export
  await auditLog.log({
    event_type: 'data.exported',
    actor_id: req.user.id,
    entity_type: 'contact',
    payload: { format: 'csv', count: contacts.length },
  });
});
```

---

## 7. Consent Management

### 7.1 Consent Collection

**Collect explicit consent for PII processing:**

```typescript
// Consent types
enum ConsentType {
  TERMS_OF_SERVICE = 'terms_of_service',
  PRIVACY_POLICY = 'privacy_policy',
  MARKETING_EMAILS = 'marketing_emails',
  DATA_SHARING = 'data_sharing',
}

interface Consent {
  user_id: string;
  consent_type: ConsentType;
  given: boolean;
  given_at: timestamp;
  ip_address: string;
  user_agent: string;
}

// Record consent
async function recordConsent(
  userId: string,
  consentType: ConsentType,
  given: boolean,
  ip: string,
  userAgent: string
): Promise<void> {
  await db.insert('consents', {
    user_id: userId,
    consent_type: consentType,
    given: given,
    given_at: new Date(),
    ip_address: piiRedactor.redactIP(ip),
    user_agent: userAgent,
  });
}
```

### 7.2 Consent Withdrawal

**Allow users to withdraw consent:**

```typescript
// Withdraw consent for marketing emails
app.post('/api/consent/withdraw', authenticateJWT, async (req, res) => {
  const { consent_type } = req.body;

  await db.update(
    'consents',
    { given: false, withdrawn_at: new Date() },
    { user_id: req.user.id, consent_type: consent_type }
  );

  res.json({ success: true });
});
```

---

## 8. Breach Notification

### 8.1 PII Breach Detection

**Monitor for unauthorized PII access:**

```typescript
// Detect anomalous access patterns
async function detectAnomalousAccess(userId: string, entityType: string): Promise<boolean> {
  const recentAccess = await db.query(
    `SELECT COUNT(*) as count
     FROM audit_ledger
     WHERE actor_id = $1
     AND entity_type = $2
     AND created_at > NOW() - INTERVAL '1 hour'`,
    [userId, entityType]
  );

  // Alert if >100 records accessed in 1 hour
  if (recentAccess.count > 100) {
    await sendSecurityAlert({
      type: 'anomalous_access',
      user_id: userId,
      entity_type: entityType,
      count: recentAccess.count,
    });
    return true;
  }

  return false;
}
```

### 8.2 Breach Response

**If PII is compromised:**

1. **Contain:** Revoke compromised credentials, isolate affected systems
2. **Assess:** Determine scope of data exposed
3. **Notify:** Inform affected users within 72 hours (GDPR requirement)
4. **Report:** Notify supervisory authority (if required)
5. **Remediate:** Fix vulnerability, improve security

---

## 9. Training and Compliance

### 9.1 Developer Training

**All developers MUST complete PII handling training:**

- GDPR/CCPA overview
- PII identification
- Logging best practices
- Secure coding practices

### 9.2 Code Review Checklist

**PII-focused code review:**

- [ ] No PII in logs (use redaction)
- [ ] No PII in error messages
- [ ] No PII in URL parameters
- [ ] Masking implemented for UI display
- [ ] RLS policies protect data
- [ ] Audit logging for PII access
- [ ] HTTPS enforced for API requests
- [ ] Consent recorded for data collection

---

## 10. Enforcement

### 10.1 Automated Checks

**Pre-commit hooks to detect PII violations:**

```bash
# .husky/pre-commit
#!/bin/sh

# Check for common PII patterns in staged files
if git diff --cached | grep -E "(console\.log.*email|console\.log.*ssn|console\.log.*phone)"; then
  echo "ERROR: Potential PII logging detected. Please redact sensitive data."
  exit 1
fi
```

### 10.2 CI/CD Gates

**Block deployments with PII violations:**

```yaml
# .github/workflows/pii-check.yml
name: PII Compliance Check

on: [pull_request]

jobs:
  pii-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Scan for PII in logs
        run: |
          # Search for console.log with PII fields
          if grep -r "console\.log.*\(email\|ssn\|phone\)" src/; then
            echo "PII logging detected!"
            exit 1
          fi
```

---

## Appendix A: PII Field Reference

**Complete list of PII fields across all entities:**

| Entity    | Field Name        | PII Type           | Mask in Logs | Mask in UI |
|-----------|-------------------|--------------------|--------------|------------|
| users     | email             | Direct Identifier  | Yes          | Partial    |
| users     | full_name         | Direct Identifier  | Yes          | No         |
| users     | phone             | Direct Identifier  | Yes          | Partial    |
| contacts  | first_name        | Direct Identifier  | Yes          | No         |
| contacts  | last_name         | Direct Identifier  | Yes          | No         |
| contacts  | email             | Direct Identifier  | Yes          | Partial    |
| contacts  | phone_primary     | Direct Identifier  | Yes          | Partial    |
| contacts  | phone_secondary   | Direct Identifier  | Yes          | Partial    |
| contacts  | address_line1     | Quasi-Identifier   | Yes          | No         |
| contacts  | address_line2     | Quasi-Identifier   | Yes          | No         |
| contacts  | ssn               | Sensitive PII      | Yes          | Yes        |
| contacts  | date_of_birth     | Quasi-Identifier   | Yes          | Partial    |
| deals     | address           | Quasi-Identifier   | Yes          | No         |
| deals     | purchase_price    | Financial Data     | Yes          | No         |
| deals     | buyer_name        | Direct Identifier  | Yes          | No         |
| deals     | seller_name       | Direct Identifier  | Yes          | No         |
| messages  | from_address      | Direct Identifier  | Yes          | Partial    |
| messages  | to_addresses      | Direct Identifier  | Yes          | Partial    |
| messages  | body              | May Contain PII    | Never Log    | N/A        |
| documents | file_content      | May Contain PII    | Never Log    | N/A        |
| documents | extracted_text    | May Contain PII    | Never Log    | N/A        |

---

## Document Revision History

| Version | Date       | Author      | Changes                  |
|---------|------------|-------------|--------------------------|
| 1.0.0   | 2025-12-31 | Lane 6 - QA | Initial PII rules        |

---

**Next Review Date:** 2026-03-31 (Quarterly review required)
