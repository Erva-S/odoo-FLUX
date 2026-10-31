import { NextRequest, NextResponse } from "next/server";
import { executeRecurringBillingRun } from "@/lib/services/billing-engine";

export async function POST(request: NextRequest) {
  try {
    // Authorization check using server-only CRON_SECRET
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      console.warn("CRON security notice: CRON_SECRET is not configured on this server. Access denied.");
      return NextResponse.json(
        { error: "Forbidden: CRON_SECRET environment variable is not configured." },
        { status: 403 }
      );
    }

    const authHeader = request.headers.get("authorization");
    const customHeader = request.headers.get("x-cron-secret");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (bearerToken !== cronSecret && customHeader !== cronSecret) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing cron secret." },
        { status: 401 }
      );
    }

    const result = await executeRecurringBillingRun();

    return NextResponse.json(result, { status: result.success ? 200 : 207 });
  } catch (error: any) {
    console.error("Scheduled billing execution exception:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to execute recurring billing run.",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
