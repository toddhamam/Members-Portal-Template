import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;

  // Handle Supabase auth codes that land on the root URL
  // This happens when Supabase redirects password reset links to the Site URL
  // instead of the specified redirectTo URL
  const code = searchParams.get('code');
  if (code && pathname === '/') {
    // Redirect to auth callback with the code
    // Assume recovery type if no type specified (most common case for root URL redirects)
    const type = searchParams.get('type') || 'recovery';
    const callbackUrl = new URL('/auth/callback', request.url);
    callbackUrl.searchParams.set('code', code);
    callbackUrl.searchParams.set('type', type);
    return NextResponse.redirect(callbackUrl);
  }

  // Auth routes that should NOT be rewritten on portal subdomain
  const isAuthRoute = pathname === '/login' || pathname === '/portal/signup' || pathname.startsWith('/portal/reset-password') || pathname.startsWith('/auth/');
  const isPortalSubdomain = hostname.startsWith('portal.');
  const isFunnelSubdomain = hostname.startsWith('offer.');

  // Funnel subdomain handling (offer.domain.com)
  // All funnel pages pass through - landing, product, checkout, upsells, downsells, thank-you
  // API routes pass through for payment processing
  // No session management needed for public funnel pages
  // Note: Landing page (/) detects funnel subdomain and hides navigation
  if (isFunnelSubdomain) {
    return NextResponse.next();
  }

  // Portal subdomain handling
  if (isPortalSubdomain) {
    // Rewrite non-portal paths to /portal/* (except auth routes, API, static)
    if (!isAuthRoute && !pathname.startsWith('/portal') && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
      const url = request.nextUrl.clone();
      url.pathname = `/portal${pathname}`;

      const response = NextResponse.rewrite(url);
      return await updateSession(request, {
        effectivePathname: `/portal${pathname}`,
        baseResponse: response,
      });
    }

    // For portal subdomain accessing /portal paths, /login, or auth routes, update session once
    if (pathname.startsWith('/portal') || pathname === '/login') {
      return await updateSession(request);
    }

    // All other portal subdomain requests (API, static) pass through
    return NextResponse.next();
  }

  // Main domain: update session for portal routes, dashboard, login, and auth callback
  if (pathname.startsWith('/portal') || pathname.startsWith('/dashboard') || pathname === '/login' || pathname.startsWith('/auth/')) {
    return await updateSession(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match everything except static files
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
};
