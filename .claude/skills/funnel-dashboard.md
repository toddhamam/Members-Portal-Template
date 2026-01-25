# Funnel Metrics Dashboard Skill

This skill documents how to implement a real-time funnel metrics dashboard for tracking page views, purchases, and conversions across funnel steps.

---

## Overview

The funnel dashboard provides:
- Real-time visitor counter (polling every 10 seconds)
- Funnel breakdown by step (sessions, purchases, conversion %, revenue)
- Date range filtering (7/30/90 days, all time)
- Manual ad spend input with ROAS/CAC calculations
- A/B test comparison with winner detection
- Summary metrics (unique customers, AOV per customer)

---

## Architecture

### Components

| Component | Purpose |
|-----------|---------|
| `src/app/dashboard/page.tsx` | Main dashboard UI |
| `src/app/dashboard/layout.tsx` | AuthProvider wrapper |
| `src/app/api/dashboard/metrics/route.ts` | Aggregated metrics API |
| `src/app/api/dashboard/active-sessions/route.ts` | Real-time visitor count |
| `src/app/api/track/route.ts` | Event ingestion endpoint |
| `src/hooks/useFunnelTracking.ts` | Client-side tracking hook |
| `src/lib/supabase/types.ts` | TypeScript types for events/metrics |

### Database

The `funnel_events` table stores all tracking data:

```sql
CREATE TABLE funnel_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity (cookie-based)
  visitor_id text NOT NULL,           -- 1-year cookie
  funnel_session_id text NOT NULL,    -- 30-min cookie
  session_id text,                    -- Stripe session ID

  -- Event data
  event_type text NOT NULL,           -- page_view, purchase, upsell_accept, etc.
  funnel_step text NOT NULL,          -- landing, checkout, upsell-1, etc.

  -- A/B testing
  variant text,                       -- 'control', 'variant-b', etc.

  -- Revenue
  revenue_cents integer DEFAULT 0,
  product_slug text,

  -- Context
  ip_hash text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);
```

**Indexes for dashboard queries:**
```sql
CREATE INDEX idx_funnel_events_created_at ON funnel_events(created_at);
CREATE INDEX idx_funnel_events_step ON funnel_events(funnel_step);
CREATE INDEX idx_funnel_events_type ON funnel_events(event_type);
CREATE INDEX idx_funnel_events_dashboard ON funnel_events(created_at, funnel_step, event_type);
```

---

## Implementation Steps

### Step 1: Create Database Migration

Create `supabase/migrations/XXX_funnel_dashboard.sql`:

```sql
-- See full migration in supabase/migrations/007_funnel_dashboard.sql
-- Includes table creation, indexes, and RLS policies
```

### Step 2: Add Types

Add to `src/lib/supabase/types.ts`:

```typescript
export type FunnelEventType =
  | 'page_view'
  | 'purchase'
  | 'upsell_accept'
  | 'upsell_decline'
  | 'downsell_accept'
  | 'downsell_decline';

export type FunnelStep =
  | 'landing'
  | 'checkout'
  | 'upsell-1'
  | 'downsell-1'
  | 'upsell-2'
  | 'thank-you';

export interface FunnelEvent {
  id: string;
  visitor_id: string;
  funnel_session_id: string;
  session_id: string | null;
  event_type: FunnelEventType;
  funnel_step: FunnelStep;
  variant: string | null;
  revenue_cents: number;
  product_slug: string | null;
  ip_hash: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface FunnelStepMetrics {
  step: FunnelStep;
  sessions: number;
  purchases: number;
  conversionRate: number;
  revenue: number;
}

export interface FunnelSummary {
  sessions: number;
  purchases: number;
  conversionRate: number;
  totalRevenue: number;
  uniqueCustomers: number;
  aovPerCustomer: number;
}

export interface ABTestMetrics {
  step: FunnelStep;
  variant: string;
  sessions: number;
  purchases: number;
  conversionRate: number;
  revenue: number;
}

export interface DashboardMetrics {
  summary: FunnelSummary;
  stepMetrics: FunnelStepMetrics[];
  abTests: ABTestMetrics[];
}
```

### Step 3: Create Tracking Hook

Create `src/hooks/useFunnelTracking.ts`:

