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

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic = PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith("/auth/"));

  // If user is unauthenticated and tries to access protected page:
  if (!user && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated and visits login/signup, redirect to their role destination
  if (user && (pathname === "/login" || pathname === "/signup")) {
    // Check role from user_metadata or profiles
    const role = (user.user_metadata?.role as UserRole) || "customer";
    if (role === "customer") {
      return NextResponse.redirect(new URL("/portal", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Route-level role enforcement
  if (user) {
    const role = (user.user_metadata?.role as UserRole) || "customer";

    // Customers cannot access internal staff/admin dashboards
    if (role === "customer") {
      const isInternal = INTERNAL_ROUTES.some((r) => pathname.startsWith(r));
      const isAdminOnly = ADMIN_ONLY_ROUTES.some((r) => pathname.startsWith(r));
      if (isInternal || isAdminOnly) {
        return NextResponse.redirect(new URL("/portal", request.url));
      }
    }

    // Staff cannot access admin-only pages
    if (role === "staff") {
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

