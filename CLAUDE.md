# Houston Funnel - Claude Context

## Overview
This is a sales funnel for digital products (courses/guides) with Stripe checkout, one-click upsells, and a member portal for content delivery.

**Live URLs:**
- Marketing site: `innerwealthinitiate.com`
- Sales funnel: `offer.innerwealthinitiate.com`

**Project Structure:** All functionality (marketing, funnel, portal) is consolidated in a single Next.js/Vercel project for easier management and deployment. Multiple domains can be configured in Vercel pointing to the same project.

---

## Multi-Domain Architecture

This project serves different experiences based on the subdomain:

| Domain | Experience |
|--------|------------|
| `innerwealthinitiate.com` | Marketing site with full navigation |
| `offer.innerwealthinitiate.com` | Sales funnel (distraction-free, no navigation) |

### Middleware Routing
The `middleware.ts` file handles subdomain-based routing using `hostname.startsWith()`:
- **Funnel subdomain (`offer.*`)** - Prioritized first, handles funnel-specific routing
- **Portal subdomain** - Handled second for member portal access
- **Main domain** - Falls through for marketing site

### Conditional Rendering by Subdomain
Pages that serve both marketing and funnel experiences (like the landing page `/`) use client-side hostname detection:

```tsx
"use client";
import { useEffect, useState } from "react";
import { MarketingHeader, MarketingFooter } from "@/components/marketing";

export default function LandingPage() {
  const [isFunnelSubdomain, setIsFunnelSubdomain] = useState(false);

  useEffect(() => {
    setIsFunnelSubdomain(window.location.hostname.startsWith("offer."));
  }, []);

  return (
    <>
      {!isFunnelSubdomain && <MarketingHeader />}
      {/* Page content */}
      {!isFunnelSubdomain && <MarketingFooter />}
    </>
  );
}
```

**Why this pattern:** The same landing page content is served on both domains, but the funnel subdomain hides navigation to create a focused, distraction-free sales experience.

---

## Marketing Site

The root domain hosts a marketing website with product listings and content.

### Routes
| Route | Purpose |
|-------|---------|
| `/` | Marketing landing page |
| `/products` | Product catalog (fetches from Supabase) |
| `/media` | Media/content page |
| `/contact` | Contact page |
| `/privacy` | Privacy Policy (required for Meta compliance) |
| `/terms` | Terms of Service (required for Meta compliance) |
| `/refund` | Refund Policy (required for Meta compliance) |

### Shared Components
Located in `src/components/marketing/`:
- `MarketingHeader` - Site navigation with mobile menu
- `MarketingFooter` - Site footer
- `MarketingProductCard` - Product cards for grid display
- `MediaCard` - Cards for media content

```tsx
import { MarketingHeader, MarketingFooter, MarketingProductCard } from "@/components/marketing";
```

### Client-Side Data Fetching Pattern
For pages that fetch dynamic data from Supabase:

```tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function MyPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data, error } = await supabase.from("table").select("*");
      if (!error) setData(data || []);
      setLoading(false);
    }
    fetchData();
  }, []);
}
```

### Skeleton Loading Pattern
Use `animate-pulse` for loading states while data fetches:

```tsx
{loading ? (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-[#252525] rounded-lg animate-pulse">
        <div className="aspect-[4/3] bg-gray-700" />
        <div className="p-6 space-y-3">
          <div className="h-4 bg-gray-700 rounded w-1/4" />
          <div className="h-6 bg-gray-700 rounded w-3/4" />
        </div>
      </div>
    ))}
  </div>
) : (
  /* Render actual content */
)}
```

### Responsive Design
Use Tailwind's responsive prefixes with mobile-first approach:
- Default styles apply to mobile
- `sm:` for tablets (640px+)
- `lg:` for desktop (1024px+)

Example: `className="text-sm sm:text-base lg:text-lg px-4 sm:px-6"`

### Accessibility
Use proper ARIA attributes for interactive elements:
```tsx
<button
  aria-label="Open menu"
  aria-expanded={isOpen}
  onClick={() => setIsOpen(!isOpen)}
>
  <MenuIcon />
</button>
```

---

## Browser Console Debugging

When you need to see what's appearing in the browser console (e.g., to verify tracking events, debug JavaScript errors, or check client-side behavior), **use the Claude Chrome extension to inspect console output directly**. Do not ask the user to manually check the console - use the extension yourself for efficiency.

---

## Funnel Flow

```
/product → /checkout → /upsell-1 → /downsell-1 (if declined) → /upsell-2 → /thank-you
                            ↓
                       /upsell-2 (if accepted)
```

### Pages
| Route | Purpose | Price |
|-------|---------|-------|
| `/product` | Sales page for front-end offer | - |
| `/checkout` | Stripe checkout with order bump | $7 + $27 bump |
| `/upsell-1` | The Pathless Path™ Program | $97 |
| `/downsell-1` | Nervous System Reset Kit™ (shown if upsell-1 declined) | $29 |
| `/upsell-2` | Bridge to Mastery™ | $0 (call booking, $1,495 charged after) |
| `/thank-you` | Order confirmation + account creation | - |

### Products & Slugs
| Product | Slug | Price |
|---------|------|-------|
| Resistance Mapping Guide™ | `resistance-mapping-guide` | $7 |
| Golden Thread Technique | `golden-thread-technique` | $27 (order bump) |
| The Pathless Path™ | `pathless-path` | $97 |
| Nervous System Reset Kit™ | `nervous-system-reset` | $29 |
| Bridge to Mastery™ | `bridge-to-mastery` | $0 funnel / $1,495 after call |

---

## Critical Conventions

### 1. Session ID Persistence (Supports Both PaymentIntent and Checkout Session)
The funnel identifier can be lost during navigation. All funnel pages MUST use the `useSessionId` hook:

```tsx
import { useSessionId } from "@/hooks/useSessionId";

function MyFunnelPage() {
  const sessionId = useSessionId(); // Persists in sessionStorage as backup
  // Use sessionId for API calls and navigation
}
```

**Why:** The hook stores the identifier in sessionStorage. If it's lost from the URL (e.g., `?session_id=null`), it recovers from sessionStorage.

**Important: PaymentIntent vs Checkout Session:**
- The checkout page uses **Stripe Elements with PaymentIntents** (not Checkout Sessions)
- After `stripe.confirmPayment()`, Stripe redirects with `?payment_intent=pi_xxx` parameters
- The `useSessionId` hook handles BOTH identifier types (`session_id` or `payment_intent`)
- APIs like `/api/auth/session-email` and `/api/upsell` must also handle both identifier types

**Files using this:**
- `src/app/upsell-1/page.tsx`
- `src/app/upsell-2/page.tsx`
- `src/app/downsell-1/page.tsx`
- `src/app/thank-you/page.tsx`
- `src/app/claim-account/page.tsx`

### 2. Email Case Sensitivity
All email handling MUST normalize to lowercase and use case-insensitive queries:

```typescript
// Always normalize before storing
const emailLower = email.toLowerCase();

// Always use ilike() for lookups
const { data } = await supabase
  .from('profiles')
  .select('id')
  .ilike('email', emailLower)
  .single();
```

