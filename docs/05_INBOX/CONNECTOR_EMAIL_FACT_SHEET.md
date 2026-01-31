# Email Connector Fact Sheet

**Document ID:** CONNECTOR_EMAIL_FACT_SHEET
**Version:** 1.0.0
**Created:** 2025-12-31
**Lane:** 5 (Inbox)
**Status:** DRAFT

---

## Executive Summary

This document evaluates Gmail Workspace API and Microsoft Graph API for integration with the REIL/Q inbox feature. Both platforms offer robust email integration capabilities, but differ significantly in authentication complexity, webhook architecture, and target market alignment.

---

## Gmail Workspace API

### Overview

The Gmail API provides RESTful access to Gmail mailboxes and supports reading, composing, and modifying email messages. It uses Google Cloud Pub/Sub for push notifications.

### Authentication

**Method:** OAuth 2.0 via Google Cloud Console

**Required Scopes (Minimal for MVP):**

| Scope | Purpose | Sensitivity |
|-------|---------|-------------|
| `https://www.googleapis.com/auth/gmail.readonly` | Read messages, threads, labels | Restricted |
| `https://www.googleapis.com/auth/gmail.send` | Send email on behalf of user | Restricted |
| `https://www.googleapis.com/auth/gmail.modify` | Mark read/unread, apply labels, archive | Restricted |
| `https://www.googleapis.com/auth/gmail.labels` | Create and manage labels | Sensitive |

**Authentication Flow:**
1. User clicks "Connect Gmail"
2. Redirect to Google OAuth consent screen
3. User grants permissions
4. Receive authorization code
5. Exchange for access_token + refresh_token
6. Store encrypted tokens

**Token Lifecycle:**
- Access token: 1 hour expiry
- Refresh token: No expiry (but can be revoked)
- Offline access required for background sync

**Google Verification Requirements:**
- Apps requesting restricted scopes require Google verification
- Verification process: 2-4 weeks
- Requires privacy policy, terms of service, demo video
- Annual re-verification may be required

### Read Capabilities

| Feature | Endpoint | Notes |
|---------|----------|-------|
| List messages | `GET /gmail/v1/users/{userId}/messages` | Returns message IDs only by default |
| Get message | `GET /gmail/v1/users/{userId}/messages/{id}` | Full message with format parameter |
| List threads | `GET /gmail/v1/users/{userId}/threads` | Conversation grouping |
| Get thread | `GET /gmail/v1/users/{userId}/threads/{id}` | All messages in thread |
| List labels | `GET /gmail/v1/users/{userId}/labels` | Inbox, Sent, custom labels |
| Search | `GET /gmail/v1/users/{userId}/messages?q=` | Gmail search syntax |

**Message Formats:**
- `minimal`: ID and labels only
- `metadata`: Headers without body
- `full`: Complete parsed message
- `raw`: RFC 2822 format (base64url encoded)

### Send Capabilities

| Feature | Endpoint | Notes |
|---------|----------|-------|
| Send message | `POST /gmail/v1/users/{userId}/messages/send` | Raw RFC 2822 format |
| Create draft | `POST /gmail/v1/users/{userId}/drafts` | Save without sending |
| Reply to thread | `POST /gmail/v1/users/{userId}/messages/send` | Include threadId |

**Sending Requirements:**
- Message must be base64url encoded RFC 2822 format
- Headers: To, From, Subject required
- Reply requires References and In-Reply-To headers
- Attachments: multipart MIME encoding

### Webhook Support (Push Notifications)

**Architecture:** Google Cloud Pub/Sub

**Setup Requirements:**
1. Create Google Cloud Project
2. Enable Pub/Sub API
3. Create Pub/Sub topic
4. Grant Gmail service account publish access
5. Create Pub/Sub subscription (push or pull)
6. Call `watch()` endpoint for each mailbox

**Watch Request:**
```json
POST /gmail/v1/users/{userId}/watch
{
  "topicName": "projects/myproject/topics/gmail-notifications",
  "labelIds": ["INBOX"],
  "labelFilterBehavior": "INCLUDE"
}
```

**Notification Content:**
- historyId (for sync)
- emailAddress
- No message content in notification (privacy)

**Watch Expiration:**
- 7 days maximum
- Must renew before expiration
- Recommended: Renew daily via cron

**Sync Strategy:**
1. Receive push notification with historyId
2. Call `history.list()` with last known historyId
3. Fetch new/modified messages
4. Update local database

### Rate Limits and Quotas

