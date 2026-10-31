"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { LifecycleRail, SubscriptionStage } from "@/components/subscriptions/LifecycleRail";
import { MockupWindow } from "@/components/ui/MockupWindow";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoBadge } from "@/components/ui/NeoBadge";
import { NeoTable } from "@/components/ui/NeoTable";
import { Subscription, SubscriptionStatus } from "@/lib/data/types";
import { useToast } from "@/components/ui/ToastContext";
import {
  ArrowLeft,
  Printer,
  FileText,
  Loader2,
  Calendar,
  Building,
  CheckCircle2,
  AlertCircle,
  Server,
  RefreshCw,
} from "lucide-react";
import {
  getSubscriptionByIdAction,
  advanceSubscriptionStageAction,
} from "@/app/actions/subscriptions";

export default function SubscriptionDetailPage() {
  const params = useParams();
  const subId = params?.id as string;
  const router = useRouter();
  const { success, error } = useToast();

  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);

  const loadSub = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getSubscriptionByIdAction(subId);
      if (res.success && res.data) {
        setSub(res.data);
      } else {
        error(res.error || "Subscription not found.");
      }
    } catch (err: unknown) {
      error("Failed to load subscription details.");
    } finally {
      setLoading(false);
    }
  }, [subId, error]);

  useEffect(() => {
    if (subId) {
      loadSub();
    }
  }, [subId, loadSub]);

  // Handle stage progression
  const handleAdvanceStage = async (nextStage: SubscriptionStage) => {
    try {
      setAdvancing(true);
      const res = await advanceSubscriptionStageAction(
        subId,
        nextStage as SubscriptionStatus,
        `Stage advanced by user to ${nextStage}`
      );

      if (!res.success || !res.data) {
        error(res.error || "Failed to advance stage.");
        return;
      }

      setSub(res.data);
      success(`Subscription successfully advanced to ${nextStage.toUpperCase()} in PostgreSQL.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error advancing stage";
      error(msg);
    } finally {
      setAdvancing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <AppShell>
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-statusBlue" />
          <p className="text-xs font-mono font-bold text-neutral-600 uppercase">
            Loading Subscription Contract from PostgreSQL...
          </p>
        </div>
      </AppShell>
    );
  }

  if (!sub) {
    return (
      <AppShell>
        <div className="py-20 text-center space-y-4">
          <h2 className="text-2xl font-heading font-black">Subscription Not Found</h2>
          <p className="text-neutral-600 text-xs">The requested subscription ID could not be located in PostgreSQL.</p>
          <Link href="/subscriptions">
            <NeoButton variant="primary">Return to Subscriptions</NeoButton>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Top Breadcrumb & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/subscriptions"
              className="p-2 border-2 border-black rounded-[8px] bg-white shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-neoBlack">
                  {sub.subscriptionNumber} — {sub.customerName}
                </h1>
                <NeoBadge status={sub.status} />
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neoSage text-black border border-black shadow-neo-sm">
                  <Server className="w-2.5 h-2.5 text-statusGreen" />
                  PostgreSQL
                </span>
              </div>
              <p className="text-xs text-neutral-600 font-mono mt-0.5">
                Plan: <strong>{sub.planName}</strong> | Terms: <strong>{sub.paymentTerms}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NeoButton
              variant="secondary"
              size="compact"
              onClick={handlePrint}
              icon={<Printer className="w-4 h-4" />}
            >
              Print Preview
            </NeoButton>
            <Link href={`/invoices?sub=${sub.subscriptionNumber}`}>
              <NeoButton
                variant="primary"
                size="compact"
                icon={<FileText className="w-4 h-4" />}
              >
                View Invoices
              </NeoButton>
            </Link>
          </div>
        </div>

        {/* The Memorable Split View: Lifecycle Rail (Left) + Live Invoice Preview Mockup Window (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Lifecycle Rail on Charcoal Panel */}
          <div className="lg:col-span-4 sticky top-24">
            <LifecycleRail
              currentStage={sub.status as SubscriptionStage}
              stageDates={{
                draft: sub.startDate,
                quotation: sub.startDate,
                confirmed: sub.startDate,
                active: sub.startDate,
                closed: sub.expiryDate,
              }}
              onAdvanceStage={handleAdvanceStage}
            />
          </div>

          {/* Right Column: Live Mockup Window of the Invoice / Quotation */}
          <div className="lg:col-span-8 space-y-6">
            <MockupWindow
              title={`${sub.status.toUpperCase()} PREVIEW: ${sub.subscriptionNumber}`}
            >
              <div className="p-6 sm:p-8 space-y-8 bg-white">
                {/* Printable Invoice Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-neoDivider pb-6">
                  <div>
                    <span className="font-heading font-black text-2xl tracking-tight text-neoBlack">
                      BRIGHTLOOP SOFTWARE
                    </span>
                    <p className="text-xs text-neutral-500 font-mono">
                      Tax ID: US-91823910 • 100 Innovation Way, Suite 400
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-neutral-500 uppercase block">
                      Contract Ref
                    </span>
                    <span className="font-mono font-black text-lg text-neoBlack">
                      {sub.subscriptionNumber}
                    </span>
                  </div>
                </div>

                {/* Bill to & Period details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  <div className="bg-neoCanvas border-2 border-black rounded-[8px] p-4 space-y-1">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-neutral-500 block mb-1">
                      Client Entity
                    </span>
                    <p className="font-heading font-black text-base">{sub.customerName}</p>
                    <p className="font-mono text-neutral-600">{sub.customerEmail}</p>
                  </div>

                  <div className="bg-neoCanvas border-2 border-black rounded-[8px] p-4 space-y-2 font-mono">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-neutral-500 block">
                      Billing Schedule
                    </span>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Effective Date:</span>
                      <span className="font-bold">{sub.startDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Renewal Cycle:</span>
                      <span className="font-bold">{sub.planName}</span>
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="space-y-3">
                  <span className="font-heading font-black text-sm uppercase tracking-wider text-neutral-600 block">
                    Contracted Software & Variants
                  </span>

                  <NeoTable
                    columns={[
                      {
                        header: "Description / Attribute Details",
                        accessorKey: "productId",
                        render: (line) => (
                          <div>
                            <span className="font-bold text-xs block">
                              Software Subscription Line #{line.id.slice(0, 8)}
                            </span>
                            <span className="text-[11px] text-neutral-500">
                              Unit Base + Configured Variant Surcharges
                            </span>
                          </div>
                        ),
                      },
                      {
                        header: "Qty",
                        accessorKey: "quantity",
                        align: "center",
                        render: (line) => <span className="font-mono text-xs">{line.quantity}</span>,
                      },
                      {
                        header: "Unit Price",
                        accessorKey: "unitPrice",
                        align: "right",
                        render: (line) => (
                          <span className="font-mono text-xs">${line.unitPrice.toFixed(2)}</span>
                        ),
                      },
                      {
                        header: "Total",
                        accessorKey: "amount",
                        align: "right",
                        render: (line) => (
                          <span className="font-mono font-bold text-xs">${line.amount.toFixed(2)}</span>
                        ),
                      },
                    ]}
                    data={sub.lines}
                    keyExtractor={(line) => line.id}
                  />
                </div>

                {/* Grand Totals */}
                <div className="flex justify-end pt-4 border-t-2 border-black">
                  <div className="w-full sm:w-72 bg-neoCanvas border-2 border-black rounded-[8px] p-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-600 font-medium">Subtotal</span>
                      <span className="font-mono font-bold">${sub.subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-neutral-600 font-medium">VAT (10.00%)</span>
                      <span className="font-mono font-bold">${sub.taxAmount.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between border-t-2 border-black pt-2 font-black text-base">
                      <span>Grand Total</span>
                      <span className="font-mono font-black">${sub.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </MockupWindow>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
