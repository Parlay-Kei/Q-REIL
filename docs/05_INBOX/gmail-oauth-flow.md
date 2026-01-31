# Gmail OAuth Implementation Specification

**Ticket:** AUTH-101 - Gmail OAuth connection (readonly)
**Sprint:** REIL/Q v0.2 - Gmail-first Inbox Spine
**Status:** SPECIFICATION
**Created:** 2025-12-31

---

## Table of Contents

1. [Overview](#overview)
2. [OAuth Flow Design](#oauth-flow-design)
3. [Implementation Guide](#implementation-guide)
4. [Security Requirements](#security-requirements)
5. [Integration Points](#integration-points)
6. [Error Handling](#error-handling)
7. [Testing Checklist](#testing-checklist)

---

## Overview

### Purpose

Implement Gmail OAuth 2.0 authentication flow to enable read-only access to user Gmail accounts for ingestion into the REIL/Q inbox system.

### OAuth 2.0 Scopes

```
https://www.googleapis.com/auth/gmail.readonly
openid
https://www.googleapis.com/auth/userinfo.email
```

**Scope Justification:**
- `gmail.readonly` - Read access to mailbox, threads, messages, and attachments
- `openid` - OpenID Connect authentication to identify the user
- `userinfo.email` - Access to the user's email address for mailbox identification

### Architecture Pattern

**Flow Type:** Authorization Code Flow with PKCE (Proof Key for Code Exchange)

**Why PKCE?**
- Enhanced security for public clients (web apps)
- Protection against authorization code interception attacks
- No client secret exposure in browser

---

## OAuth Flow Design

### 1. Authorization Request

#### Step 1.1: Generate PKCE Code Verifier and Challenge

```typescript
// d:/SkySlope/REIL-Q/05_INBOX/lib/oauth/pkce.ts

import crypto from 'crypto';

/**
 * Generate a cryptographically secure PKCE code verifier
 * @returns Base64URL-encoded random string (43-128 characters)
 */
export function generateCodeVerifier(): string {
  const buffer = crypto.randomBytes(32);
  return base64URLEncode(buffer);
}

/**
 * Generate PKCE code challenge from verifier
 * @param verifier - The code verifier
 * @returns SHA-256 hash of verifier, Base64URL-encoded
 */
export function generateCodeChallenge(verifier: string): string {
  const hash = crypto
    .createHash('sha256')
    .update(verifier)
    .digest();
  return base64URLEncode(hash);
}

/**
 * Base64URL encode (RFC 4648)
 */
function base64URLEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
```

#### Step 1.2: Build Authorization URL

```typescript
// d:/SkySlope/REIL-Q/05_INBOX/lib/oauth/gmail-auth.ts

import { generateCodeVerifier, generateCodeChallenge } from './pkce';

interface GmailOAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

interface AuthorizationUrlResult {
  url: string;
  codeVerifier: string;
  state: string;
}

/**
 * Generate Gmail OAuth authorization URL with PKCE
 * @param config - OAuth configuration
 * @param userId - Current user ID (for state validation)
 * @returns Authorization URL, code verifier (store in session), and state
 */
export function buildAuthorizationUrl(
  config: GmailOAuthConfig,
  userId: string
): AuthorizationUrlResult {
  // Generate PKCE parameters
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  // Generate state parameter (CSRF protection)
  const state = generateState(userId);

  // Build authorization URL
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    access_type: 'offline', // Request refresh token
    prompt: 'consent', // Force consent screen to get refresh token
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  return {
    url,
    codeVerifier, // MUST be stored in server-side session
    state,
  };
}

/**
 * Generate cryptographically secure state parameter
 * Encodes userId for validation on callback
 */
function generateState(userId: string): string {
  const randomBytes = crypto.randomBytes(16).toString('hex');
  const payload = {
    userId,
    timestamp: Date.now(),
    nonce: randomBytes,
  };

  // Base64URL encode the JSON payload
  const buffer = Buffer.from(JSON.stringify(payload));
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Decode and validate state parameter
 */
export function validateState(state: string): { userId: string } | null {
  try {
    const json = Buffer.from(
      state.replace(/-/g, '+').replace(/_/g, '/'),
      'base64'
    ).toString();

    const payload = JSON.parse(json);

    // Validate state is not expired (5 minutes)
    const maxAge = 5 * 60 * 1000;
    if (Date.now() - payload.timestamp > maxAge) {
      return null;
    }

    return { userId: payload.userId };
  } catch {
    return null;
  }
}
```

#### Step 1.3: API Endpoint - Initiate OAuth

```typescript
// d:/SkySlope/REIL-Q/05_INBOX/app/api/oauth/gmail/authorize/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { buildAuthorizationUrl } from '@/lib/oauth/gmail-auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get OAuth config from environment
    const config = {
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/gmail/callback`,
      scopes: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'openid',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
    };

    // Generate authorization URL with PKCE
    const { url, codeVerifier, state } = buildAuthorizationUrl(config, user.id);

    // Store code_verifier and state in secure HTTP-only cookie
    const cookieStore = cookies();
    cookieStore.set('gmail_oauth_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/api/oauth/gmail',
    });

    cookieStore.set('gmail_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/api/oauth/gmail',
    });

    // Redirect to Google authorization URL
    return NextResponse.redirect(url);

  } catch (error) {
    console.error('[Gmail OAuth] Authorization error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    );
  }
}
```

---

### 2. Authorization Callback

#### Step 2.1: Token Exchange

```typescript
// d:/SkySlope/REIL-Q/05_INBOX/lib/oauth/token-exchange.ts

interface TokenExchangeRequest {
  code: string;
  codeVerifier: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  token_type: 'Bearer';
  id_token: string; // JWT with user info
}

/**
 * Exchange authorization code for access and refresh tokens
 */
export async function exchangeCodeForTokens(
  request: TokenExchangeRequest
): Promise<TokenResponse> {
  const params = new URLSearchParams({
    code: request.code,
    client_id: request.clientId,
    client_secret: request.clientSecret,
    redirect_uri: request.redirectUri,
    grant_type: 'authorization_code',
    code_verifier: request.codeVerifier, // PKCE parameter
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Token exchange failed: ${error.error_description || error.error}`);
  }

  return response.json();
}

/**
 * Decode JWT ID token to get user info
 */
export function decodeIdToken(idToken: string): {
  sub: string; // Google user ID
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
} {
  // JWT format: header.payload.signature
  const [, payloadB64] = idToken.split('.');
  const payload = JSON.parse(
    Buffer.from(payloadB64, 'base64').toString()
  );

  return payload;
}
```

#### Step 2.2: Token Encryption

```typescript
// d:/SkySlope/REIL-Q/05_INBOX/lib/oauth/token-encryption.ts

import crypto from 'crypto';

/**
 * Encrypt OAuth tokens using AES-256-GCM
 * Key must be 32 bytes (256 bits)
 */
export function encryptToken(token: string, encryptionKey: string): string {
  const key = Buffer.from(encryptionKey, 'hex');

  // Generate random IV (12 bytes for GCM)
  const iv = crypto.randomBytes(12);

  // Create cipher
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  // Encrypt token
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Get auth tag
  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encryptedData
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt OAuth tokens
 */
export function decryptToken(encryptedToken: string, encryptionKey: string): string {
  const key = Buffer.from(encryptionKey, 'hex');

  // Parse encrypted format
  const [ivHex, authTagHex, encryptedData] = encryptedToken.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  // Create decipher
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  // Decrypt token
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Generate encryption key (run once, store in environment)
 * Returns 32-byte hex string
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}
```

#### Step 2.3: Callback Handler

```typescript
// d:/SkySlope/REIL-Q/05_INBOX/app/api/oauth/gmail/callback/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { validateState } from '@/lib/oauth/gmail-auth';
import { exchangeCodeForTokens, decodeIdToken } from '@/lib/oauth/token-exchange';
import { encryptToken } from '@/lib/oauth/token-encryption';
import { createMailbox } from '@/lib/inbox/mailbox';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    console.error('[Gmail OAuth] User denied access:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/inbox?error=oauth_denied`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/inbox?error=oauth_invalid`
    );
  }

  try {
    const cookieStore = cookies();
    const supabase = createServerClient();

    // Retrieve stored PKCE verifier and state
    const storedVerifier = cookieStore.get('gmail_oauth_verifier')?.value;
    const storedState = cookieStore.get('gmail_oauth_state')?.value;

    // Validate state (CSRF protection)
    if (!storedState || storedState !== state) {
      throw new Error('State mismatch - possible CSRF attack');
    }

    const stateData = validateState(state);
    if (!stateData) {
      throw new Error('Invalid or expired state');
    }

    // Verify current user matches state
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== stateData.userId) {
      throw new Error('User mismatch');
    }

    if (!storedVerifier) {
      throw new Error('Code verifier not found');
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens({
      code,
      codeVerifier: storedVerifier,
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/gmail/callback`,
    });

    // Decode ID token to get user info
    const userInfo = decodeIdToken(tokens.id_token);

    // Encrypt tokens before storage
    const encryptionKey = process.env.OAUTH_TOKEN_ENCRYPTION_KEY!;
    const encryptedAccessToken = encryptToken(tokens.access_token, encryptionKey);
    const encryptedRefreshToken = encryptToken(tokens.refresh_token, encryptionKey);

    // Calculate token expiration
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // Create or update mailbox record
    const mailbox = await createMailbox(supabase, {
      userId: user.id,
      providerEmail: userInfo.email,
      providerSubjectId: userInfo.sub,
      oauthScopes: tokens.scope.split(' '),
      accessTokenEncrypted: encryptedAccessToken,
      refreshTokenEncrypted: encryptedRefreshToken,
      tokenExpiresAt: expiresAt,
    });

    // Clear OAuth cookies
    cookieStore.delete('gmail_oauth_verifier');
    cookieStore.delete('gmail_oauth_state');

    // Redirect to inbox with success
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/inbox?connected=${mailbox.id}`
    );

  } catch (error) {
    console.error('[Gmail OAuth] Callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/inbox?error=oauth_failed`
    );
  }
}
```

---

### 3. Token Refresh

#### Step 3.1: Refresh Token Logic

```typescript
// d:/SkySlope/REIL-Q/05_INBOX/lib/oauth/token-refresh.ts

interface RefreshTokenRequest {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
}

interface RefreshTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: 'Bearer';
  // Note: refresh_token is only returned if it was rotated
  refresh_token?: string;
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  request: RefreshTokenRequest
): Promise<RefreshTokenResponse> {
  const params = new URLSearchParams({
    client_id: request.clientId,
    client_secret: request.clientSecret,
    refresh_token: request.refreshToken,
    grant_type: 'refresh_token',
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.json();

    // Handle revoked or invalid refresh token
    if (error.error === 'invalid_grant') {
      throw new RefreshTokenRevokedError('Refresh token has been revoked');
    }

    throw new Error(`Token refresh failed: ${error.error_description || error.error}`);
  }

  return response.json();
}

/**
 * Custom error for revoked tokens
 */
export class RefreshTokenRevokedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RefreshTokenRevokedError';
  }
}
```

#### Step 3.2: Mailbox Token Management

```typescript
// d:/SkySlope/REIL-Q/05_INBOX/lib/inbox/mailbox-tokens.ts

