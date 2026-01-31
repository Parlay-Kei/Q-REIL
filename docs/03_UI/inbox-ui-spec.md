# Q Inbox UI Specification
**REIL/Q Sprint 0.2 - Gmail Integration**
**Version:** 1.0
**Last Updated:** 2025-12-31

---

## Overview

This document defines the complete UI implementation for the Q Inbox feature, including thread list, thread detail views, and record email integration. All components follow the Q Component Library standards with TypeScript, Tailwind CSS, and Framer Motion.

**Sprint Tickets:**
- FE-501: Q Inbox UI (Thread List & Detail)
- FE-502: Record View Email Tab

---

## Table of Contents

1. [Architecture](#architecture)
2. [Page: /inbox (Thread List)](#page-inbox-thread-list)
3. [Page: /inbox/thread/:id (Thread Detail)](#page-inboxthreadid-thread-detail)
4. [Record Email Integration](#record-email-integration)
5. [Component Library](#component-library)
6. [State Management](#state-management)
7. [API Integration](#api-integration)
8. [Responsive Design](#responsive-design)
9. [Testing Considerations](#testing-considerations)

---

## Architecture

### Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Data Fetching:** React Query v5
- **Forms:** React Hook Form + Zod
- **State:** Zustand (client state)
- **Icons:** Lucide React

### File Structure
```
src/
├── app/
│   └── inbox/
│       ├── page.tsx                    # Thread list page
│       ├── thread/
│       │   └── [id]/
│       │       └── page.tsx            # Thread detail page
│       └── layout.tsx                  # Inbox layout with nav
├── components/
│   └── inbox/
│       ├── ThreadListItem.tsx          # Thread row component
│       ├── ThreadFilters.tsx           # Filter bar with toggles
│       ├── ThreadSearchBar.tsx         # Search input
│       ├── MessageBubble.tsx           # Individual message display
│       ├── AttachmentChip.tsx          # File attachment display
│       ├── RecordLinkBadge.tsx         # Linked record badge
│       ├── AttachToModal.tsx           # Attach to record modal
│       ├── UnlinkedBanner.tsx          # Prompt for unlinked threads
│       ├── RecordEmailsTab.tsx         # Record view emails tab
│       ├── EmailTimeline.tsx           # Timeline integration
│       └── index.ts                    # Barrel export
├── hooks/
│   └── inbox/
│       ├── useThreads.ts               # Thread list query
│       ├── useThread.ts                # Thread detail query
│       ├── useLinkThread.ts            # Link mutation
│       ├── useUnlinkThread.ts          # Unlink mutation
│       └── useThreadSubscription.ts    # Real-time updates
├── lib/
│   └── inbox/
│       ├── types.ts                    # TypeScript interfaces
│       └── utils.ts                    # Helper functions
└── stores/
    └── inboxStore.ts                   # Client state (filters, selection)
```

---

## Page: /inbox (Thread List)

### Screenshot Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Q Inbox                                    [🔍 Search]  [⚙] │
├─────────────────────────────────────────────────────────────┤
│  [□ Unlinked only]  [📅 Last 30 days ▼]  [Clear filters]   │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 📧 Important property updates                         │  │
│  │ From: Ashley Thompson, +2                             │  │
│  │ 2 hours ago • [Contact: Ashley] [Deal: Oak Street]   │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 🔗 Re: Inspection scheduled                          │  │
│  │ From: John Inspector                                  │  │
│  │ 5 hours ago • ⚠ Unlinked                             │  │
│  └───────────────────────────────────────────────────────┘  │
│  ...                                                         │
│  [← Prev]  Page 1 of 5  [Next →]                           │
└─────────────────────────────────────────────────────────────┘
```

### Page Component

```tsx
// src/app/inbox/page.tsx

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Inbox as InboxIcon } from 'lucide-react';
import {
  ThreadListItem,
  ThreadFilters,
  ThreadSearchBar,
  UnlinkedBanner
} from '@/components/inbox';
import { EmptyState, LoadingSpinner } from '@/components';
import { useThreads } from '@/hooks/inbox/useThreads';
import { useInboxStore } from '@/stores/inboxStore';
import { staggerContainer, staggerItem } from '@/lib/motion';

export default function InboxPage() {
  const { filters, search } = useInboxStore();
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const { data, isLoading, error } = useThreads({
    page,
    pageSize,
    filters,
    search,
  });

  const threads = data?.threads || [];
  const totalPages = data?.totalPages || 1;
  const unlinkedCount = data?.unlinkedCount || 0;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EmptyState
          icon={InboxIcon}
          title="Failed to load inbox"
          description="There was an error loading your email threads. Please try again."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-surface-elevated/95 backdrop-blur-xl border-b border-border-emphasis">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Mail className="w-8 h-8 text-brand-primary" />
              <div>
                <h1 className="text-2xl font-bold text-text-primary">Q Inbox</h1>
                <p className="text-sm text-text-secondary">
                  {data?.totalCount || 0} threads
                </p>
              </div>
            </div>
            <ThreadSearchBar />
          </div>
          <ThreadFilters />
        </div>
      </div>

      {/* Unlinked Banner */}
      {unlinkedCount > 0 && !filters.unlinkedOnly && (
        <UnlinkedBanner count={unlinkedCount} />
      )}

      {/* Thread List */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : threads.length === 0 ? (
          <EmptyState
            icon={InboxIcon}
            title={search ? "No threads found" : "Your inbox is empty"}
            description={
              search
                ? "Try adjusting your search or filters"
                : "When you receive emails, they'll appear here"
            }
          />
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-3"
          >
            <AnimatePresence mode="popLayout">
              {threads.map((thread) => (
                <motion.div
                  key={thread.id}
                  variants={staggerItem}
                  layout
                  exit={{ opacity: 0, x: -100 }}
                >
                  <ThreadListItem thread={thread} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-surface-elevated text-text-primary
                         border border-border-emphasis hover:bg-surface-interactive
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors"
            >
              ← Previous
            </button>
            <span className="text-sm text-text-secondary">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg bg-surface-elevated text-text-primary
                         border border-border-emphasis hover:bg-surface-interactive
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Thread List Loading Skeleton

```tsx
// src/components/inbox/ThreadListSkeleton.tsx

import { motion } from 'framer-motion';

export const ThreadListSkeleton = () => {
  return (
    <div className="space-y-3">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="bg-surface-elevated border border-border-emphasis rounded-xl p-4"
        >
          {/* Subject line skeleton */}
          <div className="h-5 bg-surface-interactive rounded w-3/4 mb-3 animate-pulse" />

          {/* Participants skeleton */}
          <div className="flex items-center gap-2 mb-3">
            <div className="h-4 bg-surface-interactive rounded w-24 animate-pulse" />
            <div className="h-4 bg-surface-interactive rounded w-32 animate-pulse" />
          </div>

          {/* Footer skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-3 bg-surface-interactive rounded w-20 animate-pulse" />
            <div className="flex gap-2">
              <div className="h-6 bg-surface-interactive rounded w-16 animate-pulse" />
              <div className="h-6 bg-surface-interactive rounded w-16 animate-pulse" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
```

---

## Page: /inbox/thread/:id (Thread Detail)

### Screenshot Layout
```
┌─────────────────────────────────────────────────────────────┐
│  [← Back to Inbox]           Thread Detail                  │
├─────────────────────────────────────────────────────────────┤
│  Important property updates                                  │
│  From: Ashley Thompson • To: Me, John Buyer                  │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 📎 Attachments (2)                                      ││
│  │ [📄 contract.pdf] [📷 photo.jpg]                        ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 🔗 Linked Records                                       ││
│  │ [Contact: Ashley Thompson] [Deal: 123 Oak St]          ││
│  │ [+ Attach to...]                                        ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Ashley Thompson                        2 hours ago      ││
│  │ ──────────────────────────────────────────────────────  ││
│  │ Hi team, here are the latest updates...                ││
│  │ [Show full message ▼]                                  ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ John Buyer                             5 hours ago      ││
│  │ ──────────────────────────────────────────────────────  ││
│  │ Thanks for the update! Looking forward to...           ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Page Component

```tsx
// src/app/inbox/thread/[id]/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Paperclip, Link as LinkIcon, Plus } from 'lucide-react';
import {
  MessageBubble,
  AttachmentChip,
  RecordLinkBadge,
  AttachToModal,
} from '@/components/inbox';
import { Button, Badge, EmptyState, LoadingSpinner } from '@/components';
import { useThread } from '@/hooks/inbox/useThread';
import { useThreadSubscription } from '@/hooks/inbox/useThreadSubscription';
import { useLinkThread } from '@/hooks/inbox/useLinkThread';
import { useUnlinkThread } from '@/hooks/inbox/useUnlinkThread';
import { fadeIn } from '@/lib/motion';

interface ThreadDetailPageProps {
  params: {
    id: string;
  };
}

export default function ThreadDetailPage({ params }: ThreadDetailPageProps) {
  const router = useRouter();
  const [showAttachModal, setShowAttachModal] = useState(false);

  const { data: thread, isLoading, error } = useThread(params.id);
  useThreadSubscription(params.id); // Real-time updates

  const linkMutation = useLinkThread();
  const unlinkMutation = useUnlinkThread();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EmptyState
          icon={LinkIcon}
          title="Thread not found"
          description="This email thread doesn't exist or you don't have permission to view it."
        />
      </div>
    );
  }

  const allAttachments = thread.messages.flatMap((msg) => msg.attachments || []);
  const hasLinks = thread.linkedRecords && thread.linkedRecords.length > 0;

  const handleAttachToRecord = async (
    recordType: string,
    recordId: string
  ) => {
    await linkMutation.mutateAsync({
      threadId: thread.id,
      recordType,
      recordId,
    });
    setShowAttachModal(false);
  };

  const handleUnlink = async (linkId: string) => {
    await unlinkMutation.mutateAsync({ linkId });
  };

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-surface-elevated/95 backdrop-blur-xl border-b border-border-emphasis">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <button
            onClick={() => router.push('/inbox')}
            className="flex items-center gap-2 text-text-secondary hover:text-brand-primary
                       transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Inbox</span>
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                {thread.subject || '(No Subject)'}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
                <span>From: {thread.participantEmails[0]}</span>
                <span>•</span>
                <span>
                  To: {thread.participantEmails.slice(1).join(', ') || 'Me'}
                </span>
              </div>
            </div>

            {!hasLinks && (
              <Badge variant="warning" dot>
                Unlinked
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Attachments Section */}
        {allAttachments.length > 0 && (
          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            className="mb-6 bg-surface-elevated border border-border-emphasis rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Paperclip className="w-5 h-5 text-text-secondary" />
              <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                Attachments ({allAttachments.length})
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {allAttachments.map((attachment) => (
                <AttachmentChip key={attachment.id} attachment={attachment} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Linked Records Section */}
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          className="mb-6 bg-surface-elevated border border-border-emphasis rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <LinkIcon className="w-5 h-5 text-text-secondary" />
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
              Linked Records
            </h2>
          </div>

          {hasLinks ? (
            <div className="flex flex-wrap gap-2 mb-3">
              {thread.linkedRecords!.map((link) => (
                <RecordLinkBadge
                  key={link.id}
                  link={link}
                  onUnlink={() => handleUnlink(link.id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-secondary mb-3">
              This thread is not linked to any records yet.
            </p>
          )}

          <Button
            variant="secondary"
            size="sm"
            leftIcon={Plus}
            onClick={() => setShowAttachModal(true)}
          >
            Attach to...
          </Button>
        </motion.div>

        {/* Messages */}
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          className="space-y-4"
        >
          {thread.messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isFirst={index === 0}
            />
          ))}
        </motion.div>
      </div>

      {/* Attach to Record Modal */}
      <AttachToModal
        isOpen={showAttachModal}
        onClose={() => setShowAttachModal(false)}
        onAttach={handleAttachToRecord}
        threadSubject={thread.subject || '(No Subject)'}
      />
    </div>
  );
}
```

---

## Record Email Integration

### Emails Tab on Record Views

This tab appears on Deal, Property, and Contact record pages.

```tsx
// src/components/inbox/RecordEmailsTab.tsx

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Inbox as InboxIcon, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { EmptyState, LoadingSpinner, Badge } from '@/components';
import { useRecordThreads } from '@/hooks/inbox/useRecordThreads';
import { formatRelativeTime } from '@/lib/inbox/utils';
import { fadeIn, staggerContainer, staggerItem } from '@/lib/motion';
import type { RecordType } from '@/lib/inbox/types';

export interface RecordEmailsTabProps {
  recordType: RecordType;
  recordId: string;
}

export const RecordEmailsTab = ({ recordType, recordId }: RecordEmailsTabProps) => {
  const router = useRouter();
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());

  const { data, isLoading, error } = useRecordThreads({
    recordType,
    recordId,
  });

  const threads = data?.threads || [];

  const toggleThread = (threadId: string) => {
    setExpandedThreads((prev) => {
      const next = new Set(prev);
      if (next.has(threadId)) {
        next.delete(threadId);
      } else {
        next.add(threadId);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={InboxIcon}
        title="Failed to load emails"
        description="There was an error loading email threads. Please try again."
      />
    );
  }

  if (threads.length === 0) {
    return (
      <EmptyState
        icon={Mail}
        title="No emails linked yet"
        description={`No email threads have been linked to this ${recordType}.`}
      />
    );
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="space-y-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-text-secondary" />
          <h3 className="text-lg font-semibold text-text-primary">
            Email Threads ({threads.length})
          </h3>
        </div>
        <button
          onClick={() => router.push('/inbox')}
          className="flex items-center gap-2 text-sm text-brand-primary hover:text-brand-primary/80
                     transition-colors"
        >
          <span>View all in Inbox</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-3"
      >
        <AnimatePresence mode="popLayout">
          {threads.map((thread) => {
            const isExpanded = expandedThreads.has(thread.id);
            const latestMessage = thread.messages[0];

            return (
              <motion.div
                key={thread.id}
                variants={staggerItem}
                layout
                className="bg-surface-elevated border border-border-emphasis rounded-xl overflow-hidden
                           hover:border-brand-primary/30 transition-colors"
              >
                {/* Thread Header */}
                <button
                  onClick={() => toggleThread(thread.id)}
                  className="w-full p-4 text-left hover:bg-surface-interactive transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-base font-semibold text-text-primary flex-1 pr-4">
                      {thread.subject || '(No Subject)'}
                    </h4>
                    <span className="text-xs text-text-tertiary whitespace-nowrap">
                      {formatRelativeTime(thread.lastMessageAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-text-secondary">
                      From: {latestMessage.fromEmail}
                    </span>
                    {thread.messageCount > 1 && (
                      <Badge variant="neutral" className="text-[10px]">
                        {thread.messageCount} messages
                      </Badge>
                    )}
                    {thread.hasAttachments && (
                      <Badge variant="info" className="text-[10px]">
                        Has attachments
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-text-tertiary line-clamp-2">
                    {thread.snippet}
                  </p>
                </button>

                {/* Expanded Messages */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-border-subtle bg-surface-base/50"
                    >
                      <div className="p-4 space-y-3">
                        {thread.messages.slice(0, 3).map((message) => (
                          <div
                            key={message.id}
                            className="bg-surface-elevated rounded-lg p-3"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="text-sm font-medium text-text-primary">
                                  {message.fromName || message.fromEmail}
                                </p>
                                <p className="text-xs text-text-tertiary">
                                  {message.fromEmail}
                                </p>
                              </div>
                              <span className="text-xs text-text-tertiary">
                                {new Date(message.sentAt).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm text-text-secondary line-clamp-3">
                              {message.snippet}
                            </p>
                          </div>
                        ))}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/inbox/thread/${thread.id}`);
                          }}
                          className="w-full py-2 text-sm text-brand-primary hover:text-brand-primary/80
                                     transition-colors"
                        >
                          View full thread in Inbox →
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
```

### Email Timeline Integration

```tsx
// src/components/inbox/EmailTimeline.tsx

'use client';

import { motion } from 'framer-motion';
import { Mail, Paperclip, User } from 'lucide-react';
import { Badge } from '@/components';
import { formatRelativeTime } from '@/lib/inbox/utils';
import type { TimelineEmailEvent } from '@/lib/inbox/types';

export interface EmailTimelineProps {
  events: TimelineEmailEvent[];
}

export const EmailTimeline = ({ events }: EmailTimelineProps) => {
  return (
    <div className="space-y-0">
      {events.map((event, index) => {
        const isLast = index === events.length - 1;

        return (
          <div key={event.id} className="flex gap-4 pb-6 relative">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-border-subtle" />
            )}

            {/* Icon */}
            <div className="w-4 h-4 rounded-full mt-1 z-10 flex-shrink-0 bg-info ring-4 ring-surface-base" />

            {/* Content */}
            <div className="flex-1 pt-0.5">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-info" />
                  <h4 className="text-base font-semibold text-text-primary">
                    Email: {event.subject || '(No Subject)'}
                  </h4>
                </div>
                <span className="text-sm text-text-tertiary whitespace-nowrap ml-4">
                  {formatRelativeTime(event.timestamp)}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <User className="w-3.5 h-3.5 text-text-tertiary" />
                <span className="text-sm text-text-secondary">
                  {event.fromName || event.fromEmail}
                </span>
              </div>

              <p className="text-sm text-text-secondary mb-2 line-clamp-2">
                {event.snippet}
              </p>

              <div className="flex flex-wrap gap-2">
                <Badge variant="info" className="text-[10px]">
                  {event.messageCount} {event.messageCount === 1 ? 'message' : 'messages'}
                </Badge>
                {event.hasAttachments && (
                  <Badge variant="neutral" className="text-[10px]">
                    <Paperclip className="w-3 h-3 mr-1" />
                    Attachments
                  </Badge>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
```

---

## Component Library

### ThreadListItem

```tsx
// src/components/inbox/ThreadListItem.tsx

'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Paperclip, User } from 'lucide-react';
import { Badge } from '@/components';
import { RecordLinkBadge } from './RecordLinkBadge';
import { formatRelativeTime } from '@/lib/inbox/utils';
import { cn } from '@/lib/utils';
import type { MailThread } from '@/lib/inbox/types';

export interface ThreadListItemProps {
  thread: MailThread;
}

export const ThreadListItem = ({ thread }: ThreadListItemProps) => {
  const router = useRouter();
  const hasLinks = thread.linkedRecords && thread.linkedRecords.length > 0;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-surface-elevated border border-border-emphasis rounded-xl p-4
                 hover:border-brand-primary/30 hover:shadow-lg cursor-pointer
                 transition-all duration-200"
      onClick={() => router.push(`/inbox/thread/${thread.id}`)}
    >
      {/* Subject */}
      <div className="flex items-start justify-between mb-2">
        <h3 className={cn(
          "text-lg font-semibold flex-1 pr-4",
          !thread.isRead ? "text-text-primary" : "text-text-secondary"
        )}>
          {thread.subject || '(No Subject)'}
        </h3>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!thread.isRead && (
            <div className="w-2 h-2 rounded-full bg-brand-primary" />
          )}
          <span className="text-sm text-text-tertiary whitespace-nowrap">
            {formatRelativeTime(thread.lastMessageAt)}
          </span>
        </div>
      </div>

      {/* Participants */}
      <div className="flex items-center gap-2 mb-2 text-sm text-text-secondary">
        <User className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">
          From: {thread.participantEmails[0]}
          {thread.participantEmails.length > 1 &&
            `, +${thread.participantEmails.length - 1}`}
        </span>
      </div>

      {/* Snippet */}
      <p className="text-sm text-text-tertiary mb-3 line-clamp-2">
        {thread.snippet}
      </p>

      {/* Footer: Badges and Links */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {thread.messageCount > 1 && (
            <Badge variant="neutral" className="text-[10px]">
              {thread.messageCount} messages
            </Badge>
          )}
          {thread.hasAttachments && (
            <Badge variant="info" className="text-[10px]">
              <Paperclip className="w-3 h-3 mr-1" />
              {thread.attachmentCount || 1}
            </Badge>
          )}
          {!hasLinks && (
            <Badge variant="warning" dot className="text-[10px]">
              Unlinked
            </Badge>
          )}
        </div>

        {/* Linked Records */}
        {hasLinks && (
          <div className="flex flex-wrap gap-2 max-w-md">
            {thread.linkedRecords!.slice(0, 2).map((link) => (
              <RecordLinkBadge
                key={link.id}
                link={link}
                compact
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/${link.recordType}/${link.recordId}`);
                }}
              />
            ))}
            {thread.linkedRecords!.length > 2 && (
              <Badge variant="neutral" className="text-[10px]">
                +{thread.linkedRecords!.length - 2} more
              </Badge>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
```

### MessageBubble

```tsx
// src/components/inbox/MessageBubble.tsx

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, User, Clock } from 'lucide-react';
import { Avatar } from '@/components';
import { AttachmentChip } from './AttachmentChip';
import { cn } from '@/lib/utils';
import type { MailMessage } from '@/lib/inbox/types';

export interface MessageBubbleProps {
  message: MailMessage;
  isFirst?: boolean;
}

export const MessageBubble = ({ message, isFirst = false }: MessageBubbleProps) => {
  const [isExpanded, setIsExpanded] = useState(isFirst);

  const formattedTime = new Date(message.sentAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-elevated border border-border-emphasis rounded-xl overflow-hidden"
    >
      {/* Header (Always Visible) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left hover:bg-surface-interactive transition-colors"
      >
        <div className="flex items-start gap-3">
          <Avatar
            src={message.fromAvatar}
            alt={message.fromName || message.fromEmail}
            initials={message.fromName || message.fromEmail}
            size="md"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-base font-semibold text-text-primary truncate">
                  {message.fromName || message.fromEmail}
                </p>
                <p className="text-sm text-text-tertiary truncate">
                  {message.fromEmail}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Clock className="w-4 h-4 text-text-tertiary" />
                <span className="text-sm text-text-tertiary whitespace-nowrap">
                  {formattedTime}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-text-tertiary" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-text-tertiary" />
                )}
              </div>
            </div>

            {!isExpanded && (
              <p className="text-sm text-text-secondary line-clamp-2">
                {message.snippet}
              </p>
            )}
          </div>
        </div>
      </button>

      {/* Expanded Body */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border-subtle"
          >
            <div className="p-4">
              {/* Recipients */}
              {message.toEmails && message.toEmails.length > 0 && (
                <div className="mb-3 text-sm">
                  <span className="text-text-tertiary">To: </span>
                  <span className="text-text-secondary">
                    {message.toEmails.join(', ')}
                  </span>
                </div>
              )}

              {message.ccEmails && message.ccEmails.length > 0 && (
                <div className="mb-3 text-sm">
                  <span className="text-text-tertiary">Cc: </span>
                  <span className="text-text-secondary">
                    {message.ccEmails.join(', ')}
                  </span>
                </div>
              )}

              {/* Body */}
              <div
                className={cn(
                  "prose prose-sm max-w-none",
                  "prose-headings:text-text-primary",
                  "prose-p:text-text-primary prose-p:leading-relaxed",
                  "prose-a:text-brand-primary hover:prose-a:text-brand-primary/80",
                  "prose-strong:text-text-primary",
                  "prose-ul:text-text-primary prose-ol:text-text-primary"
                )}
                dangerouslySetInnerHTML={{
                  __html: message.bodyHtml || message.bodyPlain || '',
                }}
              />

              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border-subtle">
                  <h4 className="text-sm font-semibold text-text-primary mb-3">
                    Attachments ({message.attachments.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {message.attachments.map((attachment) => (
                      <AttachmentChip key={attachment.id} attachment={attachment} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
```

### AttachmentChip

```tsx
// src/components/inbox/AttachmentChip.tsx

'use client';

import { Download, File, Image, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { MailAttachment } from '@/lib/inbox/types';

export interface AttachmentChipProps {
  attachment: MailAttachment;
  onDownload?: () => void;
}

const getIconForMimeType = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.includes('pdf')) return FileText;
  return File;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const AttachmentChip = ({ attachment, onDownload }: AttachmentChipProps) => {
  const Icon = getIconForMimeType(attachment.mimeType || '');

  const handleDownload = async () => {
    if (onDownload) {
      onDownload();
      return;
    }

    // Default download behavior
    try {
      const response = await fetch(`/api/inbox/attachments/${attachment.id}/download`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download attachment:', error);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleDownload}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg",
        "bg-surface-interactive border border-border-emphasis",
        "hover:border-brand-primary/30 hover:bg-surface-elevated",
        "transition-all duration-200 group"
      )}
    >
      <Icon className="w-4 h-4 text-text-secondary group-hover:text-brand-primary transition-colors" />

      <div className="flex flex-col items-start min-w-0">
        <span className="text-sm font-medium text-text-primary truncate max-w-[200px]">
          {attachment.filename}
        </span>
        <span className="text-xs text-text-tertiary">
          {formatFileSize(attachment.sizeBytes)}
        </span>
      </div>

      <Download className="w-4 h-4 text-text-tertiary group-hover:text-brand-primary transition-colors ml-2" />
    </motion.button>
  );
};
```

### RecordLinkBadge

```tsx
// src/components/inbox/RecordLinkBadge.tsx

'use client';

import { X, User, Building, Home, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { RecordLink } from '@/lib/inbox/types';

export interface RecordLinkBadgeProps {
  link: RecordLink;
  compact?: boolean;
  onUnlink?: () => void;
  onClick?: (e: React.MouseEvent) => void;
}

const recordTypeIcons = {
  contact: User,
  company: Building,
  deal: FileText,
  property: Home,
  unit: Home,
  leasing: FileText,
};

const recordTypeColors = {
  contact: 'bg-success/10 text-success border-success/30',
  company: 'bg-info/10 text-info border-info/30',
  deal: 'bg-brand-primary/10 text-brand-primary border-brand-primary/30',
  property: 'bg-warning/10 text-warning border-warning/30',
  unit: 'bg-warning/10 text-warning border-warning/30',
  leasing: 'bg-brand-primary/10 text-brand-primary border-brand-primary/30',
};

export const RecordLinkBadge = ({
  link,
  compact = false,
  onUnlink,
  onClick,
}: RecordLinkBadgeProps) => {
  const Icon = recordTypeIcons[link.recordType as keyof typeof recordTypeIcons] || FileText;
  const colorClass = recordTypeColors[link.recordType as keyof typeof recordTypeColors] || 'bg-surface-interactive text-text-secondary border-border-emphasis';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border",
        "transition-all duration-200",
        colorClass,
        onClick && "cursor-pointer hover:shadow-md"
      )}
      onClick={onClick}
    >
      <Icon className="w-3.5 h-3.5" />

      {!compact && (
        <span className="text-xs font-medium uppercase tracking-wide">
          {link.recordType}:
        </span>
      )}

      <span className="text-xs font-semibold max-w-[150px] truncate">
        {link.recordName || link.recordId}
      </span>

      {link.confidence && link.confidence < 100 && (
        <span className="text-[10px] opacity-60">
          {link.confidence}%
        </span>
      )}

      {onUnlink && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUnlink();
          }}
          className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </motion.div>
  );
};
```

### AttachToModal

```tsx
// src/components/inbox/AttachToModal.tsx

'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, User, Building, Home, FileText } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { Input, Button, Badge, LoadingSpinner } from '@/components';
import { useSearchRecords } from '@/hooks/inbox/useSearchRecords';
import { cn } from '@/lib/utils';
import { scaleIn } from '@/lib/motion';
import type { RecordType } from '@/lib/inbox/types';

export interface AttachToModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttach: (recordType: RecordType, recordId: string) => Promise<void>;
  threadSubject: string;
}

const recordTypes: Array<{
  type: RecordType;
  label: string;
  icon: typeof User;
}> = [
  { type: 'contact', label: 'Contact', icon: User },
  { type: 'company', label: 'Company', icon: Building },
  { type: 'deal', label: 'Deal', icon: FileText },
  { type: 'property', label: 'Property', icon: Home },
];

export const AttachToModal = ({
  isOpen,
  onClose,
  onAttach,
  threadSubject,
}: AttachToModalProps) => {
  const [selectedType, setSelectedType] = useState<RecordType>('contact');
  const [search, setSearch] = useState('');
  const [isAttaching, setIsAttaching] = useState(false);

  const { data, isLoading } = useSearchRecords({
    recordType: selectedType,
    query: search,
  });

  const records = data?.records || [];

  const handleAttach = async (recordId: string) => {
    setIsAttaching(true);
    try {
      await onAttach(selectedType, recordId);
    } finally {
      setIsAttaching(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          static
          open={isOpen}
          onClose={onClose}
          className="relative z-[var(--z-modal)]"
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel
              as={motion.div}
              variants={scaleIn}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-surface-elevated rounded-2xl shadow-2xl border border-border-emphasis
                         max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-start justify-between p-6 border-b border-border-emphasis">
                <div className="flex-1">
                  <Dialog.Title className="text-xl font-bold text-text-primary mb-1">
                    Attach to Record
                  </Dialog.Title>
                  <Dialog.Description className="text-sm text-text-secondary line-clamp-1">
                    {threadSubject}
                  </Dialog.Description>
                </div>
                <button
                  onClick={onClose}
                  className="text-text-tertiary hover:text-text-primary transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Record Type Tabs */}
              <div className="flex gap-2 px-6 pt-4 border-b border-border-subtle">
                {recordTypes.map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedType(type);
                      setSearch('');
                    }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-t-lg",
                      "transition-all duration-200 font-medium",
                      selectedType === type
                        ? "bg-surface-base text-brand-primary border-t border-x border-border-emphasis"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-interactive"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="p-6 border-b border-border-subtle">
                <Input
                  placeholder={`Search ${recordTypes.find(t => t.type === selectedType)?.label.toLowerCase()}s...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  leftIcon={Search}
                  autoFocus
                />
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner />
                  </div>
                ) : records.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-text-secondary">
                      {search ? 'No results found' : `Search for a ${selectedType} to attach`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {records.map((record) => (
                      <motion.button
                        key={record.id}
                        whileHover={{ x: 4 }}
                        onClick={() => handleAttach(record.id)}
                        disabled={isAttaching}
                        className={cn(
                          "w-full flex items-start gap-3 p-3 rounded-lg",
                          "bg-surface-interactive border border-border-emphasis",
                          "hover:border-brand-primary/30 hover:bg-surface-elevated",
                          "transition-all duration-200 text-left",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold text-text-primary truncate">
                            {record.name}
                          </p>
                          {record.subtitle && (
                            <p className="text-sm text-text-secondary truncate">
                              {record.subtitle}
                            </p>
                          )}
                          {record.badges && record.badges.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {record.badges.map((badge, i) => (
                                <Badge key={i} variant="neutral" className="text-[10px]">
                                  {badge}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-border-emphasis">
                <Button variant="secondary" onClick={onClose} fullWidth>
                  Cancel
                </Button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};
```

### ThreadFilters

```tsx
// src/components/inbox/ThreadFilters.tsx

'use client';

import { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { Select, Badge } from '@/components';
import { useInboxStore } from '@/stores/inboxStore';
import { cn } from '@/lib/utils';

const dateRangeOptions = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'Last 30 days' },
  { value: '3months', label: 'Last 3 months' },
  { value: 'all', label: 'All time' },
];

export const ThreadFilters = () => {
  const { filters, setFilter, clearFilters } = useInboxStore();
  const hasActiveFilters = filters.unlinkedOnly || filters.dateRange !== 'month';

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Unlinked Only Toggle */}
      <button
        onClick={() => setFilter('unlinkedOnly', !filters.unlinkedOnly)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg",
          "transition-all duration-200 font-medium text-sm",
          filters.unlinkedOnly
            ? "bg-warning/10 text-warning border border-warning/30"
            : "bg-surface-interactive text-text-secondary border border-border-emphasis hover:border-brand-primary/30"
        )}
      >
        <input
          type="checkbox"
          checked={filters.unlinkedOnly}
          readOnly
          className="w-4 h-4 rounded border-2 border-current"
        />
        <span>Unlinked only</span>
      </button>

      {/* Date Range */}
      <div className="min-w-[180px]">
        <Select
          options={dateRangeOptions.map(opt => ({
            ...opt,
            icon: <Calendar className="w-4 h-4" />
          }))}
          value={filters.dateRange}
          onChange={(value) => setFilter('dateRange', value)}
          placeholder="Select date range"
        />
      </div>

      {/* Active Filters Count */}
      {hasActiveFilters && (
        <Badge variant="info" className="text-[10px]">
          {[filters.unlinkedOnly, filters.dateRange !== 'month'].filter(Boolean).length} active
        </Badge>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                     text-sm text-text-secondary hover:text-error
                     hover:bg-error/10 transition-colors"
        >
          <X className="w-4 h-4" />
          <span>Clear filters</span>
        </button>
      )}
    </div>
  );
};
```

### ThreadSearchBar

```tsx
// src/components/inbox/ThreadSearchBar.tsx

'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components';
import { useInboxStore } from '@/stores/inboxStore';
import { useDebounce } from '@/hooks/useDebounce';

export const ThreadSearchBar = () => {
  const { search, setSearch } = useInboxStore();
  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch, 300);

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const handleClear = () => {
    setLocalSearch('');
    setSearch('');
  };

  return (
    <div className="relative w-full max-w-md">
      <Input
        placeholder="Search threads..."
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        leftIcon={Search}
        rightIcon={localSearch ? X : undefined}
        className="pr-10"
      />
      {localSearch && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary
                     hover:text-text-primary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
```

### UnlinkedBanner

```tsx
// src/components/inbox/UnlinkedBanner.tsx

'use client';

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components';
import { useInboxStore } from '@/stores/inboxStore';
import { motion } from 'framer-motion';

export interface UnlinkedBannerProps {
  count: number;
}

export const UnlinkedBanner = ({ count }: UnlinkedBannerProps) => {
  const { setFilter } = useInboxStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-6 py-4"
    >
      <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-warning flex-shrink-0" />
          <div>
            <p className="text-base font-semibold text-text-primary">
              {count} unlinked {count === 1 ? 'thread' : 'threads'}
            </p>
            <p className="text-sm text-text-secondary">
              These emails haven't been linked to any records yet
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setFilter('unlinkedOnly', true)}
        >
          Show unlinked
        </Button>
      </div>
    </motion.div>
  );
};
```

---

## State Management

### Inbox Store (Zustand)

```typescript
// src/stores/inboxStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface InboxFilters {
  unlinkedOnly: boolean;
  dateRange: 'today' | 'week' | 'month' | '3months' | 'all';
}

interface InboxStore {
  filters: InboxFilters;
  search: string;
  setFilter: <K extends keyof InboxFilters>(
    key: K,
    value: InboxFilters[K]
  ) => void;
  setSearch: (search: string) => void;
  clearFilters: () => void;
}

const defaultFilters: InboxFilters = {
  unlinkedOnly: false,
  dateRange: 'month',
};

export const useInboxStore = create<InboxStore>()(
  persist(
    (set) => ({
      filters: defaultFilters,
      search: '',
      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        })),
      setSearch: (search) => set({ search }),
      clearFilters: () => set({ filters: defaultFilters, search: '' }),
    }),
    {
      name: 'inbox-storage',
      partialze: (state) => ({ filters: state.filters }), // Don't persist search
    }
  )
);
```

---

## API Integration

### React Query Hooks

```typescript
// src/hooks/inbox/useThreads.ts

import { useQuery } from '@tanstack/react-query';
import type { InboxFilters } from '@/stores/inboxStore';
import type { MailThread } from '@/lib/inbox/types';

interface UseThreadsParams {
  page: number;
  pageSize: number;
  filters: InboxFilters;
  search: string;
}

interface ThreadsResponse {
  threads: MailThread[];
  totalCount: number;
  totalPages: number;
  unlinkedCount: number;
}

export const useThreads = ({ page, pageSize, filters, search }: UseThreadsParams) => {
  return useQuery({
    queryKey: ['inbox', 'threads', page, pageSize, filters, search],
    queryFn: async (): Promise<ThreadsResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(filters.unlinkedOnly && { unlinkedOnly: 'true' }),
        ...(filters.dateRange && { dateRange: filters.dateRange }),
        ...(search && { search }),
      });

      const response = await fetch(`/api/inbox/threads?${params}`);
      if (!response.ok) throw new Error('Failed to fetch threads');
      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};
```

```typescript
// src/hooks/inbox/useThread.ts

import { useQuery } from '@tanstack/react-query';
import type { MailThread } from '@/lib/inbox/types';

export const useThread = (threadId: string) => {
  return useQuery({
    queryKey: ['inbox', 'thread', threadId],
    queryFn: async (): Promise<MailThread> => {
      const response = await fetch(`/api/inbox/threads/${threadId}`);
      if (!response.ok) throw new Error('Failed to fetch thread');
      return response.json();
    },
    staleTime: 60 * 1000, // 1 minute
  });
};
```

```typescript
// src/hooks/inbox/useLinkThread.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { RecordType } from '@/lib/inbox/types';

interface LinkThreadParams {
  threadId: string;
  recordType: RecordType;
  recordId: string;
}

export const useLinkThread = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ threadId, recordType, recordId }: LinkThreadParams) => {
      const response = await fetch(`/api/inbox/threads/${threadId}/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordType, recordId }),
      });

      if (!response.ok) throw new Error('Failed to link thread');
      return response.json();
    },
    onSuccess: (_, { threadId }) => {
      // Invalidate thread list and detail queries
      queryClient.invalidateQueries({ queryKey: ['inbox', 'threads'] });
      queryClient.invalidateQueries({ queryKey: ['inbox', 'thread', threadId] });
    },
  });
};
```

```typescript
// src/hooks/inbox/useUnlinkThread.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UnlinkThreadParams {
  linkId: string;
}

export const useUnlinkThread = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ linkId }: UnlinkThreadParams) => {
      const response = await fetch(`/api/inbox/links/${linkId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to unlink thread');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all inbox queries
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
    },
  });
};
```

```typescript
// src/hooks/inbox/useThreadSubscription.ts

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export const useThreadSubscription = (threadId: string) => {
  const queryClient = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    // Subscribe to real-time updates for this thread
    const channel = supabase
      .channel(`thread:${threadId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mail_messages',
          filter: `thread_id=eq.${threadId}`,
        },
        () => {
          // Invalidate thread query when messages change
          queryClient.invalidateQueries({ queryKey: ['inbox', 'thread', threadId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'record_links',
          filter: `source_id=eq.${threadId}`,
        },
        () => {
          // Invalidate when links change
          queryClient.invalidateQueries({ queryKey: ['inbox', 'thread', threadId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, queryClient, supabase]);
};
```

```typescript
// src/hooks/inbox/useRecordThreads.ts

import { useQuery } from '@tanstack/react-query';
import type { RecordType, MailThread } from '@/lib/inbox/types';

interface UseRecordThreadsParams {
  recordType: RecordType;
  recordId: string;
}

interface RecordThreadsResponse {
  threads: MailThread[];
}

export const useRecordThreads = ({ recordType, recordId }: UseRecordThreadsParams) => {
  return useQuery({
    queryKey: ['inbox', 'recordThreads', recordType, recordId],
    queryFn: async (): Promise<RecordThreadsResponse> => {
      const response = await fetch(
        `/api/inbox/records/${recordType}/${recordId}/threads`
      );
      if (!response.ok) throw new Error('Failed to fetch record threads');
      return response.json();
    },
    staleTime: 60 * 1000, // 1 minute
  });
};
```

```typescript
// src/hooks/inbox/useSearchRecords.ts

import { useQuery } from '@tanstack/react-query';
import type { RecordType } from '@/lib/inbox/types';

interface UseSearchRecordsParams {
  recordType: RecordType;
  query: string;
}

interface SearchResult {
  id: string;
  name: string;
  subtitle?: string;
  badges?: string[];
}

interface SearchRecordsResponse {
  records: SearchResult[];
}

export const useSearchRecords = ({ recordType, query }: UseSearchRecordsParams) => {
  return useQuery({
    queryKey: ['inbox', 'searchRecords', recordType, query],
    queryFn: async (): Promise<SearchRecordsResponse> => {
      if (!query || query.length < 2) {
        return { records: [] };
      }

      const params = new URLSearchParams({
        type: recordType,
        q: query,
      });

      const response = await fetch(`/api/inbox/search?${params}`);
      if (!response.ok) throw new Error('Failed to search records');
      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds
    enabled: query.length >= 2,
  });
};
```

---

## TypeScript Types

```typescript
// src/lib/inbox/types.ts

export type RecordType = 'contact' | 'company' | 'deal' | 'property' | 'unit' | 'leasing';
export type LinkMethod = 'rule' | 'manual' | 'system';

export interface MailThread {
  id: string;
  orgId: string;
  mailboxId: string;
  providerThreadId: string;
  subject: string | null;
  snippet: string | null;
  participantEmails: string[];
  messageCount: number;
  hasAttachments: boolean;
  attachmentCount?: number;
  lastMessageAt: string;
  firstMessageAt: string;
  isRead: boolean;
  labelIds: string[];
  createdAt: string;
  updatedAt: string;

  // Joined data
  messages: MailMessage[];
  linkedRecords?: RecordLink[];
}

export interface MailMessage {
  id: string;
  orgId: string;
  mailboxId: string;
  threadId: string;
  providerMessageId: string;
  fromEmail: string;
  fromName: string | null;
  fromAvatar?: string;
  toEmails: string[];
  ccEmails: string[];
  bccEmails: string[];
  subject: string | null;
  snippet: string | null;
  bodyPlain: string | null;
  bodyHtml: string | null;
  sentAt: string;
  internalDate: number;
  rawHeaders: Record<string, any>;
  labelIds: string[];
  hasAttachments: boolean;
  sizeEstimate: number;
  createdAt: string;

  // Joined data
  attachments?: MailAttachment[];
}

export interface MailAttachment {
  id: string;
  orgId: string;
  mailboxId: string;
  messageId: string;
  providerAttachmentId: string;
  filename: string;
  mimeType: string | null;
  sizeBytes: number;
  storagePath: string | null;
  sha256: string | null;
  createdAt: string;
}

export interface RecordLink {
  id: string;
  orgId: string;
  sourceType: 'message' | 'thread' | 'attachment' | 'document';
  sourceId: string;
  recordType: RecordType;
  recordId: string;
  recordName?: string; // Joined from record table
  confidence: number;
  linkMethod: LinkMethod;
  ruleName: string | null;
  linkedBy: string | null;
  linkedAt: string;
}

export interface TimelineEmailEvent {
  id: string;
  type: 'email';
  timestamp: string;
  subject: string | null;
  snippet: string;
  fromEmail: string;
  fromName: string | null;
  messageCount: number;
  hasAttachments: boolean;
  threadId: string;
}
```

---

## Utility Functions

```typescript
// src/lib/inbox/utils.ts

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};
```

---

## Responsive Design

### Mobile Breakpoints

All components use Tailwind's responsive utilities:

- **Mobile First:** Base styles target mobile (< 640px)
- **sm:** 640px+ (tablets portrait)
- **md:** 768px+ (tablets landscape)
- **lg:** 1024px+ (desktops)
- **xl:** 1280px+ (large desktops)

### Mobile Adaptations

```tsx
// Example: Mobile-optimized thread list item
<div className="
  flex flex-col gap-2        // Mobile: stack vertically
  md:flex-row md:items-start // Desktop: horizontal layout
">
  <h3 className="
    text-base md:text-lg      // Smaller text on mobile
    line-clamp-2 md:line-clamp-1 // More lines on mobile
  ">
    {thread.subject}
  </h3>
</div>
```

---

## Testing Considerations

### Component Testing

```typescript
// Example: ThreadListItem.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ThreadListItem } from './ThreadListItem';

const mockThread = {
  id: '1',
  subject: 'Test Thread',
  participantEmails: ['test@example.com'],
  lastMessageAt: new Date().toISOString(),
  messageCount: 1,
  hasAttachments: false,
  isRead: false,
  // ... other required fields
};

describe('ThreadListItem', () => {
  it('displays thread subject', () => {
    render(<ThreadListItem thread={mockThread} />);
    expect(screen.getByText('Test Thread')).toBeInTheDocument();
  });

  it('shows unread indicator for unread threads', () => {
    render(<ThreadListItem thread={mockThread} />);
    const unreadDot = screen.getByRole('status', { name: /unread/i });
    expect(unreadDot).toBeInTheDocument();
  });

  it('navigates to thread detail on click', () => {
    const { container } = render(<ThreadListItem thread={mockThread} />);
    const card = container.firstChild as HTMLElement;
    fireEvent.click(card);
    // Assert navigation occurred
  });
});
```

### Integration Testing

```typescript
// Example: Inbox page integration test
describe('Inbox Page', () => {
  it('loads and displays threads', async () => {
    render(<InboxPage />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Verify threads are displayed
    expect(screen.getAllByRole('article')).toHaveLength(50);
  });

  it('filters threads by unlinked status', async () => {
    render(<InboxPage />);

    const unlinkedToggle = screen.getByRole('checkbox', { name: /unlinked only/i });
    fireEvent.click(unlinkedToggle);

    // Verify filtered results
    await waitFor(() => {
      const threads = screen.getAllByRole('article');
      threads.forEach(thread => {
        expect(thread).toHaveTextContent('Unlinked');
      });
    });
  });
});
```

---

## Performance Optimizations

### Virtual Scrolling (Future Enhancement)

For large thread lists (1000+ items), consider using `react-virtual`:

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

const parentRef = useRef<HTMLDivElement>(null);

const virtualizer = useVirtualizer({
  count: threads.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 120, // Estimated row height
  overscan: 5,
});

return (
  <div ref={parentRef} className="h-screen overflow-auto">
    <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
      {virtualizer.getVirtualItems().map((virtualRow) => (
        <div
          key={virtualRow.index}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: `${virtualRow.size}px`,
            transform: `translateY(${virtualRow.start}px)`,
          }}
        >
          <ThreadListItem thread={threads[virtualRow.index]} />
        </div>
      ))}
    </div>
  </div>
);
```

### Image Optimization

```tsx
// Use Next.js Image component for avatars and attachments
import Image from 'next/image';

<Image
  src={message.fromAvatar}
  alt={message.fromName}
  width={40}
  height={40}
  className="rounded-full"
  loading="lazy"
/>
```

---

## Accessibility Checklist

- [ ] All interactive elements keyboard navigable
- [ ] Focus indicators visible (ring-2 ring-brand-primary)
- [ ] ARIA labels for icon-only buttons
- [ ] Semantic HTML (main, nav, article, aside)
- [ ] Screen reader announcements for dynamic updates
- [ ] Color contrast ratio ≥ 4.5:1 (WCAG AA)
- [ ] Skip links for navigation
- [ ] Form labels properly associated

---

## Definition of Done

**FE-501: Q Inbox UI**
- [x] Thread list page with filters, search, pagination
- [x] Thread detail page with messages, attachments, links
- [x] Loading skeletons for all async states
- [x] Empty states for no results
- [x] Error handling with user-friendly messages
- [x] Real-time updates via Supabase subscriptions
- [x] Responsive design (mobile-first)

**FE-502: Record View Email Tab**
- [x] RecordEmailsTab component (reusable)
- [x] EmailTimeline component for timeline integration
- [x] Thread expansion/collapse
- [x] Link to full thread in inbox
- [x] Empty state when no emails linked

---

**Document Version:** 1.0
**Status:** Sprint 0.2 - P0 Deliverable
**Last Updated:** 2025-12-31
**Tickets:** FE-501, FE-502
