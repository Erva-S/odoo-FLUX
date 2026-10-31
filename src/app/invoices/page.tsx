"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { NeoTable } from "@/components/ui/NeoTable";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoBadge } from "@/components/ui/NeoBadge";
import { dataStore } from "@/lib/data/store";
import { Invoice } from "@/lib/data/types";
import { FileText, Search, Plus, ArrowRight, Printer, AlertCircle } from "lucide-react";

function InvoicesContent() {
  const searchParams = useSearchParams();
  const initialSub = searchParams.get("sub") || "";

  const [searchTerm, setSearchTerm] = useState(initialSub);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const filteredInvoices = useMemo(() => {
    const now = new Date();
    return dataStore.invoices.filter((inv) => {
      const matchesSearch =
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.subscriptionNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const isOverdue = new Date(inv.dueDate) < now && inv.status !== "paid";
      let matchesStatus = true;
      if (statusFilter === "overdue") {
        matchesStatus = isOverdue;
      } else if (statusFilter !== "all") {
        matchesStatus = inv.status.toLowerCase() === statusFilter.toLowerCase();
      }

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredInvoices.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredInvoices.slice(start, start + pageSize);
  }, [filteredInvoices, page]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-neoBlack">
            Invoices
          </h1>
          <p className="text-sm font-body font-bold text-neutral-600 mt-0.5">
            Automated billing ledger, payment statuses, and tax breakdown.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/invoices/generate">
            <NeoButton variant="primary" size="compact" icon={<FileText className="w-4 h-4" />}>
              Run Automated Billing
            </NeoButton>
          </Link>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white border-2 border-black rounded-[12px] p-4 shadow-neo flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search INV-2026-..., customer..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full bg-neoCanvas border-2 border-black rounded-[8px] pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Status pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {["all", "confirmed", "paid", "draft", "overdue", "cancelled"].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`px-3 py-1 text-xs font-bold rounded-full border-2 border-black transition-colors ${
                  statusFilter === st
                    ? "bg-neoYellow text-black font-extrabold shadow-[2px_2px_0_0_#000]"
                    : "bg-white text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {st.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs font-mono font-bold text-neutral-600 bg-neoCanvas px-3 py-1.5 rounded-[6px] border border-black/30">
          {filteredInvoices.length} INVOICES FOUND
        </div>
      </div>

      {/* Invoices Table */}
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
            header: "Subscription",
            accessorKey: "subscriptionNumber",
            render: (inv) => (
              <Link
                href={`/subscriptions/${inv.subscriptionId}`}
                className="font-mono text-xs hover:underline text-neutral-800"
              >
                {inv.subscriptionNumber}
              </Link>
            ),
          },
          {
            header: "Due Date",
            accessorKey: "dueDate",
            render: (inv) => {
              const isPast = new Date(inv.dueDate) < new Date() && inv.status !== "paid";
              return (
                <span className={`font-mono text-xs ${isPast ? "font-bold text-statusRed" : "text-neutral-700"}`}>
                  {inv.dueDate} {isPast && "(!)"}
                </span>
              );
            },
          },
          {
            header: "Total",
            accessorKey: "totalAmount",
            align: "right",
            render: (inv) => (
              <span className="font-bold font-mono">
                ${inv.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            ),
          },
          {
            header: "Status",
            render: (inv) => {
              const isPast = new Date(inv.dueDate) < new Date() && inv.status !== "paid";
              return <NeoBadge status={isPast ? "overdue" : inv.status} />;
            },
          },
          {
            header: "Action",
            align: "right",
            render: (inv) => (
              <Link href={`/invoices/${inv.id}`}>
                <NeoButton size="compact" variant="secondary" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                  View
                </NeoButton>
              </Link>
            ),
          },
        ]}
        data={paginatedData}
        keyExtractor={(inv) => inv.id}
        emptyState={
          <div className="py-12 text-center space-y-4">
            <p className="text-base font-bold text-neutral-700">No invoices match your query.</p>
            <Link href="/invoices/generate">
              <NeoButton variant="primary">Generate from active subscriptions</NeoButton>
            </Link>
          </div>
        }
      />

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
              onClick={() => setPage(page - 1)}
            >
              Previous
            </NeoButton>
            <NeoButton
              size="compact"
              variant="secondary"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </NeoButton>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InvoicesListPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="py-20 text-center">
            <div className="h-8 w-48 bg-neoCanvas border-2 border-black/30 rounded mx-auto animate-pulse" />
          </div>
        }
      >
        <InvoicesContent />
      </Suspense>
    </AppShell>
  );
}
