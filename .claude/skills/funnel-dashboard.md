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
