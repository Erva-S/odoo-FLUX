"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { NeoCard } from "@/components/ui/NeoCard";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoBadge } from "@/components/ui/NeoBadge";
import { NeoTable } from "@/components/ui/NeoTable";
import { NeoInput } from "@/components/ui/NeoInput";
import { dataStore } from "@/lib/data/store";
import { Invoice, Payment } from "@/lib/data/types";
import { useToast } from "@/components/ui/ToastContext";
import {
  TrendingUp,
  AlertTriangle,
  CreditCard,
  Filter,
  ArrowRight,
  DollarSign,
  Calendar,
  CheckCircle2,
  X,
  FileText,
} from "lucide-react";

export default function DashboardPage() {
  const { success } = useToast();

  // Metrics
  const metrics = useMemo(() => dataStore.getFinanceMetrics(), []);

  // Filter states
  const [customerFilter, setCustomerFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"detail" | "summary">("detail");

  // Record Payment Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<Payment["method"]>("bank_transfer");
  const [paymentNote, setPaymentNote] = useState("");

  // Overdue & outstanding working area invoices
  const overdueInvoices = useMemo(() => {
    return dataStore.invoices
      .filter((inv) => {
        const isUnpaid = inv.status !== "paid";
        const matchesCust = customerFilter
          ? inv.customerName.toLowerCase().includes(customerFilter.toLowerCase())
          : true;
        return isUnpaid && matchesCust;
      })
      .slice(0, 15); // Server-side pagination limit for sub-second performance
  }, [customerFilter]);

  // Execute payment
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    const amountNum = parseFloat(paymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    dataStore.recordPayment({
      invoiceId: selectedInvoice.id,
      amount: amountNum,
      method: paymentMethod,
      note: paymentNote,
    });

    success(`Payment of $${amountNum.toFixed(2)} recorded on ${selectedInvoice.invoiceNumber}`);
    setSelectedInvoice(null);
    setPaymentAmount("");
    setPaymentNote("");
  };

  const collectedPct = Math.round((metrics.revenueCollected / (metrics.totalBilled || 1)) * 100);
  const owedPct = 100 - collectedPct;

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Page Title & Primary Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-neoBlack">
              Finance Operations
            </h1>
            <p className="text-sm font-body font-bold text-neutral-600 mt-0.5">
              How much is owed, and by whom?
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Detail / Summary Toggle */}
            <div className="bg-white border-2 border-black rounded-[10px] p-1 flex items-center shadow-neo-sm">
              <button
                onClick={() => setViewMode("detail")}
                className={`px-3 py-1.5 text-xs font-bold rounded-[6px] transition-colors ${
                  viewMode === "detail" ? "bg-neoYellow text-black border border-black font-extrabold" : "text-neutral-600"
                }`}
              >
                Detail
              </button>
              <button
                onClick={() => setViewMode("summary")}
                className={`px-3 py-1.5 text-xs font-bold rounded-[6px] transition-colors ${
                  viewMode === "summary" ? "bg-neoYellow text-black border border-black font-extrabold" : "text-neutral-600"
                }`}
              >
                Summary
              </button>
            </div>

            <Link href="/invoices/generate">
              <NeoButton variant="primary" size="compact" icon={<FileText className="w-4 h-4" />}>
                Run Billing Job
              </NeoButton>
            </Link>
          </div>
        </div>

        {/* Top Persistent Filter Bar */}
        <div className="bg-white border-2 border-black rounded-[12px] p-4 shadow-neo flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-neutral-600">
              <Filter className="w-4 h-4 text-black" />
              <span>Filter By:</span>
            </div>

            {/* Customer filter */}
            <input
              type="text"
              placeholder="Customer or Company..."
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="bg-neoCanvas border-2 border-black rounded-[8px] px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-black min-w-[200px]"
            />

            {/* Plan filter */}
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="bg-neoCanvas border-2 border-black rounded-[8px] px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">All Plans</option>
              <option value="starter">Starter Monthly</option>
              <option value="growth">Growth Monthly</option>
              <option value="scale">Scale Yearly</option>
              <option value="enterprise">Enterprise Pro Yearly</option>
            </select>
          </div>

          <div className="text-xs font-mono font-bold text-neutral-600 bg-neoCanvas px-2.5 py-1.5 rounded-[6px] border border-black/30">
            SHOWING 15 OF {dataStore.invoices.length} INVOICES
          </div>
        </div>

        {/* Large Key Panel (8px shadow): Revenue Collected vs Still Owed + Active Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Revenue Comparison Panel (8px shadow) */}
          <div className="lg:col-span-7 bg-white border-2 border-black rounded-[14px] p-6 shadow-neo-lg space-y-6">
            <div className="flex items-center justify-between border-b-2 border-neoDivider pb-4">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-neutral-500">
                  Cashflow Ledger
                </span>
                <h2 className="text-2xl font-heading font-black text-neoBlack">
                  Collected vs. Still Owed
                </h2>
              </div>
              <span className="text-xs font-mono font-bold bg-neoSage text-black px-2.5 py-1 rounded-[6px] border border-black">
                {collectedPct}% SETTLED
              </span>
            </div>

            {/* Visual Balance Bar */}
            <div className="space-y-2">
              <div className="h-6 w-full bg-neoCharcoal border-2 border-black rounded-[6px] overflow-hidden flex">
                <div
                  style={{ width: `${collectedPct}%` }}
                  className="bg-statusGreen h-full border-r-2 border-black transition-all duration-500"
                  title={`Collected: ${collectedPct}%`}
                />
                <div
                  style={{ width: `${owedPct}%` }}
                  className="bg-statusRed h-full transition-all duration-500"
                  title={`Owed: ${owedPct}%`}
                />
              </div>
              <div className="flex justify-between text-xs font-bold font-mono">
                <span className="text-black flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-statusGreen border border-black" />
                  Collected ({collectedPct}%)
                </span>
                <span className="text-statusRed flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-statusRed border border-black" />
                  Still Owed ({owedPct}%)
                </span>
              </div>
            </div>

            {/* Figures Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-neoSage/40 border-2 border-black rounded-[10px] p-4">
                <p className="text-[11px] uppercase font-bold text-neutral-700">Revenue Collected</p>
                <p className="text-2xl font-heading font-black text-black tnum mt-1">
                  ${metrics.revenueCollected.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="bg-neoYellow/40 border-2 border-black rounded-[10px] p-4">
                <p className="text-[11px] uppercase font-bold text-neutral-700">Amount Still Owed</p>
                <p className="text-2xl font-heading font-black text-black tnum mt-1">
                  ${metrics.stillOwed.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="bg-statusRed/20 border-2 border-black rounded-[10px] p-4 col-span-2 sm:col-span-1">
                <p className="text-[11px] uppercase font-bold text-statusRed">Overdue Amount</p>
                <p className="text-2xl font-heading font-black text-statusRed tnum mt-1">
                  ${metrics.overdueAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] font-bold text-neutral-700 mt-0.5">
                  Across {metrics.overdueCount} invoices
                </p>
              </div>
            </div>
          </div>

          {/* Active Subscriptions Trend Bar Chart (Charcoal and Sage with 2px borders) */}
          <div className="lg:col-span-5 bg-neoCharcoal text-white border-2 border-black rounded-[14px] p-6 shadow-neo-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b-2 border-neoDark pb-4">
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-widest text-neoSage">
                    Portfolio Velocity
                  </span>
                  <h3 className="text-xl font-heading font-black text-white">Active Trend</h3>
                </div>
                <NeoBadge status="active" label={`${metrics.activeSubscriptions} ACTIVE`} />
              </div>

              {/* Bar Chart Visualization in Charcoal and Sage with 2px borders */}
              <div className="pt-6 space-y-4">
                <p className="text-xs text-neutral-300 font-medium">
                  Monthly net recurring accounts (MRR stability benchmark):
                </p>

                <div className="h-36 flex items-end justify-between gap-3 pt-4 px-2 border-b-2 border-neoDark">
                  {[
                    { month: "May", count: 182, h: "55%" },
                    { month: "Jun", count: 205, h: "64%" },
                    { month: "Jul", count: 228, h: "72%" },
                    { month: "Aug", count: 249, h: "80%" },
                    { month: "Sep", count: 268, h: "88%" },
                    { month: "Oct", count: metrics.activeSubscriptions, h: "98%" },
                  ].map((bar, i) => (
                    <div key={bar.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <span className="text-[10px] font-mono text-neoSage opacity-0 group-hover:opacity-100 transition-opacity">
                        {bar.count}
                      </span>
                      <div
                        style={{ height: bar.h }}
                        className={`w-full rounded-t-[4px] border-2 border-black transition-all ${
                          i === 5 ? "bg-neoYellow" : "bg-neoSage"
                        }`}
                      />
                      <span className="text-[10px] font-mono font-bold text-neutral-400">
                        {bar.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs text-neutral-400">
              <span>99.8% Idempotency Retention</span>
              <Link href="/subscriptions" className="text-neoYellow font-bold hover:underline flex items-center gap-1">
                View all subscriptions <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Working Area: Overdue Invoices Table with "Record Payment" Row Actions */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-heading font-black text-neoBlack flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-statusRed" />
                Working Area: Outstanding & Overdue Invoices
              </h2>
              <p className="text-xs text-neutral-600 font-medium">
                Immediate reconciliation queue. Click &quot;Record Payment&quot; on any row to log customer settlements.
              </p>
            </div>
          </div>

          <NeoTable
            columns={[
              {
                header: "Invoice #",
                accessorKey: "invoiceNumber",
                render: (inv) => (
                  <Link
                    href={`/invoices/${inv.id}`}
                    className="font-mono font-bold underline hover:text-neutral-700"
                  >
                    {inv.invoiceNumber}
                  </Link>
                ),
              },
              {
                header: "Customer",
                accessorKey: "customerName",
                render: (inv) => (
                  <div>
                    <span className="font-bold block">{inv.customerName}</span>
                    <span className="text-[11px] text-neutral-600">{inv.customerEmail}</span>
                  </div>
                ),
              },
              {
                header: "Due Date",
                accessorKey: "dueDate",
                render: (inv) => {
                  const isPast = new Date(inv.dueDate) < new Date();
                  return (
                    <span className={`font-mono text-xs font-bold ${isPast ? "text-statusRed" : "text-black"}`}>
                      {inv.dueDate} {isPast && "(!)"}
                    </span>
                  );
                },
              },
              {
                header: "Total Due",
                accessorKey: "totalAmount",
                align: "right",
                render: (inv) => (
                  <span className="font-bold font-mono">
                    ${inv.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                ),
              },
              {
                header: "Amount Paid",
                accessorKey: "amountPaid",
                align: "right",
                render: (inv) => (
                  <span className="font-mono text-neutral-700">
                    ${inv.amountPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                ),
              },
              {
                header: "Status",
                render: (inv) => {
                  const isPast = new Date(inv.dueDate) < new Date();
                  return <NeoBadge status={isPast ? "overdue" : "due_soon"} />;
                },
              },
              {
                header: "Action",
                align: "right",
                render: (inv) => (
                  <NeoButton
                    size="compact"
                    variant="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedInvoice(inv);
                      setPaymentAmount(String(inv.totalAmount - inv.amountPaid));
                    }}
                    icon={<CreditCard className="w-3.5 h-3.5" />}
                  >
                    Record Payment
                  </NeoButton>
                ),
              },
            ]}
            data={overdueInvoices}
            keyExtractor={(inv) => inv.id}
          />
        </div>
      </div>

      {/* Record Payment Modal Dialog */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black rounded-[16px] shadow-neo-xl max-w-lg w-full p-6 space-y-6 animate-slide-in">
            <div className="flex justify-between items-start border-b-2 border-black pb-4">
              <div>
                <span className="text-xs uppercase font-extrabold text-neutral-500 tracking-wider">
                  Reconciliation Console
                </span>
                <h3 className="text-2xl font-heading font-black">
                  Record Payment for {selectedInvoice.invoiceNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1 hover:bg-neutral-100 rounded border border-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div className="bg-neoCanvas border-2 border-black rounded-[10px] p-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Customer:</span>
                  <span className="font-bold">{selectedInvoice.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Total Invoiced:</span>
                  <span className="font-mono font-bold">${selectedInvoice.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Already Paid:</span>
                  <span className="font-mono font-bold">${selectedInvoice.amountPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-neutral-300 pt-1 text-sm font-bold text-statusRed">
                  <span>Balance Remaining:</span>
                  <span className="font-mono">${(selectedInvoice.totalAmount - selectedInvoice.amountPaid).toFixed(2)}</span>
                </div>
              </div>

              <NeoInput
                label="Payment Amount ($)"
                type="number"
                step="0.01"
                min="0.01"
                max={selectedInvoice.totalAmount - selectedInvoice.amountPaid}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                required
              />

              <div className="space-y-1.5 text-left">
                <label className="block text-sm font-bold text-neoBlack">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-white border-2 border-black rounded-[8px] px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="bank_transfer">Bank Wire / ACH Transfer</option>
                  <option value="credit_card">Corporate Credit Card</option>
                  <option value="wire">SWIFT International Wire</option>
                  <option value="ach">Direct Debit (ACH)</option>
                </select>
              </div>

              <NeoInput
                label="Reconciliation Reference / Notes"
                placeholder="e.g. Bank statement ref #WT-89421"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
              />

              <div className="flex justify-end gap-3 pt-4 border-t-2 border-neoDivider">
                <NeoButton
                  type="button"
                  variant="secondary"
                  size="compact"
                  onClick={() => setSelectedInvoice(null)}
                >
                  Cancel
                </NeoButton>
                <NeoButton
                  type="submit"
                  variant="primary"
                  size="compact"
                  icon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Confirm Payment
                </NeoButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

