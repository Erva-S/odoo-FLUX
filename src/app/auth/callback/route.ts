import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Auth session code exchange error:", exchangeError);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(exchangeError.message || "Session verification failed")}`, requestUrl.origin)
      );
    }

    // Redirect to recovery target (e.g. password reset settings or target page)
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  return NextResponse.redirect(new URL("/login", requestUrl.origin));
}
