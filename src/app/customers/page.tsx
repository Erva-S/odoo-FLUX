"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { NeoTable } from "@/components/ui/NeoTable";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoBadge } from "@/components/ui/NeoBadge";
import { dataStore } from "@/lib/data/store";
import { Profile } from "@/lib/data/types";
import { Users, Search, Building, Phone, Mail, ArrowRight } from "lucide-react";

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = useMemo(() => {
    return dataStore.customers.filter((c) => {
      return (
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.companyName && c.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  }, [searchTerm]);

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-neoBlack">
              Customer Accounts
            </h1>
            <p className="text-sm font-body font-bold text-neutral-600 mt-0.5">
              Direct clients, billing addresses, and linked subscriptions.
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white border-2 border-black rounded-[12px] p-4 shadow-neo flex flex-wrap items-center justify-between gap-4">
          <div className="relative min-w-[260px] flex-1 max-w-md">
            <Search className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customers or company names..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neoCanvas border-2 border-black rounded-[8px] pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="text-xs font-mono font-bold text-neutral-600 bg-neoCanvas px-3 py-1.5 rounded-[6px] border border-black/30">
            {filteredCustomers.length} CUSTOMER ENTITIES
          </div>
        </div>

        {/* Customers Table */}
        <NeoTable
          columns={[
            {
              header: "Company / Organization",
              accessorKey: "companyName",
              render: (c) => (
                <div>
                  <span className="font-bold block text-sm">{c.companyName || c.name}</span>
                  <span className="text-xs text-neutral-600">{c.billingAddress}</span>
                </div>
              ),
            },
            {
              header: "Primary Contact",
              accessorKey: "name",
              render: (c) => (
                <div>
                  <span className="font-bold block">{c.name}</span>
                  <span className="text-[11px] font-mono text-neutral-600">{c.email}</span>
                </div>
              ),
            },
            {
              header: "Phone",
              accessorKey: "phone",
              render: (c) => <span className="font-mono text-xs">{c.phone || "—"}</span>,
            },
            {
              header: "Active Subscriptions",
              render: (c) => {
                const subCount = dataStore.subscriptions.filter(
                  (s) => s.customerId === c.id && s.status === "active"
                ).length;
                return (
                  <span className="font-mono font-bold text-xs bg-neoYellow px-2 py-0.5 rounded border border-black">
                    {subCount} ACTIVE
                  </span>
                );
              },
            },
            {
              header: "Action",
              align: "right",
              render: (c) => (
                <Link href={`/subscriptions?search=${encodeURIComponent(c.companyName || c.name)}`}>
                  <NeoButton size="compact" variant="secondary" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                    View Subscriptions
                  </NeoButton>
                </Link>
              ),
            },
          ]}
          data={filteredCustomers}
          keyExtractor={(c) => c.id}
        />
      </div>
    </AppShell>
  );
}