import { SupabaseClient } from '@supabase/supabase-js';
import { refreshAccessToken, RefreshTokenRevokedError } from '@/lib/oauth/token-refresh';
import { encryptToken, decryptToken } from '@/lib/oauth/token-encryption';

/**
 * Get valid access token for mailbox
 * Automatically refreshes if expired
 */
export async function getValidAccessToken(
  supabase: SupabaseClient,
  mailboxId: string
): Promise<string> {
  // Fetch mailbox record
  const { data: mailbox, error } = await supabase
    .from('mailboxes')
    .select('*')
    .eq('id', mailboxId)
    .single();

  if (error || !mailbox) {
    throw new Error('Mailbox not found');
  }

  // Check if token is still valid (refresh 5 minutes before expiry)
  const expiresAt = new Date(mailbox.token_expires_at);
  const now = new Date();
  const bufferTime = 5 * 60 * 1000; // 5 minutes

  if (now.getTime() < expiresAt.getTime() - bufferTime) {
    // Token is still valid, decrypt and return
    const encryptionKey = process.env.OAUTH_TOKEN_ENCRYPTION_KEY!;
    return decryptToken(mailbox.access_token_encrypted, encryptionKey);
  }

  // Token expired or expiring soon, refresh it
  try {
    const encryptionKey = process.env.OAUTH_TOKEN_ENCRYPTION_KEY!;
    const refreshToken = decryptToken(mailbox.refresh_token_encrypted, encryptionKey);

    const tokens = await refreshAccessToken({
      refreshToken,
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
    });

    // Encrypt new access token
    const encryptedAccessToken = encryptToken(tokens.access_token, encryptionKey);

    // Calculate new expiration
    const newExpiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // Update mailbox record
    const updates: any = {
      access_token_encrypted: encryptedAccessToken,
      token_expires_at: newExpiresAt.toISOString(),
      status: 'connected',
      updated_at: new Date().toISOString(),
    };

    // If refresh token was rotated, update it
    if (tokens.refresh_token) {
      updates.refresh_token_encrypted = encryptToken(tokens.refresh_token, encryptionKey);
    }

    await supabase
      .from('mailboxes')
      .update(updates)
      .eq('id', mailboxId);

    return tokens.access_token;

  } catch (error) {
    // Handle revoked refresh token
    if (error instanceof RefreshTokenRevokedError) {
      // Mark mailbox as disconnected
      await supabase
        .from('mailboxes')
        .update({
          status: 'disconnected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', mailboxId);

      // Log event
      await supabase.from('ledger_events').insert({
        event_type: 'MAILBOX_DISCONNECTED',
        org_id: mailbox.org_id,
        user_id: mailbox.user_id,
        payload: {
          mailbox_id: mailboxId,
          reason: 'refresh_token_revoked',
        },
      });

      throw new Error('Mailbox disconnected - user must re-authenticate');
    }

    throw error;
  }
}
```

---

## Integration Points

### 1. Mailbox Creation

```typescript
// d:/SkySlope/REIL-Q/05_INBOX/lib/inbox/mailbox.ts

import { SupabaseClient } from '@supabase/supabase-js';

interface CreateMailboxParams {
  userId: string;
  providerEmail: string;
  providerSubjectId: string;
  oauthScopes: string[];
  accessTokenEncrypted: string;
  refreshTokenEncrypted: string;
  tokenExpiresAt: Date;
}

/**
 * Create or update mailbox record after successful OAuth
 */
export async function createMailbox(
  supabase: SupabaseClient,
  params: CreateMailboxParams
) {
  // Get user's org_id
  const { data: user } = await supabase
    .from('users')
    .select('org_id')
    .eq('id', params.userId)
    .single();

  if (!user) {
    throw new Error('User not found');
  }

  // Check if mailbox already exists for this email
  const { data: existing } = await supabase
    .from('mailboxes')
    .select('id')
    .eq('org_id', user.org_id)
    .eq('provider_email', params.providerEmail)
    .single();

  if (existing) {
    // Update existing mailbox
    const { data: mailbox, error } = await supabase
      .from('mailboxes')
      .update({
        user_id: params.userId,
        provider_subject_id: params.providerSubjectId,
        oauth_scopes: params.oauthScopes,
        access_token_encrypted: params.accessTokenEncrypted,
        refresh_token_encrypted: params.refreshTokenEncrypted,
        token_expires_at: params.tokenExpiresAt.toISOString(),
        status: 'connected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;

    // Log reconnection event
    await supabase.from('ledger_events').insert({
      event_type: 'MAILBOX_CONNECTED',
      org_id: user.org_id,
      user_id: params.userId,
      payload: {
        mailbox_id: mailbox.id,
        provider_email: params.providerEmail,
        reconnected: true,
      },
    });

    return mailbox;
  }

  // Create new mailbox
  const { data: mailbox, error } = await supabase
    .from('mailboxes')
    .insert({
      org_id: user.org_id,
      user_id: params.userId,
      provider: 'gmail',
      provider_email: params.providerEmail,
      provider_subject_id: params.providerSubjectId,
      oauth_scopes: params.oauthScopes,
      access_token_encrypted: params.accessTokenEncrypted,
      refresh_token_encrypted: params.refreshTokenEncrypted,
      token_expires_at: params.tokenExpiresAt.toISOString(),
      status: 'connected',
    })
    .select()
    .single();

  if (error) throw error;

  // Log MAILBOX_CONNECTED event
  await supabase.from('ledger_events').insert({
    event_type: 'MAILBOX_CONNECTED',
    org_id: user.org_id,
    user_id: params.userId,
    payload: {
      mailbox_id: mailbox.id,
      provider_email: params.providerEmail,
    },
  });

  // Trigger initial sync (async)
  await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/inbox/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mailbox_id: mailbox.id,
      sync_type: 'initial',
    }),
  }).catch(err => {
    console.error('[Mailbox] Failed to trigger initial sync:', err);
  });

  return mailbox;
}
```

---

### 2. Ledger Events

```typescript
// d:/SkySlope/REIL-Q/05_INBOX/lib/ledger/events.ts

