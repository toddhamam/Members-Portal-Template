import type { Metadata } from "next";
import { MarketingHeader, MarketingFooter } from "@/components/marketing";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Inner Wealth Initiate. Questions about our products or your spiritual journey? We're here to help.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#1a1a1a]">
      <MarketingHeader />

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif italic text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-4 sm:mb-6">
            Get in Touch
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
            Have questions about our products or your spiritual journey?
            We&apos;re here to help guide you along the path.
          </p>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-10 sm:py-12 lg:py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="font-serif italic text-xl sm:text-2xl text-white mb-5 sm:mb-6">
                Contact Information
              </h2>

              <div className="space-y-5 sm:space-y-6">
                {/* Email */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#252525] flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4a574]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-medium mb-1 text-sm sm:text-base">Email</h3>
                    <a
                      href="mailto:info@innerwealthinitiate.com"
                      className="text-[#d4a574] hover:text-[#ee5d0b] active:text-[#ee5d0b] transition-colors text-sm sm:text-base break-all"
                    >
                      info@innerwealthinitiate.com
                    </a>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">
                      We typically respond within 24-48 hours
                    </p>
                  </div>
                </div>

                {/* Social Media */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#252525] flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4a574]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-2 text-sm sm:text-base">Connect With Us</h3>
                    <div className="flex items-center gap-4">
                      <a
                        href="https://www.youtube.com/@IWInitiate"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-red-500 active:text-red-500 transition-colors p-1"
                        aria-label="YouTube"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                      </a>
                      <a
                        href="https://www.instagram.com/innerwealthinitiate/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-pink-500 active:text-pink-500 transition-colors p-1"
                        aria-label="Instagram"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Support */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#252525] flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4a574]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1 text-sm sm:text-base">Customer Support</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      For order inquiries, refunds, or technical issues with accessing your products,
                      please email us with your order details.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Preview */}
            <div>
              <h2 className="font-serif italic text-xl sm:text-2xl text-white mb-5 sm:mb-6">
                Frequently Asked Questions
              </h2>

              <div className="space-y-3 sm:space-y-4">
                <div className="bg-[#252525] rounded-lg p-4 sm:p-5">
                  <h3 className="text-white font-medium mb-2 text-sm sm:text-base">How do I access my purchased products?</h3>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    After purchase, you&apos;ll receive an email with instructions to create your account
                    and access the member portal where all your products are available.
                  </p>
                </div>

                <div className="bg-[#252525] rounded-lg p-4 sm:p-5">
                  <h3 className="text-white font-medium mb-2 text-sm sm:text-base">What is your refund policy?</h3>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    We offer a 30-day money-back guarantee on all our digital products.
                    If you&apos;re not satisfied, simply email us for a full refund.
                  </p>
                </div>

                <div className="bg-[#252525] rounded-lg p-4 sm:p-5">
                  <h3 className="text-white font-medium mb-2 text-sm sm:text-base">Do you offer personal coaching?</h3>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    Yes! Our Bridge to Mastery program includes personal guidance.
                    Check our products page for more information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-[#252525]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif italic text-2xl sm:text-3xl text-white mb-3 sm:mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8">
            Explore our collection of resources designed to help you clear blocks,
            overcome fears, and align with your true self.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <a
              href="/products"
              className="inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-[#ee5d0b] hover:bg-[#d54d00] active:bg-[#d54d00] text-white font-medium rounded transition-colors text-sm sm:text-base"
            >
              View Products
            </a>
            <a
              href="/product"
              className="inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border border-gray-700 hover:border-[#d4a574] active:border-[#d4a574] text-white font-medium rounded transition-colors text-sm sm:text-base"
            >
              Get Started
            </a>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
