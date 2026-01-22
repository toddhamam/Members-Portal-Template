'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { ga4 } from '@/lib/ga4';

// GA4 Measurement ID from environment
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || '';

// Debug log to verify GA4 is configured (only logs once on mount)
if (typeof window !== 'undefined') {
  console.log('[GA4] Measurement ID configured:', GA_MEASUREMENT_ID ? 'Yes' : 'No');
}

// Inner component that uses useSearchParams (must be wrapped in Suspense)
function GA4PageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views on route changes
  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;

    // Build the full path with search params
    const url = searchParams.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    ga4.pageView(url);
  }, [pathname, searchParams]);

  return null;
}

export default function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      {/* Google tag (gtag.js) */}
      <Script
        id="gtag-base"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              send_page_view: true
            });
          `,
        }}
      />
      {/* Track route changes */}
      <Suspense fallback={null}>
        <GA4PageTracker />
      </Suspense>
    </>
  );
}