import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Log MAILBOX_CONNECTED event
 */
export async function logMailboxConnected(
  supabase: SupabaseClient,
  payload: {
    orgId: string;
    userId: string;
    mailboxId: string;
    providerEmail: string;
    reconnected?: boolean;
  }
) {
  await supabase.from('ledger_events').insert({
    event_type: 'MAILBOX_CONNECTED',
    org_id: payload.orgId,
    user_id: payload.userId,
    payload: {
      mailbox_id: payload.mailboxId,
      provider_email: payload.providerEmail,
      reconnected: payload.reconnected || false,
    },
    created_at: new Date().toISOString(),
  });
}

/**
 * Log MAILBOX_DISCONNECTED event
 */
export async function logMailboxDisconnected(
  supabase: SupabaseClient,
  payload: {
    orgId: string;
    userId: string;
    mailboxId: string;
    reason: 'user_action' | 'refresh_token_revoked' | 'error';
  }
) {
  await supabase.from('ledger_events').insert({
    event_type: 'MAILBOX_DISCONNECTED',
    org_id: payload.orgId,
    user_id: payload.userId,
    payload: {
      mailbox_id: payload.mailboxId,
      reason: payload.reason,
    },
    created_at: new Date().toISOString(),
  });
}
```

---

### 3. UI Integration

#### Step 3.1: Connect Gmail Button

```typescript
// d:/SkySlope/REIL-Q/05_INBOX/components/inbox/ConnectGmailButton.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function ConnectGmailButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);

    // Redirect to OAuth authorization endpoint
    window.location.href = '/api/oauth/gmail/authorize';
  };

  return (
    <Button
      onClick={handleConnect}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <>
          <span className="animate-spin">⏳</span>
          Connecting...
        </>
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            {/* Gmail icon */}
            <path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
          Connect Gmail
        </>
      )}
    </Button>
  );
}
```

#### Step 3.2: Callback Success Handler

```typescript
// d:/SkySlope/REIL-Q/05_INBOX/app/inbox/page.tsx

