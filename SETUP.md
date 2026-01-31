# Member Portal Setup Guide

This guide walks you through setting up a new member portal from this template.

## Prerequisites

Before starting, you'll need accounts with:

| Service | Purpose | Sign Up |
|---------|---------|---------|
| **Supabase** | Database & Auth | [supabase.com](https://supabase.com) |
| **Stripe** | Payments | [stripe.com](https://stripe.com) |
| **Vercel** | Hosting | [vercel.com](https://vercel.com) |
| **Klaviyo** (optional) | Email Marketing | [klaviyo.com](https://klaviyo.com) |
| **Meta Business** (optional) | Ad Tracking | [business.facebook.com](https://business.facebook.com) |
| **Google Analytics** (optional) | Analytics | [analytics.google.com](https://analytics.google.com) |
| **Bunny.net** (optional) | Video Hosting | [bunny.net](https://bunny.net) |

---

## Quick Start

### 1. Clone & Install

```bash
# Clone the repository
git clone [your-repo-url]
cd [project-name]

# Install dependencies
npm install

# Copy environment template
cp .env.template .env.local
```

### 2. Set Up Supabase

1. **Create a new project** at [supabase.com/dashboard](https://supabase.com/dashboard)
2. **Run the database migrations**:
   - Go to SQL Editor in your Supabase dashboard
   - Run each migration file from `supabase/migrations/` in order
3. **Get your API keys**:
   - Go to Project Settings > API
   - Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
4. **Configure Auth**:
   - Go to Authentication > URL Configuration
   - Set Site URL to your production domain
   - Add redirect URLs for your domains

### 3. Set Up Stripe

1. **Create products** in the Stripe Dashboard:
   - Go to Products > Add Product
   - Create each product/price for your funnel
2. **Get API keys**:
   - Go to Developers > API Keys
   - Copy Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Copy Secret key → `STRIPE_SECRET_KEY`
3. **Set up webhook**:
   - Go to Developers > Webhooks
   - Add endpoint: `https://your-domain.com/api/webhook`
   - Select events: `payment_intent.succeeded`, `checkout.session.completed`
   - Copy Signing secret → `STRIPE_WEBHOOK_SECRET`
4. **Add Price IDs** to your `.env.local`

### 4. Customize Branding

Update these files with your brand:

```bash
# Brand configuration (name, domains, contact info)
src/config/brand.ts

# Colors and typography
src/styles/style-guide.ts

# Logo and images
public/logo.png
public/images/
```

See [File Reference](#file-reference) below for details on each file.

### 5. Deploy to Vercel

1. **Connect your repository** to Vercel
2. **Add environment variables**:
   - Go to Project Settings > Environment Variables
   - Add all variables from your `.env.local`
3. **Configure domains**:
   - Add your custom domain(s)
   - Set up subdomains if using (offer.*, portal.*)
4. **Deploy**!

---

## File Reference

| File | Purpose | When to Edit |
|------|---------|--------------|
| `src/config/brand.ts` | Brand name, domains, contact info, social links | Always - first file to update |
| `src/styles/style-guide.ts` | Colors, typography, component styles | Always - customize colors and fonts |
| `.env.local` | API keys and secrets | Always - add your service credentials |
| `public/logo.png` | Main logo | Always - replace with your logo |
| `public/og-image.jpg` | Social sharing image | Always - create branded OG image |
| `public/favicon.ico` | Browser tab icon | Always - replace with your icon |
| `public/images/` | Product and lifestyle images | Always - add your images |
| `CLAUDE.md` | AI assistant context | Recommended - update with your specifics |
| `middleware.ts` | Domain routing | Only if changing domain structure |
| `src/app/layout.tsx` | Fonts, meta tags | If changing fonts or global meta |

---

## Files with Brand References

These files contain hardcoded brand references that should be updated. Use **Find & Replace** in your editor to update these quickly.

**Search for:** `Inner Wealth Initiate`, `innerwealthinitiate`

### High Priority (User-Facing)

| File | What to Update |
|------|----------------|
| `src/app/privacy/page.tsx` | Company name, email throughout |
| `src/app/terms/page.tsx` | Company name, email throughout |
| `src/app/refund/page.tsx` | Support email |
| `src/app/contact/page.tsx` | Email address, social links |
| `src/app/thank-you/page.tsx` | Logo alt text, YouTube channel |
| `src/app/checkout/page.tsx` | Logo alt text, copyright |

### Portal Layouts (Meta Titles)

| File | What to Update |
|------|----------------|
| `src/app/portal/layout.tsx` | Page title |
| `src/app/portal/signup/layout.tsx` | Page title |
| `src/app/claim-account/layout.tsx` | Page title |
| `src/app/join/layout.tsx` | Page title |
| `src/app/dashboard/layout.tsx` | Page title |

### Funnel Pages (Logo Alt Text)

| File | What to Update |
|------|----------------|
| `src/app/upsell-1/page.tsx` | Logo alt text, portal URL |
| `src/app/downsell-1/page.tsx` | Logo alt text, portal URL |

### Marketing Content

| File | What to Update |
|------|----------------|
| `src/app/page.tsx` | Support email in FAQ |
| `src/app/media/page.tsx` | Social media URLs |

### Quick Find & Replace Commands

```bash
# Find all brand references
grep -r "Inner Wealth Initiate" src/
grep -r "innerwealthinitiate" src/

# Or use your editor's Find & Replace:
# 1. Search: Inner Wealth Initiate
#    Replace: Your Brand Name
#
# 2. Search: innerwealthinitiate.com
#    Replace: yourdomain.com
#
# 3. Search: info@innerwealthinitiate.com
#    Replace: support@yourdomain.com
```

---

## Domain Configuration

The portal supports multiple domain configurations:

### Option 1: Single Domain (Simplest)
- `yourdomain.com` - Everything on one domain
- `/` - Marketing/landing page
- `/checkout`, `/upsell-*` - Funnel pages
- `/portal` - Member area

### Option 2: Subdomains (Recommended)
- `yourdomain.com` - Marketing site
- `offer.yourdomain.com` - Sales funnel (distraction-free)
- `portal.yourdomain.com` - Member area

### Vercel Domain Setup
1. Go to Project Settings > Domains
2. Add each domain/subdomain
3. Update `src/config/brand.ts` with your domains
4. The middleware handles routing automatically

---

## Database Setup

### Running Migrations

Migrations are in `supabase/migrations/`. Run them in order:

1. Go to Supabase Dashboard > SQL Editor
2. Run each `.sql` file in numerical order
3. Or use Supabase CLI: `supabase db push`

### Key Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User accounts |
| `products` | Product catalog |
| `user_purchases` | Purchase records |
| `modules` | Course modules |
| `lessons` | Individual lessons |
| `lesson_progress` | User progress tracking |
| `funnel_events` | Analytics events |

### Adding Products

```sql
INSERT INTO products (slug, name, description, price_cents, portal_price_cents, is_lead_magnet)
VALUES
  ('main-product', 'Your Main Product', 'Description here', 700, 4900, false),
  ('order-bump', 'Order Bump Product', 'Description here', 2700, 2700, false);
```

---

## Stripe Webhook Events

Configure your Stripe webhook to send these events:

| Event | Purpose |
|-------|---------|
| `payment_intent.succeeded` | Process purchases, grant access |
| `checkout.session.completed` | Alternative checkout flow |

---

## Optional Integrations

### Klaviyo (Email Marketing)
1. Get API key from Account > Settings > API Keys
2. Create a list for new subscribers
3. Add `KLAVIYO_API_KEY` and `KLAVIYO_LIST_ID` to env

### Meta Conversions API
1. Set up Pixel in Meta Business Manager
2. Generate CAPI access token
3. Add `NEXT_PUBLIC_META_PIXEL_ID` and `META_CAPI_ACCESS_TOKEN`

### Google Analytics 4
1. Create a GA4 property
2. Add `NEXT_PUBLIC_GA4_MEASUREMENT_ID`

### Bunny.net Video Hosting
1. Create a Stream library
2. Add `BUNNY_LIBRARY_ID`, `BUNNY_API_KEY`, `BUNNY_PULL_ZONE`

---

## Testing Checklist

Before going live, test:

- [ ] Checkout flow (test mode)
- [ ] Upsell/downsell pages
- [ ] Account creation (claim-account page)
- [ ] Portal login
- [ ] Product access after purchase
- [ ] Password reset flow
- [ ] Mobile responsiveness
- [ ] Email notifications (if using Klaviyo)
- [ ] Analytics tracking (if configured)

---

## Going Live

1. **Switch Stripe to live mode**:
   - Update API keys to live versions (`pk_live_*`, `sk_live_*`)
   - Create live webhook endpoint
   - Update price IDs to live versions

2. **Verify environment variables** in Vercel

3. **Test a real purchase** with a small amount

4. **Set up monitoring**:
   - Vercel deployment notifications
   - Stripe webhook failure alerts
   - Error tracking (optional: Sentry)

---

## Troubleshooting

### Common Issues

**"Table does not exist" errors**
- Run all migrations in Supabase SQL Editor

**Purchases not granting access**
- Check `SUPABASE_SERVICE_ROLE_KEY` is set
- Verify webhook is configured and receiving events
- Check Vercel function logs for errors

**Password reset not working**
- Verify Supabase redirect URLs include your domain
- Check Site URL in Supabase Auth settings

**Images not loading in production**
- Ensure images are committed to git
- Check file path casing (Linux is case-sensitive)

---

## Support

For issues with:
- **This template**: Open a GitHub issue
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Stripe**: [stripe.com/docs](https://stripe.com/docs)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
