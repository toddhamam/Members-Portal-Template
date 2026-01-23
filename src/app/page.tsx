"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { trackViewContent } from "@/lib/meta-pixel";
import { ga4 } from "@/lib/ga4";
import { MarketingHeader, MarketingFooter } from "@/components/marketing";

// Download icon component
function DownloadIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

// CTA Button with download icon
function CTAButton({ children, className = "", inverted = false }: { children: React.ReactNode; className?: string; inverted?: boolean }) {
  return (
    <Link
      href="/product"
      className={`inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-sm font-medium tracking-wide transition-colors touch-manipulation ${
        inverted
          ? 'bg-white text-[#222222] hover:bg-gray-100 active:bg-gray-100'
          : 'bg-[#222222] text-white hover:bg-black active:bg-black'
      } ${className}`}
    >
      {children}
      <DownloadIcon className="w-4 h-4" />
    </Link>
  );
}

// Star rating component
function StarRating() {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
  );
}

// Bottom navigation bar
function BottomNav() {
  const items = [
    "Begin Your Transformation",
    "Practical Exercises",
    "5 Star reviews",
    "Instant Download",
    "Read From Any Device",
  ];

  return (
    <div className="bg-[#beb9eb] py-2 sm:py-3 overflow-x-auto scrollbar-hide">
      <div className="flex items-center justify-start sm:justify-center gap-4 sm:gap-8 px-4 min-w-max">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-[#000000] whitespace-nowrap">
            {item === "5 Star reviews" ? (
              <>
                <span>{item}</span>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-500 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
              </>
            ) : (
              <span>{item}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// FAQ Accordion Item
function FAQItem({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <button
        onClick={onClick}
        className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left flex items-center justify-between text-gray-900 font-medium text-sm sm:text-base touch-manipulation"
      >
        <span className="pr-4">{question}</span>
        <svg
          className={`w-5 h-5 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-4 sm:px-6 pb-3 sm:pb-4 text-gray-600 text-sm sm:text-base">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function SalesPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  // Track ViewContent for Meta Pixel and GA4
  useEffect(() => {
    trackViewContent({
      content_name: 'Resistance Mapping Guide - Landing Page',
      content_category: 'funnel',
      content_type: 'product',
    });
    // Track for GA4
    ga4.landingPageView();
  }, []);

  const faqs = [
    {
      question: "Is this a print version or eBook?",
      answer: "The Resistance Mapping Guide is a digital product that gives you immediate access to all resources. You may then choose to print it if you would like a physical copy."
    },
    {
      question: "Will I Get Free Access to Future Editions?",
      answer: "Yes! When you purchase the Resistance Mapping Guide, you'll receive free access to all future updates and editions."
    },
    {
      question: "How Do I Know What's in This Book Will Work For Me?",
      answer: "The Resistance Mapping system is designed to work with any pattern or block you're experiencing. It's a universal framework that adapts to your unique situation."
    }
  ];

  return (
    <main className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Hero Section */}
      <section className="relative">
        <div className="grid lg:grid-cols-2 min-h-[400px] sm:min-h-[500px]">
          {/* Left: Product Image Area */}
          <div className="relative overflow-hidden flex items-center justify-center min-h-[250px] sm:min-h-[300px] lg:min-h-0">
            <Image
              src="/images/Products/hero-product.png"
              alt="The Resistance Map - Clear the Fears, Blocks & Patterns That Keep You Stuck"
              width={800}
              height={800}
              className="w-full h-full object-cover"
              priority
            />
          </div>

          {/* Right: Content */}
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-12 bg-[#000000]">
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white leading-tight mb-4 sm:mb-6">
              Clear the Fears, Blocks &amp; Patterns That Keep You Stuck
            </h1>

            <p className="text-[#fcfcfc] text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 leading-relaxed">
              The Resistance Mapping™ Expanded 2nd Edition is a System that helps you identify the deeper cause behind your fear &amp; blocks so you can finally clear them, and align with your true self.
            </p>

            <div className="mb-6 sm:mb-8">
              <CTAButton inverted className="w-full sm:w-auto">Instant Download</CTAButton>
            </div>

            <p className="text-[#fcfcfc] italic text-xs sm:text-sm">
              &ldquo;The Journey of a Thousand Miles begins with a single step.&rdquo; - Lao Tsu
            </p>
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav />
      </section>

      {/* Are You Ready to Break the Loop? Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-[#faf9f7]">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Content */}
            <div>
              <p className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-500 mb-3 sm:mb-4">INSTANT DOWNLOAD</p>

              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[#222222] leading-tight mb-6 sm:mb-8">
                Are You Ready to Break the Loop?
              </h2>

              <div className="space-y-4 sm:space-y-6 text-gray-700 uppercase text-xs sm:text-sm tracking-wide leading-relaxed">
                <p>
                  If you keep repeating the same fear-based pattern, it is not because you are weak.
                </p>
                <p className="font-semibold">
                  It is because there&apos;s a program inside you protecting you.
                </p>
                <p>
                  The Resistance Map™ helps you reveal what that program is, and where it started, so you can finally work with the root instead of fighting symptoms.
                </p>
                <p className="font-semibold">
                  Start mapping your resistance now.
                </p>
              </div>

              <div className="mt-6 sm:mt-8">
                <CTAButton className="w-full sm:w-auto">Instant Download</CTAButton>
              </div>
            </div>

            {/* Right: Video */}
            <div className="relative order-first lg:order-last">
              <video
                className="w-full rounded-lg shadow-xl"
                controls
                poster="/images/Products/video-thumbnail.jpg"
              >
                <source src="/videos/sales-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* No More Guesswork - Comparison Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-[#f5f3ef]">
        <div className="max-w-4xl mx-auto">
          <Image
            src="/images/Products/no-more-guesswork.png"
            alt="No More Guesswork - Effort-Based Tools vs Resistance Mapping comparison"
            width={1200}
            height={600}
            className="w-full h-auto"
          />
        </div>
      </section>

      {/* What's Inside - Dark Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-[#1a1a1a] text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-center mb-3 sm:mb-4">
            What&apos;s Inside The Expanded 2nd Edition
          </h2>

          <p className="text-[#fcfcfc] text-sm sm:text-base text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            You don&apos;t have to do this alone. You&apos;ve been sent a guide to help you discover and understand your fear loops clearly, so you can transform... It&apos;s time to awaken...
          </p>

          {/* Product showcase with features */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-12 items-center mb-8 sm:mb-12">
            {/* Left features */}
            <div className="space-y-8 sm:space-y-12 text-center lg:text-right order-2 lg:order-1">
              <div>
                <div className="flex items-center justify-center lg:justify-end gap-2 mb-2 sm:mb-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">Quick Run (15 minutes)</h4>
                <p className="text-xs sm:text-sm text-[#fcfcfc] leading-relaxed">Map the loop while you are triggered so you can get clarity fast, instead of spiraling.</p>
              </div>

              <div>
                <div className="flex items-center justify-center lg:justify-end gap-2 mb-2 sm:mb-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <h4 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">Printable Worksheets + Instant Download</h4>
                <p className="text-xs sm:text-sm text-[#fcfcfc] leading-relaxed">Use it on any device, print the pages if you want, and return to the method whenever the pattern shows up again.</p>
              </div>
            </div>

            {/* Center product image */}
            <div className="flex justify-center order-1 lg:order-2">
              <Image
                src="/images/Products/whats-inside-product.png"
                alt="The Resistance Map - Expanded 2nd Edition"
                width={700}
                height={875}
                className="w-auto h-auto max-w-[280px] sm:max-w-[400px] lg:max-w-[650px]"
              />
            </div>

            {/* Right features */}
            <div className="space-y-8 sm:space-y-12 text-center lg:text-left order-3">
              <div>
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2 sm:mb-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">Guided Prompts + Real Examples</h4>
                <p className="text-xs sm:text-sm text-[#fcfcfc] leading-relaxed">You are never left guessing what to do next. Follow the prompts, see worked examples, and apply it to your own life immediately.</p>
              </div>

              <div>
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2 sm:mb-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">How to Use the Resistance Map™ (Step-by-Step Walkthrough)</h4>
                <p className="text-xs sm:text-sm text-[#fcfcfc] leading-relaxed">A clear guided walkthrough showing you exactly how to run the map, what to write, and how to follow the process.</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/product"
              className="inline-flex items-center justify-center gap-2 border border-white text-white px-6 sm:px-8 py-3 sm:py-4 text-sm font-medium tracking-wide hover:bg-white hover:text-black active:bg-white active:text-black transition-colors touch-manipulation w-full sm:w-auto"
            >
              Instant Download
              <DownloadIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Every Dark Night Promises a New Dawn Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left: Content */}
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#222222] leading-tight mb-4 sm:mb-6">
                Every Dark Night Promises a New Dawn
              </h2>

              <div className="space-y-3 sm:space-y-4 text-gray-600 text-sm sm:text-base leading-relaxed">
                <p>If you&apos;ve landed here on this page, chances are life feels heavier than ever.</p>
                <p className="italic">...Like the rug&apos;s been ripped out from underneath you.</p>
                <p>Things that used to bring you joy now feels like a prison—a version of yourself that you&apos;ve outgrown.</p>
                <p>You feel like you&apos;re losing yourself...</p>
                <p>...you&apos;re questioning everything you thought you knew.</p>
                <p>The emotional pain, the loneliness, the sense of emptiness—it almost feels too much to bear at times.</p>
              </div>
            </div>

            {/* Right: Image */}
            <div className="relative">
              <Image
                src="/images/Lifestyle/lifestyle-desk-candles.jpg"
                alt="Person at desk with candles working on the Resistance Map"
                width={600}
                height={400}
                className="rounded-lg w-full h-auto"
              />
            </div>
          </div>

          {/* Second row */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start mt-8 sm:mt-12">
            {/* Left: Image */}
            <div className="relative order-2 lg:order-1">
              <Image
                src="/images/Lifestyle/lifestyle-tablet-map.jpg"
                alt="Person holding tablet showing the 5-phase Resistance Map"
                width={600}
                height={400}
                className="rounded-lg w-full h-auto"
              />
            </div>

            {/* Right: Content */}
            <div className="order-1 lg:order-2">
              <div className="space-y-3 sm:space-y-4 text-gray-600 text-sm sm:text-base leading-relaxed">
                <p>You no longer relate to the people and places you once did. Even those who you thought would always be there just don&apos;t seem to resonate any more...</p>
                <p className="font-semibold">But what if this unraveling is a part of something greater, part of your transformation?</p>
                <p>This pain isn&apos;t here to destroy you—it&apos;s here to break you free. To guide you. To help you release everything that&apos;s not truly you so you can finally step into the light of your authentic self.</p>
                <p className="font-semibold">The question is: how do you navigate the chaos?</p>
                <p>How do you begin to make sense of the confusion and take your first step forward?</p>
              </div>

              <div className="mt-6 sm:mt-8">
                <CTAButton className="w-full sm:w-auto">Instant Download</CTAButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Resistance Mapping System - 5 Phase Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-[#1a1a1a] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left: Phase List */}
            <div className="order-2 lg:order-1">
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl mb-8 sm:mb-12">
                The Resistance Mapping System™
              </h2>

              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h4 className="text-[#d4a574] font-semibold text-sm sm:text-base mb-1 sm:mb-2">Phase 1: Capture the Loop</h4>
                  <p className="text-gray-400 text-xs sm:text-sm">Turn a vague inner spiral into a clear pattern you can see.</p>
                </div>
                <div>
                  <h4 className="text-[#d4a574] font-semibold text-sm sm:text-base mb-1 sm:mb-2">Phase 2: Decode the Signal</h4>
                  <p className="text-gray-400 text-xs sm:text-sm">Identify what the body is communicating beneath the mind&apos;s noise.</p>
                </div>
                <div>
                  <h4 className="text-[#d4a574] font-semibold text-sm sm:text-base mb-1 sm:mb-2">Phase 3: Reveal the Hidden Program</h4>
                  <p className="text-gray-400 text-xs sm:text-sm">Expose the meaning that made the moment feel unsafe.</p>
                </div>
                <div>
                  <h4 className="text-[#d4a574] font-semibold text-sm sm:text-base mb-1 sm:mb-2">Phase 4: Find the Root Belief</h4>
                  <p className="text-gray-400 text-xs sm:text-sm">Trace the pattern back to the core assumption running it.</p>
                </div>
                <div>
                  <h4 className="text-[#d4a574] font-semibold text-sm sm:text-base mb-1 sm:mb-2">Phase 5: Integration and Release</h4>
                  <p className="text-gray-400 text-xs sm:text-sm">Bring the system back to safety, so behavior can change without force.</p>
                </div>
              </div>
            </div>

            {/* Right: Phase Diagram */}
            <div className="flex items-center justify-center order-1 lg:order-2">
              <Image
                src="/images/Products/five-phase-map.png"
                alt="The 5 Phase Resistance Mapping System"
                width={600}
                height={600}
                className="w-full h-auto max-w-[280px] sm:max-w-sm lg:max-w-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Here's What Happens When You Uncover the Root */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Content */}
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#222222] leading-tight mb-4 sm:mb-6">
                Here&apos;s What Happens When You Uncover the Root of Your Pattern
              </h2>

              <div className="space-y-3 sm:space-y-4 text-gray-600 text-sm sm:text-base leading-relaxed">
                <p>When a pattern becomes visible, it loses authority and collapses the distorted energy into a more coherent signal, and your life can reflect that shift.</p>
                <p>Resistance Mapping creates a specific kind of shift. The reaction stops feeling like &ldquo;you,&rdquo; and starts feeling like a program you can see, name, and unwind.</p>
              </div>
            </div>

            {/* Right: Root Pattern Image */}
            <div className="flex items-center justify-center">
              <Image
                src="/images/Products/root-pattern.png"
                alt="What happens when you uncover the root of your pattern"
                width={600}
                height={400}
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Dark Purple */}
      <section className="py-10 sm:py-12 lg:py-16 px-4 sm:px-6 bg-[#1e1b2e]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Benefit 1 */}
            <div className="text-center text-white">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">Find Clarity Amid the Chaos</h3>
              <p className="text-gray-400 text-xs sm:text-sm">Understand the purpose behind your pain and confusion. This book helps you make sense of the Dark Night of the Soul, uncovering its deeper meaning, showing you why it&apos;s the first step toward awakening.</p>
            </div>

            {/* Benefit 2 */}
            <div className="text-center text-white">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">Overcome Hidden Blocks &amp; Self-Sabbotage</h3>
              <p className="text-gray-400 text-xs sm:text-sm">Discover what self-sabotage is, and how to find hidden blocks keeping you from reaching the next level.</p>
            </div>

            {/* Benefit 3 */}
            <div className="text-center text-white sm:col-span-2 md:col-span-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">Reclaim Inner Power</h3>
              <p className="text-gray-400 text-xs sm:text-sm">Learn how to start breaking free from fear, resistance, and the illusions of the false self. This guide equips you with tools to transmute negative beliefs and align with your soul&apos;s authentic frequency.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What People Are Saying - Testimonials Carousel */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#222222] text-center mb-3 sm:mb-4">
            What People Are Saying
          </h2>

          <div className="flex items-center justify-center gap-1 mb-8 sm:mb-12">
            <span className="text-3xl sm:text-4xl text-gray-200">&ldquo;</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Testimonial 1 */}
            <div className="bg-white p-4 sm:p-6 border border-gray-100 rounded-lg">
              <div className="text-2xl sm:text-3xl text-gray-200 mb-3 sm:mb-4">&ldquo;</div>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                If you are craving a deeper understanding of yourself, the universe and why you are here on this earth, &apos;The Way Home&apos; will help illuminate your path. The wisdom in this book will not only serve as a catalyst to your own growth and awakening, but will create a ripple effect on those you encounter and in turn the collective consciousness. &apos;The Way Home&apos; is written in an accessible and easy to understand manner, regardless if you are at the start of your spiritual journey or are an experienced seeker.
              </p>
              <p className="font-semibold text-gray-900 text-xs sm:text-sm">Vanessa W - Australia</p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-4 sm:p-6 border border-gray-100 rounded-lg">
              <div className="text-2xl sm:text-3xl text-gray-200 mb-3 sm:mb-4">&ldquo;</div>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                I just read it and found the information to be really good! I&apos;m going to reread it and do the exercises :)
              </p>
              <p className="font-semibold text-gray-900 text-xs sm:text-sm">Debra K.</p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-4 sm:p-6 border border-gray-100 rounded-lg sm:col-span-2 md:col-span-1">
              <div className="text-2xl sm:text-3xl text-gray-200 mb-3 sm:mb-4">&ldquo;</div>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                I&apos;ve used these exercises to discover programs and beliefs in my sub-conscious that I never knew I had. This allowed me to move past a lot of distortions &amp; destructive patterns.
              </p>
              <p className="font-semibold text-gray-900 text-xs sm:text-sm">Reza Q.</p>
            </div>
          </div>

          {/* Carousel dots */}
          <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
            <button className="w-2 h-2 rounded-full bg-gray-900" />
            <button className="w-2 h-2 rounded-full bg-gray-300" />
            <button className="w-2 h-2 rounded-full bg-gray-300" />
          </div>
        </div>
      </section>

      {/* Your First Step to Freedom Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-[#faf9f7]">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-500 mb-3 sm:mb-4">Are You Ready to Clear Your Blocks?</p>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left: Content */}
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#222222] leading-tight mb-4 sm:mb-6">
                Your First Step to Freedom and Awakening begins here
              </h2>

              <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                &ldquo;Resistance Mapping™&rdquo; – Expanded 2nd Edition is your robust companion for these important steps on your sacred journey.
              </p>

              <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">
                Created for souls standing at the cusp of awakening, this guide provides the answers, clarity, and tools you need to begin navigating through the fears, blocks, and darkness.
              </p>

              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 sm:mb-2">The Hidden Purpose of Your Pain</h4>
                  <p className="text-gray-600 text-xs sm:text-sm">Learn why this transformation is happening and how it&apos;s guiding you to a higher state of being.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 sm:mb-2">How to Unmask the False Self</h4>
                  <p className="text-gray-600 text-xs sm:text-sm">Understand the role of the ego, why it feels like your world is falling apart, and how to transcend its illusions.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 sm:mb-2">Practical Tools for Inner Alignment</h4>
                  <p className="text-gray-600 text-xs sm:text-sm">Techniques to transmute resistance, release fear, and calm the emotional storms as you begin aligning with your soul.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 sm:mb-2">A Blueprint to clear your fears</h4>
                  <p className="text-gray-600 text-xs sm:text-sm">Step-by-step guidance to help you move through the darkness and rediscover your inner light.</p>
                </div>
              </div>
            </div>

            {/* Right: Image + CTA */}
            <div>
              <Image
                src="/images/Lifestyle/lifestyle-couch-reading.jpg"
                alt="Person on couch reading the Resistance Mapping guide"
                width={600}
                height={400}
                className="rounded-lg w-full h-auto mb-6 sm:mb-8"
              />

              <CTAButton className="w-full justify-center">Instant Download</CTAButton>
            </div>
          </div>
        </div>
      </section>

      {/* Bonuses Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-[#1a1a1a] text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl mb-8 sm:mb-12">
            Bonuses When your order today
          </h2>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left: Bonus descriptions */}
            <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
              <div>
                <h4 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">Mini-Course</h4>
                <p className="text-gray-400 text-sm sm:text-base">Gain immediate access to the Resistance Mapping Mini-course, where we walk through the different layers of mind where your blocks and hidden beliefs could be &apos;hiding&apos;.</p>
              </div>

              <div>
                <h4 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">Private Community</h4>
                <p className="text-gray-400 text-sm sm:text-base">Get Free Access to our Private Community <em>Inner Wealth Initiate</em> so you can meet and get to know others who are on the same path of awakening.</p>
              </div>
            </div>

            {/* Right: Product mockups */}
            <div className="relative order-1 lg:order-2">
              <Image
                src="/images/Products/bonus-bundle.png"
                alt="Bonus products included with your order"
                width={600}
                height={400}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-[#1a1a1a] text-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-center mb-3 sm:mb-4">
            What People Are Asking
          </h2>

          <p className="text-center text-gray-400 text-xs sm:text-sm mb-8 sm:mb-12 break-all sm:break-normal">
            Still have questions? Contact: info@innerwealthinitiate.com
          </p>

          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === index}
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