'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';

export default function InboxPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');

    if (connected) {
      toast({
        title: 'Gmail Connected',
        description: 'Your Gmail account has been connected successfully. Syncing messages...',
      });

      // Remove query param
      router.replace('/inbox');
    }

    if (error) {
      const messages: Record<string, string> = {
        oauth_denied: 'Gmail connection was cancelled.',
        oauth_invalid: 'Invalid OAuth response.',
        oauth_failed: 'Failed to connect Gmail. Please try again.',
      };

      toast({
        title: 'Connection Failed',
        description: messages[error] || 'An error occurred.',
        variant: 'destructive',
      });

      router.replace('/inbox');
    }
  }, [searchParams, router]);

  return (
    <div>
      {/* Inbox UI */}
    </div>
  );
}
```

---

## Security Requirements

### 1. Token Storage Security Checklist

- [ ] **Encryption at Rest**: All OAuth tokens MUST be encrypted using AES-256-GCM before storage
- [ ] **Encryption Key Management**: Store `OAUTH_TOKEN_ENCRYPTION_KEY` in environment variables (never in code)
- [ ] **Key Rotation**: Plan for encryption key rotation (re-encrypt all tokens with new key)
- [ ] **Database Access**: Tokens stored in encrypted columns, never in plain text
- [ ] **No Token Logging**: NEVER log access or refresh tokens (not in console, not in error logs)

### 2. PKCE Implementation Checklist

- [ ] **Code Verifier**: Generate cryptographically secure random string (32 bytes minimum)
- [ ] **Code Challenge**: Use SHA-256 hash of verifier, Base64URL-encoded
- [ ] **Challenge Method**: Always use `S256` (never `plain`)
- [ ] **Verifier Storage**: Store in secure HTTP-only cookie (never in localStorage)
- [ ] **Verifier Expiration**: Short-lived (10 minutes maximum)

### 3. State Parameter Security Checklist

- [ ] **CSRF Protection**: State parameter MUST be validated on callback
- [ ] **Cryptographic Randomness**: Use crypto.randomBytes (never Math.random)
- [ ] **User Binding**: Encode user ID in state, validate on callback
- [ ] **Expiration**: State valid for maximum 5 minutes
- [ ] **One-Time Use**: State cannot be reused after validation

### 4. Cookie Security Checklist

- [ ] **HTTP-Only**: All OAuth cookies MUST be HTTP-only (prevent XSS)
- [ ] **Secure Flag**: Use `secure: true` in production (HTTPS only)
- [ ] **SameSite**: Set `sameSite: 'lax'` to prevent CSRF
- [ ] **Path Restriction**: Limit cookie path to `/api/oauth/gmail`
- [ ] **Short Expiration**: OAuth cookies expire in 10 minutes

### 5. Refresh Token Handling Checklist

- [ ] **Revocation Detection**: Handle `invalid_grant` error gracefully
- [ ] **Status Update**: Mark mailbox as `disconnected` when token revoked
- [ ] **User Notification**: Notify user when re-authentication required
- [ ] **Ledger Event**: Log `MAILBOX_DISCONNECTED` event with reason
- [ ] **Token Rotation**: Handle refresh token rotation (Google may return new refresh_token)

### 6. Error Handling Security Checklist

- [ ] **No Sensitive Data in Errors**: Never expose tokens in error messages
- [ ] **Generic User Errors**: Show user-friendly messages (not internal details)
- [ ] **Detailed Server Logs**: Log full error details server-side only
- [ ] **Rate Limiting**: Implement rate limiting on OAuth endpoints
- [ ] **Audit Trail**: Log all OAuth attempts (success and failure)

---

## Error Handling

### Common OAuth Errors

| Error Code | Scenario | User Message | Action |
|------------|----------|--------------|--------|
| `access_denied` | User cancelled OAuth | "Gmail connection was cancelled." | Allow retry |
| `invalid_grant` | Expired/invalid code | "Authorization expired. Please try again." | Restart flow |
| `invalid_request` | Malformed request | "Connection failed. Please try again." | Check parameters |
| `server_error` | Google server error | "Gmail is temporarily unavailable." | Retry with backoff |

### Token Refresh Errors

```typescript
// d:/SkySlope/REIL-Q/05_INBOX/lib/oauth/error-handling.ts

