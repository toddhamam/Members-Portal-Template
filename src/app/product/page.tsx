"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  StarRating,
  DownloadIcon,
  ChevronDownIcon,
} from "@/components/shared";
import { trackViewContent } from "@/lib/meta-pixel";
import { ga4 } from "@/lib/ga4";

// Product images for the hero slider
const productImages = [
  { src: "/images/Products/hero-product.png", alt: "The Resistance Map™ - Complete Bundle" },
  { src: "/images/Products/whats-inside-product.png", alt: "What's Inside - Full Spread" },
  { src: "/images/Products/five-phase-map.png", alt: "The Five Phase Map" },
  { src: "/images/Products/root-pattern.png", alt: "Root Pattern Analysis" },
  { src: "/images/Products/golden-thread-hero.png", alt: "The Golden Thread" },
  { src: "/images/Products/no-more-guesswork.png", alt: "No More Guesswork" },
];

// Product thumbnail component
function ProductThumbnail({
  src,
  alt,
  active,
  onClick
}: {
  src: string;
  alt: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
        active ? "border-[#d4a574]" : "border-gray-200 hover:border-gray-400"
      }`}
    >
      <Image
        src={src}
        alt={alt}
        width={120}
        height={120}
        className="w-full h-full object-cover"
      />
    </button>
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

// Feature icon components for "What's Inside" section
function ClockIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

export default function ProductPage() {
  const [openFAQ, setOpenFAQ] = useState<number>(0);
  const [activeImage, setActiveImage] = useState(0);
  const [testimonialPage, setTestimonialPage] = useState(0);

  // Track ViewContent for Meta Pixel and GA4
  useEffect(() => {
    trackViewContent({
      content_name: 'Resistance Mapping Guide',
      content_ids: ['resistance-mapping-guide'],
      content_type: 'product',
      value: 7.00,
      currency: 'USD',
    });
    // Track for GA4
    ga4.viewItem(
      {
        item_id: 'resistance-mapping-guide',
        item_name: 'Resistance Mapping Guide',
        item_category: 'main_product',
        price: 7.00,
        quantity: 1,
      },
      7.00
    );
  }, []);

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
        {/* Left: Product Image Area */}
        <div className="bg-white flex flex-col p-6 lg:p-8">
          {/* Main Product Image */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-full">
              <Image
                src={productImages[activeImage].src}
                alt={productImages[activeImage].alt}
                width={700}
                height={700}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>

          {/* Thumbnail Gallery */}
          <div className="grid grid-cols-6 gap-2 lg:gap-3 pt-4">
            {productImages.map((img, i) => (
              <ProductThumbnail
                key={i}
                src={img.src}
                alt={img.alt}
                active={activeImage === i}
                onClick={() => setActiveImage(i)}
              />
            ))}
          </div>
        </div>

        {/* Right: Product Info - Light */}
        <div className="p-8 lg:p-16 flex flex-col justify-center">
          {/* Star Rating */}
          <div className="flex items-center gap-2 mb-6">
            <StarRating size="md" />
            <span className="text-base text-gray-500">4.9/5</span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-4xl lg:text-5xl text-[#222222] leading-tight mb-8">
            Resistance Mapping Guide™ - Expanded 2nd Edition
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-4 mb-8">
            <span className="text-3xl font-bold text-[#222222]">$7.00</span>
            <span className="text-xl text-gray-400 line-through">$29.95</span>
            <span className="bg-[#d4a574] text-white text-sm font-semibold px-3 py-1.5 rounded">
              SAVE 77%
            </span>
          </div>

          {/* Feature List */}
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-4 text-gray-700 text-lg">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Instant Download &amp; Access
            </li>
            <li className="flex items-center gap-4 text-gray-700 text-lg">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Read From Any Device
            </li>
            <li className="flex items-center gap-4 text-gray-700 text-lg">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              30-Day Refund
            </li>
          </ul>

          {/* Testimonial Quote */}
          <div className="mb-8 text-base text-gray-600 italic">
            <p className="mb-3 leading-relaxed">
              &ldquo;I used these exercises to discover programs and beliefs in my sub-conscious that I never knew I had. This allowed me to move past a lot of distortions &amp; destructive patterns.&rdquo;
            </p>
            <div className="flex items-center gap-2">
              <span className="not-italic font-medium">Reza Q.</span>
              <StarRating size="sm" />
            </div>
          </div>

          {/* CTA Button */}
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center gap-3 bg-[#222222] text-white px-10 py-5 text-lg font-medium tracking-wide hover:bg-black transition-colors w-full"
          >
            Add to Cart
            <DownloadIcon className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Desktop: Show 3 at a time */}
          <div className="hidden md:grid md:grid-cols-3 gap-8">
            {testimonials.slice(testimonialPage * 3, testimonialPage * 3 + 3).map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl">
                <div className="text-6xl text-gray-200 leading-none mb-6">&ldquo;</div>
                <p className="text-gray-600 text-base leading-relaxed mb-8">
                  {testimonial.quote}
                </p>
                <p className="font-semibold text-lg text-gray-900">
                  {testimonial.name}
                  {testimonial.location && (
                    <span className="text-gray-500 font-normal"> - {testimonial.location}</span>
                  )}
                </p>
              </div>
            ))}
          </div>

          {/* Mobile: Show 1 at a time */}
          <div className="md:hidden">
            <div className="bg-white p-8 rounded-xl">
              <div className="text-6xl text-gray-200 leading-none mb-6">&ldquo;</div>
              <p className="text-gray-600 text-base leading-relaxed mb-8">
                {testimonials[testimonialPage]?.quote}
              </p>
              <p className="font-semibold text-lg text-gray-900">
                {testimonials[testimonialPage]?.name}
                {testimonials[testimonialPage]?.location && (
                  <span className="text-gray-500 font-normal"> - {testimonials[testimonialPage]?.location}</span>
                )}
              </p>
            </div>
          </div>

          {/* Carousel navigation */}
          <div className="flex items-center justify-center gap-6 mt-10">
            <button
              onClick={() => setTestimonialPage(Math.max(0, testimonialPage - 1))}
              className={`text-3xl transition-colors ${
                testimonialPage === 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:text-gray-900"
              }`}
              disabled={testimonialPage === 0}
            >
              &larr;
            </button>
            <div className="flex gap-3">
              {Array.from({ length: Math.ceil(testimonials.length / 3) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialPage(i)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    testimonialPage === i ? "bg-gray-900" : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setTestimonialPage(Math.min(Math.ceil(testimonials.length / 3) - 1, testimonialPage + 1))}
              className={`text-3xl transition-colors ${
                testimonialPage >= Math.ceil(testimonials.length / 3) - 1
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              disabled={testimonialPage >= Math.ceil(testimonials.length / 3) - 1}
            >
              &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* What's Inside The Expanded 2nd Edition Section */}
      <section className="py-24 px-4 bg-[#0f0f0f] text-white">
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl lg:text-5xl mb-8">
              What&apos;s Inside The Expanded 2nd Edition
            </h2>
            <p className="text-gray-400 text-base lg:text-lg max-w-3xl mx-auto leading-relaxed">
              You don&apos;t have to do this alone. You&apos;ve been sent a guide to help you discover and understand your fear loops clearly, so you can transform... It&apos;s time to awaken...
            </p>
          </div>

          {/* Features Grid with Center Product */}
          <div className="relative">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16 items-center">
              {/* Left Column - Features */}
              <div className="space-y-10 lg:space-y-16">
                {/* Quick Run */}
                <div className="text-left">
                  <div className="flex items-center gap-3 mb-4 text-gray-400">
                    <ClockIcon />
                  </div>
                  <h3 className="font-semibold text-lg lg:text-xl mb-3">Quick Run (15 minutes)</h3>
                  <p className="text-gray-400 text-base leading-relaxed">
                    Map the loop while you are triggered so you can get clarity fast, instead of spiraling.
                  </p>
                </div>

                {/* Printable Worksheets */}
                <div className="text-left">
                  <div className="flex items-center gap-3 mb-4 text-gray-400">
                    <DocumentIcon />
                  </div>
                  <h3 className="font-semibold text-lg lg:text-xl mb-3">Printable Worksheets + Instant Download</h3>
                  <p className="text-gray-400 text-base leading-relaxed">
                    Use it on any device, print the pages if you want, and return to the method whenever the pattern shows up again.
                  </p>
                </div>
              </div>

              {/* Center - Product Image */}
              <div className="flex justify-center items-center order-first lg:order-none my-10 lg:my-0">
                <div className="relative w-full lg:scale-150">
                  <Image
                    src="/images/Products/whats-inside-product.png"
                    alt="The Resistance Map™ bundle - book, phone guide, tablet, and worksheets"
                    width={1200}
                    height={1200}
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {/* Right Column - Features */}
              <div className="space-y-10 lg:space-y-16">
                {/* Guided Prompts */}
                <div className="text-left lg:text-right">
                  <div className="flex items-center gap-3 mb-4 text-gray-400 lg:justify-end">
                    <DocumentIcon />
                  </div>
                  <h3 className="font-semibold text-lg lg:text-xl mb-3">Guided Prompts + Real Examples</h3>
                  <p className="text-gray-400 text-base leading-relaxed">
                    You are never left guessing what to do next. Follow the prompts, see worked examples, and apply it to your own life immediately.
                  </p>
                </div>

                {/* How to Use */}
                <div className="text-left lg:text-right">
                  <div className="flex items-center gap-3 mb-4 text-gray-400 lg:justify-end">
                    <HeartIcon />
                  </div>
                  <h3 className="font-semibold text-lg lg:text-xl mb-3">How to Use the Resistance Map™ (Step-by-Step Walkthrough)</h3>
                  <p className="text-gray-400 text-base leading-relaxed">
                    A clear guided walkthrough showing you exactly how to run the map, what to write, and how to follow the process.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-16">
            <Link
              href="/checkout"
              className="inline-flex items-center justify-center gap-3 bg-white text-[#222222] px-14 py-5 text-lg font-medium tracking-wide hover:bg-gray-100 transition-colors"
            >
              Add to Cart
              <DownloadIcon className="w-5 h-5" />
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
