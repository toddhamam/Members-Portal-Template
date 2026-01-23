# Funnel Creation Blueprint

This skill guides the creation of a new sales funnel for Inner Wealth Initiate. Use this when the user says "create a funnel for [product]" or similar.

---

## Pre-Flight Checklist

Before creating a funnel, gather the following information from the user:

### 1. Funnel Identity
| Variable | Example | User Value |
|----------|---------|------------|
| Funnel Name | "Havana Funnel" | |
| Funnel Slug | `havana` | |
| Subdomain | `offer` or `wealth` | |
| Target Domain | `offer.innerwealthinitiate.com` | |

### 2. Products (fill in what applies)

#### Front-End Offer (Required)
| Variable | Example | User Value |
|----------|---------|------------|
| Product Name | "Resistance Mapping Guide™" | |
| Product Slug | `resistance-mapping-guide` | |
| Price | $7.00 | |
| Original Price (crossed out) | $29.95 | |
| Stripe Price ID | `price_xxx` | |
| Short Description | "Map your inner blocks" | |

#### Order Bump (Optional)
| Variable | Example | User Value |
|----------|---------|------------|
| Product Name | "Golden Thread Technique" | |
| Product Slug | `golden-thread-technique` | |
| Price | $27.00 | |
| Stripe Price ID | `price_xxx` | |
| Short Description | "Advanced technique add-on" | |

#### Upsell 1 (Optional)
| Variable | Example | User Value |
|----------|---------|------------|
| Product Name | "The Pathless Path™" | |
| Product Slug | `pathless-path` | |
| Price | $97.00 | |
| Stripe Price ID | `price_xxx` | |
| Type | Course / Program / Bundle | |

#### Downsell 1 (If Upsell 1 exists)
| Variable | Example | User Value |
|----------|---------|------------|
| Product Name | "Nervous System Reset Kit™" | |
| Product Slug | `nervous-system-reset` | |
| Price | $27.00 | |
| Stripe Price ID | `price_xxx` | |
| Type | Lite version / Different product | |

#### Upsell 2 (Optional)
| Variable | Example | User Value |
|----------|---------|------------|
| Product Name | "Bridge to Mastery™" | |
| Product Slug | `bridge-to-mastery` | |
| Price | $14.95 | |
| Type | Coaching call / Subscription / Add-on | |
| External URL (if applicable) | Discovery call booking link | |

### 3. Funnel Flow
Define the navigation path:

```
Default Flow:
/product → /checkout → /upsell-1 → /downsell-1 (if declined) → /upsell-2 → /thank-you
                            ↓
                       /upsell-2 (if accepted)
```

Custom flow (if different):
```
[User defines their flow here]
```

---

## Implementation Steps

### Step 1: Stripe Setup (Manual)
User must complete in Stripe Dashboard:

1. **Create Products:**
   - [ ] Front-end product
   - [ ] Order bump product (if applicable)
   - [ ] Upsell 1 product (if applicable)
   - [ ] Downsell 1 product (if applicable)
   - [ ] Upsell 2 product (if applicable)

2. **Create Prices:**
   - [ ] One-time price for each product
   - [ ] Copy Price IDs for `.env`

3. **Webhook Configuration:**
   - [ ] Add endpoint: `https://[domain]/api/webhook`
   - [ ] Select events: `checkout.session.completed`, `payment_intent.succeeded`

### Step 2: Environment Variables
Add to `.env.local` and Vercel:

```bash
# Stripe Price IDs (update for this funnel)
STRIPE_FRONTEND_PRICE_ID=price_xxx          # Front-end offer
STRIPE_ORDER_BUMP_PRICE_ID=price_xxx        # Order bump
STRIPE_UPSELL_1_PRICE_ID=price_xxx          # Upsell 1
STRIPE_DOWNSELL_1_PRICE_ID=price_xxx        # Downsell 1
STRIPE_UPSELL_2_PRICE_ID=price_xxx          # Upsell 2

# Klaviyo Lists (create in Klaviyo first)
KLAVIYO_[PRODUCT_SLUG]_LIST_ID=xxx          # Buyer list for front-end
KLAVIYO_[UPSELL_SLUG]_LIST_ID=xxx           # Buyer list for upsell
```

### Step 3: Database Setup (Supabase)
Add products to `products` table:

