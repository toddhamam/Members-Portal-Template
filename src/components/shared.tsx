/**
 * SHARED COMPONENTS
 * =================
 *
 * Reusable components for the entire funnel.
 * Import these to maintain consistency across all pages.
 */

import Link from "next/link";
import { colors, components, typography, cn } from "@/styles/style-guide";

// =============================================================================
// ICONS
// =============================================================================

/**
 * Download icon for CTA buttons
 */
export function DownloadIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

/**
 * Checkmark icon for feature lists
 */
export function CheckIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

/**
 * Clock icon for time-related features
 */
export function ClockIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

/**
 * Document icon for guides/worksheets
 */
export function DocumentIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

/**
 * Shield icon for security/guarantee
 */
export function ShieldIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

/**
 * Play icon for video elements
 */
export function PlayIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

/**
 * Chevron icon for accordions/dropdowns
 */
export function ChevronDownIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// =============================================================================
// BUTTONS
// =============================================================================

interface CTAButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "outline" | "accent";
  fullWidth?: boolean;
  className?: string;
  showIcon?: boolean;
}

/**
 * Primary CTA Button
 * - Use for main conversion actions
 * - Includes download icon by default
 */
export function CTAButton({
  children,
  href = "/product",
  onClick,
  variant = "primary",
  fullWidth = false,
  className = "",
  showIcon = true,
}: CTAButtonProps) {
  const baseStyles = "inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-medium tracking-wide transition-colors";

  const variantStyles = {
    primary: "bg-[#222222] text-white hover:bg-black",
    outline: "border border-white text-white hover:bg-white hover:text-black",
    accent: "bg-[#ee5d0b] text-white hover:bg-[#d54d00]",
  };

  const buttonClass = cn(
    baseStyles,
    variantStyles[variant],
    fullWidth && "w-full",
    className
  );

  const content = (
    <>
      {children}
      {showIcon && <DownloadIcon className="w-4 h-4" />}
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className={buttonClass}>
        {content}
      </button>
    );
  }

  return (
    <Link href={href} className={buttonClass}>
      {content}
    </Link>
  );
}

// =============================================================================
// RATINGS & SOCIAL PROOF
// =============================================================================

interface StarRatingProps {
  rating?: number;
  size?: "sm" | "md" | "lg";
}

/**
 * Star rating display
 */
export function StarRating({ rating = 5, size = "md" }: StarRatingProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={cn(
            sizeClasses[size],
            i < rating ? "text-yellow-500" : "text-gray-300",
            "fill-current"
          )}
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
  );
}

// =============================================================================
// BADGES
// =============================================================================

/**
 * Edition badge (e.g., "Expanded 2nd Edition")
 */
export function EditionBadge() {
  return (
    <div className="bg-[#8B7355] text-white text-xs px-3 py-1.5 rounded border border-[#6B5344]">
      <span className="font-medium">Expanded</span>
      <br />
      <span className="text-[10px]">2nd Edition</span>
    </div>
  );
}

/**
 * Discount badge (e.g., "77% OFF")
 */
export function DiscountBadge({ percent }: { percent: number }) {
  return (
    <span className="bg-[#ee5d0b] text-white text-sm font-semibold px-3 py-1 rounded-full">
      {percent}% OFF
    </span>
  );
}

/**
 * Bonus badge
 */
export function BonusBadge() {
  return (
    <div className="bg-gradient-to-br from-amber-400 to-amber-600 text-xs font-bold text-amber-900 px-3 py-2 rounded-full text-center">
      BONUSES<br />INCLUDED
    </div>
  );
}

// =============================================================================
// TRUST ELEMENTS
// =============================================================================

interface TrustBadgeProps {
  icon: React.ReactNode;
  text: string;
}

/**
 * Trust badge with icon and text
 */