**Why:** Stripe may return emails with different casing than what's stored. This prevents user lookup failures.

### 3. Suspense Boundaries
All funnel pages using `useSearchParams()` need Suspense:

```tsx
export default function MyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <MyPageContent />
    </Suspense>
  );
}
```

### 4. File Path Case Sensitivity (Linux Deployment)
macOS is case-insensitive by default, but Linux (production) is case-sensitive. File path mismatches will work locally but break in production.

**Always:**
- Use consistent casing for directories and files (prefer lowercase)
- Use `git mv` to rename files/directories when changing case (regular rename may not be tracked)
- Test that image paths exactly match the actual file casing

**Example issue:** `/images/Instructor/photo.png` in code but `/images/instructor/photo.png` on disk works on macOS, fails on Linux.

### 5. Static Assets Must Be Git Tracked
All files in `/public` that you want deployed MUST be added to git. Untracked static assets will not be included in the deployment.

**Before committing changes with new images:**
```bash
git status  # Check for untracked files in public/
git add public/images/new-image.png  # Explicitly add new assets
```

### 6. Funnel Pages Must Be Distraction-Free
Funnel pages accessed via the `offer.*` subdomain should have minimal navigation to maximize conversions:

**DO:**
- Show only the logo in the header (no navigation links)
- Include a minimal footer with legal links only
- Keep the user focused on the offer and CTA

**DON'T:**
- Include the full `MarketingHeader` or `MarketingFooter` on funnel pages
- Add navigation links that lead away from the funnel
- Display distracting elements that don't support the sale

### 7. Legal Links Required on Funnel Pages (Meta Compliance)
All funnel pages MUST include legal footer links for Meta (Facebook/Instagram) advertising policy compliance:

```tsx
<footer className="py-8 px-4 bg-black text-center">
  <div className="flex justify-center gap-6 text-sm text-gray-400">
    <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
    <Link href="/terms" className="hover:text-white">Terms of Service</Link>
    <Link href="/refund" className="hover:text-white">Refund Policy</Link>
  </div>
</footer>
```

**Pages that need legal links:**
- `/product`
- `/checkout`
- `/upsell-1`, `/upsell-2`
- `/downsell-1`
- `/thank-you`

**Legal pages location:** `/privacy`, `/terms`, `/refund` (simple static pages)

### 8. Browser Storage Must Handle Private Browsing Mode
All `sessionStorage` and `localStorage` access in client-side code MUST be wrapped in try-catch blocks. Private browsing modes (Safari, Chrome Incognito, etc.) can throw errors when accessing these APIs, which will break checkout flows.

**The Problem:** In private browsing mode, `sessionStorage.setItem()` and `sessionStorage.getItem()` can throw exceptions. If unhandled, this breaks the entire checkout process—even when the storage operation isn't critical to the payment.

**The Solution:** Always wrap storage operations in try-catch:

```tsx
// Safe sessionStorage access pattern
const safeGetItem = (key: string): string | null => {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSetItem = (key: string, value: string): void => {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Silently fail - storage is a backup mechanism
  }
};
```

**Critical files that use storage:**
- `src/hooks/useSessionId.ts` - Session ID backup (uses URL param as fallback)
- `src/lib/ga4.ts` - GA4 checkout data caching
- `src/hooks/useFunnelTracking.ts` - Visitor ID generation
- Checkout pages - GA4 pending data storage

**Key principle:** Analytics and caching failures should NEVER break core checkout functionality. If storage is unavailable, gracefully degrade—use URL parameters as backup for session IDs, skip analytics caching, etc.

**Related:** Stripe `requires_payment_method` errors with no specific error message often indicate client-side JavaScript failures (like unhandled storage exceptions) rather than backend payment issues.

### 9. PaymentIntent Customer Data Must Be Updated Before Payment
When using Stripe Elements with PaymentIntents (not Checkout Sessions), the customer email/name must be explicitly attached to the PaymentIntent **before** confirming payment.

**The Problem:** PaymentIntents are created when the checkout page loads (to get a `clientSecret`), but the user hasn't entered their email yet. If you use placeholder data, Stripe will store that placeholder and the webhook won't have the real customer info.

**The Solution:** Call `/api/update-payment-intent` with the real customer data right before `stripe.confirmPayment()`:

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  // Update PaymentIntent with real customer data BEFORE confirming
  await fetch("/api/update-payment-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      paymentIntentId,
      email: formData.email,      // Real email from form
      fullName: formData.fullName, // Real name from form
      includeOrderBump,
    }),
  });

  // Now confirm payment - customer data is attached
  const { error } = await stripe.confirmPayment({ ... });
};
```

**The update-payment-intent API must:**
1. Create or find a Stripe customer with the real email
2. Attach that customer to the PaymentIntent
3. Store `customerEmail` and `customerName` in PaymentIntent metadata (backup for webhook)

**Why this matters:** Without this, purchases will have no customer email, webhooks can't process them, and no Supabase profile/access will be created.

### 10. Handling Both PaymentIntent and Checkout Session Identifiers
APIs that retrieve customer data or process upsells must handle BOTH identifier types since the funnel may use either:

```typescript
// In API routes, check for both identifier types
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  const paymentIntentId = searchParams.get("payment_intent");

  if (paymentIntentId) {
    // Handle PaymentIntent flow (pi_xxx)
    const customerData = await getCustomerDataFromPaymentIntent(paymentIntentId);
    // ...
  } else if (sessionId) {
    // Handle Checkout Session flow (cs_xxx)
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    // ...
  }
}
```

**Helper function pattern for PaymentIntent customer retrieval:**
```typescript
async function getCustomerDataFromPaymentIntent(paymentIntentId: string) {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  // 1. Check metadata first (most reliable - set during checkout)
  if (paymentIntent.metadata?.customerEmail) {
    return {
      email: paymentIntent.metadata.customerEmail,
      name: paymentIntent.metadata.customerName,
    };
  }

  // 2. Check attached customer
  if (paymentIntent.customer) {
    const customer = await stripe.customers.retrieve(paymentIntent.customer as string);
    if (customer && !customer.deleted) {
      return { email: customer.email, name: customer.name };
    }
  }

  // 3. Check latest charge
  const charges = await stripe.charges.list({ payment_intent: paymentIntentId, limit: 1 });
  if (charges.data[0]?.billing_details?.email) {
    return {
      email: charges.data[0].billing_details.email,
      name: charges.data[0].billing_details.name,
    };
  }

  return null;
}
```

**TypeScript Note:** When retrieving Stripe customers, always check for `DeletedCustomer` type:
```typescript
const customer = await stripe.customers.retrieve(customerId);
if (customer.deleted) {
  // Handle deleted customer case
}
// Now TypeScript knows customer is not deleted
```

### 11. Form Validation UX
All forms (checkout, claim-account, etc.) should follow these UX patterns:

**Clear, Specific Error Messages:**
- Show error messages directly below the input field
- Use specific language: "Please enter your full name" not "Invalid input"
- For email: "Please enter a valid email address"
- For password: "Password must be at least 8 characters"

**Visual Feedback:**
```tsx
<input
  className={cn(
    "w-full px-4 py-3 border rounded-lg",
    errors.email
      ? "border-red-500 focus:ring-red-500"
      : "border-gray-300 focus:ring-[#d4a574]"
  )}
