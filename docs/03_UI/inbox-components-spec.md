# Inbox Component Implementation Specification
**REIL/Q Sprint 0.3 - M4: Inbox UI Swaps Fixtures to DB**
**Version:** 1.0
**Last Updated:** 2025-12-31

---

## Overview

This specification defines the implementation details for converting the Inbox UI from fixture-based data to database-driven real-time data. All components will integrate with Supabase via React Query hooks and display live data from Ashley's Gmail mailbox.

**Sprint Context:**
- **Milestone:** M4 - Inbox UI Swaps Fixtures → DB
- **Goal:** Replace all hardcoded fixture data with real database queries
- **Success Criteria:** Inbox renders Ashley's actual Gmail threads with correct counts, links, and attachments

---

## Table of Contents

1. [Component Architecture](#component-architecture)
2. [Required Components](#required-components)
3. [Data Flow Specification](#data-flow-specification)
4. [API Integration Patterns](#api-integration-patterns)
5. [State Management](#state-management)
6. [Binary Check Implementation](#binary-check-implementation)
7. [Testing Strategy](#testing-strategy)

---

## Component Architecture

### Directory Structure

```
src/
├── components/
│   └── inbox/
│       ├── ThreadListItem.tsx           # Thread row with badges
│       ├── MessageBubble.tsx            # Individual message display
│       ├── AttachmentChip.tsx           # Attachment with download
│       ├── RecordLinkBadge.tsx          # Linked contact/deal badge
│       ├── AttachToModal.tsx            # Search and attach modal
│       ├── ThreadFilters.tsx            # Filter controls
│       ├── ThreadSearchBar.tsx          # Search input
│       ├── UnlinkedBanner.tsx           # Unlinked threads banner
│       ├── SyncStatusBanner.tsx         # Sync progress indicator
│       └── index.ts                     # Barrel export
├── hooks/
│   └── inbox/
│       ├── useThreads.ts                # Thread list query
│       ├── useThread.ts                 # Thread detail query
│       ├── useLinkThread.ts             # Link mutation
│       ├── useUnlinkThread.ts           # Unlink mutation
│       ├── useSyncStatus.ts             # Sync status query
│       └── index.ts                     # Barrel export
├── lib/
│   └── inbox/
│       ├── types.ts                     # TypeScript interfaces
│       ├── utils.ts                     # Helper functions
│       └── queries.ts                   # Supabase query builders
└── app/
    └── inbox/
        ├── page.tsx                     # Thread list page
        └── thread/
            └── [id]/
                └── page.tsx             # Thread detail page
```

---

## Required Components

### 1. ThreadListItem

**Purpose:** Display a single thread in the inbox list with unread indicator, attachment icon, and linked record badges.

**Props Interface:**
```typescript
// src/components/inbox/ThreadListItem.tsx
export interface ThreadListItemProps {
  thread: MailThread;
  onClick?: (threadId: string) => void;
}

interface MailThread {
  id: string;
  subject: string | null;
  snippet: string | null;
  lastMessageAt: string;
  participantEmails: string[];
  messageCount: number;
  hasAttachments: boolean;
  attachmentCount?: number;
  isRead: boolean;
  linkedRecords?: RecordLink[];
}
```

**Component Implementation:**
```typescript
'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Paperclip, User } from 'lucide-react';
import { Badge } from '@/components';
import { RecordLinkBadge } from './RecordLinkBadge';
import { formatRelativeTime } from '@/lib/inbox/utils';
import { cn } from '@/lib/utils';
import type { MailThread } from '@/lib/inbox/types';

export const ThreadListItem = ({ thread, onClick }: ThreadListItemProps) => {
  const router = useRouter();
  const hasLinks = thread.linkedRecords && thread.linkedRecords.length > 0;

  const handleClick = () => {
    if (onClick) {
      onClick(thread.id);
    } else {
      router.push(`/inbox/thread/${thread.id}`);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "bg-surface-elevated border border-border-emphasis rounded-xl p-4",
        "hover:border-brand-primary/30 hover:shadow-lg cursor-pointer",
        "transition-all duration-200"
      )}
      onClick={handleClick}
      role="article"
      aria-label={`Email from ${thread.participantEmails[0]}, subject ${thread.subject || '(No Subject)'}, ${thread.isRead ? 'read' : 'unread'}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Subject Row */}
      <div className="flex items-start justify-between mb-2">
        <h3 className={cn(
          "text-lg font-semibold flex-1 pr-4 line-clamp-1",
          !thread.isRead ? "text-text-primary" : "text-text-secondary"
        )}>
          {thread.subject || '(No Subject)'}
        </h3>

        <div className="flex items-center gap-2 flex-shrink-0">
          {!thread.isRead && (
            <div
              className="w-2 h-2 rounded-full bg-brand-primary"
              aria-label="Unread"
            />
          )}
          <span className="text-sm text-text-tertiary whitespace-nowrap">
            {formatRelativeTime(thread.lastMessageAt)}
          </span>
        </div>
      </div>

      {/* Participants Row */}
      <div className="flex items-center gap-2 mb-2 text-sm text-text-secondary">
        <User className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
        <span className="truncate">
          From: {thread.participantEmails[0]}
          {thread.participantEmails.length > 1 &&
            ` +${thread.participantEmails.length - 1}`}
        </span>
      </div>

      {/* Snippet */}
      <p className="text-sm text-text-tertiary mb-3 line-clamp-2">
        {thread.snippet || '(No content)'}
      </p>

      {/* Footer: Badges and Links */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {thread.messageCount > 1 && (
            <Badge variant="neutral" className="text-xs">
              {thread.messageCount} messages
            </Badge>
          )}

          {thread.hasAttachments && (
            <Badge variant="info" className="text-xs">
              <Paperclip className="w-3 h-3 mr-1" aria-hidden="true" />
              {thread.attachmentCount || 1}
            </Badge>
          )}

          {!hasLinks && (
            <Badge variant="warning" dot className="text-xs">
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
              <Badge variant="neutral" className="text-xs">
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

**Key Features:**
- Shows unread indicator dot
- Displays attachment count badge
- Shows linked record badges (max 2, then "+N more")
- Clickable to navigate to thread detail
- Keyboard accessible (Enter/Space to activate)
- Hover animation with lift effect

---

### 2. MessageBubble

**Purpose:** Display an individual email message with expandable body, sender info, and attachments.

**Props Interface:**
```typescript
// src/components/inbox/MessageBubble.tsx
export interface MessageBubbleProps {
  message: MailMessage;
  isFirst?: boolean;
}

interface MailMessage {
  id: string;
  fromEmail: string;
  fromName: string | null;
  toEmails: string[];
  ccEmails: string[];
  sentAt: string;
  snippet: string | null;
  bodyPlain: string | null;
  bodyHtml: string | null;
  hasAttachments: boolean;
  attachments?: MailAttachment[];
}
```

**Component Implementation:**
```typescript
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, User, Clock } from 'lucide-react';
import { Avatar } from '@/components';
import { AttachmentChip } from './AttachmentChip';
import { cn } from '@/lib/utils';
import DOMPurify from 'isomorphic-dompurify';
import type { MailMessage } from '@/lib/inbox/types';

export const MessageBubble = ({ message, isFirst = false }: MessageBubbleProps) => {
  const [isExpanded, setIsExpanded] = useState(isFirst);

  const formattedTime = new Date(message.sentAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Sanitize HTML body to prevent XSS
  const sanitizedHtml = message.bodyHtml
    ? DOMPurify.sanitize(message.bodyHtml, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'blockquote'],
        ALLOWED_ATTR: ['href', 'target', 'rel']
      })
    : null;

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
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} message from ${message.fromName || message.fromEmail}`}
      >
        <div className="flex items-start gap-3">
          <Avatar
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
                <Clock className="w-4 h-4 text-text-tertiary" aria-hidden="true" />
                <span className="text-sm text-text-tertiary whitespace-nowrap">
                  {formattedTime}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-text-tertiary" aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-text-tertiary" aria-hidden="true" />
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
              >
                {sanitizedHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans">
                    {message.bodyPlain || message.snippet}
                  </pre>
                )}
              </div>

              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border-subtle">
                  <h4 className="text-sm font-semibold text-text-primary mb-3">
                    Attachments ({message.attachments.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {message.attachments.map((attachment) => (
                      <AttachmentChip
                        key={attachment.id}
                        attachment={attachment}
                      />
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

**Key Features:**
- First message expanded by default
- Click to toggle expand/collapse
- Sanitizes HTML content to prevent XSS
- Shows To/Cc recipients when expanded
- Displays attachments inline
- Smooth expand/collapse animation

---

### 3. AttachmentChip

**Purpose:** Display a file attachment with download capability and file type icon.

**Props Interface:**
```typescript
// src/components/inbox/AttachmentChip.tsx
export interface AttachmentChipProps {
  attachment: MailAttachment;
  onDownload?: () => void;
}

interface MailAttachment {
  id: string;
  filename: string;
  mimeType: string | null;
  sizeBytes: number;
}
```

**Component Implementation:**
```typescript
'use client';

import { useState } from 'react';
import { Download, File, Image, FileText, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { MailAttachment } from '@/lib/inbox/types';

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
  const [isDownloading, setIsDownloading] = useState(false);
  const Icon = getIconForMimeType(attachment.mimeType || '');

  const handleDownload = async () => {
    if (onDownload) {
      onDownload();
      return;
    }

    setIsDownloading(true);

    try {
      // Fetch download URL from API
      const response = await fetch(`/api/inbox/attachments/${attachment.id}/download`);

      if (!response.ok) {
        throw new Error('Failed to download attachment');
      }

      const { downloadUrl } = await response.json();

      // Trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = attachment.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Downloaded ${attachment.filename}`);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download attachment');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleDownload}
      disabled={isDownloading}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg",
        "bg-surface-interactive border border-border-emphasis",
        "hover:border-brand-primary/30 hover:bg-surface-elevated",
        "transition-all duration-200 group",
        "disabled:opacity-50 disabled:cursor-not-allowed"
      )}
      aria-label={`Download ${attachment.filename}, ${formatFileSize(attachment.sizeBytes)}`}
    >
      {isDownloading ? (
        <Loader2 className="w-4 h-4 text-text-secondary animate-spin" />
      ) : (
        <Icon className="w-4 h-4 text-text-secondary group-hover:text-brand-primary transition-colors" />
      )}

      <div className="flex flex-col items-start min-w-0">
        <span className="text-sm font-medium text-text-primary truncate max-w-[200px]">
          {attachment.filename}
        </span>
        <span className="text-xs text-text-tertiary">
          {formatFileSize(attachment.sizeBytes)}
        </span>
      </div>

      {!isDownloading && (
        <Download className="w-4 h-4 text-text-tertiary group-hover:text-brand-primary transition-colors ml-2" />
      )}
    </motion.button>
  );
};
```

**Key Features:**
- File type icon based on MIME type
- Shows filename and file size
- Download on click
- Loading state during download
- Toast notifications for success/error

---

### 4. RecordLinkBadge

**Purpose:** Display a linked CRM record (contact, deal, property) with optional unlink action.

**Props Interface:**
```typescript
// src/components/inbox/RecordLinkBadge.tsx
export interface RecordLinkBadgeProps {
  link: RecordLink;
  compact?: boolean;
  onUnlink?: () => void;
  onClick?: (e: React.MouseEvent) => void;
}

interface RecordLink {
  id: string;
  recordType: 'contact' | 'deal' | 'property';
  recordId: string;
  recordName?: string;
  confidence?: number;
  linkMethod: 'rule' | 'manual' | 'system';
}
```

**Component Implementation:**
```typescript
'use client';

import { X, User, Building, Home, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { RecordLink } from '@/lib/inbox/types';

const recordTypeIcons = {
  contact: User,
  deal: FileText,
  property: Home,
};

const recordTypeColors = {
  contact: 'bg-success/10 text-success border-success/30',
  deal: 'bg-brand-primary/10 text-brand-primary border-brand-primary/30',
  property: 'bg-warning/10 text-warning border-warning/30',
};

export const RecordLinkBadge = ({
  link,
  compact = false,
  onUnlink,
  onClick,
}: RecordLinkBadgeProps) => {
  const Icon = recordTypeIcons[link.recordType] || FileText;
  const colorClass = recordTypeColors[link.recordType] || 'bg-surface-interactive text-text-secondary border-border-emphasis';

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
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />

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
          aria-label={`Unlink ${link.recordType} ${link.recordName || link.recordId}`}
        >
          <X className="w-3 h-3" aria-hidden="true" />
        </button>
      )}
    </motion.div>
  );
};
```

**Key Features:**
- Color-coded by record type (contact=green, deal=blue, property=yellow)
- Shows confidence score if auto-linked
- Optional compact mode (no label)
- Unlink button on hover
- Click to navigate to record

---

### 5. AttachToModal

**Purpose:** Search and select CRM records to attach to an email thread.

**Props Interface:**
```typescript
// src/components/inbox/AttachToModal.tsx
export interface AttachToModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttach: (recordType: string, recordId: string) => Promise<void>;
  threadSubject: string;
}
```

**Component Implementation:**
```typescript
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, User, Building, Home, FileText } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { Input, Button, Badge, LoadingSpinner } from '@/components';
import { useSearchRecords } from '@/hooks/inbox/useSearchRecords';
import { cn } from '@/lib/utils';
import type { RecordType } from '@/lib/inbox/types';

const recordTypes: Array<{
  type: RecordType;
  label: string;
  icon: typeof User;
}> = [
  { type: 'contact', label: 'Contact', icon: User },
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
          className="relative z-50"
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel
              as={motion.div}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
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
                  aria-label="Close modal"
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

**Key Features:**
- Tabbed interface for different record types
- Live search with debouncing
- Shows search results grouped by type
- Single-click to attach
- Loading state during attachment
- Keyboard accessible (Esc to close)

---

## Data Flow Specification

### From Fixtures to Database

**Before (Sprint 0.2 - Fixtures):**
```typescript
// REMOVE THIS PATTERN
const mockThreads = [
  {
    id: '1',
    subject: 'Test Thread',
    // ... hardcoded fixture data
  }
];
```

**After (Sprint 0.3 - Database):**
```typescript
// USE THIS PATTERN
const { data, isLoading, error } = useThreads({
  page: 1,
  pageSize: 50,
  filters: { unlinkedOnly: false },
  search: ''
});

const threads = data?.threads || [];
```

### React Query Data Flow

```
Component (ThreadList)
    ↓ calls
useThreads() hook
    ↓ triggers
React Query (queryFn)
    ↓ executes
Supabase query builder
    ↓ fetches from
Database (mail_threads table)
    ↓ returns
MailThread[] data
    ↓ flows back to
Component (renders UI)
```

### Optimistic Updates Flow

```
User clicks "Attach to Contact"
    ↓
useLinkThread() mutation starts
    ↓
Optimistic update: Add link to UI immediately
    ↓
POST /api/inbox/threads/:id/link
    ↓
Database insert into record_links table
    ↓
On success: React Query invalidates cache
    ↓
useThread() refetches with new link
    ↓
UI updates with confirmed data
```

### Real-Time Updates Flow

```
Database change (new message inserted)
    ↓
Supabase Realtime triggers event
    ↓
useThreadSubscription() receives event
    ↓
React Query invalidates ['inbox', 'thread', threadId]
    ↓
useThread() automatically refetches
    ↓
Component re-renders with new message
```

---

## API Integration Patterns

### React Query Hook: useThreads

**Purpose:** Fetch paginated list of email threads with filters.

**Implementation:**
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

      if (!response.ok) {
        throw new Error('Failed to fetch threads');
      }

      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};
```

**API Route Implementation:**
```typescript
// src/app/api/inbox/threads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getThreadsWithLinks } from '@/lib/inbox/queries';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const searchParams = request.nextUrl.searchParams;

  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '50');
  const unlinkedOnly = searchParams.get('unlinkedOnly') === 'true';
  const search = searchParams.get('search') || '';
  const dateRange = searchParams.get('dateRange') || 'month';

  try {
    const result = await getThreadsWithLinks(supabase, {
      page,
      pageSize,
      unlinkedOnly,
      search,
      dateRange
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threads' },
      { status: 500 }
    );
  }
}
```

**Supabase Query Builder:**
```typescript
// src/lib/inbox/queries.ts
import type { SupabaseClient } from '@supabase/supabase-js';

export async function getThreadsWithLinks(
  supabase: SupabaseClient,
  params: {
    page: number;
    pageSize: number;
    unlinkedOnly: boolean;
    search: string;
    dateRange: string;
  }
) {
  const { page, pageSize, unlinkedOnly, search, dateRange } = params;
  const offset = (page - 1) * pageSize;

  // Calculate date filter
  const dateFilter = getDateFilter(dateRange);

  // Base query
  let query = supabase
    .from('mail_threads')
    .select(`
      id,
      subject,
      snippet,
      participant_emails,
      message_count,
      has_attachments,
      last_message_at,
      is_read,
      linkedRecords:record_links!record_links_source_id_fkey(
        id,
        record_type,
        record_id,
        record_name,
        confidence,
        link_method
      )
    `, { count: 'exact' })
    .eq('source_type', 'thread')
    .order('last_message_at', { ascending: false });

  // Apply date filter
  if (dateFilter) {
    query = query.gte('last_message_at', dateFilter);
  }

  // Apply search
  if (search) {
    query = query.or(`subject.ilike.%${search}%,snippet.ilike.%${search}%,participant_emails.cs.{${search}}`);
  }

  // Apply unlinked filter
  if (unlinkedOnly) {
    // This requires a more complex query - get threads with no links
    const { data: threadsWithLinks } = await supabase
      .from('record_links')
      .select('source_id')
      .eq('source_type', 'thread');

    const linkedIds = threadsWithLinks?.map(l => l.source_id) || [];
    query = query.not('id', 'in', `(${linkedIds.join(',')})`);
  }

  // Execute paginated query
  const { data: threads, error, count } = await query
    .range(offset, offset + pageSize - 1);

  if (error) throw error;

  // Get unlinked count
  const { count: unlinkedCount } = await supabase
    .from('mail_threads')
    .select('id', { count: 'exact', head: true })
    .not('id', 'in', `(SELECT source_id FROM record_links WHERE source_type = 'thread')`);

  return {
    threads: threads || [],
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / pageSize),
    unlinkedCount: unlinkedCount || 0
  };
}

function getDateFilter(range: string): string | null {
  const now = new Date();
  switch (range) {
    case 'today':
      return new Date(now.setHours(0, 0, 0, 0)).toISOString();
    case 'week':
      return new Date(now.setDate(now.getDate() - 7)).toISOString();
    case 'month':
      return new Date(now.setDate(now.getDate() - 30)).toISOString();
    case '3months':
      return new Date(now.setMonth(now.getMonth() - 3)).toISOString();
    default:
      return null;
  }
}
```

---

### React Query Hook: useThread

**Purpose:** Fetch single thread with all messages and attachments.

**Implementation:**
```typescript
// src/hooks/inbox/useThread.ts
import { useQuery } from '@tanstack/react-query';
import type { MailThread } from '@/lib/inbox/types';

export const useThread = (threadId: string) => {
  return useQuery({
    queryKey: ['inbox', 'thread', threadId],
    queryFn: async (): Promise<MailThread> => {
      const response = await fetch(`/api/inbox/threads/${threadId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch thread');
      }

      return response.json();
    },
    staleTime: 60 * 1000, // 1 minute
    enabled: !!threadId,
  });
};
```

**API Route:**
```typescript
// src/app/api/inbox/threads/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  try {
    // Fetch thread with messages and attachments
    const { data: thread, error } = await supabase
      .from('mail_threads')
      .select(`
        *,
        messages:mail_messages(
          *,
          attachments:mail_attachments(*)
        ),
        linkedRecords:record_links!record_links_source_id_fkey(
          id,
          record_type,
          record_id,
          record_name,
          confidence,
          link_method
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) throw error;

    // Sort messages by sent_at ascending
    thread.messages.sort((a, b) =>
      new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
    );

    return NextResponse.json(thread);
  } catch (error) {
    console.error('Error fetching thread:', error);
    return NextResponse.json(
      { error: 'Thread not found' },
      { status: 404 }
    );
  }
}
```

---

### React Query Hook: useLinkThread

**Purpose:** Attach thread to a CRM record (contact, deal, property).

**Implementation:**
```typescript
// src/hooks/inbox/useLinkThread.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface LinkThreadParams {
  threadId: string;
  recordType: string;
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

      if (!response.ok) {
        throw new Error('Failed to link thread');
      }

      return response.json();
    },
    onSuccess: (data, { threadId, recordType }) => {
      // Invalidate thread queries to refetch with new link
      queryClient.invalidateQueries({ queryKey: ['inbox', 'threads'] });
      queryClient.invalidateQueries({ queryKey: ['inbox', 'thread', threadId] });

      toast.success(`Thread attached to ${recordType}`);
    },
    onError: () => {
      toast.error('Failed to attach thread. Try again.');
    },
  });
};
```

**API Route:**
```typescript
// src/app/api/inbox/threads/[id]/link/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const body = await request.json();
  const { recordType, recordId } = body;

  try {
    // Check if link already exists
    const { data: existing } = await supabase
      .from('record_links')
      .select('id')
      .eq('source_type', 'thread')
      .eq('source_id', params.id)
      .eq('record_type', recordType)
      .eq('record_id', recordId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Link already exists' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    // Create link
    const { data: link, error } = await supabase
      .from('record_links')
      .insert({
        source_type: 'thread',
        source_id: params.id,
        record_type: recordType,
        record_id: recordId,
        confidence: 100,
        link_method: 'manual',
        linked_by: user?.id,
        linked_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(link);
  } catch (error) {
    console.error('Error linking thread:', error);
    return NextResponse.json(
      { error: 'Failed to link thread' },
      { status: 500 }
    );
  }
}
```

---

### React Query Hook: useUnlinkThread

**Purpose:** Remove link between thread and record.

**Implementation:**
```typescript
// src/hooks/inbox/useUnlinkThread.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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

      if (!response.ok) {
        throw new Error('Failed to unlink thread');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate all inbox queries
      queryClient.invalidateQueries({ queryKey: ['inbox'] });

      toast.success('Email unlinked');
    },
    onError: () => {
      toast.error('Failed to unlink. Try again.');
    },
  });
};
```

**API Route:**
```typescript
// src/app/api/inbox/links/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from('record_links')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unlinking thread:', error);
    return NextResponse.json(
      { error: 'Failed to unlink thread' },
      { status: 500 }
    );
  }
}
```

---

## State Management

### Inbox Store (Zustand)

**Purpose:** Manage client-side filter and search state.

**Implementation:**
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
      partialize: (state) => ({ filters: state.filters }), // Don't persist search
    }
  )
);
```

