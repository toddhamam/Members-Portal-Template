import Link from "next/link";

export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="py-4 px-4 border-b border-gray-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-gray-900 font-semibold">Inner Wealth Initiate</span>
          <span className="text-sm text-green-600 font-medium flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Order Complete - Step 4 of 4
          </span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Thank You!
          </h1>
          <p className="text-xl text-gray-600">
            Your order is complete. You&apos;re about to begin an incredible journey.
          </p>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Resistance Mapping Guide™</p>
                <p className="text-sm text-gray-500">Expanded 2nd Edition</p>
              </div>
              <span className="font-medium text-gray-900">$7.00</span>
            </div>
            <div className="flex justify-between items-center text-gray-500 text-sm pt-2">
              <span>Additional items will appear based on your selections</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            A confirmation email has been sent to your email address with your order details.
          </p>
        </div>

        {/* Access Products CTA */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-8 mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Access Your Products
          </h2>
          <p className="text-gray-600 mb-6">
            Click below to access your product downloads + course portal
          </p>
          <Link
            href="#"
            className="cta-button inline-block text-xl px-12 py-5"
          >
            Access Your Products
          </Link>
        </div>

        {/* YouTube CTA */}
        <div className="bg-gray-900 text-white rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-600 flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">
            Stay Connected
          </h2>
          <p className="text-gray-300 mb-6">
            Subscribe to my YouTube Channel to stay up to date with free content, exercises, and subscriber-only promotions
          </p>
          <a
            href="https://youtube.com/@innerwealthinitiate"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            Visit YouTube Channel
          </a>
        </div>

        {/* What's Next */}
        <div className="mt-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What&apos;s Next?</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="w-8 h-8 mx-auto rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold mb-2">1</div>
              <p className="text-gray-600">Check your email for order confirmation</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="w-8 h-8 mx-auto rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold mb-2">2</div>
              <p className="text-gray-600">Access your products and download the guide</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="w-8 h-8 mx-auto rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold mb-2">3</div>
              <p className="text-gray-600">Join the private community</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-500">
          <p className="mb-4">Inner Wealth Initiate | Copyright &copy; {new Date().getFullYear()} | All Rights Reserved</p>
          <div className="flex justify-center gap-6">
            <Link href="/privacy" className="hover:text-gray-700">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-700">Terms of Service</Link>
            <Link href="/refund" className="hover:text-gray-700">Refund Policy</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
