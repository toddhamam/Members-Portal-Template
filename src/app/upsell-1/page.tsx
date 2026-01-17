"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function Upsell1Content() {
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
          product: "pathless_path",
          amount: 14700, // $147 in cents
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
            Wait! Before You Go...
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Resistance Mapping Reveals the Block.
            <br />
            <span className="text-[var(--accent)]">The Pathless Path™</span> Rebuilds Your Entire System.
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            A complete multi-layered system for deep transformation that goes beyond self-improvement.
          </p>
        </div>

        {/* Price Box */}
        <div className="bg-gray-800 rounded-2xl p-8 mb-8 text-center">
          <p className="text-gray-400 mb-2">One-Time Investment</p>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-5xl font-bold">$147</span>
            <span className="text-gray-400">lifetime access</span>
          </div>
          <p className="text-sm text-[var(--accent)] mt-2">Add to your order with one click</p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Physical Body & Nervous System</h3>
            <p className="text-gray-400">Release stored tension and reset your nervous system for lasting calm.</p>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Emotional Charge</h3>
            <p className="text-gray-400">Clear the emotional weight that keeps you stuck in old patterns.</p>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Thought Patterns</h3>
            <p className="text-gray-400">Reprogram limiting beliefs and automatic negative thinking.</p>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Identity Structures</h3>
            <p className="text-gray-400">Transcend the false self and align with your authentic being.</p>
          </div>
        </div>

        {/* Urgency */}
        <div className="bg-orange-900/30 border border-orange-700/50 rounded-xl p-6 mb-8 text-center">
          <p className="text-[var(--accent)] font-semibold">
            This one-time offer is only available right now.
          </p>
          <p className="text-gray-300 text-sm mt-2">
            Once this page is closed, it will not be offered again at this price.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-4 max-w-xl mx-auto">
          <button
            onClick={handleAccept}
            disabled={isProcessing}
            className="w-full cta-button text-xl py-5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Processing..." : "Yes - Add The Pathless Path™ to My Order"}
          </button>

          <Link
            href={`/downsell-1?session_id=${sessionId}`}
            className="block w-full text-center py-4 text-gray-400 hover:text-gray-200 transition-colors text-sm underline"
          >
            No thanks, I don&apos;t want lifetime access at this price
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

export default function Upsell1Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900" />}>
      <Upsell1Content />
    </Suspense>
  );
}
