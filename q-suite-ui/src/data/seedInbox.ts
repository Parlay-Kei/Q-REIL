import type { ThreadRow, MessageRow } from '../types/inbox';
import type { InboxItemRow } from '../types/reil-core';

/** Seed thread list for dev fallback when VITE_USE_INBOX_SEED_DATA=true */
export const SEED_THREADS: ThreadRow[] = [
  {
    id: 'thr-001',
    subject: 'RE: Q3 Investment Proposal - Final Review',
    from: { name: 'James Wilson', email: 'james@meridiancp.com' },
    preview:
      'Following up on our discussion about the investment terms. I have reviewed the latest draft and have a few comments...',
    timestamp: '10:42 AM',
    isUnread: true,
    hasAttachments: true,
    attachmentCount: 3,
    linkedRecord: null,
    labels: ['Important'],
  },
  {
    id: 'thr-002',
    subject: 'Due Diligence Documents - Apex Holdings',
    from: { name: 'Sarah Chen', email: 'sarah@apexholdings.com' },
    preview:
      'Please find attached the requested financial statements and audit reports for your review...',
    timestamp: '9:15 AM',
    isUnread: true,
    hasAttachments: true,
    attachmentCount: 5,
    linkedRecord: { type: 'Deal', name: 'Apex Holdings' },
    labels: [],
  },
  {
    id: 'thr-003',
    subject: 'Contract Review - Urgent Action Required',
    from: { name: 'Michael Torres', email: 'mtorres@pinnacle.io' },
    preview:
      'Our legal team has reviewed the contract and has some concerns regarding the liability clauses...',
    timestamp: 'Yesterday',
    isUnread: false,
    hasAttachments: true,
    attachmentCount: 1,
    linkedRecord: { type: 'Deal', name: 'Pinnacle Investments' },
    labels: ['Urgent'],
  },
  {
    id: 'thr-004',
    subject: 'Partnership Opportunity Discussion',
    from: { name: 'Emily Park', email: 'emily@horizongroup.com' },
    preview:
      'I wanted to reach out regarding a potential partnership opportunity that I believe could be mutually beneficial...',
    timestamp: 'Yesterday',
    isUnread: false,
    hasAttachments: false,
    attachmentCount: 0,
    linkedRecord: null,
    labels: [],
  },
  {
    id: 'thr-005',
    subject: 'Meeting Follow-up: Sterling Partners',
    from: { name: 'David Kim', email: 'dkim@sterling.com' },
    preview:
      'Thank you for taking the time to meet with us yesterday. As discussed, I am attaching the proposal...',
    timestamp: '2 days ago',
    isUnread: false,
    hasAttachments: true,
    attachmentCount: 2,
    linkedRecord: { type: 'Contact', name: 'David Kim' },
    labels: [],
  },
  {
    id: 'thr-006',
    subject: 'RE: Budget Approval Request',
    from: { name: 'Lisa Anderson', email: 'lisa@venturecap.com' },
    preview:
      'The budget has been approved by the board. Please proceed with the next steps as outlined...',
    timestamp: '3 days ago',
    isUnread: false,
    hasAttachments: false,
    attachmentCount: 0,
    linkedRecord: { type: 'Deal', name: 'Venture Capital Fund' },
    labels: [],
  },
];

/**
 * Map seed threads to InboxItemRow for REIL Core Inbox when DAL returns no rows (live fallback).
 * Mission: ENGDEL-REIL-UI-LIVE-SWITCH-0027.
 */
export function seedThreadsAsReilItems(): InboxItemRow[] {
  return SEED_THREADS.map((t) => ({
    id: t.id,
    idempotencyKey: `seed-${t.id}`,
    sourceType: 'seed',
    normalized: false,
    normalizedType: null,
    createdAt: new Date().toISOString(),
    sender: t.from.name ? `${t.from.name} <${t.from.email}>` : t.from.email,
    date: t.timestamp,
    type: 'message',
    reviewRequired: false,
    subject: t.subject,
    preview: t.preview.slice(0, 120),
    hasAttachments: t.hasAttachments,
    attachmentCount: t.attachmentCount,
    linkedRecord: t.linkedRecord,
    matchStatus: null,
    itemConfidence: null,
  }));
}

/** Seed messages for thread thr-001 (dev fallback). */
export const SEED_MESSAGES: MessageRow[] = [
  {
    id: 'msg-001',
    from: { name: 'James Wilson', email: 'james@meridiancp.com' },
    to: [{ name: 'Alex Morgan', email: 'alex@stratanoble.com' }],
    timestamp: 'Today at 10:42 AM',
    content: `Hi Alex,

Following up on our discussion about the investment terms. I have reviewed the latest draft and have a few comments that I'd like to discuss.

The key points are:
1. The valuation methodology needs clarification in Section 3.2
2. We'd like to propose an adjustment to the liquidation preferences
3. The timeline for the due diligence process seems aggressive

Could we schedule a call this week to go through these items? I'm available Thursday or Friday afternoon.

Best regards,
James`,
    attachments: [
      { name: 'Investment_Terms_v3.pdf', type: 'pdf', size: '2.4 MB' },
      { name: 'Financial_Model.xlsx', type: 'xlsx', size: '1.8 MB' },
    ],
  },
  {
    id: 'msg-002',
    from: { name: 'Alex Morgan', email: 'alex@stratanoble.com' },
    to: [{ name: 'James Wilson', email: 'james@meridiancp.com' }],
    timestamp: 'Yesterday at 4:15 PM',
    content: `James,

Thank you for the detailed feedback. I've noted all your points and will prepare responses for our call.

Thursday at 2 PM works well for me. I'll send a calendar invite shortly.

In the meantime, I'm attaching the updated due diligence checklist that addresses some of your timeline concerns.

Best,
Alex`,
    attachments: [{ name: 'DD_Checklist_Updated.pdf', type: 'pdf', size: '890 KB' }],
  },
  {
    id: 'msg-003',
    from: { name: 'James Wilson', email: 'james@meridiancp.com' },
    to: [{ name: 'Alex Morgan', email: 'alex@stratanoble.com' }],
    timestamp: 'Yesterday at 2:30 PM',
    content: `Alex,

I wanted to share the initial investment proposal for your review. This outlines our terms and expectations for the partnership.

Please let me know if you have any questions or concerns.

Best,
James`,
    attachments: [],
  },
];

/** Default subject for seed thread detail */
export const SEED_THREAD_SUBJECT = 'RE: Q3 Investment Proposal - Final Review';
