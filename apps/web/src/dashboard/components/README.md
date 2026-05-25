# Dashboard Welcome Components

Professional onboarding experience for new Nanowork users.

## Quick Start

### WelcomeBanner

Shows once per user, dismissible, provides orientation.

```tsx
import WelcomeBanner from "./components/WelcomeBanner";

<WelcomeBanner userName="John" />
```

### QuickStart

Progress-based guide through first steps.

```tsx
import QuickStart from "./components/QuickStart";

<QuickStart hasBuilds={false} profileComplete={false} />
```

### EmptyState

Reusable component for empty views.

```tsx
import EmptyState from "./components/EmptyState";
import { Inbox, Mail } from "lucide-react";

<EmptyState
  icon={Inbox}
  title="No items yet"
  description="Items will appear here"
  actionLabel="Create Item"
  onAction={() => {}}
/>
```

## Component Structure

```
dashboard/
├── components/
│   ├── WelcomeBanner.tsx      - First-time greeting
│   ├── QuickStart.tsx         - Onboarding steps
│   ├── EmptyState.tsx         - Reusable empty views
│   ├── README.md              - This file
│   └── WELCOME_SYSTEM.md      - Full documentation
├── Create.tsx                 - Uses WelcomeBanner + QuickStart
└── History.tsx                - Uses enhanced empty state
```

## Features

- **Dismissible**: All components can be permanently dismissed
- **Persistent**: Uses localStorage to remember user preferences
- **Responsive**: Works on all screen sizes
- **Accessible**: WCAG 2.1 AA compliant
- **Professional**: Trust-building design language

## localStorage Keys

- `nanowork_welcome_dismissed` - WelcomeBanner state
- `nanowork_quickstart_dismissed` - QuickStart state

## Full Documentation

See [WELCOME_SYSTEM.md](./WELCOME_SYSTEM.md) for complete details.
