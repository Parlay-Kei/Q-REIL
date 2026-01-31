# CI/CD Quality Gates - REIL/Q Platform

**Version:** 1.0.0
**Last Updated:** 2025-12-31
**Owner:** Lane 6 - QA + Security
**Status:** Active

## Document Purpose

This document defines the automated quality gates for the REIL/Q CI/CD pipeline. ALL gates must pass before code can be merged to main and deployed to production. Gate failures BLOCK the deployment pipeline.

**Pipeline Philosophy:**
- Shift Left: Catch issues early in development
- Fast Feedback: Gates should complete in <10 minutes
- Zero Tolerance: No manual overrides for security/critical issues
- Continuous Improvement: Add gates as new risks are identified

---

## Pipeline Architecture

```
┌─────────────────┐
│  Developer Push │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────┐
│ Gate 1: Lint & Type Check (Fast Fail)              │
│ - ESLint (strict)                                   │
│ - TypeScript (strict mode)                          │
│ - Prettier (formatting)                             │
│ Duration: ~30 seconds                               │
└────────┬────────────────────────────────────────────┘
         │ PASS
         ▼
┌─────────────────────────────────────────────────────┐
│ Gate 2: Unit Tests                                  │
│ - All tests must pass                               │
│ - Coverage ≥80% for new code                        │
│ Duration: ~2 minutes                                │
└────────┬────────────────────────────────────────────┘
         │ PASS
         ▼
┌─────────────────────────────────────────────────────┐
│ Gate 3: Security Scan                               │
│ - Dependency vulnerabilities (npm audit)            │
│ - Secret detection (gitleaks)                       │
│ - SAST (Semgrep)                                    │
│ Duration: ~2 minutes                                │
└────────┬────────────────────────────────────────────┘
         │ PASS
         ▼
┌─────────────────────────────────────────────────────┐
│ Gate 4: API Contract Tests                          │
│ - OpenAPI spec validation                           │
│ - Request/response schema validation                │
│ Duration: ~1 minute                                 │
└────────┬────────────────────────────────────────────┘
         │ PASS
         ▼
┌─────────────────────────────────────────────────────┐
│ Gate 5: Build                                       │
│ - Production build succeeds                         │
│ - Bundle size within limits                         │
│ Duration: ~3 minutes                                │
└────────┬────────────────────────────────────────────┘
         │ PASS
         ▼
┌─────────────────┐
│ Merge to Main   │
│ Deploy to Prod  │
└─────────────────┘
```

---

## Gate 1: Lint & Type Check

### 1.1 Purpose

Enforce code style, catch syntax errors, and ensure type safety BEFORE running expensive tests.

### 1.2 Tools

- **ESLint**: JavaScript/TypeScript linting
- **TypeScript**: Type checking
- **Prettier**: Code formatting

### 1.3 Configuration