/>
{errors.email && (
  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
)}
```

**Required Field Indicators:**
- Mark required fields with asterisks: `Full Name *`
- Or use "(required)" suffix for accessibility

### 12. Dynamic Pricing - Never Hardcode
Product prices can change. Always query Supabase or Stripe for the authoritative price rather than hardcoding values.

**The Problem:** Hardcoded prices lead to incorrect calculations when prices change in Supabase/Stripe but the code still uses old values.

**The Solution:** Query the `products` table or Stripe API for current pricing:

```typescript
// Good - query the source of truth
const { data: product } = await supabase
  .from('products')
  .select('price_cents, portal_price_cents')
  .eq('slug', productSlug)
  .single();

const priceAmount = product?.price_cents || 0;

// Bad - hardcoded price that can become stale
const priceAmount = 9700; // Don't do this!
```

**When `const` is acceptable:** For prices within a specific API route's logic where the price is explicitly defined for that funnel step and won't change (e.g., a promotional price for a specific upsell). Even then, prefer querying when possible.

### 13. Performance Patterns

**Parallel Data Fetching:**
Use `Promise.all` to fetch related data concurrently instead of sequentially:

```typescript
// Good - parallel fetching
const [product, purchases, modules, progress] = await Promise.all([
  supabase.from('products').select('*').eq('slug', slug).single(),
  supabase.from('user_purchases').select('*').eq('user_id', userId),
  supabase.from('modules').select('*').eq('product_id', productId),
  supabase.from('lesson_progress').select('*').eq('user_id', userId),
]);

// Bad - sequential fetching (slower)
const product = await supabase.from('products').select('*').eq('slug', slug).single();
const purchases = await supabase.from('user_purchases').select('*').eq('user_id', userId);
// ... each waits for the previous to complete
```

**Debouncing Frequent Updates:**
For UI updates that happen frequently (e.g., video progress), use debouncing to avoid performance issues:

```typescript
const progressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

const handleProgress = (currentTime: number) => {
  // Clear any pending update
  if (progressTimeoutRef.current) {
    clearTimeout(progressTimeoutRef.current);
  }

  // Debounce: only save after 1 second of no updates
  progressTimeoutRef.current = setTimeout(async () => {
    await saveProgress(currentTime);
  }, 1000);
};

// Clean up on unmount
useEffect(() => {
  return () => {
    if (progressTimeoutRef.current) {
      clearTimeout(progressTimeoutRef.current);
    }
  };
}, []);
```

---

## API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/checkout` | Creates Stripe checkout session |
| `POST /api/upsell` | Processes one-click upsell payments |
| `POST /api/webhook` | Handles Stripe webhooks (`checkout.session.completed`, `payment_intent.succeeded`) |
| `GET /api/auth/session-email` | Gets customer email/purchases from session_id |
| `POST /api/auth/claim-account` | Sets password for new customer |
| `POST /api/portal/checkout` | Creates PaymentIntent for portal purchases |
| `POST /api/portal/confirm-purchase` | Grants product access after portal payment |
| `POST /api/track` | Tracks funnel events (page views, purchases, upsell decisions) |
| `GET /api/dashboard/metrics` | Returns aggregated funnel metrics with date filtering |
| `GET /api/dashboard/active-sessions` | Returns count of active visitors (last 5 min) |
| `GET /api/dashboard/debug` | Diagnostic endpoint for troubleshooting tracking issues |
| `GET /api/admin/metrics` | Returns admin dashboard metrics (members, revenue) |
| `GET /api/admin/members` | Returns paginated member list with search/sort |
| `GET /api/admin/members/[id]` | Returns detailed member info with purchases and progress |

### Upsell API Usage
```typescript
const response = await fetch("/api/upsell", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    sessionId,
    upsellType: "upsell-1", // or "downsell-1", "upsell-2"
    action: "accept", // or "decline"
  }),
});
```

---

## Database Schema (Supabase)

### Key Tables
- `profiles` - User accounts (linked to Supabase Auth)
- `products` - Product catalog with slugs, prices
- `user_purchases` - Grants product access to users
- `funnel_events` - Tracks page views, purchases, and upsell decisions for dashboard metrics

### Granting Access
Use `grantProductAccess()` from `src/lib/supabase/purchases.ts`:
```typescript
await grantProductAccess({
  email: customerEmail,
  fullName: customerName,
  stripeCustomerId: customerId,
  productSlug: 'resistance-mapping-guide',
  stripeSessionId: sessionId,
  stripePaymentIntentId: paymentIntentId,
});
```

**Internal Logic:**
1. Normalizes email to lowercase
2. Checks for existing user by email (case-insensitive)
3. Creates new Supabase auth user if not found
4. Upserts profile with customer data
5. Creates purchase record (uses `upsert` to handle duplicates gracefully)
6. Uses `SUPABASE_SERVICE_ROLE_KEY` for administrative access

**Key Point:** The function handles both new and existing users, making it safe to call multiple times for the same purchase.

### Supabase Client Patterns

Use separate Supabase clients based on the operation's privilege requirements:

**User-Facing Requests (regular client):**
```typescript
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
const { data } = await supabase.from("posts").select("*");
```

**Elevated Privilege Operations (admin client):**
Use for operations that need to bypass RLS policies during creation, or for server-side operations:
```typescript
import { createAdminClientInstance } from "@/lib/supabase/server";

const adminClient = createAdminClientInstance();
// Insert that bypasses RLS for initial creation
await adminClient.from("posts").insert({ ... });
```

**When to use admin client:**
- Creating records where RLS policies might interfere with the insert
- Server-side operations in API routes that need elevated access
- Operations that need to see all records regardless of RLS visibility

### Row Level Security (RLS) Patterns

Use RLS to control data visibility at the database level:

**Example: Post visibility with admin override:**
- Regular users see: non-hidden posts + their own posts
- Admin users see: all posts including hidden ones

```sql
-- Example RLS policy for posts
CREATE POLICY "Users can view visible posts"
ON discussion_posts FOR SELECT
USING (
  is_hidden = false
  OR author_id = auth.uid()
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
```

### Denormalization with Triggers

For frequently displayed counts (reactions, comments), use database triggers to maintain denormalized counts:

```sql
-- Trigger to update reaction_count on posts
CREATE OR REPLACE FUNCTION update_post_reaction_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE discussion_posts
    SET reaction_count = reaction_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE discussion_posts
    SET reaction_count = reaction_count - 1
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

**Benefits:** Avoids expensive JOINs or subqueries when displaying lists with counts.

### Migration Best Practices

When creating Supabase migrations:

```sql
-- Include clear comments explaining the migration
-- Use IF NOT EXISTS for DDL statements to make migrations idempotent
CREATE TABLE IF NOT EXISTS my_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backfill existing data when adding new columns
UPDATE profiles
SET last_active_at = created_at
WHERE last_active_at IS NULL;
```

**Key points:**
- Include clear comments in migration files
- Use `IF NOT EXISTS` for DDL statements
- Backfill existing data when adding new columns
- Test migrations locally before applying to production

---

## Integrations

| Service | Purpose | Config |
|---------|---------|--------|
| Stripe | Payments, checkout, webhooks | `STRIPE_*` env vars |
| Supabase | Auth, database, user access | `SUPABASE_*` env vars |
| Klaviyo | Email marketing, event tracking | `KLAVIYO_*` env vars |
| Meta CAPI | Server-side conversion tracking | `META_*` env vars |
| Hotjar | Session recordings | Client-side |
| GA4 | Google Analytics 4 tracking | `NEXT_PUBLIC_GA4_MEASUREMENT_ID` |

### Klaviyo API Patterns

Klaviyo is used for email marketing and event tracking. The API uses specific endpoints for different operations:

**API Endpoints:**
- `POST /profiles/` - Create or update profiles (deduplicates by email)
- `PATCH /profiles/{id}/` - Update specific profile attributes
- `GET /profiles/?filter=...` - Retrieve profiles by filter
- `POST /lists/{id}/relationships/profiles/` - Add profiles to a list

**Key Pattern - Email Normalization:**
Always normalize emails to lowercase before Klaviyo calls. Klaviyo uses email as the primary identifier, and inconsistent casing can create duplicate profiles:

```typescript
const emailLower = email.toLowerCase();
await upsertProfile({ email: emailLower, firstName, lastName });
```

**Error Handling:**
Klaviyo calls should always be wrapped in try-catch. A Klaviyo failure should never crash a webhook or block a purchase:

```typescript
try {
  await upsertProfile({ email: emailLower, ...customerData });
  await trackEvent({ email: emailLower, event: "Purchase", properties });
} catch (error) {
  console.error('[Klaviyo] Failed (non-critical):', error);
}
```

### Stripe Webhook Event Types

The webhook handler processes different Stripe events for different purposes:

| Event | Purpose | When Used |
|-------|---------|-----------|
| `payment_intent.succeeded` | Payment completed | Main checkout, upsells |
| `checkout.session.completed` | Full checkout flow completed | When using Checkout Sessions (not PaymentIntents) |

**Key Differences:**
- `payment_intent.succeeded` is more granular - fires when any payment succeeds
- `checkout.session.completed` is higher-level - fires when a full Checkout Session completes
- This funnel uses PaymentIntents directly, so `payment_intent.succeeded` is the primary event

**Customer Data Retrieval Priority:**
When processing `payment_intent.succeeded`, retrieve customer data in this order:

1. **PaymentIntent metadata** - Most reliable (set during checkout)
2. **Attached Stripe customer** - `paymentIntent.customer` → `stripe.customers.retrieve()`
3. **Charge billing details** - `charges.data[0].billing_details`
4. **Session customer_details** - For Checkout Session flows

```typescript
// Fallback chain for customer email
const customerEmail =
  paymentIntent.metadata?.customerEmail ||
  customer?.email ||
  charge?.billing_details?.email;
```

---

## Analytics Implementation

### Google Analytics 4 (GA4)

GA4 is implemented across all funnel pages for comprehensive event tracking.

**Configuration:**
- Measurement ID: `G-QW04PDPSDS`
- Environment Variable: `NEXT_PUBLIC_GA4_MEASUREMENT_ID`
- Must be set in Vercel environment variables (baked into build at build time)

**Key Files:**
- `src/lib/ga4.ts` - GA4 tracking library with all event methods
- `src/components/GoogleAnalytics.tsx` - Script loader component (loads gtag.js via Next.js Script)

**Events Tracked:**

| Page | Events |
|------|--------|
| Landing (`/`) | `landing_page_view` |
| Product (`/product`) | `view_item` |
| Checkout (`/checkout`) | `checkout_view`, `checkout_started`, `order_bump_added`, `order_bump_removed` |
| Upsell 1 (`/upsell-1`) | `upsell_view`, `upsell_accepted`, `upsell_declined` |
| Downsell 1 (`/downsell-1`) | `downsell_view`, `downsell_accepted`, `downsell_declined` |
| Upsell 2 (`/upsell-2`) | `upsell_view`, `upsell_accepted`, `upsell_declined` |
| Thank You (`/thank-you`) | `funnel_completed` (with total value) |

**Debug Console Log:**
On page load, the console shows: `[GA4] Measurement ID configured: Yes` (or `No` if env var is missing)

**Adding GA4 to a New Page:**
```tsx
import { useEffect } from "react";
import { ga4 } from "@/lib/ga4";

function MyPageContent() {
  useEffect(() => {
    ga4.pageView(); // Basic page view
    // Or use specific funnel events:
    // ga4.upsellView(2, 'Product Name', 49.99);
  }, []);

  const handleAccept = () => {
    ga4.upsellAccepted(2, 'Product Name', 49.99);
    // ... rest of accept logic
  };
}
```

### Analytics Reliability Principle

**Critical:** Analytics tracking failures must NEVER break the checkout flow. All client-side tracking code should:
- Wrap browser API calls (storage, cookies) in try-catch
- Fail silently without interrupting the purchase process
- Use server-side tracking (webhooks) as the authoritative source for conversion data

Server-side tracking via Stripe webhooks is more reliable than client-side tracking because it doesn't depend on browser APIs, ad blockers, or JavaScript execution.

### Server-Side Funnel Tracking

For critical events (purchases, upsell decisions), use server-side tracking in addition to client-side tracking. The `funnel_events` table is the source of truth for dashboard metrics.

**Key Files:**
- `src/lib/funnel-tracking.ts` - Server-side tracking utility (if exists)
- `src/app/api/webhook/route.ts` - Tracks purchases on `payment_intent.succeeded`
- `src/app/api/upsell/route.ts` - Tracks upsell accepts/declines

**Tracking Pattern for API Routes:**
```typescript
// In webhook or API route, track the event server-side
await trackFunnelEvent({
  eventType: 'purchase',
  funnelStep: 'checkout',
  revenueCents: amountPaid,
  productSlug: 'product-slug',
  sessionId: stripeSessionId,
  visitorId: existingVisitorId, // Try to link to client session
});
```

**Session Linking:** When possible, pass the visitor/session ID from client to server (e.g., in PaymentIntent metadata) so server-side events can be linked to client sessions. If unavailable, the tracking system should attempt to find recent page views from the same checkout session.

### Meta Pixel (Facebook)

Meta Pixel is implemented for Facebook/Instagram ad tracking.

**Key Files:**
- `src/lib/meta-pixel.ts` - Meta Pixel tracking functions
- `src/components/MetaPixel.tsx` - Pixel script loader

**Events:**
- `InitiateCheckout` - Checkout page
- `AddToCart` - Order bump added
- `CompleteRegistration` - Thank you page
- `Purchase` - Tracked server-side via Stripe webhook (Conversions API for accuracy, bypasses ad blockers)

### Hotjar

Session recording and heatmaps via Hotjar.

**Key File:** `src/components/HotjarPixel.tsx`

---

## Style Guide

**Full style guide:** `src/styles/style-guide.ts` - Contains all colors, typography, spacing, component patterns, and helper functions.

### Utility Functions
The `cn()` helper combines Tailwind classes safely:
```tsx
import { cn } from "@/styles/style-guide";

