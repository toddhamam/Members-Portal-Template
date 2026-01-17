"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function Downsell1Content() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/upsell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          product: "nervous_system_reset",
          amount: 2700, // $27 in cents
        }),
      });

      const data = await response.json();
      if (data.success) {
        window.location.href = "/upsell-2?session_id=" + sessionId;
      } else {
        alert("There was an issue processing your order. Please try again.");
        setIsProcessing(false);
      }
    } catch {
      alert("Error processing your order. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Header with Step Indicator */}
      <header className="py-4 px-4 border-b border-gray-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-gray-400">Inner Wealth Initiate</span>
          <span className="text-sm text-[var(--accent)] font-medium">Step 2 of 4</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Processing Notice */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-900/50 text-green-400 px-4 py-2 rounded-full text-sm">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Your order is being processed...
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center mb-12">
          <p className="text-[var(--accent)] font-medium mb-4 uppercase tracking-wide text-sm">
            Wait! Almost There...
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Not Ready for the Full System?
            <br />
            <span className="text-[var(--accent)]">Start With the Foundation</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            A step-by-step nervous system reset guide to help release fear charge, reduce tension, and restore calm.
          </p>
        </div>

        {/* Price Box */}
        <div className="bg-gray-800 rounded-2xl p-8 mb-8 text-center">
          <p className="text-gray-400 mb-2">Special Reduced Price</p>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-5xl font-bold">$27</span>
            <span className="text-gray-400">one-time</span>
          </div>
          <p className="text-sm text-[var(--accent)] mt-2">Add to your order with one click</p>
        </div>

        {/* What's Included */}
        <div className="bg-gray-800/50 rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-center">What&apos;s Included:</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-300">Guided Nervous System Reset Sessions</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-300">Somatic Body Release Protocol</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-300">Trigger-to-Reset Emergency Plan</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-300">Daily Stabilization Rhythm</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-300">7-14 Day Progress Tracker</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-300">Quick Start Path</span>
            </div>
          </div>
        </div>

        {/* Two Modes */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800/50 rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Quick Reset Mode</h3>
            <p className="text-sm text-gray-400">For activation moments when you need immediate calm</p>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Daily Stabilization</h3>
            <p className="text-sm text-gray-400">Baseline training to build long-term resilience</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-4 max-w-xl mx-auto">
          <button
            onClick={handleAccept}
            disabled={isProcessing}
            className="w-full cta-button text-xl py-5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Processing..." : "Yes - Add The Nervous System Reset™ to My Order"}
          </button>

          <Link
            href={`/upsell-2?session_id=${sessionId}`}
            className="block w-full text-center py-4 text-gray-400 hover:text-gray-200 transition-colors text-sm underline"
          >
            No thanks, I don&apos;t want the Nervous System Reset
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-gray-800 mt-12">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Inner Wealth Initiate. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

export default function Downsell1Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900" />}>
      <Downsell1Content />
    </Suspense>
  );
}
