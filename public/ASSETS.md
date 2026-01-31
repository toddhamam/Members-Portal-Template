# Brand Assets Checklist

Replace these assets with your brand's images before launching.

## Required Assets

### Logo & Branding

- [ ] **`/logo.png`** - Main logo (recommended: 400x100px, transparent PNG)
  - Used in: Header, footer, checkout page, emails

- [ ] **`/favicon.ico`** - Browser tab icon (32x32px or 16x16px)
  - Used in: Browser tabs, bookmarks

- [ ] **`/og-image.jpg`** - Social sharing image (1200x630px)
  - Used in: Facebook, Twitter, LinkedIn previews when sharing links

### Product Images

Located in `/images/Products/`:

- [ ] **Main product mockup** - Hero image for sales page
  - Recommended: 800x600px or larger
  - Show the product (ebook cover, course thumbnail, etc.)

- [ ] **Order bump image** - Small product image
  - Recommended: 400x300px
  - Used on checkout page

- [ ] **Upsell images** - Each upsell product needs imagery
  - Located in: `/images/Products/Upsell1/`, `/Upsell2/`, `/Downsell1/`
  - Include mockups and any bonus images

### Instructor/Creator

Located in `/images/instructor/`:

- [ ] **`headshot.jpg`** - Professional headshot
  - Recommended: 400x400px (square)
  - Used on: Sales page, about section, testimonial attribution

- [ ] **Action shots** (optional) - Teaching, presenting, lifestyle images
  - Used on: Sales page sections, about page

### Lifestyle Images

Located in `/images/Lifestyle/`:

- [ ] **Hero background** (if using image hero)
  - Recommended: 1920x1080px minimum

- [ ] **Section backgrounds** (optional)
  - Lifestyle imagery related to your product/niche

---

## Image Guidelines

### File Formats
- **Photos**: Use `.jpg` for best compression
- **Graphics/logos**: Use `.png` for transparency
- **Icons**: Use `.svg` when possible

### Optimization
- Compress images before uploading (use [squoosh.app](https://squoosh.app))
- Keep file sizes under 200KB when possible
- Use Next.js Image component for automatic optimization

### Naming Convention
- Use lowercase
- Use hyphens instead of spaces: `product-mockup.jpg`
- Be descriptive: `resistance-guide-3d-cover.png`

### Important: Case Sensitivity
File paths are **case-sensitive in production** (Linux). Ensure your code references match the exact file casing:
- `✅ /images/Products/cover.jpg`
- `❌ /images/products/Cover.jpg` (will break in production)

---

## Recommended Tools

- **Image compression**: [Squoosh](https://squoosh.app), [TinyPNG](https://tinypng.com)
- **Background removal**: [remove.bg](https://remove.bg)
- **Mockup creation**: [Placeit](https://placeit.net), [Canva](https://canva.com)
- **OG image templates**: [OG Image Generator](https://og-image.vercel.app)

---

## After Adding Assets

1. Commit all new images to git:
   ```bash
   git add public/images/
   git add public/logo.png public/favicon.ico public/og-image.jpg
   git commit -m "Add brand assets"
   ```

2. Update image references in code if paths changed

3. Test images load correctly in development:
   ```bash
   npm run dev
   ```

4. Verify images appear after deployment
