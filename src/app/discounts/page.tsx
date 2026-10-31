"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoBadge } from "@/components/ui/NeoBadge";
import { Discount } from "@/lib/data/types";
import { getDiscountsAction } from "@/app/actions/catalog";
import { Plus, Loader2 } from "lucide-react";

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDiscounts() {
      try {
        const res = await getDiscountsAction();
        if (res.success && res.data) {
          setDiscounts(res.data);
        }
      } catch (err) {
        console.error("Failed to load discounts from PostgreSQL:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDiscounts();
  }, []);

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-neoBlack">
              Discounts & Promotions
            </h1>
            <p className="text-sm font-body font-bold text-neutral-600 mt-0.5">
              Admin only: volume tiers, percentage coupons, and fixed subscription credits.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/discounts/new">
              <NeoButton variant="primary" size="compact" icon={<Plus className="w-4 h-4" />}>
                Create Discount Code
              </NeoButton>
            </Link>
          </div>
        </div>

        {/* Discounts Grid */}
        {loading ? (
          <div className="bg-white border-2 border-black rounded-[12px] p-12 text-center shadow-neo">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-black mb-3" />
            <p className="font-mono text-sm font-bold text-neutral-700">Loading discount tiers from PostgreSQL...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {discounts.map((disc) => (
              <div
                key={disc.id}
                className="bg-white border-2 border-black rounded-[14px] p-6 shadow-neo space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-sm font-black bg-neoYellow px-2.5 py-1 rounded border border-black inline-block">
                      {disc.code}
                    </span>
                    <h3 className="font-heading font-black text-xl mt-2">{disc.name}</h3>
                  </div>
                  <NeoBadge status={disc.isActive ? "active" : "closed"} label={disc.isActive ? "ACTIVE" : "EXPIRED"} />
                </div>

                <div className="grid grid-cols-2 gap-4 bg-neoCanvas border-2 border-black rounded-[8px] p-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-neutral-500">Value Rate</span>
                    <p className="font-heading font-black text-xl text-statusGreen mt-0.5">
                      {disc.type === "percentage" ? `${disc.value}% OFF` : `$${disc.value.toFixed(2)} OFF`}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-neutral-500">Scope</span>
                    <p className="font-bold text-black mt-0.5 uppercase">
                      {disc.appliesTo.replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-neutral-500">Min Purchase</span>
                    <p className="font-mono font-bold text-black mt-0.5">${disc.minPurchase.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-neutral-500">Usage Limit</span>
                    <p className="font-mono font-bold text-black mt-0.5">
                      {disc.timesUsed} / {disc.usageLimit || "∞"} used
                    </p>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 font-medium">
                  Applies automatically during invoice billing runs. Automatically halts when usage limit
                  ({disc.usageLimit || "∞"}) is reached.
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
