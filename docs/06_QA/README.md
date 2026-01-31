# Lane 6: QA + Security Documentation

**Sprint:** 0.1
**Completed:** 2025-12-31
**Status:** Complete

## Overview

This directory contains the security baseline and quality assurance specifications for the REIL/Q platform. All code, configurations, and deployments must comply with these standards.

## Documentation Structure

### 1. SECURITY_BASELINE.md (39 KB)
**Purpose:** Comprehensive security requirements for the platform

**Key Sections:**
- Authentication & Authorization (JWT, MFA, API keys)
- Data Protection (encryption at rest/transit, PII identification)
- Access Control (RBAC via RLS, least privilege)
- Infrastructure Security (environment variables, secret rotation)
- Application Security (input validation, SQL injection prevention, XSS, CSRF)
- Security Headers & CSP
- Incident Response & Compliance

**Critical Requirements:**
- All API endpoints require JWT authentication
- RLS policies on all multi-tenant tables
- TLS 1.3 minimum for all connections
- PII redaction in all logs
- MFA for admin/owner roles
- API keys stored as SHA-256 hashes
- 7-year audit log retention (SOX compliance)

### 2. PII_RULES.md (35 KB)
**Purpose:** Define handling of Personally Identifiable Information

**Key Sections:**
- PII Field Inventory (users, contacts, deals, documents, messages)
- Logging Rules (prohibited logging, redaction patterns)
- Display Rules (UI masking, copy restrictions)
- Storage & Transmission (encryption, HTTPS)
- Data Subject Rights (GDPR/CCPA compliance)
- Consent Management

**Critical Requirements:**
- NEVER log PII in plaintext (email, phone, SSN, addresses)
- Automatic PII redaction in logs via PIIRedactor utility
- Mask sensitive fields in UI by default
- IP addresses redacted to first two octets
- SSN encrypted at rest with application-level encryption
- Support GDPR "Right to be Forgotten" within 30 days

**PII Field Count:**
- 24 identified PII fields across 6 entities
- 8 fields require masking in logs
- 4 fields require masking in UI
- 1 field requires application-level encryption (SSN)

### 3. LEDGER_EVENT_SPEC.md (34 KB)
**Purpose:** Audit ledger schema and event specifications

**Key Sections:**
- Audit Ledger Schema (13 fields, immutable)
- Event Types (50+ event types defined)
- Immutability Enforcement (DB triggers, API validation)
- Correlation & Event Chains
- Query Patterns & Performance Optimization
- Retention & Archival Policies

**Critical Requirements:**
- ALL privileged actions logged to audit_ledger
- Immutable: No UPDATE or DELETE operations allowed
- Event correlation via correlation_id for multi-step workflows
- PII redaction in payload field
- 7-year retention for financial/security events
- RLS policies for tenant isolation

**Supported Event Types:**
- Entity CRUD: created, updated, deleted, restored, purged
- Document: uploaded, downloaded, viewed, signed
- Message: received, sent, linked, unlinked
- User: login, logout, password_changed, mfa_enabled
- Connector: sync_started, sync_completed, sync_failed
- Security: suspicious_activity, access_denied

### 4. ci-gates.md (37 KB)
**Purpose:** CI/CD pipeline quality gates

**Key Sections:**
- Gate 1: Lint & Type Check (ESLint, TypeScript, Prettier)
- Gate 2: Unit Tests (Vitest, 80% coverage minimum)
- Gate 3: Security Scan (npm audit, gitleaks, Semgrep)
- Gate 4: API Contract Tests (OpenAPI validation)
- Gate 5: Build (Vite, bundle size limits)
- Local Pre-Commit Hooks (Husky, lint-staged)

**Critical Requirements:**
- All gates must pass before merge to main
- Zero tolerance for high/critical security vulnerabilities
- 80% code coverage for new code
- No secrets in commits (gitleaks)
- Bundle size limits: 300 KB (main), 600 KB (total)
- Pipeline execution time: <10 minutes

**Gate Pass Criteria:**
- Gate 1: 0 ESLint errors, 0 type errors, proper formatting
- Gate 2: All tests pass, coverage ≥80%
- Gate 3: 0 high/critical vulnerabilities, 0 secrets detected
- Gate 4: OpenAPI spec valid, all contract tests pass
- Gate 5: Build succeeds, bundle sizes within limits

## Quick Start for Developers

### Pre-Commit Setup

```bash
# Install Husky
npm install --save-dev husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run pre-commit"
```

### Run All Gates Locally

```bash
# Gate 1: Lint & Type Check
npm run lint
npm run type-check
npm run format:check

# Gate 2: Unit Tests
npm run test:coverage

# Gate 3: Security Scan
npm audit --audit-level=high
gitleaks protect --staged

# Gate 4: Contract Tests
npm run test:contract

# Gate 5: Build
npm run build
npm run size
```

### Common Commands

```bash
# Fix lint issues
npm run lint:fix

# Format code
npm run format

# Run tests in watch mode
npm test

# Analyze bundle size
npm run analyze

# Update dependencies safely
npm audit fix
```

## Security Checklists

### Pre-Production Security Review

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

### PII Handling Checklist

- [ ] No PII in logs (use PIIRedactor)
- [ ] No PII in error messages
- [ ] No PII in URL parameters
- [ ] Masking implemented for UI display
- [ ] RLS policies protect data
- [ ] Audit logging for PII access
- [ ] HTTPS enforced for API requests
- [ ] Consent recorded for data collection

