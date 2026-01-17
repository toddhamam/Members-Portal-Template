"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Footer,
  StarRating,
  DownloadIcon,
  ChevronDownIcon,
} from "@/components/shared";

// Product thumbnail component
function ProductThumbnail({ active = false }: { active?: boolean }) {
  return (
    <div
      className={`w-16 h-16 bg-[#2a2a2e] rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${
        active ? "border-[#d4a574]" : "border-transparent hover:border-gray-600"
      }`}
    >
      <div className="w-full h-full bg-gradient-to-br from-[#3a3a3e] to-[#2a2a2e] flex items-center justify-center">
        <div className="w-8 h-10 bg-gradient-to-b from-[#d4a574] to-[#b8956c] rounded-sm" />
      </div>
    </div>
  );
}

// FAQ Item component
function FAQItem({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      <button
        onClick={onClick}
        className="w-full px-6 py-5 text-left flex items-center justify-between text-gray-900 font-medium text-lg"
      >
        <span>{question}</span>
        <ChevronDownIcon
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-5 text-gray-600 border-t border-gray-100 pt-4">
          {answer}
        </div>
      )}
    </div>
  );
}

// Benefit icon components
function ClarityIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  );
}

function EmpowermentIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

function ConnectionIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

function WisdomIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

export default function ProductPage() {
  const [openFAQ, setOpenFAQ] = useState<number>(0);
  const [activeThumb, setActiveThumb] = useState(0);

  const faqs = [
    {
      question: "Is this a print version or eBook?",
      answer:
        "For now Resistance Mapping is available only as a downloadable eBook, this may change in the future as we publish future editions.",
    },
    {
      question: "Will I Get Free Access to Future Editions?",
      answer:
        "Yes! When you purchase the Resistance Mapping Guide, you'll receive free access to all future updates and editions.",
    },
    {
      question: "How Do I Know What's in This Book Will Work For Me?",
      answer:
        "The Resistance Mapping system is designed to work with any pattern or block you're experiencing. It's a universal framework that adapts to your unique situation.",
    },
  ];

  const testimonials = [
    {
      quote:
        "If you are craving a deeper understanding of yourself, the universe and why you are here on this earth, 'The Way Home' will help illuminate your path. The wisdom in this book will not only serve as a catalyst to your own growth and awakening, but will create a ripple effect on those you encounter and in turn the collective consciousness. 'The Way Home' is written in an accessible and easy to understand manner, regardless if you are at the start of your spiritual journey or are an experienced seeker.",
      name: "Vanessa W",
      location: "Australia",
    },
    {
      quote:
        "The information that Todd delivers has opened up the pathway for my awakening & transformation.",
      name: "Tamara J.",
    },
    {
      quote:
        "I began seeing repeating numbers like 111, 333, and didn't know what was happening to me. Naturally, I started getting fearful. This information acted as such a good guide for me, and gave me some peace knowing it was confirmation signs of awakening.",
      name: "Clark S.",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="grid lg:grid-cols-2 min-h-[600px]">
        {/* Left: Product Image Area - Dark */}
        <div className="bg-[#1a1a1a] p-8 lg:p-12 flex flex-col justify-center">
          {/* Main Product Bundle Image */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              {/* Product bundle mockup placeholder */}
              <div className="flex items-end gap-4">
                {/* Worksheets/Papers */}
                <div className="w-24 h-32 bg-[#f5f3ef] rounded shadow-lg transform -rotate-6 hidden sm:block">
                  <div className="p-2 text-[6px] text-gray-400">
                    <div className="border-b border-gray-200 pb-1 mb-1">Worksheet</div>
                  </div>
                </div>

                {/* Main Book */}
                <div className="relative z-10">
                  <div className="w-40 h-52 bg-gradient-to-b from-[#d4a574] to-[#b8956c] rounded-lg shadow-2xl flex flex-col items-center justify-center p-4">
                    <p className="text-[#1a1a2e] text-[8px] uppercase tracking-widest mb-1">The</p>
                    <h3 className="text-[#1a1a2e] text-lg font-serif font-bold leading-tight text-center">
                      RESISTANCE
                    </h3>
                    <h3 className="text-[#1a1a2e] text-lg font-serif font-bold leading-tight text-center">
                      MAP
                    </h3>
                    <div className="w-12 h-12 my-3">
                      <svg className="w-full h-full text-[#1a1a2e]" viewBox="0 0 100 100" fill="currentColor">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2"/>
                        {[...Array(12)].map((_, i) => (
                          <line key={i} x1="50" y1="10" x2="50" y2="20" stroke="currentColor" strokeWidth="2" transform={`rotate(${i * 30} 50 50)`}/>
                        ))}
                      </svg>
                    </div>
                    <p className="text-[#1a1a2e] text-[8px]">Todd Hamash</p>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#8B7355] text-white text-[8px] px-2 py-0.5 rounded whitespace-nowrap">
                    THE RESISTANCE MAP™
                  </div>
                </div>

                {/* Side book */}
                <div className="w-8 h-48 bg-gradient-to-r from-[#c49a6c] to-[#d4a574] rounded-r shadow-lg transform rotate-3 hidden sm:block" />

                {/* Phone mockup */}
                <div className="w-16 h-28 bg-[#2a2a2e] rounded-xl shadow-lg transform rotate-6 hidden sm:block">
                  <div className="w-full h-full p-1">
                    <div className="w-full h-full bg-gradient-to-b from-[#d4a574] to-[#b8956c] rounded-lg flex items-center justify-center">
                      <span className="text-[6px] text-[#1a1a2e]">GUIDE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Thumbnail Gallery */}
          <div className="flex justify-center gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <ProductThumbnail
                key={i}
                active={activeThumb === i}
              />
            ))}
          </div>
        </div>

        {/* Right: Product Info - Light */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          {/* Star Rating */}
          <div className="flex items-center gap-2 mb-4">
            <StarRating size="md" />
            <span className="text-sm text-gray-500">4.9/5</span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl lg:text-4xl text-[#222222] leading-tight mb-6">
            Resistance Mapping Guide™ - Expanded 2nd Edition
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-2xl font-bold text-[#222222]">$7.00</span>
            <span className="text-lg text-gray-400 line-through">$29.95</span>
            <span className="bg-[#d4a574] text-white text-xs font-semibold px-2 py-1 rounded">
              SAVE 77%
            </span>
          </div>

          {/* Feature List */}
          <ul className="space-y-3 mb-6">
            <li className="flex items-center gap-3 text-gray-700">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Instant Download &amp; Access
            </li>
            <li className="flex items-center gap-3 text-gray-700">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Read From Any Device
            </li>
            <li className="flex items-center gap-3 text-gray-700">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              30-Day Refund
            </li>
          </ul>

          {/* Testimonial Quote */}
          <div className="mb-6 text-sm text-gray-600 italic">
            <p className="mb-2">
              &ldquo;I used these exercises to discover programs and beliefs in my sub-conscious that I never knew I had. This allowed me to move past a lot of distortions &amp; destructive patterns.&rdquo;
            </p>
            <div className="flex items-center gap-1">
              <span className="not-italic">Reza Q.</span>
              <StarRating size="sm" />
            </div>
          </div>

          {/* CTA Button */}
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center gap-2 bg-[#222222] text-white px-8 py-4 text-sm font-medium tracking-wide hover:bg-black transition-colors w-full"
          >
            Add to Cart
            <DownloadIcon className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg">
                {/* Quotation mark */}
                <div className="text-5xl text-gray-200 leading-none mb-4">&ldquo;</div>

                {/* Quote */}
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {testimonial.quote}
                </p>

                {/* Name */}
                <p className="font-medium text-gray-900">
                  {testimonial.name}
                  {testimonial.location && (
                    <span className="text-gray-500"> - {testimonial.location}</span>
                  )}
                </p>
              </div>
            ))}
          </div>

          {/* Carousel dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <button className="text-gray-400 hover:text-gray-600">&larr;</button>
            <button className="w-2 h-2 rounded-full bg-gray-900" />
            <button className="w-2 h-2 rounded-full bg-gray-300" />
            <button className="text-gray-400 hover:text-gray-600">&rarr;</button>
          </div>
        </div>
      </section>

      {/* Illuminating Your Path - Dark Benefits Section */}
      <section className="py-20 px-4 bg-[#0f0f0f] text-white">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl lg:text-4xl italic mb-4">
              Illuminating Your Path
            </h2>
            <h2 className="font-serif text-3xl lg:text-4xl italic mb-6">
              Though the Darkness
            </h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              You don&apos;t have to do this alone. You&apos;ve been sent a guide to help you begin this journey... It&apos;s time to awaken...
            </p>
          </div>

          {/* Benefits Grid with Center Product */}
          <div className="relative">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 items-center">
              {/* Left Column - Clarity & Connection */}
              <div className="space-y-12 lg:space-y-24">
                {/* Clarity */}
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-3 text-gray-400">
                    <ClarityIcon />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Clarity</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Begin making sense of what&apos;s happening to you. Understand why you feel this way and what it means for your Soul&apos;s evolution.
                  </p>
                </div>

                {/* Connection */}
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-3 text-gray-400">
                    <ConnectionIcon />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Connection</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Learn how to start connecting with the light of your soul and begin living in alignment with your true self.
                  </p>
                </div>
              </div>

              {/* Center - Product Image */}
              <div className="hidden lg:flex justify-center items-center">
                <div className="relative">
                  {/* Product bundle */}
                  <div className="flex items-end gap-2">
                    {/* Papers */}
                    <div className="w-20 h-28 bg-[#f5f3ef] rounded shadow-lg transform -rotate-6">
                      <div className="p-1.5 text-[5px] text-gray-400">
                        <div className="border-b border-gray-200 pb-0.5 mb-0.5">Worksheet</div>
                      </div>
                    </div>

                    {/* Main Book */}
                    <div className="w-32 h-44 bg-gradient-to-b from-[#d4a574] to-[#b8956c] rounded-lg shadow-2xl flex flex-col items-center justify-center p-3 relative z-10">
                      <p className="text-[#1a1a2e] text-[6px] uppercase tracking-widest mb-0.5">The</p>
                      <h3 className="text-[#1a1a2e] text-sm font-serif font-bold leading-tight text-center">
                        RESISTANCE
                      </h3>
                      <h3 className="text-[#1a1a2e] text-sm font-serif font-bold leading-tight text-center">
                        MAP
                      </h3>
                      <div className="w-8 h-8 my-2">
                        <svg className="w-full h-full text-[#1a1a2e]" viewBox="0 0 100 100" fill="currentColor">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2"/>
                          {[...Array(12)].map((_, i) => (
                            <line key={i} x1="50" y1="10" x2="50" y2="20" stroke="currentColor" strokeWidth="2" transform={`rotate(${i * 30} 50 50)`}/>
                          ))}
                        </svg>
                      </div>
                      <p className="text-[#1a1a2e] text-[6px]">Todd Hamash</p>
                    </div>

                    {/* Side book */}
                    <div className="w-6 h-40 bg-gradient-to-r from-[#c49a6c] to-[#d4a574] rounded-r shadow-lg transform rotate-3" />
                  </div>

                  {/* Label */}
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-center">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">THE RESISTANCE MAP™</span>
                    <br />
                    <span className="text-[8px] text-gray-600">Expanded 2nd Edition</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Empowerment & Inner Wisdom */}
              <div className="space-y-12 lg:space-y-24">
                {/* Empowerment */}
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2 mb-3 text-gray-400">
                    <EmpowermentIcon />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Empowerment</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Learn what self-sabotage actually is, and how to break free from destructive patterns that no longer serve you. Step into your inner power to create what you desire.
                  </p>
                </div>

                {/* Inner Wisdom */}
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2 mb-3 text-gray-400">
                    <WisdomIcon />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Inner Wisdom</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Begin understanding the nature of vibration and universal laws, so that you can become your own source of wisdom and guidance by tuning into Heart based intelligence.
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile: Show product in center */}
            <div className="lg:hidden flex justify-center my-12">
              <div className="w-32 h-44 bg-gradient-to-b from-[#d4a574] to-[#b8956c] rounded-lg shadow-2xl flex flex-col items-center justify-center p-3">
                <p className="text-[#1a1a2e] text-[6px] uppercase tracking-widest mb-0.5">The</p>
                <h3 className="text-[#1a1a2e] text-sm font-serif font-bold leading-tight text-center">
                  RESISTANCE MAP
                </h3>
                <div className="w-8 h-8 my-2">
                  <svg className="w-full h-full text-[#1a1a2e]" viewBox="0 0 100 100" fill="currentColor">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <p className="text-[#1a1a2e] text-[6px]">Todd Hamash</p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-12">
            <Link
              href="/checkout"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#222222] px-12 py-4 text-sm font-medium tracking-wide hover:bg-gray-100 transition-colors"
            >
              Add to Cart
              <DownloadIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-[#0f0f0f]">
        <div className="max-w-2xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openFAQ === index}
              onClick={() => setOpenFAQ(openFAQ === index ? -1 : index)}
            />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-[#0f0f0f] border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center">
            <Link href="/privacy" className="text-gray-400 hover:text-white underline text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white underline text-sm">
              Terms Of Service
            </Link>
            <Link href="/refund" className="text-gray-400 hover:text-white underline text-sm">
              Refund Policy
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
