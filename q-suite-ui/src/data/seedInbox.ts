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
  {
    id: 'thr-007',
    subject: 'Property Inspection Report - 123 Main St',
    from: { name: 'Robert Martinez', email: 'rmartinez@inspections.com' },
    preview:
      'Attached is the complete inspection report for the property at 123 Main Street. All systems checked out well...',
    timestamp: '4 days ago',
    isUnread: false,
    hasAttachments: true,
    attachmentCount: 1,
    linkedRecord: { type: 'Property', name: '123 Main St' },
    labels: [],
  },
  {
    id: 'thr-008',
    subject: 'Closing Documents Ready for Review',
    from: { name: 'Jennifer Lee', email: 'jlee@legalpartners.com' },
    preview:
      'All closing documents have been prepared and are ready for your review. Please let me know if you have any questions...',
    timestamp: '5 days ago',
    isUnread: true,
    hasAttachments: true,
    attachmentCount: 8,
    linkedRecord: { type: 'Deal', name: 'Oakwood Acquisition' },
    labels: ['Important'],
  },
  {
    id: 'thr-009',
    subject: 'Quarterly Financial Summary',
    from: { name: 'Thomas Wright', email: 'twright@financegroup.com' },
    preview:
      'Here is the Q4 financial summary for your review. Key highlights include strong revenue growth...',
    timestamp: '1 week ago',
    isUnread: false,
    hasAttachments: true,
    attachmentCount: 2,
    linkedRecord: null,
    labels: [],
  },
  {
    id: 'thr-010',
    subject: 'Meeting Request: Portfolio Review',
    from: { name: 'Amanda Foster', email: 'afoster@capital.com' },
    preview:
      'Would you be available for a portfolio review meeting next week? I\'d like to discuss the performance metrics...',
    timestamp: '1 week ago',
    isUnread: false,
    hasAttachments: false,
    attachmentCount: 0,
    linkedRecord: { type: 'Contact', name: 'Amanda Foster' },
    labels: [],
  },
  {
    id: 'thr-011',
    subject: 'Due Diligence Checklist - Updated',
    from: { name: 'Christopher Brown', email: 'cbrown@ddservices.com' },
    preview:
      'I\'ve updated the due diligence checklist based on our last conversation. Please review the new items...',
    timestamp: '1 week ago',
    isUnread: true,
    hasAttachments: true,
    attachmentCount: 1,
    linkedRecord: { type: 'Deal', name: 'Tech Startup Alpha' },
    labels: ['Urgent'],
  },
  {
    id: 'thr-012',
    subject: 'Property Valuation Report',
    from: { name: 'Maria Garcia', email: 'mgarcia@appraisals.com' },
    preview:
      'The valuation report for the commercial property is complete. The appraised value is $2.5M...',
    timestamp: '2 weeks ago',
    isUnread: false,
    hasAttachments: true,
    attachmentCount: 1,
    linkedRecord: { type: 'Property', name: 'Commercial Plaza' },
    labels: [],
  },
  {
    id: 'thr-013',
    subject: 'Contract Amendment Request',
    from: { name: 'Daniel Kim', email: 'dkim@lawfirm.com' },
    preview:
      'The client has requested an amendment to Section 4.2 of the contract. I\'ve drafted the changes...',
    timestamp: '2 weeks ago',
    isUnread: false,
    hasAttachments: true,
    attachmentCount: 1,
    linkedRecord: { type: 'Deal', name: 'Real Estate Fund II' },
    labels: [],
  },
  {
    id: 'thr-014',
    subject: 'Investment Committee Meeting Notes',
    from: { name: 'Patricia White', email: 'pwhite@committee.com' },
    preview:
      'Attached are the meeting notes from yesterday\'s investment committee session. Key decisions include...',
    timestamp: '2 weeks ago',
    isUnread: false,
    hasAttachments: true,
    attachmentCount: 1,
    linkedRecord: null,
    labels: [],
  },
  {
    id: 'thr-015',
    subject: 'Property Management Update',
    from: { name: 'Kevin Johnson', email: 'kjohnson@pmgroup.com' },
    preview:
      'Monthly property management report for all managed properties. Occupancy rates remain strong...',
    timestamp: '3 weeks ago',
    isUnread: false,
    hasAttachments: true,
    attachmentCount: 1,
    linkedRecord: { type: 'Property', name: 'Residential Complex' },
    labels: [],
  },
  {
    id: 'thr-016',
    subject: 'Partnership Agreement - Final Draft',
    from: { name: 'Rachel Green', email: 'rgreen@legal.com' },
    preview:
      'The final draft of the partnership agreement is ready for signature. Please review and let me know...',
    timestamp: '3 weeks ago',
    isUnread: true,
    hasAttachments: true,
    attachmentCount: 3,
    linkedRecord: { type: 'Deal', name: 'Strategic Partnership' },
    labels: ['Important'],
  },
  {
    id: 'thr-017',
    subject: 'Market Analysis - Q4 Trends',
    from: { name: 'Steven Adams', email: 'sadams@research.com' },
    preview:
      'Our Q4 market analysis shows interesting trends in the commercial real estate sector...',
    timestamp: '3 weeks ago',
    isUnread: false,
    hasAttachments: true,
    attachmentCount: 1,
    linkedRecord: null,
    labels: [],
  },
  {
    id: 'thr-018',
    subject: 'Tenant Lease Renewal Notice',
    from: { name: 'Laura Mitchell', email: 'lmitchell@properties.com' },
    preview:
      'The tenant at 456 Oak Avenue has requested a lease renewal. Terms are favorable...',
    timestamp: '1 month ago',
    isUnread: false,
    hasAttachments: false,
    attachmentCount: 0,
    linkedRecord: { type: 'Property', name: '456 Oak Avenue' },
    labels: [],
  },
  {
    id: 'thr-019',
    subject: 'Investment Opportunity - New Fund',
    from: { name: 'Brian Taylor', email: 'btaylor@investments.com' },
    preview:
      'I wanted to introduce you to a new investment opportunity in our latest fund. Minimum investment is $500K...',
    timestamp: '1 month ago',
    isUnread: false,
    hasAttachments: true,
    attachmentCount: 2,
    linkedRecord: { type: 'Deal', name: 'Growth Fund III' },
    labels: [],
  },
  {
    id: 'thr-020',
    subject: 'Property Tax Assessment Review',
    from: { name: 'Nicole Clark', email: 'nclark@taxservices.com' },
    preview:
      'The annual property tax assessment has been received. I recommend we file an appeal based on...',
    timestamp: '1 month ago',
    isUnread: false,
    hasAttachments: true,
    attachmentCount: 1,
    linkedRecord: { type: 'Property', name: 'Industrial Warehouse' },
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
