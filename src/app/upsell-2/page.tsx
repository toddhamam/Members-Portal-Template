"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// Lotus/flame logo icon
function LogoIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none">
      {/* Outer glow circle */}
      <circle cx="20" cy="20" r="18" stroke="url(#logoGradient)" strokeWidth="1" opacity="0.5" />
      {/* Inner lotus/flame shape */}
      <path
        d="M20 6c0 0-8 8-8 16c0 4 3.5 8 8 8s8-4 8-8c0-8-8-16-8-16z"
        fill="url(#logoGradient)"
        opacity="0.8"
      />
      <path
        d="M20 10c0 0-5 5-5 11c0 2.5 2 5 5 5s5-2.5 5-5c0-6-5-11-5-11z"
        fill="url(#logoGradient)"
      />
      <defs>
        <linearGradient id="logoGradient" x1="20" y1="0" x2="20" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#d4a574" />
          <stop offset="1" stopColor="#b8956c" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Calendar icon for CTA
function CalendarIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function Upsell2Content() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const steps = [
    { number: "Step 1:", label: "Order Guide", active: true },
    { number: "2:", label: "Flagship Program", active: true },
    { number: "3:", label: "Bridge to Mastery", active: true, current: true },
    { number: "4:", label: "Order Complete", active: false },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header with Logo */}
      <header className="py-6 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-3">
          <LogoIcon className="w-10 h-10" />
          <span className="text-lg tracking-[0.15em] font-light">
            INNER WEALTH INITIATE<span className="align-super text-[10px] ml-0.5">™</span>
          </span>
        </div>
      </header>

      {/* Step Progress Bar */}
      <div className="px-4 mb-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className={`
                    px-4 py-2 text-xs tracking-wide border transition-all
                    ${step.current
                      ? "bg-white text-black border-white font-medium"
                      : step.active
                        ? "bg-transparent text-white/70 border-white/30"
                        : "bg-transparent text-white/40 border-white/20"
                    }
                  `}
                >
                  <span className="opacity-70">{step.number}</span> {step.label}
                </div>
                {index < steps.length - 1 && (
                  <div className="w-4 h-px bg-white/20" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4">
        {/* Headlines */}
        <div className="text-center mb-8">
          <p className="text-[#d4a574] text-sm mb-4 tracking-wide">
            One Last Step! Before Accessing Your Order...
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight tracking-tight">
            If You Want Personal 1-on-1
            <br />
            Guided Support
          </h1>
          <p className="text-white/60 text-lg">
            Watch This Short Video...
          </p>
        </div>

        {/* Click to turn on sound */}
        <div className="text-right mb-2 pr-2">
          <span className="text-[#d4a574] text-sm">Click To Turn On The Sound</span>
        </div>

        {/* Video Section */}
        <div className="relative mb-10">
          <div className="relative rounded-lg overflow-hidden border border-white/10">
            {/* Video container with split layout */}
            <div className="flex aspect-video">
              {/* Left side - Mountain meditation imagery */}
              <div className="w-1/2 relative bg-gradient-to-b from-[#2d1b4e] via-[#4a2c6a] to-[#1a1a2e] overflow-hidden">
                {/* Mountain silhouette */}
                <div className="absolute inset-0">
                  {/* Sky gradient */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#8b5a9e]/80 via-[#c77dab]/60 to-[#e8a87c]/40" />

                  {/* Mountains */}
                  <svg className="absolute bottom-0 w-full h-3/4" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice">
                    {/* Back mountains - darker */}
                    <path d="M0 300 L0 180 L80 120 L150 160 L200 100 L280 150 L350 80 L400 140 L400 300 Z" fill="#2d1b4e" />
                    {/* Mid mountains */}
                    <path d="M0 300 L0 220 L60 180 L120 200 L180 150 L250 190 L320 140 L400 180 L400 300 Z" fill="#1e1232" />
                    {/* Front mountains - darkest */}
                    <path d="M0 300 L0 260 L100 220 L200 250 L300 210 L400 240 L400 300 Z" fill="#0f0a18" />
                  </svg>

                  {/* Meditating figure silhouette */}
                  <div className="absolute bottom-[30%] left-1/2 -translate-x-1/2">
                    <svg className="w-20 h-20" viewBox="0 0 60 60" fill="#0a0610">
                      {/* Head */}
                      <circle cx="30" cy="12" r="8" />
                      {/* Body in lotus position */}
                      <path d="M30 20 Q30 35 15 45 Q25 42 30 44 Q35 42 45 45 Q30 35 30 20" />
                      {/* Crossed legs */}
                      <ellipse cx="30" cy="48" rx="18" ry="6" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Right side - Video content area */}
              <div className="w-1/2 bg-[#0a0a0f] relative p-6 flex flex-col">
                {/* Video placeholder with presenter thumbnail */}
                <div className="absolute top-4 right-4 w-24 h-20 bg-gray-800 rounded overflow-hidden border border-white/10">
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-gray-600" />
                  </div>
                </div>

                {/* Content */}
                <div className="mt-auto">
                  <h2 className="text-2xl font-bold mb-4">
                    Bridge to Mastery<span className="align-super text-sm">™</span>
                  </h2>
                  <p className="text-white/60 text-sm leading-relaxed">
                    An 8-week <span className="inline-flex items-center gap-1 text-white/80">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      formative
                    </span> journey to unwind the turbulence, and bridge the gap between
                    fear/separation consciousness, and begin to stabilize your experience in your true nature 1
                    AM awareness.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-4 max-w-xl mx-auto mb-16">
          <Link
            href={`/thank-you?session_id=${sessionId}&booked=true`}
            className="group w-full flex items-center justify-center gap-3 bg-white text-black py-4 px-8 text-lg font-semibold hover:bg-white/90 transition-colors"
          >
            Book Discovery Call
            <CalendarIcon className="w-5 h-5" />
          </Link>

          <Link
            href={`/thank-you?session_id=${sessionId}`}
            className="block w-full text-center py-3 text-white/50 hover:text-white/70 transition-colors text-sm underline underline-offset-2"
          >
            No thanks, I don&apos;t want personal guidance
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center text-sm text-white/40">
          <p>All rights reserved {new Date().getFullYear()}.</p>
        </div>
      </footer>
    </main>
  );
}

export default function Upsell2Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <Upsell2Content />
    </Suspense>
  );
}