export class OAuthError extends Error {
  constructor(
    public code: string,
    message: string,
    public userMessage: string
  ) {
    super(message);
    this.name = 'OAuthError';
  }
}

/**
 * Handle OAuth errors with appropriate user messages
 */
export function handleOAuthError(error: any): OAuthError {
  if (error instanceof RefreshTokenRevokedError) {
    return new OAuthError(
      'token_revoked',
      'Refresh token has been revoked',
      'Your Gmail connection has expired. Please reconnect your account.'
    );
  }

  if (error.message?.includes('invalid_grant')) {
    return new OAuthError(
      'invalid_grant',
      'Invalid grant during token exchange',
      'Authorization expired. Please try connecting again.'
    );
  }

  if (error.message?.includes('State mismatch')) {
    return new OAuthError(
      'csrf_detected',
      'CSRF attack detected',
      'Security error. Please try again.'
    );
  }

  return new OAuthError(
    'unknown',
    error.message || 'Unknown OAuth error',
    'Failed to connect Gmail. Please try again.'
  );
}
```

---

## Testing Checklist

### Pre-Deployment Tests

#### OAuth Flow Tests

- [ ] **Authorization URL Generation**
  - Verify all required parameters present
  - Confirm PKCE code challenge is SHA-256
  - Validate state parameter is cryptographically random
  - Check redirect_uri matches registered URI

- [ ] **Callback Handling**
  - Test successful authorization code exchange
  - Verify state validation (match, expiration)
  - Confirm code_verifier matches challenge
  - Test error scenarios (denied, invalid code)

- [ ] **Token Management**
  - Verify tokens encrypted before storage
  - Confirm token expiration calculated correctly
  - Test token refresh before expiration
  - Test revoked refresh token handling

- [ ] **Mailbox Creation**
  - Verify mailbox record created/updated
  - Confirm MAILBOX_CONNECTED event logged
  - Check org_id isolation enforced
  - Test duplicate email handling

#### Security Tests

- [ ] **PKCE Validation**
  - Test invalid code_verifier rejection
  - Verify challenge method is S256
  - Test missing verifier handling

- [ ] **State Validation**
  - Test state mismatch rejection
  - Verify expired state rejection
  - Test user ID mismatch detection

- [ ] **Cookie Security**
  - Confirm HTTP-only flag set
  - Verify secure flag in production
  - Test cookie expiration
  - Verify cookies cleared after callback

- [ ] **Token Encryption**
  - Test encryption/decryption round-trip
  - Verify different IVs for each encryption
  - Test invalid encryption key handling

#### Integration Tests

- [ ] **End-to-End Flow**
  - Complete OAuth flow from button click to callback
  - Verify mailbox status updated to 'connected'
  - Confirm initial sync triggered
  - Test UI success notification

- [ ] **Token Refresh Flow**
  - Test automatic token refresh before expiry
  - Verify mailbox tokens updated in database
  - Test refresh token rotation handling

- [ ] **Disconnect Flow**
  - Test manual disconnect by user
  - Verify MAILBOX_DISCONNECTED event logged
  - Confirm tokens removed from database

#### Error Scenario Tests

- [ ] **User Cancellation**
  - Test OAuth denial handling
  - Verify user-friendly error message

- [ ] **Expired Authorization Code**
  - Test expired code rejection
  - Verify retry flow works

- [ ] **Revoked Refresh Token**
  - Simulate revoked token
  - Verify mailbox marked as disconnected
  - Test re-authentication flow

- [ ] **Network Failures**
  - Test Google API timeout
  - Verify retry logic with exponential backoff

---

## Environment Variables

```bash
# .env.local

