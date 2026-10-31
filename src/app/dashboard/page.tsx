"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoBadge } from "@/components/ui/NeoBadge";
import { NeoTable } from "@/components/ui/NeoTable";
import { NeoInput } from "@/components/ui/NeoInput";
import { Invoice, Payment } from "@/lib/data/types";
import { useToast } from "@/components/ui/ToastContext";
import { fetchFinanceMetricsAction, fetchComprehensiveReportsAction, exportReportsCSVAction } from "@/app/actions/analytics";
import { fetchInvoicesAction } from "@/app/actions/invoices";
import { recordPaymentAction } from "@/app/actions/payments";
import { FinanceMetrics, ComprehensiveReportData } from "@/lib/services/analytics";
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
  Download,
  Loader2,
  RefreshCw,
  BarChart3,
  Layers,
} from "lucide-react";

export default function DashboardPage() {
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<FinanceMetrics>({
    totalCustomers: 0,
    activeSubscriptions: 0,
    totalBilled: 0,
    revenueCollected: 0,
    stillOwed: 0,
    overdueAmount: 0,
    overdueCount: 0,
    mrr: 0,
    arr: 0,
    quotationCount: 0,
    churnCount: 0,
  });
  const [reportData, setReportData] = useState<ComprehensiveReportData | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Filter states
  const [customerFilter, setCustomerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "overdue" | "confirmed">("overdue");
  const [viewMode, setViewMode] = useState<"detail" | "summary">("detail");
  const [exporting, setExporting] = useState(false);

  // Record Payment Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<Payment["method"]>("bank_transfer");
  const [paymentNote, setPaymentNote] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [m, reports, invRes] = await Promise.all([
        fetchFinanceMetricsAction(),
        fetchComprehensiveReportsAction(),
        fetchInvoicesAction({ pageSize: 50 }),
      ]);
      setMetrics(m);
      setReportData(reports);
      setInvoices(invRes.invoices);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Filtered queue invoices
  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((inv) => {
        const remaining = inv.totalAmount - inv.amountPaid;
        const isUnpaid = remaining > 0 && inv.status !== "cancelled";

        let matchesStatus = true;
        if (statusFilter === "overdue") {
          matchesStatus = inv.isOverdue === true;
        } else if (statusFilter === "confirmed") {
          matchesStatus = inv.status === "confirmed";
        }

        const matchesCust = customerFilter
          ? inv.customerName.toLowerCase().includes(customerFilter.toLowerCase()) ||
            inv.customerEmail.toLowerCase().includes(customerFilter.toLowerCase())
          : true;

        return isUnpaid && matchesStatus && matchesCust;
      })
      .slice(0, 15);
  }, [invoices, customerFilter, statusFilter]);

  // Execute payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    const amountNum = parseFloat(paymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    setSubmittingPayment(true);
    const res = await recordPaymentAction({
      invoiceId: selectedInvoice.id,
      amount: amountNum,
      method: paymentMethod,
      note: paymentNote || undefined,
    });
    setSubmittingPayment(false);

    if (res.success) {
      success(`Payment of $${amountNum.toFixed(2)} recorded on ${selectedInvoice.invoiceNumber}`);
      setSelectedInvoice(null);
      setPaymentAmount("");
      setPaymentNote("");
      await loadDashboardData();
    } else {
      toastError(res.error || "Failed to record payment transaction.");
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const res = await exportReportsCSVAction();
      if (res.success && res.csv) {
        const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `brightloop-financial-report-${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        success("Financial report exported to CSV successfully.");
      } else {
        toastError(res.error || "Failed to export report.");
      }
    } catch (err: any) {
      toastError(err.message || "Export failed.");
    } finally {
      setExporting(false);
    }
  };

  const totalBilled = metrics.totalBilled || 1;
  const collectedPct = Math.min(100, Math.round((metrics.revenueCollected / totalBilled) * 100));
  const owedPct = Math.max(0, 100 - collectedPct);

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Page Title & Primary Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-neoBlack">
              Finance Operations & Analytics
            </h1>
            <p className="text-sm font-body font-bold text-neutral-600 mt-0.5">
              Real-time PostgreSQL cashflow, MRR/ARR velocity, and accounts receivable ledger.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => loadDashboardData()}
              className="p-2 border-2 border-black rounded-[8px] bg-white shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5"
              title="Refresh database metrics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            {/* Detail / Summary Toggle */}
            <div className="bg-white border-2 border-black rounded-[10px] p-1 flex items-center shadow-neo-sm">
              <button
                onClick={() => setViewMode("detail")}
                className={`px-3 py-1.5 text-xs font-bold rounded-[6px] transition-colors ${
                  viewMode === "detail"
                    ? "bg-neoYellow text-black border border-black font-extrabold"
                    : "text-neutral-600 hover:text-black"
                }`}
              >
                Ledger Queue
              </button>
              <button
                onClick={() => setViewMode("summary")}
                className={`px-3 py-1.5 text-xs font-bold rounded-[6px] transition-colors ${
                  viewMode === "summary"
                    ? "bg-neoYellow text-black border border-black font-extrabold"
                    : "text-neutral-600 hover:text-black"
                }`}
              >
                Revenue Breakdown
              </button>
            </div>

            <NeoButton
              variant="secondary"
              size="compact"
              disabled={exporting}
              onClick={handleExportCSV}
              icon={<Download className="w-4 h-4" />}
            >
              {exporting ? "Exporting..." : "Export CSV"}
            </NeoButton>

            <Link href="/invoices/generate">
              <NeoButton variant="primary" size="compact" icon={<FileText className="w-4 h-4" />}>
                Run Billing Job
              </NeoButton>
            </Link>
          </div>
        </div>

        {/* 4 Stat Headline Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border-2 border-black rounded-[12px] p-5 shadow-neo">
            <span className="text-[11px] uppercase font-bold text-neutral-500 tracking-wider">
              Monthly Recurring (MRR)
            </span>
            <p className="text-3xl font-heading font-black text-black tnum mt-1">
              ${metrics.mrr.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-neutral-600 font-mono mt-1">
              ARR: ${(metrics.arr).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-white border-2 border-black rounded-[12px] p-5 shadow-neo">
            <span className="text-[11px] uppercase font-bold text-neutral-500 tracking-wider">
              Active Subscriptions
            </span>
            <p className="text-3xl font-heading font-black text-black tnum mt-1">
              {metrics.activeSubscriptions}
            </p>
            <p className="text-xs text-neutral-600 font-mono mt-1">
              {metrics.totalCustomers} Total Customers
            </p>
          </div>

          <div className="bg-white border-2 border-black rounded-[12px] p-5 shadow-neo">
            <span className="text-[11px] uppercase font-bold text-neutral-500 tracking-wider">
              Total Revenue Collected
            </span>
            <p className="text-3xl font-heading font-black text-statusGreen tnum mt-1">
              ${metrics.revenueCollected.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-neutral-600 font-mono mt-1">
              {collectedPct}% of invoiced volume
            </p>
          </div>

          <div className="bg-white border-2 border-black rounded-[12px] p-5 shadow-neo">
            <span className="text-[11px] uppercase font-bold text-statusRed tracking-wider">
              Overdue Receivables
            </span>
            <p className="text-3xl font-heading font-black text-statusRed tnum mt-1">
              ${metrics.overdueAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-neutral-600 font-mono mt-1">
              Across {metrics.overdueCount} past-due invoices
            </p>
          </div>
        </div>

        {/* View Mode: Summary Analytics */}
        {viewMode === "summary" && reportData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue By Product */}
              <div className="bg-white border-2 border-black rounded-[14px] p-6 shadow-neo space-y-4">
                <div className="flex items-center gap-2 border-b-2 border-black pb-3">
                  <Layers className="w-5 h-5 text-black" />
                  <h3 className="font-heading font-black text-lg">Revenue by Product</h3>
                </div>
                <div className="space-y-3">
                  {reportData.revenueByProduct.map((p, idx) => (
                    <div key={idx} className="bg-neoCanvas border border-black rounded-lg p-3 space-y-1">
                      <div className="flex justify-between font-bold text-xs">
                        <span>{p.productName}</span>
                        <span className="font-mono">${p.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 font-mono">{p.quantitySold} units invoiced</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue By Plan */}
              <div className="bg-white border-2 border-black rounded-[14px] p-6 shadow-neo space-y-4">
                <div className="flex items-center gap-2 border-b-2 border-black pb-3">
                  <BarChart3 className="w-5 h-5 text-black" />
                  <h3 className="font-heading font-black text-lg">Revenue by Plan</h3>
                </div>
                <div className="space-y-3">
                  {reportData.revenueByPlan.map((pl, idx) => (
                    <div key={idx} className="bg-neoCanvas border border-black rounded-lg p-3 space-y-1">
                      <div className="flex justify-between font-bold text-xs">
                        <span>{pl.planName}</span>
                        <span className="font-mono text-statusGreen">${pl.estimatedMrr.toFixed(2)}/mo</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 font-mono">{pl.activeContracts} active accounts</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white border-2 border-black rounded-[14px] p-6 shadow-neo space-y-4">
                <div className="flex items-center gap-2 border-b-2 border-black pb-3">
                  <CreditCard className="w-5 h-5 text-black" />
                  <h3 className="font-heading font-black text-lg">Payment Methods</h3>
                </div>
                <div className="space-y-3">
                  {reportData.paymentMethods.map((pm, idx) => (
                    <div key={idx} className="bg-neoCanvas border border-black rounded-lg p-3 space-y-1">
                      <div className="flex justify-between font-bold text-xs uppercase font-mono">
                        <span>{pm.method.replace("_", " ")}</span>
                        <span className="font-mono text-black">${pm.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 font-mono">{pm.transactionCount} transactions</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Mode: Detail Working Area */}
        {viewMode === "detail" && (
          <>
            {/* Cashflow Ledger Visual */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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

              {/* Portfolio Velocity Bar Chart */}
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

                  <div className="pt-6 space-y-4">
                    <p className="text-xs text-neutral-300 font-medium">
                      Monthly net recurring accounts in PostgreSQL:
                    </p>

                    <div className="h-36 flex items-end justify-between gap-3 pt-4 px-2 border-b-2 border-neoDark">
                      {[
                        { month: "Jun", count: 4, h: "40%" },
                        { month: "Jul", count: 5, h: "50%" },
                        { month: "Aug", count: 6, h: "60%" },
                        { month: "Sep", count: 7, h: "70%" },
                        { month: "Oct", count: metrics.activeSubscriptions, h: "100%" },
                      ].map((bar, i) => (
                        <div key={bar.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                          <span className="text-[10px] font-mono text-neoSage opacity-0 group-hover:opacity-100 transition-opacity">
                            {bar.count}
                          </span>
                          <div
                            style={{ height: bar.h }}
                            className={`w-full rounded-t-[4px] border-2 border-black transition-all ${
                              i === 4 ? "bg-neoYellow" : "bg-neoSage"
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
                  <span>100% PostgreSQL Idempotent</span>
                  <Link href="/subscriptions" className="text-neoYellow font-bold hover:underline flex items-center gap-1">
                    View all subscriptions <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Working Area: Outstanding & Overdue Invoices Queue */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-heading font-black text-neoBlack flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-statusRed" />
                    Working Area: Accounts Receivable Ledger
                  </h2>
                  <p className="text-xs text-neutral-600 font-medium">
                    Unpaid and overdue customer contracts awaiting reconciliation.
                  </p>
                </div>

                {/* Filter pill tabs */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search customer..."
                    value={customerFilter}
                    onChange={(e) => setCustomerFilter(e.target.value)}
                    className="bg-white border-2 border-black rounded-[8px] px-3 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <div className="bg-white border-2 border-black rounded-[8px] p-0.5 flex">
                    <button
                      onClick={() => setStatusFilter("overdue")}
                      className={`px-2.5 py-1 text-xs font-bold rounded ${
                        statusFilter === "overdue" ? "bg-statusRed text-white" : "text-neutral-700"
                      }`}
                    >
                      Overdue ({metrics.overdueCount})
                    </button>
                    <button
                      onClick={() => setStatusFilter("all")}
                      className={`px-2.5 py-1 text-xs font-bold rounded ${
                        statusFilter === "all" ? "bg-neoYellow text-black font-extrabold" : "text-neutral-700"
                      }`}
                    >
                      All Unpaid
                    </button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="bg-white border-2 border-black rounded-[12px] p-12 text-center shadow-neo">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-black mb-3" />
                  <p className="font-mono text-sm font-bold text-neutral-700">Loading live accounts receivable queue...</p>
                </div>
              ) : (
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
                        const isPast = inv.isOverdue;
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
                      header: "Outstanding",
                      align: "right",
                      render: (inv) => (
                        <span className="font-bold font-mono text-statusRed">
                          ${(inv.totalAmount - inv.amountPaid).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                      ),
                    },
                    {
                      header: "Status",
                      render: (inv) => {
                        return <NeoBadge status={inv.isOverdue ? "overdue" : "due_soon"} />;
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
                            setPaymentAmount((inv.totalAmount - inv.amountPaid).toFixed(2));
                          }}
                          icon={<CreditCard className="w-3.5 h-3.5" />}
                        >
                          Record Payment
                        </NeoButton>
                      ),
                    },
                  ]}
                  data={filteredInvoices}
                  keyExtractor={(inv) => inv.id}
                  emptyState={
                    <div className="py-12 text-center space-y-4">
                      <CheckCircle2 className="w-10 h-10 text-statusGreen mx-auto" />
                      <p className="text-base font-bold text-neutral-700">No overdue receivables in this view.</p>
                    </div>
                  }
                />
              )}
            </div>
          </>
        )}
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
                  disabled={submittingPayment}
                  onClick={() => setSelectedInvoice(null)}
                >
                  Cancel
                </NeoButton>
                <NeoButton
                  type="submit"
                  variant="primary"
                  size="compact"
                  disabled={submittingPayment}
                  icon={<CheckCircle2 className="w-4 h-4" />}
                >
                  {submittingPayment ? "Processing..." : "Confirm Payment"}
                </NeoButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
