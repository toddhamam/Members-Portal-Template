import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/portal";
  const type = requestUrl.searchParams.get("type");

  // For password recovery, pass the code to the confirm page to handle client-side
  // This avoids PKCE issues that can occur with server-side code exchange
  if (type === "recovery" && code) {
    const confirmUrl = new URL("/portal/reset-password/confirm", requestUrl.origin);
    confirmUrl.searchParams.set("code", code);
    return NextResponse.redirect(confirmUrl);
  }

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // For other auth flows, redirect to the next page
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }

    console.error("[Auth Callback] Error exchanging code:", error);
  }

  // If no code or error, redirect to login with error
  return NextResponse.redirect(
    new URL("/login?error=auth_callback_error", requestUrl.origin)
  );
}
