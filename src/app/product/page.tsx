import Link from "next/link";

function StarRating({ rating = 5 }: { rating?: number }) {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${i < rating ? "text-yellow-400" : "text-gray-300"} fill-current`}
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
  );
}

function BenefitCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-4 items-start p-4 rounded-none bg-gray-50">
      <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0 text-white">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );
}

function TrustBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <span className="text-green-600">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

export default function ProductPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 py-4 px-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="text-xl font-semibold text-gray-900">
            Inner Wealth Initiate
          </Link>
        </div>
      </header>

      {/* Product Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="bg-[#F5F5F5] rounded-none p-8 flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-48 h-64 mx-auto bg-white rounded-lg shadow-xl flex items-center justify-center border border-gray-200">
                  <div className="text-center p-4">
                    <p className="text-xs text-[var(--accent)] font-medium uppercase tracking-wide">Digital Guide</p>
                    <p className="text-lg font-bold text-gray-900 mt-2">Resistance Mapping™</p>
                    <p className="text-xs text-gray-500 mt-1">Expanded 2nd Edition</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">Instant Digital Download</p>
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <StarRating rating={5} />
                <span className="text-sm text-gray-600">4.9/5 (Based on customer reviews)</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Resistance Mapping Guide™ - Expanded 2nd Edition
              </h1>

              <p className="text-lg text-gray-600 mb-6">
                A comprehensive digital guide to help you identify the deeper cause behind your fears and blocks, so you can finally clear them and align with your true self.
              </p>

              {/* Pricing */}
              <div className="bg-orange-50 rounded-none p-6 mb-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl font-bold text-gray-900">$7.00</span>
                  <span className="text-xl text-gray-400 line-through">$29.95</span>
                  <span className="bg-[var(--accent)] text-white text-sm font-semibold px-3 py-1 rounded-full">
                    77% OFF
                  </span>
                </div>
                <p className="text-sm text-gray-600">Limited time offer - Save $22.95 today!</p>
              </div>

              {/* Add to Cart Button */}
              <Link
                href="/checkout"
                className="cta-button w-full text-center block text-xl py-5 mb-6"
              >
                Add to Cart
              </Link>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-4 mb-8">
                <TrustBadge
                  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                  text="Secure Checkout"
                />
                <TrustBadge
                  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  text="Instant Download"
                />
                <TrustBadge
                  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  text="30-Day Refund Guarantee"
                />
              </div>

              {/* What's Included */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="font-semibold text-gray-900 mb-4">What&apos;s Included:</h2>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Complete Resistance Mapping Guide™ (Digital PDF)
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Printable Worksheets
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    BONUS: Mini-Course Access
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    BONUS: Private Community Access
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Free Future Updates
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            What You&apos;ll Gain
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <BenefitCard
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
              title="Clarity"
              description="Understanding your personal experiences and soul evolution"
            />
            <BenefitCard
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
              title="Empowerment"
              description="Recognizing self-sabotage and building inner strength"
            />
            <BenefitCard
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
              title="Connection"
              description="Linking with soul energy and authentic living"
            />
            <BenefitCard
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
              title="Inner Wisdom"
              description="Learning vibration principles and heart-centered intelligence"
            />
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-none p-8 border border-gray-200 shadow-sm text-center">
            <StarRating rating={5} />
            <p className="text-lg text-gray-700 italic mt-4 mb-4">
              &ldquo;I&apos;ve used these exercises to discover programs and beliefs in my sub-conscious that I never knew I had. This allowed me to move past a lot of distortions & destructive patterns.&rdquo;
            </p>
            <p className="font-semibold text-gray-900">— Reza Q.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 px-4 bg-[#F5F5F5]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Start Your Transformation Today
          </h2>
          <p className="text-gray-600 mb-6">
            Get instant access to the Resistance Mapping Guide™ and all bonuses for just $7
          </p>
          <Link
            href="/checkout"
            className="cta-button inline-block text-xl px-12 py-5"
          >
            Add to Cart - $7.00
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            30-day money-back guarantee • Instant download
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-500">
          <div className="flex justify-center gap-6 mb-4">
            <Link href="/privacy" className="hover:text-gray-700">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-700">Terms of Service</Link>
            <Link href="/refund" className="hover:text-gray-700">Refund Policy</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} Inner Wealth Initiate. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
