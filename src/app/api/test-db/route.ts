import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, any> = {};

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    checks.environment = {
      supabaseUrlConfigured: !!supabaseUrl,
      anonKeyConfigured: hasAnonKey,
      serviceRoleKeyConfigured: hasServiceKey,
      projectHost: supabaseUrl ? new URL(supabaseUrl).hostname : null,
    };

    if (!supabaseUrl || !hasServiceKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required Supabase environment variables in .env.local.",
          checks,
        },
        { status: 500 }
      );
    }

    const adminClient = createAdminClient();

    // Query 1: Verify database connection with a lightweight table select
    const tableChecks = ["products", "plans", "taxes", "discounts", "subscriptions", "invoices"];
    const tableCounts: Record<string, number> = {};

    for (const table of tableChecks) {
      const { count, error } = await (adminClient.from(table as any) as any)
        .select("*", { count: "exact", head: true });

      if (error) {
        tableCounts[table] = -1;
      } else {
        tableCounts[table] = count || 0;
      }
    }

    checks.tables = tableCounts;

    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: "PostgreSQL database connection verified successfully via Supabase client.",
      latencyMs,
      checks,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to connect to Supabase PostgreSQL database.",
        latencyMs: Date.now() - startTime,
        checks,
      },
      { status: 500 }
    );
  }
}