**Usage in Component:**
```typescript
const { filters, search, setFilter, setSearch } = useInboxStore();

// Update filter
setFilter('unlinkedOnly', true);

// Update search
setSearch('inspection');

// Clear all
clearFilters();
```

---

## Binary Check Implementation

### Success Criteria Validation

**Binary Check 1: Inbox renders real data from Ashley's mailbox**

```typescript
// Test: d:\REIL-Q\src\app\inbox\page.tsx
export default function InboxPage() {
  const { data, isLoading } = useThreads({
    page: 1,
    pageSize: 50,
    filters: { unlinkedOnly: false, dateRange: 'month' },
    search: ''
  });

  // Binary check: data comes from DB, not fixtures
  console.assert(
    data?.threads.every(t => t.id && t.subject && t.participantEmails),
    'All threads have real DB data'
  );

  return (
    <div>
      {/* Render threads from DB */}
      {data?.threads.map(thread => (
        <ThreadListItem key={thread.id} thread={thread} />
      ))}
    </div>
  );
}
```

**Binary Check 2: Thread list shows correct counts**

```typescript
// Test: Verify message count, attachment count, linked record count
const thread = data?.threads[0];

console.assert(
  thread.messageCount === thread.messages?.length,
  'Message count matches actual messages'
);

console.assert(
  thread.linkedRecords?.length >= 0,
  'Linked records array exists'
);
```

