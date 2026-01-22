# Inner Wealth Initiate Funnel - Karpathy-Style Testing Protocol

## Philosophy
> "The most important thing is to get the simplest thing working first, and to verify it's working by actually looking at the outputs - not by checking if the code ran without errors."
> — Andrej Karpathy's approach, adapted for funnel testing

**Core Principles:**
1. **Become one with the data** - Inspect actual outputs in every system, not just UI feedback
2. **Overfit first** - Get ONE complete flow working perfectly before testing variations
3. **One variable at a time** - Never change multiple things between verification steps
4. **Never trust, always verify** - Check every integration point manually
5. **Ablation mindset** - When something fails, isolate by removing variables

---

## Pre-Flight: Become One With The Funnel

Before executing any test, open these dashboards in separate tabs. You will check EACH ONE after every step.

### Required Dashboard Tabs
1. **Stripe Dashboard** → Payments (filter: last 1 hour)
2. **Stripe Dashboard** → Webhooks → Recent deliveries
3. **Supabase** → Table Editor → `users` table
4. **Supabase** → Table Editor → `purchases` table
5. **Meta Events Manager** → Test Events (use test event code if available)
6. **Klaviyo** → Profiles (search by test email)
7. **Shopify Admin** → Orders (filter: last 1 hour)
8. **Hotjar** → Recordings (filter: last 1 hour)
9. **Browser DevTools** → Network tab (filter: `facebook`, `fbevents`)
10. **Meta Pixel Helper** Chrome extension (enabled)

### Test Identity
Create a unique test identity for this session:
```
Email: test+funnel{YYYYMMDD_HHMM}@yourdomain.com
Name: Test Karpathy
```
Write this down. You will search for it in every system.

---

## Test 1: The Simplest Path (Base Purchase Only)

> "Overfit to one example first. Get it working perfectly before adding any complexity."

### Step 1.1: Navigate Landing → Product → Checkout

**Actions:**
1. Open `https://offer.innerwealthinitiate.com/` on mobile device (or mobile emulator)
2. Scroll through entire page - verify no horizontal scroll, all content visible
3. Click main CTA → Should navigate to `/product`
4. Scroll through product page - verify image gallery works, testimonials scroll
5. Click "Add to Cart" → Should navigate to `/checkout`

**Verify in Browser:**
- [ ] Meta Pixel Helper shows: `PageView` on each page
- [ ] Meta Pixel Helper shows: `ViewContent` on landing and product pages
- [ ] Network tab shows requests to `facebook.com/tr`
- [ ] No console errors

**Record observations:**
```
Landing PageView fired: YES/NO
Product ViewContent fired: YES/NO
Console errors: NONE / [describe]
```

### Step 1.2: Complete Checkout (NO Order Bump)

**Actions:**
1. On `/checkout`, verify order bump is NOT selected (unchecked)
2. Confirm total shows **$7.00**
3. Enter test identity:
   - Name: `Test Karpathy`
   - Email: `test+funnel{timestamp}@yourdomain.com`
4. Enter test card: `4242 4242 4242 4242`, any future expiry, any CVC
5. Click "Complete Order"
6. **STOP** - Do not click anything else yet

**Verify in Browser (before clicking anything):**
- [ ] Meta Pixel Helper shows: `InitiateCheckout` fired on page load
- [ ] URL changed to `/upsell-1?session_id=cs_...`
- [ ] Session ID is present in URL

**Verify in Stripe Dashboard (Payments):**
- [ ] New payment of **$7.00** appears
- [ ] Status: `Succeeded`
- [ ] Customer email matches test identity
- [ ] Metadata shows `includeOrderBump: false`

**Verify in Stripe Dashboard (Webhooks):**
- [ ] `checkout.session.completed` event sent
- [ ] Response: `200 OK`
- [ ] Click into event → verify payload contains correct email and amount

**Verify in Supabase (`users` table):**
- [ ] New row with test email exists
- [ ] `full_name` = "Test Karpathy"

**Verify in Supabase (`purchases` table):**
- [ ] New row with `product_slug` = "resistance-mapping-guide"
- [ ] `user_id` links to correct user
- [ ] `stripe_session_id` matches URL session_id

