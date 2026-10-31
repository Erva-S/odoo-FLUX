import { NextResponse } from "next/server";
import { dataStore } from "@/lib/data/store";

export async function POST() {
  try {
    const result = dataStore.runAutomatedBillingJob();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      created: result.created,
      skipped: result.skipped,
      message: `${result.created} invoices created, ${result.skipped} skipped as already billed for current cycle.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute billing run." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}