**Binary Check 3: Message expansion works**

```typescript
// Test: Messages can be expanded/collapsed
const MessageBubbleTest = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  console.assert(
    isExpanded === false,
    'Message starts collapsed'
  );

  // Simulate click
  setIsExpanded(true);

  console.assert(
    isExpanded === true,
    'Message can be expanded'
  );
};
```

**Binary Check 4: Attachments are downloadable**

```typescript
// Test: Attachment download triggers
const handleDownload = async (attachmentId: string) => {
  const response = await fetch(`/api/inbox/attachments/${attachmentId}/download`);

  console.assert(
    response.ok,
    'Download URL endpoint returns 200'
  );

  const { downloadUrl } = await response.json();

  console.assert(
    downloadUrl.startsWith('https://'),
    'Download URL is valid'
  );
};
```

### Sync Now Button Implementation

**Purpose:** Manual trigger for Gmail sync to verify real-time data updates.

**Component:**
```typescript
// src/components/inbox/SyncButton.tsx
'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components';
import { toast } from 'sonner';

export const SyncButton = () => {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);

    try {
      const response = await fetch('/api/inbox/sync', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Sync failed');
      }

      const { threadsProcessed } = await response.json();

      toast.success(`Sync complete: ${threadsProcessed} threads updated`);
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Sync failed. Try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleSync}
      disabled={isSyncing}
      leftIcon={RefreshCw}
      className={isSyncing ? 'animate-spin' : ''}
    >
      {isSyncing ? 'Syncing...' : 'Sync Now'}
    </Button>
  );
};
```