| Limit Type | Value | Notes |
|------------|-------|-------|
| Daily quota | 1,000,000,000 quota units | Per project |
| Per-user rate limit | 250 quota units/second | Sustained |
| Messages.list | 5 units | Per call |
| Messages.get | 5 units | Per call |
| Messages.send | 100 units | Per call |
| Batch requests | 100 requests/batch | Helps with quota |

**Sending Limits (Google Workspace):**
- 2,000 emails/day (most plans)
- 500 emails/day (trial accounts)
- 500 recipients/message

### Pricing Implications

| Component | Cost |
|-----------|------|
| Gmail API | Free (within quotas) |
| Google Cloud Pub/Sub | $40/TiB data delivered |
| Cloud Functions (if used) | Pay per invocation |
| OAuth verification | Free (but time investment) |

**Estimated Monthly Cost (1,000 users, 10,000 emails/day):**
- Pub/Sub: ~$1-5/month
- Negligible for MVP scale

### Pros

1. **Market Penetration:** Strong adoption in SMB and startups
2. **Developer Experience:** Excellent documentation and SDKs
3. **Thread Model:** Native conversation threading
4. **Search:** Powerful Gmail search syntax
5. **Labels:** Flexible categorization system
6. **Free Tier:** Generous quotas for development

### Cons

1. **OAuth Verification:** Lengthy approval process for restricted scopes
2. **Pub/Sub Complexity:** Requires additional Google Cloud setup
3. **Watch Renewal:** Must renew every 7 days per mailbox
4. **Raw Format:** Send requires RFC 2822 encoding (more complex)
5. **Enterprise Market:** Lower adoption in corporate real estate

---

## Microsoft Graph API

### Overview

Microsoft Graph provides unified access to Microsoft 365 services including Outlook mail. It offers native webhook support via change notifications and integrates with Azure AD for authentication.

### Authentication

**Method:** OAuth 2.0 via Azure AD (Microsoft Entra ID)

**Required Scopes (Minimal for MVP):**

| Scope | Purpose | Admin Consent |
|-------|---------|---------------|
| `Mail.Read` | Read user's mail | No (delegated) |
| `Mail.ReadWrite` | Read/write mail (archive, move) | No (delegated) |
| `Mail.Send` | Send mail as user | No (delegated) |
| `User.Read` | Read user profile | No |

**Optional Scopes:**
| Scope | Purpose | Admin Consent |
|-------|---------|---------------|
| `Mail.Read.Shared` | Access shared mailboxes | No |
| `Mail.Send.Shared` | Send on behalf | No |

**Authentication Flow:**
1. User clicks "Connect Outlook"
2. Redirect to Microsoft login
3. User consents to permissions
4. Receive authorization code
5. Exchange for access_token + refresh_token
6. Store encrypted tokens

**Token Lifecycle:**
- Access token: 1 hour expiry (configurable)
- Refresh token: 90 days (sliding window)
- Single-page apps: May use continuous access evaluation

**Azure AD App Registration:**
- Register app in Azure portal
- Configure redirect URIs
- No lengthy verification for delegated permissions
- Application permissions require admin consent

### Read Capabilities

| Feature | Endpoint | Notes |
|---------|----------|-------|
| List messages | `GET /me/messages` | With OData query support |
| Get message | `GET /me/messages/{id}` | Full message |
| List folders | `GET /me/mailFolders` | Inbox, Sent, Drafts, etc. |
| Get folder | `GET /me/mailFolders/{id}/messages` | Messages in folder |
| List categories | `GET /me/outlook/masterCategories` | Color-coded categories |
| Search | `GET /me/messages?$search=` | KQL search syntax |

**Query Capabilities (OData):**
- `$select`: Choose specific fields
- `$filter`: Filter by criteria
- `$orderby`: Sort results
- `$top/$skip`: Pagination
- `$expand`: Include related data
- `$search`: Full-text search

**Message Properties:**
- Full HTML/text body
- Headers (Internet message headers available)
- Attachments (inline and file)
- Categories and importance
- Conversation ID for threading

### Send Capabilities

| Feature | Endpoint | Notes |
|---------|----------|-------|
| Send message | `POST /me/sendMail` | JSON body format |
| Create draft | `POST /me/messages` | Save without sending |
| Reply | `POST /me/messages/{id}/reply` | Built-in reply |
| Reply all | `POST /me/messages/{id}/replyAll` | Built-in reply all |
| Forward | `POST /me/messages/{id}/forward` | Built-in forward |