```typescript
'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { FunnelEventType, FunnelStep } from '@/lib/supabase/types';

function isFunnelSubdomain(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname.startsWith('offer.') ||
         (hostname === 'localhost' && process.env.NEXT_PUBLIC_TRACK_LOCALHOST === 'true');
}

export function useFunnelTracking(funnelStep: FunnelStep) {
  const hasTrackedPageView = useRef(false);

  const track = useCallback(
    async (eventType: FunnelEventType, options: { revenueCents?: number; productSlug?: string; sessionId?: string } = {}) => {
      if (!isFunnelSubdomain()) return null;

      try {
        const response = await fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventType, funnelStep, ...options }),
        });
        return response.ok ? await response.json() : null;
      } catch {
        return null;
      }
    },
    [funnelStep]
  );

  // Auto-track page view on mount
  useEffect(() => {
    if (!hasTrackedPageView.current) {
      hasTrackedPageView.current = true;
      track('page_view');
    }
  }, [track]);

  return { track };
}

// Standalone functions for non-hook usage
export async function trackPurchase(funnelStep: FunnelStep, revenueCents: number, productSlug: string, sessionId?: string) { ... }
export async function trackUpsellAccept(funnelStep: FunnelStep, revenueCents: number, productSlug: string, sessionId?: string) { ... }
export async function trackUpsellDecline(funnelStep: FunnelStep) { ... }
export async function trackDownsellAccept(funnelStep: FunnelStep, revenueCents: number, productSlug: string, sessionId?: string) { ... }
export async function trackDownsellDecline(funnelStep: FunnelStep) { ... }
```

### Step 4: Create Track API

Create `src/app/api/track/route.ts`:

Key features:
- Generates/maintains visitor ID via 1-year httpOnly cookie
- Generates/maintains funnel session ID via 30-min httpOnly cookie
- Hashes IP for privacy
- Supports A/B variant assignment via configuration
- Inserts events to `funnel_events` table

```typescript
// Cookie management
const VISITOR_COOKIE = 'funnel_visitor_id';     // 1 year
const SESSION_COOKIE = 'funnel_session_id';     // 30 minutes

// A/B test configuration (per step)
const ACTIVE_AB_TESTS: Record<FunnelStep, { variants: string[]; weights: number[] } | null> = {
  'landing': null,
  'checkout': null,
  'upsell-1': null,  // Enable: { variants: ['control', 'variant-b'], weights: [50, 50] }
  ...
};
```

### Step 5: Create Metrics API

Create `src/app/api/dashboard/metrics/route.ts`:

- Accepts `startDate` and `endDate` query params
- Queries `funnel_events` table
- Aggregates by step (sessions from page_view, purchases from purchase/accept events)
- Calculates conversion rates and revenue
- Groups A/B test data by variant

### Step 6: Create Active Sessions API

Create `src/app/api/dashboard/active-sessions/route.ts`:

```typescript
// Count unique session IDs from events in last 5 minutes
const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

const { data } = await supabase
  .from('funnel_events')
  .select('funnel_session_id')
  .gte('created_at', fiveMinutesAgo);

const uniqueSessions = new Set(data?.map(e => e.funnel_session_id) || []);
return { count: uniqueSessions.size };
```

### Step 7: Create Dashboard Page

Create `src/app/dashboard/page.tsx` and `layout.tsx`:

**Layout:** Wrap with `AuthProvider` for authentication

**Page features:**
- Live visitor indicator (pulsing dot, polls every 10 seconds)
- Date range selector (7/30/90/all time)
- Top metrics cards: Revenue, Ad Spend (editable, localStorage), ROAS, CAC
- Funnel breakdown table with step-by-step metrics
- A/B test comparison (click row to expand)
- Winner detection with lift % and confidence indicator

---

## Adding Tracking to Funnel Pages

### Page View (Automatic)

```tsx
import { useFunnelTracking } from '@/hooks/useFunnelTracking';

function CheckoutPage() {
  useFunnelTracking('checkout'); // Automatically tracks page_view on mount
}
```

### Purchase Events

```tsx
const { track } = useFunnelTracking('checkout');

// After successful payment
await track('purchase', {
  revenueCents: 2400,  // $24.00
  productSlug: 'resistance-mapping-guide',
  sessionId: stripeSessionId,
});
```

### Upsell Events

```tsx
const { track } = useFunnelTracking('upsell-1');

const handleAccept = async () => {
  await track('upsell_accept', {
    revenueCents: 9700,
    productSlug: 'pathless-path',
    sessionId,
  });
  // Navigate to next page
};

const handleDecline = async () => {
  await track('upsell_decline');
  // Navigate to downsell
};
```

