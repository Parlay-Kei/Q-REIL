# Security Implementation Guide for Developers

**Version:** 1.0.0
**Last Updated:** 2025-12-31
**Owner:** Lane 6 - QA + Security
**Audience:** All REIL/Q developers

## Purpose

This guide provides practical, copy-paste code examples for implementing the security requirements defined in SECURITY_BASELINE.md, PII_RULES.md, and LEDGER_EVENT_SPEC.md.

---

## Quick Reference: File Paths

All code examples in this guide reference the following project structure:

```
src/
├── lib/
│   ├── pii-redactor.ts          # PII redaction utilities
│   ├── audit-log.ts              # Audit logging client
│   ├── auth.ts                   # Authentication utilities
│   └── validation.ts             # Input validation schemas
├── middleware/
│   ├── authenticate.ts           # JWT authentication middleware
│   ├── authorize.ts              # Permission checking middleware
│   ├── audit.ts                  # Audit logging middleware
│   └── rate-limit.ts             # Rate limiting middleware
├── api/
│   └── routes/
│       ├── deals.ts              # Deal CRUD endpoints
│       ├── contacts.ts           # Contact CRUD endpoints
│       └── auth.ts               # Authentication endpoints
└── test/
    └── setup.ts                  # Test configuration
```

---

## 1. PII Redaction

### 1.1 Create PIIRedactor Utility

**File:** `src/lib/pii-redactor.ts`

