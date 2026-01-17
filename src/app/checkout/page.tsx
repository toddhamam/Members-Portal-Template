"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/styles/style-guide";

// Compass/clock logo icon
function LogoIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="50" cy="50" r="45" />
      {[...Array(12)].map((_, i) => (
        <line
          key={i}
          x1="50"
          y1="10"
          x2="50"
          y2="18"
          transform={`rotate(${i * 30} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="4" fill="currentColor" />
      <line x1="50" y1="50" x2="50" y2="25" strokeWidth="3" />
      <line x1="50" y1="50" x2="70" y2="50" strokeWidth="2" />
    </svg>
  );
}

// Lock icon for secure checkout
function LockIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

// Check icon
function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

// Payment method logos
function PaymentLogos() {
  return (
    <div className="flex items-center justify-center gap-3 mt-4">
      {/* Visa */}
      <div className="h-8 px-2 bg-white border border-gray-200 rounded flex items-center justify-center">
        <svg className="h-5" viewBox="0 0 50 16" fill="none">
          <path d="M19.5 1L17 15H13L15.5 1H19.5Z" fill="#1A1F71"/>
          <path d="M34.5 1L30.5 11L30 8L28 2C28 2 27.7 1 26 1H19.5V1.5C19.5 1.5 22 2 24.5 4L28 15H32.5L40 1H34.5Z" fill="#1A1F71"/>
          <path d="M10.5 1L5 11L4.5 8.5L3 2C3 2 2.7 1 1 1H0V1.5C0 1.5 3 2.2 6 5C8.8 7.7 10 10 10 10L14 15H10L10.5 1Z" fill="#1A1F71"/>
        </svg>
      </div>
      {/* Mastercard */}
      <div className="h-8 px-2 bg-white border border-gray-200 rounded flex items-center justify-center">
        <svg className="h-5" viewBox="0 0 32 20" fill="none">
          <circle cx="11" cy="10" r="9" fill="#EB001B"/>
          <circle cx="21" cy="10" r="9" fill="#F79E1B"/>
          <path d="M16 3C18.2 4.8 19.5 7.3 19.5 10C19.5 12.7 18.2 15.2 16 17C13.8 15.2 12.5 12.7 12.5 10C12.5 7.3 13.8 4.8 16 3Z" fill="#FF5F00"/>
        </svg>
      </div>
      {/* Amex */}
      <div className="h-8 px-2 bg-[#006FCF] border border-gray-200 rounded flex items-center justify-center">
        <span className="text-white text-xs font-bold tracking-tight">AMEX</span>
      </div>
      {/* Discover */}
      <div className="h-8 px-3 bg-white border border-gray-200 rounded flex items-center justify-center">
        <span className="text-[#FF6000] text-xs font-bold">discover</span>
      </div>
      {/* Stripe */}
      <div className="h-8 px-2 bg-white border border-gray-200 rounded flex items-center justify-center">
        <svg className="h-5" viewBox="0 0 60 25" fill="none">
          <path d="M59.64 14.28c0-4.77-2.31-8.54-6.73-8.54-4.44 0-7.12 3.77-7.12 8.5 0 5.61 3.17 8.45 7.71 8.45 2.22 0 3.9-.5 5.17-1.21v-3.75c-1.27.64-2.73 1.03-4.58 1.03-1.81 0-3.42-.64-3.62-2.83h9.12c0-.24.05-1.2.05-1.65zm-9.22-1.77c0-2.1 1.29-2.98 2.47-2.98 1.15 0 2.36.88 2.36 2.98h-4.83zM38.98 5.74c-1.83 0-3 .86-3.66 1.46l-.24-1.16h-4.12v22.04l4.68-.99.01-5.35c.67.49 1.66 1.17 3.3 1.17 3.34 0 6.38-2.68 6.38-8.59-.01-5.4-3.1-8.58-6.35-8.58zm-1.12 13.19c-1.1 0-1.75-.39-2.2-.88l-.02-6.94c.49-.54 1.16-.92 2.22-.92 1.7 0 2.87 1.9 2.87 4.36 0 2.51-1.15 4.38-2.87 4.38zM25.72 4.62l4.7-1v-3.8l-4.7 1v3.8zM25.72 6.04h4.7v16.45h-4.7V6.04zM20.53 7.39l-.3-1.35h-4.04v16.45h4.68V11.1c1.1-1.44 2.98-1.18 3.56-.97V6.04c-.6-.22-2.8-.64-3.9 1.35zM11.54 2.16L6.96 3.12l-.02 15.06c0 2.78 2.09 4.83 4.87 4.83 1.54 0 2.67-.28 3.29-.62v-3.8c-.6.24-3.57 1.1-3.57-1.67V9.88h3.57V6.04h-3.57l.01-3.88zM1.57 10.24c0-.66.55-0.91 1.45-.91.95 0 2.14.29 3.09.8V6.33c-1.03-.41-2.05-.57-3.09-.57C1.2 5.76 0 6.96 0 8.89c0 3.46 4.77 2.91 4.77 4.4 0 .78-.68 1.03-1.63 1.03-1.41 0-3.21-.58-4.63-1.36v3.89c1.58.68 3.17.97 4.63.97 1.91 0 4.06-.79 4.06-2.91.01-3.73-4.79-3.07-4.79-4.47 0-.1.01-.19.03-.28.08-.26.33-.46.82-.57l.31-.04z" fill="#635BFF"/>
        </svg>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const [includeOrderBump, setIncludeOrderBump] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
  });

  const mainProductPrice = 7.0;
  const orderBumpPrice = 2.0; // Based on screenshot showing $9 total with bump
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
    <main className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <header className="bg-white py-6 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-3">
          <LogoIcon className="w-10 h-10 text-[#1a5f7a]" />
          <Link href="/" className="text-2xl font-serif tracking-wide text-[#1a5f7a]">
            INNER WEALTH INITIATE
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Form */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="text-center mb-6">
                <h1 className="text-xl font-semibold text-gray-900">Confirm Your Order Details</h1>
                <p className="text-sm text-gray-500">100% Secure Checkout</p>
              </div>

              {/* Form Fields */}
              <div className="space-y-4 mb-6">
                <div>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder="Full Name..."
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Email Address..."
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              {/* Credit Card Details Section */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  Credit Card Details
                </h3>

                {/* Item Table */}
                <div className="border-t border-b border-gray-200 py-3">
                  <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
                    <span>Item</span>
                    <div className="flex gap-8">
                      <span>Quantity</span>
                      <span>Price</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-900">
                      Resistance Mapping - Expanded<br />
                      <span className="text-gray-500">2nd Edition</span>
                    </span>
                    <div className="flex gap-12 text-sm">
                      <span className="text-gray-900">1</span>
                      <span className="text-[#1a5f7a] font-semibold">$7.00</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Bump */}
              <div
                className={cn(
                  "rounded-lg p-4 mb-6 cursor-pointer transition-all border-2",
                  includeOrderBump
                    ? "bg-[#fff8e1] border-[#ffc107]"
                    : "bg-[#fffde7] border-[#fff59d] hover:border-[#ffc107]"
                )}
                onClick={() => setIncludeOrderBump(!includeOrderBump)}
              >
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    <div
                      className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                        includeOrderBump
                          ? "bg-[#1a5f7a] border-[#1a5f7a]"
                          : "border-gray-400 bg-white"
                      )}
                    >
                      {includeOrderBump && (
                        <CheckIcon className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 mb-1">
                      <span className="font-semibold">Add this Advanced Guided Practice to My Order</span>
                    </p>
                    <p className="text-sm">
                      <Link href="#" className="text-[#1a5f7a] font-semibold underline hover:no-underline">
                        Golden Thread Technique (Advanced)
                      </Link>
                      : Special Offer! The advanced guided audio and video version of the Golden Thread Technique™ helps you move from insight to embodied release while working with the Resistance Mapping Guide.
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Total */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Order Total</span>
                  <span className="text-[#1a5f7a] font-bold text-lg">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Link Option (visual only) */}
              <div className="mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-600 font-semibold text-sm">⚡ Link</span>
                    <span className="text-sm text-gray-600">todd.hamam@gmail.com</span>
                    <button type="button" className="text-gray-400 hover:text-gray-600 text-xs">×</button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-600">Use</span>
                  <span className="text-sm">💳 •••• 1741</span>
                </div>
                <button type="button" className="text-sm text-[#1a5f7a] hover:underline mt-2">
                  Pay another way
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-[#1a1a2e] text-white text-lg font-semibold py-4 rounded-lg hover:bg-[#0d0d1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <LockIcon className="w-5 h-5" />
                    Complete Order
                  </>
                )}
              </button>

              {/* Security Text */}
              <p className="text-center text-sm text-gray-500 mt-3">
                100% Secure & Safe Checkout
              </p>

              {/* Payment Logos */}
              <PaymentLogos />
            </form>
          </div>

          {/* Right Column - Product Info & Testimonials */}
          <div className="space-y-6">
            {/* Product Mockup */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex justify-center mb-6">
                {/* Product mockup images */}
                <div className="relative">
                  <div className="flex items-end gap-4">
                    {/* Tablet/Device */}
                    <div className="w-32 h-40 bg-gray-800 rounded-lg p-2 shadow-lg">
                      <div className="w-full h-full bg-gradient-to-b from-[#d4a574] to-[#b8956c] rounded flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-[6px] text-[#1a1a2e] uppercase tracking-wider">The</p>
                          <p className="text-[8px] text-[#1a1a2e] font-serif font-bold">RESISTANCE</p>
                          <p className="text-[8px] text-[#1a1a2e] font-serif font-bold">MAP</p>
                        </div>
                      </div>
                    </div>
                    {/* Book */}
                    <div className="w-24 h-32 bg-gradient-to-b from-[#d4a574] to-[#b8956c] rounded shadow-lg flex items-center justify-center transform -rotate-3">
                      <div className="text-center px-2">
                        <p className="text-[5px] text-[#1a1a2e] uppercase tracking-wider">The</p>
                        <p className="text-[7px] text-[#1a1a2e] font-serif font-bold">RESISTANCE</p>
                        <p className="text-[7px] text-[#1a1a2e] font-serif font-bold">MAP</p>
                      </div>
                    </div>
                    {/* Phone */}
                    <div className="w-16 h-28 bg-gray-800 rounded-xl p-1 shadow-lg">
                      <div className="w-full h-full bg-gradient-to-b from-[#d4a574] to-[#b8956c] rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-[4px] text-[#1a1a2e] uppercase">The</p>
                          <p className="text-[5px] text-[#1a1a2e] font-serif font-bold">RESISTANCE</p>
                          <p className="text-[5px] text-[#1a1a2e] font-serif font-bold">MAP</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* What You'll Receive */}
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                What You&apos;ll Receive:
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>
                    Complete Resistance Mapping™ Expanded 2nd Edition Guide{" "}
                    <span className="text-[#c75050]">(Value = $97)</span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>
                    Quick Run & Deep Run Practices{" "}
                    <span className="text-[#c75050]">(Value = $47)</span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>
                    Printable Worksheets and Trackers{" "}
                    <span className="text-[#c75050]">(Value = $29)</span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>
                    Guided Practices, so there&apos;s no more guesswork{" "}
                    <span className="text-[#c75050]">(Value = $197)</span>
                  </span>
                </li>
                <li className="flex items-start gap-2 mt-4">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>
                    <strong>BONUS:</strong> Access to Private Community{" "}
                    <span className="text-[#c75050]">(Value = $249/Year)</span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>
                    <strong>BONUS:</strong> Resistance Mapping Mini-Course{" "}
                    <span className="text-[#c75050]">(Value = $47)</span>
                  </span>
                </li>
              </ul>
            </div>

            {/* Testimonials */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              {/* Testimonial 1 */}
              <div className="mb-6">
                <p className="text-gray-700 italic leading-relaxed">
                  &ldquo;I completed the book - and a lot is making sense. Revisiting this info again and again so it sinks in is necessary for me. Already somethings clicked into alignment. As I am reviewing certain experiences all the way back to childhood- even early as 4 years old, and applying Golden Thread Technique, I think robust progress is here! Your work is the next level of progress for me.🙏&rdquo;
                </p>
                <p className="mt-3">
                  <span className="text-[#c75050] font-medium">- Walter W.</span>{" "}
                  <span className="text-gray-500">Atlanta, GA</span>
                </p>
              </div>

              {/* Dashed separator */}
              <div className="border-t-2 border-dashed border-[#c75050] my-6" />

              {/* Testimonial 2 */}
              <div>
                <p className="text-gray-700 italic leading-relaxed">
                  &ldquo;If you are craving a deeper understanding of yourself, the universe and why you are here on this earth, this will help illuminate your path. The wisdom in this guide will not only serve as a catalyst to your own growth and awakening, but will create a ripple effect on those you encounter and in turn the collective consciousness. This is written in an accessible and easy to understand manner, regardless if you are at the start of your spiritual journey or are an experienced seeker.&rdquo;
                </p>
                <p className="mt-3">
                  <span className="text-[#c75050] font-medium">- Vanessa W.</span>{" "}
                  <span className="text-gray-500">Australia</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 mt-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center gap-2 mb-2 text-sm">
            <Link href="/terms" className="text-[#1a5f7a] hover:underline font-medium">
              Terms & Conditions
            </Link>
            <span className="text-gray-400">|</span>
            <Link href="/privacy" className="text-gray-600 hover:text-gray-800">
              Privacy Policy
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            Copyright {new Date().getFullYear()} - Inner Wealth Initiate, All Rights Reserved
          </p>
        </div>
      </footer>
    </main>
  );
}
