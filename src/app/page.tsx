"use client";

import Link from "next/link";
import { useState } from "react";

// Download icon component
function DownloadIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

// CTA Button with download icon
function CTAButton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <Link
      href="/product"
      className={`inline-flex items-center justify-center gap-2 bg-[#222222] text-white px-8 py-4 text-sm font-medium tracking-wide hover:bg-black transition-colors ${className}`}
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
    "Device",
    "Begin Your Transformation",
    "Practical Exercises",
    "5 Star reviews",
    "Instant Download",
    "Read From Any Device",
  ];

  return (
    <div className="bg-white border-t border-gray-200 py-3 overflow-x-auto">
      <div className="flex items-center justify-center gap-8 px-4 min-w-max">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
            {item === "5 Star reviews" ? (
              <>
                <span>{item}</span>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3 h-3 text-yellow-500 fill-current" viewBox="0 0 20 20">
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
        className="w-full px-6 py-4 text-left flex items-center justify-between text-gray-900 font-medium"
      >
        <span>{question}</span>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 pb-4 text-gray-600">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function SalesPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

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
      {/* Hero Section */}
      <section className="relative">
        {/* Badge */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-[#8B7355] text-white text-xs px-3 py-1.5 rounded border border-[#6B5344]">
            <span className="font-medium">Expanded</span>
            <br />
            <span className="text-[10px]">2nd Edition</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 min-h-[500px]">
          {/* Left: Product Image Area */}
          <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] relative overflow-hidden flex items-center justify-center p-8">
            {/* Aurora effect placeholder */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-emerald-900/20 to-emerald-500/30" />

            {/* Product mockup placeholder */}
            <div className="relative z-10 text-center">
              <div className="bg-[#2a2a3e] rounded-lg p-8 shadow-2xl max-w-sm mx-auto">
                <div className="bg-gradient-to-b from-[#d4a574] to-[#b8956c] rounded p-6 text-center">
                  <p className="text-[#1a1a2e] text-xs uppercase tracking-widest mb-2">The</p>
                  <h3 className="text-[#1a1a2e] text-2xl font-serif font-bold">RESISTANCE</h3>
                  <h3 className="text-[#1a1a2e] text-2xl font-serif font-bold">MAP</h3>
                  <div className="w-16 h-16 mx-auto my-4">
                    <svg className="w-full h-full text-[#1a1a2e]" viewBox="0 0 100 100" fill="currentColor">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2"/>
                      {[...Array(12)].map((_, i) => (
                        <line key={i} x1="50" y1="10" x2="50" y2="20" stroke="currentColor" strokeWidth="2" transform={`rotate(${i * 30} 50 50)`}/>
                      ))}
                    </svg>
                  </div>
                  <p className="text-[#1a1a2e] text-xs">TODD HAMASH</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-4">Product mockup - replace with actual image</p>
            </div>
          </div>

          {/* Right: Content */}
          <div className="flex flex-col justify-center p-8 lg:p-12">
            <h1 className="font-serif text-4xl lg:text-5xl text-[#222222] leading-tight mb-6">
              Clear the Fears, Blocks &amp; Patterns That Keep You Stuck
            </h1>

            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              The Resistance Mapping™ Expanded 2nd Edition is a System that helps you identify the deeper cause behind your fear &amp; blocks so you can finally clear them, and align with your true self.
            </p>

            <div className="mb-8">
              <CTAButton>Instant Download</CTAButton>
            </div>

            <p className="text-gray-500 italic text-sm">
              &ldquo;The Journey of a Thousand Miles begins with a single step.&rdquo; - Lao Tsu
            </p>
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav />
      </section>

      {/* Are You Ready to Break the Loop? Section */}
      <section className="py-20 px-4 bg-[#faf9f7]">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">INSTANT DOWNLOAD</p>

              <h2 className="font-serif text-4xl lg:text-5xl text-[#222222] leading-tight mb-8">
                Are You Ready to Break the Loop?
              </h2>

              <div className="space-y-6 text-gray-700 uppercase text-sm tracking-wide leading-relaxed">
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

              <div className="mt-8">
                <CTAButton>Instant Download</CTAButton>
              </div>
            </div>

            {/* Right: Product Image */}
            <div className="relative">
              <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] rounded-lg p-8 flex items-center justify-center min-h-[400px]">
                {/* Placeholder for product image with candles */}
                <div className="text-center">
                  <div className="bg-[#2a2a3e] rounded-lg p-6 shadow-xl">
                    <div className="bg-gradient-to-b from-[#d4a574] to-[#b8956c] rounded p-4 w-32 mx-auto">
                      <p className="text-[#1a1a2e] text-xs font-serif font-bold">RESISTANCE MAP</p>
                    </div>
                  </div>
                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                      <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mt-4">Replace with actual product image</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* No More Guesswork - Comparison Section */}
      <section className="py-20 px-4 bg-[#f5f3ef]">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl lg:text-4xl text-[#222222] text-center mb-12">
            No More Guesswork
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Effort-Based Tools */}
            <div className="bg-white p-8 rounded-lg">
              <h3 className="text-sm uppercase tracking-widest text-gray-500 mb-6 font-medium">
                EFFORT-BASED TOOLS
              </h3>
              <ul className="space-y-4">
                {["Therapy", "Breathwork", "Regulation tools", "Positive thinking", "Willpower"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-700">
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-sm text-gray-500">
                Helps you <span className="font-semibold">manage</span> the reaction
              </p>
            </div>

            {/* Resistance Mapping */}
            <div className="bg-white p-8 rounded-lg">
              <h3 className="text-sm uppercase tracking-widest text-[#b8956c] mb-6 font-medium">
                RESISTANCE MAPPING™
              </h3>
              <ul className="space-y-4">
                {["Locate the trigger", "Trace the pattern", "Reveal the root belief"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-700">
                    <span className="w-2 h-2 rounded-full bg-[#b8956c]" />
                    {item}
                  </li>
                ))}
              </ul>

              {/* Diagram */}
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600">
                <span>Trigger</span>
                <span className="text-[#b8956c]">→</span>
                <span className="text-[#b8956c]">Reaction</span>
                <span className="text-[#b8956c]">→</span>
                <span>Repeat</span>
              </div>
              <div className="text-center mt-2">
                <span className="inline-block px-3 py-1 bg-[#f5f3ef] text-[#b8956c] text-xs rounded">
                  Root Belief
                </span>
                <p className="text-xs text-gray-400 mt-2">Changes the structure beneath the reaction</p>
              </div>
            </div>
          </div>

          {/* VS badge */}
          <div className="flex justify-center -mt-4 relative z-10">
            <span className="bg-white px-4 py-2 text-gray-400 text-sm font-medium">VS</span>
          </div>

          <p className="text-center text-gray-600 mt-8 max-w-2xl mx-auto">
            When the structure stays the same, effort just repeats the loop.
            <br />
            Change the structure, and the reaction changes on its own.
          </p>
        </div>
      </section>

      {/* What's Inside - Dark Section */}
      <section className="py-20 px-4 bg-[#1a1a1a] text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl lg:text-4xl text-center mb-4">
            What&apos;s Inside The Expanded 2nd Edition
          </h2>

          <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
            You don&apos;t have to do this alone. You&apos;ve been sent a guide to help you discover and understand your fear loops clearly, so you can transform... It&apos;s time to awaken...
          </p>

          {/* Product showcase area */}
          <div className="bg-[#252525] rounded-lg p-8 mb-12">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
              {/* Left features */}
              <div className="space-y-8 text-right lg:w-1/4">
                <div>
                  <div className="flex items-center justify-end gap-2 mb-2">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold mb-1">Quick Run (15 minutes)</h4>
                  <p className="text-sm text-gray-400">Map the loop while you are triggered so you can get clarity fast, instead of spiraling.</p>
                </div>
              </div>

              {/* Center product image */}
              <div className="lg:w-2/4 flex justify-center">
                <div className="bg-gradient-to-b from-[#d4a574] to-[#b8956c] rounded-lg p-6 w-48">
                  <p className="text-[#1a1a2e] text-center text-xs uppercase tracking-widest mb-1">The</p>
                  <h3 className="text-[#1a1a2e] text-center text-xl font-serif font-bold">RESISTANCE MAP</h3>
                  <p className="text-[#1a1a2e] text-center text-xs mt-4">Todd Hamash</p>
                </div>
              </div>

              {/* Right features */}
              <div className="space-y-8 text-left lg:w-1/4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold mb-1">Guided Prompts + Real Examples</h4>
                  <p className="text-sm text-gray-400">You are never left guessing what to do next. Follow the prompts, see worked examples, and apply it to your own life immediately.</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mb-12">
            <Link
              href="/product"
              className="inline-flex items-center justify-center gap-2 border border-white text-white px-8 py-4 text-sm font-medium tracking-wide hover:bg-white hover:text-black transition-colors"
            >
              Instant Download
              <DownloadIcon className="w-4 h-4" />
            </Link>
          </div>

          {/* More features */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h4 className="font-semibold mb-2">Printable Worksheets + Instant Download</h4>
              <p className="text-sm text-gray-400">Use it on any device, print the pages if you want, and return to the method whenever the pattern shows up again.</p>
            </div>

            <div className="text-center md:text-right">
              <div className="flex items-center justify-center md:justify-end gap-2 mb-2">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <h4 className="font-semibold mb-2">How to Use the Resistance Map™ (Step-by-Step Walkthrough)</h4>
              <p className="text-sm text-gray-400">A clear guided walkthrough showing you exactly how to run the map, what to write, and how to follow the process.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Every Dark Night Promises a New Dawn Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: Content */}
            <div>
              <h2 className="font-serif text-3xl lg:text-4xl text-[#222222] leading-tight mb-6">
                Every Dark Night Promises a New Dawn
              </h2>

              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>If you&apos;ve landed here on this page, chances are life feels heavier than ever.</p>
                <p className="italic">...Like the rug&apos;s been ripped out from underneath you.</p>
                <p>Things that used to bring you joy now feels like a prison—a version of yourself that you&apos;ve outgrown.</p>
                <p>You feel like you&apos;re losing yourself...</p>
                <p>...you&apos;re questioning everything you thought you knew.</p>
                <p>The emotional pain, the loneliness, the sense of emptiness—it almost feels too much to bear at times.</p>
              </div>
            </div>

            {/* Right: Image Placeholder */}
            <div className="relative">
              <div className="bg-[#f5f3ef] rounded-lg min-h-[400px] flex items-center justify-center p-8">
                <div className="text-center text-gray-400">
                  <p>Lifestyle image placeholder</p>
                  <p className="text-sm">(Person at desk with candles, laptop showing product)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Second row */}
          <div className="grid lg:grid-cols-2 gap-12 items-start mt-12">
            {/* Left: Image Placeholder */}
            <div className="relative order-2 lg:order-1">
              <div className="bg-[#f5f3ef] rounded-lg min-h-[400px] flex items-center justify-center p-8">
                <div className="text-center text-gray-400">
                  <p>Lifestyle image placeholder</p>
                  <p className="text-sm">(Person holding tablet showing the 5-phase map)</p>
                </div>
              </div>
            </div>

            {/* Right: Content */}
            <div className="order-1 lg:order-2">
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>You no longer relate to the people and places you once did. Even those who you thought would always be there just don&apos;t seem to resonate any more...</p>
                <p className="font-semibold">But what if this unraveling is a part of something greater, part of your transformation?</p>
                <p>This pain isn&apos;t here to destroy you—it&apos;s here to break you free. To guide you. To help you release everything that&apos;s not truly you so you can finally step into the light of your authentic self.</p>
                <p className="font-semibold">The question is: how do you navigate the chaos?</p>
                <p>How do you begin to make sense of the confusion and take your first step forward?</p>
              </div>

              <div className="mt-8">
                <CTAButton>Instant Download</CTAButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Resistance Mapping System - 5 Phase Section */}
      <section className="py-20 px-4 bg-[#1a1a1a] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: Phase List */}
            <div>
              <h2 className="font-serif text-3xl lg:text-4xl mb-12">
                The Resistance Mapping System™
              </h2>

              <div className="space-y-8">
                <div>
                  <h4 className="text-[#d4a574] font-semibold mb-2">Phase 1: Capture the Loop</h4>
                  <p className="text-gray-400 text-sm">Turn a vague inner spiral into a clear pattern you can see.</p>
                </div>
                <div>
                  <h4 className="text-[#d4a574] font-semibold mb-2">Phase 2: Decode the Signal</h4>
                  <p className="text-gray-400 text-sm">Identify what the body is communicating beneath the mind&apos;s noise.</p>
                </div>
                <div>
                  <h4 className="text-[#d4a574] font-semibold mb-2">Phase 3: Reveal the Hidden Program</h4>
                  <p className="text-gray-400 text-sm">Expose the meaning that made the moment feel unsafe.</p>
                </div>
                <div>
                  <h4 className="text-[#d4a574] font-semibold mb-2">Phase 4: Find the Root Belief</h4>
                  <p className="text-gray-400 text-sm">Trace the pattern back to the core assumption running it.</p>
                </div>
                <div>
                  <h4 className="text-[#d4a574] font-semibold mb-2">Phase 5: Integration and Release</h4>
                  <p className="text-gray-400 text-sm">Bring the system back to safety, so behavior can change without force.</p>
                </div>
              </div>
            </div>

            {/* Right: Phase Diagram */}
            <div className="bg-[#252525] rounded-lg p-8 border border-[#3a3a3a]">
              <h3 className="text-center text-[#d4a574] font-serif text-2xl mb-8">The 5 Phase Map</h3>

              {/* Diagram */}
              <div className="flex items-center justify-center gap-2 mb-8">
                {["Capture", "Decode", "Reveal", "Root", "Integrate"].map((phase, index) => (
                  <div key={phase} className="flex items-center">
                    <div className="w-16 h-16 rounded-full border-2 border-[#d4a574] flex items-center justify-center">
                      <span className="text-[#d4a574] text-xs text-center">{phase}</span>
                    </div>
                    {index < 4 && (
                      <div className="w-4 h-0.5 bg-[#d4a574]" />
                    )}
                  </div>
                ))}
              </div>

              <p className="text-center text-gray-400 text-sm italic">
                A repeatable sequence, not a mindset.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Here's What Happens When You Uncover the Root */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              <h2 className="font-serif text-3xl lg:text-4xl text-[#222222] leading-tight mb-6">
                Here&apos;s What Happens When You Uncover the Root of Your Pattern
              </h2>

              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>When a pattern becomes visible, it loses authority and collapses the distorted energy into a more coherent signal, and your life can reflect that shift.</p>
                <p>Resistance Mapping creates a specific kind of shift. The reaction stops feeling like &ldquo;you,&rdquo; and starts feeling like a program you can see, name, and unwind.</p>
              </div>
            </div>

            {/* Right: Symbols Panel */}
            <div className="bg-[#1a1a1a] rounded-lg p-8 text-white">
              <p className="text-center text-[#d4a574] text-xs uppercase tracking-widest mb-8">INNER WEALTH INITIATE</p>

              <div className="flex justify-center gap-8">
                {/* Symbol 1 */}
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-16 h-16 text-[#d4a574]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
                      <ellipse cx="50" cy="50" rx="30" ry="45" />
                      <ellipse cx="50" cy="50" rx="45" ry="30" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-400">Distortion Loop</p>
                </div>

                {/* Symbol 2 */}
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-16 h-16 text-[#d4a574]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
                      <circle cx="50" cy="50" r="20" />
                      <circle cx="50" cy="50" r="35" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-400">Frequency Collapses</p>
                </div>

                {/* Symbol 3 */}
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-16 h-16 text-[#d4a574]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
                      <circle cx="50" cy="50" r="10" />
                      {[...Array(8)].map((_, i) => (
                        <line key={i} x1="50" y1="15" x2="50" y2="25" stroke="currentColor" strokeWidth="1" transform={`rotate(${i * 45} 50 50)`}/>
                      ))}
                      <circle cx="50" cy="50" r="40" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-400">Clear Field</p>
                </div>
              </div>

              <p className="text-center text-gray-400 text-xs mt-8 italic">
                When the distortion dissolves, your reality responds differently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Dark Purple */}
      <section className="py-16 px-4 bg-[#1e1b2e]">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="text-center text-white">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Find Clarity Amid the Chaos</h3>
              <p className="text-gray-400 text-sm">Understand the purpose behind your pain and confusion. This book helps you make sense of the Dark Night of the Soul, uncovering its deeper meaning, showing you why it&apos;s the first step toward awakening.</p>
            </div>

            {/* Benefit 2 */}
            <div className="text-center text-white">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Overcome Hidden Blocks &amp; Self-Sabbotage</h3>
              <p className="text-gray-400 text-sm">Discover what self-sabotage is, and how to find hidden blocks keeping you from reaching the next level.</p>
            </div>

            {/* Benefit 3 */}
            <div className="text-center text-white">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Reclaim Inner Power</h3>
              <p className="text-gray-400 text-sm">Learn how to start breaking free from fear, resistance, and the illusions of the false self. This guide equips you with tools to transmute negative beliefs and align with your soul&apos;s authentic frequency.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What People Are Saying - Testimonials Carousel */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl lg:text-4xl text-[#222222] text-center mb-4">
            What People Are Saying
          </h2>

          <div className="flex items-center justify-center gap-1 mb-12">
            <span className="text-4xl text-gray-200">&ldquo;</span>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="bg-white p-6 border border-gray-100 rounded-lg">
              <div className="text-3xl text-gray-200 mb-4">&ldquo;</div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                If you are craving a deeper understanding of yourself, the universe and why you are here on this earth, &apos;The Way Home&apos; will help illuminate your path. The wisdom in this book will not only serve as a catalyst to your own growth and awakening, but will create a ripple effect on those you encounter and in turn the collective consciousness. &apos;The Way Home&apos; is written in an accessible and easy to understand manner, regardless if you are at the start of your spiritual journey or are an experienced seeker.
              </p>
              <p className="font-semibold text-gray-900 text-sm">Vanessa W - Australia</p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-6 border border-gray-100 rounded-lg">
              <div className="text-3xl text-gray-200 mb-4">&ldquo;</div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                I just read it and found the information to be really good! I&apos;m going to reread it and do the exercises :)
              </p>
              <p className="font-semibold text-gray-900 text-sm">Debra K.</p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-6 border border-gray-100 rounded-lg">
              <div className="text-3xl text-gray-200 mb-4">&ldquo;</div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                I&apos;ve used these exercises to discover programs and beliefs in my sub-conscious that I never knew I had. This allowed me to move past a lot of distortions &amp; destructive patterns.
              </p>
              <p className="font-semibold text-gray-900 text-sm">Reza Q.</p>
            </div>
          </div>

          {/* Carousel dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <button className="w-2 h-2 rounded-full bg-gray-900" />
            <button className="w-2 h-2 rounded-full bg-gray-300" />
            <button className="w-2 h-2 rounded-full bg-gray-300" />
          </div>
        </div>
      </section>

      {/* Your First Step to Freedom Section */}
      <section className="py-20 px-4 bg-[#faf9f7]">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Are You Ready to Clear Your Blocks?</p>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: Content */}
            <div>
              <h2 className="font-serif text-3xl lg:text-4xl text-[#222222] leading-tight mb-6">
                Your First Step to Freedom and Awakening begins here
              </h2>

              <p className="text-gray-600 mb-6">
                &ldquo;Resistance Mapping™&rdquo; – Expanded 2nd Edition is your robust companion for these important steps on your sacred journey.
              </p>

              <p className="text-gray-600 mb-8">
                Created for souls standing at the cusp of awakening, this guide provides the answers, clarity, and tools you need to begin navigating through the fears, blocks, and darkness.
              </p>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">The Hidden Purpose of Your Pain</h4>
                  <p className="text-gray-600 text-sm">Learn why this transformation is happening and how it&apos;s guiding you to a higher state of being.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">How to Unmask the False Self</h4>
                  <p className="text-gray-600 text-sm">Understand the role of the ego, why it feels like your world is falling apart, and how to transcend its illusions.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Practical Tools for Inner Alignment</h4>
                  <p className="text-gray-600 text-sm">Techniques to transmute resistance, release fear, and calm the emotional storms as you begin aligning with your soul.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">A Blueprint to clear your fears</h4>
                  <p className="text-gray-600 text-sm">Step-by-step guidance to help you move through the darkness and rediscover your inner light.</p>
                </div>
              </div>
            </div>

            {/* Right: Image + CTA */}
            <div>
              <div className="bg-[#f5f3ef] rounded-lg min-h-[300px] flex items-center justify-center p-8 mb-8">
                <div className="text-center text-gray-400">
                  <p>Lifestyle image placeholder</p>
                  <p className="text-sm">(Person on couch with tablet showing guide)</p>
                </div>
              </div>

              <CTAButton className="w-full justify-center">Instant Download</CTAButton>
            </div>
          </div>
        </div>
      </section>

      {/* Bonuses Section */}
      <section className="py-20 px-4 bg-[#1a1a1a] text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl lg:text-4xl mb-12">
            Bonuses When your order today
          </h2>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: Bonus descriptions */}
            <div className="space-y-8">
              <div>
                <h4 className="font-semibold text-lg mb-2">Mini-Course</h4>
                <p className="text-gray-400">Gain immediate access to the Resistance Mapping Mini-course, where we walk through the different layers of mind where your blocks and hidden beliefs could be &apos;hiding&apos;.</p>
              </div>

              <div>
                <h4 className="font-semibold text-lg mb-2">Private Community</h4>
                <p className="text-gray-400">Get Free Access to our Private Community <em>Inner Wealth Initiate</em> so you can meet and get to know others who are on the same path of awakening.</p>
              </div>
            </div>

            {/* Right: Product mockups */}
            <div className="relative">
              <div className="bg-[#252525] rounded-lg p-8 flex items-center justify-center min-h-[300px]">
                <div className="text-center text-gray-400">
                  <p>Bonus products mockup</p>
                  <p className="text-sm">(Multiple device mockups with BONUSES INCLUDED badge)</p>
                </div>
              </div>
              {/* Gold badge */}
              <div className="absolute top-4 right-4 bg-gradient-to-br from-amber-400 to-amber-600 text-xs font-bold text-amber-900 px-3 py-2 rounded-full">
                BONUSES<br/>INCLUDED
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-[#1a1a1a] text-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl lg:text-4xl text-center mb-4">
            What People Are Asking
          </h2>

          <p className="text-center text-gray-400 text-sm mb-12">
            Still have questions? Contact: info@innerwealthinitiate.com
          </p>

          <div className="space-y-4">
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

      {/* Footer */}
      <footer className="py-8 px-4 bg-[#1a1a1a] border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-500">
          <div className="flex justify-center gap-8 mb-4">
            <Link href="/privacy" className="hover:text-gray-300">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-300">Terms Of Service</Link>
            <Link href="/refund" className="hover:text-gray-300">Refund Policy</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} Inner Wealth Initiate. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
