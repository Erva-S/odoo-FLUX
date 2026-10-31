import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { Database, UserRole } from "@/types/database.types";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/styleguide",
  "/auth/callback",
  "/api/cron/billing",
  "/api/test-db",
];

const ADMIN_ONLY_ROUTES = ["/catalog", "/discounts", "/settings"];
const INTERNAL_ROUTES = ["/dashboard", "/customers", "/subscriptions", "/invoices", "/payments"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip static assets & api routes not requiring browser session
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/fonts") ||
    pathname.includes(".") ||
    pathname.startsWith("/api/cron")
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  // Check Supabase Auth user & local session cookies
  let isAuth = false;
  let effectiveRole: UserRole = "customer";

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      isAuth = true;
      effectiveRole = (user.user_metadata?.role as UserRole) || "customer";
    }
  } catch {
    // ignore
  }

  const localToken = request.cookies.get("subscriptly_token")?.value;
  const localRole = request.cookies.get("subscriptly_role")?.value as UserRole | undefined;

  if (localToken && localRole) {
    isAuth = true;
    effectiveRole = localRole;
  }

  const isPublic = PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith("/auth/"));

  // If user is unauthenticated and tries to access protected page:
  if (!isAuth && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated and visits login/signup, redirect to their role destination
  if (isAuth && (pathname === "/login" || pathname === "/signup")) {
    if (effectiveRole === "customer") {
      return NextResponse.redirect(new URL("/portal", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Route-level role enforcement
  if (isAuth) {
    // Customers cannot access internal staff/admin dashboards
    if (effectiveRole === "customer") {
      const isInternal = INTERNAL_ROUTES.some((r) => pathname.startsWith(r));
      const isAdminOnly = ADMIN_ONLY_ROUTES.some((r) => pathname.startsWith(r));
      if (isInternal || isAdminOnly) {
        return NextResponse.redirect(new URL("/portal", request.url));
      }
    }

    // Staff cannot access admin-only pages
    if (effectiveRole === "staff") {
      const isAdminOnly = ADMIN_ONLY_ROUTES.some((r) => pathname.startsWith(r));
      if (isAdminOnly) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2)$).*)",
  ],
};

