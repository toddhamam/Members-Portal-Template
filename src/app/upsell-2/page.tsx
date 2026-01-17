"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function Upsell2Content() {
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
          product: "bridge_to_mastery",
          amount: 1495, // $14.95 in cents
        }),
      });

      const data = await response.json();
      if (data.success) {
        window.location.href = "/thank-you?session_id=" + sessionId;
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
          <span className="text-sm text-[var(--accent)] font-medium">Step 3 of 4</span>
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
            Almost done! Finalizing your order...
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center mb-8">
          <p className="text-[var(--accent)] font-medium mb-4 uppercase tracking-wide text-sm">
            One Final Opportunity...
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Bridge to Mastery
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            I really don&apos;t want you to miss out on this one-time offer!
          </p>
        </div>

        {/* Video Placeholder */}
        <div className="bg-gray-800 rounded-2xl aspect-video mb-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-[var(--accent)] flex items-center justify-center mb-4 cursor-pointer hover:scale-105 transition-transform">
              <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <p className="text-gray-400">Watch This Short Video...</p>
            <p className="text-sm text-gray-500 mt-1">Click to turn on the sound</p>
          </div>
        </div>

        {/* Price Box with Discount */}
        <div className="bg-gradient-to-r from-orange-900/50 to-orange-800/50 border border-orange-700/50 rounded-2xl p-8 mb-8 text-center">
          <div className="inline-block bg-[var(--accent)] text-white text-sm font-bold px-4 py-1 rounded-full mb-4">
            SAVE 25% - LIMITED TIME
          </div>
          <p className="text-gray-300 mb-2">Special One-Time Price</p>
          <div className="flex items-baseline justify-center gap-3">
            <span className="text-5xl font-bold">$14.95</span>
            <span className="text-xl text-gray-400 line-through">$19.95</span>
          </div>
          <p className="text-sm text-[var(--accent)] mt-2">Save $5 right now!</p>
        </div>

        {/* Urgency Box */}
        <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-6 mb-8 text-center">
          <p className="text-red-400 font-bold text-lg">
            ONLY $14.95! BUT YOU HAVE TO ACT NOW
          </p>
          <p className="text-gray-300 text-sm mt-2">
            This offer will not be available after you leave this page.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-4 max-w-xl mx-auto">
          <button
            onClick={handleAccept}
            disabled={isProcessing}
            className="w-full cta-button text-xl py-5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              "Processing..."
            ) : (
              <span className="flex flex-col items-center">
                <span>Add To Order Now!</span>
                <span className="text-sm font-normal opacity-90">Save $5 Now (Instant 25% Discount)</span>
              </span>
            )}
          </button>

          <Link
            href={`/thank-you?session_id=${sessionId}`}
            className="block w-full text-center py-4 text-gray-400 hover:text-gray-200 transition-colors text-sm underline"
          >
            No thanks, I don&apos;t want personal guidance
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

export default function Upsell2Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900" />}>
      <Upsell2Content />
    </Suspense>
  );
}