---

## Local Testing

Set environment variable to enable tracking on localhost:

```env
NEXT_PUBLIC_TRACK_LOCALHOST=true
```

Without this, tracking only occurs on `offer.*` subdomains.

---

## A/B Testing

### Enable a Test

In `src/app/api/track/route.ts`, configure the test:

```typescript
const ACTIVE_AB_TESTS = {
  'upsell-1': {
    variants: ['control', 'variant-b'],
    weights: [50, 50],  // 50/50 split
  },
  // Other steps remain null
};
```

### View Results

1. Navigate to `/dashboard`
2. Click on a row with the "A/B" badge
3. View conversion rates and revenue per variant
4. Winner indicator shows lift % when data is sufficient (100+ sessions per variant)

---

## Extending the Dashboard

### Add New Funnel Steps

1. Add to `FunnelStep` type in `src/lib/supabase/types.ts`
2. Add to `FUNNEL_STEPS` array in metrics API
3. Add to `STEP_NAMES` display mapping in dashboard page
4. Add constraint in database migration

### Add New Event Types

1. Add to `FunnelEventType` type
2. Update database constraint
3. Update metrics API aggregation logic if needed

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/app/dashboard/page.tsx` | Dashboard UI with charts and tables |
| `src/app/dashboard/layout.tsx` | Auth wrapper |
| `src/app/api/dashboard/metrics/route.ts` | Aggregated metrics endpoint |
| `src/app/api/dashboard/active-sessions/route.ts` | Real-time visitor count |
| `src/app/api/track/route.ts` | Event ingestion with cookie management |
| `src/hooks/useFunnelTracking.ts` | Client-side tracking hook |
| `src/lib/supabase/types.ts` | TypeScript types |
| `supabase/migrations/007_funnel_dashboard.sql` | Database schema |

---

## Dashboard UI Design Patterns

The dashboard has its own distinct visual identity, separate from the funnel pages (which use dark themes). The dashboard uses a clean, light aesthetic optimized for data readability.

### Design Principles

- **Isolated styling**: Dashboard UI is distinct from funnel/marketing pages, with its own theme
- **Light theme dominance**: Bright, airy UI with white/light gray backgrounds for optimal data readability
- **Data-first**: All UI decisions prioritize data accuracy and readability over decoration
- **Pastel accents**: Use soft pastel colors (lime green, violet) for visual interest without overwhelming the light theme
- **Subtle gradients**: Add depth to cards and tables with gentle gradients rather than flat solid colors
- **Clear visual hierarchy**: Hero elements (like total revenue) should be prominently styled
- **Interactive affordances**: Clickable elements (like table rows) should have clear hover states

### Color Scheme

```tsx
// Dashboard-specific colors (light theme with pastel accents)
<div className="bg-[#f8fafc]" />              // Page background (light gray)
<div className="bg-white" />                   // Card backgrounds
<div className="bg-[#1a1f2e]" />               // Dark accents (live counter backdrop)

// Pastel accent colors
<span className="text-lime-500" />             // Success/positive metrics
<span className="text-violet-500" />           // Secondary accent
<span className="text-red-500" />              // Negative metrics

// Gradient backgrounds for depth
<div className="bg-gradient-to-br from-white to-gray-50" />  // Subtle card gradient
<div className="bg-gradient-to-r from-lime-50 to-violet-50" /> // Accent gradient
```

### Gradient Patterns

Use subtle gradients to add visual depth without overwhelming the clean aesthetic:

```tsx
// Hero revenue card with gradient
<div className="bg-gradient-to-br from-lime-50 via-white to-violet-50 rounded-2xl shadow-lg p-8">
  <span className="text-4xl font-bold text-gray-900">{formatCurrency(revenue)}</span>
</div>

// Table rows with hover gradient
<tr className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-colors cursor-pointer">

// Metric card with directional gradient
<div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm p-6">
```

### Layout Patterns

```tsx
// Centered content container
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

// Responsive grid for metric cards
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

// Card styling with subtle elevation
<div className="bg-white rounded-lg shadow-sm border p-6">
```

### Component Patterns

**Pill-shaped header (contained, not full-width):**
```tsx
<header className="bg-white/80 backdrop-blur-sm rounded-full shadow-sm px-6 py-3 inline-flex items-center gap-4">
  <span className="font-semibold">Dashboard</span>
