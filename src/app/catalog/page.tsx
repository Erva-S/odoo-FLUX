"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { NeoCard } from "@/components/ui/NeoCard";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoBadge } from "@/components/ui/NeoBadge";
import { NeoInput } from "@/components/ui/NeoInput";
import { dataStore } from "@/lib/data/store";
import { Product, Plan } from "@/lib/data/types";
import { useToast } from "@/components/ui/ToastContext";
import { Box, Plus, Sparkles, Tag, Check, Layers, AlertCircle } from "lucide-react";

export default function CatalogPage() {
  const { success } = useToast();
  const [activeTab, setActiveTab] = useState<"products" | "plans">("products");

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-neoBlack">
              Catalog & Plans
            </h1>
            <p className="text-sm font-body font-bold text-neutral-600 mt-0.5">
              Admin management: recurring plans, software products, and attribute variants.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/catalog/new">
              <NeoButton variant="primary" size="compact" icon={<Plus className="w-4 h-4" />}>
                Add New Product / Variant
              </NeoButton>
            </Link>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-3 border-b-2 border-black pb-3">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 text-sm font-bold rounded-[8px] border-2 border-black transition-colors ${
              activeTab === "products"
                ? "bg-neoYellow text-black shadow-neo-sm font-black"
                : "bg-white text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            Products & Variants ({dataStore.products.length})
          </button>
          <button
            onClick={() => setActiveTab("plans")}
            className={`px-4 py-2 text-sm font-bold rounded-[8px] border-2 border-black transition-colors ${
              activeTab === "plans"
                ? "bg-neoYellow text-black shadow-neo-sm font-black"
                : "bg-white text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            Subscription Plans ({dataStore.plans.length})
          </button>
        </div>

        {activeTab === "products" ? (
          /* Products Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataStore.products.map((prod) => (
              <div
                key={prod.id}
                className="bg-white border-2 border-black rounded-[14px] p-6 shadow-neo flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono uppercase bg-neoSage px-2 py-0.5 rounded border border-black font-bold">
                      {prod.type}
                    </span>
                    <span className="font-heading font-black text-xl tnum">
                      ${prod.salesPrice.toFixed(2)}
                    </span>
                  </div>

                  <h3 className="font-heading font-black text-lg">{prod.name}</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">{prod.notes}</p>

                  <div className="pt-2 border-t-2 border-neoDivider">
                    <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block mb-2">
                      Attribute Variants & Addons
                    </span>
                    {prod.variants.length === 0 ? (
                      <p className="text-xs text-neutral-400 italic">No variants configured.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {prod.variants.map((v) => (
                          <div
                            key={v.id}
                            className="bg-neoCanvas border-2 border-black rounded-[6px] p-2 flex justify-between items-center text-xs"
                          >
                            <span className="font-bold">
                              {v.attributeName}: {v.attributeValue}
                            </span>
                            <span className="font-mono font-bold text-statusGreen">
                              +${v.priceExtra.toFixed(2)} (Total: ${(prod.salesPrice + v.priceExtra).toFixed(2)})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-neoDivider flex justify-between items-center text-xs">
                  <span className="text-neutral-500 font-medium">Cost Price: ${prod.costPrice.toFixed(2)}</span>
                  <span className="font-bold text-statusGreen">Active in Catalog</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Plans Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dataStore.plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white border-2 border-black rounded-[14px] p-6 shadow-neo flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono uppercase bg-neoYellow px-2 py-0.5 rounded border border-black font-bold">
                      {plan.billingPeriod}
                    </span>
                    <span className="font-mono text-xs text-neutral-500">Min: {plan.minimumQuantity}</span>
                  </div>

                  <h3 className="font-heading font-black text-xl">{plan.name}</h3>
                  <p className="text-xs text-neutral-600">{plan.description}</p>

                  <div className="pt-2">
                    <span className="font-heading font-black text-2xl tnum">
                      ${plan.price.toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-neutral-600 ml-1">/ {plan.billingPeriod}</span>
                  </div>

                  <div className="border-t-2 border-neoDivider pt-3 space-y-1.5 text-xs font-medium">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                      <span>Allow Pause: {plan.allowPause ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                      <span>Auto Renew: {plan.allowRenew ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                      <span>Allow Early Close: {plan.allowEarlyClose ? "Yes" : "No"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-neoDivider">
                  <span className="text-[10px] font-mono font-bold text-neutral-600 block text-center">
                    SCHEDULE ENGINE READY
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

