# Houston Funnel - Claude Context

## Overview
This is a sales funnel for digital products (courses/guides) with Stripe checkout, one-click upsells, and a member portal for content delivery.

**Live URL:** `offer.innerwealthinitiate.com`

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

---

## API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/checkout` | Creates Stripe checkout session |
| `POST /api/upsell` | Processes one-click upsell payments |
| `POST /api/webhook` | Handles Stripe webhooks (checkout.session.completed) |
| `GET /api/auth/session-email` | Gets customer email/purchases from session_id |
| `POST /api/auth/claim-account` | Sets password for new customer |

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

---

## Style Guide

**Full style guide:** `src/styles/style-guide.ts` - Contains all colors, typography, spacing, component patterns, and helper functions.

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