```typescript
/**
 * PII Redaction Utility
 *
 * Redacts Personally Identifiable Information (PII) from logs and audit trails.
 * See: PII_RULES.md section 3.2
 */

export class PIIRedactor {
  /**
   * Redact email address: john.doe@example.com → j***e@example.com
   */
  static redactEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (!domain) return '***@invalid';
    if (localPart.length <= 2) return `***@${domain}`;
    return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`;
  }

  /**
   * Redact phone number: +1-555-123-4567 → +1-***-***-4567
   */
  static redactPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 4) return '***';
    const lastFour = digits.slice(-4);
    return phone.replace(/\d(?=.*\d{4})/g, '*').replace(/\d{4}$/, lastFour);
  }

  /**
   * Redact SSN: 123-45-6789 → ***-**-6789
   */
  static redactSSN(ssn: string): string {
    return ssn.replace(/^\d{3}-\d{2}/, '***-**');
  }

  /**
   * Redact IP address: 192.168.1.100 → 192.168.*.**
   */
  static redactIP(ip: string): string {
    if (ip.includes(':')) {
      // IPv6: Show first two segments
      const parts = ip.split(':');
      return `${parts[0]}:${parts[1]}:****:****:****:****:****:****`;
    }
    // IPv4: Show first two octets
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.*.**`;
    }
    return '***.*.**.*.**';
  }

  /**
   * Redact street address: 123 Main St → *** Main St
   */
  static redactAddress(address: string): string {
    return address.replace(/^\d+/, '***');
  }

  /**
   * Redact financial amount: $450,000 → $***,***
   */
  static redactAmount(amount: number | string): string {
    return '$***,***';
  }

  /**
   * Redact name: John Doe → J*** D***
   */
  static redactName(name: string): string {
    return name
      .split(' ')
      .map((part) => (part.length > 0 ? part[0] + '*'.repeat(Math.max(part.length - 1, 3)) : ''))
      .join(' ');
  }

  /**
   * Redact generic string: show first 2 and last 2 chars
   */
  static redactString(value: string): string {
    if (value.length <= 4) return '***';
    return value.substring(0, 2) + '***' + value.substring(value.length - 2);
  }

  /**
   * Redact object fields containing PII
   *
   * @param obj Object to redact
   * @param piiFields List of field names containing PII
   * @returns New object with PII fields redacted
   */
  static redactObject<T extends Record<string, any>>(
    obj: T,
    piiFields: string[]
  ): T {
    const redacted = { ...obj };

    for (const key of Object.keys(redacted)) {
      if (piiFields.includes(key) && redacted[key]) {
        // Determine redaction method based on field name
        if (key.includes('email')) {
          redacted[key] = this.redactEmail(String(redacted[key]));
        } else if (key.includes('phone')) {
          redacted[key] = this.redactPhone(String(redacted[key]));
        } else if (key.includes('ssn')) {
          redacted[key] = this.redactSSN(String(redacted[key]));
        } else if (key.includes('ip')) {
          redacted[key] = this.redactIP(String(redacted[key]));
        } else if (key.includes('address')) {
          redacted[key] = this.redactAddress(String(redacted[key]));
        } else if (key.includes('name') && !key.includes('file')) {
          redacted[key] = this.redactName(String(redacted[key]));
        } else if (key.includes('amount') || key.includes('price')) {
          redacted[key] = this.redactAmount(redacted[key]);
        } else {
          redacted[key] = this.redactString(String(redacted[key]));
        }
      }
    }

    return redacted;
  }
}

/**
 * List of PII fields across all entities
 * See: PII_RULES.md section 2 for complete inventory
 */
export const PII_FIELDS = [
  // Contact fields
  'email',
  'phone',
  'phone_primary',
  'phone_secondary',
  'ssn',
  'first_name',
  'last_name',
  'full_name',
  'address',
  'address_line1',
  'address_line2',
  'date_of_birth',

  // Deal fields
  'purchase_price',
  'commission_amount',
  'buyer_name',
  'seller_name',

  // Message fields
  'from_address',
  'to_addresses',
  'cc_addresses',
  'body',

  // Document fields
  'file_content',
  'extracted_text',

  // Audit fields
  'ip_address',
];

// Export singleton
export const piiRedactor = PIIRedactor;
```

### 1.2 Usage in Logging

**File:** `src/lib/logger.ts`

```typescript
import winston from 'winston';
import { piiRedactor, PII_FIELDS } from './pii-redactor';

/**
 * Custom format to redact PII from logs
 */
const redactPII = winston.format((info) => {
  // Redact metadata object
  if (typeof info.metadata === 'object' && info.metadata !== null) {
    info.metadata = piiRedactor.redactObject(info.metadata, PII_FIELDS);
  }

  // Redact message if it contains PII patterns
  if (typeof info.message === 'string') {
    // Redact email addresses
    info.message = info.message.replace(
      /[\w.-]+@[\w.-]+\.\w+/g,
      (match) => piiRedactor.redactEmail(match)
    );
    // Redact phone numbers
    info.message = info.message.replace(
      /\d{3}-\d{3}-\d{4}/g,
      (match) => piiRedactor.redactPhone(match)
    );
  }

  return info;
});

/**
 * Application logger with PII redaction
 */
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    redactPII(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

/**
 * Example usage:
 *
 * logger.info('User login', {
 *   metadata: {
 *     user_id: userId,
 *     email: user.email,        // Will be redacted automatically
 *     ip_address: req.ip,       // Will be redacted automatically
 *   }
 * });
 */
```

---

## 2. Audit Logging

### 2.1 Create AuditLog Service

**File:** `src/lib/audit-log.ts`

```typescript
import { z } from 'zod';
import { piiRedactor, PII_FIELDS } from './pii-redactor';
import { db } from './database';

/**
 * Audit Event Schema
 * See: LEDGER_EVENT_SPEC.md section 1.2
 */
const auditEventSchema = z.object({
  org_id: z.string().uuid(),
  actor_id: z.string().uuid().nullable(),
  actor_type: z.enum(['user', 'system', 'connector', 'api_key']),
  event_type: z.string().min(1),
  entity_type: z.string().min(1),
  entity_id: z.string().uuid().nullable(),
  payload: z.record(z.any()).nullable(),
  correlation_id: z.string().uuid().nullable(),
  source: z.enum(['ui', 'api', 'connector', 'cron', 'system']),
  ip_address: z.string().nullable(),
  user_agent: z.string().nullable(),
});

export type AuditEvent = z.infer<typeof auditEventSchema>;

/**
 * Audit Log Service
 *
 * Provides append-only audit logging with PII redaction.
 * See: LEDGER_EVENT_SPEC.md section 7.1
 */
class AuditLogService {
  /**
   * Log an audit event
   *
   * @throws {Error} If event validation fails
   */
  async log(event: AuditEvent): Promise<void> {
    // Validate event structure
    const validatedEvent = auditEventSchema.parse(event);

    // Redact PII in payload
    const piiSafePayload = validatedEvent.payload
      ? piiRedactor.redactObject(validatedEvent.payload, PII_FIELDS)
      : null;

    // Insert into database
    await db.query(
      `INSERT INTO audit_ledger (
        org_id, actor_id, actor_type, event_type, entity_type, entity_id,
        payload, correlation_id, source, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        validatedEvent.org_id,
        validatedEvent.actor_id,
        validatedEvent.actor_type,
        validatedEvent.event_type,
        validatedEvent.entity_type,
        validatedEvent.entity_id,
        JSON.stringify(piiSafePayload),
        validatedEvent.correlation_id,
        validatedEvent.source,
        validatedEvent.ip_address
          ? piiRedactor.redactIP(validatedEvent.ip_address)
          : null,
        validatedEvent.user_agent,
      ]
    );
  }

  /**
   * Query audit logs
   */
  async query(filters: {
    org_id: string;
    event_type?: string;
    entity_id?: string;
    actor_id?: string;
    start_date?: Date;
    end_date?: Date;
    limit?: number;
    offset?: number;
  }): Promise<AuditEvent[]> {
    let query = 'SELECT * FROM audit_ledger WHERE org_id = $1';
    const params: any[] = [filters.org_id];
    let paramIndex = 2;

    if (filters.event_type) {
      query += ` AND event_type = $${paramIndex++}`;
      params.push(filters.event_type);
    }

    if (filters.entity_id) {
      query += ` AND entity_id = $${paramIndex++}`;
      params.push(filters.entity_id);
    }

    if (filters.actor_id) {
      query += ` AND actor_id = $${paramIndex++}`;
      params.push(filters.actor_id);
    }

    if (filters.start_date) {
      query += ` AND created_at >= $${paramIndex++}`;
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ` AND created_at <= $${paramIndex++}`;
      params.push(filters.end_date);
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);
    }

    if (filters.offset) {
      query += ` OFFSET $${paramIndex++}`;
      params.push(filters.offset);
    }

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Get entity history (all events for a specific entity)
   */
  async getEntityHistory(
    org_id: string,
    entity_type: string,
    entity_id: string
  ): Promise<AuditEvent[]> {
    const result = await db.query(
      `SELECT * FROM audit_ledger
       WHERE org_id = $1 AND entity_type = $2 AND entity_id = $3
       ORDER BY created_at ASC`,
      [org_id, entity_type, entity_id]
    );
    return result.rows;
  }

  /**
   * Get user activity
   */
  async getUserActivity(
    org_id: string,
    actor_id: string,
    limit: number = 100
  ): Promise<AuditEvent[]> {
    const result = await db.query(
      `SELECT * FROM audit_ledger
       WHERE org_id = $1 AND actor_id = $2
       ORDER BY created_at DESC
       LIMIT $3`,
      [org_id, actor_id, limit]
    );
    return result.rows;
  }

  /**
   * Get correlated events (events in same workflow)
   */
  async getCorrelatedEvents(correlation_id: string): Promise<AuditEvent[]> {
    const result = await db.query(
      `SELECT * FROM audit_ledger
       WHERE correlation_id = $1
       ORDER BY created_at ASC`,
      [correlation_id]
    );
    return result.rows;
  }
}