**Send Request Example:**
```json
POST /me/sendMail
{
  "message": {
    "subject": "Hello",
    "body": {
      "contentType": "HTML",
      "content": "<p>Hello World</p>"
    },
    "toRecipients": [
      {"emailAddress": {"address": "user@example.com"}}
    ]
  },
  "saveToSentItems": true
}
```

**Key Advantage:** JSON format is simpler than RFC 2822

### Webhook Support (Change Notifications)

**Architecture:** Native Microsoft Graph Subscriptions

**Setup Requirements:**
1. Register Azure AD app
2. Create HTTPS endpoint for notifications
3. Create subscription via API
4. Handle validation request
5. Process change notifications

**Subscription Request:**
```json
POST /subscriptions
{
  "changeType": "created,updated,deleted",
  "notificationUrl": "https://api.reil-q.com/webhooks/outlook",
  "resource": "me/mailFolders('Inbox')/messages",
  "expirationDateTime": "2025-01-07T11:00:00Z",
  "clientState": "secretClientValue"
}
```

**Subscription Limits:**
- Maximum expiration: 7 days (10,080 minutes) for mail
- Rich notifications (with data): 1 day maximum
- Must renew before expiration

**Notification Content:**
```json
{
  "value": [
    {
      "subscriptionId": "...",
      "changeType": "created",
      "resource": "Users/{id}/messages/{messageId}",
      "resourceData": {
        "@odata.type": "#Microsoft.Graph.Message",
        "id": "..."
      }
    }
  ]
}
```

**Advantages over Pub/Sub:**
- Native integration (no separate service)
- Simpler setup
- Resource ID included in notification

### Rate Limits and Quotas

| Limit Type | Value | Notes |
|------------|-------|-------|
| Requests per 10 minutes | 10,000 | Per app per mailbox |
| Concurrent requests | 4 | Per app per mailbox |
| Upload limit | 150 MB | Per 5-minute period |
| Batch requests | 20 requests/batch | JSON batching |

**Sending Limits (Exchange Online):**
- 10,000 recipients/day
- 30 messages/minute
- 1,000 recipients/message

**Throttling Response:**
- HTTP 429 Too Many Requests
- Retry-After header in seconds
- Use exponential backoff

### Pricing Implications

| Component | Cost |
|-----------|------|
| Microsoft Graph API | Free (within limits) |
| Azure AD App | Free |
| Change notifications | Free |

**Microsoft 365 License Required:**
- Users need Microsoft 365 license
- Business Basic: $6/user/month
- Business Standard: $12.50/user/month
- Enterprise E3: $36/user/month

**Note:** API is free; users pay for their Microsoft 365 subscription.

### Pros

1. **Enterprise Dominance:** 80%+ market share in corporate environments
2. **Real Estate Alignment:** Most real estate professionals use Outlook
3. **Native Webhooks:** Simpler than Pub/Sub
4. **JSON Format:** Easier send implementation
5. **Built-in Reply/Forward:** Dedicated endpoints
6. **Shared Mailbox Support:** Native with proper scopes
7. **No Verification Delay:** Faster time to market

### Cons

1. **Subscription Renewal:** 7-day max (same as Gmail watch)
2. **Azure Portal Complexity:** More complex than Google Cloud Console
3. **Rate Limits:** Per-mailbox limits may impact high-volume users
4. **Thread Model:** Less elegant than Gmail's
5. **Categories vs Labels:** Less flexible than Gmail labels

---

## Comparison Matrix

| Feature | Gmail API | Microsoft Graph | Winner |
|---------|-----------|-----------------|--------|
| **Authentication Complexity** | High (verification required) | Medium | Microsoft |
| **Time to Production** | 4-6 weeks (verification) | 1-2 weeks | Microsoft |
| **Read Messages** | Full support | Full support | Tie |
| **Send Messages** | RFC 2822 (complex) | JSON (simple) | Microsoft |
| **Reply/Forward** | Manual construction | Native endpoints | Microsoft |
| **Thread Support** | Native threads | Conversation ID | Gmail |
| **Search** | Gmail syntax (powerful) | KQL (powerful) | Tie |
| **Webhooks** | Pub/Sub (separate service) | Native subscriptions | Microsoft |
| **Webhook Expiry** | 7 days | 7 days | Tie |
| **Rate Limits** | Generous | Per-mailbox | Gmail |
| **Documentation** | Excellent | Good | Gmail |
| **SDK Quality** | Excellent | Good | Gmail |
| **Personal Account Support** | Yes | Yes | Tie |
| **Enterprise Support** | Limited | Excellent | Microsoft |
| **Shared Mailbox** | Limited | Native | Microsoft |

### Market Share Consideration