**Verify in Meta Events Manager:**
- [ ] `Purchase` event received (server-side)
- [ ] Value: `7.00`
- [ ] `content_category`: `checkout`
- [ ] `content_ids` contains: `resistance-mapping-guide`

**Verify in Klaviyo:**
- [ ] Profile exists with test email
- [ ] Property `purchased_resistance_map` = true
- [ ] Event `Order Completed` logged with value $7

**Verify in Shopify Admin:**
- [ ] Order created with test email
- [ ] Line item: "Resistance Mapping Guide™ - Expanded 2nd Edition" @ $7.00
- [ ] Tags include: `resistance-map`, `funnel-order`

**Verify in Hotjar:**
- [ ] Recording started for this session (may take a few minutes to appear)

**Record observations:**
```
Stripe payment $7.00: YES/NO
Stripe webhook 200: YES/NO
Supabase user created: YES/NO
Supabase purchase created: YES/NO
Meta CAPI Purchase (checkout): YES/NO
Klaviyo profile + event: YES/NO
Shopify order: YES/NO
```

### Step 1.3: Decline All Upsells → Thank You

**Actions:**
1. On `/upsell-1`, click "No thanks, I don't want..."
2. Verify navigation to `/downsell-1?session_id=cs_...`
3. On `/downsell-1`, click "No thanks..."
4. Verify navigation to `/upsell-2?session_id=cs_...`
5. On `/upsell-2`, click "No thanks, I don't want personal guidance"
6. Verify navigation to `/thank-you?session_id=cs_...`

**Verify on Thank You Page:**
- [ ] "Thank You!" heading displays
- [ ] Email confirmation shows test email
- [ ] Order table shows:
  - Resistance Mapping Guide™ - $7.00
  - Total: $7.00
- [ ] "Access Your Portal" button is visible

**Verify in Browser:**
- [ ] Meta Pixel Helper shows: `CompleteRegistration` event
- [ ] Value matches order total ($7.00)

**Verify in Klaviyo:**
- [ ] Events logged: `Upsell 1 Declined`, `Downsell 1 Declined`

**Verify NO additional charges:**
- [ ] Stripe Dashboard shows only ONE payment ($7.00) for this customer
- [ ] Supabase `purchases` table has only ONE row for this user

**Record observations:**
```
Flow: Upsell1 → Downsell1 → Upsell2 → ThankYou: CORRECT/INCORRECT
Thank you shows $7.00 total: YES/NO
CompleteRegistration fired: YES/NO
No extra Stripe charges: CONFIRMED
No extra Supabase purchases: CONFIRMED
```

### Step 1.4: Verify Portal Access

**Actions:**
1. Click "Access Your Portal & Products"
2. Should navigate to `/login` or `/portal`
3. If login required, use test email to verify account exists

**Verify:**
- [ ] User can access portal
- [ ] "Resistance Mapping Guide" product is accessible

---

## Test 2: Add One Variable - Order Bump

> "Only add complexity once the simple case is verified. Change exactly one thing."

**New Test Identity:**
```
Email: test+bump{YYYYMMDD_HHMM}@yourdomain.com
Name: Test Bump
```

### Step 2.1: Checkout WITH Order Bump

**Actions:**
1. Navigate: Landing → Product → Checkout
2. **Toggle Order Bump ON** (checkbox selected)
3. Verify total updates to **$34.00** ($7 + $27)
4. Complete checkout with new test identity

**Verify in Browser:**
- [ ] Meta Pixel Helper shows: `AddToCart` event when bump toggled ON
- [ ] `content_name` includes "Golden Thread"

**Verify in Stripe Dashboard:**
- [ ] Payment amount: **$34.00**
- [ ] Metadata: `includeOrderBump: true`

**Verify in Supabase (`purchases` table):**
- [ ] TWO rows for this user:
  - `product_slug` = "resistance-mapping-guide"
  - `product_slug` = "golden-thread-technique"

**Verify in Meta Events Manager:**
- [ ] `Purchase` event with value: `34.00`
- [ ] `content_ids` contains BOTH: `resistance-mapping-guide`, `golden-thread-technique`

