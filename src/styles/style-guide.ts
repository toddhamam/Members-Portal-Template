/**
 * INNER WEALTH INITIATE - STYLE GUIDE
 * ====================================
 *
 * This file documents the design system for the entire funnel.
 * Import these constants to ensure consistency across all pages.
 *
 * Pages in funnel:
 * - Sales Page (/)
 * - Product Page (/product)
 * - Checkout (/checkout)
 * - Upsell 1 (/upsell-1)
 * - Downsell 1 (/downsell-1)
 * - Upsell 2 (/upsell-2)
 * - Thank You (/thank-you)
 */

// =============================================================================
// BRANDING
// =============================================================================

export const branding = {
  // Brand Name
  name: 'Inner Wealth Initiate',
  tagline: 'Inner Wealth Initiate™',

  // Logo
  logo: {
    // Full logo with text (horizontal layout)
    full: '/logo.png',
    // Alt text for accessibility
    alt: 'Inner Wealth Initiate logo',
  },

  // Brand Colors (derived from logo)
  brandColors: {
    gold: '#d4a574',           // Primary brand color - logo text and circle
    teal: '#3da4ab',           // Teal/turquoise flame
    coral: '#c46c5b',          // Coral/red flame
    amber: '#e8a838',          // Golden amber flame center
  },
} as const;

// =============================================================================
// COLOR PALETTE
// =============================================================================