**Real Estate Industry Email Usage:**

| Provider | Estimated Share | Notes |
|----------|-----------------|-------|
| Microsoft 365 | 65-75% | Dominant in brokerages, title companies |
| Google Workspace | 15-25% | Popular with independent agents |
| Other | 5-10% | Yahoo, custom domains |

**Why Microsoft Dominates in Real Estate:**
1. Integration with MLS systems that often use Windows
2. Existing relationships with enterprise vendors
3. Outlook perceived as more "professional"
4. Calendar integration with showing software
5. Legacy Exchange deployments

### Implementation Complexity

| Aspect | Gmail | Microsoft Graph |
|--------|-------|-----------------|
| Initial Setup | Medium | Medium |
| OAuth Flow | Similar | Similar |
| Webhook Setup | Complex (Pub/Sub) | Simple (native) |
| Message Parsing | Medium | Easy |
| Send Implementation | Complex (RFC 2822) | Easy (JSON) |
| Testing | Good sandbox | Good sandbox |
| Error Handling | Standard HTTP | Standard HTTP |

### Long-term Maintenance

| Aspect | Gmail | Microsoft Graph |
|--------|-------|-----------------|
| Token Refresh | Standard | Standard |
| Webhook Renewal | Daily cron needed | Daily cron needed |
| API Versioning | Stable | Active development |
| Breaking Changes | Rare | Occasional |
| Support | Community + Paid | Community + Paid |

---

## Security Considerations

### Data Handling

| Aspect | Gmail | Microsoft Graph |
|--------|-------|-----------------|
| TLS Required | Yes | Yes |
| Token Encryption | Required | Required |
| PII in Notifications | No | Optional (rich) |
| Audit Logging | Available | Available |
| Data Residency | Configurable | Configurable |

### Compliance

| Standard | Gmail | Microsoft Graph |
|----------|-------|-----------------|
| SOC 2 | Yes | Yes |
| HIPAA | Yes (BAA available) | Yes (BAA available) |
| GDPR | Yes | Yes |
| CCPA | Yes | Yes |

---

## Recommendation

### Primary Platform: Microsoft Graph API

**Rationale:**

1. **Market Alignment (Critical):** 65-75% of target real estate users are on Microsoft 365. Building for the majority maximizes initial impact and reduces user friction.

2. **Faster Time to Market:** No OAuth verification delay means we can ship the inbox feature 4-6 weeks sooner.

3. **Simpler Implementation:**
   - JSON-based message format for sending
   - Native reply/forward endpoints
   - Built-in webhook support without Pub/Sub

4. **Enterprise Features:** Shared mailbox support is essential for team-based real estate operations (transaction coordinators, assistants).

5. **Lower Complexity:** Single platform (Azure) vs. dual platform (Google Cloud + OAuth verification).

### Secondary Platform: Gmail API (Future Sprint)

**Timeline:** Sprint 0.3 or 0.4

**Approach:**
1. Abstract email provider interface now
2. Implement Microsoft Graph first
3. Add Gmail support for the 25-35% using Google Workspace
4. Provider selection during onboarding

### Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Microsoft API changes | Version pinning, monitoring deprecations |
| Rate limit issues | Queue-based processing, batch operations |
| Token expiration | Proactive refresh, error handling |
| Webhook failures | Fallback to polling, retry logic |

---

## Uncertainties and Open Questions

1. **Hybrid Users:** How do we handle users with both Gmail and Outlook? (Recommendation: Pick primary during onboarding)

2. **Personal vs Work Accounts:** Should we support personal Microsoft accounts? (Recommendation: Yes, but document limitations)

3. **Shared Mailbox Licensing:** Confirm licensing requirements for shared mailbox access

4. **Historical Sync Depth:** How far back should we sync on initial connect? (Recommendation: 90 days)

5. **Attachment Storage:** Where do we store large attachments? (Needs separate decision doc)

---

## References

- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Gmail API Push Notifications](https://developers.google.com/gmail/api/guides/push)
- [Microsoft Graph Mail API](https://learn.microsoft.com/en-us/graph/api/resources/mail-api-overview)
- [Microsoft Graph Permissions Reference](https://learn.microsoft.com/en-us/graph/permissions-reference)
- [Microsoft Graph Throttling](https://learn.microsoft.com/en-us/graph/throttling)
- [Exchange Online Limits](https://learn.microsoft.com/en-us/office365/servicedescriptions/exchange-online-service-description/exchange-online-limits)

---

*Document Owner: email-admin-agent*
*Next Review: After platform decision approval*
