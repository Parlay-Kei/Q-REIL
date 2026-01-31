# Email Platform Decision Document

**Document ID:** EMAIL_PLATFORM_DECISION
**Version:** 1.0.0
**Created:** 2025-12-31
**Lane:** 5 (Inbox)
**Status:** DECISION PENDING APPROVAL
**Decision Maker:** email-admin-agent
**Approvers:** project-orchestrator, backend-dev

---

## Decision Summary

| Attribute | Value |
|-----------|-------|
| **Chosen Platform** | Microsoft Graph API |
| **Secondary Platform** | Gmail API (future sprint) |
| **Decision Confidence** | High |
| **Reversibility** | Medium (abstraction layer enables pivot) |

---

## The Decision

**REIL/Q will implement Microsoft Graph API as the primary email integration platform for MVP.**

Gmail API support will be added in a subsequent sprint (0.3 or 0.4) to capture the remaining market segment.

---

## Rationale

### 1. Target Market Alignment (Primary Factor)

Real estate professionals predominantly use Microsoft 365:

| Email Platform | Market Share | User Types |
|----------------|--------------|------------|
| Microsoft 365 / Outlook | 65-75% | Brokerages, title companies, large teams |
| Google Workspace | 15-25% | Independent agents, small teams |
| Other | 5-10% | Personal email, legacy systems |

**Implication:** Building for Microsoft first serves the majority of our target users immediately.

### 2. Time to Market (Critical for Sprint 0.1)

| Factor | Gmail API | Microsoft Graph |
|--------|-----------|-----------------|
| OAuth App Verification | 4-6 weeks | Not required for delegated |
| Initial Setup | 1 week | 1 week |
| **Total Time to Live** | **5-7 weeks** | **1-2 weeks** |

**Implication:** Microsoft Graph enables shipping 4-6 weeks sooner, critical for Sprint 0.1 timeline.

### 3. Technical Simplicity

| Capability | Gmail API | Microsoft Graph |
|------------|-----------|-----------------|
| Send Message Format | RFC 2822 (complex) | JSON (simple) |
| Reply to Message | Manual header construction | `POST /messages/{id}/reply` |
| Forward Message | Manual construction | `POST /messages/{id}/forward` |
| Webhook Setup | Pub/Sub (separate GCP service) | Native subscriptions |
| Shared Mailbox | Limited support | Native support |

**Implication:** Microsoft Graph reduces implementation complexity by ~30%.

### 4. Enterprise Feature Requirements

Real estate transaction management requires:

| Requirement | Gmail | Microsoft Graph |
|-------------|-------|-----------------|
| Shared mailbox for team inbox | Partial (delegation) | Full support |
| Send on behalf of | Limited | `Mail.Send.Shared` scope |
| Categories for organization | Labels (better) | Categories (adequate) |
| Calendar integration | Separate API | Same API |

**Implication:** Shared mailbox support is essential for transaction coordinator workflows.

### 5. Cost Considerations

| Component | Gmail | Microsoft Graph |
|-----------|-------|-----------------|
| API Access | Free | Free |
| Pub/Sub (webhooks) | ~$5/month | $0 (included) |
| User License | Google Workspace | Microsoft 365 |

**Implication:** No significant cost difference; users already have their email licenses.

---

## Trade-offs Acknowledged

### What We Gain

1. **Faster MVP delivery** - Ship 4-6 weeks sooner
2. **Majority user coverage** - 65-75% of target market
3. **Simpler implementation** - JSON messaging, native webhooks
4. **Enterprise readiness** - Shared mailbox support
5. **Single cloud dependency** - Azure only (if using Azure for other services)

### What We Accept

1. **Delayed Gmail support** - 25-35% of users wait for Sprint 0.3+
2. **Microsoft lock-in risk** - Mitigated by abstraction layer
3. **Less elegant threading** - Gmail's thread model is superior
4. **Azure portal complexity** - Steeper initial learning curve
5. **Rate limits per mailbox** - May impact power users

### What We Lose (Temporarily)

1. **Google Workspace users** - Cannot use inbox feature until Gmail integration
2. **Gmail search syntax** - Some users prefer Gmail's search operators
3. **Gmail labels flexibility** - Categories are less powerful than labels

---

## Implementation Architecture

### Abstraction Strategy

To enable future Gmail support, we will implement a provider abstraction layer:

```
                    ┌─────────────────────────┐
                    │    EmailProvider        │
                    │    (Interface)          │
                    ├─────────────────────────┤
                    │ + listMessages()        │
                    │ + getMessage()          │
                    │ + sendMessage()         │
                    │ + replyToMessage()      │
                    │ + createWebhook()       │
                    │ + refreshToken()        │
                    └───────────┬─────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
    │ MicrosoftGraph  │ │    GmailAPI     │ │    MockEmail    │
    │    Provider     │ │    Provider     │ │    Provider     │
    │   (Sprint 0.1)  │ │   (Sprint 0.3)  │ │    (Testing)    │
    └─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Database Schema Impact

User connection table supports multiple providers:

```sql
CREATE TABLE user_email_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  provider TEXT NOT NULL CHECK (provider IN ('microsoft', 'gmail')),
  email_address TEXT NOT NULL,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  webhook_subscription_id TEXT,
  webhook_expires_at TIMESTAMPTZ,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, email_address)
);
```

---

## Future Roadmap

### Phase 1: Microsoft Graph MVP (Sprint 0.1-0.2)

| Milestone | Timeline | Deliverable |
|-----------|----------|-------------|
| OAuth flow | Week 1 | Connect Outlook button |
| Read inbox | Week 2 | List and view messages |
| Send reply | Week 2 | Reply from REIL/Q |
| Webhooks | Week 3 | Real-time sync |
| Auto-attach | Week 3-4 | Rule-based attachment |

### Phase 2: Gmail Integration (Sprint 0.3-0.4)

| Milestone | Timeline | Deliverable |
|-----------|----------|-------------|
| OAuth verification | Submit Week 1 | Begin verification process |
| Provider abstraction | Week 1-2 | Refactor for multi-provider |
| Gmail OAuth flow | Week 2-3 | Connect Gmail button |
| Gmail read/send | Week 3-4 | Feature parity with Outlook |
| Pub/Sub webhooks | Week 4-5 | Real-time sync for Gmail |

### Phase 3: Advanced Features (Sprint 0.5+)

| Feature | Priority | Notes |
|---------|----------|-------|
| Multiple accounts | P1 | User has Outlook + Gmail |
| Email templates | P2 | Save and reuse common messages |
| Scheduled send | P2 | Delay delivery |
| Analytics | P3 | Response times, volume metrics |
| AI categorization | P3 | Auto-tag transaction type |

---

## Risk Mitigation

### Risk 1: Microsoft API Deprecation

| Aspect | Detail |
|--------|--------|
| Probability | Low |
| Impact | High |
| Mitigation | Pin to stable v1.0 endpoints; monitor deprecation notices |
| Contingency | Abstraction layer enables Gmail fallback |

### Risk 2: Gmail Users Churn Before Support

| Aspect | Detail |
|--------|--------|
| Probability | Medium |
| Impact | Medium |
| Mitigation | Communicate roadmap; offer waitlist; prioritize Gmail in 0.3 |
| Contingency | Manual email attachment workflow as interim |

### Risk 3: Rate Limiting Impacts Power Users

| Aspect | Detail |
|--------|--------|
| Probability | Low |
| Impact | Medium |
| Mitigation | Queue-based processing; batch operations; caching |
| Contingency | Implement polling fallback for high-volume users |

### Risk 4: Webhook Delivery Failures

| Aspect | Detail |
|--------|--------|
| Probability | Medium |
| Impact | Low |
| Mitigation | Retry logic; dead letter queue; periodic full sync |
| Contingency | Fall back to polling mode |

### Risk 5: Azure AD Configuration Complexity

| Aspect | Detail |
|--------|--------|
| Probability | Medium |
| Impact | Low |
| Mitigation | Detailed setup documentation; infrastructure as code |
| Contingency | Support team training; runbooks |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| OAuth completion rate | >90% | % of users who complete flow |
| Message sync latency | <5 seconds | Time from send to inbox display |
| Webhook reliability | >99.5% | % of notifications processed |
| User satisfaction | >4.0/5 | In-app feedback |
| Gmail user requests | Track | Volume of Gmail feature requests |

---

## Approval Checklist

- [ ] `project-orchestrator` approves strategic alignment
- [ ] `backend-dev` approves technical approach
- [ ] `auth-flow-agent` acknowledges OAuth implementation requirements
- [ ] `supabase-admin` approves schema additions
- [ ] `saas-security-auditor` approves security posture

---

## Decision Log

| Date | Actor | Action |
|------|-------|--------|
| 2025-12-31 | email-admin-agent | Created decision document |
| 2025-12-31 | email-admin-agent | Recommended Microsoft Graph |
| PENDING | project-orchestrator | Approval |

---

## References

- [CONNECTOR_EMAIL_FACT_SHEET.md](./CONNECTOR_EMAIL_FACT_SHEET.md) - Detailed platform comparison
- [email-admin-agent.md](../agents/email-admin-agent.md) - Agent specification
- [Execution-Packet_v0.1.md](../00_PROJECT/Execution-Packet_v0.1.md) - Sprint context

---

*Document Owner: email-admin-agent*
*Review Frequency: After each major sprint milestone*
