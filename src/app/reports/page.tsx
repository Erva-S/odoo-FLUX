"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoBadge } from "@/components/ui/NeoBadge";
import { NeoTable } from "@/components/ui/NeoTable";
import { useToast } from "@/components/ui/ToastContext";
import { fetchComprehensiveReportsAction, exportReportsCSVAction } from "@/app/actions/analytics";
import { ComprehensiveReportData } from "@/lib/services/analytics";
import {
  BarChart3,
  Download,
  Layers,
  CreditCard,
  TrendingUp,
  DollarSign,
  Calendar,
  Loader2,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";

export default function ReportsPage() {
  const { success, error: toastError } = useToast();
  const [data, setData] = useState<ComprehensiveReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchComprehensiveReportsAction();
      setData(res);
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const res = await exportReportsCSVAction();
      if (res.success && res.csv) {
        const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `brightloop-reports-${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        success("CSV report exported successfully.");
      } else {
        toastError(res.error || "Failed to generate CSV.");
      }
    } catch (err: any) {
      toastError(err.message || "Export error.");
    } finally {
      setExporting(false);
    }
  };

  if (loading || !data) {
    return (
      <AppShell>
        <div className="py-24 text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-black" />
          <p className="font-mono text-sm font-bold text-neutral-700">Aggregating PostgreSQL financial reports...</p>
        </div>
      </AppShell>
    );
  }

  const { metrics, revenueByMonth, revenueByProduct, revenueByPlan, paymentMethods } = data;

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 border-2 border-black rounded-[8px] bg-white shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-neoBlack">
                Financial Reports & Analytics
              </h1>
              <p className="text-sm font-body font-bold text-neutral-600 mt-0.5">
                Aggregated monthly revenue, product distribution, and cash settlements.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadData()}
              className="p-2 border-2 border-black rounded-[8px] bg-white shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5"
              title="Refresh reports"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            <NeoButton
              variant="primary"
              size="compact"
              disabled={exporting}
              onClick={handleExportCSV}
              icon={<Download className="w-4 h-4" />}
            >
              {exporting ? "Exporting..." : "Export Full CSV"}
            </NeoButton>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border-2 border-black rounded-[12px] p-5 shadow-neo">
            <span className="text-[11px] uppercase font-bold text-neutral-500">Monthly Recurring (MRR)</span>
            <p className="text-3xl font-heading font-black tnum mt-1">${metrics.mrr.toFixed(2)}</p>
            <p className="text-xs text-neutral-600 font-mono mt-0.5">Annualized ARR: ${metrics.arr.toFixed(2)}</p>
          </div>

          <div className="bg-white border-2 border-black rounded-[12px] p-5 shadow-neo">
            <span className="text-[11px] uppercase font-bold text-neutral-500">Total Billed Invoices</span>
            <p className="text-3xl font-heading font-black tnum mt-1">${metrics.totalBilled.toFixed(2)}</p>
            <p className="text-xs text-neutral-600 font-mono mt-0.5">Across {metrics.activeSubscriptions} active subs</p>
          </div>

          <div className="bg-white border-2 border-black rounded-[12px] p-5 shadow-neo">
            <span className="text-[11px] uppercase font-bold text-statusGreen">Total Settled Cash</span>
            <p className="text-3xl font-heading font-black text-statusGreen tnum mt-1">${metrics.revenueCollected.toFixed(2)}</p>
            <p className="text-xs text-neutral-600 font-mono mt-0.5">Reconciled in payments table</p>
          </div>

          <div className="bg-white border-2 border-black rounded-[12px] p-5 shadow-neo">
            <span className="text-[11px] uppercase font-bold text-statusRed">Outstanding Receivables</span>
            <p className="text-3xl font-heading font-black text-statusRed tnum mt-1">${metrics.stillOwed.toFixed(2)}</p>
            <p className="text-xs text-statusRed font-mono mt-0.5">${metrics.overdueAmount.toFixed(2)} overdue</p>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue by Month */}
          <div className="bg-white border-2 border-black rounded-[14px] p-6 shadow-neo space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-black pb-3">
              <Calendar className="w-5 h-5 text-black" />
              <h2 className="font-heading font-black text-xl">Revenue by Month</h2>
            </div>
            <NeoTable
              columns={[
                { header: "Billing Month", accessorKey: "month", render: (m) => <span className="font-mono font-bold">{m.month}</span> },
                { header: "Settled Volume", accessorKey: "revenue", align: "right", render: (m) => <span className="font-mono font-bold text-statusGreen">${m.revenue.toFixed(2)}</span> },
                { header: "Payments Count", accessorKey: "invoicesCount", align: "right", render: (m) => <span className="font-mono">{m.invoicesCount}</span> },
              ]}
              data={revenueByMonth}
              keyExtractor={(m) => m.month}
            />
          </div>

          {/* Payment Methods */}
          <div className="bg-white border-2 border-black rounded-[14px] p-6 shadow-neo space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-black pb-3">
              <CreditCard className="w-5 h-5 text-black" />
              <h2 className="font-heading font-black text-xl">Settlement Channels</h2>
            </div>
            <NeoTable
              columns={[
                { header: "Payment Channel", accessorKey: "method", render: (pm) => <span className="font-mono font-bold uppercase">{pm.method.replace("_", " ")}</span> },
                { header: "Total Settled", accessorKey: "totalAmount", align: "right", render: (pm) => <span className="font-mono font-bold">${pm.totalAmount.toFixed(2)}</span> },
                { header: "Transactions", accessorKey: "transactionCount", align: "right", render: (pm) => <span className="font-mono">{pm.transactionCount}</span> },
              ]}
              data={paymentMethods}
              keyExtractor={(pm) => pm.method}
            />
          </div>

          {/* Revenue by Product */}
          <div className="bg-white border-2 border-black rounded-[14px] p-6 shadow-neo space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-black pb-3">
              <Layers className="w-5 h-5 text-black" />
              <h2 className="font-heading font-black text-xl">Product Invoiced Volume</h2>
            </div>
            <NeoTable
              columns={[
                { header: "Product / Catalog Item", accessorKey: "productName", render: (p) => <span className="font-bold">{p.productName}</span> },
                { header: "Total Invoiced", accessorKey: "totalRevenue", align: "right", render: (p) => <span className="font-mono font-bold">${p.totalRevenue.toFixed(2)}</span> },
                { header: "Units", accessorKey: "quantitySold", align: "right", render: (p) => <span className="font-mono">{p.quantitySold}</span> },
              ]}
              data={revenueByProduct}
              keyExtractor={(p) => p.productName}
            />
          </div>

          {/* Revenue by Plan */}
          <div className="bg-white border-2 border-black rounded-[14px] p-6 shadow-neo space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-black pb-3">
              <TrendingUp className="w-5 h-5 text-black" />
              <h2 className="font-heading font-black text-xl">Plan MRR Breakdown</h2>
            </div>
            <NeoTable
              columns={[
                { header: "Subscription Tier", accessorKey: "planName", render: (pl) => <span className="font-bold">{pl.planName}</span> },
                { header: "Active Contracts", accessorKey: "activeContracts", align: "center", render: (pl) => <span className="font-mono font-bold">{pl.activeContracts}</span> },
                { header: "Estimated MRR", accessorKey: "estimatedMrr", align: "right", render: (pl) => <span className="font-mono font-bold text-statusGreen">${pl.estimatedMrr.toFixed(2)}</span> },
              ]}
              data={revenueByPlan}
              keyExtractor={(pl) => pl.planName}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