<div className={cn("base-class", isActive && "active-class", className)} />
```

### Quick Reference

| Element | Value |
|---------|-------|
| Body font | Inter (default) |
| Heading font | Playfair Display (`font-serif italic`) |
| Primary gold | `#d4a574` |
| Dark background | `#1a1512` |
| Orange accent | `#ee5d0b` |

### Logo Usage

**Path:** `/logo.png`
**Alt text:** `"Inner Wealth Initiate"`

**Header (funnel pages):**
```tsx
<header className="py-6 px-4 bg-black">
  <div className="max-w-4xl mx-auto text-center">
    <Image
      src="/logo.png"
      alt="Inner Wealth Initiate"
      width={200}
      height={50}
      className="mx-auto"
    />
  </div>
</header>
```

**Footer (smaller):**
```tsx
<Image
  src="/logo.png"
  alt="Inner Wealth Initiate"
  width={150}
  height={38}
  className="mx-auto"
/>
```

**Checkout page (larger, linked):**
```tsx
<Link href="/">
  <Image
    src="/logo.png"
    alt="Inner Wealth Initiate"
    width={300}
    height={75}
  />
</Link>
```

### Image Assets Location
- Logo: `/public/logo.png`
- Product images: `/public/images/Products/`
- Upsell-specific: `/public/images/Products/Upsell1/`, `/Upsell2/`, `/Downsell1/`

---

## React Component Patterns

### Component Memoization

Use `React.memo` for components that might re-render unnecessarily when parent state changes:

```tsx
import React from "react";

interface PostCardProps {
  post: Post;
  onReact: (postId: string, emoji: string) => void;
}

export const PostCard = React.memo(function PostCard({ post, onReact }: PostCardProps) {
  // Component only re-renders when post or onReact changes
  return (
    <div className="p-4 border rounded-lg">
      <h3>{post.title}</h3>
      {/* ... */}
    </div>
  );
});
```

### Memoizing Callback Props

Use `useCallback` for functions passed as props to memoized child components:

```tsx
function PostFeed() {
  const [posts, setPosts] = useState<Post[]>([]);

  // Memoized callback prevents PostCard re-renders
  const handleReact = useCallback((postId: string, emoji: string) => {
    setPosts(prev => prev.map(post =>
      post.id === postId ? { ...post, reactions: [...post.reactions, emoji] } : post
    ));
  }, []);

  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} onReact={handleReact} />
      ))}
    </div>
  );
}
```

### Optimistic UI Updates

For interactions like reactions/likes, update the UI immediately and revert on error:

```tsx
const handleReact = async (postId: string, emoji: string) => {
  // 1. Optimistically update UI
  setPosts(prev => prev.map(post =>
    post.id === postId
      ? { ...post, reactionCount: post.reactionCount + 1, userReacted: true }
      : post
  ));

  try {
    // 2. Make API call
    const response = await fetch(`/api/posts/${postId}/react`, {
      method: "POST",
      body: JSON.stringify({ emoji }),
    });

    if (!response.ok) throw new Error("Failed to react");
  } catch (error) {
    // 3. Revert on failure
    setPosts(prev => prev.map(post =>
      post.id === postId
        ? { ...post, reactionCount: post.reactionCount - 1, userReacted: false }
        : post
    ));
    console.error("Reaction failed:", error);
  }
};
```

### Type Safety for API Responses

Define clear TypeScript interfaces for API responses:

```typescript
// Types for API responses
interface PostsResponse {
  posts: Post[];
  total: number;
  hasMore: boolean;
}

interface PostResponse {
  post: Post;
  comments: Comment[];
}

// Usage in component
const [response, setResponse] = useState<PostsResponse | null>(null);

useEffect(() => {
  async function fetchPosts() {
    const res = await fetch("/api/posts");
    const data: PostsResponse = await res.json();
    setResponse(data);
  }
  fetchPosts();
}, []);
```

---

## Creating A/B Test Variants

### Duplicating a Funnel Page
1. Copy the page file (e.g., `src/app/upsell-1/page.tsx`)
2. Create new route (e.g., `src/app/upsell-1-v2/page.tsx`)
3. Ensure it uses `useSessionId` hook
4. Update navigation links to point to correct next step
5. Update the upsell API call if changing `upsellType`

### Key Navigation Points to Update
In each page, find and update:
- Accept button destination: `window.location.href = "/next-page?session_id=" + sessionId`
- Decline link: `href={"/next-page?session_id=${sessionId}"}`

### Testing a Variant
1. Go through checkout normally
2. On upsell page, manually change URL to your variant
3. Verify session_id persists through the variant flow
4. Verify purchases are correctly recorded

---

## Post-Purchase Account Setup

After completing a purchase, customers need to set up their account password to access the member portal.

### Account Setup Flow

```
/thank-you → /claim-account?session_id=xxx → (set password) → /portal
```

### How It Works

1. **Thank-you page** shows "Access Your Portal & Products" button
2. Button links to `/claim-account?session_id=xxx` (passing the Stripe session ID)
3. **Claim-account page** fetches customer email from session and pre-fills it (read-only)
4. Customer creates and confirms their password
5. Account is claimed via `/api/auth/claim-account`
6. Customer is signed in and redirected to `/portal`

### Key Files

| File | Purpose |
|------|---------|
| `src/app/claim-account/page.tsx` | Account setup page |
| `src/app/claim-account/layout.tsx` | Layout with AuthProvider |
| `src/app/api/auth/claim-account/route.ts` | API to set password |
| `src/app/api/auth/session-email/route.ts` | API to get email from session_id |

### Fallback for Expired Sessions

If a customer closes their browser during the upsell flow and returns later (session expired), they can still claim their account:

1. Visit `/claim-account` (without session_id)
2. Page shows a registration form where they can manually enter:
   - Their purchase email
   - Create password
   - Confirm password
3. The `/api/auth/claim-account` endpoint handles both cases:
   - If profile exists → updates password
   - If no profile → creates new user

### Thank-You Page Link Logic

```tsx
<Link
  href={sessionId ? `/claim-account?session_id=${sessionId}` : "/login"}
>
  Access Your Portal & Products
</Link>
```

If no session_id is available (edge case), falls back to `/login` for returning users.

### Important: Session ID Must Be Passed

The claim-account page relies on the session_id to fetch the customer's email. Always pass it in the URL when navigating from the thank-you page.

---

## Member Portal

Located at `/portal/*` routes. Users set password on the claim-account page and access purchased content.

### Membership Tier Logic

**Derive tier from purchases, don't store it.** Instead of maintaining a `membership_tier` column in `profiles`, determine a user's tier (free/paid) by checking for paid purchases in `user_purchases`:

