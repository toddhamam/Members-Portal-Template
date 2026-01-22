'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const SESSION_ID_KEY = 'funnel_session_id';

/**
 * Hook to manage the Stripe session ID throughout the funnel flow.
 * Stores the session_id in sessionStorage as a backup in case it's lost from the URL.
 */
export function useSessionId(): string | null {
  const searchParams = useSearchParams();
  const urlSessionId = searchParams.get('session_id');
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Priority: URL param > sessionStorage
    if (urlSessionId && urlSessionId !== 'null' && urlSessionId !== 'undefined') {
      // Valid session_id in URL - store it and use it
      sessionStorage.setItem(SESSION_ID_KEY, urlSessionId);
      setSessionId(urlSessionId);
    } else {
      // No valid URL param - try sessionStorage
      const storedSessionId = sessionStorage.getItem(SESSION_ID_KEY);
      if (storedSessionId && storedSessionId !== 'null' && storedSessionId !== 'undefined') {
        setSessionId(storedSessionId);
      } else {
        setSessionId(null);
      }
    }
  }, [urlSessionId]);

  return sessionId;
}

/**
 * Clear the stored session_id (call this after order is complete or on logout)
 */
export function clearSessionId(): void {
  sessionStorage.removeItem(SESSION_ID_KEY);
}
