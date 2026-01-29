import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/portal";
  const type = requestUrl.searchParams.get("type");

  if (code) {
    const cookieStore = await cookies();

    // Store cookies to be set on the response
    const cookiesToSetOnResponse: Array<{ name: string; value: string; options?: Record<string, unknown> }> = [];

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
              cookiesToSetOnResponse.push({ name, value, options });
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      // For recovery type with PKCE failure, try passing code to client-side
      if (type === "recovery") {
        const confirmUrl = new URL("/portal/reset-password/confirm", requestUrl.origin);
        confirmUrl.searchParams.set("code", code);
        return NextResponse.redirect(confirmUrl);
      }

      return NextResponse.redirect(
        new URL("/login?error=auth_callback_error", requestUrl.origin)
      );
    }

    // Determine redirect URL
    const redirectUrl = type === "recovery"
      ? new URL("/portal/reset-password/confirm", requestUrl.origin)
      : new URL(next, requestUrl.origin);

    // Create response and set cookies on it
    const response = NextResponse.redirect(redirectUrl);
    cookiesToSetOnResponse.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options as Record<string, string | boolean | number | Date>);
    });

    return response;
  }

  return NextResponse.redirect(
    new URL("/login?error=auth_callback_error", requestUrl.origin)
  );
}