# Google OAuth Credentials
GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret

# OAuth Token Encryption (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
OAUTH_TOKEN_ENCRYPTION_KEY=64-character-hex-string

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Production: https://app.reilq.com
```

---

## Google Cloud Console Setup

### 1. Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select project
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Application type: "Web application"
6. Authorized redirect URIs:
   - Development: `http://localhost:3000/api/oauth/gmail/callback`
   - Production: `https://app.reilq.com/api/oauth/gmail/callback`

### 2. Enable Gmail API

1. Navigate to "APIs & Services" > "Library"
2. Search for "Gmail API"
3. Click "Enable"

### 3. Configure OAuth Consent Screen

1. Navigate to "APIs & Services" > "OAuth consent screen"
2. User type: "External" (or "Internal" for workspace)
3. App information:
   - App name: "REIL/Q Inbox"
   - User support email: your email
   - Developer contact: your email
4. Scopes:
   - Add `https://www.googleapis.com/auth/gmail.readonly`
   - Add `openid`
   - Add `https://www.googleapis.com/auth/userinfo.email`
5. Test users: Add test emails during development

---

## Production Readiness Checklist

### Pre-Launch

- [ ] OAuth credentials configured in Google Cloud Console
- [ ] Production redirect URI registered
- [ ] Environment variables set in production
- [ ] Encryption key generated and stored securely
- [ ] Database migration completed (mailboxes table)
- [ ] RLS policies configured for mailboxes table
- [ ] Ledger events table ready
- [ ] Error monitoring configured (Sentry, etc.)
- [ ] Rate limiting implemented on OAuth endpoints

