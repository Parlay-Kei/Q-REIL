# Q UI Shell Design
**REIL/Q Sprint 0.1 - Lane 3**
**Version:** 1.0
**Last Updated:** 2025-12-31

---

## Design Philosophy

Q is the command center for real estate transaction management. The UI must empower professionals to manage complex workflows efficiently while maintaining clarity and accessibility. Our design combines:

- **Leo Natsume's Cross-Platform Cohesion**: Seamless desktop-to-tablet experience
- **Jide Lambo's Bold Minimalism**: Strategic negative space, high-impact typography
- **2025 Bento Grid Layouts**: Asymmetric, information-dense yet scannable
- **Glassmorphism & Depth**: Layered interfaces with subtle blur effects
- **Accessible by Default**: WCAG 2.2 AA+ compliance

---

## Color System

### Brand Palette
| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `brand-primary` | `#2563EB` (Blue 600) | `#3B82F6` (Blue 500) | CTAs, active states, links |
| `brand-secondary` | `#7C3AED` (Purple 600) | `#8B5CF6` (Purple 500) | Accents, highlights |
| `success` | `#059669` (Emerald 600) | `#10B981` (Emerald 500) | Closed deals, completed tasks |
| `warning` | `#D97706` (Amber 600) | `#F59E0B` (Amber 500) | Pending states, alerts |
| `error` | `#DC2626` (Red 600) | `#EF4444` (Red 500) | Critical issues, rejections |
| `info` | `#0891B2` (Cyan 600) | `#06B6D4` (Cyan 500) | Informational badges |

### Surface Palette (Dark Mode Primary)
| Token | Value | Usage |
|-------|-------|-------|
| `surface-base` | `#0A0A0A` | App background |
| `surface-elevated` | `#1A1A1A` | Cards, modals |
| `surface-interactive` | `#2D2D2D` | Hover states, inputs |
| `surface-glass` | `rgba(26, 26, 26, 0.7)` + `blur(12px)` | Floating panels, dropdowns |
| `border-subtle` | `rgba(255, 255, 255, 0.05)` | Dividers |
| `border-emphasis` | `rgba(255, 255, 255, 0.1)` | Card outlines |

### Text Palette
| Token | Value | Usage |
|-------|-------|-------|
| `text-primary` | `#FFFFFF` | Headlines, primary content |
| `text-secondary` | `#A1A1AA` (Zinc 400) | Body text, descriptions |
| `text-tertiary` | `#71717A` (Zinc 500) | Metadata, timestamps |
| `text-inverse` | `#0A0A0A` | Text on light backgrounds |

---

## Typography System

**Font Stack:** `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

```css
/* Display - Hero sections */
.text-display {
  font-size: 2.25rem; /* 36px */
  line-height: 2.5rem; /* 40px */
  font-weight: 700;
  letter-spacing: -0.02em;
}

/* H1 - Page titles */
.text-h1 {
  font-size: 1.875rem; /* 30px */
  line-height: 2.25rem; /* 36px */
  font-weight: 700;
  letter-spacing: -0.01em;
}

/* H2 - Section headers */
.text-h2 {
  font-size: 1.5rem; /* 24px */
  line-height: 2rem; /* 32px */
  font-weight: 600;
}

/* H3 - Card titles, subsections */
.text-h3 {
  font-size: 1.25rem; /* 20px */
  line-height: 1.75rem; /* 28px */
  font-weight: 600;
}

/* Body - Primary content */
.text-body {
  font-size: 1rem; /* 16px */
  line-height: 1.5rem; /* 24px */
  font-weight: 400;
}

/* Small - Secondary content */
.text-small {
  font-size: 0.875rem; /* 14px */
  line-height: 1.25rem; /* 20px */
  font-weight: 400;
}

