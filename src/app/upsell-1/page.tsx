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

  const CTAButton = ({ className = "" }: { className?: string }) => (
    <button
      onClick={handleAccept}
      disabled={isProcessing}
      className={`w-full bg-black hover:bg-gray-900 text-white font-medium py-4 px-8 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
    >
      <span>{isProcessing ? "Processing..." : "Yes - Add The Pathless Path™ to My Order"}</span>
      {!isProcessing && (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )}
    </button>
  );

  const DeclineLink = () => (
    <Link
      href={`/downsell-1?session_id=${sessionId}`}
      className="block text-center text-gray-500 hover:text-gray-700 text-sm mt-3 underline"
    >
      No thanks, I don&apos;t Want Lifetime Access Offer
    </Link>
  );

  return (
    <main className="min-h-screen bg-white">
      {/* Header with Logo */}
      <header className="py-6 px-4 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 text-white">
            <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
              <path d="M20 5c-2 5-4 10-4 15s2 10 4 15c2-5 4-10 4-15s-2-10-4-15z" fill="#f59e0b"/>
              <path d="M15 12c0 4 2 8 5 13 3-5 5-9 5-13 0-3-2-6-5-9-3 3-5 6-5 9z" fill="#fbbf24"/>
              <circle cx="20" cy="18" r="3" fill="#fef3c7"/>
            </svg>
            <span className="text-lg font-medium tracking-wide">INNER WEALTH INITIATE</span>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-gray-100 py-4 px-4 border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-4 py-2 rounded border border-gray-300 bg-white text-gray-600">
              <span>Step 1: Resistance Map™</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded bg-black text-white font-medium">
              <span>2: Flagship Program</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded border border-gray-300 bg-white text-gray-400">
              <span>3: Bridge to Mastery</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded border border-gray-300 bg-white text-gray-400">
              <span>4: Order Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-black text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-yellow-400 font-medium mb-4 underline decoration-yellow-400">
            Wait! While Your Order is Processing...
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-4 leading-tight">
            Resistance Mapping Reveals the Block.
            <br />
            The Pathless Path™ Rebuilds Your Entire System.
          </h1>
          <p className="text-gray-400 mb-8">
            90-second read - Lifetime Access...
          </p>

          {/* Hero Image Placeholder */}
          <div className="relative rounded-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-b from-[#1a1a2e] via-[#2d1f3d] to-[#0f0f1a] p-8 min-h-[400px] flex flex-col items-center justify-center">
              {/* Mystical Background Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-amber-500/10 to-amber-400/20" />

              {/* Title */}
              <div className="relative z-10 text-center mb-8">
                <p className="text-amber-300/80 text-sm tracking-widest mb-2">The</p>
                <h2 className="font-serif text-5xl md:text-6xl italic text-white">Pathless Path</h2>
                <p className="text-amber-300/60 text-lg mt-2">™</p>
              </div>

              {/* Visual Elements - Meditation Figures */}
              <div className="relative z-10 flex items-end justify-center gap-8 mt-4">
                {/* Left Figure */}
                <div className="w-24 h-32 bg-gradient-to-t from-blue-500/30 to-transparent rounded-full blur-sm" />

                {/* Center Figure with Light */}
                <div className="relative">
                  <div className="w-32 h-40 bg-gradient-to-t from-amber-500/40 via-amber-400/20 to-transparent rounded-full" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-24 bg-gradient-to-t from-amber-300/50 to-transparent rounded-t-full" />
                </div>

                {/* Right Figure */}
                <div className="w-24 h-32 bg-gradient-to-t from-cyan-500/30 to-transparent rounded-full blur-sm" />
              </div>

              {/* Product Mockups */}
              <div className="relative z-10 flex items-center justify-center gap-4 mt-8">
                <div className="bg-gradient-to-b from-[#d4a574] to-[#b8956c] rounded p-3 w-20 h-28 shadow-lg">
                  <p className="text-[#1a1a2e] text-[8px] text-center font-serif">The Pathless Path</p>
                </div>
                <div className="bg-gradient-to-b from-[#d4a574] to-[#b8956c] rounded p-3 w-24 h-32 shadow-lg">
                  <p className="text-[#1a1a2e] text-[10px] text-center font-serif">The Pathless Path</p>
                </div>
                <div className="bg-gradient-to-b from-[#d4a574] to-[#b8956c] rounded p-3 w-20 h-28 shadow-lg">
                  <p className="text-[#1a1a2e] text-[8px] text-center font-serif">The Pathless Path</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="max-w-lg mx-auto">
            <CTAButton />
            <p className="text-gray-500 text-sm mt-2">
              Clicking will add just $147 to your order for Lifetime access
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
      <section className="py-16 px-4 bg-gradient-to-b from-[#1a1512] via-[#2a1f1a] to-[#1a1512]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center text-[#d4a574] font-serif text-3xl mb-12">
            Core Training Layers
          </h2>

          <div className="space-y-8">
            {/* Layer 1 */}
            <div className="text-center">
              <h3 className="text-[#d4a574] font-serif text-xl mb-2">Past Life & Ancestral Regression</h3>
              <p className="text-[#d4a574]/70 text-sm">• Clear Karmic & Ancestral Imprints</p>
              <p className="text-[#d4a574]/70 text-sm">• Ancestral DNA Distortions</p>
              <p className="text-[#d4a574]/70 text-sm">• Past Life Trauma</p>
            </div>

            {/* Layer 2 */}
            <div className="text-center">
              <h3 className="text-[#d4a574] font-serif text-xl mb-2">Subconscious & Mental</h3>
              <p className="text-[#d4a574]/70 text-sm">Reprogram the Root</p>
            </div>

            {/* Layer 3 */}
            <div className="text-center">
              <h3 className="text-[#d4a574] font-serif text-xl mb-2">Nervous System</h3>
              <p className="text-[#d4a574]/70 text-sm">Calm the Reaction</p>
            </div>

            {/* Layer 4 */}
            <div className="text-center">
              <h3 className="text-[#d4a574] font-serif text-xl mb-2">Body Release</h3>
              <p className="text-[#d4a574]/70 text-sm">Clear Stored Charge</p>
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

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            {[
              { title: "Guided", subtitle: "Meditations" },
              { title: "Subconscious", subtitle: "Reprogramming" },
              { title: "Somatic", subtitle: "Exercises" },
              { title: "Nervous", subtitle: "System Work" },
              { title: "Integration", subtitle: "Sessions" },
              { title: "Energy", subtitle: "Healing Practices" },
            ].map((practice, index) => (
              <div key={index} className="bg-[#2a2520] rounded-lg p-6 text-center border border-[#3a3530]">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-b from-[#d4a574]/30 to-[#b8956c]/10 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-b from-amber-600/40 to-amber-800/20" />
                </div>
                <p className="text-[#d4a574] font-serif italic">{practice.title}</p>
                <p className="text-[#d4a574] font-serif italic">{practice.subtitle}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-[#d4a574]/70 mb-8">And more...</p>

          {/* CTA */}
          <div className="max-w-lg mx-auto">
            <CTAButton />
            <p className="text-gray-500 text-sm mt-2 text-center">
              Clicking will add just $147 to your order for Lifetime access
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

          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0" />
              <div>
                <p className="font-medium">Walter Were</p>
                <p className="text-gray-500 text-sm mb-3">1:04am</p>
                <p className="text-gray-700">
                  Excellent- thank you Todd. I&apos;ll get back to you in this. Yes, Module 3... quite something. There&apos;s more layers but I&apos;m really at the earliest memories which I segregate based on where we lived at the time. Likely 4yrs old is what these are - wow! One just came up!!! Woh! When my mom reversed and ran over the cat. That&apos;s the third memory at the home we mover out of 1981 (I was born 1976) and we stayed at the next two homes like 1 yr each, then 2yrs at next - so that&apos;s how I remember my age and tie with the memory. That first home I have like 3 memories - they were two( locking keys in my dad&apos;s car, going to kindergarten-hated that, and now the dead cat)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0" />
              <div>
                <p className="font-medium">Walter Were</p>
                <p className="text-gray-500 text-sm mb-3">1:04am</p>
                <p className="text-gray-700">
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

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[#2a2520] rounded-lg p-6 text-center border border-[#d4a574]/30">
              <h4 className="text-[#d4a574] font-serif text-xl mb-2">No</h4>
              <h4 className="text-[#d4a574] font-serif text-xl mb-4">Subscriptions</h4>
              <p className="text-[#d4a574]/70 text-sm">One-Time Payment</p>
            </div>
            <div className="bg-[#2a2520] rounded-lg p-6 text-center border border-[#d4a574]/30">
              <h4 className="text-[#d4a574] font-serif text-xl mb-2">No</h4>
              <h4 className="text-[#d4a574] font-serif text-xl mb-4">Experience Needed</h4>
              <p className="text-[#d4a574]/70 text-sm">Step-by-Step Guidance</p>
            </div>
            <div className="bg-[#2a2520] rounded-lg p-6 text-center border border-[#d4a574]/30">
              <h4 className="text-[#d4a574] font-serif text-xl mb-2">Start</h4>
              <h4 className="text-[#d4a574] font-serif text-xl mb-4">Small</h4>
              <p className="text-[#d4a574]/70 text-sm">Short Sessions</p>
            </div>
            <div className="bg-[#2a2520] rounded-lg p-6 text-center border border-[#d4a574]/30">
              <h4 className="text-[#d4a574] font-serif text-xl mb-2">Repeatable</h4>
              <h4 className="text-[#d4a574] font-serif text-xl mb-4">System</h4>
              <p className="text-[#d4a574]/70 text-sm">Use Anytime</p>
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
          <h2 className="text-center text-white font-serif text-2xl mb-8">
            The Cost of Traditional Methods
          </h2>

          <div className="bg-[#f5f0eb] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#d4a574]/30">
                  <th className="py-4 px-6 text-left text-gray-700 font-medium">Other Options</th>
                  <th className="py-4 px-6 text-left text-gray-700 font-medium">Cost</th>
                  <th className="py-4 px-6 text-left text-gray-700 font-medium">Limitation</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#d4a574]/20">
                  <td className="py-4 px-6 text-gray-700">Therapy</td>
                  <td className="py-4 px-6 text-gray-700">$180/session</td>
                  <td className="py-4 px-6 text-gray-600 text-sm">Years of surface level work</td>
                </tr>
                <tr className="border-b border-[#d4a574]/20">
                  <td className="py-4 px-6 text-gray-700">Coaching</td>
                  <td className="py-4 px-6 text-gray-700">$2k–$10k</td>
                  <td className="py-4 px-6 text-gray-600 text-sm">• External dependency</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-gray-700">Retreats</td>
                  <td className="py-4 px-6 text-gray-700">$1k–$5k</td>
                  <td className="py-4 px-6 text-gray-600 text-sm">• Temporary</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pathless Path Row */}
          <div className="bg-[#f5f0eb] rounded-lg mt-4 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif text-xl text-gray-900">The Pathless Path™</h4>
                <p className="text-2xl font-bold text-gray-900 mt-2">$97 <span className="text-lg font-normal">one-time</span></p>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  <li>• Complete, integrated system</li>
                  <li>• Lifetime access</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <div className="bg-gradient-to-b from-[#d4a574] to-[#b8956c] rounded p-2 w-16 h-20 shadow">
                  <p className="text-[#1a1a2e] text-[6px] text-center font-serif">Pathless Path</p>
                </div>
                <div className="bg-gradient-to-b from-[#d4a574] to-[#b8956c] rounded p-2 w-20 h-24 shadow">
                  <p className="text-[#1a1a2e] text-[8px] text-center font-serif">Pathless Path</p>
                </div>
                <div className="bg-gradient-to-b from-[#d4a574] to-[#b8956c] rounded p-2 w-16 h-20 shadow">
                  <p className="text-[#1a1a2e] text-[6px] text-center font-serif">Pathless Path</p>
                </div>
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
          <div className="max-w-lg mx-auto">
            <CTAButton />
            <p className="text-gray-500 text-sm mt-2 text-center">
              Clicking will add just $147 to your order for Lifetime access
            </p>
            <DeclineLink />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-black">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-500">
          <p>All rights reserved {new Date().getFullYear()}.</p>
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
