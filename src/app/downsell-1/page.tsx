"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSessionId } from "@/hooks/useSessionId";
import { ga4 } from "@/lib/ga4";
import { useFunnelTracking } from "@/hooks/useFunnelTracking";

function Downsell1Content() {
  const sessionId = useSessionId();
  const [isProcessing, setIsProcessing] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const { track } = useFunnelTracking('downsell-1');

  const testimonials = [
    {
      name: "Walter Were",
      time: "1:32am",
      image: "/images/Products/Downsell1/walter-profile.png",
      message: "Excellent- thank you Todd. I'll get back to you in this. Yes, Module 3... quite something. There's more layers but I'm really at the earliest memories which I segregate based on where we lived at the time. Likely 4yrs old is what these are - wow! One just came up!!! Woh! When my mom reversed and ran over the cat. That's the third memory at the home we mover out of 1981 (I was born 1976) and we stayed at the next two homes like 1 yr each, then 2yrs at next - so that's how I remember my age and tie with the memory. That first home I have like 3 memories - they were two( locking keys in my dad's car, going to kindergarten-hated that, and now the dead cat)",
    },
    {
      name: "Walter Were",
      time: "1:32am",
      image: "/images/Products/Downsell1/walter-profile.png",
      message: "Amazing how that memory just came up as I was typing! That's maybe 3 or 4yrs old.",
    },
  ];

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe && testimonialIndex < testimonials.length - 1) {
      setTestimonialIndex(testimonialIndex + 1);
    }
    if (isRightSwipe && testimonialIndex > 0) {
      setTestimonialIndex(testimonialIndex - 1);
    }
  };

  const nextTestimonial = () => {
    setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Track downsell viewed on mount
  useEffect(() => {
    ga4.downsellView(1, 'Nervous System Reset Kit', 27);
  }, []);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/upsell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          upsellType: "downsell-1",
          action: "accept",
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Track for GA4 with transaction ID after successful payment
        ga4.downsellAccepted(1, 'Nervous System Reset Kit', 27, data.paymentIntentId);
        // Track for funnel dashboard
        await track('downsell_accept', { revenueCents: 2700, productSlug: 'nervous-system-reset', sessionId: sessionId || undefined });
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
      className={`w-full bg-white hover:bg-gray-200 text-black font-bold py-4 px-5 md:py-5 md:px-12 text-base md:text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg rounded-md ${className}`}
    >
      <span className="text-center leading-tight md:whitespace-nowrap">{isProcessing ? "Processing..." : "Yes - Add The Nervous System Reset Kit™ to My Order"}</span>
      {!isProcessing && (
        <svg className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )}
    </button>
  );

  const DeclineLink = ({ className = "" }: { className?: string }) => (
    <Link
      href={`/upsell-2?session_id=${sessionId}`}
      className={`block text-center text-white hover:text-gray-300 text-sm mt-3 underline ${className}`}
      onClick={() => {
        ga4.downsellDeclined(1, 'Nervous System Reset Kit', 27);
        track('downsell_decline');
      }}
    >
      No thanks, I don&apos;t want the nervous system reset kit
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

            {/* Step 2b - Current (highlighted in gold) */}
            <div className="flex flex-col items-center min-w-0">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-[#d4a574] bg-[#d4a574] flex items-center justify-center">
                <span className="text-black text-xs md:text-sm font-bold">2</span>
              </div>
              <span className="text-[#d4a574] text-[10px] md:text-xs mt-1 md:mt-2 text-center font-medium leading-tight max-w-[60px] md:max-w-none">Reset Kit</span>
            </div>

            {/* Line 2-3 with partial progress */}
            <div className="flex-1 flex items-center h-6 md:h-8 mx-1 relative">
              <div className="w-full h-px bg-gray-600" />
              {/* Partial gold fill indicating progress */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[45%] h-px bg-[#d4a574]" />
              {/* Small circle at progress point */}
              <div className="absolute left-[45%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-[#d4a574]" />
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
            Wait! Almost There...
          </p>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-medium mb-4 leading-tight">
            Not Ready For The Full System Yet?
            <span className="hidden md:inline"><br /></span>
            <span className="md:hidden"> </span>
            Stabilize Your Nervous System First...
          </h1>
          <p className="text-gray-400 mb-8">
            60-second read - Lifetime Access...
          </p>

          {/* Hero Image */}
          <div className="relative rounded-lg overflow-hidden mb-8">
            <Image
              src="/images/Products/Downsell1/hero-main.png"
              alt="Nervous System Reset Kit™"
              width={800}
              height={600}
              className="w-full h-auto"
              priority
            />
          </div>

          {/* CTA */}
          <div className="max-w-lg md:max-w-2xl mx-auto px-2">
            <CTAButton />
            <p className="text-white text-xs md:text-sm mt-2 text-center">
              Clicking will add just $27 to your order for Lifetime access
            </p>
            <DeclineLink />
          </div>
        </div>
      </section>

      {/* A Calm Body Creates A Calm Mind */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl italic text-center mb-6">
            A Calm Body Creates A Calm Mind
          </h2>
          <p className="text-center text-gray-700 italic mb-12">
            A step-by-step nervous system reset guide extracted from the full program, designed to help release fear charge, reduce tension, and restore calm.
          </p>

          <div className="border-l-4 border-gray-900 pl-6 mb-12">
            <h3 className="font-serif text-2xl italic mb-4">
              If You&apos;ve Gained Insight But Your Body Still Reacts...
            </h3>
            <div className="text-gray-700 space-y-4">
              <p>That is not a mindset issue.</p>
              <p>It is a nervous system pattern.</p>
              <p>When the system detects threat, it pulls you into automatic protection mode...</p>
              <p className="font-medium">Tightness. Panic. Shutdown. Overthinking. Avoidance. Control.</p>
              <p>This kit is designed to interrupt that pattern at the source, so you can return to calm faster and stop feeding the loop.</p>
            </div>
          </div>

          <h3 className="font-serif text-2xl italic mb-4">
            What This Reset Kit Is
          </h3>
          <div className="text-gray-700 space-y-4 mb-12">
            <p>This is a focused nervous system reset guide extracted from the full program.</p>
            <p>It includes the somatic body release and nervous system regulation work as a standalone kit, so you can start with stability first, without committing to the full system today.</p>
            <p>No extra theory.</p>
            <p>No long program to keep up with.</p>
            <p className="font-medium">Just a clear, guided process you can use right away.</p>
          </div>
        </div>
      </section>

      {/* Core Training Layers - Dark Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#0f0d0b] via-[#1a1512] to-[#0f0d0b]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#e8c9a0] text-base uppercase tracking-[0.3em] mb-3">The Kit</p>
            <h2 className="text-white font-serif text-4xl md:text-5xl mb-4">
              Core Training Layers
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              A focused approach targeting the nervous system and body where fear charge lives
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
                    <h3 className="text-[#d4a574] font-serif text-xl md:text-2xl mb-2">Nervous System Regulation</h3>
                    <p className="text-white text-sm">Calm the reactive patterns and restore regulation to your autonomic nervous system</p>
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
                    <h3 className="text-[#d4a574] font-serif text-xl md:text-2xl mb-2">Somatic Body Release</h3>
                    <p className="text-white text-sm">Release stored tension and fear charge held in the body</p>
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
                    <h3 className="text-[#d4a574] font-serif text-xl md:text-2xl mb-2">Trigger-to-Reset Protocol</h3>
                    <p className="text-white text-sm">A clear emergency plan for when activation happens in real time</p>
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
                    <h3 className="text-[#d4a574] font-serif text-xl md:text-2xl mb-2">Daily Stabilization Rhythm</h3>
                    <p className="text-white text-sm">Build a steadier baseline over time with a simple daily practice</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two Ways To Use */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl italic text-center mb-12">
            Two Ways To Use The Reset Kit
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="border-l-4 border-[#d4a574] pl-6">
              <h3 className="font-serif text-xl italic mb-4">1) The Quick Reset</h3>
              <p className="text-gray-600 text-sm mb-3">When Triggered</p>
              <ul className="text-gray-700 space-y-2">
                <li>• Use when you feel activated in real time</li>
                <li>• Follow the emergency plan</li>
                <li>• Run one guided reset session</li>
                <li>• Release fear charge in the body</li>
                <li>• Return to calm faster</li>
              </ul>
            </div>

            <div className="border-l-4 border-[#d4a574] pl-6">
              <h3 className="font-serif text-xl italic mb-4">2) Daily Stabilization</h3>
              <p className="text-gray-600 text-sm mb-3">Baseline Training</p>
              <ul className="text-gray-700 space-y-2">
                <li>• Build a steadier baseline over time</li>
                <li>• Short daily regulation practice</li>
                <li>• Repeat for 14-30 days as a start</li>
                <li>• Build nervous system stability</li>
                <li>• Reduce how often the loop starts</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included - Dark Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-[#1a1512] via-[#2a1f1a] to-[#1a1512]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-white font-serif text-3xl mb-12">
            What&apos;s Included
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-8">
            {[
              { title: "Guided", subtitle: "Reset Sessions", image: "/images/Products/Downsell1/icon-reset-sessions.png" },
              { title: "Somatic", subtitle: "Release Protocol", image: "/images/Products/Downsell1/icon-somatic-release.png" },
              { title: "Emergency", subtitle: "Plan (1-Page)", image: "/images/Products/Downsell1/icon-emergency-plan.png" },
              { title: "Daily Rhythm", subtitle: "Plan", image: "/images/Products/Downsell1/icon-daily-rhythm.png" },
              { title: "7-14 Day", subtitle: "Progress Tracker", image: "/images/Products/Downsell1/icon-progress-tracker.png" },
              { title: "Quick Start", subtitle: "Path", image: "/images/Products/Downsell1/icon-quick-start.png" },
            ].map((item, index) => (
              <div key={index} className="bg-[#2a2520] rounded-xl p-3 md:p-6 text-center border border-[#3a3530]">
                <div className="w-20 h-20 md:w-36 md:h-36 mx-auto mb-2 md:mb-4 rounded-lg overflow-hidden flex items-center justify-center bg-[#2a2520]">
                  <Image
                    src={item.image}
                    alt={`${item.title} ${item.subtitle}`}
                    width={144}
                    height={144}
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-white text-sm md:text-xl font-serif">{item.title}</p>
                <p className="text-white text-sm md:text-xl font-serif">{item.subtitle}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="max-w-lg md:max-w-2xl mx-auto px-2">
            <CTAButton />
            <p className="text-gray-500 text-xs md:text-sm mt-2 text-center">
              Clicking will add just $27 to your order for Lifetime access
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
                    portal.innerwealthinitiate.com
                  </div>
                </div>
              </div>

              {/* Portal Screenshot */}
              <div className="relative bg-[#1a1512] rounded-b-lg overflow-hidden">
                <Image
                  src="/images/Products/Downsell1/portal-mockup.png"
                  alt="Nervous System Reset Kit™ Member Portal"
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-white text-xs md:text-sm font-medium">~10 Min Daily</p>
              <p className="text-gray-500 text-[10px] md:text-xs mt-1">Short sessions</p>
            </div>

            <div className="bg-[#1a1512] rounded-lg p-3 md:p-5 border border-[#d4a574]/20 text-center">
              <div className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 md:mb-3 rounded-full bg-[#d4a574]/10 flex items-center justify-center">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-[#d4a574]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <p className="text-white text-xs md:text-sm font-medium">Repeatable</p>
              <p className="text-gray-500 text-[10px] md:text-xs mt-1">Use anytime</p>
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
          <div className="max-w-lg md:max-w-2xl mx-auto px-2">
            <CTAButton />
            <p className="text-white text-xs md:text-sm mt-2 text-center">
              Clicking will add just $27 to your order for Lifetime access
            </p>
            <DeclineLink />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h3 className="font-serif text-2xl italic mb-6">
            How It Works
          </h3>
          <div className="text-gray-700 space-y-4">
            <p>This kit trains your system through a simple progression:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Regulate the immediate threat response</li>
              <li>Release stored tension and charge from the body</li>
              <li>Reinforce a stable baseline through a simple daily rhythm</li>
            </ul>
            <p className="mt-4">This is how you stop the reaction from turning into a spiral.</p>
            <p>Not by forcing calm.</p>
            <p className="font-medium">By training the system to return to neutral.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h3 className="font-serif text-2xl italic mb-8">
            What People Are Saying
          </h3>

          {/* Testimonial Slider */}
          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-6 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:shadow-xl transition-all z-10"
              aria-label="Previous testimonial"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Right Arrow */}
            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-6 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:shadow-xl transition-all z-10"
              aria-label="Next testimonial"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Testimonial Card */}
            <div
              className="bg-white p-4 md:p-6 rounded-lg border border-gray-200 mx-6 md:mx-0"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                  <Image
                    src={testimonials[testimonialIndex].image}
                    alt={testimonials[testimonialIndex].name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm md:text-base">{testimonials[testimonialIndex].name}</p>
                  <p className="text-gray-500 text-xs md:text-sm mb-2 md:mb-3">{testimonials[testimonialIndex].time}</p>
                  <p className="text-gray-700 text-sm md:text-base">
                    {testimonials[testimonialIndex].message}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dots indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setTestimonialIndex(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${idx === testimonialIndex ? 'bg-gray-900' : 'bg-gray-300 hover:bg-gray-400'}`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* What Changes */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h3 className="font-serif text-2xl italic mb-6">
            What Changes When The Nervous System Stabilizes
          </h3>
          <div className="text-gray-700 space-y-4">
            <p>When the nervous system is dysregulated, the body treats ordinary life like a threat.</p>
            <p>That threat response becomes the fuel for the loop.</p>
            <p>As the system stabilizes, a few things begin to change:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You recover faster after triggers</li>
              <li>The intensity in the body reduces</li>
              <li>You get more space between stimulus and reaction</li>
              <li>You stop needing to &ldquo;fight&rdquo; your own system to feel okay</li>
            </ul>
            <p className="mt-4 font-medium">This is the foundation that makes deeper work possible.</p>
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
              <h4 className="text-[#d4a574] font-serif text-base md:text-xl mb-1 md:mb-2">~10</h4>
              <h4 className="text-[#d4a574] font-serif text-base md:text-xl mb-2 md:mb-4">Minutes Daily</h4>
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

      {/* Why This Is $27 */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h3 className="font-serif text-2xl italic mb-6">
            Why You&apos;re Being Offered This Now
          </h3>
          <div className="text-gray-700 space-y-4">
            <p><span className="underline">This is not</span> a collection of calming audios.</p>
            <p>It is a structured reset protocol you can use repeatedly, built from the full program and designed for the moments that actually matter.</p>
            <p>If you want stability first, this is the cleanest place to start.</p>
            <p>Not as a subscription.</p>
            <p>Not as an ongoing commitment.</p>
            <p className="font-medium">As a one-time opportunity to start with nervous system stability.</p>
          </div>
        </div>
      </section>

      {/* Access the Reset Kit - Final CTA */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h3 className="font-serif text-2xl italic mb-6">
            Start With Reset &amp; Stability
          </h3>
          <div className="text-gray-700 space-y-4 mb-8">
            <p>If you are not ready for the full system today, this gives you a powerful first step.</p>
            <p>Stabilize the nervous system.</p>
            <p>Release fear charge.</p>
            <p className="font-medium">Restore calm.</p>
          </div>

          {/* Final CTA */}
          <div className="max-w-lg md:max-w-2xl mx-auto px-2">
            <CTAButton className="!bg-black !text-white hover:!bg-gray-700 hover:!shadow-lg" />
            <p className="text-black text-xs md:text-sm mt-2 text-center">
              Clicking will add just $27 to your order for Lifetime access
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

export default function Downsell1Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <Downsell1Content />
    </Suspense>
  );
}
