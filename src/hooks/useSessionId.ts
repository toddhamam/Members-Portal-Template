'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const SESSION_ID_KEY = 'funnel_session_id';
const PAYMENT_INTENT_KEY = 'funnel_payment_intent';

/**
 * Helper to check if a value is valid (not null, 'null', 'undefined', or empty)
 */
function isValidId(value: string | null): value is string {
  return value !== null && value !== 'null' && value !== 'undefined' && value !== '';
}

/**
 * Hook to manage the Stripe identifier throughout the funnel flow.
 * Supports both:
 * - session_id: From Stripe Checkout Sessions
 * - payment_intent: From Stripe Elements/PaymentIntents (automatically appended by Stripe after confirmPayment)
 *
 * Stores the ID in sessionStorage as a backup in case it's lost from the URL.
 *
 * Returns an object with:
 * - id: The Stripe identifier (session_id or payment_intent)
 * - type: 'session' | 'payment_intent' | null
 */
export function useSessionId(): string | null {
  const searchParams = useSearchParams();
  const urlSessionId = searchParams.get('session_id');
  const urlPaymentIntent = searchParams.get('payment_intent');
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Priority: URL payment_intent > URL session_id > sessionStorage
    // Wrapped in try-catch because sessionStorage can throw in private browsing mode
    try {
      // First check for payment_intent (from Stripe Elements flow)
      if (isValidId(urlPaymentIntent)) {
        sessionStorage.setItem(PAYMENT_INTENT_KEY, urlPaymentIntent);
        // Clear any old session_id to avoid confusion
        sessionStorage.removeItem(SESSION_ID_KEY);
        setSessionId(urlPaymentIntent);
        return;
      }

      // Then check for session_id (from Checkout Sessions flow)
      if (isValidId(urlSessionId)) {
        sessionStorage.setItem(SESSION_ID_KEY, urlSessionId);
        setSessionId(urlSessionId);
        return;
      }

      // No valid URL params - try sessionStorage
      // Check payment_intent first (newer flow takes priority)
      const storedPaymentIntent = sessionStorage.getItem(PAYMENT_INTENT_KEY);
      if (isValidId(storedPaymentIntent)) {
        setSessionId(storedPaymentIntent);
        return;
      }

      const storedSessionId = sessionStorage.getItem(SESSION_ID_KEY);
      if (isValidId(storedSessionId)) {
        setSessionId(storedSessionId);
        return;
      }

      setSessionId(null);
    } catch {
      // sessionStorage not available (private browsing) - use URL params only
      if (isValidId(urlPaymentIntent)) {
        setSessionId(urlPaymentIntent);
      } else if (isValidId(urlSessionId)) {
        setSessionId(urlSessionId);
      } else {
        setSessionId(null);
      }
    }
  }, [urlSessionId, urlPaymentIntent]);

  return sessionId;
}

/**
 * Hook to get the type of Stripe identifier being used
 * Returns 'payment_intent' if using PaymentIntents flow, 'session' if using Checkout Sessions
 */
export function useStripeIdType(): 'payment_intent' | 'session' | null {
  const searchParams = useSearchParams();
  const urlSessionId = searchParams.get('session_id');
  const urlPaymentIntent = searchParams.get('payment_intent');
  const [idType, setIdType] = useState<'payment_intent' | 'session' | null>(null);

  useEffect(() => {
    try {
      if (isValidId(urlPaymentIntent)) {
        setIdType('payment_intent');
        return;
      }
      if (isValidId(urlSessionId)) {
        setIdType('session');
        return;
      }

      // Check sessionStorage
      const storedPaymentIntent = sessionStorage.getItem(PAYMENT_INTENT_KEY);
      if (isValidId(storedPaymentIntent)) {
        setIdType('payment_intent');
        return;
      }

      const storedSessionId = sessionStorage.getItem(SESSION_ID_KEY);
      if (isValidId(storedSessionId)) {
        setIdType('session');
        return;
      }

      setIdType(null);
    } catch {
      if (isValidId(urlPaymentIntent)) {
        setIdType('payment_intent');
      } else if (isValidId(urlSessionId)) {
        setIdType('session');
      } else {
        setIdType(null);
      }
    }
  }, [urlSessionId, urlPaymentIntent]);

  return idType;
}

/**
 * Clear the stored session_id and payment_intent (call this after order is complete or on logout)
 */
export function clearSessionId(): void {
  try {
    sessionStorage.removeItem(SESSION_ID_KEY);
    sessionStorage.removeItem(PAYMENT_INTENT_KEY);
  } catch {
    // sessionStorage not available (private browsing) - ignore
  }
}