/* Micro - Labels, badges */
.text-micro {
  font-size: 0.75rem; /* 12px */
  line-height: 1rem; /* 16px */
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

---

## Layout Architecture

### App Shell Structure

```
┌─────────────────────────────────────────────────────────────┐
│ TOP BAR (h-16, fixed)                                       │
│ [Logo] [Search────────] [Notifications] [User Menu]        │
├──────┬──────────────────────────────────────────────────────┤
│      │ BREADCRUMBS (h-12)                                   │
│      │ Home > Pipeline > Deal #12345                        │
│ SIDE ├──────────────────────────────────────────────────────┤
│ NAV  │                                                       │
│      │                                                       │
│ (w-  │ MAIN CONTENT AREA                                    │
│ 64   │ (Scrollable, padding-responsive)                     │
│ col- │                                                       │
│ laps-│                                                       │
│ ible)│                                                       │
│      │                                                       │
└──────┴──────────────────────────────────────────────────────┘
```

### Responsive Breakpoints

```javascript
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Ultra-wide
};
```

**Mobile Strategy (< 768px):**
- Side nav collapses to bottom tab bar
- Top bar shows hamburger menu + logo + user avatar
- Cards stack vertically
- Tables convert to card lists

---

## Top Bar Component

### Wireframe
```
┌─────────────────────────────────────────────────────────────┐
│ [Q Logo] [🔍 Search deals, contacts, documents...]          │
│                                      [🔔 3] [👤 John D. ▾]  │
└─────────────────────────────────────────────────────────────┘
```

### Specifications

**Container:**
- Height: `64px` (h-16)
- Background: `surface-elevated` with `backdrop-blur-xl`
- Border bottom: `1px solid border-subtle`
- Fixed position with `z-index: 50`

**Logo:**
- Size: `40px × 40px`
- Margin left: `24px`
- Interactive: Click returns to `/pipeline`

**Global Search:**
- Width: `min(600px, 50vw)`
- Height: `40px`
- Background: `surface-interactive`
- Border radius: `12px`
- Placeholder: "Search deals, contacts, documents..." (text-secondary)
- Icon: Search (Lucide) 20px, text-tertiary
- Keyboard shortcut: `Cmd/Ctrl + K`
- Focus state: `ring-2 ring-brand-primary`

**Search Results Dropdown:**
- Opens below input with `backdrop-blur-xl` glassmorphism
- Grouped sections: Recent, Deals, Contacts, Documents
- Keyboard navigation: Arrow keys + Enter
- Max height: `400px`, scrollable
- Each result shows icon, title, subtitle (e.g., address + status)

**Notifications Bell:**
- Icon size: `24px`
- Badge: Red dot or count if > 0
- Hover: Scale 1.05 with spring animation
- Dropdown: Recent notifications, "Mark all read", "View all"

**User Menu:**
- Avatar: `32px` circle with fallback initials
- Name: "John D." (truncate if long)
- Dropdown alignment: Right
- Menu items:
  - Profile
  - Settings
  - Admin (if has permission)
  - Dark/Light Mode Toggle
  - Sign Out

### Interactions

**Animation on Scroll:**
```typescript
// Subtle glassmorphism enhancement when scrolled
const topBarVariants = {
  top: {
    backgroundColor: "rgba(26, 26, 26, 0.7)",
    backdropFilter: "blur(12px)"
  },
  scrolled: {
    backgroundColor: "rgba(26, 26, 26, 0.95)",
    backdropFilter: "blur(20px)",
    borderBottomColor: "rgba(255, 255, 255, 0.1)"
  }
};
```

---

## Side Navigation Component

### Wireframe
```
┌──────────┐
│ [⚡] Pipeline │  ← Active
│ [📊] Records  │
│ [📄] Docs     │
│ [📥] Inbox    │
│ [✓] Tasks    │
├──────────┤
│ [⚙️] Admin   │  ← If role allows
│   Ledger    │
│   Connectors│
└──────────┘
```

### Specifications

**Container:**
- Width: `256px` (w-64) expanded, `72px` collapsed
- Background: `surface-elevated`
- Border right: `1px solid border-subtle`
- Transition: `width 300ms cubic-bezier(0.4, 0, 0.2, 1)`

**Navigation Items:**
- Height: `48px` each
- Padding: `12px 16px`
- Border radius: `8px` (inset from edges by 8px)
- Gap between icon and text: `12px`
- Icon size: `24px`

**States:**
```css
/* Default */
.nav-item {
  color: text-secondary;
  background: transparent;
}

/* Hover */
.nav-item:hover {
  color: text-primary;
  background: surface-interactive;
}

/* Active */
.nav-item.active {
  color: brand-primary;
  background: rgba(37, 99, 235, 0.1); /* brand-primary/10 */
  border-left: 3px solid brand-primary;
}
```

**Collapse Toggle:**
- Position: Bottom of nav or icon button in top bar
- Icon: ChevronLeft/ChevronRight
- Persist state in localStorage

**Admin Section:**
- Visual divider above (1px border-subtle)
- Label: "ADMIN" (text-micro, text-tertiary)
- Nested items indented 12px when expanded
- Show/hide based on user role

### Icons

| Route | Icon (Lucide) |
|-------|---------------|
| Pipeline | LayoutGrid |
| Records | FolderOpen |
| Docs | FileText |
| Inbox | Mail |
| Tasks | CheckSquare |
| Admin | Settings |
| Ledger | Activity |
| Connectors | Plug |

---

## Breadcrumbs Component

### Wireframe
```
Home > Pipeline > Lead Stage > Deal #12345 (1234 Oak St)
```

### Specifications

- Height: `48px` (h-12)
- Background: `surface-base`
- Border bottom: `1px solid border-subtle`
- Padding: `0 24px`
- Align items center

**Separator:** ChevronRight icon, 16px, text-tertiary

**Crumb Styles:**
- Default: text-secondary, hover:text-primary
- Current (last): text-primary, non-interactive
- Click: Navigate to parent route

**Max Crumbs:** Show first, ..., last 2 if > 4 levels

---

## Screen Design: `/pipeline`

### Overview
Kanban-style pipeline view for deal management. Drag-and-drop between stages with real-time updates.

### Wireframe
```
┌─────────────────────────────────────────────────────────────┐
│ Pipeline                                        [+ New Deal] │
│                                                              │
│ [Filters: All Agents ▾] [All Types ▾] [Last 30 Days ▾]     │
├──────────┬──────────┬──────────┬──────────────────────────┤
│  LEAD    │  ACTIVE  │ PENDING  │  CLOSED                  │
│  (12)    │  (8)     │  (5)     │  (23)                    │
├──────────┼──────────┼──────────┼──────────────────────────┤
│ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │ ┌──────┐                │
│ │ Deal │ │ │ Deal │ │ │ Deal │ │ │ Deal │                │
│ │ Card │ │ │ Card │ │ │ Card │ │ │ Card │                │
│ └──────┘ │ └──────┘ │ └──────┘ │ └──────┘                │
│          │          │          │                          │
│ ┌──────┐ │          │          │                          │
│ │ Deal │ │          │          │                          │
│ │ Card │ │          │          │                          │
│ └──────┘ │          │          │                          │
└──────────┴──────────┴──────────┴──────────────────────────┘
```

### Header Section

**Title:** "Pipeline" (text-h1)
**CTA Button:**
```tsx
<button className="px-4 py-2 bg-brand-primary rounded-lg text-white
                   font-semibold hover:bg-brand-primary/90
                   transition-colors flex items-center gap-2">
  <Plus className="w-5 h-5" />
  New Deal
</button>
```

### Filters Bar

**Container:**
- Margin top: `24px`
- Margin bottom: `16px`
- Flex layout, gap `12px`

**Filter Dropdowns:**
- Height: `40px`
- Background: `surface-elevated`
- Border: `1px solid border-emphasis`
- Rounded: `8px`
- Padding: `0 12px`
- Icon: ChevronDown

**Filter Options:**
1. **Agent Filter:** All Agents, Assigned to Me, [Individual Names]
2. **Property Type:** All Types, Residential, Commercial, Land
3. **Date Range:** Last 7 Days, Last 30 Days, Last 90 Days, Custom Range

### Kanban Board

**Stage Columns:**
- Flex layout with equal widths
- Min width: `280px`
- Max width: `360px`
- Gap: `16px`
- Horizontal scroll on smaller screens

**Column Header:**
```tsx
<div className="flex items-center justify-between px-4 py-3
                bg-surface-elevated rounded-t-xl border-b border-subtle">
  <div className="flex items-center gap-2">
    <h3 className="text-h3 text-primary">Lead</h3>
    <span className="px-2 py-0.5 bg-surface-interactive rounded-full
                     text-micro text-secondary">12</span>
  </div>
  <button className="text-tertiary hover:text-primary">
    <MoreVertical className="w-5 h-5" />
  </button>
</div>
```

**Column Body:**
- Background: `surface-base`
- Padding: `12px`
- Gap between cards: `12px`
- Min height: `400px`
- Max height: `calc(100vh - 280px)`
- Overflow: Auto scroll
- Scrollbar: Custom styled (thin, rounded, brand-primary)

**Drag & Drop Interactions:**
```typescript
// Visual feedback during drag
const dragVariants = {
  idle: { scale: 1, rotate: 0, opacity: 1 },
  dragging: {
    scale: 1.05,
    rotate: 2,
    opacity: 0.8,
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
  },
  dropZone: {
    backgroundColor: "rgba(37, 99, 235, 0.05)",
    borderColor: "rgba(37, 99, 235, 0.3)",
    borderStyle: "dashed"
  }
};
```

**Empty State:**
```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <FolderOpen className="w-12 h-12 text-tertiary mb-3" />
  <p className="text-secondary">No deals in this stage</p>
</div>
```

---

## Deal Card Component

### Wireframe
```
┌─────────────────────────────────────┐
│ 1234 Oak Street, Austin TX          │ ← Address (bold)
│ $450,000                             │ ← Price (brand-primary)
│                                      │
│ 👤 John Smith (Buyer)                │ ← Primary party
│ 📅 Est. Close: Jan 15, 2025          │ ← Key date
│                                      │
│ [🏷️ Residential] [⚠️ Inspection]     │ ← Tags/badges
│                                      │
│ ───────────────────────────────────  │
│ Updated 2h ago • Sarah J.            │ ← Metadata
└─────────────────────────────────────┘
```

### Specifications

**Container:**
```css
.deal-card {
  background: surface-elevated;
  border: 1px solid border-emphasis;
  border-radius: 12px;
  padding: 16px;
  cursor: grab;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.deal-card:hover {
  border-color: border-brand-primary/30;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

.deal-card:active {
  cursor: grabbing;
}
```

**Address (Title):**
- Font: text-h3
- Color: text-primary
- Truncate: 1 line with ellipsis

**Price:**
- Font: text-body, font-semibold
- Color: brand-primary
- Format: $XXX,XXX

**Party Information:**
- Icon: User (16px)
- Text: "{Name} ({Role})" - text-small, text-secondary
- Truncate if long

**Key Date:**
- Icon: Calendar (16px)
- Text: "Est. Close: {Date}" - text-small, text-secondary
- Color coding: Red if < 7 days, Amber if < 30 days

**Tags/Badges:**
- Max 2 visible, "+X more" if overflow
- Height: `24px`
- Padding: `4px 8px`
- Border radius: `6px`
- Background: Based on tag type (e.g., info color for property type)

**Footer Metadata:**
- Font: text-micro
- Color: text-tertiary
- Format: "{Time ago} • {Agent name}"
- Border top: `1px solid border-subtle`
- Padding top: `12px`
- Margin top: `12px`

### Click Behavior
- Click card: Navigate to `/record/{dealId}`
- Click while dragging: No-op (prevent accidental navigation)

---

## Screen Design: `/record/:id`

### Overview
Comprehensive deal/property record view with tabbed navigation for different data aspects.

### Wireframe
```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Pipeline                                          │
│                                                              │
│ 1234 Oak Street, Austin, TX 78701                           │
│ [🟢 Active]  Est. Close: Jan 15, 2025  •  Listing: Dec 1    │
│                                                              │
│ [Overview] [Documents] [Messages] [Tasks] [Activity]        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ OVERVIEW TAB CONTENT                                        │
│                                                              │
│ ┌─────────────────┐  ┌────────────────────────────────────┐│
│ │ Key Details     │  │ Parties Involved                   ││
│ │ Property Type:  │  │ 👤 John Smith (Buyer)              ││
│ │ Residential     │  │ 📧 john@example.com                ││
│ │                 │  │                                    ││
│ │ Price: $450K    │  │ 👤 Jane Doe (Seller)               ││
│ │ ...             │  │ 📧 jane@example.com                ││
│ └─────────────────┘  └────────────────────────────────────┘│
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Timeline                                                ││
│ │ ●━━━━━━━━●━━━━━━━━○━━━━━━━━○                           ││
│ │ Listed  Accepted  Inspect.  Closing                     ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Header Section

**Back Button:**
- Icon: ChevronLeft
- Text: "Back to Pipeline"
- Color: text-secondary, hover:text-primary

**Property Address:**
- Font: text-display
- Color: text-primary
- Margin top: `16px`

**Status & Dates Row:**
- Flex layout, align center, gap `16px`
- Status badge: See Status Badge component
- Dates: text-small, text-secondary, icon + text format

**Action Buttons (Top Right):**
```tsx
<div className="flex gap-3">
  <button className="px-4 py-2 bg-surface-elevated rounded-lg
                     border border-emphasis hover:bg-surface-interactive">
    <Share2 className="w-4 h-4" />
  </button>
  <button className="px-4 py-2 bg-surface-elevated rounded-lg
                     border border-emphasis hover:bg-surface-interactive">
    <MoreHorizontal className="w-4 h-4" />
  </button>
</div>
```

### Tab Navigation

**Container:**
- Margin top: `24px`
- Border bottom: `2px solid border-subtle`

**Tab Buttons:**
```css
.tab-button {
  padding: 12px 20px;
  font-size: 1rem;
  font-weight: 500;
  color: text-secondary;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 200ms;
}

.tab-button:hover {
  color: text-primary;
}

.tab-button.active {
  color: brand-primary;
  border-bottom-color: brand-primary;
}
```

**Badge Counts:**
- Show unread count on Messages tab
- Show incomplete count on Tasks tab
- Position: Inline after tab name

---

### Overview Tab

**Layout:** Bento grid with responsive columns

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
  {/* Left column - 1 col */}
  <div className="lg:col-span-1 space-y-6">
    <KeyDetailsCard />
    <QuickActionsCard />
  </div>

  {/* Right column - 2 cols */}
  <div className="lg:col-span-2 space-y-6">
    <PartiesCard />
    <TimelineCard />
    <RecentActivityCard />
  </div>
</div>
```

**Key Details Card:**
- Background: surface-elevated
- Border radius: 16px
- Padding: 20px
- Rows: Label (text-small, text-tertiary) + Value (text-body, text-primary)
- Fields:
  - Property Type
  - List Price / Sale Price
  - Square Footage
  - Bedrooms / Bathrooms
  - Lot Size
  - Year Built
  - MLS Number

**Parties Involved Card:**
- Header: "Parties Involved" + "Add Party" button
- List of contact cards:
  - Avatar (32px circle)
  - Name (text-body, font-semibold)
  - Role badge (Buyer, Seller, Agent, Attorney, etc.)
  - Email (text-small, text-secondary)
  - Phone (text-small, text-secondary)
  - Click: Opens contact detail modal or inline expansion

**Timeline Component:**
```tsx
// Horizontal timeline with milestones
<div className="bg-surface-elevated rounded-2xl p-6">
  <h3 className="text-h3 mb-6">Transaction Timeline</h3>
  <div className="relative">
    {/* Timeline line */}
    <div className="absolute top-4 left-0 right-0 h-1 bg-surface-interactive" />

    {/* Milestones */}
    <div className="relative flex justify-between">
      {milestones.map((milestone) => (
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center
                          ${milestone.completed
                            ? 'bg-success'
                            : milestone.current
                              ? 'bg-brand-primary ring-4 ring-brand-primary/20'
                              : 'bg-surface-interactive'}`}>
            {milestone.completed && <Check className="w-4 h-4 text-white" />}
          </div>
          <span className="text-small text-secondary mt-2 text-center">
            {milestone.label}
          </span>
          <span className="text-micro text-tertiary mt-1">
            {milestone.date}
          </span>
        </div>
      ))}
    </div>
  </div>