```sql
-- Front-end offer
INSERT INTO products (name, slug, price_cents, portal_price_cents, description)
VALUES ('[Product Name]', '[product-slug]', 700, 2995, '[Description]');

-- Order bump
INSERT INTO products (name, slug, price_cents, portal_price_cents, description)
VALUES ('[Product Name]', '[product-slug]', 2700, 2700, '[Description]');

-- Upsell 1
INSERT INTO products (name, slug, price_cents, portal_price_cents, description)
VALUES ('[Product Name]', '[product-slug]', 9700, 9700, '[Description]');

-- Continue for other products...
```

### Step 4: Create Funnel Pages

#### Files to Create/Modify:

| Route | File | Purpose |
|-------|------|---------|
| `/product` | `src/app/product/page.tsx` | Sales page |
| `/checkout` | `src/app/checkout/page.tsx` | Stripe checkout |
| `/upsell-1` | `src/app/upsell-1/page.tsx` | First upsell |
| `/downsell-1` | `src/app/downsell-1/page.tsx` | Downsell (if upsell declined) |
| `/upsell-2` | `src/app/upsell-2/page.tsx` | Second upsell |
| `/thank-you` | `src/app/thank-you/page.tsx` | Confirmation + account creation |

#### For Each Page, Replace:

**Product Page (`/product/page.tsx`):**
- [ ] Product name (appears ~5 times)
- [ ] Price display ($X.XX and ~~$XX.XX~~)
- [ ] Product description/benefits
- [ ] Feature list items
- [ ] FAQ content
- [ ] Testimonials
- [ ] Product images (6 images typically)
- [ ] CTA button text

**Checkout Page (`/checkout/page.tsx`):**
- [ ] Product name in cart
- [ ] Price in cart
- [ ] Order bump name
- [ ] Order bump price
- [ ] Order bump description
- [ ] "What You'll Receive" section
- [ ] Testimonials
- [ ] Product images
- [ ] **CRITICAL:** Ensure `handleSubmit` calls `/api/update-payment-intent` with real customer email/name BEFORE `stripe.confirmPayment()`

**Upsell 1 (`/upsell-1/page.tsx`):**
- [ ] Product name
- [ ] Price ($XX)
- [ ] Hero headline
- [ ] Progress steps (Step 1 of 3, etc.)
- [ ] All section copy
- [ ] Feature list/layers
- [ ] Comparison table
- [ ] Testimonials
- [ ] Images (hero, icons, mockups)
- [ ] Accept/decline navigation URLs

**Downsell 1 (`/downsell-1/page.tsx`):**
- [ ] Product name
- [ ] Price
- [ ] Hero headline ("Wait! Before you go...")
- [ ] All section copy
- [ ] Feature list
- [ ] Images
- [ ] Accept/decline navigation URLs

**Upsell 2 (`/upsell-2/page.tsx`):**
- [ ] Product name
- [ ] Price
- [ ] Hero content
- [ ] Video embed ID (if applicable)
- [ ] External URL (discovery call, etc.)
- [ ] Accept/decline navigation URLs

**Thank You Page (`/thank-you/page.tsx`):**
- [ ] Confirmation messaging
- [ ] Next steps content
- [ ] YouTube channel link (if applicable)
- [ ] Account creation instructions

### Step 5: Update API Routes

#### `/api/checkout/route.ts`
Update:
- [ ] `success_url` path (if flow differs)
- [ ] Price ID references
- [ ] Product metadata

#### `/api/upsell/route.ts`
Update the switch statement for each upsell type:

```typescript
case 'upsell-1':
  priceAmount = [PRICE_IN_CENTS];
  productName = '[Product Name]';
  productSlug = '[product-slug]';
  acceptedEvent = FunnelEvents.UPSELL_1_ACCEPTED;
  declinedEvent = FunnelEvents.UPSELL_1_DECLINED;
  break;

case 'downsell-1':
  priceAmount = [PRICE_IN_CENTS];
  productName = '[Product Name]';
  productSlug = '[product-slug]';
  acceptedEvent = FunnelEvents.DOWNSELL_1_ACCEPTED;
  declinedEvent = FunnelEvents.DOWNSELL_1_DECLINED;
  break;

case 'upsell-2':
  priceAmount = [PRICE_IN_CENTS];
  productName = '[Product Name]';
  productSlug = '[product-slug]';
  acceptedEvent = FunnelEvents.UPSELL_2_ACCEPTED;
  declinedEvent = FunnelEvents.UPSELL_2_DECLINED;
  break;
```