**ESLint Configuration (.eslintrc.json):**

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:security/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "project": "./tsconfig.json",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "plugins": ["@typescript-eslint", "react", "react-hooks", "security"],
  "rules": {
    // Errors (block CI)
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "no-console": "error",
    "security/detect-object-injection": "error",
    "security/detect-non-literal-regexp": "error",

    // Warnings (don't block, but should be fixed)
    "@typescript-eslint/no-floating-promises": "warn",
    "@typescript-eslint/no-misused-promises": "warn",
    "react-hooks/exhaustive-deps": "warn",

    // Disabled (too strict or false positives)
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-member-access": "off"
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
```

**TypeScript Configuration (tsconfig.json):**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": false,
    "checkJs": false,
    "jsx": "react-jsx",

    // Strict type checking
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    // Additional checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,

    // Emit
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",

    // Interop
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,

    // Performance
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts", "**/*.test.ts"]
}
```

**Prettier Configuration (.prettierrc):**

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### 1.4 CI Implementation

**GitHub Actions (.github/workflows/lint.yml):**

```yaml
name: Gate 1 - Lint & Type Check

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  lint:
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
        run: npm run lint
        continue-on-error: false

      - name: Run TypeScript type check
        run: npm run type-check
        continue-on-error: false

      - name: Check Prettier formatting
        run: npm run format:check
        continue-on-error: false
```

**package.json scripts:**

```json
{
  "scripts": {
    "lint": "eslint 'src/**/*.{js,jsx,ts,tsx}' --max-warnings 0",
    "lint:fix": "eslint 'src/**/*.{js,jsx,ts,tsx}' --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write 'src/**/*.{js,jsx,ts,tsx,json,css,md}'",
    "format:check": "prettier --check 'src/**/*.{js,jsx,ts,tsx,json,css,md}'"
  }
}
```

### 1.5 Pass Criteria

- ESLint: 0 errors, 0 warnings
- TypeScript: 0 type errors
- Prettier: All files formatted correctly

### 1.6 Failure Handling

**If Gate 1 fails:**
1. Developer receives immediate feedback in PR
2. Pipeline halts (no further gates run)
3. Developer must fix issues locally
4. Run `npm run lint:fix` and `npm run format` to auto-fix
5. Re-push to trigger CI again

---

## Gate 2: Unit Tests

### 2.1 Purpose

Ensure code correctness through automated testing. Prevent regressions and verify business logic.

### 2.2 Tools

- **Vitest**: Fast unit test runner (Vite-native)
- **React Testing Library**: Component testing
- **c8**: Code coverage

### 2.3 Configuration

**Vitest Configuration (vitest.config.ts):**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.spec.ts',
        '**/*.test.tsx',
        'src/**/*.d.ts',
        'src/main.tsx',
      ],
      all: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
});
```

**Test Setup (src/test/setup.ts):**

```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});
```

### 2.4 Coverage Requirements

**Minimum Coverage:**
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

**Coverage Exceptions:**
- Generated files (Prisma client, Supabase types)
- Test files themselves
- Configuration files
- Type definition files (.d.ts)

**New Code Coverage:**
- NEW code (changed in PR) must have ≥80% coverage
- Use `--changed` flag to test only modified files

### 2.5 CI Implementation

**GitHub Actions (.github/workflows/test.yml):**

```yaml
name: Gate 2 - Unit Tests

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Full history for coverage diff

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests with coverage
        run: npm run test:coverage

      - name: Check coverage thresholds
        run: npm run test:coverage:check

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          flags: unittests
          fail_ci_if_error: true

      - name: Comment coverage on PR
        if: github.event_name == 'pull_request'
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          lcov-file: ./coverage/lcov.info
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

**package.json scripts:**

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:coverage:check": "c8 check-coverage --lines 80 --functions 80 --branches 80 --statements 80"
  }
}
```

### 2.6 Pass Criteria

- All tests pass (0 failures)
- Coverage ≥80% for all metrics
- No skipped tests (unless documented exception)

### 2.7 Test Standards

**Required Tests:**

1. **Business Logic:** All functions with business logic must have unit tests
2. **API Routes:** All endpoints must have integration tests
3. **React Components:** All interactive components must have tests
4. **Utility Functions:** All exported utilities must have tests
5. **Error Handling:** Test error paths, not just happy paths

**Example Test:**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DealForm from './DealForm';

describe('DealForm', () => {
  it('should submit valid deal data', async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();

    render(<DealForm onSubmit={mockOnSubmit} />);

    // Fill form
    await user.type(screen.getByLabelText(/address/i), '123 Main St');
    await user.type(screen.getByLabelText(/city/i), 'San Francisco');
    await user.selectOptions(screen.getByLabelText(/state/i), 'CA');

    // Submit
    await user.click(screen.getByRole('button', { name: /submit/i }));

    // Verify
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
      });
    });
  });

  it('should show validation error for invalid ZIP code', async () => {
    const user = userEvent.setup();

    render(<DealForm onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText(/zip/i), 'INVALID');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByText(/invalid zip code/i)).toBeInTheDocument();
  });
});
```

---

## Gate 3: Security Scan

### 3.1 Purpose

Identify security vulnerabilities BEFORE they reach production. Block known CVEs, secrets, and common vulnerabilities.

### 3.2 Tools

- **npm audit**: Dependency vulnerability scanning
- **gitleaks**: Secret detection in code/commits
- **Semgrep**: SAST (Static Application Security Testing)

### 3.3 Dependency Vulnerability Scanning

**npm audit configuration (.npmrc):**

```
audit-level=high
```

**CI Implementation:**

