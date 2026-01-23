# Houston Funnel - Claude Context

## Overview
This is a sales funnel for digital products (courses/guides) with Stripe checkout, one-click upsells, and a member portal for content delivery.

**Live URLs:**
- Marketing site: `innerwealthinitiate.com`
- Sales funnel: `offer.innerwealthinitiate.com`

**Project Structure:** All functionality (marketing, funnel, portal) is consolidated in a single Next.js/Vercel project for easier management and deployment. Multiple domains can be configured in Vercel pointing to the same project.

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
| `/checkout` | Stripe checkout with order bump | $7 + $17 bump |
| `/upsell-1` | The Pathless Path™ Program | $97 |
| `/downsell-1` | Nervous System Reset Kit™ (shown if upsell-1 declined) | $27 |
| `/upsell-2` | Bridge to Mastery™ | $14.95 |
| `/thank-you` | Order confirmation + account creation | - |

### Products & Slugs
| Product | Slug | Price |
|---------|------|-------|
| Resistance Mapping Guide™ | `resistance-mapping-guide` | $7 |
| Golden Thread Technique | `golden-thread-technique` | $17 (order bump) |
| The Pathless Path™ | `pathless-path` | $97 |
| Nervous System Reset Kit™ | `nervous-system-reset` | $27 |
| Bridge to Mastery™ | `bridge-to-mastery` | $14.95 |

---

## Critical Conventions

### 1. Session ID Persistence
The Stripe `session_id` can be lost during funnel navigation. All funnel pages MUST use the `useSessionId` hook:

```tsx
import { useSessionId } from "@/hooks/useSessionId";

function MyFunnelPage() {
  const sessionId = useSessionId(); // Persists in sessionStorage as backup
  // Use sessionId for API calls and navigation
}
```

**Why:** The hook stores `session_id` in sessionStorage. If it's lost from the URL (e.g., `?session_id=null`), it recovers from sessionStorage.

**Files using this:**
- `src/app/upsell-1/page.tsx`
- `src/app/upsell-2/page.tsx`
- `src/app/downsell-1/page.tsx`
- `src/app/thank-you/page.tsx`

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

---

## API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/checkout` | Creates Stripe checkout session |
| `POST /api/upsell` | Processes one-click upsell payments |
| `POST /api/webhook` | Handles Stripe webhooks (checkout.session.completed) |
| `GET /api/auth/session-email` | Gets customer email/purchases from session_id |
| `POST /api/auth/claim-account` | Sets password for new customer |
| `POST /api/portal/checkout` | Creates PaymentIntent for portal purchases |
| `POST /api/portal/confirm-purchase` | Grants product access after portal payment |

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

---

## Integrations

| Service | Purpose | Config |
|---------|---------|--------|
| Stripe | Payments, checkout, webhooks | `STRIPE_*` env vars |
| Supabase | Auth, database, user access | `SUPABASE_*` env vars |
| Klaviyo | Email marketing, event tracking | `KLAVIYO_*` env vars |
| Shopify | Order sync for fulfillment | `SHOPIFY_*` env vars |
| Meta CAPI | Server-side conversion tracking | `META_*` env vars |
| Hotjar | Session recordings | Client-side |
| GA4 | Google Analytics 4 tracking | `NEXT_PUBLIC_GA4_MEASUREMENT_ID` |

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

### Meta Pixel (Facebook)

Meta Pixel is implemented for Facebook/Instagram ad tracking.

**Key Files:**
- `src/lib/meta-pixel.ts` - Meta Pixel tracking functions
- `src/components/MetaPixel.tsx` - Pixel script loader

**Events:**
- `InitiateCheckout` - Checkout page
- `AddToCart` - Order bump added
- `CompleteRegistration` - Thank you page
- `Purchase` - Tracked server-side via Stripe webhook (Conversions API for accuracy)

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

## Member Portal

Located at `/portal/*` routes. Users set password on thank-you page and access purchased content.

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

## Common Tasks

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
