"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { cn } from "@/styles/style-guide";
import { trackInitiateCheckout, trackAddToCart } from "@/lib/meta-pixel";
import { ga4 } from "@/lib/ga4";
import { useFunnelTracking } from "@/hooks/useFunnelTracking";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

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
    <div className="flex justify-center mt-4">
      <Image
        src="/images/Products/secure-payment.png"
        alt="Accepted payment methods: Visa, Mastercard, Amex, JCB, Discover, Diners Club, UnionPay"
        width={350}
        height={30}
        className="object-contain"
      />
    </div>
  );
}

// Checkout form with Stripe Elements
function CheckoutForm({
  formData,
  includeOrderBump,
  total,
  paymentIntentId,
  onFormDataChange,
  onOrderBumpChange,
}: {
  formData: { fullName: string; email: string };
  includeOrderBump: boolean;
  total: number;
  paymentIntentId: string | null;
  onFormDataChange: (data: { fullName: string; email: string }) => void;
  onOrderBumpChange: (include: boolean) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFormDataChange({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!stripe || !elements || !paymentIntentId) {
      return;
    }

    // Validate form fields
    if (!formData.email || !formData.fullName) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    setIsProcessing(true);

    try {
      // Update PaymentIntent with real customer data before confirming
      const updateResponse = await fetch("/api/update-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId,
          includeOrderBump,
          email: formData.email,
          fullName: formData.fullName,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to update payment details");
      }

      // Store checkout details for GA4 tracking on upsell page
      sessionStorage.setItem('checkout_ga4_pending', JSON.stringify({
        value: total,
        includeOrderBump,
        paymentIntentId,
      }));

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/upsell-1`,
          payment_method_data: {
            billing_details: {
              name: formData.fullName,
              email: formData.email,
            },
          },
        },
      });

      if (error) {
        setErrorMessage(error.message || "An error occurred during payment.");
        setIsProcessing(false);
      }
      // If successful, the user will be redirected to the return_url
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsProcessing(false);
    }
  };

  const mainProductPrice = 7.0;
  const orderBumpPrice = 27.0;

  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Confirm Your Order Details</h1>
        <p className="text-sm text-gray-500">100% Secure Checkout</p>
      </div>

      {/* Contact Info Fields */}
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

      {/* Item Table */}
      <div className="border-t border-b border-gray-200 py-3 mb-6">
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
            <span className="text-[#1a5f7a] font-semibold">${mainProductPrice.toFixed(2)}</span>
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
        onClick={() => onOrderBumpChange(!includeOrderBump)}
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
              <span className="font-semibold">YES! Add this Advanced Guided Practice to My Order</span>
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

      {/* Credit Card Details Section */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Payment Details
        </h3>

        {/* Stripe Payment Element */}
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <PaymentElement
            options={{
              layout: "tabs",
            }}
          />
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
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
  );
}

export default function CheckoutPage() {
  const [includeOrderBump, setIncludeOrderBump] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
  });
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const mainProductPrice = 7.0;
  const orderBumpPrice = 27.0;
  const total = includeOrderBump ? mainProductPrice + orderBumpPrice : mainProductPrice;

  // Track funnel page view (auto-tracks on mount)
  useFunnelTracking('checkout');

  // Track InitiateCheckout for Meta Pixel and GA4
  useEffect(() => {
    trackInitiateCheckout({
      content_ids: ['resistance-mapping-guide'],
      content_name: 'Resistance Mapping Guide',
      value: mainProductPrice,
      currency: 'USD',
      num_items: 1,
    });
    // Track for GA4
    ga4.checkoutView(mainProductPrice);
    ga4.checkoutStarted(mainProductPrice);
  }, []);

  // Track AddToCart when order bump is added
  const handleOrderBumpChange = (include: boolean) => {
    setIncludeOrderBump(include);
    if (include) {
      trackAddToCart({
        content_ids: ['golden-thread-technique'],
        content_name: 'Golden Thread Technique',
        content_type: 'product',
        value: orderBumpPrice,
        currency: 'USD',
      });
      // Track for GA4
      ga4.orderBumpAdded();
    } else {
      // Track for GA4
      ga4.orderBumpRemoved();
    }
  };

  // Create PaymentIntent only on initial load
  useEffect(() => {
    const createPaymentIntent = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "customer@example.com",
            fullName: "Customer",
            includeOrderBump: false, // Always start without order bump
          }),
        });

        const data = await response.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
          // Extract PaymentIntent ID from client secret (format: pi_xxx_secret_xxx)
          const piId = data.clientSecret.split("_secret_")[0];
          setPaymentIntentId(piId);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Error creating payment intent:", error);
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, []); // Only run once on mount

  // Update PaymentIntent when order bump changes (after initialization)
  useEffect(() => {
    if (!isInitialized || !paymentIntentId) return;

    const updatePaymentIntent = async () => {
      try {
        await fetch("/api/update-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentIntentId,
            includeOrderBump,
          }),
        });
      } catch (error) {
        console.error("Error updating payment intent:", error);
      }
    };

    updatePaymentIntent();
  }, [includeOrderBump, isInitialized, paymentIntentId]);

  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <header className="bg-white py-6 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Inner Wealth Initiate"
              width={300}
              height={60}
              priority
            />
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Form */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            {isLoading || !clientSecret ? (
              <div className="flex items-center justify-center py-12">
                <svg className="animate-spin w-8 h-8 text-[#1a5f7a]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="ml-3 text-gray-600">Loading checkout...</span>
              </div>
            ) : (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "stripe",
                    variables: {
                      colorPrimary: "#1a5f7a",
                      borderRadius: "4px",
                    },
                  },
                }}
              >
                <CheckoutForm
                  formData={formData}
                  includeOrderBump={includeOrderBump}
                  total={total}
                  paymentIntentId={paymentIntentId}
                  onFormDataChange={setFormData}
                  onOrderBumpChange={handleOrderBumpChange}
                />
              </Elements>
            )}
          </div>

          {/* Right Column - Product Info & Testimonials */}
          <div className="space-y-6">
            {/* Product Mockup */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex justify-center mb-6">
                <Image
                  src="/images/Products/whats-inside-product.png"
                  alt="The Resistance Map - What's Inside"
                  width={400}
                  height={300}
                  className="object-contain"
                />
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