```yaml
# .github/workflows/security-scan.yml
name: Gate 3 - Security Scan

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  dependency-audit:
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

      - name: Run npm audit
        run: npm audit --audit-level=high --production
        continue-on-error: false

      - name: Dependency Review (PR only)
        if: github.event_name == 'pull_request'
        uses: actions/dependency-review-action@v4
        with:
          fail-on-severity: high
          deny-licenses: GPL-3.0, AGPL-3.0
```

**Allowed Exceptions:**

Create `audit-ignore.json` for documented exceptions:

```json
{
  "ignores": [
    {
      "advisory": "GHSA-xxxx-yyyy-zzzz",
      "reason": "No fix available, risk accepted by security team",
      "expiry": "2026-01-31"
    }
  ]
}
```

### 3.4 Secret Detection

**gitleaks configuration (.gitleaks.toml):**

```toml
title = "REIL/Q Secret Detection"

[[rules]]
id = "generic-api-key"
description = "Generic API Key"
regex = '''(?i)(api[_-]?key|apikey)['":\s]*=?['":\s]*[0-9a-zA-Z]{32,}'''
tags = ["api", "key"]

[[rules]]
id = "aws-access-key"
description = "AWS Access Key"
regex = '''(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}'''
tags = ["aws", "credentials"]

[[rules]]
id = "private-key"
description = "Private Key"
regex = '''-----BEGIN (RSA|DSA|EC|OPENSSH) PRIVATE KEY-----'''
tags = ["private-key"]

[[rules]]
id = "supabase-service-key"
description = "Supabase Service Role Key"
regex = '''eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.'''
tags = ["supabase", "jwt"]

# Allowlist (paths to exclude)
[allowlist]
paths = [
  ".env.example",
  "**/*.md",
  "**/test/**",
]
```

**CI Implementation:**

```yaml
# Part of .github/workflows/security-scan.yml
  secret-scan:
    runs-on: ubuntu-latest
    timeout-minutes: 3

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Full history

      - name: Run gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITLEAKS_LICENSE: ${{ secrets.GITLEAKS_LICENSE }} # Optional
```

### 3.5 SAST (Static Application Security Testing)

**Semgrep configuration (.semgrep.yml):**

```yaml
rules:
  # SQL Injection
  - id: sql-injection
    pattern: |
      db.query($SQL, ...)
    message: Potential SQL injection. Use parameterized queries.
    severity: ERROR
    languages: [typescript, javascript]

  # XSS via dangerouslySetInnerHTML
  - id: dangerous-inner-html
    pattern: |
      <$EL dangerouslySetInnerHTML={{ __html: $VAR }} />
    message: Potential XSS. Sanitize HTML before using dangerouslySetInnerHTML.
    severity: WARNING
    languages: [typescript, tsx]

  # No console.log in production
  - id: no-console-log
    pattern: console.log(...)
    message: Remove console.log before production.
    severity: ERROR
    languages: [typescript, javascript]
    paths:
      exclude:
        - "**/*.test.ts"
        - "**/*.spec.ts"

  # PII in logs
  - id: pii-in-logs
    pattern-either:
      - pattern: logger.log({ ..., email: $EMAIL, ... })
      - pattern: logger.log({ ..., ssn: $SSN, ... })
      - pattern: logger.log({ ..., phone: $PHONE, ... })
    message: Do not log PII directly. Use PII redaction.
    severity: ERROR
    languages: [typescript]
```

**CI Implementation:**

```yaml
# Part of .github/workflows/security-scan.yml
  sast-scan:
    runs-on: ubuntu-latest
    timeout-minutes: 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Semgrep
        uses: semgrep/semgrep-action@v1
        with:
          config: .semgrep.yml
          generateSarif: true

      - name: Upload SARIF results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: semgrep.sarif
```

### 3.6 Pass Criteria

- npm audit: 0 high/critical vulnerabilities in production dependencies
- gitleaks: 0 secrets detected
- Semgrep: 0 high/critical findings

### 3.7 Failure Handling

**If Gate 3 fails:**

1. **Dependency Vulnerability:**
   - Run `npm audit fix` to auto-update
   - If no fix available, document in `audit-ignore.json` with security team approval
   - Consider replacing vulnerable package

2. **Secret Detected:**
   - IMMEDIATELY revoke the exposed secret
   - Remove secret from code
   - Use environment variables or secret manager
   - Rewrite git history if secret is in commit history (use `git filter-repo`)

