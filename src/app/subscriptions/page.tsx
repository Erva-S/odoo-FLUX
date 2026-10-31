"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { NeoTable } from "@/components/ui/NeoTable";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoBadge } from "@/components/ui/NeoBadge";
import { dataStore } from "@/lib/data/store";
import { Subscription } from "@/lib/data/types";
import { Plus, Search, Filter, ArrowRight, FileText } from "lucide-react";

export default function SubscriptionsListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Filter subscriptions
  const filteredSubscriptions = useMemo(() => {
    return dataStore.subscriptions.filter((sub) => {
      const matchesSearch =
        sub.subscriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.planName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ? true : sub.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  // Server-side style pagination
  const totalPages = Math.ceil(filteredSubscriptions.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSubscriptions.slice(start, start + pageSize);
  }, [filteredSubscriptions, page]);

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-neoBlack">
              Subscriptions
            </h1>
            <p className="text-sm font-body font-bold text-neutral-600 mt-0.5">
              Active contracts, quotation pipelines, and renewals lifecycle.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/subscriptions/new">
              <NeoButton variant="primary" size="compact" icon={<Plus className="w-4 h-4" />}>
                Create Subscription
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
                placeholder="Search SUB-0001, customer..."
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
              {["all", "draft", "quotation", "confirmed", "active", "closed"].map((st) => (
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
            {filteredSubscriptions.length} TOTAL RECORDS
          </div>
        </div>

        {/* Subscriptions Table */}
        <NeoTable
          columns={[
            {
              header: "Subscription #",
              accessorKey: "subscriptionNumber",
              render: (sub) => (
                <Link
                  href={`/subscriptions/${sub.id}`}
                  className="font-mono font-bold underline hover:text-neutral-700"
                >
                  {sub.subscriptionNumber}
                </Link>
              ),
            },
            {
              header: "Customer",
              accessorKey: "customerName",
              render: (sub) => (
                <div>
                  <span className="font-bold block">{sub.customerName}</span>
                  <span className="text-[11px] text-neutral-600">{sub.customerEmail}</span>
                </div>
              ),
            },
            {
              header: "Plan",
              accessorKey: "planName",
              render: (sub) => <span className="font-bold">{sub.planName}</span>,
            },
            {
              header: "Status",
              render: (sub) => <NeoBadge status={sub.status} />,
            },
            {
              header: "Start Date",
              accessorKey: "startDate",
              render: (sub) => <span className="font-mono text-xs">{sub.startDate}</span>,
            },
            {
              header: "Amount",
              accessorKey: "totalAmount",
              align: "right",
              render: (sub) => (
                <span className="font-bold font-mono">
                  ${sub.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              ),
            },
            {
              header: "Action",
              align: "right",
              render: (sub) => (
                <Link href={`/subscriptions/${sub.id}`}>
                  <NeoButton size="compact" variant="secondary" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Manage
                  </NeoButton>
                </Link>
              ),
            },
          ]}
          data={paginatedData}
          keyExtractor={(sub) => sub.id}
          emptyState={
            <div className="py-12 text-center space-y-4">
              <p className="text-base font-bold text-neutral-700">
                No subscriptions match your query.
              </p>
              <Link href="/subscriptions/new">
                <NeoButton variant="primary">Create your first subscription</NeoButton>
              </Link>
            </div>
          }
        />

        {/* Pagination controls */}
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