export const auditLog = new AuditLogService();
```

### 2.2 Audit Logging Middleware

**File:** `src/middleware/audit.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { auditLog } from '../lib/audit-log';

/**
 * Middleware to automatically log API requests to audit ledger
 *
 * See: LEDGER_EVENT_SPEC.md section 7.2
 */
export function auditMiddleware(eventType: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // Capture original response methods
    const originalJson = res.json.bind(res);

    res.json = function (body: any) {
      const duration = Date.now() - startTime;

      // Log to audit ledger (async, don't block response)
      auditLog
        .log({
          org_id: req.user?.org_id || 'unknown',
          actor_id: req.user?.id || null,
          actor_type: req.user ? 'user' : 'system',
          event_type: eventType,
          entity_type: req.params.entityType || 'unknown',
          entity_id: req.params.id || body?.id || null,
          payload: {
            method: req.method,
            path: req.path,
            status_code: res.statusCode,
            duration_ms: duration,
            // Include sanitized request body if successful
            ...(res.statusCode < 400 && req.body ? { request: req.body } : {}),
          },
          correlation_id: req.headers['x-correlation-id'] as string || null,
          source: 'api',
          ip_address: req.ip || req.socket.remoteAddress || null,
          user_agent: req.get('user-agent') || null,
        })
        .catch((err) => {
          console.error('Failed to log audit event:', err);
        });

      return originalJson(body);
    };

    next();
  };
}