3. **SAST Finding:**
   - Review code flagged by Semgrep
   - Fix vulnerability or add exception if false positive
   - Document reason for exception in code comments

---

## Gate 4: API Contract Tests

### 4.1 Purpose

Ensure API endpoints comply with OpenAPI specification. Prevent breaking changes to API contracts.

### 4.2 Tools

- **OpenAPI Generator**: Generate types from OpenAPI spec
- **Zod**: Runtime schema validation
- **Supertest**: HTTP assertion library

### 4.3 OpenAPI Specification

**API Spec (openapi.yaml):**

```yaml
openapi: 3.1.0
info:
  title: REIL/Q API
  version: 1.0.0
  description: Real estate transaction management API

servers:
  - url: https://api.reilq.com/v1
    description: Production
  - url: http://localhost:3001/v1
    description: Development

paths:
  /deals:
    post:
      summary: Create a new deal
      operationId: createDeal
      tags: [Deals]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateDealRequest'
      responses:
        '201':
          description: Deal created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Deal'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'

components:
  schemas:
    CreateDealRequest:
      type: object
      required:
        - address
        - city
        - state
        - stage
      properties:
        address:
          type: string
          minLength: 1
          maxLength: 500
        city:
          type: string
          minLength: 1
          maxLength: 100
        state:
          type: string
          pattern: '^[A-Z]{2}$'
        zip:
          type: string
          pattern: '^\d{5}(-\d{4})?$'
        stage:
          type: string
          enum: [lead, under_contract, closed, dead]

    Deal:
      type: object
      properties:
        id:
          type: string
          format: uuid
        org_id:
          type: string
          format: uuid
        address:
          type: string
        city:
          type: string
        state:
          type: string
        stage:
          type: string
        created_at:
          type: string
          format: date-time

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

### 4.4 Schema Validation Tests

**Contract Test Example:**

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '@/app';
import { z } from 'zod';

// Define expected response schema (matches OpenAPI spec)
const dealSchema = z.object({
  id: z.string().uuid(),
  org_id: z.string().uuid(),
  address: z.string(),
  city: z.string(),
  state: z.string().length(2),
  stage: z.enum(['lead', 'under_contract', 'closed', 'dead']),
  created_at: z.string().datetime(),
});

describe('POST /api/deals - Contract Test', () => {
  let authToken: string;

  beforeAll(async () => {
    // Get auth token
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    authToken = res.body.token;
  });

  it('should return 201 with valid deal object', async () => {
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

    // Validate response matches schema
    const validationResult = dealSchema.safeParse(res.body);
    expect(validationResult.success).toBe(true);
  });

  it('should return 400 for invalid state format', async () => {
    const res = await request(app)
      .post('/api/deals')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        address: '123 Main St',
        city: 'San Francisco',
        state: 'California', // Invalid: should be 2-letter code
        stage: 'lead',
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 401 without auth token', async () => {
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

### 4.5 CI Implementation

```yaml
# .github/workflows/contract-tests.yml
name: Gate 4 - API Contract Tests

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  contract-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 10

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: reilq_test
        options: >-
          --health-cmd pg_isready
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

      - name: Validate OpenAPI spec
        run: npx @openapitools/openapi-generator-cli validate -i openapi.yaml

      - name: Run contract tests
        run: npm run test:contract
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/reilq_test

      - name: Check for breaking changes
        if: github.event_name == 'pull_request'
        run: npx oasdiff breaking openapi.yaml openapi-previous.yaml
```

**package.json scripts:**

```json
{
  "scripts": {
    "test:contract": "vitest run src/**/*.contract.test.ts"
  }
}
```

### 4.6 Pass Criteria

- OpenAPI spec is valid (passes validation)
- All contract tests pass
- No breaking API changes (for PRs)

---

## Gate 5: Build

### 5.1 Purpose

Ensure production build succeeds and bundle size is optimized. Prevent deployment of unbuildable code.

### 5.2 Tools

- **Vite**: Build tool
- **Rollup**: Bundler (Vite's underlying bundler)
- **size-limit**: Bundle size monitoring

### 5.3 Build Configuration

**Vite Configuration (vite.config.ts):**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      open: false,
    }),
  ],
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunking for better caching
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
    chunkSizeWarningLimit: 500, // KB
  },
});
```