```typescript
// Good - derive from purchases
const { data: purchases } = await supabase
  .from('user_purchases')
  .select('product_id, products(is_lead_magnet)')
  .eq('user_id', userId);

const hasPaidPurchase = purchases?.some(p => !p.products?.is_lead_magnet);
const tier = hasPaidPurchase ? 'paid' : 'free';

// Bad - storing redundant membership_tier column
// This can get out of sync with actual purchases
```

**Why this pattern:** Avoids data synchronization issues where the tier column might not match actual purchase status.

### Lead Magnet Access

Products can be flagged as `is_lead_magnet` in the database. Any authenticated user can access these products regardless of purchase history:

```typescript
// Check product access
const hasAccess =
  product.is_lead_magnet ||  // Free for all members
  userPurchases.some(p => p.product_id === product.id);  // Or purchased
```

**Implementation locations:**
- `useProducts` and `useProduct` hooks - Filter accessible products
- Lesson page access checks - Allow lead magnet lessons for any authenticated user

### Product Display Order

When displaying product lists (e.g., in the portal dashboard or products page), **lead magnets should always appear below paid products**, regardless of the user's membership tier:

```typescript
// Sort products: paid products first, then lead magnets
const sortedProducts = [...products].sort((a, b) => {
  if (a.is_lead_magnet && !b.is_lead_magnet) return 1;  // Lead magnets go to end
  if (!a.is_lead_magnet && b.is_lead_magnet) return -1; // Paid products go to front
  return 0; // Maintain original order within each group
});
```

**Why this pattern:** Paid products represent the user's primary investment and should be prominently displayed. Lead magnets, while valuable, are supplementary content. This ordering:
- Encourages users to engage with paid content first
- Helps users discover paid products they don't own
- Keeps the most valuable content visible without scrolling

### Portal Structure
- `/portal` - Dashboard
- `/portal/products` - List of purchased products
- `/portal/products/[slug]` - Product content
- `/portal/products/[slug]/modules/[moduleSlug]/lessons/[lessonSlug]` - Individual lessons

### Portal Product Purchases

Users can purchase products they don't own directly from the portal. This uses different pricing than the funnel.

**Portal Pricing:**
- `portal_price_cents` column in `products` table (can differ from funnel `price_cents`)
- Falls back to `price_cents` if portal pricing not set

**Key Components:**
- `src/components/portal/PurchaseModal.tsx` - Modal with Stripe Elements for portal checkout
- `src/app/api/portal/checkout/route.ts` - Creates PaymentIntent with portal pricing
- `src/app/api/portal/confirm-purchase/route.ts` - Grants product access after payment

**Portal Checkout Flow:**
1. User clicks "Unlock for $X.XX" on product detail page
2. `PurchaseModal` opens and calls `/api/portal/checkout`
3. User enters payment details via Stripe Elements
4. On success, `/api/portal/confirm-purchase` grants access via `grantProductAccess()`
5. Modal shows success and page refreshes to show owned status

**Required Environment Variables:**
- `SUPABASE_SERVICE_ROLE_KEY` - Required for server-side Supabase operations (granting product access)
- `STRIPE_SECRET_KEY` - For creating PaymentIntents

**Setting Portal Pricing:**
Update the `products` table in Supabase:
```sql
UPDATE products
SET portal_price_cents = 9700  -- $97.00
WHERE slug = 'pathless-path';
```

---

## Admin Portal (Analytics Dashboard)

Located at `/portal/admin/*` routes. Provides administrators with member management and analytics capabilities.

### Routes
| Route | Purpose |
|-------|---------|
| `/portal/admin` | Main admin dashboard with metrics overview |
| `/portal/admin` (member list) | Searchable, sortable list of all members |

### Features
- **Macro metrics:** Total members, active members (30 days), total revenue, average revenue per member
- **Member list:** Searchable by name/email, sortable by various columns
- **Member detail slide-over:** Click a member row to see detailed information including purchases and lesson progress

### Key Files

| File | Purpose |
|------|---------|
| `src/app/portal/admin/page.tsx` | Main admin dashboard page |
| `src/app/portal/admin/layout.tsx` | Admin access guard (checks `is_admin`) |
| `src/components/admin/AdminDashboard.tsx` | Dashboard container component |
| `src/components/admin/MetricCard.tsx` | Reusable metric display card |
| `src/components/admin/MembersTable.tsx` | Searchable/sortable member list |
| `src/components/admin/MemberSlideOver.tsx` | Member detail panel |
| `src/components/admin/ProductProgressList.tsx` | Product/lesson progress display |

### API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/admin/metrics` | Returns aggregate metrics (members, revenue, activity) |
| `GET /api/admin/members` | Returns paginated member list with search/sort |
| `GET /api/admin/members/[id]` | Returns detailed member info with purchases and progress |

### Admin Access Pattern

All admin routes use the service role key to bypass RLS. This simplifies queries and avoids RLS recursion issues:

```typescript
import { createAdminClientInstance } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createAdminClientInstance();

  // Verify admin status first
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Now safe to query all data
  const { data: members } = await supabase
    .from("profiles")
    .select("*");
}
```

### TypeScript Types

Define explicit types for admin API responses:

```typescript
interface AdminMetricsResponse {
  totalMembers: number;
  activeMembers: number;
  totalRevenueCents: number;
  avgRevenuePerMember: number;
}

interface MemberSummary {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  lastActiveAt: string | null;
  purchaseCount: number;
  totalSpentCents: number;
}

interface MembersListResponse {
  members: MemberSummary[];
  total: number;
  page: number;
  pageSize: number;
}
```

### External Images Configuration

When displaying images from Supabase Storage (like member avatars), configure `next.config.js`:

```javascript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};
```

---

## Funnel Metrics Dashboard

An internal dashboard at `/dashboard` for tracking funnel performance in real-time.

### Features
- **Live visitor counter** - Pulsing indicator showing active sessions (5-min window)
- **Date range filtering** - 7/30/90 days or all time
- **Funnel breakdown table** - Sessions, purchases, conversion %, revenue per step
- **Ad spend tracking** - Manual input with ROAS/CAC calculations (persisted in localStorage)
- **A/B test comparison** - Click step rows to expand variant performance
- **Summary metrics** - Unique customers, AOV per customer

### Metrics Definitions
- **Total Conversion Rate:** The *checkout* conversion rate (purchases / checkout sessions), NOT an average across all steps. This represents the percentage of checkout visitors who complete a purchase.

### Key Files

| File | Purpose |
|------|---------|
| `src/app/dashboard/page.tsx` | Dashboard UI |
| `src/app/api/dashboard/metrics/route.ts` | Aggregated metrics API |
| `src/app/api/dashboard/active-sessions/route.ts` | Real-time visitor count |
| `src/app/api/track/route.ts` | Event ingestion endpoint |
| `src/hooks/useFunnelTracking.ts` | Client-side tracking hook |

### Tracking Events in Funnel Pages

```tsx
import { useFunnelTracking } from '@/hooks/useFunnelTracking';

function CheckoutPage() {
  const { track } = useFunnelTracking('checkout');
  // Page view tracked automatically on mount

  const handlePurchase = async () => {
    await track('purchase', {
      revenueCents: 2400,
      productSlug: 'resistance-mapping-guide',
      sessionId,
    });
  };
}
```

