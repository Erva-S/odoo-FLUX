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
import { ArrowLeft, Plus, Trash2, CheckCircle2, Sparkles, Building, Layers } from "lucide-react";

export default function NewSubscriptionPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [selectedCustomerId, setSelectedCustomerId] = useState(dataStore.customers[0]?.id || "");
  const [selectedPlanId, setSelectedPlanId] = useState(dataStore.plans[0]?.id || "");
  const [selectedDiscountId, setSelectedDiscountId] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Net 30");

  // Editable lines
  const [lines, setLines] = useState<
    { productId: string; variantId?: string; quantity: number }[]
  >([
    {
      productId: dataStore.products[0]?.id || "prod-1",
      variantId: "var-odoo", // Pre-selected Odoo brand variant (+560)
      quantity: 1,
    },
  ]);

  // Load template helper
  const handleApplyTemplate = (tmplId: string) => {
    const tmpl = dataStore.templates.find((t) => t.id === tmplId);
    if (!tmpl) return;
    setSelectedPlanId(tmpl.planId);
    setLines(tmpl.lines.map((l) => ({ ...l })));
    success(`Applied template: ${tmpl.name}`);
  };

  // Calculations
  let subtotal = 0;
  const calculatedLines = lines.map((l) => {
    const prod = dataStore.products.find((p) => p.id === l.productId) || dataStore.products[0];
    let unitPrice = prod ? prod.salesPrice : 0;
    let extra = 0;
    if (l.variantId && prod) {
      const v = prod.variants.find((vr) => vr.id === l.variantId);
      if (v) extra = v.priceExtra;
    }
    const finalUnitPrice = unitPrice + extra;
    const amount = finalUnitPrice * l.quantity;
    subtotal += amount;

    return {
      product: prod,
      finalUnitPrice,
      amount,
    };
  });

  let discountAmount = 0;
  if (selectedDiscountId) {
    const disc = dataStore.discounts.find((d) => d.id === selectedDiscountId);
    if (disc) {
      discountAmount =
        disc.type === "percentage"
          ? Math.round(subtotal * (disc.value / 100) * 100) / 100
          : disc.value;
    }
  }

  const taxableBase = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxableBase * 0.1 * 100) / 100;
  const totalAmount = taxableBase + taxAmount;

  const handleAddLine = () => {
    setLines([
      ...lines,
      {
        productId: dataStore.products[0]?.id || "prod-1",
        quantity: 1,
      },
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    if (lines.length === 1) return;
    setLines(lines.filter((_, i) => i !== idx));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedPlanId || lines.length === 0) {
      error("Please configure customer, plan, and at least one line item.");
      return;
    }

    const sub = dataStore.createSubscription({
      customerId: selectedCustomerId,
      planId: selectedPlanId,
      paymentTerms,
      discountId: selectedDiscountId || undefined,
      lines,
    });

    success(`Subscription ${sub.subscriptionNumber} created successfully!`);
    router.push(`/subscriptions/${sub.id}`);
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <Link href="/subscriptions" className="p-2 border-2 border-black rounded-[8px] bg-white shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-heading font-black tracking-tight text-neoBlack">
              New Subscription / Quotation
            </h1>
            <p className="text-xs text-neutral-600 font-bold">
              Build from scratch or choose a preset quotation template.
            </p>
          </div>
        </div>

        {/* Template Quick Select */}
        <div className="bg-neoYellow border-2 border-black rounded-[14px] p-5 shadow-neo space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-black" />
            <h2 className="font-heading font-black text-lg">Use Quotation Template</h2>
          </div>
          <p className="text-xs text-neutral-800 font-medium">
            Quotation templates prefill plan terms, products, and variant lines so reps never start from scratch.
          </p>
          <div className="flex flex-wrap gap-3">
            {dataStore.templates.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => handleApplyTemplate(tmpl.id)}
                className="bg-white border-2 border-black rounded-[8px] px-3.5 py-2 text-xs font-bold shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
              >
                {tmpl.name} ({tmpl.validityDays} days validity)
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleCreate} className="space-y-6">
          {/* Section: Customer & Plan Details */}
          <div className="bg-white border-2 border-black rounded-[14px] p-6 shadow-neo grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5 text-left">
              <label className="block text-sm font-bold text-neoBlack">Customer / Account</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-white border-2 border-black rounded-[8px] px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black"
                required
              >
                {dataStore.customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName || c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-sm font-bold text-neoBlack">Subscription Plan</label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full bg-white border-2 border-black rounded-[8px] px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black"
                required
              >
                {dataStore.plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ${p.price.toFixed(2)} / {p.billingPeriod}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-sm font-bold text-neoBlack">Payment Terms</label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full bg-white border-2 border-black rounded-[8px] px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="Immediate">Immediate upon receipt</option>
                <option value="Net 15">Net 15 Days</option>
                <option value="Net 30">Net 30 Days</option>
                <option value="Net 60">Net 60 Days</option>
              </select>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-sm font-bold text-neoBlack">Promotional Discount</label>
              <select
                value={selectedDiscountId}
                onChange={(e) => setSelectedDiscountId(e.target.value)}
                className="w-full bg-white border-2 border-black rounded-[8px] px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">None (Standard Rate)</option>
                {dataStore.discounts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} — {d.name} ({d.type === "percentage" ? `${d.value}% off` : `$${d.value} fixed`})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section: Subscription Line Items */}
          <div className="bg-white border-2 border-black rounded-[14px] p-6 shadow-neo space-y-4">
            <div className="flex items-center justify-between border-b-2 border-neoDivider pb-3">
              <h3 className="font-heading font-black text-xl">Line Items</h3>
              <NeoButton
                type="button"
                variant="secondary"
                size="compact"
                onClick={handleAddLine}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Line Item
              </NeoButton>
            </div>

            <div className="space-y-3">
              {lines.map((line, idx) => {
                const prod = dataStore.products.find((p) => p.id === line.productId);
                const calc = calculatedLines[idx];

                return (
                  <div
                    key={idx}
                    className="p-4 bg-neoCanvas border-2 border-black rounded-[10px] grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
                  >
                    {/* Product */}
                    <div className="sm:col-span-4 space-y-1">
                      <label className="text-xs font-bold text-neutral-700">Product</label>
                      <select
                        value={line.productId}
                        onChange={(e) => {
                          const newProductId = e.target.value;
                          setLines(
                            lines.map((l, i) =>
                              i === idx
                                ? { ...l, productId: newProductId, variantId: undefined }
                                : l
                            )
                          );
                        }}
                        className="w-full bg-white border-2 border-black rounded-[8px] p-2 text-xs font-bold"
                      >
                        {dataStore.products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (${p.salesPrice})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Variant (e.g. Brand = Odoo +560) */}
                    <div className="sm:col-span-4 space-y-1">
                      <label className="text-xs font-bold text-neutral-700">
                        Attribute Variant (Addon)
                      </label>
                      <select
                        value={line.variantId || ""}
                        onChange={(e) => {
                          const newVarId = e.target.value || undefined;
                          setLines(
                            lines.map((l, i) =>
                              i === idx ? { ...l, variantId: newVarId } : l
                            )
                          );
                        }}
                        className="w-full bg-white border-2 border-black rounded-[8px] p-2 text-xs font-bold"
                      >
                        <option value="">Base Configuration (+$0)</option>
                        {prod?.variants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.attributeName}: {v.attributeValue} (+${v.priceExtra})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-neutral-700">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setLines(lines.map((l, i) => (i === idx ? { ...l, quantity: val } : l)));
                        }}
                        className="w-full bg-white border-2 border-black rounded-[8px] p-2 text-xs font-bold tnum"
                      />
                    </div>

                    {/* Total & Delete */}
                    <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-3">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-neutral-500 block">Total</span>
                        <span className="font-mono font-bold text-sm">
                          ${calc?.amount.toFixed(2)}
                        </span>
                      </div>
                      {lines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="p-1.5 text-statusRed hover:bg-red-50 rounded border border-black"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calculations Summary */}
            <div className="border-t-2 border-neoDivider pt-4 flex flex-col items-end space-y-1.5 text-sm">
              <div className="flex justify-between w-64 text-neutral-600">
                <span>Subtotal:</span>
                <span className="font-mono font-bold">${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between w-64 text-statusGreen font-bold">
                  <span>Discount Applied:</span>
                  <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between w-64 text-neutral-600">
                <span>Standard VAT (10%):</span>
                <span className="font-mono font-bold">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-64 text-base font-extrabold text-black border-t-2 border-black pt-2">
                <span>Total Amount:</span>
                <span className="font-mono font-black">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link href="/subscriptions">
              <NeoButton type="button" variant="secondary">
                Cancel
              </NeoButton>
            </Link>
            <NeoButton type="submit" variant="primary" icon={<CheckCircle2 className="w-4 h-4" />}>
              Create Subscription Quotation
            </NeoButton>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