### 5.4 Bundle Size Limits

**size-limit configuration (.size-limit.json):**

```json
[
  {
    "name": "Main bundle",
    "path": "dist/assets/index-*.js",
    "limit": "300 KB"
  },
  {
    "name": "Vendor bundle",
    "path": "dist/assets/vendor-*.js",
    "limit": "200 KB"
  },
  {
    "name": "Total bundle",
    "path": "dist/**/*.js",
    "limit": "600 KB"
  }
]
```

### 5.5 CI Implementation

```yaml
# .github/workflows/build.yml
name: Gate 5 - Build

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  build:
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

      - name: Build for production
        run: npm run build
        env:
          NODE_ENV: production

      - name: Check bundle size
        run: npm run size

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-artifacts
          path: dist/
          retention-days: 7

      - name: Comment bundle size on PR
        if: github.event_name == 'pull_request'
        uses: andresz1/size-limit-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

**package.json scripts:**

```json
{
  "scripts": {
    "build": "vite build",
    "size": "size-limit",
    "analyze": "vite build && open dist/stats.html"
  }
}
```

### 5.6 Pass Criteria

- Production build succeeds (exit code 0)
- Bundle sizes within limits (see .size-limit.json)
- No build warnings (or documented exceptions)

### 5.7 Bundle Optimization Techniques

**Code Splitting:**

```typescript
// Lazy load routes
import { lazy, Suspense } from 'react';

const DealPage = lazy(() => import('./pages/DealPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/deals/:id" element={<DealPage />} />
        <Route path="/contacts/:id" element={<ContactPage />} />
      </Routes>
    </Suspense>
  );
}
```

**Tree Shaking:**

```typescript
// Import only what you need
import { useState } from 'react'; // Good
// import * as React from 'react'; // Bad (imports everything)

// Use named imports from lodash
import debounce from 'lodash/debounce'; // Good
// import _ from 'lodash'; // Bad (imports entire library)
```

---

## Pipeline Monitoring

### Dashboard Metrics

**Track gate performance:**

- Gate pass rate (%)
- Average execution time per gate
- Most common failure reasons
- Time to fix (TTF) after gate failure

**GitHub Actions Dashboard:**

```yaml
# .github/workflows/metrics.yml
name: Pipeline Metrics

on:
  workflow_run:
    workflows: ["Gate 1", "Gate 2", "Gate 3", "Gate 4", "Gate 5"]
    types: [completed]

jobs:
  collect-metrics:
    runs-on: ubuntu-latest
    steps:
      - name: Collect workflow metrics
        run: |
          # Send metrics to monitoring service
          # (e.g., Datadog, Prometheus, CloudWatch)
          echo "Workflow: ${{ github.workflow }}"
          echo "Status: ${{ github.event.workflow_run.conclusion }}"
          echo "Duration: ${{ github.event.workflow_run.run_duration }}"
```

---

## Local Pre-Commit Hooks

**Enforce gates locally before pushing:**

**Husky configuration (.husky/pre-commit):**

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run lint and type check
npm run lint
npm run type-check

# Run tests
npm run test:changed

# Check for secrets
gitleaks protect --staged --verbose

echo "✅ Pre-commit checks passed!"
```

**Install Husky:**

```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm run pre-commit"
```

**package.json scripts:**

```json
{
  "scripts": {
    "pre-commit": "lint-staged && npm run test:changed",
    "test:changed": "vitest related --run",
    "prepare": "husky install"
  }
}
```

**lint-staged configuration (.lintstagedrc.json):**

```json
{
  "*.{ts,tsx,js,jsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md,css}": [
    "prettier --write"
  ]
}
```

---

## Exemptions and Overrides

### When to Allow Overrides

**NEVER allow overrides for:**
- High/critical security vulnerabilities
- Secret detection failures
- Type errors

**May allow overrides with approval:**
- Flaky tests (with documented issue and fix plan)
- Bundle size increase (with performance justification)
- Linting warnings (case-by-case basis)

### Override Process

1. Developer creates PR with failing gate
2. Developer adds comment explaining why override is needed
3. Security/QA lead reviews and approves
4. Add exception to configuration (e.g., audit-ignore.json)
5. Create follow-up issue to fix properly

**Example Override Comment:**

