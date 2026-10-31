"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoInput } from "@/components/ui/NeoInput";
import { Product, Plan, Profile } from "@/lib/data/types";
import { useToast } from "@/components/ui/ToastContext";
import { ArrowLeft, Plus, Trash2, CheckCircle2, Sparkles, Building, Layers, Loader2 } from "lucide-react";
import { getCustomersAction } from "@/app/actions/customers";
import { getProductsAction, getPlansAction } from "@/app/actions/catalog";
import { createSubscriptionAction } from "@/app/actions/subscriptions";

export default function NewSubscriptionPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [customers, setCustomers] = useState<Profile[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Net 30");

  // Editable lines
  const [lines, setLines] = useState<
    { productId: string; variantId?: string; quantity: number }[]
  >([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingInitial(true);
        const [custRes, planRes, prodRes] = await Promise.all([
          getCustomersAction({ pageSize: 100 }),
          getPlansAction(),
          getProductsAction(),
        ]);

        if (custRes.success && custRes.data?.customers) {
          setCustomers(custRes.data.customers);
          if (custRes.data.customers.length > 0) {
            setSelectedCustomerId(custRes.data.customers[0].id);
          }
        }

        if (planRes.success && planRes.data) {
          setPlans(planRes.data);
          if (planRes.data.length > 0) {
            setSelectedPlanId(planRes.data[0].id);
          }
        }

        if (prodRes.success && prodRes.data) {
          setProducts(prodRes.data);
          if (prodRes.data.length > 0) {
            const firstProd = prodRes.data[0];
            const odooVar = firstProd.variants.find((v) => v.attributeValue === "Odoo");
            setLines([
              {
                productId: firstProd.id,
                variantId: odooVar ? odooVar.id : firstProd.variants[0]?.id,
                quantity: 1,
              },
            ]);
          }
        }
      } catch {
        setCustomers([]);
        setProducts([]);
      } finally {
        setLoadingInitial(false);
      }
    }
    loadData();
  }, []);

  // Calculations
  let subtotal = 0;
  const calculatedLines = lines.map((l) => {
    const prod = products.find((p) => p.id === l.productId) || products[0];
    let unitPrice = prod ? prod.salesPrice : 0;
    let extra = 0;
    if (l.variantId && prod) {
      const v = prod.variants.find((vr) => vr.id === l.variantId);
      if (v) extra = v.priceExtra;
    }
    const finalUnitPrice = unitPrice + extra;
    const amount = finalUnitPrice * (l.quantity || 1);
    subtotal += amount;

    return {
      product: prod,
      finalUnitPrice,
      amount,
    };
  });

  const taxAmount = Math.round(subtotal * 0.1 * 100) / 100;
  const totalAmount = subtotal + taxAmount;

  const handleAddLine = () => {
    if (products.length === 0) return;
    setLines([
      ...lines,
      {
        productId: products[0].id,
        quantity: 1,
      },
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    if (lines.length === 1) return;
    setLines(lines.filter((_, i) => i !== idx));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedPlanId || lines.length === 0) {
      error("Please configure customer, plan, and at least one line item.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await createSubscriptionAction({
        customerId: selectedCustomerId,
        planId: selectedPlanId,
        paymentTerms,
        lines: lines.map((l) => ({
          productId: l.productId,
          variantId: l.variantId,
          quantity: Number(l.quantity) || 1,
        })),
      });

      if (!res.success || !res.data) {
        error(res.error || "Failed to create subscription in PostgreSQL.");
        return;
      }

      success(`Subscription ${res.data.subscriptionNumber} created successfully in draft stage.`);
      router.push(`/subscriptions/${res.data.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating subscription";
      error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <AppShell>
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-statusBlue" />
          <p className="text-xs font-mono font-bold text-neutral-600 uppercase">
            Loading Catalog & Customer Profiles from PostgreSQL...
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 border-b-2 border-black pb-4">
          <Link
            href="/subscriptions"
            className="p-2 border-2 border-black rounded-[8px] bg-white shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-heading font-black tracking-tight text-neoBlack">
              New Subscription Contract
            </h1>
            <p className="text-xs text-neutral-600 font-bold">
              Build a recurring contract with Phase 3A PostgreSQL catalog & attribute variants.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="space-y-6">
          {/* Main Attributes */}
          <div className="bg-white border-2 border-black rounded-[14px] p-6 shadow-neo grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Customer selector */}
            <div className="space-y-1.5 text-left">
              <label className="block text-sm font-bold text-neoBlack">
                Customer Account <span className="text-statusRed">*</span>
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-neoCanvas border-2 border-black rounded-[8px] p-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-black"
                required
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName || c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Plan selector */}
            <div className="space-y-1.5 text-left">
              <label className="block text-sm font-bold text-neoBlack">
                Recurring Plan <span className="text-statusRed">*</span>
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full bg-neoCanvas border-2 border-black rounded-[8px] p-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-black"
                required
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ${p.price}/{p.billingPeriod}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment terms */}
            <div className="space-y-1.5 text-left">
              <label className="block text-sm font-bold text-neoBlack">Payment Terms</label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full bg-neoCanvas border-2 border-black rounded-[8px] p-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="Immediate">Immediate on Invoice</option>
                <option value="Net 15">Net 15 Days</option>
                <option value="Net 30">Net 30 Days</option>
                <option value="Net 60">Net 60 Days</option>
              </select>
            </div>
          </div>

          {/* Line items section */}
          <div className="bg-white border-2 border-black rounded-[14px] p-6 shadow-neo space-y-4">
            <div className="flex items-center justify-between border-b-2 border-neoDivider pb-3">
              <div>
                <h3 className="font-heading font-black text-xl">Order Line Items</h3>
                <p className="text-xs text-neutral-600">
                  Select software products and attribute variants (e.g. Odoo brand adds +$560.00).
                </p>
              </div>
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
              {lines.map((l, idx) => {
                const prod = products.find((p) => p.id === l.productId) || products[0];
                const calc = calculatedLines[idx];

                return (
                  <div
                    key={idx}
                    className="p-3 bg-neoCanvas border-2 border-black rounded-[8px] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                  >
                    {/* Product */}
                    <div className="sm:col-span-5">
                      <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">
                        Product
                      </label>
                      <select
                        value={l.productId}
                        onChange={(e) => {
                          const newProdId = e.target.value;
                          const targetProd = products.find((p) => p.id === newProdId);
                          setLines(
                            lines.map((item, i) =>
                              i === idx
                                ? {
                                    ...item,
                                    productId: newProdId,
                                    variantId: targetProd?.variants[0]?.id || undefined,
                                  }
                                : item
                            )
                          );
                        }}
                        className="w-full bg-white border-2 border-black rounded-[6px] p-2 text-xs font-bold"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (${p.salesPrice.toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Variant */}
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">
                        Variant / Addon
                      </label>
                      <select
                        value={l.variantId || ""}
                        onChange={(e) => {
                          const vId = e.target.value || undefined;
                          setLines(
                            lines.map((item, i) =>
                              i === idx ? { ...item, variantId: vId } : item
                            )
                          );
                        }}
                        className="w-full bg-white border-2 border-black rounded-[6px] p-2 text-xs font-bold"
                      >
                        <option value="">Base Product (+$0.00)</option>
                        {prod?.variants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.attributeName}: {v.attributeValue} (+${v.priceExtra.toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Qty */}
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">
                        Qty
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={l.quantity}
                        onChange={(e) => {
                          const q = parseInt(e.target.value) || 1;
                          setLines(
                            lines.map((item, i) => (i === idx ? { ...item, quantity: q } : item))
                          );
                        }}
                        className="w-full bg-white border-2 border-black rounded-[6px] p-2 text-xs font-bold text-center"
                      />
                    </div>

                    {/* Amount */}
                    <div className="sm:col-span-1 text-right">
                      <label className="block text-[10px] uppercase font-bold text-neutral-500 mb-1">
                        Amount
                      </label>
                      <span className="font-mono font-bold text-xs block pt-1.5">
                        ${calc ? calc.amount.toFixed(2) : "0.00"}
                      </span>
                    </div>

                    {/* Remove */}
                    <div className="sm:col-span-1 text-right pt-4 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(idx)}
                        disabled={lines.length === 1}
                        className="p-1.5 text-statusRed hover:bg-red-50 rounded border border-black disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Remove line"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totals Box */}
            <div className="pt-4 border-t-2 border-black flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-xs text-neutral-600 font-medium">
                Standard 10% VAT computed automatically upon submission.
              </div>

              <div className="w-full sm:w-72 bg-neoCanvas border-2 border-black rounded-[8px] p-3 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Subtotal:</span>
                  <span className="font-mono font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Tax (10% VAT):</span>
                  <span className="font-mono font-bold">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t-2 border-black pt-1 font-black text-sm">
                  <span>Grand Total:</span>
                  <span className="font-mono font-black">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit bar */}
          <div className="flex justify-end gap-3">
            <Link href="/subscriptions">
              <NeoButton type="button" variant="secondary" disabled={submitting}>
                Cancel
              </NeoButton>
            </Link>
            <NeoButton
              type="submit"
              variant="primary"
              disabled={submitting}
              icon={submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            >
              {submitting ? "Saving to PostgreSQL..." : "Save Draft Contract"}
            </NeoButton>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
