"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { NeoButton } from "@/components/ui/NeoButton";
import { useToast } from "@/components/ui/ToastContext";
import { executeBillingRunAction } from "@/app/actions/invoices";
import { getSubscriptionsAction } from "@/app/actions/subscriptions";
import {
  FileText,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowLeft,
  ShieldCheck,
  Clock,
  Loader2,
} from "lucide-react";

export default function AutomatedBillingRunPage() {
  const { success, error: toastError } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeCount, setActiveCount] = useState<number | null>(null);
  const [summary, setSummary] = useState<{
    created: number;
    skipped: number;
    failed: number;
    totalEligible: number;
    executionTimeMs: number;
    invoicesCreated: {
      invoiceNumber: string;
      subscriptionNumber: string;
      customerEmail: string;
      totalAmount: number;
    }[];
  } | null>(null);

  useEffect(() => {
    async function loadActiveCount() {
      try {
        const res = await getSubscriptionsAction({ status: "active", pageSize: 1 });
        if (res.success && res.data) {
          setActiveCount(res.data.total);
        } else {
          setActiveCount(0);
        }
      } catch (err) {
        console.error("Failed to fetch active subscriptions count:", err);
        setActiveCount(0);
      }
    }
    loadActiveCount();
  }, []);

  const handleExecuteBilling = async () => {
    setIsRunning(true);
    setProgress(15);
    setSummary(null);

    const progressTimer = setInterval(() => {
      setProgress((prev) => (prev >= 85 ? 85 : prev + 20));
    }, 150);

    try {
      const result = await executeBillingRunAction();
      clearInterval(progressTimer);
      setProgress(100);

      if (result.success) {
        setSummary({
          created: result.createdCount,
          skipped: result.skippedCount,
          failed: result.failedCount,
          totalEligible: result.totalEligible,
          executionTimeMs: result.executionTimeMs,
          invoicesCreated: result.invoicesCreated,
        });
        success(
          `Billing Run Finished in ${result.executionTimeMs}ms: ${result.createdCount} invoices created, ${result.skippedCount} skipped.`
        );
      } else {
        toastError(result.errors?.[0]?.error || "Billing run encountered errors.");
      }
    } catch (err: any) {
      clearInterval(progressTimer);
      toastError(err.message || "Failed to execute billing engine.");
    } finally {
      setIsRunning(false);
    }
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
              Database-backed batch engine: generates snapshot invoices for all active PostgreSQL subscriptions.
            </p>
          </div>
        </div>

        {/* Idempotency Assurance Banner */}
        <div className="bg-neoSage border-2 border-black rounded-[14px] p-6 shadow-neo space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-black" />
            <h2 className="font-heading font-black text-xl">
              Strict Database Idempotency Guarantee
            </h2>
          </div>
          <p className="text-sm text-neutral-900 font-medium leading-relaxed">
            The billing engine enforces a unique PostgreSQL constraint on{" "}
            <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-black font-bold">
              (subscription_id, billing_period_start)
            </code>
            . Re-running the job at any time is 100% safe — subscriptions that have already been billed
            for their current period are skipped automatically with zero double-charging.
          </p>
        </div>

        {/* Execution Control Box */}
        <div className="bg-white border-2 border-black rounded-[14px] p-8 shadow-neo-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase text-neutral-500 tracking-wider">
                Eligible Target Accounts in PostgreSQL
              </span>
              <p className="text-3xl font-heading font-black tnum mt-1 flex items-center gap-2">
                {activeCount === null ? (
                  <Loader2 className="w-6 h-6 animate-spin text-neutral-600" />
                ) : (
                  `${activeCount} Active Subscriptions`
                )}
              </p>
            </div>

            <NeoButton
              variant="primary"
              size="large"
              disabled={isRunning || activeCount === 0}
              onClick={handleExecuteBilling}
              icon={
                isRunning ? (
                  <RotateCcw className="w-5 h-5 animate-spin" />
                ) : (
                  <Play className="w-5 h-5 fill-white" />
                )
              }
            >
              {isRunning ? "Running Batch Engine..." : "Execute Billing Run"}
            </NeoButton>
          </div>

          {/* Progress Bar */}
          {(isRunning || progress > 0) && (
            <div className="space-y-2 pt-4 border-t-2 border-neoDivider">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span>Progress: {progress}%</span>
                <span>{isRunning ? "Processing subscriptions in PostgreSQL..." : "Execution Finished"}</span>
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-black" />
                  <h3 className="font-heading font-black text-xl">Batch Execution Summary</h3>
                </div>
                <span className="text-xs font-mono font-bold bg-white px-2.5 py-1 rounded border border-black">
                  {summary.executionTimeMs} ms
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
                    Errors
                  </span>
                  <p className="text-2xl font-heading font-black text-statusRed tnum mt-1">
                    {summary.failed}
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

              {summary.invoicesCreated.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-black/20">
                  <span className="text-xs font-mono font-bold text-neutral-700 block">
                    Generated Invoices in PostgreSQL:
                  </span>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 font-mono text-xs">
                    {summary.invoicesCreated.map((inv, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-black rounded p-2 flex justify-between items-center"
                      >
                        <span className="font-bold">{inv.invoiceNumber}</span>
                        <span className="text-neutral-600">{inv.subscriptionNumber}</span>
                        <span className="font-bold text-statusGreen">
                          ${inv.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Link href="/invoices">
                  <NeoButton variant="primary" size="compact" icon={<FileText className="w-4 h-4" />}>
                    View Invoices Ledger
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