#### `/api/webhook/route.ts`
Update:
- [ ] Product slug for access granting
- [ ] Shopify order tags
- [ ] Klaviyo list assignments
- [ ] Meta CAPI event URLs

**CRITICAL:** The webhook must handle BOTH event types:
- `checkout.session.completed` - For Stripe Checkout Session flows
- `payment_intent.succeeded` - For PaymentIntent/Stripe Elements flows (like the current checkout)

The `payment_intent.succeeded` handler should:
1. Check `paymentIntent.metadata.product` to identify the purchase
2. Get customer email from: metadata → customer object → charge billing_details (fallback chain)
3. Process all integrations: Klaviyo, Meta CAPI, Shopify, Supabase access

### Step 6: Analytics Setup

#### GA4 Events (in page components)
Each page should track:

| Page | Events |
|------|--------|
| `/product` | `view_item` with product details |
| `/checkout` | `checkout_view`, `checkout_started`, `order_bump_added/removed` |
| `/upsell-1` | `upsell_view`, `upsell_accepted`, `upsell_declined` |
| `/downsell-1` | `downsell_view`, `downsell_accepted`, `downsell_declined` |
| `/upsell-2` | `upsell_view`, `upsell_accepted`, `upsell_declined` |
| `/thank-you` | `funnel_completed` with total value |

#### Klaviyo Events (`/lib/klaviyo.ts`)
Update `FunnelEvents` and `FunnelLists`:

```typescript
export const FunnelEvents = {
  ORDER_COMPLETED: 'Order Completed',
  UPSELL_1_ACCEPTED: 'Upsell 1 Accepted',
  UPSELL_1_DECLINED: 'Upsell 1 Declined',
  DOWNSELL_1_ACCEPTED: 'Downsell 1 Accepted',
  DOWNSELL_1_DECLINED: 'Downsell 1 Declined',
  UPSELL_2_ACCEPTED: 'Upsell 2 Accepted',
  UPSELL_2_DECLINED: 'Upsell 2 Declined',
};

export const FunnelLists = {
  CUSTOMERS: process.env.KLAVIYO_CUSTOMERS_LIST_ID,
  [PRODUCT_SLUG]_BUYERS: process.env.KLAVIYO_[PRODUCT_SLUG]_LIST_ID,
};
```

#### Meta Pixel (`/lib/meta-pixel.ts`)
Events are generic but ensure domain URLs are correct in:
- `/api/upsell/route.ts` (Meta CAPI `eventSourceUrl`)

### Step 7: Images Required

Create image assets and place in `/public/images/Products/[FunnelName]/`:

#### Product Page (6 images minimum)
```
/public/images/Products/[FunnelName]/
├── hero-product.png          # Main product hero
├── whats-inside-product.png  # Product spread/contents
├── feature-1.png             # Feature highlight 1
├── feature-2.png             # Feature highlight 2
├── feature-3.png             # Feature highlight 3
└── bonus-item.png            # Order bump preview
```

#### Upsell 1 (8-10 images)
```
/public/images/Products/[FunnelName]/Upsell1/
├── hero-main.png             # Hero image
├── portal-mockup.png         # Portal/course preview
├── product-bundle.png        # Bundle image
├── icon-1.png through icon-6.png  # Feature icons
└── walter-profile.png        # Instructor/author photo
```

#### Downsell 1 (6-8 images)
```
/public/images/Products/[FunnelName]/Downsell1/
├── hero-main.png
├── portal-mockup.png
├── icon-1.png through icon-6.png
└── walter-profile.png
```

**IMPORTANT:** Add all images to git:
```bash
git add public/images/Products/[FunnelName]/*
```

---

## Page Templates

### Standard Funnel Page Structure

```tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSessionId } from "@/hooks/useSessionId";
import { ga4 } from "@/lib/ga4";

function PageContent() {
  const sessionId = useSessionId();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Track page view
    ga4.pageView();
    // ga4.upsellView(1, 'Product Name', 97.00);
  }, []);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/upsell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          upsellType: "upsell-1",
          action: "accept",
        }),
      });

      if (response.ok) {
        ga4.upsellAccepted(1, 'Product Name', 97.00);
        window.location.href = `/upsell-2?session_id=${sessionId}`;
      }
    } catch (error) {
      console.error("Error:", error);
      setIsProcessing(false);
    }
  };

  const handleDecline = () => {
    ga4.upsellDeclined(1, 'Product Name', 97.00);
    window.location.href = `/downsell-1?session_id=${sessionId}`;
  };

  return (
    <div className="min-h-screen bg-[#1a1512] text-white">
      {/* Header - Logo only, no navigation */}
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

      {/* Page Content */}
      <main>
        {/* Hero Section */}
        {/* Features Section */}
        {/* Social Proof Section */}
        {/* CTA Section */}
      </main>

      {/* Footer - Legal links only */}
      <footer className="py-8 px-4 bg-black text-center">
        <div className="flex justify-center gap-6 text-sm text-gray-400">
          <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white">Terms of Service</Link>
          <Link href="/refund" className="hover:text-white">Refund Policy</Link>
        </div>
      </footer>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1a1512]" />}>
      <PageContent />
    </Suspense>
  );
}
```

### Checkout Page PaymentIntent Pattern (CRITICAL)

When using Stripe Elements (not Checkout Sessions), you MUST update the PaymentIntent with customer data before confirming payment:

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // CRITICAL: Update PaymentIntent with real customer data BEFORE confirming
  const updateResponse = await fetch("/api/update-payment-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      paymentIntentId,
      includeOrderBump,
      email: formData.email,      // Real email from form
      fullName: formData.fullName, // Real name from form
    }),
  });

  if (!updateResponse.ok) {
    throw new Error("Failed to update payment details");
  }

  // NOW confirm payment - Stripe has the real customer attached
  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: `${window.location.origin}/upsell-1`,
      payment_method_data: {
        billing_details: {
          name: formData.fullName,
          email: formData.email,
        },
      },
    },
  });
};
```

**Why this is critical:** The PaymentIntent is created when the page loads (before the user enters their email). If you don't update it with real customer data, the webhook will have no email to process and:
- No Supabase profile will be created
- No Meta CAPI Purchase event will fire
- No Klaviyo/Shopify sync will occur
- Customer can't access their purchase

### Standard CTA Button

```tsx
<button
  onClick={handleAccept}
  disabled={isProcessing}
  className="w-full py-4 px-8 bg-[#ee5d0b] hover:bg-[#ff6d1b] text-white font-bold text-lg rounded-lg transition-colors disabled:opacity-50"
>
  {isProcessing ? "Processing..." : "Yes! Add To My Order"}
</button>

{/* Decline link */}
<button
  onClick={handleDecline}
  className="mt-4 text-gray-400 hover:text-white text-sm underline"
>
  No thanks, I'll pass on this offer
</button>
```

---

## Style Guide Reference

| Element | Value |
|---------|-------|
| Body font | Inter (default) |
| Heading font | Playfair Display (`font-serif italic`) |
| Primary gold | `#d4a574` |
| Dark background | `#1a1512` |
| Orange accent (CTA) | `#ee5d0b` |
| Text on dark | `text-white`, `text-gray-300`, `text-gray-400` |

---

## Testing Checklist

Before launch:

- [ ] Complete checkout flow works (test with Stripe test mode)
- [ ] Session ID persists through all pages
- [ ] Accept path works for all upsells
- [ ] Decline path works for all upsells
- [ ] Product access granted correctly in Supabase
- [ ] Klaviyo events firing
- [ ] GA4 events firing (check console for "[GA4]" logs)
- [ ] Meta Pixel events firing
- [ ] Shopify orders syncing (if enabled)
- [ ] Legal pages accessible from footer
- [ ] Mobile responsive
- [ ] Images loading correctly (check Linux case sensitivity)

---

## Quick Reference: Files to Modify

| Purpose | File Path |
|---------|-----------|
| Product page | `src/app/product/page.tsx` |
| Checkout page | `src/app/checkout/page.tsx` |
| Upsell 1 | `src/app/upsell-1/page.tsx` |
| Downsell 1 | `src/app/downsell-1/page.tsx` |
| Upsell 2 | `src/app/upsell-2/page.tsx` |
| Thank you | `src/app/thank-you/page.tsx` |
| Checkout API | `src/app/api/checkout/route.ts` |
| Upsell API | `src/app/api/upsell/route.ts` |
| Webhook API | `src/app/api/webhook/route.ts` |
| Klaviyo events | `src/lib/klaviyo.ts` |
| GA4 tracking | `src/lib/ga4.ts` |
| Meta Pixel | `src/lib/meta-pixel.ts` |
| Style guide | `src/styles/style-guide.ts` |