/**
 * Usage in API routes:
 *
 * app.post('/api/deals',
 *   authenticateJWT,
 *   auditMiddleware('deal.created'),
 *   async (req, res) => {
 *     // Handler logic
 *   }
 * );
 */
```

---

## 3. Authentication & Authorization

### 3.1 JWT Authentication Middleware

**File:** `src/middleware/authenticate.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

/**
 * JWT Authentication Middleware
 *
 * Validates JWT token and attaches user to request object.
 * See: SECURITY_BASELINE.md section 1.1
 */
export async function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid authorization header',
    });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    // Validate JWT with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email!,
      org_id: user.user_metadata.org_id,
      role: user.user_metadata.role,
    };

    next();
  } catch (error) {
    console.error('JWT validation error:', error);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token validation failed',
    });
  }
}
```

### 3.2 Permission Authorization Middleware

**File:** `src/middleware/authorize.ts`

```typescript
import { Request, Response, NextFunction } from 'express';

/**
 * Permission Matrix
 * See: SECURITY_BASELINE.md section 3.1
 */
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

  // API keys
  'apikey.create': ['owner', 'admin'],
  'apikey.revoke': ['owner', 'admin'],
} as const;

/**
 * Authorization Middleware
 *
 * Checks if user has required permission.
 * See: SECURITY_BASELINE.md section 3.1
 */
export function requirePermission(permission: keyof typeof PERMISSIONS) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const userRole = req.user.role;
    const allowedRoles = PERMISSIONS[permission];

    if (!allowedRoles?.includes(userRole)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Role '${userRole}' does not have permission '${permission}'`,
      });
    }

    next();
  };
}

/**
 * Usage:
 *
 * app.post('/api/deals',
 *   authenticateJWT,
 *   requirePermission('deal.create'),
 *   async (req, res) => {
 *     // Handler logic
 *   }
 * );
 */
```

---

## 4. Input Validation

### 4.1 Validation Schemas

**File:** `src/lib/validation.ts`

```typescript
import { z } from 'zod';

/**
 * Validation Schemas
 * See: SECURITY_BASELINE.md section 5.1
 */

// Deal validation
export const createDealSchema = z.object({
  address: z.string().min(1).max(500),
  city: z.string().min(1).max(100),
  state: z.string().length(2).regex(/^[A-Z]{2}$/),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/),
  purchase_price: z.number().positive().max(1_000_000_000).optional(),
  stage: z.enum(['lead', 'under_contract', 'closed', 'dead']),
  listing_agent_id: z.string().uuid().optional(),
  buyer_agent_id: z.string().uuid().optional(),
});

// Contact validation
export const createContactSchema = z.object({
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone_primary: z
    .string()
    .regex(/^\+?[\d\s()-]{10,20}$/)
    .optional(),
  phone_secondary: z
    .string()
    .regex(/^\+?[\d\s()-]{10,20}$/)
    .optional(),
  address_line1: z.string().max(500).optional(),
  address_line2: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().length(2).regex(/^[A-Z]{2}$/).optional(),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/).optional(),
});

// User registration
export const registerUserSchema = z.object({
  email: z.string().email().max(255),
  password: z
    .string()
    .min(12)
    .max(128)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  full_name: z.string().min(1).max(200),
});
```

### 4.2 Validation Middleware

**File:** `src/middleware/validate.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Validation Middleware Factory
 *
 * Creates middleware to validate request body against Zod schema.
 * See: SECURITY_BASELINE.md section 5.1
 */
export function validateBody<T extends z.ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse and validate request body
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }

      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Validation failed unexpectedly',
      });
    }
  };
}

/**
 * Usage:
 *
 * import { createDealSchema } from '../lib/validation';
 *
 * app.post('/api/deals',
 *   authenticateJWT,
 *   validateBody(createDealSchema),
 *   async (req, res) => {
 *     // req.body is now validated and typed
 *   }
 * );
 */
```

---

## 5. Rate Limiting

### 5.1 Rate Limiting Middleware

**File:** `src/middleware/rate-limit.ts`

```typescript
import rateLimit from 'express-rate-limit';

/**
 * Rate Limiting Configuration
 * See: SECURITY_BASELINE.md section 4.3
 */

/**
 * General API rate limiter
 * 100 requests per 15 minutes per user/IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
  keyGenerator: (req) => {
    // Rate limit by user ID if authenticated, otherwise by IP
    return req.user?.id || req.ip || 'unknown';
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true, // Don't count successful logins
  message: 'Too many login attempts, please try again later.',
});

/**
 * Moderate rate limiter for data export endpoints
 * 10 requests per hour per user
 */
export const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many export requests, please try again later.',
  keyGenerator: (req) => req.user?.id || req.ip || 'unknown',
});

/**
 * Usage:
 *
 * app.use('/api/', apiLimiter);
 * app.use('/api/auth/login', authLimiter);
 * app.use('/api/export', exportLimiter);
 */
```

---

## 6. Complete API Endpoint Example

### 6.1 Deal CRUD Endpoints

**File:** `src/api/routes/deals.ts`

```typescript
import express from 'express';
import { authenticateJWT } from '../../middleware/authenticate';
import { requirePermission } from '../../middleware/authorize';
import { validateBody } from '../../middleware/validate';
import { auditMiddleware } from '../../middleware/audit';
import { createDealSchema } from '../../lib/validation';
import { auditLog } from '../../lib/audit-log';
import { db } from '../../lib/database';

const router = express.Router();

/**
 * Create a new deal
 *
 * POST /api/deals
 */
router.post(
  '/deals',
  authenticateJWT,
  requirePermission('deal.create'),
  validateBody(createDealSchema),
  auditMiddleware('deal.created'),
  async (req, res) => {
    try {
      const dealData = {
        ...req.body,
        org_id: req.user!.org_id,
        created_by: req.user!.id,
      };

      // Insert deal into database
      const result = await db.query(
        `INSERT INTO deals (org_id, address, city, state, zip, stage, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          dealData.org_id,
          dealData.address,
          dealData.city,
          dealData.state,
          dealData.zip,
          dealData.stage,
          dealData.created_by,
        ]
      );

      const newDeal = result.rows[0];

      res.status(201).json(newDeal);
    } catch (error) {
      console.error('Error creating deal:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create deal',
      });
    }
  }
);

