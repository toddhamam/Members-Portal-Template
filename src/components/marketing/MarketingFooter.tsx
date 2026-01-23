import Link from "next/link";
import Image from "next/image";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/media", label: "Media" },
  { href: "/contact", label: "Contact" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/refund", label: "Refund Policy" },
];

const socialLinks = [
  {
    href: "https://www.youtube.com/@IWInitiate",
    label: "YouTube",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    href: "https://www.instagram.com/innerwealthinitiate/",
    label: "Instagram",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
];

export function MarketingFooter() {
  return (
    <footer className="bg-[#1a1a1a] border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 lg:py-16">
        {/* Main footer grid - stacks on mobile, 2 cols tablet, 4 cols desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column - full width on mobile, 2 cols on tablet */}
          <div className="sm:col-span-2 text-center sm:text-left">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/logo.png"
                alt="Inner Wealth Initiate"
                width={150}
                height={38}
                className="h-9 w-auto mx-auto sm:mx-0"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm mx-auto sm:mx-0">
              Helping you clear the fears, blocks, and patterns that keep you stuck,
              so you can align with your true self and awaken to your inner wealth.
            </p>
            {/* Social Links - larger touch targets on mobile */}
            <div className="flex items-center justify-center sm:justify-start gap-5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#d4a574] active:text-[#d4a574] transition-colors p-1"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[#d4a574] active:text-[#d4a574] text-sm transition-colors inline-block py-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/portal"
                  className="text-gray-400 hover:text-[#d4a574] active:text-[#d4a574] text-sm transition-colors inline-block py-1"
                >
                  Member Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="text-center sm:text-left">
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[#d4a574] active:text-[#d4a574] text-sm transition-colors inline-block py-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 sm:mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-xs sm:text-sm">
            &copy; {new Date().getFullYear()} Inner Wealth Initiate. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
