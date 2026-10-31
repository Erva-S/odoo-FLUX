"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { NeoTable } from "@/components/ui/NeoTable";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoBadge } from "@/components/ui/NeoBadge";
import { Subscription } from "@/lib/data/types";
import { useToast } from "@/components/ui/ToastContext";
import { Plus, Search, Filter, ArrowRight, FileText, Loader2, RefreshCw, Layers, Server } from "lucide-react";
import { getSubscriptionsAction } from "@/app/actions/subscriptions";

function SubscriptionsListContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const { error } = useToast();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSubscriptions = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const res = await getSubscriptionsAction({
          search: searchTerm,
          status: statusFilter,
          page,
          pageSize: 15,
        });

        if (res.success && res.data) {
          setSubscriptions(res.data.subscriptions);
          setTotal(res.data.total);
          setTotalPages(res.data.totalPages);
        } else {
          error(res.error || "Failed to load subscriptions from PostgreSQL.");
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Database load error";
        error(msg);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [searchTerm, statusFilter, page, error]
  );

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-neoBlack">
                Subscriptions
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-neoSage text-black border border-black shadow-neo-sm">
                <Server className="w-3 h-3 text-statusGreen" />
                Live PostgreSQL
              </span>
            </div>
            <p className="text-sm font-body font-bold text-neutral-600 mt-0.5">
              Active contracts, quotation pipelines, and renewals lifecycle engine.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadSubscriptions(true)}
              disabled={refreshing || loading}
              className="p-2.5 border-2 border-black rounded-[8px] bg-white shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-transform disabled:opacity-50"
              title="Refresh database records"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-statusBlue" : ""}`} />
            </button>
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
                  className={`px-3 py-1 text-xs font-bold rounded-full border-2 border-black transition-colors ${statusFilter === st
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
            {total} CONTRACT RECORDS
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="bg-white border-2 border-black rounded-[14px] p-12 shadow-neo text-center space-y-3">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-statusBlue" />
            <p className="text-xs font-mono font-bold text-neutral-600 uppercase">
              Fetching contracts from PostgreSQL...
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading && subscriptions.length === 0 && (
          <div className="bg-white border-2 border-black rounded-[14px] p-12 shadow-neo text-center space-y-4">
            <Layers className="w-12 h-12 mx-auto text-neutral-400 stroke-1" />
            <h3 className="font-heading font-black text-xl">No Subscriptions Found</h3>
            <p className="text-xs text-neutral-600 max-w-md mx-auto">
              No matching contracts were found in your PostgreSQL database for this search criteria.
            </p>
            <Link href="/subscriptions/new">
              <NeoButton variant="primary" icon={<Plus className="w-4 h-4" />}>
                Create New Subscription
              </NeoButton>
            </Link>
          </div>
        )}

        {/* Subscriptions Table */}
        {!loading && subscriptions.length > 0 && (
          <div className="space-y-4">
            <NeoTable
              columns={[
                {
                  header: "Subscription #",
                  accessorKey: "subscriptionNumber",
                  render: (s) => (
                    <Link
                      href={`/subscriptions/${s.id}`}
                      className="font-mono font-black text-sm text-statusBlue hover:underline flex items-center gap-1.5"
                    >
                      {s.subscriptionNumber}
                    </Link>
                  ),
                },
                {
                  header: "Customer",
                  accessorKey: "customerName",
                  render: (s) => (
                    <div>
                      <span className="font-bold text-sm block">{s.customerName}</span>
                      <span className="text-[11px] font-mono text-neutral-600">{s.customerEmail}</span>
                    </div>
                  ),
                },
                {
                  header: "Recurring Plan",
                  accessorKey: "planName",
                  render: (s) => (
                    <span className="text-xs font-bold bg-neoCanvas px-2.5 py-1 rounded border border-black/40">
                      {s.planName}
                    </span>
                  ),
                },
                {
                  header: "Status",
                  accessorKey: "status",
                  render: (s) => <NeoBadge status={s.status} />,
                },
                {
                  header: "Total",
                  accessorKey: "totalAmount",
                  align: "right",
                  render: (s) => (
                    <div className="text-right">
                      <span className="font-mono font-black text-sm block">
                        ${s.totalAmount.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">Tax incl.</span>
                    </div>
                  ),
                },
                {
                  header: "Start Date",
                  accessorKey: "startDate",
                  render: (s) => <span className="font-mono text-xs">{s.startDate}</span>,
                },
                {
                  header: "Action",
                  align: "right",
                  render: (s) => (
                    <Link href={`/subscriptions/${s.id}`}>
                      <NeoButton size="compact" variant="secondary" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                        Manage
                      </NeoButton>
                    </Link>
                  ),
                },
              ]}
              data={subscriptions}
              keyExtractor={(s) => s.id}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center bg-white border-2 border-black rounded-[10px] p-3 shadow-neo-sm">
                <span className="text-xs font-mono font-bold text-neutral-600">
                  Page {page} of {totalPages} ({total} total contracts)
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1 text-xs font-bold bg-white border-2 border-black rounded-[6px] shadow-neo-sm disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1 text-xs font-bold bg-white border-2 border-black rounded-[6px] shadow-neo-sm disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function SubscriptionsListPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-mono">Loading subscriptions...</div>}>
      <SubscriptionsListContent />
    </Suspense>
  );
}