/**
 * Get deal by ID
 *
 * GET /api/deals/:id
 */
router.get(
  '/deals/:id',
  authenticateJWT,
  requirePermission('deal.read'),
  async (req, res) => {
    try {
      const result = await db.query(
        `SELECT * FROM deals WHERE id = $1 AND org_id = $2`,
        [req.params.id, req.user!.org_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Deal not found',
        });
      }

      // Log view event
      await auditLog.log({
        org_id: req.user!.org_id,
        actor_id: req.user!.id,
        actor_type: 'user',
        event_type: 'deal.viewed',
        entity_type: 'deal',
        entity_id: req.params.id,
        payload: null,
        correlation_id: null,
        source: 'api',
        ip_address: req.ip || null,
        user_agent: req.get('user-agent') || null,
      });

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching deal:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch deal',
      });
    }
  }
);

/**
 * Update deal
 *
 * PUT /api/deals/:id
 */
router.put(
  '/deals/:id',
  authenticateJWT,
  requirePermission('deal.update'),
  validateBody(createDealSchema.partial()),
  auditMiddleware('deal.updated'),
  async (req, res) => {
    try {
      // Fetch current deal for audit trail
      const currentResult = await db.query(
        `SELECT * FROM deals WHERE id = $1 AND org_id = $2`,
        [req.params.id, req.user!.org_id]
      );

      if (currentResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Deal not found',
        });
      }

      const currentDeal = currentResult.rows[0];

      // Update deal
      const updates = req.body;
      const setClause = Object.keys(updates)
        .map((key, i) => `${key} = $${i + 3}`)
        .join(', ');

      const result = await db.query(
        `UPDATE deals SET ${setClause}, updated_at = NOW()
         WHERE id = $1 AND org_id = $2
         RETURNING *`,
        [req.params.id, req.user!.org_id, ...Object.values(updates)]
      );

      const updatedDeal = result.rows[0];

      res.json(updatedDeal);
    } catch (error) {
      console.error('Error updating deal:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update deal',
      });
    }
  }
);

/**
 * Delete deal (soft delete)
 *
 * DELETE /api/deals/:id
 */
