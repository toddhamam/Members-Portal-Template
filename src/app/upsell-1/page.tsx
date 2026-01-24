"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSessionId } from "@/hooks/useSessionId";
import { ga4 } from "@/lib/ga4";

function Upsell1Content() {
  const sessionId = useSessionId();
  const [isProcessing, setIsProcessing] = useState(false);

  // Track checkout completion (initial purchase) and upsell view on mount
  useEffect(() => {
    // Track GA4 checkout completion for initial purchase (only once)
    const pendingCheckout = sessionStorage.getItem('checkout_ga4_pending');
    if (pendingCheckout) {
      try {
        const { value, includeOrderBump, paymentIntentId } = JSON.parse(pendingCheckout);
        ga4.checkoutCompleted(paymentIntentId, value, includeOrderBump);
        sessionStorage.removeItem('checkout_ga4_pending');
      } catch (e) {
        console.error('Failed to parse checkout GA4 data:', e);
        sessionStorage.removeItem('checkout_ga4_pending');
      }
    }

    // Track upsell page view
    ga4.upsellView(1, 'The Pathless Path', 97);
  }, []);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/upsell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          upsellType: "upsell-1",
          action: "accept",
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Track for GA4 with transaction ID after successful payment
        ga4.upsellAccepted(1, 'The Pathless Path', 97, data.paymentIntentId);
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

  const CTAButton = ({ className = "" }: { className?: string }) => (
    <button
      onClick={handleAccept}
      disabled={isProcessing}
      className={`w-full bg-white hover:bg-gray-200 text-black font-bold py-4 px-5 md:py-5 md:px-8 text-base md:text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg rounded-md ${className}`}
    >
      <span className="text-center leading-tight">{isProcessing ? "Processing..." : "Yes - Add The Pathless Path™ to My Order"}</span>
      {!isProcessing && (
        <svg className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )}
    </button>
  );

  const DeclineLink = ({ className = "" }: { className?: string }) => (
    <Link
      href={`/downsell-1?session_id=${sessionId}`}
      className={`block text-center text-white hover:text-gray-300 text-sm mt-3 underline ${className}`}
      onClick={() => {
        ga4.upsellDeclined(1, 'The Pathless Path', 97);
      }}
    >
      No thanks, I don&apos;t want the lifetime access offer
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

            {/* Step 2 - Current (highlighted in gold) */}
            <div className="flex flex-col items-center min-w-0">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-[#d4a574] bg-[#d4a574] flex items-center justify-center">
                <span className="text-black text-xs md:text-sm font-bold">2</span>
              </div>
              <span className="text-[#d4a574] text-[10px] md:text-xs mt-1 md:mt-2 text-center font-medium leading-tight max-w-[60px] md:max-w-none">Flagship Program</span>
            </div>

            {/* Line 2-3 */}
            <div className="flex-1 flex items-center h-6 md:h-8 mx-1">
              <div className="w-full h-px bg-gray-600" />
            </div>

            {/* Step 3 - Upcoming */}
            <div className="flex flex-col items-center min-w-0">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-gray-500 bg-black flex items-center justify-center">
                <span className="text-gray-400 text-xs md:text-sm font-medium">3</span>
              </div>
              <span className="text-gray-400 text-[10px] md:text-xs mt-1 md:mt-2 text-center leading-tight max-w-[60px] md:max-w-none">Bridge to Mastery</span>
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
            Wait! While Your Order is Processing...
          </p>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-medium mb-4 leading-tight">
            Resistance Mapping Reveals the Block.
            <span className="hidden md:inline"><br /></span>
            <span className="md:hidden"> </span>
            The Pathless Path™ Rebuilds Your Entire System.
          </h1>
          <p className="text-gray-400 mb-8">
            90-second read - Lifetime Access...
          </p>

          {/* Hero Image */}
          <div className="relative rounded-lg overflow-hidden mb-8">
            <Image
              src="/images/Products/Upsell1/hero-main.png"
              alt="The Pathless Path™ Program"
              width={800}
              height={600}
              className="w-full h-auto"
              priority
            />
          </div>

          {/* CTA */}
          <div className="max-w-lg mx-auto px-2">
            <CTAButton />
            <p className="text-white text-xs md:text-sm mt-2 text-center">
              Clicking will add just $97 to your order for Lifetime access
            </p>
            <DeclineLink />
          </div>
        </div>
      </section>

      {/* This Is Where Insight Becomes Full-System Realignment */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl italic text-center mb-6">
            This Is Where Insight Becomes Full-System Realignment
          </h2>
          <p className="text-center text-gray-700 italic mb-12">
            A complete, step-by-step approach that retrains the subconscious, nervous system, and body so fears, blocks, and negative patterns <span className="underline">do not return</span>.
          </p>

          <div className="border-l-4 border-gray-900 pl-6 mb-12">
            <h3 className="font-serif text-2xl italic mb-4">
              What You&apos;ve Just Purchased Is One Powerful Tool!
            </h3>
            <div className="text-gray-700 space-y-4">
              <p>But It Was Never Meant to Stand Alone.</p>
              <p>Resistance Mapping is a precise exercise.</p>
              <p>It helps you identify hidden fear patterns.</p>
              <p>It shows you where reactions originate.</p>
              <p>It reveals the root belief running beneath the surface.</p>
              <p>That is essential work.</p>
              <p>But identifying a block is not the same as reconditioning the system that produced it.</p>
              <p className="font-medium">That is where most people stall.</p>
            </div>
          </div>

          <h3 className="font-serif text-2xl italic mb-4">
            What Happens After the Pattern Is Seen?
          </h3>
          <div className="text-gray-700 space-y-4 mb-12">
            <p>This is the moment almost no one talks about...</p>
            <p>You see the root.</p>
            <p>You understand the structure.</p>
            <p>And yet, the body still reacts.</p>
            <p>The nervous system still tightens.</p>
            <p>The pattern still tries to re-assert itself.</p>
            <p>Not because the insight was wrong.</p>
            <p className="font-medium">But because insight alone does not retrain the deeper layers.</p>
          </div>

          <h3 className="font-serif text-2xl italic mb-4">
            What the Pathless Path™ Actually Is
          </h3>
          <div className="text-gray-700 space-y-4 mb-12">
            <p>The Pathless Path is not another exercise.</p>
            <p>It is <span className="underline">not</span> an upgrade to Resistance Mapping.</p>
            <p>It is <span className="underline">the complete system</span> that shows you how to work with the entire inner architecture that produces patterns in the first place.</p>
            <p>Where Resistance Mapping reveals what is running,</p>
            <p className="italic">The Pathless Path™ flagship program retrains where it is running from...</p>
          </div>

          <h3 className="font-serif text-2xl italic mb-4">
            A Full-System Rebuild, Not Surface-Level Healing
          </h3>
          <div className="text-gray-700 space-y-4">
            <p>Most systems stop at one or two levels of healing (at best).</p>
            <p>Pathless Path™ is designed to take healing as far as it naturally might need to go, for you.</p>
            <p className="underline">Inside The Pathless Path... you are guided through:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>The physical body and nervous system</li>
              <li>Stored emotional charge and trauma responses</li>
              <li>Thought loops and belief structures</li>
              <li>Subconscious and inherited programming</li>
              <li>Identity patterns and the sense of self</li>
            </ul>
            <p className="mt-4">Each layer requires a different approach.</p>
            <p>Each layer holds distortion differently.</p>
            <p>Each layer must be met directly, not conceptually.</p>
            <p className="font-medium">This is why most healing work never fully stabilizes.</p>
          </div>
        </div>
      </section>

      {/* Core Training Layers - Dark Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#0f0d0b] via-[#1a1512] to-[#0f0d0b]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#e8c9a0] text-base uppercase tracking-[0.3em] mb-3">The System</p>
            <h2 className="text-white font-serif text-4xl md:text-5xl mb-4">
              Core Training Layers
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              A complete multi-dimensional approach that addresses every layer where resistance lives
            </p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#d4a574]/0 via-[#d4a574]/30 to-[#d4a574]/0 hidden md:block" />

            <div className="space-y-6">
              {/* Layer 1 */}
              <div className="relative flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                <div className="md:w-1/2 md:text-right md:pr-8">
                  <div className="bg-gradient-to-r md:bg-gradient-to-l from-[#d4a574]/10 to-transparent p-6 rounded-lg border border-[#d4a574]/20">
                    <div className="flex items-center gap-3 md:justify-end mb-3">
                      <span className="text-[#e8c9a0] text-sm uppercase tracking-wider font-medium">Layer 01</span>
                    </div>
                    <h3 className="text-[#d4a574] font-serif text-xl md:text-2xl mb-2">Past Life & Ancestral Regression</h3>
                    <p className="text-white text-sm">Clear karmic imprints, ancestral DNA distortions, and past life trauma at the deepest level</p>
                  </div>
                </div>
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#d4a574] border-4 border-[#1a1512]" />
                <div className="md:w-1/2" />
              </div>

              {/* Layer 2 */}
              <div className="relative flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                <div className="md:w-1/2" />
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#d4a574] border-4 border-[#1a1512]" />
                <div className="md:w-1/2 md:pl-8">
                  <div className="bg-gradient-to-r from-[#d4a574]/10 to-transparent p-6 rounded-lg border border-[#d4a574]/20">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[#e8c9a0] text-sm uppercase tracking-wider font-medium">Layer 02</span>
                    </div>
                    <h3 className="text-[#d4a574] font-serif text-xl md:text-2xl mb-2">Subconscious & Mental</h3>
                    <p className="text-white text-sm">Reprogram the root beliefs and mental patterns that keep resistance locked in place</p>
                  </div>
                </div>
              </div>

              {/* Layer 3 */}
              <div className="relative flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                <div className="md:w-1/2 md:text-right md:pr-8">
                  <div className="bg-gradient-to-r md:bg-gradient-to-l from-[#d4a574]/10 to-transparent p-6 rounded-lg border border-[#d4a574]/20">
                    <div className="flex items-center gap-3 md:justify-end mb-3">
                      <span className="text-[#e8c9a0] text-sm uppercase tracking-wider font-medium">Layer 03</span>
                    </div>
                    <h3 className="text-[#d4a574] font-serif text-xl md:text-2xl mb-2">Nervous System</h3>
                    <p className="text-white text-sm">Calm the reactive patterns and restore regulation to your autonomic nervous system</p>
                  </div>
                </div>
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#d4a574] border-4 border-[#1a1512]" />
                <div className="md:w-1/2" />
              </div>

              {/* Layer 4 */}
              <div className="relative flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                <div className="md:w-1/2" />
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#d4a574] border-4 border-[#1a1512]" />
                <div className="md:w-1/2 md:pl-8">
                  <div className="bg-gradient-to-r from-[#d4a574]/10 to-transparent p-6 rounded-lg border border-[#d4a574]/20">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[#e8c9a0] text-sm uppercase tracking-wider font-medium">Layer 04</span>
                    </div>
                    <h3 className="text-[#d4a574] font-serif text-xl md:text-2xl mb-2">Body Release</h3>
                    <p className="text-white text-sm">Clear the stored emotional charge held in tissues, fascia, and cellular memory</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* This Goes Way Beyond "Fixing Yourself" */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h3 className="font-serif text-2xl italic mb-6">
            This Goes Way Beyond &ldquo;Fixing Yourself&rdquo;
          </h3>
          <div className="text-gray-700 space-y-4">
            <p>Pathless Path Program is not about &apos;self-improvement&apos;.</p>
            <p>It is not about becoming a better version of the same identity.</p>
            <p>As the layers of conditioning dissolve as the deeper levels, something else begins to happen.</p>
            <p>You begin to see through veil, the illusion of separation, the illusion of identifying as a separate character, and more than that, you start to realise that the very idea and experience of fear, was always just a projection... Like fog gradually clearing in the sun.</p>
            <p>The Pathless Path Program opens your world up into the deeper territory of reality, and the &apos;self&apos;:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>The nature of mind itself</li>
              <li>The construct of reality</li>
              <li>The principles of mentalism and hermetic understanding</li>
              <li>How consciousness appears as form</li>
              <li>Why suffering arises at all</li>
            </ul>
            <p className="mt-4">Healing naturally gives way to awakening & ascension.</p>
            <p>Not as a concept.</p>
            <p>But as direct recognition.</p>
            <p className="font-medium">A fully lived reality.</p>
          </div>
        </div>
      </section>

      {/* Guided Practices Included - Dark Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-[#1a1512] via-[#2a1f1a] to-[#1a1512]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-white font-serif text-3xl mb-12">
            Guided Practices Included
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-8">
            {[
              { title: "Guided", subtitle: "Meditations", image: "/images/Products/Upsell1/icon-meditations.png" },
              { title: "Subconscious", subtitle: "Reprogramming", image: "/images/Products/Upsell1/icon-reprogramming.png" },
              { title: "Somatic", subtitle: "Exercises", image: "/images/Products/Upsell1/icon-somatic.png" },
              { title: "Nervous", subtitle: "System Work", image: "/images/Products/Upsell1/icon-nervous-system.png" },
              { title: "Integration", subtitle: "Sessions", image: "/images/Products/Upsell1/icon-integration.png" },
              { title: "Energy", subtitle: "Healing Practices", image: "/images/Products/Upsell1/icon-energy-healing.png" },
            ].map((practice, index) => (
              <div key={index} className="bg-[#2a2520] rounded-xl p-3 md:p-6 text-center border border-[#3a3530]">
                <div className="w-20 h-20 md:w-36 md:h-36 mx-auto mb-2 md:mb-4 rounded-lg overflow-hidden flex items-center justify-center">
                  {practice.image ? (
                    <Image
                      src={practice.image}
                      alt={`${practice.title} ${practice.subtitle}`}
                      width={144}
                      height={144}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-b from-[#d4a574]/30 to-[#b8956c]/10 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-b from-amber-600/40 to-amber-800/20" />
                    </div>
                  )}
                </div>
                <p className="text-white text-sm md:text-xl font-serif">{practice.title}</p>
                <p className="text-white text-sm md:text-xl font-serif">{practice.subtitle}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-[#d4a574]/70 mb-8">And more...</p>

          {/* CTA */}
          <div className="max-w-lg mx-auto px-2">
            <CTAButton />
            <p className="text-gray-500 text-xs md:text-sm mt-2 text-center">
              Clicking will add just $97 to your order for Lifetime access
            </p>
            <DeclineLink />
          </div>
        </div>
      </section>

      {/* Your Instant Access Portal - Mockup Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#0a0908] via-[#141210] to-[#0a0908]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#e8c9a0] text-base uppercase tracking-[0.3em] mb-3">Your Member Portal</p>
            <h2 className="text-white font-serif text-3xl md:text-4xl mb-4">
              Instant Access, Anytime, Anywhere
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Everything organized in one beautiful, easy-to-navigate portal
            </p>
          </div>

          {/* Portal Mockup Container */}
          <div className="relative mb-12">
            {/* Browser/Device Frame */}
            <div className="bg-gradient-to-b from-[#2a2520] to-[#1a1512] rounded-xl p-2 shadow-2xl border border-[#3a3530]">
              {/* Browser Top Bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#1a1512] rounded-t-lg border-b border-[#3a3530]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27ca40]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-[#2a2520] rounded-md px-4 py-1 text-gray-500 text-xs">
                    portal.innerwealthinitiates.com
                  </div>
                </div>
              </div>

              {/* Portal Screenshot */}
              <div className="relative bg-[#1a1512] rounded-b-lg overflow-hidden">
                <Image
                  src="/images/Products/Upsell1/portal-mockup1.png"
                  alt="The Pathless Path™ Member Portal"
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* Decorative glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#d4a574]/0 via-[#d4a574]/5 to-[#d4a574]/0 rounded-2xl blur-xl -z-10" />
          </div>

          {/* Portal Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-12">
            <div className="bg-[#1a1512] rounded-lg p-3 md:p-5 border border-[#d4a574]/20 text-center">
              <div className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 md:mb-3 rounded-full bg-[#d4a574]/10 flex items-center justify-center">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-[#d4a574]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-white text-xs md:text-sm font-medium">Instant Access</p>
              <p className="text-gray-500 text-[10px] md:text-xs mt-1">Available immediately</p>
            </div>

            <div className="bg-[#1a1512] rounded-lg p-3 md:p-5 border border-[#d4a574]/20 text-center">
              <div className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 md:mb-3 rounded-full bg-[#d4a574]/10 flex items-center justify-center">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-[#d4a574]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <p className="text-white text-xs md:text-sm font-medium">Organized Modules</p>
              <p className="text-gray-500 text-[10px] md:text-xs mt-1">Step-by-step structure</p>
            </div>

            <div className="bg-[#1a1512] rounded-lg p-3 md:p-5 border border-[#d4a574]/20 text-center">
              <div className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 md:mb-3 rounded-full bg-[#d4a574]/10 flex items-center justify-center">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-[#d4a574]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-white text-xs md:text-sm font-medium">Track Progress</p>
              <p className="text-gray-500 text-[10px] md:text-xs mt-1">See your journey unfold</p>
            </div>

            <div className="bg-[#1a1512] rounded-lg p-3 md:p-5 border border-[#d4a574]/20 text-center">
              <div className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 md:mb-3 rounded-full bg-[#d4a574]/10 flex items-center justify-center">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-[#d4a574]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-white text-xs md:text-sm font-medium">Mobile Friendly</p>
              <p className="text-gray-500 text-[10px] md:text-xs mt-1">Practice anywhere</p>
            </div>
          </div>

          {/* CTA */}
          <div className="max-w-lg mx-auto px-2">
            <CTAButton />
            <p className="text-white text-xs md:text-sm mt-2 text-center">
              Clicking will add just $97 to your order for Lifetime access
            </p>
            <DeclineLink />
          </div>
        </div>
      </section>

      {/* How Resistance Mapping Fits Inside This Work */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h3 className="font-serif text-2xl italic mb-6">
            How Resistance Mapping Fits Inside This Work
          </h3>
          <div className="text-gray-700 space-y-4">
            <p>Resistance Mapping is one of the tools inside the Pathless Path.</p>
            <p>It helps you:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Identify patterns</li>
              <li>Trace reactions</li>
              <li>Locate root beliefs</li>
            </ul>
            <p className="mt-4">Pathless Path teaches you:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>How to access every layer of mind directly</li>
              <li>How to clear distortions unique to each layer</li>
              <li>How to move through identity structures safely</li>
              <li>How to stabilize awareness beyond the personal self</li>
            </ul>
            <p className="mt-4">Resistance Mapping opens a doorway.</p>
            <p className="font-medium">Pathless Path shows you the entire terrain.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h3 className="font-serif text-2xl italic mb-8">
            What People Are Saying
          </h3>

          <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200 mb-4 md:mb-6">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-300 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-sm md:text-base">Walter Were</p>
                <p className="text-gray-500 text-xs md:text-sm mb-2 md:mb-3">1:04am</p>
                <p className="text-gray-700 text-sm md:text-base">
                  Excellent- thank you Todd. I&apos;ll get back to you in this. Yes, Module 3... quite something. There&apos;s more layers but I&apos;m really at the earliest memories which I segregate based on where we lived at the time. Likely 4yrs old is what these are - wow! One just came up!!! Woh! When my mom reversed and ran over the cat. That&apos;s the third memory at the home we mover out of 1981 (I was born 1976) and we stayed at the next two homes like 1 yr each, then 2yrs at next - so that&apos;s how I remember my age and tie with the memory. That first home I have like 3 memories - they were two( locking keys in my dad&apos;s car, going to kindergarten-hated that, and now the dead cat)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-lg border border-gray-200">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-300 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-sm md:text-base">Walter Were</p>
                <p className="text-gray-500 text-xs md:text-sm mb-2 md:mb-3">1:04am</p>
                <p className="text-gray-700 text-sm md:text-base">
                  Amazing how that memory just came up as I was typing! That&apos;s maybe 3 or 4yrs old.
                </p>
              </div>
            </div>
          </div>

          {/* Dots indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-2 h-2 rounded-full bg-gray-900" />
            <div className="w-2 h-2 rounded-full bg-gray-300" />
            <div className="w-2 h-2 rounded-full bg-gray-300" />
            <div className="w-2 h-2 rounded-full bg-gray-300" />
          </div>
        </div>
      </section>

      {/* This Is For You If */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h3 className="font-serif text-2xl italic mb-6">
            This Is For You If
          </h3>
          <div className="text-gray-700 space-y-4">
            <p>You want the work to actually complete, not just repeat.</p>
            <p>You sense that insight alone is no longer enough.</p>
            <p>You are ready to retrain the body and nervous system, not just understand the mind.</p>
            <p>You want a <span className="underline">full system</span>, not another method to manage.</p>
          </div>
        </div>
      </section>

      {/* What People Love - Dark Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-[#1a1512] via-[#2a1f1a] to-[#1a1512]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center text-white font-serif text-3xl mb-12">
            What People Love
          </h2>

          <div className="grid grid-cols-2 gap-3 md:gap-6">
            <div className="bg-[#2a2520] rounded-lg p-4 md:p-6 text-center border border-[#d4a574]/30">
              <h4 className="text-[#d4a574] font-serif text-base md:text-xl mb-1 md:mb-2">No</h4>
              <h4 className="text-[#d4a574] font-serif text-base md:text-xl mb-2 md:mb-4">Subscriptions</h4>
              <p className="text-[#d4a574]/70 text-xs md:text-sm">One-Time Payment</p>
            </div>
            <div className="bg-[#2a2520] rounded-lg p-4 md:p-6 text-center border border-[#d4a574]/30">
              <h4 className="text-[#d4a574] font-serif text-base md:text-xl mb-1 md:mb-2">No</h4>
              <h4 className="text-[#d4a574] font-serif text-base md:text-xl mb-2 md:mb-4">Experience Needed</h4>
              <p className="text-[#d4a574]/70 text-xs md:text-sm">Step-by-Step Guidance</p>
            </div>
            <div className="bg-[#2a2520] rounded-lg p-4 md:p-6 text-center border border-[#d4a574]/30">
              <h4 className="text-[#d4a574] font-serif text-base md:text-xl mb-1 md:mb-2">Start</h4>
              <h4 className="text-[#d4a574] font-serif text-base md:text-xl mb-2 md:mb-4">Small</h4>
              <p className="text-[#d4a574]/70 text-xs md:text-sm">Short Sessions</p>
            </div>
            <div className="bg-[#2a2520] rounded-lg p-4 md:p-6 text-center border border-[#d4a574]/30">
              <h4 className="text-[#d4a574] font-serif text-base md:text-xl mb-1 md:mb-2">Repeatable</h4>
              <h4 className="text-[#d4a574] font-serif text-base md:text-xl mb-2 md:mb-4">System</h4>
              <p className="text-[#d4a574]/70 text-xs md:text-sm">Use Anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why You're Being Offered This Now */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h3 className="font-serif text-2xl italic mb-6">
            Why You&apos;re Being Offered This Now
          </h3>
          <div className="text-gray-700 space-y-4">
            <p>The Pathless Path is my flagship body of work.</p>
            <p>Most people encounter it much later, after years of cycling between insight and relapse... and worse...</p>
            <p>... After years of trying expensive traditional methods, which are broken, outdated, and hardly ever achieve lasting relief.</p>
            <p>Because you have already taken the first step with Resistance Mapping, you are being offered access now, as the natural continuation of the work you&apos;ve already begun.</p>
            <p>Not as a subscription.</p>
            <p>Not as an ongoing commitment.</p>
            <p className="font-medium">As a one-time opportunity to add the full system to what you already have.</p>
          </div>
        </div>
      </section>

      {/* Cost Comparison Table */}
      <section className="py-16 px-4 bg-gradient-to-b from-[#1a1512] via-[#2a1f1a] to-[#1a1512]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center text-white font-serif text-3xl md:text-4xl mb-8">
            The Cost of Traditional Methods
          </h2>

          <div className="bg-[#f5f0eb] rounded-lg overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[320px]">
              <thead>
                <tr className="border-b border-[#d4a574]/30">
                  <th className="py-3 px-3 md:py-4 md:px-6 text-left text-gray-700 font-medium text-sm md:text-lg">Other Options</th>
                  <th className="py-3 px-3 md:py-4 md:px-6 text-left text-gray-700 font-medium text-sm md:text-lg">Cost</th>
                  <th className="py-3 px-3 md:py-4 md:px-6 text-left text-gray-700 font-medium text-sm md:text-lg">Limitation</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#d4a574]/20">
                  <td className="py-3 px-3 md:py-4 md:px-6 text-gray-700 text-sm md:text-lg">Therapy</td>
                  <td className="py-3 px-3 md:py-4 md:px-6 text-gray-700 text-sm md:text-lg whitespace-nowrap">$180/session</td>
                  <td className="py-3 px-3 md:py-4 md:px-6 text-gray-600 text-sm md:text-base">Years of surface level work</td>
                </tr>
                <tr className="border-b border-[#d4a574]/20">
                  <td className="py-3 px-3 md:py-4 md:px-6 text-gray-700 text-sm md:text-lg">Coaching</td>
                  <td className="py-3 px-3 md:py-4 md:px-6 text-gray-700 text-sm md:text-lg whitespace-nowrap">$2k–$10k</td>
                  <td className="py-3 px-3 md:py-4 md:px-6 text-gray-600 text-sm md:text-base">• External dependency</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 md:py-4 md:px-6 text-gray-700 text-sm md:text-lg">Retreats</td>
                  <td className="py-3 px-3 md:py-4 md:px-6 text-gray-700 text-sm md:text-lg whitespace-nowrap">$1k–$5k</td>
                  <td className="py-3 px-3 md:py-4 md:px-6 text-gray-600 text-sm md:text-base">• Temporary</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pathless Path Row */}
          <div className="bg-[#f5f0eb] rounded-lg mt-4 p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="text-center md:text-left">
                <h4 className="font-serif text-lg md:text-xl text-gray-900 font-bold">The Pathless Path™</h4>
                <p className="text-xl md:text-2xl font-bold text-gray-900 mt-2">$97 <span className="text-base md:text-lg font-normal">one-time</span></p>
                <ul className="text-sm md:text-base text-gray-600 mt-2 space-y-1">
                  <li>• Complete, integrated system</li>
                  <li>• Lifetime access</li>
                </ul>
              </div>
              <div className="flex justify-center md:justify-end">
                <Image
                  src="/images/Products/Upsell1/pathless-path-bundle.png"
                  alt="The Pathless Path™ Complete System"
                  width={280}
                  height={180}
                  className="w-72 md:w-96 h-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Access the Full Path - Final CTA */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h3 className="font-serif text-2xl italic mb-6">
            Access the Full Path
          </h3>
          <div className="text-gray-700 space-y-4 mb-8">
            <p>Add the Pathless Path™ Program to your order now and receive lifetime access to the full system that this work comes from.</p>
            <p className="font-medium">This one-time offer is only available at this moment.</p>
            <p>Once this page is closed, it will not be offered again at this discount price.</p>
          </div>

          {/* Final CTA */}
          <div className="max-w-lg mx-auto px-2">
            <CTAButton className="!bg-black !text-white hover:!bg-gray-700 hover:!shadow-lg" />
            <p className="text-black text-xs md:text-sm mt-2 text-center">
              Clicking will add just $97 to your order for Lifetime access
            </p>
            <DeclineLink className="!text-black hover:!text-gray-600" />
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

export default function Upsell1Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <Upsell1Content />
    </Suspense>
  );
}
