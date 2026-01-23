"use client";

import { useState, useEffect, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { ProductWithAccess } from "@/lib/supabase/types";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

function XIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function LockIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function CheckCircleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

interface PaymentFormProps {
  product: ProductWithAccess;
  email: string;
  fullName: string;
  paymentIntentId: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}

function PaymentForm({ product, email, fullName, paymentIntentId, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: {
          payment_method_data: {
            billing_details: {
              name: fullName,
              email: email,
            },
          },
        },
      });

      if (error) {
        onError(error.message || "An error occurred during payment.");
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        // Confirm purchase and grant access
        const confirmResponse = await fetch("/api/portal/confirm-purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentIntentId }),
        });

        if (!confirmResponse.ok) {
          const errorData = await confirmResponse.json();
          onError(errorData.error || "Failed to confirm purchase");
          setIsProcessing(false);
          return;
        }

        onSuccess();
      } else {
        onError("Payment was not completed. Please try again.");
        setIsProcessing(false);
      }
    } catch {
      onError("An unexpected error occurred. Please try again.");
      setIsProcessing(false);
    }
  };

  const displayPrice = product.portal_price_cents ?? product.price_cents;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Summary */}
      <div className="bg-[#f5f3ef] rounded-lg p-4">
        <div className="flex items-center gap-4">
          {product.thumbnail_url ? (
            <img
              src={product.thumbnail_url}
              alt={product.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gradient-to-b from-[#d4a574] to-[#b8956c] flex items-center justify-center">
              <span className="text-white text-xl font-serif">{product.name.charAt(0)}</span>
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-[#222222]">{product.name}</h3>
            <p className="text-sm text-[#6b7280]">Instant access after purchase</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-[#ee5d0b]">
              ${(displayPrice / 100).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Element */}
      <div>
        <h4 className="text-sm font-medium text-[#4b5563] mb-3">Payment Details</h4>
        <div className="p-4 border border-[#e5e7eb] rounded-lg bg-white">
          <PaymentElement
            options={{
              layout: "tabs",
            }}
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full bg-[#ee5d0b] hover:bg-[#d54d00] text-white font-semibold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            Complete Purchase
          </>
        )}
      </button>

      {/* Security Note */}
      <p className="text-center text-xs text-[#6b7280]">
        Secured by Stripe. Your payment information is encrypted.
      </p>
    </form>
  );
}

interface PurchaseModalProps {
  product: ProductWithAccess;
  email: string;
  fullName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PurchaseModal({
  product,
  email,
  fullName,
  isOpen,
  onClose,
  onSuccess,
}: PurchaseModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchaseComplete, setPurchaseComplete] = useState(false);

  // Create PaymentIntent when modal opens
  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setClientSecret(null);
      setPaymentIntentId(null);
      setError(null);
      setPurchaseComplete(false);
      return;
    }

    const createPaymentIntent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/portal/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productSlug: product.slug,
            email,
            fullName,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to initialize checkout");
          return;
        }

        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
      } catch {
        setError("Failed to initialize checkout. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [isOpen, product.slug, email, fullName]);

  const handleSuccess = useCallback(() => {
    setPurchaseComplete(true);
    // Wait a moment to show success state before closing
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 2000);
  }, [onSuccess, onClose]);

  const handleError = useCallback((message: string) => {
    setError(message);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !purchaseComplete) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose, purchaseComplete]);

  if (!isOpen) return null;

  const displayPrice = product.portal_price_cents ?? product.price_cents;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={purchaseComplete ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e5e7eb]">
          <h2 className="text-xl font-semibold text-[#222222]">
            {purchaseComplete ? "Purchase Complete!" : "Complete Your Purchase"}
          </h2>
          {!purchaseComplete && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#f5f3ef] rounded-lg transition-colors"
            >
              <XIcon className="w-5 h-5 text-[#6b7280]" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {purchaseComplete ? (
            // Success State
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#222222] mb-2">
                You now have access!
              </h3>
              <p className="text-[#6b7280]">
                {product.name} has been added to your account.
              </p>
            </div>
          ) : isLoading ? (
            // Loading State
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="animate-spin w-10 h-10 text-[#ee5d0b] mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-[#6b7280]">Preparing checkout...</p>
            </div>
          ) : error && !clientSecret ? (
            // Error State (initial load)
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XIcon className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#222222] mb-2">
                Something went wrong
              </h3>
              <p className="text-[#6b7280] mb-4">{error}</p>
              <button
                onClick={onClose}
                className="text-[#ee5d0b] hover:text-[#d54d00] font-medium"
              >
                Close and try again
              </button>
            </div>
          ) : clientSecret && paymentIntentId ? (
            // Payment Form
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "stripe",
                    variables: {
                      colorPrimary: "#ee5d0b",
                      borderRadius: "8px",
                    },
                  },
                }}
              >
                <PaymentForm
                  product={product}
                  email={email}
                  fullName={fullName}
                  paymentIntentId={paymentIntentId}
                  onSuccess={handleSuccess}
                  onError={handleError}
                />
              </Elements>
            </>
          ) : null}
        </div>

        {/* Footer - only show for non-success states */}
        {!purchaseComplete && !isLoading && clientSecret && (
          <div className="px-6 pb-6 pt-0">
            <div className="text-center text-xs text-[#6b7280]">
              By completing this purchase, you agree to our{" "}
              <a href="/terms" className="text-[#ee5d0b] hover:underline">
                Terms of Service
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
