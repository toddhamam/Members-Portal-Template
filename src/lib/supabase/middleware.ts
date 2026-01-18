import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

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
          supabaseResponse = NextResponse.next({
            request,
          });
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

  // Protect portal routes
  const isPortalRoute = request.nextUrl.pathname.startsWith('/portal');
  const isAuthRoute =
    request.nextUrl.pathname === '/portal/login' ||
    request.nextUrl.pathname === '/portal/signup' ||
    request.nextUrl.pathname === '/portal/reset-password';

  // If trying to access protected portal route without auth, redirect to login
  if (isPortalRoute && !isAuthRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/portal/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // If authenticated user tries to access login/signup, redirect to portal
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/portal';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