**Verify in Shopify:**
- [ ] Order has TWO line items:
  - Resistance Mapping Guide @ $7.00
  - Golden Thread Technique @ $27.00
- [ ] Total: $34.00

**Decline all upsells, verify Thank You:**
- [ ] Order table shows both products
- [ ] Total: $34.00

**Record observations:**
```
Order bump adds $27: YES/NO
Stripe total $34: YES/NO
Both products in Supabase: YES/NO
Both products in Meta CAPI: YES/NO
Both products in Shopify: YES/NO
AddToCart event fired: YES/NO
```

---

## Test 3: Add One Variable - Upsell 1 Accept

> "Now that checkout works perfectly with and without bump, test ONE upsell."

**New Test Identity:**
```
Email: test+upsell1{YYYYMMDD_HHMM}@yourdomain.com
Name: Test Upsell
```

### Step 3.1: Checkout → Accept Upsell 1

**Actions:**
1. Complete checkout ($7, no bump)
2. On `/upsell-1`, click "Yes - Add The Pathless Path™ to My Order"
3. **STOP** - Wait for processing, then verify before continuing

**Verify in Browser:**
- [ ] Button shows loading state during processing
- [ ] Navigation to `/upsell-2?session_id=...` after success

**Verify in Stripe Dashboard:**
- [ ] TWO payments for this customer:
  - $7.00 (original checkout)
  - $97.00 (upsell charge)
- [ ] Second payment description mentions "Pathless Path"

**Verify in Supabase (`purchases` table):**
- [ ] TWO rows for this user:
  - `product_slug` = "resistance-mapping-guide"
  - `product_slug` = "pathless-path"

**Verify in Meta Events Manager:**
- [ ] TWO `Purchase` events:
  - First: value `7.00`, `content_category`: `checkout`
  - Second: value `97.00`, `content_category`: `upsell`

**Verify in Klaviyo:**
- [ ] Event: `Upsell 1 Accepted` with value $97

**Verify in Shopify:**
- [ ] TWO orders for this customer (or one order with upsell line item)

**Continue to Thank You (skip Upsell 2):**
- [ ] Order total reflects: $7 + $97 = **$104**

**Record observations:**
```
Upsell 1 charge $97: YES/NO
Second Stripe payment: YES/NO
pathless-path in Supabase: YES/NO
Meta CAPI upsell category: YES/NO
Klaviyo Upsell 1 Accepted: YES/NO
```

---

## Test 4: Add One Variable - Downsell 1 Accept

> "Test the alternative path: decline upsell 1, accept downsell."

**New Test Identity:**
```
Email: test+downsell{YYYYMMDD_HHMM}@yourdomain.com
Name: Test Downsell
```

### Step 4.1: Checkout → Decline Upsell 1 → Accept Downsell 1

**Actions:**
1. Complete checkout ($7, no bump)
2. On `/upsell-1`, click "No thanks..."
3. On `/downsell-1`, click "Yes - Add The Nervous System Reset Kit™ to My Order"
4. **STOP** - Verify before continuing

**Verify in Stripe Dashboard:**
- [ ] TWO payments:
  - $7.00 (checkout)
  - $27.00 (downsell)

**Verify in Supabase:**
- [ ] `product_slug` = "nervous-system-reset" exists

**Verify in Meta Events Manager:**
- [ ] `Purchase` with value `27.00` and `content_category`: `downsell`

**Verify in Klaviyo:**
- [ ] Event: `Upsell 1 Declined`
- [ ] Event: `Downsell 1 Accepted` with value $27

**Continue to Thank You:**
- [ ] Total: $7 + $27 = **$34**

**Record observations:**
```
Downsell charge $27: YES/NO
Meta CAPI downsell category: YES/NO
Klaviyo events correct: YES/NO
```

---

## Test 5: Maximum Revenue Path (Full Acceptance)

> "Now combine all verified components into the maximum revenue path."

**New Test Identity:**
```
Email: test+maxrev{YYYYMMDD_HHMM}@yourdomain.com
Name: Test Maximum
```

### Step 5.1: Everything Accepted

