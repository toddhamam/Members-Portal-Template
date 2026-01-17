"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function Downsell1Content() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isProcessing, setIsProcessing] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/upsell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          product: "nervous_system_reset",
          amount: 4700, // $47 in cents
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

  const testimonials = [
    {
      name: "Walter Were",
      time: "1:32am",
      messages: [
        "Excellent- thank you Todd. I'll get back to you in this. Yes, Module 3.. quite something. There's more layers but I'm really at the earliest memories which I segregate based on where we lived at the time. Likely 4yrs old is what these are - wow! One just came up!!! Woh! When my mom reversed and ran over the cat. That's the third memory at the home we mover out of 1981 (I was born 1976) and we stayed at the next two homes like 1 yr each, then 2yrs at next - so that's how I remember my age and tie with the memory. That first home I have like 3 memories - they were two( locking keys in my dad's car, going to kindergarten-hated that, and now the dead cat)",
        "Amazing how that memory just came up as I was typing! That's maybe 3 or 4yrs old.",
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Header with Step Indicator */}
      <header className="bg-black py-4 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="w-full h-full">
                <circle cx="20" cy="30" r="8" fill="#d4a574" />
                <ellipse cx="20" cy="18" rx="6" ry="12" fill="url(#flameGradient)" />
                <defs>
                  <linearGradient id="flameGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#d4a574" />
                    <stop offset="50%" stopColor="#f4d03f" />
                    <stop offset="100%" stopColor="#fff" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="text-white text-sm tracking-widest uppercase">Inner Wealth Initiate</span>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="border border-gray-600 text-gray-400 px-3 py-1.5 rounded text-[10px]">
                Step 1: Resistance Map™
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-[#d4a574] text-black px-3 py-1.5 rounded text-[10px] font-medium">
                2b: Nervous System Reset Kit™
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="border border-gray-600 text-gray-400 px-3 py-1.5 rounded text-[10px]">
                3: Bridge to Mastery
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="border border-gray-600 text-gray-400 px-3 py-1.5 rounded text-[10px]">
                4: Order Complete
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Dark with starfield */}
      <section className="bg-black text-white py-12 px-4 relative overflow-hidden">
        {/* Starfield/nebula background effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#1a0a00] to-black opacity-80" />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at center bottom, rgba(212,165,116,0.3) 0%, transparent 60%)',
        }} />

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Headline */}
          <div className="text-center mb-10">
            <p className="text-[#d4a574] text-sm mb-4 tracking-wide">
              Wait! <span className="underline">Almost There</span>...
            </p>
            <h1 className="font-serif italic text-3xl md:text-4xl lg:text-[42px] leading-tight mb-6">
              Not Ready For The Full System Yet?
              <br />
              Stabilize And Calm Your Nervous System First...
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed">
              A step-by-step nervous system reset guide extracted from the full program, designed to help release fear charge, reduce tension, and restore calm in your body and nervous system.
            </p>
          </div>

          {/* Product Mockup */}
          <div className="relative max-w-3xl mx-auto">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#d4a574]/30 via-transparent to-transparent blur-2xl" />

            <div className="relative bg-gradient-to-b from-[#2a1a0a] to-[#1a0a00] rounded-lg p-8 border border-[#d4a574]/20">
              {/* Product title */}
              <div className="text-center mb-8">
                <p className="text-[#d4a574]/60 text-xs uppercase tracking-[0.3em] mb-2">The</p>
                <h2 className="font-serif italic text-3xl md:text-4xl text-[#d4a574]">
                  Nervous System Reset Kit
                </h2>
              </div>

              {/* Laptop mockups */}
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="bg-gray-800 rounded-t-lg p-2 w-40">
                    <div className="bg-gradient-to-br from-[#3a2a1a] to-[#2a1a0a] rounded h-24 flex items-center justify-center">
                      <span className="text-[#d4a574] text-xs">Module Preview</span>
                    </div>
                  </div>
                  <div className="bg-gray-700 h-2 w-48 rounded-b-lg mx-auto" />
                  <p className="text-[#d4a574] text-xs mt-3 uppercase tracking-wider">Extracted From Full Program</p>
                </div>
                <div className="text-center">
                  <div className="bg-gray-800 rounded-t-lg p-2 w-40">
                    <div className="bg-gradient-to-br from-[#3a2a1a] to-[#2a1a0a] rounded h-24 flex items-center justify-center">
                      <span className="text-[#d4a574] text-xs">Quick Access</span>
                    </div>
                  </div>
                  <div className="bg-gray-700 h-2 w-48 rounded-b-lg mx-auto" />
                  <p className="text-[#d4a574] text-xs mt-3 uppercase tracking-wider">Instant Access</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Button Section */}
      <section className="bg-black py-8 px-4">
        <div className="max-w-xl mx-auto space-y-3">
          <button
            onClick={handleAccept}
            disabled={isProcessing}
            className="w-full bg-[#222] hover:bg-black text-white font-medium py-4 px-8 text-center transition-colors disabled:opacity-50"
          >
            {isProcessing ? (
              "Processing..."
            ) : (
              <>
                Yes - Add The Nervous System Reset™ to My Order
                <br />
                <span className="text-xs text-gray-400 font-normal">Clicking this will add $47 to your order</span>
              </>
            )}
          </button>
          <Link
            href={`/upsell-2?session_id=${sessionId}`}
            className="block text-center text-gray-500 hover:text-gray-300 text-sm underline py-2"
          >
            No thanks, I don&apos;t Want The Nervous System Reset
          </Link>
        </div>
      </section>

      {/* A Calm Body Creates A Calm Mind */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif italic text-3xl md:text-4xl text-center mb-8">
            A Calm Body Creates A Calm Mind
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              If you have already gained insight, but your body still reacts the same way, that is not a mindset issue.
            </p>
            <p>It is a nervous system pattern.</p>
            <p>
              When the system detects threat, it pulls you into automatic protection mode... Tightness. Panic. Shutdown. Overthinking. Avoidance. Control.
            </p>
            <p>
              This kit is designed to interrupt that pattern at the source, so you can return to calm faster and stop feeding the loop.
            </p>
          </div>
        </div>
      </section>

      {/* What This Reset Kit Is */}
      <section className="bg-white py-12 px-4 border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif italic text-2xl md:text-3xl mb-6">
            What This Reset Kit Is
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              This is a focused nervous system reset guide extracted from the full program.
            </p>
            <p>
              It includes the somatic body release and nervous system regulation work as a standalone kit, so you can start with stability first, without committing to the full system today.
            </p>
            <p>No extra theory.</p>
            <p>No long program to keep up with.</p>
            <p>Just a clear, guided process you can use right away.</p>
          </div>
        </div>
      </section>

      {/* Core Training Layers - Dark Section */}
      <section className="bg-black py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at center, rgba(212,165,116,0.15) 0%, transparent 70%)',
        }} />

        <div className="max-w-2xl mx-auto relative z-10">
          <div className="border border-[#d4a574]/30 rounded-lg p-8 bg-gradient-to-b from-[#1a0a00]/80 to-black/80">
            <h3 className="text-center text-[#d4a574] uppercase tracking-[0.2em] text-sm mb-8">
              Core Training Layers
            </h3>
            <div className="space-y-3">
              {[
                "Nervous System Regulation",
                "Somatic Body Release",
                "Trigger-to-Reset Protocol",
                "Daily Stabilization Rhythm",
              ].map((item, index) => (
                <div
                  key={index}
                  className="border border-[#d4a574]/40 rounded px-6 py-3 text-center text-[#d4a574] font-serif"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif italic text-2xl md:text-3xl mb-6">
            What You Get in the Nervous System Reset Kit™ Today
          </h2>
          <p className="text-gray-700 mb-6">
            Everything inside is guided, step-by-step, and designed to be used in real moments of activation.
          </p>
          <p className="text-gray-700 mb-4">Here&apos;s Just Some of What You Get Inside the Reset Kit:</p>
          <ul className="space-y-2 text-gray-700 mb-4">
            <li>-Guided nervous system reset sessions</li>
            <li>-Somatic body release protocol</li>
            <li>-Trigger-to-Reset emergency plan (one-page)</li>
            <li>- Daily stabilization rhythm (simple plan)</li>
            <li>- Progress tracker (7-14 days)</li>
            <li>-Quick start path so you know exactly what to do first</li>
          </ul>
          <button className="text-gray-500 text-sm">... More</button>
        </div>
      </section>

      {/* What's Included Grid - Dark Section */}
      <section className="bg-black py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at center, rgba(212,165,116,0.2) 0%, transparent 60%)',
        }} />

        <div className="max-w-2xl mx-auto relative z-10">
          <div className="border border-[#d4a574]/30 rounded-lg p-8 bg-gradient-to-b from-[#1a0a00]/60 to-black/80">
            <h3 className="text-center uppercase tracking-[0.15em] text-sm mb-2 text-white">
              What&apos;s Included
            </h3>
            <p className="text-center text-[#d4a574]/70 text-xs mb-8">In The Nervous System Reset Kit</p>

            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: "🎧", title: "Guided", subtitle: "Reset Sessions" },
                { icon: "🧘", title: "Somatic", subtitle: "Release Protocol" },
                { icon: "📄", title: "Emergency", subtitle: "Plan (1-Page)" },
                { icon: "📅", title: "Daily Rhythm", subtitle: "Plan" },
                { icon: "📊", title: "7-14 Day", subtitle: "Tracker" },
                { icon: "🚀", title: "Quick Start", subtitle: "Path" },
              ].map((item, index) => (
                <div key={index} className="border border-[#d4a574]/40 rounded-lg p-4 text-center bg-[#1a0a00]/50">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <p className="text-[#d4a574] text-sm font-medium">{item.title}</p>
                  <p className="text-[#d4a574]/70 text-xs">{item.subtitle}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Two Ways To Use */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif italic text-2xl md:text-3xl mb-8">
            Two Ways To Use The Reset Kit
          </h2>

          <div className="space-y-8">
            <div>
              <h3 className="font-semibold mb-2">1) The Quick Reset (When Triggered)</h3>
              <ul className="space-y-1 text-gray-700">
                <li>-Use this when you feel activated in real time.</li>
                <li>-Follow the emergency plan</li>
                <li>-Run one guided reset session</li>
                <li>-Release fear charge in the body</li>
                <li>-Return to calm faster</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2) Daily Stabilization (Baseline Training)</h3>
              <ul className="space-y-1 text-gray-700">
                <li>-Use this to build a steadier baseline over time.</li>
                <li>-Short daily regulation practice while working through the modules</li>
                <li>-Repeat for 14-30 days as a start, then as needed</li>
                <li>-Build nervous system stability</li>
                <li>-Reduce how often the loop starts</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Time & Effort - Dark Section */}
      <section className="bg-black py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at center, rgba(212,165,116,0.2) 0%, transparent 60%)',
        }} />

        <div className="max-w-2xl mx-auto relative z-10">
          <div className="border border-[#d4a574]/30 rounded-lg p-8 bg-gradient-to-b from-[#1a0a00]/60 to-black/80">
            <h3 className="text-center uppercase tracking-[0.2em] text-sm mb-8 text-white">
              Time & Effort
            </h3>

            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full border-2 border-[#d4a574] flex items-center justify-center mx-auto mb-3">
                  <span className="text-[#d4a574] text-lg font-serif">~10</span>
                </div>
                <p className="text-[#d4a574] text-sm">10 Minutes</p>
                <p className="text-[#d4a574]/70 text-xs">Daily</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full border-2 border-[#d4a574] flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-[#d4a574]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-[#d4a574] text-sm">Use When</p>
                <p className="text-[#d4a574]/70 text-xs">Triggered</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full border-2 border-[#d4a574] flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-[#d4a574]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <p className="text-[#d4a574] text-sm">Repeatable</p>
                <p className="text-[#d4a574]/70 text-xs">System</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Second CTA */}
      <section className="bg-white py-8 px-4">
        <div className="max-w-xl mx-auto space-y-3">
          <button
            onClick={handleAccept}
            disabled={isProcessing}
            className="w-full bg-[#222] hover:bg-black text-white font-medium py-4 px-8 text-center transition-colors disabled:opacity-50"
          >
            {isProcessing ? (
              "Processing..."
            ) : (
              <>
                Yes - Add The Nervous System Reset™ to My Order 🛒
                <br />
                <span className="text-xs text-gray-400 font-normal">Clicking this will add $47 to your order</span>
              </>
            )}
          </button>
          <Link
            href={`/upsell-2?session_id=${sessionId}`}
            className="block text-center text-gray-500 hover:text-gray-300 text-sm underline py-2"
          >
            No thanks, I don&apos;t Want The Nervous System Reset
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16 px-4 border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif italic text-2xl md:text-3xl mb-6">
            How It Works
          </h2>
          <p className="text-gray-700 mb-6">
            This kit trains your system through a simple progression:
          </p>
          <ul className="space-y-3">
            {[
              "Regulate the immediate threat response",
              "Release stored tension and charge from the body",
              "Reinforce a stable baseline through a simple daily rhythm",
              "This is how you stop the reaction from turning into a spiral.",
              "Not by forcing calm. By training the system to return to neutral.",
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* What Changes */}
      <section className="bg-white py-16 px-4 border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif italic text-2xl md:text-3xl mb-6">
            What Changes When The Nervous System Stabilizes
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>When the nervous system is dysregulated, the body treats ordinary life like a threat.</p>
            <p>That threat response becomes the fuel for the loop.</p>
            <p>As the system stabilizes, a few things begin to change:</p>
            <p>You recover faster after triggers</p>
            <p>The intensity in the body reduces</p>
            <p>You get more space between stimulus and reaction</p>
            <p>You stop needing to &ldquo;fight&rdquo; your own system to feel okay</p>
            <p>This is the foundation that makes deeper work possible.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-16 px-4 border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif italic text-2xl md:text-3xl mb-8">
            What People Are Saying
          </h2>

          <div className="relative">
            {/* Testimonial Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{testimonials[testimonialIndex].name}</p>
                  <p className="text-xs text-gray-500">{testimonials[testimonialIndex].time}</p>
                </div>
              </div>
              <div className="space-y-4">
                {testimonials[testimonialIndex].messages.map((msg, idx) => (
                  <p key={idx} className="text-gray-700 text-sm leading-relaxed">{msg}</p>
                ))}
              </div>
            </div>

            {/* Navigation arrows */}
            <button className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 bg-white rounded-full shadow border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600">
              ‹
            </button>
            <button className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 bg-white rounded-full shadow border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600">
              ›
            </button>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {[0, 1, 2, 3].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setTestimonialIndex(idx % testimonials.length)}
                  className={`w-2 h-2 rounded-full ${idx === testimonialIndex ? 'bg-gray-800' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What People Notice First */}
      <section className="bg-white py-16 px-4 border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif italic text-2xl md:text-3xl mb-6">
            What People Notice First
          </h2>
          <div className="space-y-2 text-gray-700 mb-8">
            <p>People usually notice practical changes before anything else:</p>
            <p>Faster recovery after triggers</p>
            <p>Less intensity in the body</p>
            <p>More space between stimulus and reaction</p>
            <p>A steadier baseline over time</p>
          </div>
        </div>
      </section>

      {/* What People Notice First - Dark Graphic */}
      <section className="bg-black py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at center, rgba(212,165,116,0.2) 0%, transparent 60%)',
        }} />

        <div className="max-w-2xl mx-auto relative z-10">
          <div className="border border-[#d4a574]/30 rounded-lg p-8 bg-gradient-to-b from-[#1a0a00]/60 to-black/80">
            <h3 className="text-center uppercase tracking-[0.15em] text-sm mb-8 text-white">
              What People Notice First
            </h3>

            <div className="grid grid-cols-3 gap-4">
              {[
                { title: "Faster", subtitle: "recovery", desc: "after triggers" },
                { title: "Less Intensity", subtitle: "", desc: "in the body" },
                { title: "Steadier", subtitle: "baseline", desc: "over time" },
              ].map((item, index) => (
                <div key={index} className="border border-[#d4a574]/40 rounded-lg p-4 text-center bg-[#1a0a00]/50">
                  <p className="text-[#d4a574] text-sm font-medium">{item.title}</p>
                  {item.subtitle && <p className="text-[#d4a574] text-sm">{item.subtitle}</p>}
                  <p className="text-[#d4a574]/70 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why This Is $47 */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif italic text-2xl md:text-3xl mb-6">
            Why This Is $47
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p><span className="underline">This is not</span> a collection of calming audios.</p>
            <p>
              It is a structured reset protocol you can use repeatedly, built from the full program and designed for the moments that actually matter.
            </p>
            <p>If you want stability first, this is the cleanest place to start.</p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-white py-16 px-4 border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif italic text-2xl md:text-3xl mb-6">
            Start With Reset & Stability
          </h2>
          <div className="space-y-2 text-gray-700 mb-8">
            <p>If you are not ready for the full system today, this gives you a powerful first step.</p>
            <p>Stabilize the nervous system.</p>
            <p>Release fear charge.</p>
            <p>Restore calm.</p>
          </div>

          <div className="max-w-xl mx-auto space-y-3">
            <button
              onClick={handleAccept}
              disabled={isProcessing}
              className="w-full bg-[#222] hover:bg-black text-white font-medium py-4 px-8 text-center transition-colors disabled:opacity-50"
            >
              {isProcessing ? (
                "Processing..."
              ) : (
                <>
                  Yes - Add The Nervous System Reset™ to My Order 🛒
                  <br />
                  <span className="text-xs text-gray-400 font-normal">Clicking this will add $47 to your order</span>
                </>
              )}
            </button>
            <Link
              href={`/upsell-2?session_id=${sessionId}`}
              className="block text-center text-gray-500 hover:text-gray-300 text-sm underline py-2"
            >
              No thanks, I don&apos;t Want The Nervous System Reset
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] py-8 px-4">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-500">
          <p>All rights reserved {new Date().getFullYear()}.</p>
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
