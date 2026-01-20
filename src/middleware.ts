import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // If accessing portal subdomain at root, redirect to /portal
  if (hostname.startsWith('portal.') && pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/portal';
    return NextResponse.redirect(url);
  }

  // For portal routes, update session (auth check)
  if (pathname.startsWith('/portal')) {
    return await updateSession(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match root for subdomain redirect
    '/',
    // Match all portal routes for auth
    '/portal/:path*',
  ],
};
