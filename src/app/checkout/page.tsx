"use client";

import { useState } from "react";
import Link from "next/link";

function StarRating() {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
  );
}

export default function CheckoutPage() {
  const [includeOrderBump, setIncludeOrderBump] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const mainProductPrice = 7.0;
  const orderBumpPrice = 17.0;
  const total = includeOrderBump ? mainProductPrice + orderBumpPrice : mainProductPrice;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          includeOrderBump,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Error creating checkout session");
        setIsProcessing(false);
      }
    } catch {
      alert("Error processing your order. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold text-gray-900">
            Inner Wealth Initiate
          </Link>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>100% Secure Checkout</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-none p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent outline-none transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent outline-none transition"
                  />
                </div>

                <div className="mt-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-white rounded-none p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h2>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent outline-none transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent outline-none transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      required
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Order Bump */}
              <div
                className={`rounded-none p-6 shadow-sm border-2 cursor-pointer transition-all ${
                  includeOrderBump
                    ? "bg-orange-50 border-[var(--accent)]"
                    : "bg-white border-gray-200 hover:border-orange-200"
                }`}
                onClick={() => setIncludeOrderBump(!includeOrderBump)}
              >
                <div className="flex items-start gap-4">
                  <div className="pt-1">
                    <div
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        includeOrderBump
                          ? "bg-[var(--accent)] border-[var(--accent)]"
                          : "border-gray-300"
                      }`}
                    >
                      {includeOrderBump && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        YES! Add the Golden Thread Technique (Advanced)
                      </h3>
                      <span className="font-bold text-[var(--accent)]">+$17.00</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Advanced guided audio and video version helps move from insight to embodied release while working with the Resistance Mapping Guide.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">One-time offer - only available at checkout!</p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full cta-button text-xl py-5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Processing..." : `Complete Order - $${total.toFixed(2)}`}
              </button>

              <p className="text-center text-sm text-gray-500">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                100% Secure & Safe Payments
              </p>
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-none p-6 shadow-sm border border-gray-200 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

                {/* Main Product */}
                <div className="flex gap-4 pb-4 border-b border-gray-100">
                  <div className="w-20 h-24 bg-[#F5F5F5] rounded-lg flex items-center justify-center flex-shrink-0">
                    <div className="text-center">
                      <p className="text-xs font-medium text-[var(--accent)]">Guide</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Resistance Mapping Guide™</h3>
                    <p className="text-sm text-gray-500">Expanded 2nd Edition</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">$7.00</p>
                  </div>
                </div>

                {/* Order Bump in Summary */}
                {includeOrderBump && (
                  <div className="flex gap-4 py-4 border-b border-gray-100">
                    <div className="w-20 h-24 bg-[#F5F5F5] rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="text-center">
                        <p className="text-xs font-medium text-[var(--accent)]">Bonus</p>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Golden Thread Technique</h3>
                      <p className="text-sm text-gray-500">Advanced Audio & Video</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">$17.00</p>
                    </div>
                  </div>
                )}

                {/* What's Included */}
                <div className="py-4 border-b border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">What&apos;s Included:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Complete Guide (Value: $97)
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Quick & Deep Run Practices ($47)
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Printable Worksheets ($29)
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Mini-Course Access (Bonus)
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Private Community Access (Bonus)
                    </li>
                  </ul>
                </div>

                {/* Total */}
                <div className="pt-4">
                  <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">30-day money-back guarantee</p>
                </div>
              </div>

              {/* Testimonials */}
              <div className="space-y-4">
                <div className="bg-white rounded-none p-6 shadow-sm border border-gray-200">
                  <StarRating />
                  <p className="text-sm text-gray-700 mt-3 italic">
                    &ldquo;Already some things clicked into alignment... robust progress is here!&rdquo;
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-2">— Walter W., Atlanta</p>
                </div>

                <div className="bg-white rounded-none p-6 shadow-sm border border-gray-200">
                  <StarRating />
                  <p className="text-sm text-gray-700 mt-3 italic">
                    &ldquo;This will help illuminate your path... create a ripple effect on those you encounter.&rdquo;
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-2">— Vanessa W., Australia</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-gray-200 bg-white mt-8">
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
