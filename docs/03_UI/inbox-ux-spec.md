# Inbox UX Specification
**REIL/Q Sprint 0.2 - Gmail Integration**
**Version:** 1.0
**Last Updated:** 2025-12-31

---

## Overview

The Inbox is a unified email communication hub that ingests Gmail threads, auto-links them to CRM records (Contacts, Deals, Properties), and provides manual attachment capabilities. This specification defines all user flows, interactions, states, and visual treatments for the 72-hour shipping sprint.

**Core Philosophy:**
- Gmail-first experience with Superhuman-level speed
- Auto-linking intelligence reduces manual work by 70%
- Lyft-caliber clarity for linked records
- Accessible, performant, mobile-optimized

---

## Table of Contents

1. [User Flow Diagrams](#user-flow-diagrams)
2. [Interaction Specifications](#interaction-specifications)
3. [Visual Hierarchy](#visual-hierarchy)
4. [State Handling](#state-handling)
5. [Microinteractions](#microinteractions)
6. [Accessibility](#accessibility)
7. [Mobile Considerations](#mobile-considerations)
8. [Component State Matrix](#component-state-matrix)
9. [Edge Cases](#edge-cases)
10. [Animation Timing](#animation-timing)

---

## User Flow Diagrams

### 1. Gmail Connection Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     INITIAL STATE                           │
│  User lands on /inbox with no connected mailbox             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   EMPTY STATE SCREEN                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [📧 Icon - 64px, text-tertiary]                     │  │
│  │                                                       │  │
│  │  "Connect your Gmail"                                │  │
│  │  "Automatically link emails to deals, contacts,      │  │
│  │   and properties. Everything synced in one place."   │  │
│  │                                                       │  │
│  │  [Connect Gmail Button - Primary CTA]                │  │
│  │                                                       │  │
│  │  "Read-only access • Secure OAuth 2.0"               │  │
│  │  (text-tertiary, text-small)                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │ User clicks "Connect Gmail"
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   OAUTH REDIRECT                            │
│  Browser redirects to Google OAuth consent screen           │
│  Requested scopes:                                          │
│  - gmail.readonly                                           │
│  - openid                                                   │
│  - userinfo.email                                           │
└─────────────────────┬───────────────────────────────────────┘
                      │ User grants permission
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  CALLBACK PROCESSING                        │
│  Q receives OAuth code → exchanges for tokens               │
│  Creates mailbox record → triggers initial backfill         │
│  Shows loading overlay with progress indicator              │
│                                                              │
│  "Connecting your mailbox..."                               │
│  [Animated spinner]                                         │
└─────────────────────┬───────────────────────────────────────┘
                      │ Connection successful
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  SUCCESS CONFIRMATION                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [✓ Checkmark animation - success color]            │  │
│  │                                                       │  │
│  │  "Gmail connected!"                                  │  │
│  │  "Syncing your last 30 days of email..."            │  │
│  │                                                       │  │
│  │  Progress: 24 threads synced                         │  │
│  │  [Progress bar - animated]                           │  │
│  │                                                       │  │
│  │  [View Inbox Button]                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │ Sync continues in background
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    INBOX VIEW                               │
│  Thread list populated with synced emails                   │
│  Auto-link rules applied in background                      │
│  Toast notification: "Sync complete: 127 threads"           │
└─────────────────────────────────────────────────────────────┘
```

**Error Paths:**

```
OAuth Declined
│
├─ User cancels on Google consent screen
│  └─ Return to empty state with toast:
│     "Gmail connection cancelled. Try again when ready."
│
├─ OAuth error (invalid_grant, etc.)
│  └─ Return to empty state with error message:
│     "Connection failed. Please try again."
│     [Retry Button]
│
└─ Token exchange fails
   └─ Show error state:
      "Unable to connect to Gmail. Check your network and try again."
      [Contact Support] [Retry]
```

---

### 2. Thread Browsing Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   INBOX LIST VIEW                           │
│  Default: Sorted by last_message_at DESC                    │
│  Shows 50 threads per page                                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
         ┌────────────┼────────────┬─────────────┐
         │            │            │             │
         ▼            ▼            ▼             ▼
    Apply Filter  Sort Threads  Search      Click Thread
         │            │            │             │
         ▼            ▼            ▼             ▼
┌─────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
│ Filter      │ │ Sort by: │ │ Live     │ │ Navigate to  │
│ - Unlinked  │ │ - Recent │ │ search   │ │ thread       │
│ - Linked    │ │ - Unread │ │ subject/ │ │ detail view  │
│ - Has       │ │ - Sender │ │ sender   │ │              │
│   attachmt  │ │          │ │          │ │              │
└─────────────┘ └──────────┘ └──────────┘ └──────────────┘
```

**Thread List Behavior:**

1. **Initial Load:**
   - Fetch 50 most recent threads
   - Show skeleton loading for first paint
   - Stagger-fade items into view (50ms delay each)

2. **Scroll Pagination:**
   - When user scrolls to bottom 200px, trigger next page fetch
   - Append new items with fade-in animation
   - Show "Loading more..." at bottom during fetch

3. **Filter Toggle:**
   - Apply filter client-side if <200 threads, server-side if >200
   - Update URL query params (e.g., `/inbox?filter=unlinked`)
   - Maintain scroll position if possible, else scroll to top

4. **Search:**
   - Debounce input 300ms
   - Search across: subject, participant_emails, snippet
   - Highlight matches in results
   - Show "No results" empty state if no matches

---

### 3. Thread Detail Flow

```
User clicks thread in list
│
▼
┌─────────────────────────────────────────────────────────────┐
│                  THREAD DETAIL VIEW                         │
│  Layout: Two-column (desktop) | Single-column (mobile)      │
│  ┌───────────────────────┬──────────────────────────────┐  │
│  │ LEFT: Message Thread  │ RIGHT: Sidebar               │  │
│  │                       │                               │  │
│  │ Header:               │ Linked Records Panel          │  │
│  │ - Subject             │ - Contact cards               │  │
│  │ - Participants        │ - Deal cards                  │  │
│  │ - Timestamp           │ - Property cards              │  │
│  │                       │                               │  │
│  │ Messages (collapsing):│ Attachments Panel             │  │
│  │ - Latest expanded     │ - Filename                    │  │
│  │ - Earlier collapsed   │ - File size                   │  │
│  │   (click to expand)   │ - Download button             │  │
│  │                       │                               │  │
│  │ [Reply Box] (future)  │ Actions:                      │  │
│  │                       │ [Attach to...] [Unlink]       │  │
│  └───────────────────────┴──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Message Expansion Logic:**

```
Initial state: Latest message expanded, all others collapsed
│
├─ Click collapsed message header
│  └─ Expand with slide-down animation (300ms ease-out)
│     Show full body_html (sanitized) or body_plain
│
├─ Click expanded message header
│  └─ Collapse with slide-up animation (200ms ease-in)
│     Show only sender + timestamp + snippet
│
└─ "Expand All" button (if >3 messages)
   └─ Stagger-expand all messages (100ms delay between each)
```

---

### 4. Manual Attach Flow

```
User clicks "Attach to..." button in thread detail sidebar
│
▼
┌─────────────────────────────────────────────────────────────┐
│                    ATTACH MODAL                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Attach Thread to Record                             │  │
│  │  ────────────────────────────────────                │  │
│  │                                                       │  │
│  │  [Search input: "Search contacts, deals, properties"]│  │
│  │  (Autofocus on modal open)                           │  │
│  │                                                       │  │
│  │  Recent:                                             │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │ 📍 1234 Oak St - Deal #12345                   │ │  │
│  │  │    Active • Est. Close: Jan 15                 │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │ 👤 John Smith - Contact                        │ │  │
│  │  │    john@example.com                            │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  │                                                       │  │
│  │  [Cancel] [Attach Selected]                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Search Behavior:**

1. **Live Search (debounced 200ms):**
   - Search scope: Contacts (name, email), Deals (address), Properties (address)
   - Show grouped results: Contacts | Deals | Properties
   - Highlight query matches in bold
   - Limit: 5 per category, "Show all X results" link

2. **Selection:**
   - Click record card → highlight with brand-primary border
   - Allow multi-select (can attach to multiple records)
   - Selected count badge: "2 selected"

3. **Attachment:**
   ```
   User clicks "Attach Selected"
   │
   ├─ Validate: At least 1 record selected
   │  └─ If none: Show error toast "Select at least one record"
   │
   ├─ POST /api/record-links (batch create)
   │  Payload: {
   │    source_type: "thread",
   │    source_id: thread.id,
   │    targets: [
   │      { type: "deal", id: "..." },
   │      { type: "contact", id: "..." }
   │    ],
   │    link_method: "manual"
   │  }
   │
   ├─ On success:
   │  └─ Close modal with fade-out
   │     Update sidebar Linked Records panel (add new cards)
   │     Show success toast: "Thread attached to 2 records"
   │     Confetti animation (brief, 30 particles)
   │
   └─ On error:
      └─ Show error toast: "Failed to attach. Try again."
         Keep modal open, allow retry
   ```

**Keyboard Navigation:**

- `Enter` on search result → Select/deselect
- `Cmd/Ctrl + Enter` → Attach selected
- `Esc` → Close modal
- `Tab` → Navigate between results
- Arrow keys → Navigate results list

---

### 5. Unlink Flow

```
User hovers over linked record card in sidebar
│
▼
┌─────────────────────────────────────────────────────────────┐
│  Record card shows [X] button on hover (top-right)          │
│  Click [X]                                                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 CONFIRMATION DIALOG                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Unlink this email?                                  │  │
│  │  ──────────────────                                  │  │
│  │                                                       │  │
│  │  This will remove the link between this email        │  │
│  │  thread and "1234 Oak St - Deal #12345".             │  │
│  │                                                       │  │
│  │  This action can be undone by re-attaching.          │  │
│  │                                                       │  │
│  │  [Cancel]  [Unlink]                                  │  │
│  │            (danger variant, red)                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │ User clicks "Unlink"
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  DELETE /api/record-links/{link_id}                         │
│  │                                                           │
│  ├─ On success:                                             │
│  │  └─ Remove card with fade-out + slide-up (200ms)        │
│  │     Show toast: "Email unlinked from Deal #12345"        │
│  │     Ledger event: EMAIL_UNLINKED                         │
│  │                                                           │
│  └─ On error:                                               │
│     └─ Show toast: "Failed to unlink. Try again."           │
└─────────────────────────────────────────────────────────────┘
```

**Undo Support (Future Enhancement):**
- Toast includes "Undo" button (5s timeout)
- Click "Undo" → Re-create link, restore card
- Track unlink in memory until timeout expires

---

## Interaction Specifications

### Thread List Interactions

#### Hover State
```css
.thread-item:hover {
  background: surface-elevated;
  border-left: 3px solid brand-primary;
  transform: translateX(3px);
  transition: all 200ms ease-out;
}
```

**Visual Feedback:**
- Subtle background change (surface-base → surface-elevated)
- Left border accent (brand-primary)
- Slight rightward shift (3px) for depth
- Show action icons (Mark Read, Star) on right side

#### Click Behavior
```typescript
const handleThreadClick = (threadId: string) => {
  // Optimistic update: Mark as "navigating"
  setNavigatingTo(threadId);

  // Navigate with page transition
  router.push(`/inbox/thread/${threadId}`);

  // Mark as read if unread (fire-and-forget)
  if (thread.is_read === false) {
    markThreadAsRead(threadId);
  }
};
```

**Timing:**
- Click → Immediate navigation (no loading spinner if <100ms)
- Mark as read happens in background (POST /api/threads/:id/read)
- Thread detail pre-fetches on hover (200ms delay)

#### Keyboard Navigation

| Key | Action |
|-----|--------|
| `↑` / `k` | Previous thread (highlight + scroll into view) |
| `↓` / `j` | Next thread |
| `Enter` | Open selected thread |
| `/` | Focus search input |
| `u` | Toggle "Unread only" filter |
| `l` | Toggle "Linked only" filter |
| `Esc` | Clear filters / exit search |

**Implementation:**
```typescript
useKeyboardShortcuts({
  'ArrowUp': () => selectPrevThread(),
  'k': () => selectPrevThread(),
  'ArrowDown': () => selectNextThread(),
  'j': () => selectNextThread(),
  'Enter': () => openSelectedThread(),
  '/': (e) => {
    e.preventDefault();
    searchInputRef.current?.focus();
  },
  'u': () => toggleFilter('unread'),
  'l': () => toggleFilter('linked'),
  'Escape': () => clearFiltersAndSearch(),
});
```

**Accessibility:**
- Focus ring: 2px solid brand-primary
- Screen reader announces: "Thread from {sender}, subject {subject}, {timestamp}, {read/unread}, {linked to X records}"

---

### Message Expansion/Collapse

#### Collapsed State
```
┌─────────────────────────────────────────────────────────────┐
│ ▶ Sarah Johnson                              2:45 PM        │
│   The inspection is scheduled for tomorrow...               │
└─────────────────────────────────────────────────────────────┘
```

- Height: 56px (fixed)
- Shows: Avatar, sender name, timestamp, snippet (truncated 1 line)
- Cursor: pointer
- Hover: Background → surface-interactive

#### Expanded State
```
┌─────────────────────────────────────────────────────────────┐
│ ▼ Sarah Johnson                              2:45 PM        │
│   sarah@realestate.com                                      │
│   To: John Smith, Jane Doe                                  │
│                                                              │
│   [Full message body with formatting]                       │
│                                                              │
│   The inspection is scheduled for tomorrow at 10 AM.        │
│   Please arrive 15 minutes early to meet the inspector.     │
│                                                              │
│   Best regards,                                             │
│   Sarah                                                     │
│                                                              │
│   📎 inspection-checklist.pdf (120 KB)                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

- Height: Auto (min 120px)
- Shows: Full headers (To, Cc, Bcc), complete body, attachments
- Animation: Slide-down (300ms cubic-bezier(0.4, 0, 0.2, 1))

**Expand/Collapse Animation:**
```typescript
const messageVariants = {
  collapsed: {
    height: 56,
    opacity: 0.8,
    transition: { duration: 0.2, ease: 'easeIn' }
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};
```

**Click Target:**
- Entire collapsed message is clickable (56px height = good touch target)
- Chevron icon rotates 90deg on expand
- Attachments in expanded view are separate click targets

---

### Attachment Interactions

#### Preview Behavior

```typescript
const handleAttachmentClick = (attachment: MailAttachment) => {
  const previewableTypes = ['image/png', 'image/jpeg', 'application/pdf'];

  if (previewableTypes.includes(attachment.mime_type)) {
    // Open inline preview modal
    openPreviewModal(attachment);
  } else {
    // Trigger download
    downloadAttachment(attachment);
  }
};
```

**Preview Modal (for images/PDFs):**
```
┌─────────────────────────────────────────────────────────────┐
│ [X Close]                                    [↓ Download]   │
│                                                              │
│                                                              │
│              [Image/PDF Preview]                             │
│              (Centered, max 90vh)                            │
│                                                              │
│                                                              │
│ inspection-report.pdf                             2.4 MB    │
└─────────────────────────────────────────────────────────────┘
```

- Background: rgba(0,0,0,0.9) with backdrop-blur
- Click outside → Close modal
- `Esc` → Close modal
- Zoom controls for images (pinch on mobile)

#### Download Flow

```
User clicks attachment or download button
│
├─ Show loading indicator (spinner replaces download icon)
│
├─ GET /api/attachments/{id}/download
│  → Returns signed Supabase storage URL
│
├─ Browser initiates download
│  → filename preserved from mail_attachments.filename
│
└─ On complete: Show toast "Downloaded inspection-report.pdf"
```

**Progress Indicator (for large files >5MB):**
- Show progress bar below attachment chip
- Update percentage every 500ms
- Cancel button (abort request)

---

### Attach Modal Search Behavior

#### Search Input
```tsx
<Input
  ref={searchInputRef}
  placeholder="Search contacts, deals, properties..."
  leftIcon={Search}
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  autoFocus
  aria-label="Search records to attach"
/>
```

**Debouncing:**
```typescript
const [query, setQuery] = useState('');
const debouncedQuery = useDebounce(query, 200);

useEffect(() => {
  if (debouncedQuery.length >= 2) {
    searchRecords(debouncedQuery);
  } else {
    setResults([]);
  }
}, [debouncedQuery]);
```

#### Results Display

**Grouped Sections:**
```
CONTACTS (3)
┌────────────────────────────────────────────────┐
│ 👤 John Smith                         [✓]     │
│    john@example.com • Buyer                   │
└────────────────────────────────────────────────┘
┌────────────────────────────────────────────────┐
│ 👤 Jane Doe                                    │
│    jane@seller.com • Seller                    │
└────────────────────────────────────────────────┘

DEALS (2)
┌────────────────────────────────────────────────┐
│ 📍 1234 Oak St - Deal #12345          [✓]     │
│    Active • Est. Close: Jan 15                │
└────────────────────────────────────────────────┘

PROPERTIES (1)
┌────────────────────────────────────────────────┐
│ 🏠 5678 Elm Ave                                │
│    Residential • $450K                         │
└────────────────────────────────────────────────┘
```

**Selection States:**
```css
/* Unselected */
.record-card {
  border: 1px solid border-emphasis;
  background: surface-elevated;
}

/* Hover */
.record-card:hover {
  border-color: brand-primary/30;
  background: surface-interactive;
}

/* Selected */
.record-card.selected {
  border: 2px solid brand-primary;
  background: brand-primary/5;
}
```

**Multi-Select UI:**
- Checkmark appears on right side when selected
- Selected count in footer: "2 records selected"
- "Clear selection" link appears when count > 0

**Empty State:**
```
No results for "{query}"

Try searching by:
• Contact name or email
• Property address
• Deal number
```

---

### Confirmation Dialogs

#### Delete/Unlink Pattern
```tsx
<Dialog
  isOpen={showUnlinkDialog}
  onClose={() => setShowUnlinkDialog(false)}
  title="Unlink this email?"
  variant="danger"
>
  <p className="text-body text-secondary mb-4">
    This will remove the link between this email thread and{' '}
    <strong className="text-primary">{record.name}</strong>.
  </p>
  <p className="text-small text-tertiary mb-6">
    This action can be undone by re-attaching.
  </p>

  <div className="flex gap-3 justify-end">
    <Button variant="secondary" onClick={() => setShowUnlinkDialog(false)}>
      Cancel
    </Button>
    <Button
      variant="danger"
      onClick={handleUnlink}
      isLoading={isUnlinking}
    >
      Unlink
    </Button>
  </div>
</Dialog>
```

**Timing:**
- Dialog fade-in: 150ms
- Danger button has 500ms delay before clickable (prevent accidental clicks)
- `Esc` key closes dialog
- Click backdrop closes dialog (with confirmation if action in progress)

---

## Visual Hierarchy

### Thread List Layout

#### Desktop (≥1024px)
```
┌─────────────────────────────────────────────────────────────┐
│ Inbox                                           [+ Compose] │
│ ─────────────────────────────────────────────────────────── │
│ [🔍 Search threads...]  [Unlinked ▾]  [Attachments ▾]      │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐│
│ │● sarah@agent.com                      2:45 PM    [📎] [🔗]││
│ │  Re: Inspection Scheduling                               ││
│ │  The inspection is scheduled for tomorrow at 10 AM...    ││
│ │  Deal #12345 • Contact: John Smith                       ││
│ └──────────────────────────────────────────────────────────┘│
│ ┌──────────────────────────────────────────────────────────┐│
│ │  jane@seller.com                      Yesterday    [🔗]  ││
│ │  Documents Ready                                         ││
│ │  I've uploaded the signed disclosures to the portal...   ││
│ │  Deal #12345                                             ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ [Load More]                                                  │
└─────────────────────────────────────────────────────────────┘
```

**Spacing:**
- Container padding: 24px
- Thread item padding: 16px
- Gap between threads: 8px
- Filter bar margin-bottom: 16px

**Thread Item Anatomy:**
```
Row 1: [Unread dot] Sender Email    Timestamp    [Icons]
       (12px dot)   (text-body)     (text-small) (20px each)

Row 2: Subject (text-body, font-semibold, text-primary)
       Truncate 1 line

Row 3: Snippet (text-small, text-secondary)
       Truncate 2 lines, ellipsis

Row 4: Linked Records Badges
       [🔗 Deal #12345] [👤 John Smith]
       (text-micro, badge style)
```

#### Mobile (<768px)
```
┌───────────────────────────────┐
│ Inbox              [🔍] [+]   │
│ ───────────────────────────── │
│ [Filters ▾]                   │
│                               │
│ ┌───────────────────────────┐ │
│ │● sarah@agent.com    2:45PM│ │
│ │  Re: Inspection...        │ │
│ │  The inspection is...     │ │
│ │  [🔗 #12345] [📎 1]       │ │
│ └───────────────────────────┘ │
│ ┌───────────────────────────┐ │
│ │  jane@seller.com  Yest.   │ │
│ │  Documents Ready          │ │
│ │  I've uploaded...         │ │
│ │  [🔗 #12345]              │ │
│ └───────────────────────────┘ │
│                               │
│ [Load More]                   │
└───────────────────────────────┘
```

**Mobile Adaptations:**
- Padding: 16px
- Timestamp moves to same line as sender (right-aligned)
- Icons stack vertically on narrow screens
- Snippet truncates to 1 line
- Swipe gestures:
  - Swipe right → Mark read/unread
  - Swipe left → Quick actions (Archive, Delete - future)

---

### Thread Detail Layout

#### Desktop Two-Column
```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Inbox                                             │
│ ─────────────────────────────────────────────────────────── │
│ Re: Inspection Scheduling                                   │
│ From: sarah@agent.com                                       │
│ To: john@buyer.com, jane@seller.com                         │
│ Jan 3, 2025 2:45 PM                                         │
│                                                              │
│ ┌──────────────────────────┬──────────────────────────────┐ │
│ │ MESSAGE THREAD           │ SIDEBAR                      │ │
│ │ (60% width)              │ (40% width, max 400px)       │ │
│ │                          │                              │ │
│ │ ▼ Sarah Johnson  2:45 PM │ LINKED RECORDS (2)          │ │
│ │   sarah@agent.com        │ ┌────────────────────────┐  │ │
│ │   To: john@buyer.com     │ │ 📍 1234 Oak St        │  │ │
│ │                          │ │    Deal #12345  [X]   │  │ │
│ │   The inspection is...   │ │    Active • $450K     │  │ │
│ │                          │ │                        │  │ │
│ │   📎 checklist.pdf       │ └────────────────────────┘  │ │
│ │                          │ ┌────────────────────────┐  │ │
│ │ ▶ John Smith    10:30 AM │ │ 👤 John Smith         │  │ │
│ │   Thanks for the update  │ │    Contact      [X]   │  │ │
│ │                          │ │    john@buyer.com     │  │ │
│ │ ▶ Sarah Johnson Yesterday│ └────────────────────────┘  │ │
│ │   Great! See you then... │                              │ │
│ │                          │ ATTACHMENTS (1)             │ │
│ │                          │ ┌────────────────────────┐  │ │
│ │                          │ │ 📄 checklist.pdf      │  │ │
│ │                          │ │    120 KB             │  │ │
│ │                          │ │    [Download]         │  │ │
│ │                          │ └────────────────────────┘  │ │
│ │                          │                              │ │
│ │                          │ [Attach to...] (CTA)        │ │
│ └──────────────────────────┴──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### Mobile Single-Column
```
┌───────────────────────────────┐
│ ← Inbox                       │
│ ───────────────────────────── │
│ Re: Inspection Scheduling     │
│ sarah@agent.com               │
│ To: john@buyer.com +1         │
│ Jan 3, 2:45 PM                │
│                               │
│ [Linked Records ▾] [Attach +] │
│                               │
│ ▼ Sarah Johnson      2:45 PM  │
│   sarah@agent.com             │
│   To: john@buyer.com          │
│                               │
│   The inspection is...        │
│                               │
│   📎 checklist.pdf            │
│                               │
│ ▶ John Smith        10:30 AM  │
│   Thanks for...               │
│                               │
│ ▶ Sarah Johnson    Yesterday  │
│   Great! See you...           │
│                               │
│ ─────────────────────────────│
│ LINKED RECORDS (collapse)     │
│ 📍 1234 Oak St - #12345       │
│ 👤 John Smith                 │
│                               │
│ ATTACHMENTS                   │
│ 📄 checklist.pdf (120 KB)     │
│    [Download]                 │
└───────────────────────────────┘
```

**Mobile Behavior:**
- Sidebar content moves below thread
- Collapsible sections (Linked Records, Attachments)
- Sticky header with back button
- "Attach to..." FAB (Floating Action Button) in bottom-right

---

### Linked Records Panel Design

#### Record Card Component

**Deal Card:**
```tsx
<div className="bg-surface-elevated border border-emphasis rounded-xl p-4
                hover:border-brand-primary/30 transition-all group">
  <div className="flex items-start justify-between mb-2">
    <div className="flex items-center gap-2">
      <MapPin className="w-5 h-5 text-brand-primary" />
      <h4 className="text-body font-semibold text-primary">1234 Oak St</h4>
    </div>
    <button
      className="opacity-0 group-hover:opacity-100 p-1
                 hover:bg-surface-interactive rounded transition-opacity"
      onClick={handleUnlink}
      aria-label="Unlink this deal"
    >
      <X className="w-4 h-4 text-error" />
    </button>
  </div>

  <p className="text-small text-secondary mb-1">Deal #12345</p>
  <div className="flex items-center gap-3 text-small text-secondary">
    <Badge variant="success" dot>Active</Badge>
    <span>$450,000</span>
  </div>
</div>
```

**Contact Card:**
```tsx
<div className="bg-surface-elevated border border-emphasis rounded-xl p-4
                hover:border-brand-primary/30 transition-all group">
  <div className="flex items-start justify-between mb-2">
    <div className="flex items-center gap-3">
      <Avatar
        initials="JS"
        size="sm"
        src={contact.avatar_url}
      />
      <div>
        <h4 className="text-body font-semibold text-primary">John Smith</h4>
        <Badge variant="info" className="mt-1">Contact</Badge>
      </div>
    </div>
    <button
      className="opacity-0 group-hover:opacity-100 p-1
                 hover:bg-surface-interactive rounded transition-opacity"
      onClick={handleUnlink}
      aria-label="Unlink this contact"
    >
      <X className="w-4 h-4 text-error" />
    </button>
  </div>

  <p className="text-small text-secondary flex items-center gap-1 mt-2">
    <Mail className="w-4 h-4" />
    john@buyer.com
  </p>
</div>
```

**Auto-Link Indicator:**
```tsx
{link.link_method === 'rule' && (
  <div className="flex items-center gap-1 text-micro text-info mt-2">
    <Sparkles className="w-3 h-3" />
    <span>Auto-linked by {link.rule_name}</span>
  </div>
)}
```

**Empty State (No Links):**
```tsx
<div className="bg-surface-elevated/50 border border-dashed border-emphasis
                rounded-xl p-6 text-center">
  <Link2Off className="w-8 h-8 text-tertiary mx-auto mb-2" />
  <p className="text-small text-secondary mb-3">
    No linked records yet
  </p>
  <button
    className="text-small text-brand-primary font-medium hover:underline"
    onClick={openAttachModal}
  >
    Attach to a record
  </button>
</div>
```

---

### Attachment Display Patterns

#### Attachment Chip (Inline in Message)
```tsx
<div className="flex items-center gap-3 p-3 bg-surface-interactive
                rounded-lg hover:bg-surface-elevated transition-colors
                cursor-pointer group">
  <div className="w-10 h-10 bg-brand-primary/10 rounded-lg
                  flex items-center justify-center flex-shrink-0">
    <FileText className="w-5 h-5 text-brand-primary" />
  </div>

  <div className="flex-1 min-w-0">
    <p className="text-small font-medium text-primary truncate">
      inspection-checklist.pdf
    </p>
    <p className="text-micro text-tertiary">120 KB</p>
  </div>

  <button
    className="opacity-0 group-hover:opacity-100 p-2
               hover:bg-surface-base rounded transition-opacity"
    onClick={handleDownload}
    aria-label="Download attachment"
  >
    <Download className="w-4 h-4 text-secondary" />
  </button>
</div>
```

#### Attachment List (Sidebar)
```tsx
<div className="space-y-2">
  <h3 className="text-small font-semibold text-primary uppercase tracking-wide mb-3">
    Attachments ({attachments.length})
  </h3>

  {attachments.map(attachment => (
    <AttachmentChip key={attachment.id} attachment={attachment} />
  ))}
</div>
```

**File Type Icons:**
| MIME Type | Icon | Color |
|-----------|------|-------|
| `application/pdf` | FileText | brand-primary |
| `image/*` | Image | info |
| `application/vnd.*` (Office) | FileSpreadsheet | warning |
| `text/*` | FileCode | text-secondary |
| Default | File | text-tertiary |

---

## State Handling

### Empty State: "No emails yet"

```tsx
<EmptyState
  icon={Mail}
  title="No emails yet"
  description="Connect your Gmail account to automatically link emails to deals, contacts, and properties."
  action={{
    label: "Connect Gmail",
    onClick: initiateGmailOAuth
  }}
/>
```

**Visual Spec:**
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                    [📧 Mail Icon]                            │
│                    (64px, text-tertiary)                     │
│                                                              │
│                    No emails yet                             │
│                    (text-h1, text-primary)                   │
│                                                              │
│   Connect your Gmail account to automatically link emails   │
│   to deals, contacts, and properties.                       │
│   (text-body, text-secondary, max-width: 480px)             │
│                                                              │
│                  [Connect Gmail]                             │
│                  (Button - Primary)                          │
│                                                              │
│         Read-only access • Secure OAuth 2.0                  │
│         (text-small, text-tertiary)                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### Loading State: Skeleton UI

#### Thread List Skeleton
```tsx
<div className="space-y-2 animate-pulse">
  {Array.from({ length: 5 }).map((_, i) => (
    <div key={i} className="bg-surface-elevated rounded-xl p-4">
      {/* Sender + timestamp row */}
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 bg-surface-interactive rounded w-48" />
        <div className="h-3 bg-surface-interactive rounded w-16" />
      </div>

      {/* Subject */}
      <div className="h-5 bg-surface-interactive rounded w-64 mb-2" />

      {/* Snippet */}
      <div className="h-3 bg-surface-interactive rounded w-full mb-1" />
      <div className="h-3 bg-surface-interactive rounded w-3/4" />
    </div>
  ))}
</div>
```

**Animation:**
```css
@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}

.animate-pulse > * {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

#### Thread Detail Skeleton
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
  {/* Left column - Messages */}
  <div className="lg:col-span-2 space-y-4">
    {/* Header skeleton */}
    <div className="h-6 bg-surface-interactive rounded w-64 mb-4" />

    {/* Message skeletons */}
    {[1, 2, 3].map(i => (
      <div key={i} className="bg-surface-elevated rounded-xl p-4">
        <div className="h-4 bg-surface-interactive rounded w-32 mb-3" />
        <div className="h-3 bg-surface-interactive rounded w-full mb-2" />
        <div className="h-3 bg-surface-interactive rounded w-5/6 mb-2" />
        <div className="h-3 bg-surface-interactive rounded w-4/6" />
      </div>
    ))}
  </div>

  {/* Right column - Sidebar */}
  <div className="space-y-4">
    <div className="bg-surface-elevated rounded-xl p-4">
      <div className="h-4 bg-surface-interactive rounded w-24 mb-3" />
      <div className="h-20 bg-surface-interactive rounded" />
    </div>
  </div>
</div>
```

---

### Error State: Sync Failed

#### Sync Error Banner
```tsx
<div className="bg-error/10 border border-error rounded-xl p-4 mb-6">
  <div className="flex items-start gap-3">
    <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <h4 className="text-body font-semibold text-error mb-1">
        Email sync failed
      </h4>
      <p className="text-small text-secondary mb-3">
        We couldn't sync your emails from Gmail. This might be due to a
        connection issue or expired credentials.
      </p>
      <div className="flex gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={retrySync}
          isLoading={retrying}
        >
          Retry Sync
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={reconnectGmail}
        >
          Reconnect Gmail
        </Button>
      </div>
    </div>
    <button
      className="p-1 hover:bg-error/20 rounded transition-colors"
      onClick={dismissError}
      aria-label="Dismiss error"
    >
      <X className="w-5 h-5 text-error" />
    </button>
  </div>
</div>
```

**Error Types:**

| Error Code | Message | Action |
|------------|---------|--------|
| `OAUTH_EXPIRED` | "Gmail connection expired" | [Reconnect Gmail] |
| `RATE_LIMIT` | "Too many requests. Sync paused for 1 hour." | [View Status] |
| `NETWORK_ERROR` | "Network error during sync" | [Retry Now] |
| `UNKNOWN` | "An unexpected error occurred" | [Retry] [Contact Support] |

---

### Syncing State: Progress Indicator

#### Initial Backfill Progress
```tsx
<div className="bg-surface-elevated border border-emphasis rounded-xl p-6
                text-center">
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    className="w-12 h-12 mx-auto mb-4"
  >
    <RefreshCw className="w-12 h-12 text-brand-primary" />
  </motion.div>

  <h3 className="text-h3 text-primary mb-2">
    Syncing your emails...
  </h3>
  <p className="text-body text-secondary mb-4">
    {syncProgress.threads_synced} threads synced
  </p>

  {/* Progress bar */}
  <div className="w-full bg-surface-interactive rounded-full h-2 overflow-hidden">
    <motion.div
      className="h-full bg-brand-primary rounded-full"
      initial={{ width: 0 }}
      animate={{ width: `${syncProgress.percentage}%` }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    />
  </div>

  <p className="text-small text-tertiary mt-2">
    This may take a few minutes for large mailboxes
  </p>
</div>
```

#### Background Sync Indicator
```tsx
{/* Sticky banner at top when syncing in background */}
<motion.div
  initial={{ y: -100, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  exit={{ y: -100, opacity: 0 }}
  className="fixed top-16 left-0 right-0 z-40 bg-info/10 border-b border-info
             px-6 py-3 flex items-center justify-between"
>
  <div className="flex items-center gap-3">
    <RefreshCw className="w-5 h-5 text-info animate-spin" />
    <p className="text-small text-primary">
      Syncing new emails... ({syncProgress.threads_synced} threads)
    </p>
  </div>
  <button
    className="text-small text-info hover:underline"
    onClick={() => setSyncBannerVisible(false)}
  >
    Hide
  </button>
</motion.div>
```

**Sync Frequency:**
- Initial backfill: On first connection (last 30 days)
- Incremental sync: Every 5 minutes (background job)
- Manual sync: "Refresh" button in header
- Real-time: WebSocket for immediate delivery (future)

---

## Microinteractions

### Link Success Animation

```tsx
const handleAttachSuccess = () => {
  // 1. Confetti burst
  confetti({
    particleCount: 30,
    spread: 50,
    origin: { y: 0.6 },
    colors: ['#3B82F6', '#10B981', '#FFFFFF'],
    ticks: 100,
    gravity: 1.2
  });

  // 2. New record card slides in
  setLinkedRecords(prev => [...prev, newRecord]);

  // 3. Success toast
  toast.success(`Thread attached to ${newRecord.name}`);

  // 4. Close modal with delay for visual feedback
  setTimeout(() => {
    setAttachModalOpen(false);
  }, 300);
};
```

**Animation Sequence:**
1. **T+0ms:** Confetti starts (1s duration)
2. **T+100ms:** Modal begins fade-out
3. **T+200ms:** New card slides into sidebar from bottom
4. **T+300ms:** Card settles with subtle bounce
5. **T+500ms:** Toast appears bottom-right

**Card Entry Animation:**
```typescript
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};
```

---

### New Message Indicator

#### Unread Dot
```tsx
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ type: "spring", stiffness: 400, damping: 15 }}
  className="w-3 h-3 bg-brand-primary rounded-full flex-shrink-0"
/>
```

**Behavior:**
- Appears with spring animation on new unread thread
- Positioned left of sender name
- Persists until thread marked as read
- Batch update: If >10 new threads, no animation (performance)

#### New Thread Badge (Top of List)
```tsx
{hasNewThreads && (
  <motion.button
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="w-full py-2 px-4 bg-brand-primary/10 text-brand-primary
               border border-brand-primary/30 rounded-lg mb-4
               hover:bg-brand-primary/20 transition-colors"
    onClick={scrollToTop}
  >
    {newThreadCount} new {newThreadCount === 1 ? 'thread' : 'threads'}
  </motion.button>
)}
```

---

### Attachment Download Progress

```tsx
const [downloadProgress, setDownloadProgress] = useState(0);

const downloadAttachment = async (attachment: MailAttachment) => {
  setDownloadProgress(0);

  // Create progress-tracking fetch
  const response = await fetch(attachment.download_url);
  const reader = response.body?.getReader();
  const contentLength = +response.headers.get('Content-Length')!;

  let receivedLength = 0;
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;

    chunks.push(value);
    receivedLength += value.length;

    // Update progress
    setDownloadProgress((receivedLength / contentLength) * 100);
  }

  // Combine chunks and trigger download
  const blob = new Blob(chunks);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = attachment.filename;
  a.click();

  setDownloadProgress(100);
  toast.success(`Downloaded ${attachment.filename}`);
};
```

**Progress UI:**
```tsx
<div className="relative">
  <button
    className="flex items-center gap-2 px-3 py-1.5 bg-surface-interactive
               rounded-lg hover:bg-surface-elevated transition-colors"
    onClick={handleDownload}
    disabled={downloadProgress > 0 && downloadProgress < 100}
  >
    {downloadProgress > 0 && downloadProgress < 100 ? (
      <>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-small">{Math.round(downloadProgress)}%</span>
      </>
    ) : (
      <>
        <Download className="w-4 h-4" />
        <span className="text-small">Download</span>
      </>
    )}
  </button>

  {/* Progress bar */}
  {downloadProgress > 0 && downloadProgress < 100 && (
    <motion.div
      className="absolute bottom-0 left-0 h-1 bg-brand-primary rounded-full"
      initial={{ width: 0 }}
      animate={{ width: `${downloadProgress}%` }}
      transition={{ duration: 0.2 }}
    />
  )}
</div>
```

---

### Toast Notifications

#### Success Toast
```tsx
toast.success("Thread attached to Deal #12345", {
  duration: 3000,
  icon: <CheckCircle className="w-5 h-5 text-success" />,
  position: "bottom-right"
});
```

#### Error Toast
```tsx
toast.error("Failed to attach thread. Try again.", {
  duration: 5000,
  icon: <AlertCircle className="w-5 h-5 text-error" />,
  action: {
    label: "Retry",
    onClick: retryAttach
  }
});
```

#### Info Toast (Background Sync)
```tsx
toast.info("Sync complete: 12 new threads", {
  duration: 4000,
  icon: <Mail className="w-5 h-5 text-info" />
});
```

**Toast Variants:**
```typescript
const toastVariants = {
  initial: { opacity: 0, y: 50, scale: 0.3 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30
    }
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: { duration: 0.2 }
  }
};
```

---

## Accessibility

### Keyboard Navigation

#### Thread List
| Key | Action | Implementation |
|-----|--------|----------------|
| `Tab` | Focus next interactive element | Default browser behavior |
| `Shift+Tab` | Focus previous element | Default browser behavior |
| `↑` or `k` | Select previous thread | Custom handler with `scrollIntoView` |
| `↓` or `j` | Select next thread | Custom handler with `scrollIntoView` |
| `Enter` | Open selected thread | Navigate to detail view |
| `/` | Focus search input | Prevent default, call `searchRef.current?.focus()` |
| `u` | Toggle "Unread only" filter | Toggle state, update URL |
| `l` | Toggle "Linked only" filter | Toggle state, update URL |
| `r` | Refresh/sync emails | Trigger manual sync |
| `c` | Compose new email (future) | Open compose modal |
| `Esc` | Clear selection/filters | Reset all filters, clear search |

**Implementation:**
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ignore if user is typing in input
    if (e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch(e.key) {
      case 'ArrowUp':
      case 'k':
        e.preventDefault();
        selectPreviousThread();
        break;
      case 'ArrowDown':
      case 'j':
        e.preventDefault();
        selectNextThread();
        break;
      case 'Enter':
        if (selectedThreadId) {
          navigateToThread(selectedThreadId);
        }
        break;
      case '/':
        e.preventDefault();
        searchInputRef.current?.focus();
        break;
      // ... more cases
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [selectedThreadId]);
```

#### Thread Detail
| Key | Action |
|-----|--------|
| `Esc` | Return to inbox |
| `e` | Expand all messages |
| `a` | Open "Attach to..." modal |
| `u` | Unlink first record (with confirmation) |
| `↑` / `↓` | Navigate between messages |

---

### Screen Reader Labels

#### Thread List Item
```tsx
<div
  role="article"
  aria-label={`Email from ${thread.from_email}, subject ${thread.subject},
               received ${formatRelativeTime(thread.last_message_at)},
               ${thread.is_read ? 'read' : 'unread'},
               ${thread.linkedRecords.length > 0
                 ? `linked to ${thread.linkedRecords.length} records`
                 : 'not linked'}`}
  tabIndex={0}
  onClick={handleThreadClick}
  onKeyDown={handleKeyDown}
>
  {/* Visual content */}
</div>
```

#### Attachment
```tsx
<button
  aria-label={`Download ${attachment.filename}, ${formatFileSize(attachment.size_bytes)}`}
  onClick={handleDownload}
>
  <Download className="w-4 h-4" aria-hidden="true" />
</button>
```

#### Link/Unlink Actions
```tsx
<button
  aria-label={`Unlink email from ${record.name}`}
  onClick={handleUnlink}
>
  <X className="w-4 h-4" aria-hidden="true" />
</button>
```

#### Search Input
```tsx
<Input
  aria-label="Search email threads by subject, sender, or content"
  placeholder="Search threads..."
  role="searchbox"
  aria-describedby="search-instructions"
/>
<p id="search-instructions" className="sr-only">
  Type to search. Results update as you type. Use arrow keys to navigate.
</p>
```

---

### Focus Management

#### Modal Open
```tsx
const AttachModal = ({ isOpen, onClose }) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus search input when modal opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Trap focus within modal
  useFocusTrap(modalRef, isOpen);

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <Input ref={searchInputRef} placeholder="Search..." />
      {/* ... */}
    </Dialog>
  );
};
```

#### Focus Trap Implementation
```typescript
const useFocusTrap = (containerRef: RefObject<HTMLElement>, isActive: boolean) => {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    return () => container.removeEventListener('keydown', handleTabKey);
  }, [isActive, containerRef]);
};
```

#### Return Focus on Close
```typescript
const openAttachModal = () => {
  // Store current focus
  const triggerElement = document.activeElement as HTMLElement;

  setAttachModalOpen(true);

  // Return focus when modal closes
  const cleanup = () => {
    triggerElement?.focus();
  };

  return cleanup;
};
```

---

### Color Contrast Requirements

**WCAG 2.2 AA Standards:**

| Element | Foreground | Background | Contrast Ratio | Required | Pass |
|---------|-----------|------------|----------------|----------|------|
| Primary text | `#FFFFFF` | `#0A0A0A` | 19.53:1 | 4.5:1 | ✅ |
| Secondary text | `#A1A1AA` | `#0A0A0A` | 9.12:1 | 4.5:1 | ✅ |
| Tertiary text | `#71717A` | `#0A0A0A` | 5.81:1 | 4.5:1 | ✅ |
| Primary button | `#FFFFFF` | `#3B82F6` | 8.59:1 | 4.5:1 | ✅ |
| Link text | `#3B82F6` | `#0A0A0A` | 7.23:1 | 4.5:1 | ✅ |
| Error text | `#EF4444` | `#0A0A0A` | 5.94:1 | 4.5:1 | ✅ |
| Border emphasis | `rgba(255,255,255,0.1)` | `#0A0A0A` | 1.48:1 | 3:1 (non-text) | ❌ Use thicker borders |

**Adjustments for Low-Contrast Elements:**
- Borders: Use 2px thickness for `border-emphasis` to meet 3:1 ratio
- Icons: Ensure 3:1 contrast for interactive icons, 4.5:1 for informational icons
- Disabled states: 4.5:1 contrast even when faded (use `opacity: 0.6` minimum)

---

### ARIA Live Regions

#### Sync Status Announcements
```tsx
<div
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {syncStatus === 'syncing' && `Syncing emails: ${threadsCount} threads processed`}
  {syncStatus === 'complete' && `Sync complete: ${threadsCount} new threads`}
  {syncStatus === 'error' && `Sync failed: ${errorMessage}`}
</div>
```

#### Filter Updates
```tsx
<div aria-live="polite" className="sr-only">
  {activeFilters.length > 0
    ? `Showing ${filteredCount} threads with filters: ${activeFilters.join(', ')}`
    : `Showing all ${totalCount} threads`
  }
</div>
```

#### Toast Messages
```tsx
// Toasts automatically use aria-live="assertive" for errors, "polite" for info
<Toast
  variant="success"
  message="Thread attached to Deal #12345"
  role="status"
  aria-live="polite"
/>
```

---

## Mobile Considerations

### Responsive Breakpoints

```typescript
const breakpoints = {
  mobile: 0,       // 0-639px
  tablet: 640,     // 640-1023px
  desktop: 1024,   // 1024px+
  wide: 1440       // 1440px+
};
```

**Tailwind Classes:**
```tsx
// Mobile-first approach
<div className="
  p-4 md:p-6 lg:p-8           // Padding scales up
  grid grid-cols-1 lg:grid-cols-3  // Single column mobile, 3-col desktop
  gap-4 md:gap-6              // Gap increases with screen size
">
```

---

### Touch Targets

**Minimum Size: 44px × 44px (iOS HIG)**

#### Thread List Item
```css
.thread-item {
  min-height: 88px; /* Enough for 2 lines of text + padding */
  padding: 16px;
  /* Touch target: 88px height across full width */
}
```

#### Icon Buttons
```tsx
<button className="
  w-11 h-11                    // 44px minimum
  flex items-center justify-center
  rounded-lg
  active:bg-surface-interactive
  touch-manipulation           // Disables zoom on double-tap
">
  <Download className="w-5 h-5" />
</button>
```

#### Spacing Between Targets
```css
.action-buttons {
  display: flex;
  gap: 12px; /* Minimum 8px, prefer 12px for comfortable tapping */
}
```

---

### Swipe Gestures

#### Thread List Swipe Actions (Future Enhancement)
```typescript
import { useSwipeable } from 'react-swipeable';

const ThreadListItem = ({ thread }) => {
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      // Reveal quick actions (Archive, Delete)
      setSwipeState('actions-visible');
    },
    onSwipedRight: () => {
      // Toggle read/unread
      toggleReadStatus(thread.id);
      toast.success(thread.is_read ? 'Marked unread' : 'Marked read');
    },
    preventScrollOnSwipe: true,
    trackMouse: false // Touch only
  });

  return (
    <div {...handlers} className="relative">
      {/* Thread content */}

      {/* Swipe action overlay */}
      <motion.div
        className="absolute inset-y-0 right-0 bg-error flex items-center px-6"
        initial={{ width: 0 }}
        animate={{ width: swipeState === 'actions-visible' ? 120 : 0 }}
      >
        <Trash2 className="w-5 h-5 text-white" />
      </motion.div>
    </div>
  );
};
```

**Gesture Spec:**
| Gesture | Action | Visual Feedback |
|---------|--------|-----------------|
| Swipe right →  | Mark read/unread | Green overlay, checkmark icon |
| Swipe left ←   | Reveal delete action | Red overlay, trash icon |
| Long press (500ms) | Multi-select mode | Haptic feedback, selection checkboxes appear |

---

### Mobile Layout Adaptations

#### Thread List (Mobile)
```tsx
// Hide filters bar, replace with single "Filters" button
<div className="flex items-center gap-3 mb-4 md:hidden">
  <button
    className="flex items-center gap-2 px-4 py-2 bg-surface-elevated
               rounded-lg border border-emphasis"
    onClick={openFiltersSheet}
  >
    <SlidersHorizontal className="w-5 h-5" />
    <span>Filters</span>
    {activeFilters.length > 0 && (
      <Badge variant="brand-primary" className="ml-1">
        {activeFilters.length}
      </Badge>
    )}
  </button>

  <button
    className="flex-1 flex items-center gap-2 px-4 py-2 bg-surface-elevated
               rounded-lg border border-emphasis"
    onClick={openSearchOverlay}
  >
    <Search className="w-5 h-5 text-tertiary" />
    <span className="text-secondary">Search...</span>
  </button>
</div>
```

#### Filters Bottom Sheet
```tsx
<BottomSheet
  isOpen={filtersSheetOpen}
  onClose={() => setFiltersSheetOpen(false)}
  snapPoints={[0.5, 0.9]} // Half screen or almost full
>
  <h3 className="text-h3 mb-4">Filters</h3>

  <div className="space-y-4">
    <div>
      <label className="text-small font-medium mb-2 block">Status</label>
      <div className="flex flex-wrap gap-2">
        <FilterChip
          label="All"
          active={!statusFilter}
          onClick={() => setStatusFilter(null)}
        />
        <FilterChip
          label="Unread"
          active={statusFilter === 'unread'}
          onClick={() => setStatusFilter('unread')}
        />
        <FilterChip
          label="Linked"
          active={statusFilter === 'linked'}
          onClick={() => setStatusFilter('linked')}
        />
        <FilterChip
          label="Unlinked"
          active={statusFilter === 'unlinked'}
          onClick={() => setStatusFilter('unlinked')}
        />
      </div>
    </div>

    <div>
      <label className="text-small font-medium mb-2 block">Has Attachments</label>
      <Switch
        checked={attachmentFilter}
        onChange={setAttachmentFilter}
      />
    </div>
  </div>

  <div className="flex gap-3 mt-6">
    <Button variant="secondary" onClick={clearFilters} fullWidth>
      Clear All
    </Button>
    <Button variant="primary" onClick={applyFilters} fullWidth>
      Apply
    </Button>
  </div>
</BottomSheet>
```

#### Thread Detail (Mobile)
```tsx
// Single column layout
<div className="flex flex-col h-screen">
  {/* Sticky header */}
  <header className="sticky top-0 z-10 bg-surface-elevated/95 backdrop-blur-xl
                     border-b border-subtle p-4">
    <button className="flex items-center gap-2 text-secondary mb-3"
            onClick={returnToInbox}>
      <ChevronLeft className="w-5 h-5" />
      <span>Inbox</span>
    </button>

    <h1 className="text-h3 text-primary mb-1 truncate">
      {thread.subject}
    </h1>
    <p className="text-small text-secondary truncate">
      {thread.from_email}
    </p>
  </header>

  {/* Scrollable content */}
  <div className="flex-1 overflow-y-auto p-4 space-y-4">
    {/* Messages */}
    {messages.map(msg => (
      <MessageBubble key={msg.id} message={msg} />
    ))}
  </div>

  {/* Sticky footer with actions */}
  <footer className="sticky bottom-0 z-10 bg-surface-elevated/95 backdrop-blur-xl
                     border-t border-subtle p-4">
    <div className="flex gap-3">
      <button
        className="flex-1 py-3 bg-surface-interactive rounded-lg
                   flex items-center justify-center gap-2"
        onClick={toggleLinkedRecords}
      >
        <Link2 className="w-5 h-5" />
        <span>Linked ({linkedRecords.length})</span>
      </button>
      <button
        className="flex-1 py-3 bg-brand-primary text-white rounded-lg
                   flex items-center justify-center gap-2"
        onClick={openAttachModal}
      >
        <Plus className="w-5 h-5" />
        <span>Attach</span>
      </button>
    </div>
  </footer>
</div>

{/* Linked records sheet (toggle) */}
<BottomSheet isOpen={linkedRecordsOpen} onClose={closeLinkedRecords}>
  <h3 className="text-h3 mb-4">Linked Records ({linkedRecords.length})</h3>
  <div className="space-y-3">
    {linkedRecords.map(record => (
      <RecordCard key={record.id} record={record} />
    ))}
  </div>
  {linkedRecords.length === 0 && (
    <EmptyState
      icon={Link2Off}
      title="No linked records"
      description="Attach this email to deals, contacts, or properties."
      action={{ label: "Attach Now", onClick: openAttachModal }}
    />
  )}
</BottomSheet>
```

#### Floating Action Button (FAB)
```tsx
// Show on scroll down (hide header), hide on scroll up
<motion.button
  className="fixed bottom-20 right-4 w-14 h-14 bg-brand-primary rounded-full
             shadow-2xl flex items-center justify-center z-20"
  initial={{ scale: 0, opacity: 0 }}
  animate={{
    scale: showFAB ? 1 : 0,
    opacity: showFAB ? 1 : 0
  }}
  whileTap={{ scale: 0.9 }}
  onClick={openAttachModal}
  aria-label="Attach to record"
>
  <Plus className="w-6 h-6 text-white" />
</motion.button>
```

---

## Component State Matrix

### ThreadListItem Component

| State | Visual | Interactive | Accessibility |
|-------|--------|-------------|---------------|
| **Default** | bg: surface-base, border: subtle | Clickable, hover → surface-elevated | role="article", tabindex="0" |
| **Unread** | Unread dot (brand-primary), bold subject | Same as default | aria-label includes "unread" |
| **Selected (keyboard)** | Focus ring: 2px brand-primary | Highlighted, Enter to open | aria-selected="true" |
| **Hover** | bg → surface-elevated, left border: brand-primary | Show action icons (right side) | No change |
| **Loading** | Skeleton pulse animation | Not clickable, pointer-events: none | aria-busy="true" |
| **Error** | Red left border, error icon | Clickable (to retry), tooltip explains error | aria-invalid="true" |

**State Transitions:**
```typescript
type ThreadState =
  | 'default'
  | 'unread'
  | 'selected'
  | 'hover'
  | 'loading'
  | 'error';

const stateStyles: Record<ThreadState, string> = {
  default: 'bg-surface-base border-l-2 border-transparent',
  unread: 'bg-surface-base border-l-2 border-transparent font-semibold',
  selected: 'bg-surface-elevated border-l-2 border-brand-primary ring-2 ring-brand-primary',
  hover: 'bg-surface-elevated border-l-2 border-brand-primary',
  loading: 'bg-surface-base border-l-2 border-transparent animate-pulse pointer-events-none',
  error: 'bg-error/5 border-l-2 border-error'
};
```

---

### AttachModal Component

| State | Search Input | Results | Actions | Focus |
|-------|-------------|---------|---------|-------|
| **Initial** | Empty, focused | Show "Recent" (5 items) | "Attach" disabled | Search input |
| **Searching** | Has query (>2 chars) | Loading spinner OR grouped results | "Attach" enabled if selection | Search input |
| **Has Results** | Query present | Grouped by type (max 5 per group) | "Attach" enabled if selection | First result |
| **No Results** | Query present | Empty state message | "Attach" disabled | Search input |
| **Selection Active** | Query may change | Selected items highlighted | "Attach" enabled, shows count | Selected items |
| **Submitting** | Disabled | Disabled | "Attach" loading spinner | None (trap) |
| **Error** | Re-enabled | Re-enabled | "Attach" enabled, error toast shown | Search input |

**State Machine:**
```typescript
type ModalState =
  | { type: 'initial' }
  | { type: 'searching'; query: string }
  | { type: 'hasResults'; results: SearchResult[]; selected: string[] }
  | { type: 'noResults'; query: string }
  | { type: 'submitting'; selected: string[] }
  | { type: 'error'; error: string };

const reducer = (state: ModalState, action: ModalAction): ModalState => {
  switch (action.type) {
    case 'QUERY_CHANGED':
      if (action.query.length < 2) return { type: 'initial' };
      return { type: 'searching', query: action.query };

    case 'RESULTS_RECEIVED':
      if (action.results.length === 0) {
        return { type: 'noResults', query: state.query };
      }
      return { type: 'hasResults', results: action.results, selected: [] };

    case 'ITEM_SELECTED':
      return {
        ...state,
        selected: state.selected.includes(action.id)
          ? state.selected.filter(id => id !== action.id)
          : [...state.selected, action.id]
      };

    case 'SUBMIT':
      return { type: 'submitting', selected: state.selected };

    case 'SUBMIT_ERROR':
      return { type: 'error', error: action.error };

    default:
      return state;
  }
};
```

---

### LinkedRecordCard Component

| State | Visual | Interactive | Actions |
|-------|--------|-------------|---------|
| **Default** | bg: surface-elevated, border: emphasis | Hover shows [X] button | Click card → Navigate to record |
| **Hover** | border → brand-primary/30, [X] visible | [X] clickable | Hover [X] → bg: surface-interactive |
| **Auto-Linked** | "Auto-linked" badge with Sparkles icon | Same as default | Shows rule name in tooltip |
| **Unlinking** | Opacity 50%, loading spinner replaces [X] | Not clickable | N/A |
| **Removed** | Fade-out + slide-up animation (200ms) | Not interactive | Removed from DOM after animation |

**Animation Spec:**
```typescript
const cardVariants = {
  default: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  hover: {
    y: -2,
    transition: { duration: 0.2 }
  },
  unlinking: {
    opacity: 0.5,
    scale: 0.98
  },
  removed: {
    opacity: 0,
    y: -20,
    scale: 0.9,
    transition: { duration: 0.2 }
  }
};
```

---

## Edge Cases

### 1. Large Thread (>50 Messages)

**Problem:** Thread with 100+ messages would overwhelm UI and performance.

**Solution:**
- Paginate messages: Show latest 10, "Load 10 more" button
- Virtual scrolling for >50 messages (react-window)
- Collapse all by default except latest

**Implementation:**
```typescript
const MESSAGES_PER_PAGE = 10;
const [visibleCount, setVisibleCount] = useState(MESSAGES_PER_PAGE);

const displayedMessages = messages.slice(0, visibleCount);
const hasMore = visibleCount < messages.length;

return (
  <>
    {displayedMessages.map(msg => <Message key={msg.id} {...msg} />)}
    {hasMore && (
      <button
        className="w-full py-3 text-brand-primary hover:bg-surface-interactive"
        onClick={() => setVisibleCount(prev => prev + MESSAGES_PER_PAGE)}
      >
        Load {Math.min(MESSAGES_PER_PAGE, messages.length - visibleCount)} more messages
      </button>
    )}
  </>
);
```

---

### 2. Attachment Exceeds Size Limit (>25MB)

**Problem:** Gmail attachments can be large; downloads may fail or timeout.

**Solution:**
- Show warning badge on large attachments (>10MB)
- Stream download with progress bar
- Retry logic (3 attempts with exponential backoff)
- Fallback: "Open in Gmail" link

**UI:**
```tsx
{attachment.size_bytes > 10_000_000 && (
  <div className="flex items-center gap-1 text-warning text-micro">
    <AlertTriangle className="w-3 h-3" />
    <span>Large file ({formatFileSize(attachment.size_bytes)})</span>
  </div>
)}

<button onClick={handleDownload} className="...">
  {downloadState === 'error' ? (
    <>
      <AlertCircle className="w-4 h-4 text-error" />
      <span>Failed - Retry</span>
    </>
  ) : (
    <>
      <Download className="w-4 h-4" />
      <span>Download</span>
    </>
  )}
</button>

{downloadState === 'error' && (
  <a
    href={`https://mail.google.com/mail/u/0/#inbox/${message.provider_message_id}`}
    target="_blank"
    className="text-small text-brand-primary hover:underline"
  >
    Open in Gmail
  </a>
)}
```

---

### 3. Duplicate Email Address Across Multiple Contacts

**Problem:** john@example.com exists for 2 different contacts (John Smith Buyer, John Smith Seller).

**Auto-Link Behavior:**
- Link thread to ALL matching contacts
- Show confidence score (50% each)
- Flag for manual review

**UI Indication:**
```tsx
<LinkedRecordCard
  record={contact}
  confidence={50}
  showAmbiguousWarning={true}
/>

{/* Warning banner in sidebar */}
<div className="bg-warning/10 border border-warning rounded-lg p-3 mb-4">
  <div className="flex items-start gap-2">
    <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
    <div>
      <p className="text-small font-medium text-warning">
        Ambiguous auto-link
      </p>
      <p className="text-small text-secondary">
        This email matched multiple contacts. Verify the correct link.
      </p>
    </div>
  </div>
</div>
```

---

### 4. Thread Linked to Closed Deal

**Problem:** User tries to attach email to a deal that was closed 6 months ago.

**Solution:**
- Allow attachment (don't block)
- Show warning: "This deal was closed on {date}. Are you sure?"
- Add audit note in ledger

**Confirmation Dialog:**
```tsx
<Dialog
  isOpen={showClosedDealWarning}
  title="Link to closed deal?"
  variant="warning"
>
  <p className="text-body text-secondary mb-4">
    This deal was closed on <strong>{formatDate(deal.closed_at)}</strong>.
    You can still attach this email, but it won't appear in active deal workflows.
  </p>

  <div className="flex gap-3 justify-end">
    <Button variant="secondary" onClick={() => setShowClosedDealWarning(false)}>
      Cancel
    </Button>
    <Button variant="primary" onClick={confirmAttach}>
      Attach Anyway
    </Button>
  </div>
</Dialog>
```

---

### 5. Gmail Connection Expires Mid-Session

**Problem:** User is browsing inbox when OAuth token expires (after 1 hour).

**Solution:**
- Background token refresh (10 min before expiry)
- If refresh fails, show reconnect prompt
- Queue pending actions (attach, mark read) for retry after reconnect

**Error UI:**
```tsx
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  className="fixed top-16 left-0 right-0 z-50 bg-error/10 border-b border-error
             px-6 py-4"
>
  <div className="flex items-center justify-between max-w-5xl mx-auto">
    <div className="flex items-center gap-3">
      <AlertCircle className="w-5 h-5 text-error" />
      <div>
        <p className="text-body font-medium text-error">
          Gmail connection expired
        </p>
        <p className="text-small text-secondary">
          Reconnect to continue syncing emails
        </p>
      </div>
    </div>
    <Button variant="primary" onClick={reconnectGmail}>
      Reconnect Gmail
    </Button>
  </div>
</motion.div>
```

---

### 6. Empty Search Results

**Problem:** User searches for "inspection report" but no threads match.

**Solution:**
- Show helpful empty state
- Suggest alternatives (remove filters, check spelling, search in Gmail)

**Empty State:**
```tsx
<div className="py-12 text-center">
  <Search className="w-12 h-12 text-tertiary mx-auto mb-3" />
  <h3 className="text-h3 text-primary mb-2">
    No results for "{query}"
  </h3>
  <p className="text-body text-secondary mb-6 max-w-md mx-auto">
    We couldn't find any emails matching your search.
    Try adjusting your search or filters.
  </p>

  <div className="space-y-2">
    <button
      className="block mx-auto text-brand-primary hover:underline"
      onClick={clearFilters}
    >
      Clear all filters
    </button>
    <a
      href={`https://mail.google.com/mail/u/0/#search/${encodeURIComponent(query)}`}
      target="_blank"
      className="block mx-auto text-brand-primary hover:underline"
    >
      Search in Gmail instead
    </a>
  </div>
</div>
```

---

### 7. Slow Network / Timeout

**Problem:** User on slow 3G connection; thread detail takes >10s to load.

**Solution:**
- Show skeleton immediately (don't wait for data)
- Timeout after 15s, show retry
- Prefetch on hover (200ms delay)

**Timeout Handling:**
```typescript
const fetchThreadDetail = async (threadId: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`/api/threads/${threadId}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection.');
    }
    throw error;
  }
};
```

**Error UI:**
```tsx
{error && (
  <div className="flex flex-col items-center justify-center py-12">
    <WifiOff className="w-12 h-12 text-error mb-3" />
    <h3 className="text-h3 text-primary mb-2">Connection timeout</h3>
    <p className="text-body text-secondary mb-6">
      {error.message}
    </p>
    <Button variant="primary" onClick={retry}>
      Retry
    </Button>
  </div>
)}
```

---

### 8. User Unlinks All Records from Thread

**Problem:** Thread now has 0 linked records; might be lost in "unlinked" filter.

**Solution:**
- Show toast: "Thread unlinked from all records. Find it in 'Unlinked' filter."
- Auto-apply "Unlinked" filter (optional, with undo)

**Toast:**
```typescript
toast.info("Thread unlinked from all records", {
  description: "This thread is now in your 'Unlinked' inbox.",
  action: {
    label: "View Unlinked",
    onClick: () => {
      setFilter('unlinked');
      router.push('/inbox?filter=unlinked');
    }
  }
});
```

---

## Animation Timing

### Timing Reference Table

| Interaction | Duration | Easing | Notes |
|-------------|----------|--------|-------|
| **Page transition** | 200ms | easeOut | Fade + slide 8px |
| **Modal open/close** | 300ms | easeInOut | Backdrop fade + content scale |
| **Card hover lift** | 200ms | easeOut | -2px y-translate |
| **Button tap** | 100ms | spring (stiffness: 400) | Scale 0.97 |
| **Toast appear** | 300ms | spring (stiffness: 500) | Bottom-right slide + scale |
| **Toast dismiss** | 200ms | easeIn | Fade + scale 0.5 |
| **Skeleton pulse** | 1500ms | cubic-bezier(0.4, 0, 0.6, 1) | Infinite loop |
| **Message expand** | 300ms | easeOut | Height auto + opacity |
| **Message collapse** | 200ms | easeIn | Height 0 + opacity |
| **Link success confetti** | 1000ms | gravity: 1.2 | 30 particles |
| **Record card entry** | 400ms | spring (damping: 24) | Slide up + scale |
| **Record card remove** | 200ms | easeIn | Fade + slide up |
| **Loading spinner** | 1000ms | linear | Infinite rotate 360deg |
| **Progress bar fill** | 500ms | easeOut | Width percentage |

---

### Spring Physics Presets

```typescript
// Framer Motion spring configurations
const springPresets = {
  // Snappy interactions (buttons, toggles)
  snappy: {
    type: "spring",
    stiffness: 400,
    damping: 17
  },

  // Smooth animations (modals, cards)
  smooth: {
    type: "spring",
    stiffness: 300,
    damping: 24
  },

  // Gentle animations (page transitions)
  gentle: {
    type: "spring",
    stiffness: 200,
    damping: 20
  },

  // Bouncy (success animations, celebrations)
  bouncy: {
    type: "spring",
    stiffness: 500,
    damping: 30,
    mass: 1.2
  }
};
```

---

### Stagger Timing

```typescript
// Thread list items appear with stagger
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // 50ms between each item
      delayChildren: 0.1     // 100ms before first item
    }
  }
};

// Individual items
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

// Usage
<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  {threads.map(thread => (
    <motion.div key={thread.id} variants={itemVariants}>
      <ThreadListItem thread={thread} />
    </motion.div>
  ))}
</motion.div>
```

**Performance Note:**
- Limit stagger to first 20 items (performance on long lists)
- Disable animations if `prefers-reduced-motion: reduce`

---

### Reduced Motion Support

```typescript
import { useReducedMotion } from 'framer-motion';

const Component = () => {
  const shouldReduceMotion = useReducedMotion();

  const variants = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.01 }
      }
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { type: "spring", stiffness: 300, damping: 24 }
      };

  return <motion.div {...variants}>{/* content */}</motion.div>;
};
```

**CSS Fallback:**
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Definition of Done Checklist

- [x] User flow diagrams documented for all primary flows
- [x] Interaction specs defined for all interactive components
- [x] Visual hierarchy specified for desktop and mobile layouts
- [x] State handling documented for empty, loading, error, syncing states
- [x] Microinteractions specified with animation timing
- [x] Accessibility requirements documented (keyboard nav, screen reader, focus, contrast)
- [x] Mobile considerations addressed (responsive, touch targets, gestures)
- [x] Component state matrix created for key components
- [x] Edge cases identified and solutions documented
- [x] Animation timing reference table provided

---

**Document Version:** 1.0
**Status:** Sprint 0.2 - P0 Deliverable
**Author:** UI/UX Design Virtuoso Agent
**Last Updated:** 2025-12-31