**Actions:**
1. Checkout WITH order bump ($34)
2. Accept Upsell 1 ($97)
3. On Upsell 2, click "Book a Discovery Call" → verify LunaCal opens
4. Return to funnel, click "No thanks" to reach Thank You

**Verify final state:**

**Stripe:**
- [ ] Total charges: $34 + $97 = **$131**

**Supabase (`purchases`):**
- [ ] THREE products:
  - resistance-mapping-guide
  - golden-thread-technique
  - pathless-path

**Meta Events Manager:**
- [ ] THREE `Purchase` events with correct categories and values

**Klaviyo:**
- [ ] All acceptance events logged

**Thank You Page:**
- [ ] Displays all products purchased
- [ ] Total: $131

---

## Test 6: Responsive Verification

> "Now that functionality is proven, verify the visual layer."

Using the SAME working flow (Test 1 path), verify on each device:

### Device Checklist
For EACH device, run through: Landing → Product → Checkout → Upsell 1 → Thank You

| Device | No H-Scroll | CTAs Visible | Forms Usable | Videos Play |
|--------|-------------|--------------|--------------|-------------|
| iPhone SE (375px) | [ ] | [ ] | [ ] | [ ] |
| iPhone 14 (390px) | [ ] | [ ] | [ ] | [ ] |
| iPad (768px) | [ ] | [ ] | [ ] | [ ] |
| Desktop (1280px) | [ ] | [ ] | [ ] | [ ] |

**Key checks per page:**
- Landing: Hero CTA accessible, testimonial carousel works
- Product: Image gallery swipes, "Add to Cart" button visible
- Checkout: Form fields usable with mobile keyboard, order bump toggle accessible
- Upsells: Accept/Decline buttons clearly visible and tappable
- Thank You: Order table readable, portal button accessible

---

## Test 7: Error Path Verification

> "Verify graceful failure modes."

### 7.1: Payment Decline
1. Use card: `4000 0000 0000 0002`
2. Verify: Error message displays, user can retry

### 7.2: Direct URL Access
1. Navigate directly to `/upsell-1` (no session_id)
2. Verify: Page handles gracefully (redirect or error message)

### 7.3: Expired Session
1. Wait 24+ hours with a session_id, try to access upsell
2. Verify: Graceful handling

---

## Test Completion Checklist

### All Tests Passed
- [ ] Test 1: Base purchase ($7) - all integrations verified
- [ ] Test 2: Order bump ($34) - adds one variable
- [ ] Test 3: Upsell 1 accept ($97) - one-click charge works
- [ ] Test 4: Downsell 1 accept ($27) - alternative path works
- [ ] Test 5: Maximum revenue ($131) - full stack integration
- [ ] Test 6: Responsive - all devices
- [ ] Test 7: Error handling

### Integration Verification Summary
| System | Test 1 | Test 2 | Test 3 | Test 4 | Test 5 |
|--------|--------|--------|--------|--------|--------|
| Stripe Payment | [ ] | [ ] | [ ] | [ ] | [ ] |
| Stripe Webhook | [ ] | [ ] | [ ] | [ ] | [ ] |
| Supabase User | [ ] | [ ] | [ ] | [ ] | [ ] |
| Supabase Purchase | [ ] | [ ] | [ ] | [ ] | [ ] |
| Meta Pixel (client) | [ ] | [ ] | [ ] | [ ] | [ ] |
| Meta CAPI (server) | [ ] | [ ] | [ ] | [ ] | [ ] |
| Klaviyo Profile | [ ] | [ ] | [ ] | [ ] | [ ] |
| Klaviyo Events | [ ] | [ ] | [ ] | [ ] | [ ] |
| Shopify Order | [ ] | [ ] | [ ] | [ ] | [ ] |
| Hotjar Recording | [ ] | [ ] | [ ] | [ ] | [ ] |

---

## Sign-Off

**Tested By:** _______________
**Date:** _______________
**Total Test Identities Created:** _______________
**All Integrations Verified:** YES / NO
**Ready for Live Traffic:** YES / NO

### Notes on Issues Found
```
[Document any issues, their severity, and resolution status]
```