export const colors = {
  // Primary Colors
  primary: {
    black: '#222222',        // Primary text, CTA buttons
    white: '#ffffff',        // White backgrounds, button text
  },

  // Background Colors
  background: {
    white: '#ffffff',        // Main white background
    warmWhite: '#faf9f7',    // Warm off-white sections
    lightBeige: '#f5f3ef',   // Light beige/cream sections
    dark: '#1a1a1a',         // Dark sections, FAQ, footer
    darkPurple: '#1e1b2e',   // Benefits section background
    darkGray: '#252525',     // Cards on dark backgrounds
    darkBlue: '#1a1a2e',     // Hero gradient start
    midBlue: '#16213e',      // Hero gradient mid
    deepBlue: '#0f3460',     // Hero gradient end
  },

  // Accent Colors
  accent: {
    gold: '#d4a574',         // Gold/tan accent (primary accent)
    goldDark: '#b8956c',     // Darker gold (gradients, bullets)
    orange: '#ee5d0b',       // Orange accent (sparingly used)
    orangeHover: '#d54d00',  // Orange hover state
  },

  // Badge Colors
  badge: {
    brown: '#8B7355',        // "Expanded 2nd Edition" badge bg
    brownBorder: '#6B5344',  // Badge border
    goldBadge: 'from-amber-400 to-amber-600', // Bonus badge gradient
  },

  // Text Colors
  text: {
    primary: '#222222',      // Primary headings, important text
    secondary: '#4b5563',    // gray-600 - Body text
    muted: '#6b7280',        // gray-500 - Subtle text, labels
    light: '#9ca3af',        // gray-400 - Light text on dark bg
    white: '#ffffff',        // Text on dark backgrounds
  },

  // Border Colors
  border: {
    light: '#e5e7eb',        // gray-200 - Light borders
    dark: '#374151',         // gray-700 - Borders on dark bg
    darkSection: '#3a3a3a',  // Card borders on dark sections
  },

  // Feedback Colors
  feedback: {
    star: '#eab308',         // yellow-500 - Star ratings
    success: '#22c55e',      // green-500 - Checkmarks
  },
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const typography = {
  // Font Families (defined in layout.tsx via next/font/google)
  fontFamily: {
    serif: 'var(--font-playfair), "Playfair Display", Georgia, serif',
    sans: 'var(--font-inter), "Inter", system-ui, sans-serif',
  },

  // Tailwind classes for fonts
  fontClasses: {
    serif: 'font-serif',     // Playfair Display - Headings
    sans: '',                // Inter - Body (default)
  },

  // Heading Sizes (Tailwind classes)
  headings: {
    h1: 'text-4xl lg:text-5xl',           // Hero headlines
    h2: 'text-3xl lg:text-4xl',           // Section titles
    h3: 'text-2xl lg:text-3xl',           // Sub-sections
    h4: 'text-lg font-semibold',          // Feature titles
  },

  // Body Text Sizes
  body: {
    large: 'text-lg',        // Intro paragraphs
    base: 'text-base',       // Standard body text
    small: 'text-sm',        // Descriptions, captions
    xs: 'text-xs',           // Labels, fine print
  },

  // Special Text Treatments
  special: {
    uppercase: 'uppercase tracking-widest text-xs', // Section labels
    italic: 'italic',        // Quotes
    quote: 'text-lg italic', // Testimonial quotes
  },

  // Line Heights
  lineHeight: {
    tight: 'leading-tight',  // Headings (1.25)
    relaxed: 'leading-relaxed', // Body text (1.625)
  },
} as const;

// =============================================================================
// SPACING
// =============================================================================

export const spacing = {
  // Section Padding
  section: {
    y: 'py-20',              // Vertical padding for sections
    x: 'px-4',               // Horizontal padding
    full: 'py-20 px-4',      // Combined section padding
  },

  // Container Max Widths
  container: {
    xl: 'max-w-6xl mx-auto', // Wide sections (1152px)
    lg: 'max-w-5xl mx-auto', // Large sections (1024px)
    md: 'max-w-4xl mx-auto', // Medium sections (896px)
    sm: 'max-w-3xl mx-auto', // Narrow sections (768px)
    xs: 'max-w-2xl mx-auto', // Extra narrow (672px)
  },

  // Grid Gaps
  gap: {
    xl: 'gap-12',            // Large gaps between columns
    lg: 'gap-8',             // Standard gaps
    md: 'gap-6',             // Medium gaps
    sm: 'gap-4',             // Small gaps
    xs: 'gap-2',             // Tight gaps
  },

  // Content Spacing
  content: {
    mb: {
      xl: 'mb-12',           // After section titles
      lg: 'mb-8',            // After paragraphs
      md: 'mb-6',            // Standard margin
      sm: 'mb-4',            // Small margin
      xs: 'mb-2',            // Tight margin
    },
    mt: {
      xl: 'mt-12',
      lg: 'mt-8',
      md: 'mt-6',
      sm: 'mt-4',
      xs: 'mt-2',
    },
  },
} as const;

// =============================================================================
// COMPONENTS
// =============================================================================

export const components = {
  // CTA Buttons
  button: {
    // Primary CTA (Black with download icon)
    primary: `
      inline-flex items-center justify-center gap-2
      bg-[#222222] text-white
      px-8 py-4
      text-sm font-medium tracking-wide
      hover:bg-black transition-colors
    `.replace(/\s+/g, ' ').trim(),

    // Outline variant (for dark backgrounds)
    outline: `
      inline-flex items-center justify-center gap-2
      border border-white text-white
      px-8 py-4
      text-sm font-medium tracking-wide
      hover:bg-white hover:text-black transition-colors
    `.replace(/\s+/g, ' ').trim(),

    // Full width variant
    fullWidth: 'w-full justify-center',
  },

  // Cards
  card: {
    // Light card (on white/light backgrounds)
    light: 'bg-white p-6 border border-gray-100 rounded-lg',

    // Dark card (on dark backgrounds)
    dark: 'bg-[#252525] rounded-lg p-8',

    // Feature card
    feature: 'bg-white p-8 rounded-lg',

    // Testimonial card
    testimonial: 'bg-white p-6 border border-gray-100 rounded-lg',
  },

  // Form Inputs
  input: {
    base: `
      w-full px-4 py-3
      border border-gray-300 rounded-lg
      focus:ring-2 focus:ring-[#ee5d0b] focus:border-transparent
      outline-none transition
    `.replace(/\s+/g, ' ').trim(),
  },

  // Badges
  badge: {
    edition: `
      bg-[#8B7355] text-white text-xs
      px-3 py-1.5 rounded
      border border-[#6B5344]
    `.replace(/\s+/g, ' ').trim(),

    bonus: `
      bg-gradient-to-br from-amber-400 to-amber-600
      text-xs font-bold text-amber-900
      px-3 py-2 rounded-full
    `.replace(/\s+/g, ' ').trim(),

    discount: `
      bg-[#ee5d0b] text-white text-sm font-semibold
      px-3 py-1 rounded-full
    `.replace(/\s+/g, ' ').trim(),
  },

  // Icons (sizing)
  icon: {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
    xl: 'w-16 h-16',
  },

  // Bullet points
  bullet: {
    gold: 'w-2 h-2 rounded-full bg-[#b8956c]',
    gray: 'w-2 h-2 rounded-full bg-gray-400',
  },
} as const;

// =============================================================================
// LAYOUT PATTERNS
// =============================================================================

export const layout = {
  // Grid Layouts
  grid: {
    twoCol: 'grid lg:grid-cols-2',
    threeCol: 'grid md:grid-cols-3',
    fourCol: 'grid md:grid-cols-2 lg:grid-cols-4',
  },

  // Section Backgrounds (Tailwind classes)
  sectionBg: {
    white: 'bg-white',
    warmWhite: 'bg-[#faf9f7]',
    lightBeige: 'bg-[#f5f3ef]',
    dark: 'bg-[#1a1a1a] text-white',
    darkPurple: 'bg-[#1e1b2e] text-white',
  },

  // Hero gradient
  heroGradient: 'bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]',

  // Product mockup gradient
  productGradient: 'bg-gradient-to-b from-[#d4a574] to-[#b8956c]',
} as const;

// =============================================================================
// ANIMATION (Optional)
// =============================================================================

export const animation = {
  // Transitions
  transition: {
    default: 'transition-colors',
    all: 'transition-all duration-200',
    transform: 'transition-transform',
  },

  // Hover effects
  hover: {
    lift: 'hover:-translate-y-1',
    scale: 'hover:scale-105',
    opacity: 'hover:opacity-80',
  },
} as const;

// =============================================================================
// PAGE-SPECIFIC PATTERNS
// =============================================================================

export const pagePatterns = {
  // Sales Page sections order
  salesPage: [
    'hero',
    'breakTheLoop',
    'noMoreGuesswork',
    'whatsInside',
    'darkNight',
    'resistanceMappingSystem',
    'uncoverTheRoot',
    'benefits',
    'testimonials',
    'firstStep',
    'bonuses',
    'faq',
    'footer',
  ],

  // Checkout page pattern
  checkout: {
    layout: 'two-column (form left, summary right)',
    formSections: ['customerInfo', 'billingAddress', 'orderBump', 'payment'],
    summarySticky: true,
  },

  // Upsell page pattern
  upsell: {
    layout: 'single-column centered',
    maxWidth: 'max-w-4xl',
    ctaStyle: 'accent (orange)',
    hasDeclineLink: true,
  },

  // Thank you page pattern
  thankYou: {
    layout: 'single-column centered',
    showOrderSummary: true,
    showNextSteps: true,
  },
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Combine multiple Tailwind classes safely
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get section wrapper classes
 */
export function getSectionClasses(
  background: keyof typeof layout.sectionBg = 'white',
  containerSize: keyof typeof spacing.container = 'xl'
): string {
  return cn(
    spacing.section.full,
    layout.sectionBg[background],
  );
}

/**
 * Get container classes
 */
export function getContainerClasses(
  size: keyof typeof spacing.container = 'xl'
): string {
  return spacing.container[size];
}

// =============================================================================
// CSS VARIABLE DEFINITIONS (for reference)
// =============================================================================

/**
 * These CSS variables are defined in globals.css:
 *
 * :root {
 *   --background: #ffffff;
 *   --foreground: #171717;
 *   --accent: #ee5d0b;
 *   --accent-hover: #d54d00;
 *   --muted: #6b7280;
 *   --border: #e5e7eb;
 *   --font-inter: (loaded via next/font);
 *   --font-playfair: (loaded via next/font);
 * }
 *
 * @theme inline {
 *   --color-background: var(--background);
 *   --color-foreground: var(--foreground);
 *   --color-accent: var(--accent);
 * }
 */

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

/**
 * EXAMPLE: Creating a section
 *
 * <section className={cn(spacing.section.full, layout.sectionBg.dark)}>
 *   <div className={spacing.container.xl}>
 *     <h2 className={cn(typography.fontClasses.serif, typography.headings.h2)}>
 *       Section Title
 *     </h2>
 *   </div>
 * </section>
 *
 * EXAMPLE: Creating a CTA button
 *
 * <button className={components.button.primary}>
 *   Instant Download
 *   <DownloadIcon className={components.icon.sm} />
 * </button>
 *
 * EXAMPLE: Two-column grid
 *
 * <div className={cn(layout.grid.twoCol, spacing.gap.xl)}>
 *   <div>Column 1</div>
 *   <div>Column 2</div>
 * </div>
 */

export default {
  branding,
  colors,
  typography,
  spacing,
  components,
  layout,
  animation,
  pagePatterns,
  cn,
  getSectionClasses,
  getContainerClasses,
};
