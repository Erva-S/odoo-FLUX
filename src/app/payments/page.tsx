"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { NeoTable } from "@/components/ui/NeoTable";
import { NeoButton } from "@/components/ui/NeoButton";
import { Payment } from "@/lib/data/types";
import { fetchPaymentsAction } from "@/app/actions/payments";
import { Search, Loader2, RefreshCw } from "lucide-react";

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 15;

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchPaymentsAction({
        search: searchTerm,
        page,
        pageSize,
      });
      setPayments(res.payments);
      setTotalCount(res.totalCount);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error("Failed to load payments from PostgreSQL:", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, page, pageSize]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const totalSettled = payments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-neoBlack">
              Payment Transactions
            </h1>
            <p className="text-sm font-body font-bold text-neutral-600 mt-0.5">
              Reconciled payments, wire settlements, and partial installments ledger.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadPayments()}
              className="p-2 border-2 border-black rounded-[8px] bg-white shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5"
              title="Refresh database"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Filter bar & Summary Cards */}
        <div className="bg-white border-2 border-black rounded-[12px] p-4 shadow-neo flex flex-wrap items-center justify-between gap-4">
          <div className="relative min-w-[260px] flex-1 max-w-md">
            <Search className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by invoice, customer or method..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full bg-neoCanvas border-2 border-black rounded-[8px] pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs font-mono font-bold text-neutral-800 bg-neoSage px-3 py-1.5 rounded-[6px] border-2 border-black shadow-neo-sm">
              PAGE VOLUME: ${totalSettled.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs font-mono font-bold text-neutral-600 bg-neoCanvas px-3 py-1.5 rounded-[6px] border border-black/30">
              {totalCount} TRANSACTIONS
            </div>
          </div>
        </div>

        {/* Payments Table */}
        {loading ? (
          <div className="bg-white border-2 border-black rounded-[12px] p-12 text-center shadow-neo">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-black mb-3" />
            <p className="font-mono text-sm font-bold text-neutral-700">Loading payments ledger from PostgreSQL...</p>
          </div>
        ) : (
          <NeoTable
            columns={[
              {
                header: "Invoice Reference",
                accessorKey: "invoiceNumber",
                render: (pay) => (
                  <Link
                    href={`/invoices/${pay.invoiceId}`}
                    className="font-mono font-bold underline hover:text-neutral-700"
                  >
                    {pay.invoiceNumber}
                  </Link>
                ),
              },
              {
                header: "Customer",
                accessorKey: "customerName",
                render: (pay) => <span className="font-bold">{pay.customerName}</span>,
              },
              {
                header: "Payment Date",
                accessorKey: "paymentDate",
                render: (pay) => <span className="font-mono text-xs">{pay.paymentDate}</span>,
              },
              {
                header: "Method",
                accessorKey: "method",
                render: (pay) => (
                  <span className="font-mono text-xs uppercase bg-neoSage/50 px-2 py-0.5 rounded border border-black font-bold">
                    {pay.method.replace("_", " ")}
                  </span>
                ),
              },
              {
                header: "Settlement Note",
                accessorKey: "note",
                render: (pay) => (
                  <span className="text-xs text-neutral-600 truncate max-w-xs block">
                    {pay.note || "Standard settlement"}
                  </span>
                ),
              },
              {
                header: "Amount Paid",
                accessorKey: "amount",
                align: "right",
                render: (pay) => (
                  <span className="font-bold font-mono text-statusGreen">
                    ${pay.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                ),
              },
            ]}
            data={payments}
            keyExtractor={(pay) => pay.id}
            emptyState={
              <div className="py-12 text-center space-y-4">
                <p className="text-base font-bold text-neutral-700">No payment transactions match your query.</p>
              </div>
            }
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white border-2 border-black rounded-[10px] p-3 shadow-neo-sm">
            <span className="text-xs font-mono font-bold text-neutral-600">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <NeoButton
                size="compact"
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </NeoButton>
              <NeoButton
                size="compact"
                variant="secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </NeoButton>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
