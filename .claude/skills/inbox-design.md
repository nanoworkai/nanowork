# Inbox Design Guidelines

## Vision
The Inbox should feel like a **native email client** with a clean, natural design. Think Apple Mail or Gmail — familiar, intuitive, and efficient for reading and managing messages.

## Core Principles

### 1. Email Client First
- Two-pane layout: message list + message detail
- Clear visual hierarchy between read/unread messages
- Quick scanning: sender, subject, preview, timestamp
- Keyboard shortcuts for power users (future)

### 2. Natural & Readable
- Generous whitespace and padding
- Comfortable reading width for email content
- Clear separation between UI chrome and content
- Typography optimized for extended reading

### 3. Fast & Responsive
- Instant message selection feedback
- Smooth transitions between messages
- Loading states that don't block interaction
- Search/filter with debounced input

---

## Layout Structure

### Grid System
```
┌─────────────────────────────────────────┐
│  Header (Title + Agent Email)           │
├─────────────────────────────────────────┤
│  Toolbar (Search + Filters + Refresh)   │
├──────────────┬──────────────────────────┤
│              │                          │
│  Message     │   Message Detail         │
│  List        │   (Selected Email)       │
│  (2/5)       │   (3/5)                  │
│              │                          │
│  Scrollable  │   Scrollable             │
│              │                          │
└──────────────┴──────────────────────────┘
```

**Responsive:**
- Desktop: `grid-cols-5` (2 cols list, 3 cols detail)
- Tablet: Stack vertically when message selected
- Mobile: Show list OR detail (not both)

---

## Components

### Header
```tsx
<div className="mb-6">
  <h1 className="text-2xl font-bold text-white mb-1">Inbox</h1>
  <p className="text-sm text-white/60">
    Messages sent to and from your AI agent at{" "}
    <span className="font-mono text-white/80">{agentEmail}</span>
  </p>
</div>
```

**Guidelines:**
- Show agent email address prominently (user needs to share this)
- Use monospace font for email address
- Lighter color for description text

---

### Toolbar

**Search:**
- Full-width on mobile, flex-1 on desktop
- Search icon inside input (left side)
- Debounced search (300ms)
- Placeholder: "Search emails..."

**Filters:**
- Chip/pill style buttons
- Options: All, Received, Sent
- Active state: white background, black text
- Inactive: `bg-surface-2`, `text-white/60`

**Refresh:**
- Icon-only button on the right
- Spinning animation while loading
- Tooltip: "Refresh"

---

### Message List

**Container:**
```tsx
<div className="card rounded-2xl overflow-hidden">
  <div className="divide-y divide-white/5 max-h-[calc(100vh-300px)] overflow-y-auto">
    {/* Message items */}
  </div>
</div>
```

**Message Item:**
```tsx
<button className="w-full text-left p-4 hover:bg-white/3 transition-colors">
  {/* Sender/Recipient + Timestamp */}
  <div className="flex items-start justify-between mb-2">
    <div className="flex items-center gap-2">
      <Icon /> {/* InboxIcon or Send */}
      <p className="text-sm font-semibold text-zinc-200">{name}</p>
    </div>
    <span className="text-xs text-zinc-600">{time}</span>
  </div>
  
  {/* Subject */}
  <p className="text-sm text-zinc-300 font-medium mb-1 truncate">
    {subject}
  </p>
  
  {/* Preview */}
  <p className="text-xs text-zinc-500 line-clamp-2 mb-2">
    {preview}
  </p>
  
  {/* Status Badge */}
  {badge}
</button>
```

**States:**
- Hover: `bg-white/3`
- Selected: `bg-white/5`
- Unread: Bold sender name (future)

---

### Message Detail

**Container:**
```tsx
<div className="card rounded-2xl p-6">
  {/* Email content */}
</div>
```

**Header:**
- Subject (h2, text-lg, font-bold)
- From/To addresses with icons
- Timestamp
- Status badge (if applicable)

**Body:**
- White background panel for email content
- `p-6` padding around content
- `prose` class for formatted HTML emails
- Fallback to plain text with preserved whitespace

