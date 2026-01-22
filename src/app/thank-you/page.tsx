"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { trackCompleteRegistration } from "@/lib/meta-pixel";
import { useSessionId, clearSessionId } from "@/hooks/useSessionId";
import { ga4 } from "@/lib/ga4";

function CheckCircleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
  );
}

function YouTubeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

interface OrderItem {
  title: string;
  quantity: number;
  price: string;
  product_type?: string;
}

interface SessionData {
  email: string;
  name: string;
  items: OrderItem[];
  total: string;
}

function ThankYouContent() {
  const sessionId = useSessionId();

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const registrationTracked = useRef(false);
  const sessionCleared = useRef(false);

  // Fetch session data and order details
  useEffect(() => {
    async function fetchSessionData() {
      if (!sessionId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/session-email?session_id=${sessionId}`);
        const data = await response.json();

        if (data.email) {
          setSessionData({
            email: data.email,
            name: data.name || "",
            items: data.items || [],
            total: data.total || "0.00",
          });

          // Track CompleteRegistration event (only once)
          // Note: Purchase events are tracked server-side via Stripe webhook to avoid double-counting
          if (!registrationTracked.current) {
            registrationTracked.current = true;
            const totalValue = parseFloat(data.total) || 0;
            trackCompleteRegistration({
              content_name: 'Resistance Mapping Guide Purchase',
              status: 'success',
              value: totalValue,
              currency: 'USD',
            });
            // Track funnel completed for GA4
            ga4.funnelCompleted(totalValue);
          }
        }
      } catch (err) {
        console.error("Failed to fetch session data:", err);
      } finally {
        setIsLoading(false);
        // Clear the session_id from storage after order is complete
        // This ensures the next funnel flow starts fresh
        if (!sessionCleared.current) {
          sessionCleared.current = true;
          clearSessionId();
        }
      }
    }

    fetchSessionData();
  }, [sessionId]);

  return (
    <main className="min-h-screen bg-white flex flex-col">
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

      {/* Main Content */}
      <div className="flex-1">
        {/* Thank You Section */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full mb-6">
              <CheckCircleIcon className="w-10 h-10 md:w-12 md:h-12 text-green-600" />
            </div>

            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-gray-900 mb-4">
              Thank You!
            </h1>

            <p className="text-gray-600 text-base md:text-lg mb-8">
              Your order is complete.
              {sessionData?.email && (
                <span className="block mt-1">A confirmation has been sent to <span className="font-medium">{sessionData.email}</span></span>
              )}
            </p>

            {/* Access Portal Button */}
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-[#7c5cff] hover:bg-[#6b4ce6] text-white text-base md:text-lg font-medium px-6 py-3 md:px-8 md:py-4 rounded-md transition-colors"
            >
              Access Your Portal & Products
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Order Confirmation */}
        <section className="py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Confirmation</h2>

            <div className="border-t border-gray-200">
              {/* Table Header */}
              <div className="grid grid-cols-12 py-3 text-sm font-medium text-gray-600 border-b border-gray-200">
                <div className="col-span-7 md:col-span-8">Product</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-3 md:col-span-2 text-right">Price</div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="py-8 text-center text-gray-500">
                  Loading order details...
                </div>
              )}

              {/* Product Rows */}
              {!isLoading && sessionData?.items && sessionData.items.length > 0 ? (
                sessionData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 py-4 text-sm border-b border-gray-200">
                    <div className="col-span-7 md:col-span-8 text-gray-800">
                      {item.title}
                      {item.product_type && item.product_type !== "main" && (
                        <span className="ml-2 text-xs text-gray-500 capitalize">({item.product_type.replace("_", " ")})</span>
                      )}
                    </div>
                    <div className="col-span-2 text-center text-gray-600">{item.quantity}</div>
                    <div className="col-span-3 md:col-span-2 text-right text-gray-800">${item.price}</div>
                  </div>
                ))
              ) : !isLoading && (
                <div className="py-8 text-center text-gray-500">
                  Your order is being processed. Check your email for confirmation.
                </div>
              )}

              {/* Total Row */}
              {!isLoading && sessionData?.items && sessionData.items.length > 0 && (
                <div className="grid grid-cols-12 py-4 text-sm font-semibold">
                  <div className="col-span-7 md:col-span-8 text-gray-800">Total</div>
                  <div className="col-span-2 text-center"></div>
                  <div className="col-span-3 md:col-span-2 text-right text-gray-800">${sessionData.total}</div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* YouTube Subscribe Section */}
        <section className="py-12 px-4 bg-gray-50">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl text-gray-900 text-center mb-4">
              P.s. Don&apos;t Forget to Subscribe!
            </h2>

            <p className="text-gray-600 text-center mb-8 text-sm md:text-base">
              Subscribe to my YouTube Channel to stay up to date with free content, exercises, and subscriber-only promotions...
            </p>

            {/* YouTube Channel Card */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm mb-8">
              {/* Channel Banner */}
              <div className="h-24 md:h-32 bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-purple-900 relative">
                <div className="absolute inset-0 opacity-50" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='10' cy='10' r='1' fill='white' opacity='0.3'/%3E%3Ccircle cx='50' cy='30' r='0.5' fill='white' opacity='0.5'/%3E%3Ccircle cx='80' cy='60' r='0.8' fill='white' opacity='0.4'/%3E%3Ccircle cx='20' cy='70' r='0.6' fill='white' opacity='0.3'/%3E%3Ccircle cx='60' cy='80' r='1' fill='white' opacity='0.2'/%3E%3C/svg%3E")`
                }} />
              </div>

              {/* Channel Info */}
              <div className="p-4">
                <div className="flex items-start gap-3 md:gap-4">
                  {/* Profile Image */}
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#1a1a2e] to-purple-900 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base md:text-lg text-gray-900">Inner Wealth Initiate</h3>
                    <p className="text-xs md:text-sm text-gray-500">@innerwealthinitiate · 788 subscribers</p>
                    <p className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-2">
                      I talk about consciousness, non-duality, and the hidden mechanics of reality...
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visit YouTube Channel Button */}
            <div className="text-center">
              <a
                href="https://www.youtube.com/@innerwealthinitiate?sub_confirmation=1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#c9302c] hover:bg-[#ac2925] text-white font-medium px-5 py-3 md:px-6 md:py-3 rounded-md transition-colors text-sm md:text-base"
              >
                Visit YouTube Channel
                <YouTubeIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <Image
            src="/logo.png"
            alt="Inner Wealth Initiate"
            width={150}
            height={38}
            className="mx-auto mb-4"
          />
          <p className="text-gray-500 text-sm">
            Inner Wealth Initiate | Copyright &copy;{new Date().getFullYear()} | All Rights Reserved
          </p>
        </div>
      </footer>
    </main>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ThankYouContent />
    </Suspense>
  );
}
