"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { NeoCard } from "@/components/ui/NeoCard";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoBadge } from "@/components/ui/NeoBadge";
import { dataStore } from "@/lib/data/store";
import { useToast } from "@/components/ui/ToastContext";
import {
  FileText,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowLeft,
  ShieldCheck,
  Clock,
} from "lucide-react";

export default function AutomatedBillingRunPage() {
  const { success, toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<{
    created: number;
    skipped: number;
    totalEligible: number;
  } | null>(null);

  const activeCount = dataStore.subscriptions.filter((s) => s.status === "active").length;

  const handleExecuteBilling = () => {
    setIsRunning(true);
    setProgress(10);
    setSummary(null);

    // Simulated non-blocking asynchronous progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 150);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setIsRunning(false);

      const result = dataStore.runAutomatedBillingJob();
      setSummary({
        created: result.created,
        skipped: result.skipped,
        totalEligible: activeCount,
      });

      success(
        `Job finished: ${result.created} invoices created, ${result.skipped} skipped as already billed.`
      );
    }, 900);
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 border-b-2 border-black pb-4">
          <Link
            href="/invoices"
            className="p-2 border-2 border-black rounded-[8px] bg-white shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-heading font-black tracking-tight text-neoBlack">
              Automated Recurring Billing Run
            </h1>
            <p className="text-xs text-neutral-600 font-bold">
              Idempotent batch engine: bills all active subscriptions for their current cycle.
            </p>
          </div>
        </div>

        {/* Idempotency Assurance Banner */}
        <div className="bg-neoSage border-2 border-black rounded-[14px] p-6 shadow-neo space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-black" />
            <h2 className="font-heading font-black text-xl">
              Strict Idempotency Guarantee
            </h2>
          </div>
          <p className="text-sm text-neutral-900 font-medium leading-relaxed">
            The billing engine enforces a unique database constraint on{" "}
            <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-black font-bold">
              (subscription_id, billing_period_start)
            </code>
            . Re-running the job is 100% safe at any time — already-billed accounts will be skipped
            automatically without double-charging or duplicate invoices.
          </p>
        </div>

        {/* Execution Control Box */}
        <div className="bg-white border-2 border-black rounded-[14px] p-8 shadow-neo-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase text-neutral-500 tracking-wider">
                Eligible Target Accounts
              </span>
              <p className="text-3xl font-heading font-black tnum mt-1">
                {activeCount} Active Subscriptions
              </p>
            </div>

            <NeoButton
              variant="primary"
              size="large"
              disabled={isRunning}
              onClick={handleExecuteBilling}
              icon={
                isRunning ? (
                  <RotateCcw className="w-5 h-5 animate-spin" />
                ) : (
                  <Play className="w-5 h-5 fill-white" />
                )
              }
            >
              {isRunning ? "Running Batch Job..." : "Execute Billing Run"}
            </NeoButton>
          </div>

          {/* Progress Bar (Visible while running or when completed) */}
          {(isRunning || progress > 0) && (
            <div className="space-y-2 pt-4 border-t-2 border-neoDivider">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span>Progress: {progress}%</span>
                <span>{isRunning ? "Scanning subscriptions & constraints..." : "Completed"}</span>
              </div>
              <div className="h-6 w-full bg-neoCanvas border-2 border-black rounded-[8px] overflow-hidden p-0.5">
                <div
                  style={{ width: `${progress}%` }}
                  className="h-full bg-neoYellow border-r-2 border-black transition-all duration-200"
                />
              </div>
            </div>
          )}

          {/* Result Summary */}
          {summary && (
            <div className="bg-neoYellow/30 border-2 border-black rounded-[10px] p-6 space-y-4 animate-slide-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-black" />
                <h3 className="font-heading font-black text-xl">Billing Run Summary</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border-2 border-black rounded-[8px] p-3 text-center">
                  <span className="text-[10px] font-bold uppercase text-neutral-600">
                    Invoices Created
                  </span>
                  <p className="text-2xl font-heading font-black text-statusGreen tnum mt-1">
                    {summary.created}
                  </p>
                </div>
                <div className="bg-white border-2 border-black rounded-[8px] p-3 text-center">
                  <span className="text-[10px] font-bold uppercase text-neutral-600">
                    Skipped (Idempotent)
                  </span>
                  <p className="text-2xl font-heading font-black text-neutral-700 tnum mt-1">
                    {summary.skipped}
                  </p>
                </div>
                <div className="bg-white border-2 border-black rounded-[8px] p-3 text-center">
                  <span className="text-[10px] font-bold uppercase text-neutral-600">
                    Total Scanned
                  </span>
                  <p className="text-2xl font-heading font-black text-black tnum mt-1">
                    {summary.totalEligible}
                  </p>
                </div>
              </div>
              <p className="text-xs text-neutral-700 font-medium">
                Summary: <strong>{summary.created} invoices created</strong>,{" "}
                <strong>{summary.skipped} skipped</strong> as already billed for current cycle.
              </p>
              <div className="pt-2">
                <Link href="/invoices">
                  <NeoButton variant="primary" size="compact">
                    Review Invoices List
                  </NeoButton>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

