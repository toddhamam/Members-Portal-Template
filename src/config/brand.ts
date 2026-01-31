/**
 * BRAND CONFIGURATION
 * ===================
 *
 * This is the centralized configuration file for all brand-specific values.
 * When setting up a new portal, update the values in this file first.
 *
 * These values are used throughout the application for:
 * - Display names and copy
 * - Domain routing
 * - Email communications
 * - Social media links
 * - Legal and support pages
 */

// =============================================================================
// BRAND IDENTITY
// =============================================================================

export const brand = {
  /**
   * Brand name - Used in headers, titles, meta tags, and throughout the UI
   * Example: "Inner Wealth Initiate", "Fitness Academy", "Business Mastery"
   */
  name: 'Inner Wealth Initiate',

  /**
   * Brand tagline - Used in marketing materials and meta descriptions
   * Keep it concise (under 60 characters for SEO)
   */
  tagline: 'Transform Your Relationship With Resistance',

  /**
   * Legal entity name - Used in terms, privacy policy, and legal documents
   * Example: "Inner Wealth Initiate LLC", "Your Company Inc."
   */
  legalName: 'Inner Wealth Initiate LLC',

  /**
   * Year business started - Used in copyright notices
   */
  copyrightYear: 2024,
} as const;

// =============================================================================
// DOMAINS
// =============================================================================

export const domains = {
  /**
   * Marketing domain - Main website for brand content
   * This is where SEO content, blog posts, and brand pages live
   */
  marketing: 'innerwealthinitiate.com',

  /**
   * Funnel domain - Sales funnel subdomain
   * This domain serves the distraction-free sales experience
   * Format: offer.{marketing-domain} or custom domain
   */
  funnel: 'offer.innerwealthinitiate.com',

  /**
   * Portal domain (optional) - Member portal subdomain
   * If set, the portal can be accessed at this subdomain
   * Format: portal.{marketing-domain} or leave empty to use /portal path
   */
  portal: 'portal.innerwealthinitiate.com',
} as const;

// =============================================================================
// CONTACT INFORMATION
// =============================================================================

export const contact = {
  /**
   * Support email - Primary customer support contact
   * Used in footers, support pages, and automated emails
   */
  supportEmail: 'support@innerwealthinitiate.com',

  /**
   * Admin/business email - For internal notifications
   * Receives webhook alerts, order notifications, etc.
   */
  adminEmail: 'admin@innerwealthinitiate.com',
} as const;

// =============================================================================
// SOCIAL MEDIA
// =============================================================================

export const social = {
  /**
   * Social media profiles - Used in footers and marketing pages
   * Set to empty string if the platform isn't used
   */
  instagram: 'https://instagram.com/innerwealthinitiate',
  facebook: 'https://facebook.com/innerwealthinitiate',
  twitter: '',  // Set to empty if not used
  youtube: '',
  tiktok: '',
  linkedin: '',
} as const;

// =============================================================================
// INSTRUCTOR / CREATOR
// =============================================================================

export const instructor = {
  /**
   * Primary instructor/creator name
   * Used on sales pages, about sections, and testimonials
   */
  name: 'Andrew Huberman',  // Replace with actual instructor name

  /**
   * Instructor title/credentials
   * Example: "Certified Coach", "PhD", "Founder"
   */
  title: 'Founder',

  /**
   * Instructor bio - Short version for cards and summaries
   * Keep under 200 characters
   */
  shortBio: 'Helping people transform their relationship with resistance and unlock their inner wealth.',

  /**
   * Instructor image path - Located in /public/images/instructor/
   */
  imagePath: '/images/instructor/headshot.jpg',
} as const;

// =============================================================================
// META & SEO
// =============================================================================

export const meta = {
  /**
   * Default meta title suffix
   * Format: "Page Title | {titleSuffix}"
   */
  titleSuffix: 'Inner Wealth Initiate',

  /**
   * Default meta description - Used when page doesn't specify one
   * Keep between 150-160 characters for optimal SEO
   */
  defaultDescription: 'Transform your relationship with resistance and unlock your inner wealth through proven techniques and guided practices.',

  /**
   * OG image path - Default Open Graph image for social sharing
   * Recommended size: 1200x630px
   * Located in /public/
   */
  ogImage: '/og-image.jpg',
} as const;

// =============================================================================
// FEATURE FLAGS
// =============================================================================

export const features = {
  /**
   * Enable/disable portal features
   * Use these to customize which features are available
   */
  communityEnabled: true,
  directMessagingEnabled: true,
  progressTrackingEnabled: true,
  certificatesEnabled: false,
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get the full URL for a domain
 */
export function getFullUrl(domain: keyof typeof domains, path: string = ''): string {
  const domainValue = domains[domain];
  return `https://${domainValue}${path}`;
}

/**
 * Get copyright text
 */
export function getCopyrightText(): string {
  const currentYear = new Date().getFullYear();
  const yearRange = brand.copyrightYear === currentYear
    ? currentYear.toString()
    : `${brand.copyrightYear}-${currentYear}`;
  return `© ${yearRange} ${brand.legalName}. All rights reserved.`;
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default {
  brand,
  domains,
  contact,
  social,
  instructor,
  meta,
  features,
  getFullUrl,
  getCopyrightText,
};
