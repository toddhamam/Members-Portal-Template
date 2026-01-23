"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/media", label: "Media" },
  { href: "/contact", label: "Contact" },
];

export function MarketingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header className="bg-[#1a1a1a] border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo - smaller on mobile */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/logo.png"
            alt="Inner Wealth Initiate"
            width={180}
            height={45}
            className="h-8 sm:h-10 w-auto"
            priority
          />
        </Link>

        {/* Desktop/Tablet Navigation - show at lg breakpoint */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "text-[#d4a574]"
                  : "text-white hover:text-[#d4a574]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop/Tablet CTA */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-4">
          <Link
            href="/portal"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Login
          </Link>
          <Link
            href="/product"
            className="inline-flex items-center justify-center px-5 xl:px-6 py-2.5 bg-[#ee5d0b] hover:bg-[#d54d00] text-white text-sm font-medium rounded transition-colors"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile/Tablet Menu Button - larger touch target */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 -mr-2 text-white touch-manipulation"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile/Tablet Menu - full screen overlay */}
      <div
        className={`lg:hidden fixed inset-0 top-[57px] sm:top-[65px] bg-[#1a1a1a] z-40 transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <nav className="px-6 py-6 space-y-1 h-full overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block text-lg font-medium py-4 border-b border-gray-800 ${
                pathname === link.href
                  ? "text-[#d4a574]"
                  : "text-white active:text-[#d4a574]"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-6 space-y-4">
            <Link
              href="/portal"
              className="block text-center text-lg text-gray-400 hover:text-white py-4 border border-gray-700 rounded-lg"
            >
              Login to Portal
            </Link>
            <Link
              href="/product"
              className="block text-center px-6 py-4 bg-[#ee5d0b] active:bg-[#d54d00] text-white text-lg font-medium rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
