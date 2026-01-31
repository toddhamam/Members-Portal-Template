# Setup Brand Skill

This skill helps you customize the member portal template for a new brand.

## When to Use

Use this skill when:
- Setting up a fresh instance of the portal template for a new brand
- The user says "setup brand", "configure brand", or "customize for [brand name]"

## Workflow

### Step 1: Gather Brand Information

Ask the user for:

1. **Brand name** (required)
   - Example: "Fitness Academy", "Business Mastery Pro"

2. **Brand tagline** (required)
   - Example: "Transform Your Body, Transform Your Life"

3. **Primary domain** (required)
   - Example: "fitnessacademy.com"

4. **Support email** (required)
   - Example: "support@fitnessacademy.com"

5. **Primary brand color** (optional, default: #d4a574)
   - Ask for hex code or color name
   - Example: "#3b82f6" (blue), "#10b981" (green)

6. **Social media links** (optional)
   - Instagram, Facebook, YouTube, etc.

### Step 2: Update Configuration Files

After gathering information, update these files:

#### 1. `src/config/brand.ts`

```typescript
export const brand = {
  name: '[BRAND_NAME]',
  tagline: '[TAGLINE]',
  legalName: '[BRAND_NAME] LLC',
  copyrightYear: 2024,
} as const;

export const domains = {
  marketing: '[DOMAIN]',
  funnel: 'offer.[DOMAIN]',
  portal: 'portal.[DOMAIN]',
} as const;

export const contact = {
  supportEmail: '[SUPPORT_EMAIL]',
  adminEmail: 'admin@[DOMAIN]',
} as const;

export const social = {
  instagram: '[INSTAGRAM_URL]',
  facebook: '[FACEBOOK_URL]',
  // ... other social links
} as const;
```

#### 2. `src/styles/style-guide.ts`

Update the brand colors section:

```typescript
export const branding = {
  name: '[BRAND_NAME]',
  tagline: '[TAGLINE]',
  brandColors: {
    primary: '[PRIMARY_COLOR]',  // User's chosen color
    // Derive complementary colors or ask user
  },
} as const;

export const colors = {
  accent: {
    gold: '[PRIMARY_COLOR]',     // Replace gold with primary
    goldDark: '[DARKER_VARIANT]', // Darken primary by ~10%
  },
  // ... rest of colors
} as const;
```

#### 3. `CLAUDE.md`

Update brand-specific references:
- Replace "Inner Wealth Initiate" with `[BRAND_NAME]`
- Replace domain references with `[DOMAIN]`
- Update product names if provided

### Step 3: Remind About Assets

After updating config files, remind the user:

```
Brand configuration updated! Next steps:

1. Replace logo: public/logo.png
2. Replace favicon: public/favicon.ico
3. Add OG image: public/og-image.jpg
4. Add product images to: public/images/Products/
5. Add instructor photo to: public/images/instructor/

See public/ASSETS.md for the full asset checklist.
```

### Step 4: Verify Changes

Run the development server and verify:
- Brand name appears in header
- Colors are applied correctly
- No broken references to old brand

## Example Interaction

```
User: Setup brand for Fitness Academy