</header>
```

**Live visitor indicator with "pop out" effect:**
```tsx
<div className="bg-[#1a1f2e] rounded-2xl shadow-lg px-6 py-4 inline-flex items-center gap-3">
  {/* Pulsing dot */}
  <span className="relative flex h-3 w-3">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
  </span>
  <span className="text-white font-medium">{count} live visitors</span>
</div>
```

**Date range selector (floating pill buttons):**
```tsx
<div className="inline-flex bg-white rounded-full shadow-sm p-1">
  {DATE_RANGES.map((range) => (
    <button
      key={range.value}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        selected === range.value
          ? 'bg-emerald-500 text-white'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {range.label}
    </button>
  ))}
</div>
```

**Interactive focus states:**
```tsx
<input
  className="focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
/>
```

### State Management

```tsx
// Standard dashboard state pattern
const [selectedRange, setSelectedRange] = useState('7d');
const [selectedStep, setSelectedStep] = useState<string | null>(null);
const [adSpend, setAdSpend] = useState('');
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

### Data Fetching Pattern

```tsx
useEffect(() => {
  async function fetchMetrics() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/dashboard/metrics?range=${selectedRange}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }
  fetchMetrics();
}, [selectedRange]);
```

### Formatting Helpers

```tsx
// Currency formatting
const formatCurrency = (cents: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
};

// Percentage formatting
const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};
```

### Conditional Styling Based on Data

Apply dynamic styles based on metric values to provide visual feedback:

```tsx
// ROAS indicator (green when profitable)
<span className={roas >= 2 ? 'text-lime-600' : roas >= 1 ? 'text-yellow-600' : 'text-red-500'}>
  {roas.toFixed(2)}x
</span>

// Active visitors indicator (pulse when active)
<div className={`flex items-center gap-2 ${activeSessions > 0 ? 'animate-pulse' : ''}`}>
  <span className={activeSessions > 0 ? 'text-lime-500' : 'text-gray-400'}>
    {activeSessions} live
  </span>
</div>

// Conversion rate styling (highlight high performers)
<span className={conversionRate >= 10 ? 'text-lime-600 font-semibold' : 'text-gray-600'}>
  {formatPercent(conversionRate)}
</span>

// A/B test winner badge
{isWinner && (
  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-lime-100 text-lime-800">
    Winner +{lift.toFixed(1)}%
  </span>
)}
```

### localStorage Persistence (SSR-safe)

```tsx
// Initial value from localStorage
const [adSpend, setAdSpend] = useState(() => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('dashboardAdSpend') || '';
  }
  return '';
});

// Persist changes
useEffect(() => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('dashboardAdSpend', adSpend);
  }
}, [adSpend]);
```

### Loading States

```tsx
{isLoading ? (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-gray-200 rounded w-1/4" />
    <div className="h-32 bg-gray-200 rounded" />
  </div>
) : error ? (
  <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>
) : (
  /* Render actual data */
)}
```

### Interactive Table Rows

Make funnel step rows clickable to reveal A/B test details:

```tsx
// Expandable row pattern
<tr
  onClick={() => setSelectedStep(selectedStep === step ? null : step)}
  className="cursor-pointer hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-colors"
>
  <td className="py-4 px-6 flex items-center gap-2">
    {STEP_NAMES[step]}
    {hasABTest && (
      <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
        A/B
      </span>
    )}
    <ChevronIcon className={`transform transition-transform ${selectedStep === step ? 'rotate-180' : ''}`} />
  </td>
</tr>

{/* Expanded A/B test details */}
{selectedStep === step && (
  <tr className="bg-violet-50/50">
    <td colSpan={5} className="px-6 py-4">
      <ABTestComparison step={step} variants={abTestData} />
    </td>
  </tr>
)}
```

### Common Mistakes to Avoid

- **Image path casing**: Ensure paths match exactly (Linux is case-sensitive)
- **Unused imports**: Remove imports like `Image` if the component no longer uses them
- **Missing SSR guards**: Always check `typeof window !== 'undefined'` before accessing browser APIs like localStorage, window.location
- **localStorage during SSR**: Initialize state with a function that checks for window, not a direct localStorage call
- **Inconsistent theme**: Dashboard uses light theme with pastel accents - don't mix in dark theme elements from funnel pages
