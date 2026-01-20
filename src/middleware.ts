import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // Portal subdomain: rewrite all paths to /portal/*
  if (hostname.startsWith('portal.')) {
    // Don't rewrite if already accessing /portal paths or API routes
    if (!pathname.startsWith('/portal') && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
      const url = request.nextUrl.clone();
      url.pathname = `/portal${pathname}`;

      // Rewrite (not redirect) so URL stays clean
      const response = NextResponse.rewrite(url);

      // Also update session for auth, passing the effective pathname for route checking
      return await updateSession(request, {
        effectivePathname: `/portal${pathname}`,
        baseResponse: response,
      });
    }
  }

  // For portal routes (direct access), update session
  if (pathname.startsWith('/portal')) {
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