### Audit Logging Checklist

- [ ] All CRUD operations logged
- [ ] User authentication events logged
- [ ] Permission changes logged
- [ ] Data exports logged
- [ ] Correlation ID for related events
- [ ] PII redacted in payload
- [ ] Immutability enforced (no UPDATE/DELETE)

## Integration Points

### For Lane 2 (Data Schema):
- Implement RLS policies from SECURITY_BASELINE.md section 3.1
- Add PII field markers to schema (PII_RULES.md section 2)
- Create audit_ledger table (LEDGER_EVENT_SPEC.md section 1.1)
- Add encryption for SSN field (SECURITY_BASELINE.md section 2.1)

### For Lane 3 (UI):
- Implement PII masking components (PII_RULES.md section 4.1)
- Display audit logs in admin panel (LEDGER_EVENT_SPEC.md section 10.1)
- Add MFA enrollment UI (SECURITY_BASELINE.md section 1.4)
- Implement CSP headers (SECURITY_BASELINE.md section 5.3)

### For Lane 4 (Connectors):
- Log all connector events (LEDGER_EVENT_SPEC.md section 2.2)
- Use correlation IDs for sync batches (LEDGER_EVENT_SPEC.md section 4.1)
- Implement API key authentication (SECURITY_BASELINE.md section 1.5)
- Redact PII in connector logs (PII_RULES.md section 3)

### For Lane 5 (Inbox):
- Redact PII in message logs (PII_RULES.md section 2.5)
- Log message linking events (LEDGER_EVENT_SPEC.md section 2.2)
- Sanitize email bodies before processing (SECURITY_BASELINE.md section 5.1)
- Implement rate limiting (SECURITY_BASELINE.md section 4.3)

## Compliance Mapping

| Requirement | Document | Section |
|-------------|----------|---------|
| SOX: 7-year financial record retention | SECURITY_BASELINE.md | 2.4 |
| SOX: Audit trail for transactions | LEDGER_EVENT_SPEC.md | 1.1 |
| GDPR: Right to access | PII_RULES.md | 6.1 |
| GDPR: Right to erasure | PII_RULES.md | 6.3 |
| GDPR: Data breach notification (72h) | SECURITY_BASELINE.md | 7.3 |
| CCPA: Data export in machine-readable format | PII_RULES.md | 6.4 |
| CCPA: Consent management | PII_RULES.md | 7 |
| PCI-DSS: Encryption in transit | SECURITY_BASELINE.md | 2.2 |
| PCI-DSS: Access logging | LEDGER_EVENT_SPEC.md | 1.1 |

## Metrics & Monitoring

### Security Metrics to Track
- Failed login attempts per hour
- API key usage patterns
- Anomalous data access (>100 records/hour)
- Secret rotation adherence
- Vulnerability remediation time

### Quality Metrics to Track
- CI/CD gate pass rate
- Code coverage percentage
- Bundle size trends
- Test execution time
- Mean time to fix (MTTF) gate failures

### Audit Metrics to Track
- Events logged per day
- Audit log query performance
- Storage growth rate
- Retention compliance
- DSAR response time

## Tools & Dependencies

### Security Tools
- **gitleaks**: Secret detection
- **Semgrep**: SAST scanning
- **npm audit**: Dependency vulnerabilities
- **Helmet.js**: Security headers
- **Zod**: Runtime schema validation

### Testing Tools
- **Vitest**: Unit testing
- **React Testing Library**: Component testing
- **Supertest**: API testing
- **c8**: Code coverage

### CI/CD Tools
- **GitHub Actions**: Pipeline automation
- **Husky**: Git hooks
- **lint-staged**: Pre-commit checks
- **size-limit**: Bundle size monitoring

### Monitoring Tools (Recommended)
- **Datadog / Prometheus**: Metrics collection
- **Sentry**: Error tracking
- **LogRocket**: Session replay (for debugging)
- **Supabase Logs**: Database query logs

## Next Steps

### Sprint 0.2 Priorities
1. Implement PIIRedactor utility (PII_RULES.md section 3.2)
2. Create AuditLogService client (LEDGER_EVENT_SPEC.md section 7.1)
3. Set up GitHub Actions pipelines (ci-gates.md)
4. Configure pre-commit hooks (ci-gates.md section 9)
5. Create API key management endpoints (SECURITY_BASELINE.md section 1.5)

### Integration Testing
1. E2E tests for authentication flows
2. Security penetration testing (annual)
3. GDPR compliance audit
4. Disaster recovery drills

### Documentation Updates
- Add code examples for each lane
- Create developer onboarding guide
- Document incident response procedures
- Add architecture decision records (ADRs)

## Contact & Ownership

**Security Lead:** Lane 6 - QA + Security
**Escalation:** Security team
**Review Schedule:** Quarterly (next review: 2026-03-31)

## Changelog

| Date       | Version | Changes                                    |
|------------|---------|---------------------------------------------|
| 2025-12-31 | 1.0.0   | Initial security baseline and QA specs     |

---

**Total Documentation:** 145 KB across 4 files
**Sprint Status:** Complete - All P0 deliverables shipped
**Handoff Status:** Ready for integration by Lanes 2-5