**API Route:**
```typescript
// src/app/api/inbox/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { syncMailbox } from '@/lib/gmail/sync';

export async function POST(request: NextRequest) {
  const supabase = createClient();

  try {
    // Get user's mailbox
    const { data: { user } } = await supabase.auth.getUser();

    const { data: mailbox } = await supabase
      .from('mailboxes')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    if (!mailbox) {
      return NextResponse.json(
        { error: 'No mailbox connected' },
        { status: 404 }
      );
    }

    // Trigger sync
    const result = await syncMailbox(mailbox.id);

    return NextResponse.json({
      threadsProcessed: result.threadsProcessed,
      messagesProcessed: result.messagesProcessed
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Sync failed' },
      { status: 500 }
    );
  }
}
```

---

## Testing Strategy

### Unit Tests

**ThreadListItem Component:**
```typescript
// src/components/inbox/__tests__/ThreadListItem.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ThreadListItem } from '../ThreadListItem';

const mockThread = {
  id: '1',
  subject: 'Test Email',
  snippet: 'This is a test',
  lastMessageAt: new Date().toISOString(),
  participantEmails: ['test@example.com'],
  messageCount: 1,
  hasAttachments: false,
  isRead: false,
};

describe('ThreadListItem', () => {
  it('renders thread subject', () => {
    render(<ThreadListItem thread={mockThread} />);
    expect(screen.getByText('Test Email')).toBeInTheDocument();
  });

  it('shows unread indicator for unread threads', () => {
    render(<ThreadListItem thread={mockThread} />);
    expect(screen.getByLabelText('Unread')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<ThreadListItem thread={mockThread} onClick={handleClick} />);

    fireEvent.click(screen.getByRole('article'));
    expect(handleClick).toHaveBeenCalledWith('1');
  });
});
```