### Post-Launch Monitoring

- [ ] Monitor token refresh success rate
- [ ] Track OAuth connection failures
- [ ] Alert on encryption key errors
- [ ] Monitor MAILBOX_DISCONNECTED events
- [ ] Track user reconnection rates

---

## Appendix

### A. OAuth 2.0 Flow Diagram

```
┌──────────┐                                  ┌──────────────┐
│          │                                  │              │
│  User    │                                  │  REIL/Q App  │
│          │                                  │              │
└────┬─────┘                                  └──────┬───────┘
     │                                               │
     │ 1. Click "Connect Gmail"                     │
     │──────────────────────────────────────────────>│
     │                                               │
     │                                        2. Generate:
     │                                         - code_verifier
     │                                         - code_challenge
     │                                         - state
     │                                               │
     │ 3. Redirect to Google OAuth                  │
     │<──────────────────────────────────────────────│
     │                                               │
┌────▼─────┐                                        │
│          │                                        │
│  Google  │                                        │
│  OAuth   │                                        │
│          │                                        │
└────┬─────┘                                        │
     │                                               │
     │ 4. User authorizes                           │
     │                                               │
     │ 5. Redirect to callback with code & state    │
     │──────────────────────────────────────────────>│
     │                                               │
     │                                        6. Validate:
     │                                         - state match
     │                                         - user match
     │                                               │
     │                                        7. Exchange code
     │                                         + code_verifier
     │<──────────────────────────────────────────────│
     │                                               │
     │ 8. Return access + refresh tokens            │
     │──────────────────────────────────────────────>│
     │                                               │
     │                                        9. Encrypt tokens
     │                                        10. Create mailbox
     │                                        11. Log event
     │                                               │
     │ 12. Redirect to /inbox?connected=true        │
     │<──────────────────────────────────────────────│
     │                                               │
```