**Event types:** `page_view`, `purchase`, `upsell_accept`, `upsell_decline`, `downsell_accept`, `downsell_decline`

**Local testing:** Set `NEXT_PUBLIC_TRACK_LOCALHOST=true` to enable tracking on localhost.

**Full implementation guide:** See `.claude/skills/funnel-dashboard.md`

### Debug Endpoint

A diagnostic endpoint is available at `/api/dashboard/debug` for troubleshooting tracking issues.

**What it checks:**
- Environment variable status (Supabase, Stripe keys)
- Database connectivity and table access
- Recent funnel events by type
- Recent purchases with revenue
- User profiles and purchases
- Auth admin access

**Usage:** Visit `https://offer.innerwealthinitiate.com/api/dashboard/debug` to see full diagnostics.

**Key file:** `src/app/api/dashboard/debug/route.ts`

---

## Troubleshooting Purchase Tracking

If purchases aren't appearing in the funnel dashboard, follow this diagnostic process:

### 1. Check the Debug Endpoint

Visit `/api/dashboard/debug` and verify:
- `SUPABASE_SERVICE_ROLE_KEY_SET: true` - Required for server-side tracking
- `database.status: "OK"` - Can connect to Supabase
- `insertTest.status: "OK"` - Can insert into `funnel_events` table

### 2. Check Webhook Logs

The webhook at `/api/webhook` handles `payment_intent.succeeded` events. Look for these console logs:
- `[Webhook] Processing payment_intent.succeeded` - Event received
- `[Webhook] Customer email found:` - Email extraction succeeded
- `[Webhook] Starting funnel dashboard tracking` - Tracking initiated
- `[Webhook] Funnel dashboard tracking result: SUCCESS` - Tracking completed

### 3. Common Issues

**Missing `SUPABASE_SERVICE_ROLE_KEY`:**
- Symptom: Events not recorded, dashboard shows no purchases
- Fix: Add the key to Vercel environment variables and redeploy

**External integration failures blocking webhook:**
- Symptom: Purchases intermittently fail to track
- Root cause: Unhandled errors in Klaviyo/Meta calls crash the webhook
- Fix: Wrap ALL external integrations in try-catch blocks (see Webhook Architecture below)

**Column name mismatches:**
- Symptom: Database query errors in debug endpoint
- Example: `user_purchases` uses `purchased_at`, not `created_at`
- Fix: Always verify column names against actual schema

### 4. Webhook Architecture (Critical Pattern)

The webhook must be structured with **critical operations first**, followed by **non-critical integrations wrapped in try-catch**:

```typescript
// CRITICAL SECTION: Must succeed for purchase to be recorded
console.log('[Webhook] Starting funnel dashboard tracking...');
const trackingSuccess = await trackCheckoutPurchase(sessionId, amount, includeOrderBump);
console.log('[Webhook] Tracking result:', trackingSuccess ? 'SUCCESS' : 'FAILED');

// NON-CRITICAL SECTION: External integrations that should not block
// 1. Klaviyo
try {
  await upsertProfile({ ... });
  await trackEvent({ ... });
} catch (klaviyoError) {
  console.error('[Webhook] Klaviyo failed (non-critical):', klaviyoError);
}

// 2. Meta CAPI
try {
  await trackServerPurchase({ ... });
} catch (metaError) {
  console.error('[Webhook] Meta CAPI failed (non-critical):', metaError);
}
```

**Why this matters:** If Klaviyo throws an unhandled exception, it can crash the webhook before the purchase is recorded in `funnel_events`. The dashboard then shows no revenue even though the payment succeeded.

### 5. Server-Side Tracking Requirements

The `trackCheckoutPurchase()` function in `src/lib/funnel-tracking.ts` requires:

1. **`SUPABASE_SERVICE_ROLE_KEY`** - Must be set in environment
2. **Admin client** - Uses `createAdminClientInstance()` to bypass RLS
3. **Proper logging** - Logs success/failure for debugging

```typescript
// Check at start of tracking function
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('[Server Tracking] CRITICAL: SUPABASE_SERVICE_ROLE_KEY is not set');
  return false;
}
```

---

## Code Quality Principles

### Avoid Over-Engineering

Keep implementations simple and focused on current requirements:

**DO:**
- Build the minimum viable solution first
- Add complexity only when the use case demands it
- Refactor when patterns emerge naturally

**DON'T:**
- Create abstractions before they're needed
- Design for hypothetical future requirements
- Add "nice-to-have" features that weren't requested

**Example - Three similar lines vs premature abstraction:**
```typescript
// Good - explicit and clear
const userName = user.firstName + " " + user.lastName[0] + ".";
const authorName = author.firstName + " " + author.lastName[0] + ".";
const reviewerName = reviewer.firstName + " " + reviewer.lastName[0] + ".";

// Avoid - premature abstraction for 3 uses
function formatDisplayName(person: Person): string { ... }
```

Only extract to a utility function when used more than 3-4 times or when the logic is complex.

### Database Migrations Must Be Applied

Creating a migration file is not enough—it must also be applied to the database:

```bash
# After creating migration SQL files
# Ensure they are applied via Supabase dashboard or CLI:
supabase db push

# Or verify tables exist:
supabase db diff
```

**Symptom of unapplied migrations:** "Table does not exist" errors even though the SQL file exists in your codebase.

### Iterative Refinement Process

When building new features:

1. **Plan first** - Understand requirements before writing code
2. **Get feedback early** - Share the plan with the user before implementing
3. **Simplify based on feedback** - Reduce scope if the initial approach is too complex
4. **Refactor after confirmation** - Clean up only once the feature works correctly

This prevents wasted effort on approaches that don't match user expectations.

---

## Community & Discussion UI Patterns

### Privacy-Focused Display Names

Show names in a privacy-conscious format:

```typescript
function formatDisplayName(firstName: string, lastName: string): string {
  if (!lastName) return firstName;
  return `${firstName} ${lastName[0]}.`; // "John D." instead of "John Doe"
}
```

### Tabbed Interface for Related Content

Use a single container with toggleable tabs instead of stacked sections:

```tsx
type TabType = "pinned" | "trending" | "topics";

function CommunitySidebar() {
  const [activeTab, setActiveTab] = useState<TabType>("pinned");

  return (
    <div className="bg-[#1a1a1a] rounded-lg p-4">
      {/* Tab buttons */}
      <div className="flex border-b border-gray-700 mb-4">
        {["pinned", "trending", "topics"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as TabType)}
            className={cn(
              "px-4 py-2 text-sm font-medium",
              activeTab === tab
                ? "border-b-2 border-[#d4a574] text-white"
                : "text-gray-400 hover:text-white"
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "pinned" && <PinnedContent />}
      {activeTab === "trending" && <TrendingContent />}
      {activeTab === "topics" && <TopicsContent />}
    </div>
  );
}
```

### Mobile-Specific Previews

Show condensed, horizontally scrollable previews on mobile:

```tsx
function HighlightsFeed({ posts }: { posts: Post[] }) {
  return (
    <>
      {/* Mobile: horizontal scroll preview */}
      <div className="lg:hidden overflow-x-auto flex gap-4 pb-4">
        {posts.slice(0, 5).map(post => (
          <div key={post.id} className="min-w-[280px] flex-shrink-0">
            <PostCard post={post} compact />
          </div>
        ))}
      </div>

      {/* Desktop: full grid */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </>
  );
}
```

### Utility Functions for Common Tasks

Create focused utility functions for reusable logic:

```typescript
// src/lib/utils/format.ts

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function extractYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
```

---

## Common Tasks

### Creating a New Funnel
Use the funnel blueprint skill at `.claude/skills/create-funnel.md` which contains:
- Pre-flight checklist (products, prices, Stripe setup)
- Step-by-step implementation guide
- Files to create/modify for each funnel page
- API route configuration
- Analytics setup (GA4, Klaviyo, Meta)
- Image requirements and directory structure
- Page templates and code patterns
- Testing checklist

**Usage:** Say "create a funnel for [product name]" and follow the blueprint.

### Adding a New Product
1. Add to Stripe (create Price)
2. Add to Supabase `products` table with correct slug
3. Add price ID to `.env`
4. Update webhook/upsell handlers to grant access

### Adding a New Upsell
1. Create page at `src/app/upsell-X/page.tsx`
2. Add case in `src/app/api/upsell/route.ts`:
```typescript
case 'upsell-X':
  priceAmount = XXXX; // cents
  productName = 'Product Name';
  productSlug = 'product-slug';
  acceptedEvent = FunnelEvents.UPSELL_X_ACCEPTED;
  declinedEvent = FunnelEvents.UPSELL_X_DECLINED;
  break;
```
3. Add Klaviyo events in `src/lib/klaviyo.ts`
4. Update navigation flow in adjacent pages

---

## Admin Direct Messaging

The portal includes a Skool-style direct messaging system that allows admins to communicate with members and send automated messages based on triggers.

### Architecture Overview

**Key Characteristics:**
- **Polling-based real-time updates** - No WebSockets; uses configurable polling intervals
- **Admin-initiated conversations** - Only admins can start new conversations with members
- **Member context** - Admins can view member purchases and progress within the chat interface
- **Automated DMs** - Trigger-based automated messages for onboarding, engagement, and inactivity

### UI Structure

The chat UI follows Skool's pattern:
- **Header chat icon** - Located next to notification bell in portal header
- **Dropdown conversations list** - Shows recent conversations on click
- **Expandable chat windows** - Pop-up windows for active conversations
- **Mobile adaptation** - Full-screen chat with back button on mobile

### Key Files

| Directory | Purpose |
|-----------|---------|
| `src/components/chat/` | Chat UI components (ChatDropdown, ChatWindow, ConversationList, MessageList) |
| `src/components/shared/` | Shared UI components (UserAvatar, formatDisplayName) |
| `src/hooks/` | Chat-related hooks (useConversations, useMessages, useSendMessage, useUnreadCount, useChat) |
| `src/contexts/` | ChatProvider for managing open windows and unread state |
| `src/lib/dm-automation.ts` | Automated DM trigger logic |
| `src/app/api/conversations/` | Conversation CRUD endpoints |
| `src/app/api/messages/` | Message send/fetch endpoints |

### Database Tables

| Table | Purpose |
|-------|---------|
| `conversations` | Stores conversation metadata between users |
| `messages` | Individual messages within conversations |
| `dm_automation_rules` | Automated DM trigger configurations |
| `canned_responses` | Pre-saved message templates for admins |

### API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/conversations` | List user's conversations |
| `POST /api/conversations` | Create new conversation (admin only) |
| `GET /api/conversations/[id]` | Get conversation details |
| `GET /api/conversations/[id]/messages` | Get messages for a conversation |
| `POST /api/messages` | Send a message |
| `PATCH /api/messages/[id]/read` | Mark message as read |
| `GET /api/admin/members/[id]` | Get member context (purchases, progress) |

### Hook Patterns

**useConversations:**
```typescript
const { conversations, loading, error, refresh } = useConversations();
// Polls for updates at configurable interval
// Supports optimistic updates via updateConversation()
```

**useMessages:**
```typescript
const { messages, loading, hasMore, loadMore, addMessage } = useMessages(conversationId);
// Handles pagination and polling for new messages
// Uses refs to prevent race conditions during polling
```

**useSendMessage:**
```typescript
const { send, sending, error } = useSendMessage();
await send({ conversationId, content });
// Optimistic UI update with error rollback
```

**useUnreadCount:**
```typescript
const unreadCount = useUnreadCount();
// Used for badge display on chat icon
```

### ChatProvider Context

Manages global chat state:
```typescript
const {
  openWindows,        // Currently open chat windows
  openChat,           // Open a conversation window
  closeChat,          // Close a conversation window
  unreadCount,        // Total unread messages
  refreshUnreadCount  // Force refresh unread count
} = useChat();
```

### Polling Strategy

Since the system uses polling instead of WebSockets:
- **Active window:** Poll every 3-5 seconds for new messages
- **Inactive/background:** Poll less frequently (30-60 seconds)
- **Conversation list:** Poll every 10-15 seconds

```typescript
// Example polling implementation
useEffect(() => {
  const interval = setInterval(() => {
    if (!fetchInProgressRef.current) {
      fetchMessages();
    }
  }, isWindowActive ? 5000 : 30000);

  return () => clearInterval(interval);
}, [isWindowActive]);
```

### Automated DM Triggers

| Trigger Type | Description |
|--------------|-------------|
| `onboarding` | Welcome message when user first joins |
| `engagement` | Message when user completes certain actions |
| `inactivity` | Re-engagement message after period of inactivity |
| `purchase` | Follow-up after product purchase |

**Configuration via `dm_automation_rules` table:**
```sql
CREATE TABLE dm_automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_type TEXT NOT NULL,
  delay_minutes INTEGER DEFAULT 0,
  message_template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Mobile Responsiveness

Chat UI adapts to mobile with:
- Full-screen conversation view (replaces dropdown/popup)
- Back button navigation instead of close button
- Touch-friendly message input
- Responsive message bubbles

```tsx
// Mobile detection for chat UI
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkMobile = () => setIsMobile(window.innerWidth < 768);
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);
```

### Admin vs. Member Capabilities

| Feature | Admin | Member |
|---------|-------|--------|
| Initiate new conversation | Yes | No |
| View member context | Yes | N/A |
| Access canned responses | Yes | No |
| Send messages | Yes | Yes |
| View conversation history | Yes | Yes |

### Canned Responses

Admins can save and use pre-written message templates:

```typescript
// Fetch canned responses
const { data: responses } = await supabase
  .from('canned_responses')
  .select('*')
  .order('title');

// Use in message input
<select onChange={(e) => setMessage(e.target.value)}>
  <option value="">Insert template...</option>
  {responses.map(r => (
    <option key={r.id} value={r.content}>{r.title}</option>
  ))}
</select>
```
