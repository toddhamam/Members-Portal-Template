import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

interface UpdateSessionOptions {
  // Override the pathname for route checking (used with rewrites)
  effectivePathname?: string;
  // Base response to use (for rewrites)
  baseResponse?: NextResponse;
}

export async function updateSession(
  request: NextRequest,
  options: UpdateSessionOptions = {}
) {
  const { effectivePathname, baseResponse } = options;
  const pathname = effectivePathname || request.nextUrl.pathname;

  let supabaseResponse = baseResponse || NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Preserve rewrite if we have a base response
          if (baseResponse) {
            supabaseResponse = baseResponse;
          } else {
            supabaseResponse = NextResponse.next({ request });
          }
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect portal and dashboard routes
  const isPortalRoute = pathname.startsWith('/portal');
  const isDashboardRoute = pathname.startsWith('/dashboard');

  // Routes that don't require authentication
  const isPublicAuthRoute =
    pathname === '/login' ||
    pathname === '/portal/signup' ||
    pathname === '/portal/reset-password';

  // Password reset confirm page needs special handling:
  // - Unauthenticated users should be allowed (to see error message)
  // - Authenticated users MUST be allowed (to set their new password)
  const isPasswordResetConfirm = pathname === '/portal/reset-password/confirm';

  // If trying to access protected route without auth, redirect to login
  // (but allow public auth routes and password reset confirm)
  if ((isPortalRoute || isDashboardRoute) && !isPublicAuthRoute && !isPasswordResetConfirm && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    // Use original pathname for redirect param so user returns to correct place
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // If authenticated user tries to access login/signup, redirect to portal root
  // NOTE: Do NOT redirect from password reset pages - users need to complete the flow
  if ((pathname === '/login' || pathname === '/portal/signup') && user) {
    const url = request.nextUrl.clone();
    // For portal subdomain, redirect to / (which rewrites to /portal)
    const hostname = request.headers.get('host') || '';
    url.pathname = hostname.startsWith('portal.') ? '/' : '/portal';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
