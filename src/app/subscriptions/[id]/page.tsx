"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { LifecycleRail, SubscriptionStage } from "@/components/subscriptions/LifecycleRail";
import { MockupWindow } from "@/components/ui/MockupWindow";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoBadge } from "@/components/ui/NeoBadge";
import { NeoTable } from "@/components/ui/NeoTable";
import { dataStore } from "@/lib/data/store";
import { Subscription } from "@/lib/data/types";
import { useToast } from "@/components/ui/ToastContext";
import {
  ArrowLeft,
  Printer,
  Download,
  Share2,
  Calendar,
  Building,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";

export default function SubscriptionDetailPage() {
  const params = useParams();
  const subId = params?.id as string;
  const router = useRouter();
  const { success, toast } = useToast();

  const [sub, setSub] = useState<Subscription | undefined>(() => {
    return dataStore.getSubscriptionById(subId);
  });

  if (!sub) {
    return (
      <AppShell>
        <div className="py-20 text-center space-y-4">
          <h2 className="text-2xl font-heading font-black">Subscription Not Found</h2>
          <p className="text-neutral-600">The requested subscription ID could not be located.</p>
          <Link href="/subscriptions">
            <NeoButton variant="primary">Return to Subscriptions</NeoButton>
          </Link>
        </div>
      </AppShell>
    );
  }

  // Handle stage progression
  const handleAdvanceStage = (nextStage: SubscriptionStage) => {
    const updated = dataStore.updateSubscriptionStage(sub.id, nextStage);
    if (updated) {
      setSub({ ...updated });
      success(`Subscription successfully advanced to ${nextStage.toUpperCase()}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

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
                closed: sub.status === "closed" ? sub.expiryDate : undefined,
              }}
              onAdvanceStage={handleAdvanceStage}
            />

            {/* Quick Contract Metadata */}
            <div className="bg-white border-2 border-black rounded-[14px] p-5 shadow-neo mt-6 space-y-3">
              <h4 className="text-xs font-heading font-black uppercase text-neutral-500 tracking-wider">
                Contract Schedule
              </h4>
              <div className="space-y-2 text-xs font-medium">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Start Date:</span>
                  <span className="font-mono font-bold">{sub.startDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Expiry / Renewal:</span>
                  <span className="font-mono font-bold">{sub.expiryDate || "Ongoing"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Customer Email:</span>
                  <span className="font-bold truncate max-w-[140px]">{sub.customerEmail}</span>
                </div>
                {sub.discountCode && (
                  <div className="flex justify-between text-statusGreen font-bold">
                    <span>Discount Code:</span>
                    <span className="font-mono">{sub.discountCode}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Live Printable Invoice Preview in Browser-Mockup Window */}
          <div className="lg:col-span-8">
            <MockupWindow
              title={`invoice-preview // ${sub.subscriptionNumber}.live`}
              headerRight={
                <span className="text-[10px] font-mono bg-statusGreen px-2 py-0.5 rounded text-black font-bold border border-black">
                  LIVE CALCULATION
                </span>
              }
            >
              <div className="space-y-6 text-neoBlack p-2 sm:p-4">
                {/* Invoice Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-black pb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 bg-black rounded-[6px] flex items-center justify-center">
                        <span className="text-neoYellow font-black text-sm">B</span>
                      </div>
                      <span className="font-heading font-black text-xl">BRIGHTLOOP SOFTWARE</span>
                    </div>
                    <p className="text-xs text-neutral-600">100 Innovation Way, Suite 400</p>
                    <p className="text-xs text-neutral-600">San Francisco, CA 94107</p>
                    <p className="text-xs font-mono text-neutral-500">billing@brightloop.io</p>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-xs font-mono font-bold bg-neoYellow px-2.5 py-1 rounded border border-black inline-block">
                      INVOICE QUOTATION
                    </span>
                    <h2 className="text-2xl font-mono font-black mt-2">
                      {sub.subscriptionNumber.replace("SUB-", "INV-2026-")}
                    </h2>
                    <p className="text-xs text-neutral-600">
                      Issue Date: <strong className="font-mono">{sub.startDate}</strong>
                    </p>
                    <p className="text-xs text-neutral-600">
                      Payment Terms: <strong>{sub.paymentTerms}</strong>
                    </p>
                  </div>
                </div>

                {/* Billed To / Account */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neoCanvas border-2 border-black rounded-[10px] p-4 text-xs">
                  <div>
                    <span className="uppercase font-bold text-neutral-500 tracking-wider block text-[10px]">
                      Billed To Account
                    </span>
                    <p className="font-bold text-sm text-black mt-0.5">{sub.customerName}</p>
                    <p className="text-neutral-600 font-mono">{sub.customerEmail}</p>
                    <p className="text-neutral-600 mt-1">Acme Industrial Tech Building, NY</p>
                  </div>
                  <div className="sm:text-right">
                    <span className="uppercase font-bold text-neutral-500 tracking-wider block text-[10px]">
                      Billing Period
                    </span>
                    <p className="font-mono font-bold text-black mt-0.5">
                      {sub.startDate} to {sub.expiryDate || "Continuous"}
                    </p>
                    <span className="inline-block mt-2">
                      <NeoBadge status={sub.status} />
                    </span>
                  </div>
                </div>

                {/* Printable Invoice Lines Table */}
                <div className="border-2 border-black rounded-[8px] overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-neoBlack text-white">
                        <th className="p-3 font-heading font-extrabold uppercase">Product Line</th>
                        <th className="p-3 font-heading font-extrabold uppercase text-center">Qty</th>
                        <th className="p-3 font-heading font-extrabold uppercase text-right">Unit Price</th>
                        <th className="p-3 font-heading font-extrabold uppercase text-right">Tax Rate</th>
                        <th className="p-3 font-heading font-extrabold uppercase text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-neoDivider bg-white font-medium">
                      {sub.lines.map((line, idx) => {
                        const prod = dataStore.products.find((p) => p.id === line.productId);
                        const variant = prod?.variants.find((v) => v.id === line.variantId);
                        return (
                          <tr key={idx} className="hover:bg-neoYellow/20">
                            <td className="p-3">
                              <span className="font-bold block text-sm">
                                {prod?.name || "Core Platform"}
                              </span>
                              {variant && (
                                <span className="text-[11px] font-mono text-neutral-700 bg-neoSage/40 px-1.5 py-0.5 rounded border border-black/30 inline-block mt-0.5">
                                  {variant.attributeName}: {variant.attributeValue} (+${variant.priceExtra.toFixed(2)})
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-center font-mono">{line.quantity}</td>
                            <td className="p-3 text-right font-mono">${line.unitPrice.toFixed(2)}</td>
                            <td className="p-3 text-right font-mono">{line.taxRate}%</td>
                            <td className="p-3 text-right font-mono font-bold">${line.amount.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Subtotal, Discount & Total Box */}
                <div className="flex flex-col items-end space-y-2 pt-2 text-xs">
                  <div className="w-full sm:w-72 flex justify-between text-neutral-600">
                    <span>Lines Subtotal:</span>
                    <span className="font-mono font-bold">${sub.subtotal.toFixed(2)}</span>
                  </div>

                  {sub.discountAmount > 0 && (
                    <div className="w-full sm:w-72 flex justify-between text-statusGreen font-bold">
                      <span>Promo Discount ({sub.discountCode}):</span>
                      <span className="font-mono">-${sub.discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="w-full sm:w-72 flex justify-between text-neutral-600">
                    <span>Tax (Standard 10% VAT):</span>
                    <span className="font-mono font-bold">${sub.taxAmount.toFixed(2)}</span>
                  </div>

                  <div className="w-full sm:w-72 flex justify-between border-t-2 border-black pt-2 text-base font-extrabold text-black">
                    <span>Total Payable:</span>
                    <span className="font-mono font-black">${sub.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Notice & Wire Instructions */}
                <div className="bg-neoSage/30 border-2 border-black rounded-[8px] p-3 text-[11px] text-neutral-800 space-y-1">
                  <p className="font-bold">Automated Payment Settlement:</p>
                  <p>
                    Invoices are processed automatically via idempotent cron triggers. ACH and SWIFT wire transfers
                    reconcile directly with this subscription reference.
                  </p>
                </div>
              </div>
            </MockupWindow>
          </div>
        </div>

        {/* Below: Configured Subscription Lines Detailed Table */}
        <div className="bg-white border-2 border-black rounded-[14px] p-6 shadow-neo space-y-4">
          <div className="flex items-center justify-between border-b-2 border-neoDivider pb-3">
            <div>
              <h3 className="font-heading font-black text-xl">Configured Subscription Lines</h3>
              <p className="text-xs text-neutral-600 font-medium">
                Base products and attribute variants attached to this contract.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-neoCanvas px-2.5 py-1 rounded border border-black/40">
              {sub.lines.length} ITEM(S)
            </span>
          </div>

          <NeoTable
            columns={[
              {
                header: "Product",
                accessorKey: "productId",
                render: (line) => {
                  const prod = dataStore.products.find((p) => p.id === line.productId);
                  return <span className="font-bold">{prod?.name || line.productId}</span>;
                },
              },
              {
                header: "Variant",
                accessorKey: "variantId",
                render: (line) => {
                  const prod = dataStore.products.find((p) => p.id === line.productId);
                  const variant = prod?.variants.find((v) => v.id === line.variantId);
                  return variant ? (
                    <span className="font-mono text-xs font-bold bg-neoYellow px-2 py-0.5 rounded border border-black">
                      {variant.attributeName}: {variant.attributeValue} (+${variant.priceExtra})
                    </span>
                  ) : (
                    <span className="text-xs text-neutral-500 font-medium">Base Standard</span>
                  );
                },
              },
              {
                header: "Quantity",
                accessorKey: "quantity",
                align: "center",
                render: (line) => <span className="font-mono font-bold">{line.quantity}</span>,
              },
              {
                header: "Unit Price",
                accessorKey: "unitPrice",
                align: "right",
                render: (line) => (
                  <span className="font-mono">${line.unitPrice.toFixed(2)}</span>
                ),
              },
              {
                header: "Tax Rate",
                accessorKey: "taxRate",
                align: "right",
                render: (line) => <span className="font-mono">{line.taxRate}%</span>,
              },
              {
                header: "Line Total",
                accessorKey: "amount",
                align: "right",
                render: (line) => (
                  <span className="font-mono font-bold">${line.amount.toFixed(2)}</span>
                ),
              },
            ]}
            data={sub.lines}
            keyExtractor={(line) => line.id}
          />
        </div>
      </div>
    </AppShell>
  );
}