```yaml
# In PR description
## Gate Override Request

**Gate:** Gate 3 - Security Scan
**Failure:** npm audit - moderate vulnerability in `lodash`
**Reason:** No fix available yet. Vulnerability affects unused code path.
**Risk Assessment:** Low risk - code path not reachable in our application
**Mitigation:** Added input validation to prevent exploitation
**Follow-up:** Issue #456 to replace `lodash` with `lodash-es`
**Approval:** @security-lead
```

---

## Continuous Improvement

### Gate Evolution

**Add new gates when:**
- New vulnerability class discovered
- Production incident could have been caught
- Compliance requirement introduced

**Remove/relax gates when:**
- False positive rate >10%
- Developer productivity significantly impacted
- Better alternative available

### Feedback Loop

**Metrics to track:**
- Gate failure rate per gate
- Time to fix gate failures
- Production bugs that bypassed gates
- Developer satisfaction with CI/CD

**Monthly review:**
- Review gate pass rates
- Identify common failure patterns
- Adjust thresholds if needed
- Update documentation

---

## Troubleshooting

### Common Failures

**Gate 1: Lint Failure**
```
ERROR: Unexpected any (no-explicit-any)
```
**Fix:** Replace `any` with specific type

**Gate 2: Coverage Failure**
```
ERROR: Coverage for lines (75%) does not meet threshold (80%)
```
**Fix:** Add tests for uncovered code paths

**Gate 3: npm audit Failure**
```
ERROR: 1 high severity vulnerability found
```
**Fix:** Run `npm audit fix` or document exception

**Gate 4: Contract Test Failure**
```
ERROR: Response schema validation failed
```
**Fix:** Update API response to match OpenAPI spec

**Gate 5: Bundle Size Exceeded**
```
ERROR: Main bundle size 350 KB exceeds limit 300 KB
```
**Fix:** Implement code splitting or remove unused dependencies

---

## Appendix A: Required Dependencies

**package.json (dev dependencies):**

```json
{
  "devDependencies": {
    "@openapitools/openapi-generator-cli": "^2.7.0",
    "@semgrep/semgrep": "^1.45.0",
    "@size-limit/preset-app": "^10.0.1",
    "@testing-library/jest-dom": "^6.1.4",
    "@testing-library/react": "^14.1.2",
    "@testing-library/user-event": "^14.5.1",
    "@typescript-eslint/eslint-plugin": "^6.12.0",
    "@typescript-eslint/parser": "^6.12.0",
    "@vitest/coverage-c8": "^0.33.0",
    "@vitest/ui": "^1.0.0",
    "eslint": "^8.54.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-security": "^1.7.1",
    "husky": "^8.0.3",
    "lint-staged": "^15.1.0",
    "prettier": "^3.1.0",
    "rollup-plugin-visualizer": "^5.9.2",
    "size-limit": "^10.0.1",
    "supertest": "^6.3.3",
    "typescript": "^5.3.2",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

---

## Appendix B: CI/CD Pipeline Diagram

```
Developer Workflow:
┌──────────────────────────────────────────────────────────┐
│ 1. Write code                                            │
│ 2. Run pre-commit hook (lint, type-check, test-changed) │
│ 3. Push to branch                                        │
└───────────────────────┬──────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────┐
│ GitHub Actions Pipeline (PR)                             │
├──────────────────────────────────────────────────────────┤
│ Gate 1: Lint & Type Check        (~30 sec)              │
│ Gate 2: Unit Tests                (~2 min)               │
│ Gate 3: Security Scan             (~2 min)               │
│ Gate 4: API Contract Tests        (~1 min)               │
│ Gate 5: Build                     (~3 min)               │
├──────────────────────────────────────────────────────────┤
│ Total: ~8-10 minutes                                     │
└───────────────────────┬──────────────────────────────────┘
                        │ All gates pass
                        ▼
┌──────────────────────────────────────────────────────────┐
│ Merge to main                                            │
└───────────────────────┬──────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────┐
│ Deploy to Production (via Vercel/AWS)                    │
└──────────────────────────────────────────────────────────┘
```

---

## Document Revision History

| Version | Date       | Author      | Changes                    |
|---------|------------|-------------|----------------------------|
| 1.0.0   | 2025-12-31 | Lane 6 - QA | Initial CI/CD gates spec   |

---

**Next Review Date:** 2026-03-31 (Quarterly review required)