export function TrustBadge({ icon, text }: TrustBadgeProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <span className="text-green-600">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

/**
 * Standard trust badges set
 */
export function TrustBadges() {
  return (
    <div className="flex flex-wrap gap-4">
      <TrustBadge
        icon={<ShieldIcon className="w-5 h-5" />}
        text="Secure Checkout"
      />
      <TrustBadge
        icon={<ClockIcon className="w-5 h-5" />}
        text="Instant Download"
      />
      <TrustBadge
        icon={<CheckIcon className="w-5 h-5" />}
        text="30-Day Refund Guarantee"
      />
    </div>
  );
}

// =============================================================================
// PRODUCT MOCKUP
// =============================================================================

interface ProductMockupProps {
  size?: "sm" | "md" | "lg";
  showPlaceholderText?: boolean;
}

/**
 * Product mockup placeholder
 * Replace the content div with actual images when available
 */
export function ProductMockup({ size = "md", showPlaceholderText = true }: ProductMockupProps) {
  const sizeClasses = {
    sm: "w-32 p-4",
    md: "w-48 p-6",
    lg: "w-64 p-8",
  };

  return (
    <div className={cn(
      "bg-gradient-to-b from-[#d4a574] to-[#b8956c] rounded-lg text-center",
      sizeClasses[size]
    )}>
      <p className="text-[#1a1a2e] text-xs uppercase tracking-widest mb-1">The</p>
      <h3 className="text-[#1a1a2e] text-xl font-serif font-bold">RESISTANCE MAP</h3>
      <div className="w-12 h-12 mx-auto my-3">
        <svg className="w-full h-full text-[#1a1a2e]" viewBox="0 0 100 100" fill="currentColor">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2"/>
          {[...Array(12)].map((_, i) => (
            <line key={i} x1="50" y1="10" x2="50" y2="20" stroke="currentColor" strokeWidth="2" transform={`rotate(${i * 30} 50 50)`}/>
          ))}
        </svg>
      </div>
      <p className="text-[#1a1a2e] text-xs">Todd Hamash</p>
    </div>
  );
}

// =============================================================================
// TESTIMONIALS
// =============================================================================

interface TestimonialCardProps {
  quote: string;
  name: string;
  location?: string;
  showStars?: boolean;
}

/**
 * Testimonial card component
 */
export function TestimonialCard({ quote, name, location, showStars = false }: TestimonialCardProps) {
  return (
    <div className="bg-white p-6 border border-gray-100 rounded-lg">
      {showStars && (
        <div className="mb-3">
          <StarRating />
        </div>
      )}
      <div className="text-3xl text-gray-200 mb-4">&ldquo;</div>
      <p className="text-gray-600 text-sm leading-relaxed mb-4">
        {quote}
      </p>
      <p className="font-semibold text-gray-900 text-sm">
        {name}{location && ` - ${location}`}
      </p>
    </div>
  );
}

// =============================================================================
// FAQ
// =============================================================================

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

/**
 * FAQ accordion item
 */
export function FAQItem({ question, answer, isOpen, onClick }: FAQItemProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <button
        onClick={onClick}
        className="w-full px-6 py-4 text-left flex items-center justify-between text-gray-900 font-medium"
      >
        <span>{question}</span>
        <ChevronDownIcon className={cn(
          "w-5 h-5 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>
      {isOpen && (
        <div className="px-6 pb-4 text-gray-600">
          {answer}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// FEATURE LISTS
// =============================================================================

interface FeatureItemProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
}

/**
 * Feature list item with checkmark
 */
export function FeatureItem({ children, icon }: FeatureItemProps) {
  return (
    <li className="flex items-center gap-3 text-gray-700">
      {icon || <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />}
      {children}
    </li>
  );
}

/**
 * Bullet point item (gold or gray)
 */
export function BulletItem({ children, variant = "gold" }: { children: React.ReactNode; variant?: "gold" | "gray" }) {
  return (
    <li className="flex items-center gap-3 text-gray-700">
      <span className={cn(
        "w-2 h-2 rounded-full",
        variant === "gold" ? "bg-[#b8956c]" : "bg-gray-400"
      )} />
      {children}
    </li>
  );
}

// =============================================================================
// SECTION COMPONENTS
// =============================================================================

interface SectionProps {
  children: React.ReactNode;
  background?: "white" | "warmWhite" | "lightBeige" | "dark" | "darkPurple";
  className?: string;
}

/**
 * Section wrapper with consistent padding and background
 */
export function Section({ children, background = "white", className = "" }: SectionProps) {
  const bgClasses = {
    white: "bg-white",
    warmWhite: "bg-[#faf9f7]",
    lightBeige: "bg-[#f5f3ef]",
    dark: "bg-[#1a1a1a] text-white",
    darkPurple: "bg-[#1e1b2e] text-white",
  };

  return (
    <section className={cn("py-20 px-4", bgClasses[background], className)}>
      {children}
    </section>
  );
}

interface ContainerProps {
  children: React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

/**
 * Container with max-width
 */
export function Container({ children, size = "xl", className = "" }: ContainerProps) {
  const sizeClasses = {
    xs: "max-w-2xl",
    sm: "max-w-3xl",
    md: "max-w-4xl",
    lg: "max-w-5xl",
    xl: "max-w-6xl",
  };

  return (
    <div className={cn(sizeClasses[size], "mx-auto", className)}>
      {children}
    </div>
  );
}

// =============================================================================
// FOOTER
// =============================================================================

interface FooterProps {
  variant?: "light" | "dark";
}

/**
 * Standard footer component
 */
export function Footer({ variant = "dark" }: FooterProps) {
  const bgClass = variant === "dark" ? "bg-[#1a1a1a] border-t border-gray-800" : "bg-white border-t border-gray-200";
  const textClass = variant === "dark" ? "text-gray-500" : "text-gray-500";
  const linkHoverClass = variant === "dark" ? "hover:text-gray-300" : "hover:text-gray-700";

  return (
    <footer className={cn("py-8 px-4", bgClass)}>
      <div className={cn("max-w-4xl mx-auto text-center text-sm", textClass)}>
        <div className="flex justify-center gap-8 mb-4">
          <Link href="/privacy" className={linkHoverClass}>Privacy Policy</Link>
          <Link href="/terms" className={linkHoverClass}>Terms Of Service</Link>
          <Link href="/refund" className={linkHoverClass}>Refund Policy</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} Inner Wealth Initiate. All rights reserved.</p>
      </div>
    </footer>
  );
}

// =============================================================================
// HEADER
// =============================================================================

interface HeaderProps {
  showBackLink?: boolean;
  variant?: "light" | "dark";
}

/**
 * Standard header component
 */
export function Header({ showBackLink = false, variant = "light" }: HeaderProps) {
  const bgClass = variant === "dark" ? "bg-[#1a1a1a] border-b border-gray-800" : "bg-white border-b border-gray-100";
  const textClass = variant === "dark" ? "text-white" : "text-gray-900";

  return (
    <header className={cn("py-4 px-4", bgClass)}>
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className={cn("text-xl font-semibold", textClass)}>
          Inner Wealth Initiate
        </Link>
        {showBackLink && (
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            &larr; Back to store
          </Link>
        )}
      </div>
    </header>
  );
}