**Empty State:**
```tsx
<div className="flex flex-col items-center justify-center h-full text-center">
  <Mail className="w-16 h-16 text-zinc-600 mb-4" />
  <p className="text-zinc-500">Select an email to read</p>
</div>
```

---

## Status Badges

Visual indicators for email processing state:

```tsx
// Replied (AI processed)
<span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
  ✓ Replied
</span>

// Processing
<span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
  ⋯ Processing
</span>

// Failed
<span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
  ✗ Failed
</span>

// Sent (outbound)
<span className="px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-zinc-400 border border-white/10">
  Sent
</span>
```

---

## Color Palette

### Backgrounds
- Main container: `card` class (surface-2)
- Message list items: `bg-transparent` → `hover:bg-white/3` → `selected:bg-white/5`
- Email body panel: `bg-surface-1` or white for HTML content

### Text
- Primary (sender, subject): `text-zinc-200` or `text-zinc-300`
- Secondary (preview): `text-zinc-500`
- Tertiary (timestamp): `text-zinc-600`
- Labels: `text-white/60` to `text-white/80`

### Borders
- Dividers: `divide-white/5` or `border-white/5`
- Focus states: `border-white/20`

---

## Typography

### Fonts
- **UI Elements:** System sans-serif stack (SF Pro on Mac)
- **Email Addresses:** Monospace (SF Mono, Monaco, Consolas)
- **Email Body:** Inherit or serif for better readability

### Sizes
- Page title (Inbox): `text-2xl font-bold`
- Message subject: `text-sm font-medium`
- Message preview: `text-xs`
- Sender name: `text-sm font-semibold`
- Timestamp: `text-xs`
- Badge text: `text-xs font-medium`

---

## Interactions

### Message Selection
1. Click message in list
2. Highlight selected message: `bg-white/5`
3. Load detail in right pane
4. Smooth transition (no jarring jumps)

### Search
1. User types in search box
2. Debounce 300ms
3. Filter messages client-side (fast)
4. Show count: "X messages" or "No results"

### Filters
1. Click filter chip (All, Received, Sent)
2. Update active state immediately
3. Fetch filtered messages from backend
4. Clear selection if current message not in filter

### Refresh
1. Click refresh button
2. Show spinning icon
3. Fetch latest messages
4. Update list without losing selection (if possible)

---

## Empty States

### No Messages
```
[Mail Icon]
No messages yet
Messages will appear here when contacts email your agent
```

### No Search Results
```
[Search Icon]
No messages found
Try a different search term
```

### Loading
```
[Spinner]
Loading messages...
```

---

## Future Enhancements

### Phase 2
- [ ] Mark as read/unread
- [ ] Archive messages
- [ ] Delete messages
- [ ] Star/flag important messages
- [ ] Multi-select for bulk actions

### Phase 3
- [ ] Compose new email (outbound from agent)
- [ ] Reply to messages inline
- [ ] Forward messages
- [ ] Add labels/tags
- [ ] Smart filters (unread, flagged, etc.)

### Phase 4
- [ ] Keyboard shortcuts (j/k navigation, r for reply)
- [ ] Email threading (group conversations)
- [ ] Rich text composer
- [ ] File attachments
- [ ] Email templates for AI responses

---

## Technical Notes

### Data Source
- Fetch from `email_messages` table via Supabase
- Filter by `user_id` to show only this user's messages
- Order by `received_at DESC` (newest first)
- Limit to 50 messages initially (pagination later)

### Real-time Updates
- Consider Supabase real-time subscriptions for live updates
- Show notification badge when new message arrives
- Auto-refresh list every 30s (or manual refresh only)

### Performance
- Virtual scrolling for message list if >100 messages
- Lazy load message body (only when selected)
- Cache recently viewed messages
- Debounce search input

---

## Reference Examples

**Good Email Clients to Study:**
- Apple Mail (macOS/iOS) — Clean, minimal, fast
- Gmail — Powerful search, smart filters, labels
- Hey.com — Opinionated workflows, great UX
- Superhuman — Keyboard-first, lightning fast

**Keep it Simple:**
Don't over-engineer. Users expect email clients to be **fast, familiar, and reliable**. Start with the basics and iterate based on real usage patterns.