### B. Token Refresh Flow Diagram

```
┌──────────────┐                              ┌──────────────┐
│              │                              │              │
│  REIL/Q API  │                              │  Gmail API   │
│              │                              │              │
└──────┬───────┘                              └──────┬───────┘
       │                                             │
       │ 1. Check token expiration                  │
       │    (expires_at - 5min)                     │
       │                                             │
       │ 2. Decrypt refresh_token                   │
       │                                             │
       │ 3. POST /token with refresh_token          │
       │────────────────────────────────────────────>│
       │                                             │
       │                                      4. Validate
       │                                       refresh_token
       │                                             │
       │ 5. Return new access_token                 │
       │<────────────────────────────────────────────│
       │  (+ optional new refresh_token)             │
       │                                             │
       │ 6. Encrypt new access_token                │
       │ 7. Update mailbox record                   │
       │                                             │
```

---

## Definition of Done

- [x] Gmail OAuth flow documented with PKCE implementation
- [x] TypeScript code examples provided for all OAuth operations
- [x] Token encryption/decryption implementation included
- [x] Mailbox creation and update logic specified
- [x] Ledger event specifications defined (MAILBOX_CONNECTED, MAILBOX_DISCONNECTED)
- [x] Security requirements checklist completed
- [x] Error handling patterns documented
- [x] UI integration examples provided
- [x] Testing checklist included
- [x] Environment variables documented
- [x] Google Cloud Console setup instructions provided
- [x] Production readiness checklist included

---

**Document Status:** COMPLETE
**Last Updated:** 2025-12-31
**Owner:** auth-flow-agent
**Ticket:** AUTH-101