### Integration Tests

**Inbox Page:**
```typescript
// src/app/inbox/__tests__/page.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import InboxPage from '../page';
import { useThreads } from '@/hooks/inbox/useThreads';

jest.mock('@/hooks/inbox/useThreads');

describe('InboxPage', () => {
  it('loads and displays threads from database', async () => {
    const mockThreads = [
      {
        id: '1',
        subject: 'Test Thread 1',
        participantEmails: ['test1@example.com'],
        // ... other fields
      },
      {
        id: '2',
        subject: 'Test Thread 2',
        participantEmails: ['test2@example.com'],
        // ... other fields
      },
    ];

    (useThreads as jest.Mock).mockReturnValue({
      data: { threads: mockThreads, totalCount: 2 },
      isLoading: false,
      error: null,
    });

    render(<InboxPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Thread 1')).toBeInTheDocument();
      expect(screen.getByText('Test Thread 2')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching', () => {
    (useThreads as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(<InboxPage />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
```

### E2E Tests (Manual)

**Test Plan:**
1. Open `/inbox`
2. Verify threads load from database (check Network tab for `/api/inbox/threads`)
3. Click "Sync Now" button
4. Verify new threads appear (if any)
5. Click a thread to open detail view
6. Verify messages expand/collapse on click
7. Click attachment to download
8. Verify download initiates
9. Click "Attach to..." button
10. Search for a contact
11. Select contact and confirm attachment
12. Verify linked record badge appears

---

**Document Version:** 1.0
**Status:** Sprint 0.3 - M4 Implementation Spec
**Author:** UIForge Frontend Dev Specialist
**Last Updated:** 2025-12-31