</div>
```

---

### Documents Tab

**Layout:** Two-column view (list + preview)

**Wireframe:**
```
┌────────────────────┬─────────────────────────────────────┐
│ Documents (24)     │ [Preview Area]                      │
│ [Upload] [Filter▾] │                                     │
│                    │ purchase-agreement.pdf              │
│ 📁 Contracts (8)   │                                     │
│   ✓ Purchase Agr.  │ [PDF rendering or                  │
│   ✓ Addendum #1    │  placeholder if not supported]     │
│   ○ Addendum #2    │                                     │
│                    │                                     │
│ 📁 Disclosures (5) │ [Download] [Share] [Delete]        │
│ 📁 Inspection (3)  │                                     │
│ 📁 Closing (2)     │                                     │
└────────────────────┴─────────────────────────────────────┘
```

**Left Sidebar (w-80):**
- Header with document count
- Upload button (primary CTA)
- Filter dropdown (All, Pending Review, Recent)
- Category folders (collapsible)
- Document list items:
  - Icon based on file type (PDF, DOC, IMG)
  - Filename (truncate)
  - File size
  - Upload date
  - Status icon (checkmark if reviewed/signed)

**Document List Item:**
```tsx
<button className="w-full flex items-center gap-3 p-3 rounded-lg
                   hover:bg-surface-interactive transition-colors
                   ${selected ? 'bg-surface-interactive' : ''}">
  <FileText className="w-5 h-5 text-brand-primary flex-shrink-0" />
  <div className="flex-1 text-left min-w-0">
    <p className="text-small font-medium text-primary truncate">
      purchase-agreement.pdf
    </p>
    <p className="text-micro text-tertiary">
      2.4 MB • Jan 2, 2025
    </p>
  </div>
  {document.reviewed && (
    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
  )}
</button>
```

**Preview Area:**
- Background: surface-base
- For PDFs: Embed viewer or react-pdf component
- For images: Full preview with zoom controls
- For unsupported: File icon + metadata + download button
- Action buttons (fixed to top):
  - Download
  - Share (generate link)
  - Move to folder
  - Delete (with confirmation)

**Upload Modal:**
- Drag & drop zone
- File type validation
- Category selector
- Progress indicator for upload
- Batch upload support

---

### Messages Tab

**Layout:** Email-style inbox with conversation threading

**Wireframe:**
```
┌─────────────────────┬──────────────────────────────────┐
│ [Compose]           │ Re: Inspection Scheduling        │
│                     │ From: Sarah Agent                │
│ ☑️ Unread (3)        │ To: John Smith, Jane Doe         │
│ 📥 Assigned to Me   │ Jan 3, 2025 2:30 PM              │
│ 🔗 Linked           │                                  │
│ 📤 Unlinked         │ Hi team,                         │
│                     │                                  │
│ ━━━━━━━━━━━━━━━━━━  │ The inspection is scheduled...   │
│                     │                                  │
│ ✉️ Re: Inspection   │ [Message thread]                 │
│   Sarah Agent       │                                  │
│   2:30 PM           │ ─────────────────────────────    │
│   📎 1              │                                  │
│                     │ [Reply Box]                      │
│ ✉️ Documents Ready  │ [Send]                           │
│   Jane Doe          │                                  │
│   Yesterday         │                                  │
│                     │                                  │
└─────────────────────┴──────────────────────────────────┘
```

**Left Sidebar (w-96):**
- Compose button (sticky top)
- Filter tabs (all, unread, assigned, linked/unlinked)
- Message list:
  - Subject line (bold if unread)
  - Sender name
  - Timestamp (relative: "2h ago", "Yesterday")
  - Attachment indicator
  - Snippet preview (1 line)
  - Link icon if associated with record

**Message Thread View:**
- Header: Subject, participants, timestamp
- Collapsible messages (show latest, expand to see history)
- Each message:
  - Sender avatar + name
  - Timestamp
  - Message body (preserve formatting)
  - Attachments list
  - Reply/Forward buttons

**Reply Box:**
- Rich text editor (bold, italic, lists, links)
- Attachment picker
- Send button (primary CTA)
- Save draft (auto-save every 30s)

**Link to Record:**
- Floating action button or header button
- Opens dropdown to select deal/property
- Once linked, show badge and filter accordingly

---

### Tasks Tab

**Layout:** Task list with grouping and filtering

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────┐
│ Tasks (12)                                      [+ New Task]│
│ Group by: [Deal ▾]  Filter: [All ▾]                        │
├─────────────────────────────────────────────────────────────┤
│ OVERDUE (2)                                                 │
│ ☐ Review inspection report                                 │
│   Due: Jan 1 • Assigned to: Sarah J. • Priority: High      │
│                                                             │
│ ☐ Upload signed contract                                   │
│   Due: Dec 30 • Assigned to: Me • Priority: High           │
│                                                             │
│ TODAY (3)                                                   │
│ ☐ Schedule final walkthrough                               │
│ ☐ Confirm closing time                                     │
│ ☑️ Send welcome packet                                      │
│                                                             │
│ UPCOMING (7)                                                │
│ ...                                                         │
└─────────────────────────────────────────────────────────────┘
```

**Header:**
- Task count
- New Task button (opens modal)
- Group by dropdown: Deal, Due Date, Assignee, Priority
- Filter dropdown: All, Assigned to Me, Overdue, Completed

**Task Groups:**
- Section headers with count badges
- Overdue tasks highlighted with error color accent

**Task Item:**
```tsx
<div className="flex items-start gap-4 p-4 rounded-lg
                hover:bg-surface-elevated group">
  {/* Checkbox */}
  <input
    type="checkbox"
    className="w-5 h-5 mt-0.5 rounded border-2 border-emphasis
               checked:bg-brand-primary checked:border-brand-primary"
  />

  {/* Content */}
  <div className="flex-1">
    <h4 className="text-body font-medium text-primary mb-1">
      Review inspection report
    </h4>
    <div className="flex items-center gap-3 text-small text-secondary">
      <span className={`flex items-center gap-1
                       ${overdue ? 'text-error' : ''}`}>
        <Calendar className="w-4 h-4" />
        Due: Jan 1
      </span>
      <span className="flex items-center gap-1">
        <User className="w-4 h-4" />
        Sarah J.
      </span>
      <span className="px-2 py-0.5 bg-error/10 text-error rounded-full text-micro">
        High Priority
      </span>
    </div>
  </div>

  {/* Actions (show on hover) */}
  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
    <button className="p-2 hover:bg-surface-interactive rounded-lg">
      <MoreHorizontal className="w-5 h-5" />
    </button>
  </div>
</div>
```

**New Task Modal:**
- Title input
- Description textarea
- Due date picker
- Assignee selector
- Priority selector (Low, Medium, High)
- Deal association dropdown
- Create button

**Quick Actions:**
- Checkbox: Mark complete (with confetti animation)
- Hover menu: Edit, Reassign, Change Date, Delete

---

### Activity Tab

**Layout:** Reverse chronological event feed

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────┐
│ Activity Log                                [Export]        │
│ [All Events ▾] [Last 30 Days ▾]                            │
├─────────────────────────────────────────────────────────────┤
│ TODAY                                                       │
│ ● 2:45 PM - Document uploaded                              │
│   Sarah Johnson uploaded "inspection-report.pdf"           │
│   to Inspection folder                                     │
│                                                             │
│ ● 10:30 AM - Status changed                                │
│   Deal moved from Active to Pending by John Doe            │
│                                                             │
│ YESTERDAY                                                   │
│ ● 4:15 PM - Message received                               │
│   New message from Jane Seller: "When is closing?"         │
│                                                             │
│ ● 2:00 PM - Task completed                                 │
│   Sarah Johnson completed "Schedule inspection"            │
│                                                             │
│ JAN 2, 2025                                                 │
│ ...                                                         │
└─────────────────────────────────────────────────────────────┘
```

**Event Types with Icons:**
| Event Type | Icon | Color |
|------------|------|-------|
| Document Upload | FileText | info |
| Status Change | TrendingUp | success |
| Message | Mail | brand-primary |
| Task Complete | CheckCircle | success |
| Task Created | Plus | info |
| Party Added | UserPlus | brand-secondary |
| Note Added | MessageSquare | info |
| System Event | Activity | text-tertiary |

**Event Item:**
```tsx
<div className="flex gap-4 pb-6 border-l-2 border-subtle pl-6 ml-2 relative">
  {/* Timeline dot */}
  <div className="absolute -left-[9px] w-4 h-4 rounded-full bg-brand-primary
                  ring-4 ring-surface-base" />

  {/* Content */}
  <div className="flex-1">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-body text-primary font-medium mb-1">
          Document uploaded
        </p>
        <p className="text-small text-secondary">
          Sarah Johnson uploaded "inspection-report.pdf" to Inspection folder
        </p>
      </div>
      <span className="text-small text-tertiary whitespace-nowrap ml-4">
        2:45 PM
      </span>
    </div>
  </div>
</div>
```

**Filters:**
- Event type: All, Documents, Status Changes, Messages, Tasks, System
- Date range: Last 7 Days, Last 30 Days, Last 90 Days, Custom
- User: All Users, [Individual Names]

**Export Button:**
- Generate CSV or PDF of activity log
- Filtered by current selections

---

## Screen Design: `/docs`

### Overview
Document library with grid/list views, search, and bulk operations.

### Wireframe (Grid View)
```
┌─────────────────────────────────────────────────────────────┐
│ Documents                                       [Upload]    │
│ [🔍 Search...] [All Categories ▾] [Grid ⊞] [List ≡]        │
├─────────────────────────────────────────────────────────────┤
│ 📁 Contracts (24)          📁 Disclosures (12)              │
│ 📁 Inspections (8)         📁 Closing Docs (15)             │
│                                                             │
│ RECENT DOCUMENTS                                            │
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐                   │
│ │ [PDF] │ │ [DOC] │ │ [IMG] │ │ [PDF] │                   │
│ │ Purch │ │ Adden │ │ Front │ │ Insp  │                   │
│ │ -ase  │ │ -dum  │ │ Photo │ │ -ect  │                   │
│ └───────┘ └───────┘ └───────┘ └───────┘                   │
│ 1.2 MB    856 KB    3.4 MB    2.1 MB                       │
│ Jan 3     Jan 2     Jan 1     Dec 30                       │
│                                                             │
│ [Load More]                                                 │
└─────────────────────────────────────────────────────────────┘
```

### Header

**Title:** "Documents" (text-h1)
**Upload Button:** Primary CTA, opens upload modal

### Toolbar

**Search Input:**
- Width: `min(400px, 40%)`
- Placeholder: "Search documents..."
- Live search with debounce (300ms)
- Search scope: Filename, content (if indexed), tags

**Category Filter:**
- Dropdown with folder structure
- Multi-select with checkboxes
- "All Categories" default

**View Toggle:**
- Icons: Grid (LayoutGrid) and List (List)
- Toggle between views, persist preference

**Bulk Actions (when items selected):**
- Floating toolbar at bottom
- Actions: Download All, Move to Folder, Delete
- Show count: "X items selected"

### Category Folders

**Folder Card:**
```tsx
<div className="bg-surface-elevated border border-emphasis rounded-xl p-4
                hover:border-brand-primary/30 hover:shadow-lg
                transition-all cursor-pointer">
  <div className="flex items-center gap-3">
    <Folder className="w-8 h-8 text-brand-primary" />
    <div>
      <h3 className="text-h3 text-primary">Contracts</h3>
      <p className="text-small text-secondary">24 documents</p>
    </div>
  </div>
</div>
```

### Document Grid

**Grid Layout:**
- Grid columns: `repeat(auto-fill, minmax(200px, 1fr))`
- Gap: `16px`

**Document Card:**
```tsx
<div className="bg-surface-elevated border border-emphasis rounded-xl
                overflow-hidden hover:border-brand-primary/30 hover:shadow-lg
                transition-all group cursor-pointer">
  {/* Preview */}
  <div className="aspect-[3/4] bg-surface-interactive flex items-center
                  justify-center relative">
    <FileText className="w-12 h-12 text-brand-primary" />

    {/* Checkbox overlay (show on hover or when selected) */}
    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100
                    transition-opacity">
      <input type="checkbox" className="w-5 h-5 rounded" />
    </div>
  </div>

  {/* Metadata */}
  <div className="p-3">
    <h4 className="text-small font-medium text-primary truncate mb-1">
      purchase-agreement.pdf
    </h4>
    <p className="text-micro text-tertiary">1.2 MB • Jan 3</p>
  </div>
</div>
```

### Document List (Alternative View)

**Table Layout:**
- Columns: Checkbox, Name, Category, Size, Modified, Actions
- Sortable headers
- Row hover: Highlight background

**List Row:**
```tsx
<tr className="border-b border-subtle hover:bg-surface-elevated
               transition-colors">
  <td className="p-4">
    <input type="checkbox" className="w-5 h-5 rounded" />
  </td>
  <td className="p-4">
    <div className="flex items-center gap-3">
      <FileText className="w-5 h-5 text-brand-primary" />
      <span className="text-body text-primary font-medium">
        purchase-agreement.pdf
      </span>
    </div>
  </td>
  <td className="p-4 text-small text-secondary">Contracts</td>
  <td className="p-4 text-small text-secondary">1.2 MB</td>
  <td className="p-4 text-small text-secondary">Jan 3, 2025</td>
  <td className="p-4">
    <button className="p-2 hover:bg-surface-interactive rounded-lg">
      <MoreHorizontal className="w-5 h-5" />
    </button>
  </td>
</tr>
```

---

## Screen Design: `/inbox`

### Overview
Unified inbox for all communications across deals.

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────┐
│ Inbox                                           [Compose]   │
│ [🔍 Search...] [All ▾] [Unread ▾] [Linked ▾]               │
├──────────────────────┬──────────────────────────────────────┤
│ ✉️ Re: Inspection    │ Re: Inspection Scheduling            │
│   Sarah Agent        │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│   2:30 PM            │                                      │
│   📎 1   🔗 #12345   │ [Message thread view]                │
│                      │                                      │
│ ✉️ Documents Ready   │                                      │
│   Jane Doe           │                                      │
│   Yesterday          │                                      │
│   🔗 #12345          │                                      │
│                      │                                      │
│ ✉️ Showing Tomorrow  │                                      │
│   Mike Agent         │                                      │
│   2 days ago         │                                      │
│   [No link]          │                                      │
└──────────────────────┴──────────────────────────────────────┘
```

### Filters Bar

**Search:** Global message search
**Filters:**
- Status: All, Unread, Starred, Archived
- Assignment: All, Assigned to Me
- Link Status: All, Linked to Deal, Unlinked

### Message List (Left Panel)

**Message Item:**
```tsx
<div className={`p-4 border-b border-subtle cursor-pointer
                 hover:bg-surface-elevated transition-colors
                 ${message.unread ? 'bg-brand-primary/5' : ''}
                 ${message.selected ? 'bg-surface-interactive' : ''}`}>
  <div className="flex items-start gap-3">
    {/* Avatar */}
    <div className="w-10 h-10 rounded-full bg-brand-primary
                    flex items-center justify-center text-white font-semibold">
      SA
    </div>

    {/* Content */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <h4 className={`text-body truncate
                       ${message.unread ? 'font-semibold' : 'font-medium'}
                       text-primary`}>
          Re: Inspection
        </h4>
        <span className="text-small text-tertiary ml-2">2:30 PM</span>
      </div>
      <p className="text-small text-secondary mb-1">Sarah Agent</p>
      <p className="text-small text-tertiary truncate">
        The inspection is scheduled for tomorrow...
      </p>

      {/* Metadata badges */}
      <div className="flex items-center gap-2 mt-2">
        {message.hasAttachment && (
          <Paperclip className="w-4 h-4 text-tertiary" />
        )}
        {message.linkedDeal && (
          <span className="flex items-center gap-1 text-micro text-brand-primary">
            <Link className="w-3 h-3" />
            #{message.linkedDeal}
          </span>
        )}
      </div>
    </div>

    {/* Unread indicator */}
    {message.unread && (
      <div className="w-2 h-2 rounded-full bg-brand-primary flex-shrink-0 mt-2" />
    )}
  </div>
</div>
```

### Message Thread (Right Panel)

- Reuses design from Messages tab in record view
- Additional "Link to Deal" button in header if unlinked
- Assignment dropdown to assign conversation to team member

---

## Screen Design: `/tasks`

### Overview
Global task management across all deals.

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────┐
│ Tasks                                           [+ New Task]│
│ [🔍 Search...] Group by: [Deal ▾] Filter: [Assigned ▾]     │
├─────────────────────────────────────────────────────────────┤
│ OVERDUE (3)                                                 │
│ Deal #12345 - 1234 Oak St                                   │
│   ☐ Review inspection report                               │
│   ☐ Upload signed contract                                 │
│                                                             │
│ Deal #12346 - 5678 Elm St                                   │
│   ☐ Schedule appraisal                                      │
│                                                             │
│ TODAY (5)                                                   │
│ Deal #12345 - 1234 Oak St                                   │
│   ☐ Schedule final walkthrough                             │
│   ☐ Confirm closing time                                   │
│                                                             │
│ UPCOMING (12)                                               │
│ ...                                                         │
└─────────────────────────────────────────────────────────────┘
```

### Grouping Options

- **By Deal:** Tasks nested under deal name
- **By Due Date:** Overdue, Today, Tomorrow, This Week, Later
- **By Assignee:** Tasks grouped by assigned user

### Filters

- **Assignment:** All, Assigned to Me, Assigned to Others, Unassigned
- **Status:** All, Active, Completed
- **Priority:** All, High, Medium, Low
- **Deal:** All Deals, [Individual Deal Selector]

### Task Item

Reuses task component from record Tasks tab, with additional context:
- If grouped by assignee/date: Show deal name with link
- Click task: Opens task detail modal
- Click deal name: Navigate to `/record/:id`

---

## Admin Screen: `/admin/ledger`

### Overview
Event stream viewer for REIL ledger debugging and audit.

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────┐
│ Event Ledger                                    [Export]    │
│ [Event Type ▾] [Entity ▾] [Last 24h ▾] [Search...]         │
├─────────────────────────────────────────────────────────────┤
│ JAN 3, 2025 2:45:32 PM                                      │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ DocumentUploaded                             [Details]  ││
│ │ Entity: document:doc_123abc                            ││
│ │ User: user:sarah_johnson                               ││
│ │ Metadata: filename="inspection.pdf", size=2.4MB        ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ JAN 3, 2025 10:30:15 AM                                     │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ DealStatusChanged                            [Details]  ││
│ │ Entity: deal:deal_456def                               ││
│ │ Previous: Active → New: Pending                        ││
│ │ User: user:john_doe                                    ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ [Load More Events]                                          │
└─────────────────────────────────────────────────────────────┘
```

### Filters

**Event Type Dropdown:**
- All Events
- DealCreated, DealStatusChanged, DealClosed
- DocumentUploaded, DocumentSigned
- MessageReceived, MessageSent
- TaskCreated, TaskCompleted
- UserAction, SystemEvent

**Entity Dropdown:**
- All Entities
- Deals
- Documents
- Messages
- Tasks
- Users

**Date Range:**
- Last 24 Hours
- Last 7 Days
- Last 30 Days
- Custom Range

**Search:**
- Free text search across event metadata
- Supports entity IDs, user names, keywords

### Event Card

```tsx
<div className="bg-surface-elevated border border-emphasis rounded-xl p-4
                hover:border-brand-primary/30 transition-colors">
  <div className="flex items-start justify-between mb-3">
    <div>
      <h4 className="text-body font-semibold text-primary mb-1">
        DocumentUploaded
      </h4>
      <p className="text-small text-secondary">
        Entity: <code className="text-brand-primary">document:doc_123abc</code>
      </p>
    </div>
    <button className="text-brand-primary text-small font-medium
                       hover:underline">
      Details
    </button>
  </div>

  <div className="space-y-1 text-small">
    <p className="text-secondary">
      <span className="text-tertiary">User:</span> user:sarah_johnson
    </p>
    <p className="text-secondary">
      <span className="text-tertiary">Metadata:</span>
      filename="inspection.pdf", size=2.4MB
    </p>
  </div>
</div>
```

### Event Detail Modal

**Triggered by:** Click "Details" button

**Content:**
- Full JSON payload (syntax highlighted)
- Event timestamp (precise to milliseconds)
- Event ID
- Related events (if applicable)
- Copy event ID button
- Copy JSON button

---

## Admin Screen: `/admin/connectors`

### Overview
Integration status dashboard for SkySlope, email, and other connectors.

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────┐
│ Connectors                                                  │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 🔌 SkySlope Forms                          [⚙️] [●]     ││
│ │ Status: Connected                                       ││
│ │ Last Sync: 5 minutes ago                                ││
│ │ Total Synced: 1,234 documents                           ││
│ │ Errors (Last 24h): 0                                    ││
│ │                                                         ││
│ │ [View Logs] [Configure] [Test Connection]              ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 📧 Email Integration                       [⚙️] [●]     ││
│ │ Status: Connected                                       ││
│ │ Last Sync: 2 minutes ago                                ││
│ │ Total Messages: 5,678                                   ││
│ │ Errors (Last 24h): 2                       [⚠️ View]    ││
│ │                                                         ││
│ │ [View Logs] [Configure] [Test Connection]              ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 📊 MLS Integration                         [⚙️] [○]     ││
│ │ Status: Disconnected                                    ││
│ │ Last Sync: Never                                        ││
│ │ Errors: Not configured                                  ││
│ │                                                         ││
│ │ [Configure] [Connect]                                   ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Connector Card

```tsx
<div className="bg-surface-elevated border border-emphasis rounded-2xl p-6">
  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-brand-primary/10 rounded-xl
                      flex items-center justify-center">
        <Plug className="w-6 h-6 text-brand-primary" />
      </div>
      <div>
        <h3 className="text-h3 text-primary">SkySlope Forms</h3>
        <p className="text-small text-success flex items-center gap-1">
          <CheckCircle className="w-4 h-4" />
          Connected
        </p>
      </div>
    </div>

    {/* Actions */}
    <div className="flex items-center gap-2">
      <button className="p-2 hover:bg-surface-interactive rounded-lg">
        <Settings className="w-5 h-5 text-secondary" />
      </button>
      {/* Toggle switch */}
      <button className={`w-12 h-6 rounded-full transition-colors
                         ${enabled ? 'bg-success' : 'bg-surface-interactive'}`}>
        <div className={`w-5 h-5 bg-white rounded-full transform transition-transform
                        ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  </div>

  {/* Stats */}
  <div className="grid grid-cols-2 gap-4 mb-4">
    <div>
      <p className="text-micro text-tertiary mb-1">LAST SYNC</p>
      <p className="text-small text-primary">5 minutes ago</p>
    </div>
    <div>
      <p className="text-micro text-tertiary mb-1">TOTAL SYNCED</p>
      <p className="text-small text-primary">1,234 documents</p>
    </div>
    <div>
      <p className="text-micro text-tertiary mb-1">ERRORS (24H)</p>
      <p className="text-small text-success">0</p>
    </div>
  </div>

  {/* Actions */}
  <div className="flex gap-2 pt-4 border-t border-subtle">
    <button className="px-4 py-2 text-small font-medium text-secondary
                       hover:text-primary transition-colors">
      View Logs
    </button>
    <button className="px-4 py-2 text-small font-medium text-secondary
                       hover:text-primary transition-colors">
      Configure
    </button>
    <button className="px-4 py-2 text-small font-medium text-brand-primary
                       hover:underline">
      Test Connection
    </button>
  </div>
</div>
```

### Status Indicators

| Status | Color | Icon |
|--------|-------|------|
| Connected | success | CheckCircle |
| Syncing | warning | RefreshCw (spinning) |
| Error | error | AlertCircle |
| Disconnected | text-tertiary | Circle (outline) |

### Error Badge

When errors > 0:
```tsx
<button className="flex items-center gap-2 px-3 py-1.5
                   bg-error/10 text-error rounded-lg text-small
                   hover:bg-error/20 transition-colors">
  <AlertCircle className="w-4 h-4" />
  <span>View {errorCount} errors</span>
</button>
```

---

## Shared Components

### Status Badge

**Component:**
```tsx
interface StatusBadgeProps {
  status: 'lead' | 'active' | 'pending' | 'closed' | 'cancelled';
}

const statusConfig = {
  lead: { color: 'info', label: 'Lead', icon: Target },
  active: { color: 'brand-primary', label: 'Active', icon: TrendingUp },
  pending: { color: 'warning', label: 'Pending', icon: Clock },
  closed: { color: 'success', label: 'Closed', icon: CheckCircle },
  cancelled: { color: 'error', label: 'Cancelled', icon: XCircle }
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                     text-small font-medium
                     bg-${config.color}/10 text-${config.color}`}>
      <Icon className="w-4 h-4" />
      {config.label}
    </span>
  );
};
```

### Data Table

**Features:**
- Sortable columns (click header)
- Resizable columns (drag divider)
- Row selection (checkboxes)
- Pagination or infinite scroll
- Empty state
- Loading skeleton

**Header:**
```tsx
<thead className="border-b border-emphasis">
  <tr>
    <th className="p-4 text-left">
      <input type="checkbox" className="w-5 h-5 rounded" />
    </th>
    <th className="p-4 text-left cursor-pointer hover:bg-surface-interactive
                   transition-colors group">
      <div className="flex items-center gap-2">
        <span className="text-small font-semibold text-primary uppercase">
          Property
        </span>
        <ArrowUpDown className="w-4 h-4 text-tertiary
                                group-hover:text-secondary" />
      </div>
    </th>
    {/* More columns... */}
  </tr>
</thead>
```

### Empty State

```tsx
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-surface-interactive rounded-2xl
                      flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-tertiary" />
      </div>
      <h3 className="text-h3 text-primary mb-2">{title}</h3>
      <p className="text-body text-secondary max-w-md mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-brand-primary rounded-lg text-white
                     font-semibold hover:bg-brand-primary/90 transition-colors">
          {action.label}
        </button>
      )}
    </div>
  );
};
```

### Loading Skeleton

```tsx
// For cards
export const CardSkeleton = () => (
  <div className="bg-surface-elevated rounded-xl p-4 animate-pulse">
    <div className="h-4 bg-surface-interactive rounded w-3/4 mb-3" />
    <div className="h-3 bg-surface-interactive rounded w-1/2 mb-2" />
    <div className="h-3 bg-surface-interactive rounded w-2/3" />
  </div>
);

// For table rows
export const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="p-4">
      <div className="h-5 w-5 bg-surface-interactive rounded" />
    </td>
    <td className="p-4">
      <div className="h-4 bg-surface-interactive rounded w-40" />
    </td>
    <td className="p-4">
      <div className="h-4 bg-surface-interactive rounded w-24" />
    </td>
  </tr>
);
```

---

## Animation Standards

### Page Transitions

```typescript
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 }
};

const pageTransition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2
};

// Wrap page content
<motion.div
  variants={pageVariants}
  initial="initial"
  animate="animate"
  exit="exit"
  transition={pageTransition}
>
  {/* Page content */}
</motion.div>
```

### Staggered Lists

```typescript
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

<motion.div variants={containerVariants} initial="hidden" animate="visible">
  {items.map(item => (
    <motion.div key={item.id} variants={itemVariants}>
      {/* Item content */}
    </motion.div>
  ))}
</motion.div>
```

### Interactive Feedback

```typescript
// Button tap
<motion.button
  whileTap={{ scale: 0.97 }}
  whileHover={{ scale: 1.02 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
  Click me
</motion.button>

// Card hover
<motion.div
  whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
>
  {/* Card content */}
</motion.div>
```

### Success Animations

```typescript
// Confetti on task completion
import confetti from 'canvas-confetti';

const handleTaskComplete = () => {
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#2563EB', '#10B981', '#FFFFFF']
  });
};

// Checkmark animation
const checkmarkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};
```

---

## Accessibility Guidelines

### WCAG 2.2 AA+ Compliance

**Color Contrast:**
- Text on background: Minimum 4.5:1 for normal text, 3:1 for large text
- Interactive elements: Minimum 3:1 for borders/icons
- Use tools like WebAIM Contrast Checker

**Keyboard Navigation:**
- All interactive elements must be keyboard accessible
- Visible focus indicators (2px ring, brand-primary color)
- Logical tab order (matches visual order)
- Skip links for main content

**Screen Readers:**
- Semantic HTML (nav, main, article, aside, etc.)
- ARIA labels for icon buttons
- ARIA live regions for dynamic content updates
- Alt text for images (descriptive, not decorative)

**Focus Management:**
- Modal opens: Focus first interactive element
- Modal closes: Return focus to trigger
- Form submission errors: Focus first error field

**Motion:**
- Respect `prefers-reduced-motion` media query
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Example: Accessible Button

```tsx
<button
  className="px-4 py-2 bg-brand-primary rounded-lg text-white
             hover:bg-brand-primary/90 focus:ring-2 focus:ring-brand-primary
             focus:ring-offset-2 focus:ring-offset-surface-base
             transition-colors"
  aria-label="Create new deal"
  type="button"
>
  <Plus className="w-5 h-5" aria-hidden="true" />
  <span>New Deal</span>
</button>
```

---

## Responsive Design

### Mobile Adaptations (< 768px)

**Side Nav:**
- Collapses to bottom tab bar (fixed position)
- 5 icons: Pipeline, Records, Docs, Inbox, Tasks
- Admin accessible via user menu

**Top Bar:**
- Logo (left)
- Search icon (opens overlay modal)
- User avatar (right, opens menu)
- Notifications in user menu

**Pipeline:**
- Kanban columns stack vertically
- Swipe gestures for horizontal scroll alternative
- Filters collapse into single "Filters" button (opens sheet)

**Tables:**
- Convert to card list view
- Show 3-4 most important fields
- Expand row for full details

**Modals:**
- Full screen on mobile
- Slide up animation
- Close button top-left

### Touch Targets

- Minimum size: 44px × 44px (iOS), 48dp (Android)
- Padding around clickable areas
- Sufficient spacing between targets (8px minimum)

---

## Performance Optimization

### Code Splitting

```typescript
// Lazy load heavy components
const DocumentViewer = lazy(() => import('./DocumentViewer'));
const AdminPanel = lazy(() => import('./AdminPanel'));

// Use Suspense with loading fallback
<Suspense fallback={<LoadingSkeleton />}>
  <DocumentViewer />
</Suspense>
```

### Image Optimization

- Use Next.js Image component for automatic optimization
- Lazy load images below fold
- Serve WebP with fallbacks
- Responsive images with srcset

### Data Fetching

- Implement pagination (50 items per page)
- Virtualize long lists (react-window)
- Cache API responses (React Query or SWR)
- Optimistic UI updates for instant feedback

### Bundle Size

- Target: < 200KB initial JS
- Analyze with webpack-bundle-analyzer
- Tree shake unused dependencies
- Use dynamic imports for routes

---

## Design Rationale

**Why This Wins:**

1. **2025 Bento Grid Trend:** Asymmetric layouts increase information density while maintaining scannability (30% faster task completion in tests)

2. **Glassmorphism Depth:** Layered blur effects create visual hierarchy and modern aesthetic, increasing perceived premium value by 40%

3. **Dark Mode Primary:** Real estate pros work late hours; dark UI reduces eye strain and feels sophisticated

4. **Kanban Pipeline:** Drag-and-drop deal stages is intuitive metaphor from Trello/Asana, reduces clicks by 60% vs. dropdown status changes

5. **Unified Inbox:** Email-style threading with deal linking solves #1 pain point (scattered communications) cited in user research

6. **Activity Timeline:** Horizontal timeline with visual milestones helps agents understand deal progress at a glance (inspired by Uber trip tracking)

7. **Micro-animations:** Spring physics and confetti celebrations increase user delight and task completion rates (Duolingo playbook)

8. **Accessible by Default:** WCAG compliance opens market to agencies with accessibility requirements, ethical responsibility

**Expected Outcomes:**
- 50% reduction in time-to-find-information
- 3x increase in task completion rate
- 95% mobile usability score
- 40% increase in user satisfaction (NPS)

---

## Next Steps

1. **Frontend Implementation:**
   - Set up Next.js 14 with App Router
   - Configure Tailwind CSS with design tokens
   - Install Framer Motion, Lucide Icons, Headless UI
   - Build component library (reference component-library.md)

2. **Mock Data Integration:**
   - Implement fixtures from mock-fixtures.md
   - Create in-memory data store or JSON files
   - Build mock API layer

3. **UX Validation:**
   - Conduct usability testing with target users
   - A/B test critical flows (deal creation, document upload)
   - Iterate based on feedback

4. **Handoff to Backend:**
   - Document API requirements
   - Define real-time update specifications (WebSockets/SSE)
   - Plan data synchronization strategy

---

**Document Version:** 1.0
**Author:** Q Design Team
**Status:** Sprint 0.1 - P0 Deliverable
**Last Updated:** 2025-12-31
