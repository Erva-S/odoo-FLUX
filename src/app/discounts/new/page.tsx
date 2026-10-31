"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { NeoCard } from "@/components/ui/NeoCard";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoInput } from "@/components/ui/NeoInput";
import { dataStore } from "@/lib/data/store";
import { useToast } from "@/components/ui/ToastContext";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function NewDiscountPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [minPurchase, setMinPurchase] = useState("0");
  const [usageLimit, setUsageLimit] = useState("100");
  const [appliesTo, setAppliesTo] = useState<"whole_subscription" | "specific_products">("whole_subscription");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valNum = parseFloat(value);
    if (isNaN(valNum) || valNum <= 0) {
      error("Discount value must be greater than zero.");
      return;
    }

    const newDisc = {
      id: `disc-${Date.now()}`,
      code: code.toUpperCase().trim(),
      name,
      type,
      value: valNum,
      minPurchase: parseFloat(minPurchase) || 0,
      minQuantity: 1,
      usageLimit: parseInt(usageLimit) || undefined,
      timesUsed: 0,
      appliesTo,
      isActive: true,
    };

    dataStore.discounts.push(newDisc);
    success(`Discount code "${newDisc.code}" created successfully!`);
    router.push("/discounts");
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 border-b-2 border-black pb-4">
          <Link
            href="/discounts"
            className="p-2 border-2 border-black rounded-[8px] bg-white shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-heading font-black tracking-tight text-neoBlack">
              New Promotional Discount
            </h1>
            <p className="text-xs text-neutral-600 font-bold">
              Admin only: define percentage or fixed credits with usage caps.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border-2 border-black rounded-[14px] p-6 shadow-neo-lg space-y-4">
          <NeoInput
            label="Promo Code"
            placeholder="e.g. FLASH20"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          <NeoInput
            label="Display Name"
            placeholder="e.g. Q4 Growth Acceleration Credit"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 text-left">
              <label className="block text-sm font-bold text-neoBlack">Discount Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-white border-2 border-black rounded-[8px] px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Dollar ($)</option>
              </select>
            </div>

            <NeoInput
              label={type === "percentage" ? "Rate (%)" : "Amount ($)"}
              type="number"
              step="0.01"
              placeholder={type === "percentage" ? "15" : "100.00"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NeoInput
              label="Minimum Purchase ($)"
              type="number"
              step="0.01"
              value={minPurchase}
              onChange={(e) => setMinPurchase(e.target.value)}
            />

            <NeoInput
              label="Usage Limit"
              type="number"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t-2 border-neoDivider">
            <Link href="/discounts">
              <NeoButton type="button" variant="secondary">
                Cancel
              </NeoButton>
            </Link>
            <NeoButton type="submit" variant="primary" icon={<CheckCircle2 className="w-4 h-4" />}>
              Save Discount Code
            </NeoButton>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

