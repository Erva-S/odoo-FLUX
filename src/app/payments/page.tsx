"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { NeoTable } from "@/components/ui/NeoTable";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoBadge } from "@/components/ui/NeoBadge";
import { dataStore } from "@/lib/data/store";
import { Payment } from "@/lib/data/types";
import { CreditCard, Search, ArrowRight, DollarSign } from "lucide-react";

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const filteredPayments = useMemo(() => {
    return dataStore.payments.filter((pay) => {
      return (
        pay.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pay.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pay.method.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredPayments.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPayments.slice(start, start + pageSize);
  }, [filteredPayments, page]);

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
        </div>

        {/* Filter bar */}
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

          <div className="text-xs font-mono font-bold text-neutral-600 bg-neoCanvas px-3 py-1.5 rounded-[6px] border border-black/30">
            {filteredPayments.length} PAYMENTS RECORDED
          </div>
        </div>

        {/* Payments Table */}
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
          data={paginatedData}
          keyExtractor={(pay) => pay.id}
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
    </AppShell>
  );
}