router.delete(
  '/deals/:id',
  authenticateJWT,
  requirePermission('deal.delete'),
  auditMiddleware('deal.deleted'),
  async (req, res) => {
    try {
      await db.query(
        `UPDATE deals SET deleted_at = NOW(), deleted_by = $1
         WHERE id = $2 AND org_id = $3`,
        [req.user!.id, req.params.id, req.user!.org_id]
      );

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting deal:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete deal',
      });
    }
  }
);

export default router;
```

---

## 7. Testing Examples

### 7.1 Unit Tests

**File:** `src/lib/pii-redactor.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { PIIRedactor } from './pii-redactor';

describe('PIIRedactor', () => {
  describe('redactEmail', () => {
    it('should redact email address', () => {
      expect(PIIRedactor.redactEmail('john.doe@example.com')).toBe('j***e@example.com');
    });

    it('should handle short email addresses', () => {
      expect(PIIRedactor.redactEmail('ab@example.com')).toBe('***@example.com');
    });
  });

  describe('redactPhone', () => {
    it('should redact phone number', () => {
      expect(PIIRedactor.redactPhone('+1-555-123-4567')).toBe('+1-***-***-4567');
    });
  });

  describe('redactSSN', () => {
    it('should redact SSN', () => {
      expect(PIIRedactor.redactSSN('123-45-6789')).toBe('***-**-6789');
    });
  });

  describe('redactObject', () => {
    it('should redact PII fields in object', () => {
      const obj = {
        id: '123',
        email: 'john@example.com',
        phone: '555-123-4567',
        name: 'John Doe',
      };

      const redacted = PIIRedactor.redactObject(obj, ['email', 'phone']);

      expect(redacted.email).toBe('j***@example.com');
      expect(redacted.phone).toBe('***-***-4567');
      expect(redacted.name).toBe('John Doe'); // Not in PII fields
    });
  });
});
```

### 7.2 Integration Tests

**File:** `src/api/routes/deals.test.ts`

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('POST /api/deals', () => {
  let authToken: string;

  beforeAll(async () => {
    // Login to get auth token
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'Test1234!' });
    authToken = res.body.token;
  });

  it('should create deal with valid data', async () => {
    const res = await request(app)
      .post('/api/deals')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
        stage: 'lead',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.address).toBe('123 Main St');
  });

  it('should reject invalid state format', async () => {
    const res = await request(app)
      .post('/api/deals')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        address: '123 Main St',
        city: 'San Francisco',
        state: 'California', // Invalid format
        stage: 'lead',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation Error');
  });

  it('should require authentication', async () => {
    const res = await request(app)
      .post('/api/deals')
      .send({
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        stage: 'lead',
      });

    expect(res.status).toBe(401);
  });
});
```

---

## 8. Environment Setup

### 8.1 Environment Variables

**File:** `.env.example`

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Encryption (generate with: openssl rand -hex 32)
FIELD_ENCRYPTION_KEY=

# Application
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:3001

# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 8.2 Environment Validation

**File:** `src/lib/env.ts`

```typescript
import { z } from 'zod';

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_KEY: z.string().min(1),
  DATABASE_URL: z.string().url(),
  FIELD_ENCRYPTION_KEY: z.string().length(64),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().positive(),
  FRONTEND_URL: z.string().url(),
  API_BASE_URL: z.string().url(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables on startup
 */
export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('Environment validation failed:', error);
    process.exit(1);
  }
}
```

---

## 9. Deployment Checklist

Before deploying to production, verify:

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] RLS policies enabled on all tables
- [ ] audit_ledger table created with triggers
- [ ] Security headers configured (Helmet.js)
- [ ] Rate limiting enabled
- [ ] TLS 1.3 enforced
- [ ] CORS properly configured
- [ ] Error handling sanitizes PII
- [ ] Logging redacts PII
- [ ] npm audit shows no high/critical vulnerabilities
- [ ] All CI/CD gates pass
- [ ] Backup and disaster recovery tested

---

## Document Revision History

| Version | Date       | Author      | Changes                           |
|---------|------------|-------------|-----------------------------------|
| 1.0.0   | 2025-12-31 | Lane 6 - QA | Initial implementation guide      |

---

**Next Steps:**
1. Copy relevant code snippets to your project
2. Customize for your specific database and framework
3. Add unit and integration tests
4. Review with security team
5. Deploy to staging and test
