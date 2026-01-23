"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { useSessionId } from "@/hooks/useSessionId";
import { ga4 } from "@/lib/ga4";

function Upsell2Content() {
  const sessionId = useSessionId();

  // Track upsell viewed on mount
  useEffect(() => {
    ga4.upsellView(2, 'Bridge to Mastery', 0);
  }, []);

  const CTAButton = ({ className = "" }: { className?: string }) => (
    <a
      href="https://lunacal.ai/todd-hamam/bridge-to-mastery-discovery-call?date=2026-01-22&month=2026-01"
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        ga4.upsellAccepted(2, 'Bridge to Mastery', 0);
      }}
      className={`w-full bg-white hover:bg-gray-200 text-black font-bold py-4 px-5 md:py-5 md:px-8 text-base md:text-lg transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg rounded-md ${className}`}
    >
      <span className="text-center leading-tight">Book Discovery Call</span>
      <svg className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </a>
  );

  const DeclineLink = ({ className = "" }: { className?: string }) => (
    <Link
      href={`/thank-you?session_id=${sessionId}`}
      className={`block text-center text-white hover:text-gray-300 text-sm mt-3 underline ${className}`}
      onClick={() => {
        ga4.upsellDeclined(2, 'Bridge to Mastery', 0);
      }}
    >
      No thanks, I don&apos;t want personal guidance
    </Link>
  );

  return (
    <main className="min-h-screen bg-white">
      {/* Header with Logo */}
      <header className="py-6 px-4 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <Image
            src="/logo.png"
            alt="Inner Wealth Initiate"
            width={200}
            height={50}
            className="mx-auto"
          />
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-black py-4 md:py-6 px-2 md:px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-start justify-between">
            {/* Step 1 - Completed */}
            <div className="flex flex-col items-center min-w-0">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-gray-500 bg-black flex items-center justify-center">
                <span className="text-gray-400 text-xs md:text-sm font-medium">1</span>
              </div>
              <span className="text-gray-400 text-[10px] md:text-xs mt-1 md:mt-2 text-center leading-tight max-w-[60px] md:max-w-none">Resistance Map™</span>
            </div>

            {/* Line 1-2 */}
            <div className="flex-1 flex items-center h-6 md:h-8 mx-1">
              <div className="w-full h-px bg-gray-600" />
            </div>

            {/* Step 2 - Completed */}
            <div className="flex flex-col items-center min-w-0">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-gray-500 bg-black flex items-center justify-center">
                <span className="text-gray-400 text-xs md:text-sm font-medium">2</span>
              </div>
              <span className="text-gray-400 text-[10px] md:text-xs mt-1 md:mt-2 text-center leading-tight max-w-[60px] md:max-w-none">Flagship Program</span>
            </div>

            {/* Line 2-3 */}
            <div className="flex-1 flex items-center h-6 md:h-8 mx-1">
              <div className="w-full h-px bg-gray-600" />
            </div>

            {/* Step 3 - Current (highlighted in gold) */}
            <div className="flex flex-col items-center min-w-0">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-[#d4a574] bg-[#d4a574] flex items-center justify-center">
                <span className="text-black text-xs md:text-sm font-bold">3</span>
              </div>
              <span className="text-[#d4a574] text-[10px] md:text-xs mt-1 md:mt-2 text-center font-medium leading-tight max-w-[60px] md:max-w-none">Bridge to Mastery</span>
            </div>

            {/* Line 3-4 */}
            <div className="flex-1 flex items-center h-6 md:h-8 mx-1">
              <div className="w-full h-px bg-gray-600" />
            </div>

            {/* Step 4 - Upcoming */}
            <div className="flex flex-col items-center min-w-0">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-gray-500 bg-black flex items-center justify-center">
                <span className="text-gray-400 text-xs md:text-sm font-medium">4</span>
              </div>
              <span className="text-gray-400 text-[10px] md:text-xs mt-1 md:mt-2 text-center leading-tight max-w-[60px] md:max-w-none">Order Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-black text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-white text-xl md:text-2xl font-medium mb-4 underline decoration-white">
            One Last Step! Before Accessing Your Order...
          </p>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-medium mb-4 leading-tight">
            If You Want Personal 1-on-1
            <span className="hidden md:inline"><br /></span>
            <span className="md:hidden"> </span>
            Guided Support
          </h1>
          <p className="text-gray-400 mb-8">
            Watch This Short Video...
          </p>

          {/* Video Section - Wistia Embed */}
          <div className="relative rounded-lg overflow-hidden mb-8">
            <Script src="https://fast.wistia.com/embed/medias/iy025kh5hb.jsonp" strategy="lazyOnload" />
            <Script src="https://fast.wistia.com/assets/external/E-v1.js" strategy="lazyOnload" />
            <div className="wistia_responsive_padding" style={{ padding: "56.25% 0 0 0", position: "relative" }}>
              <div className="wistia_responsive_wrapper" style={{ height: "100%", left: 0, position: "absolute", top: 0, width: "100%" }}>
                <div className="wistia_embed wistia_async_iy025kh5hb seo=true videoFoam=true" style={{ height: "100%", position: "relative", width: "100%" }}>
                  <div className="wistia_swatch" style={{ height: "100%", left: 0, opacity: 0, overflow: "hidden", position: "absolute", top: 0, transition: "opacity 200ms", width: "100%" }}>
                    <img
                      src="https://fast.wistia.com/embed/medias/iy025kh5hb/swatch"
                      style={{ filter: "blur(5px)", height: "100%", objectFit: "contain", width: "100%" }}
                      alt=""
                      aria-hidden="true"
                      onLoad={(e) => { (e.target as HTMLElement).parentElement!.style.opacity = "1"; }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="max-w-lg mx-auto px-2">
            <CTAButton />
            <p className="text-white text-xs md:text-sm mt-2 text-center">
              Book a free discovery call to explore 1-on-1 guidance
            </p>
            <DeclineLink />
          </div>
        </div>
      </section>

      {/* What Is Bridge to Mastery */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl italic text-center mb-6">
            What Is Bridge to Mastery™?
          </h2>
          <p className="text-center text-gray-700 italic mb-12">
            An 8-week transformative journey with personal guidance to help you move from fear and separation into stabilized awareness.
          </p>

          <div className="border-l-4 border-gray-900 pl-6 mb-12">
            <h3 className="font-serif text-2xl italic mb-4">
              This Is For Those Who Want Direct Support
            </h3>
            <div className="text-gray-700 space-y-4">
              <p>The programs you have access to are complete systems.</p>
              <p>But some people want more.</p>
              <p>They want someone to walk alongside them.</p>
              <p>To answer questions in real time.</p>
              <p>To adjust the work to their specific situation.</p>
              <p className="font-medium">That is what Bridge to Mastery provides.</p>
            </div>
          </div>

          <h3 className="font-serif text-2xl italic mb-4">
            What You Get
          </h3>
          <div className="text-gray-700 space-y-4 mb-12">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>8 weeks of guided 1-on-1 support</li>
              <li>Personalized sessions based on your specific blocks</li>
              <li>Direct access for questions between sessions</li>
              <li>Customized practices for your situation</li>
              <li>Accountability and progress tracking</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-[#1a1512] via-[#2a1f1a] to-[#1a1512]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-white font-serif text-3xl md:text-4xl mb-6">
            Ready to Explore Personal Guidance?
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Book a free discovery call to see if Bridge to Mastery is right for your journey.
          </p>

          {/* CTA */}
          <div className="max-w-lg mx-auto px-2">
            <CTAButton />
            <p className="text-gray-500 text-xs md:text-sm mt-2 text-center">
              No obligation - just a conversation
            </p>
            <DeclineLink />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-black">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center gap-6 mb-4 text-sm">
            <Link href="/privacy" className="text-gray-400 hover:text-white underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white underline">
              Terms of Service
            </Link>
            <Link href="/refund" className="text-gray-400 hover:text-white underline">
              Refund Policy
            </Link>
          </div>
          <p className="text-center text-sm text-gray-500">All rights reserved {new Date().getFullYear()}.</p>
        </div>
      </footer>
    </main>
  );
}

export default function Upsell2Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <Upsell2Content />
    </Suspense>
  );
}
