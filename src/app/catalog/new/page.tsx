"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoInput } from "@/components/ui/NeoInput";
import { useToast } from "@/components/ui/ToastContext";
import { ArrowLeft, Plus, CheckCircle2, Trash2, Loader2 } from "lucide-react";
import { createProductAction } from "@/app/actions/catalog";

export default function NewProductPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [name, setName] = useState("");
  const [salesPrice, setSalesPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Variants list
  const [variants, setVariants] = useState<
    { attributeName: string; attributeValue: string; priceExtra: number }[]
  >([
    { attributeName: "Brand", attributeValue: "Odoo", priceExtra: 560 },
  ]);

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { attributeName: "Edition", attributeValue: "Enterprise Plus", priceExtra: 350 },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      error("Product name must be at least 2 characters.");
      return;
    }

    const priceNum = parseFloat(salesPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      error("Sales price must be a positive number.");
      return;
    }

    const costNum = parseFloat(costPrice) || 0;
    if (costNum < 0) {
      error("Cost price cannot be negative.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createProductAction({
        name: trimmedName,
        type: "service",
        salesPrice: priceNum,
        costPrice: costNum,
        notes: notes.trim() || undefined,
        variants: variants.map((v) => ({
          attributeName: v.attributeName.trim(),
          attributeValue: v.attributeValue.trim(),
          priceExtra: Number(v.priceExtra) || 0,
        })),
      });

      if (!res.success) {
        error(res.error || "Failed to create product in PostgreSQL.");
        return;
      }

      success(`Product "${res.data?.name || trimmedName}" saved to PostgreSQL.`);
      router.push("/catalog");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 border-b-2 border-black pb-4">
          <Link
            href="/catalog"
            className="p-2 border-2 border-black rounded-[8px] bg-white shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-heading font-black tracking-tight text-neoBlack">
              Add New Product & Variants
            </h1>
            <p className="text-xs text-neutral-600 font-bold">
              Define base prices and attribute extras (e.g. Brand = Odoo adds $560) stored in PostgreSQL.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border-2 border-black rounded-[14px] p-6 shadow-neo space-y-4">
            <h3 className="font-heading font-black text-xl">Core Product Details</h3>

            <NeoInput
              label="Product Name"
              placeholder="e.g. Enterprise ERP Cloud"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NeoInput
                label="Base Sales Price ($)"
                type="number"
                step="0.01"
                placeholder="1200.00"
                value={salesPrice}
                onChange={(e) => setSalesPrice(e.target.value)}
                required
              />
              <NeoInput
                label="Cost Price ($)"
                type="number"
                step="0.01"
                placeholder="320.00"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-sm font-bold text-neoBlack">Notes & Description</label>
              <textarea
                rows={3}
                placeholder="Platform features, SLA terms, and variant applicability..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white border-2 border-black rounded-[8px] p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* Variants section */}
          <div className="bg-white border-2 border-black rounded-[14px] p-6 shadow-neo space-y-4">
            <div className="flex items-center justify-between border-b-2 border-neoDivider pb-3">
              <div>
                <h3 className="font-heading font-black text-xl">Attribute Variants</h3>
                <p className="text-xs text-neutral-600">
                  Unit price formula: Final = Base + Variant Extra
                </p>
              </div>
              <NeoButton
                type="button"
                variant="secondary"
                size="compact"
                onClick={handleAddVariant}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Variant
              </NeoButton>
            </div>

            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-neoCanvas border-2 border-black rounded-[8px] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                >
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="Attribute (e.g. Brand)"
                      value={v.attributeName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setVariants(
                          variants.map((item, i) => (i === idx ? { ...item, attributeName: val } : item))
                        );
                      }}
                      className="w-full bg-white border-2 border-black rounded-[6px] p-2 text-xs font-bold"
                      required
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="Value (e.g. Odoo)"
                      value={v.attributeValue}
                      onChange={(e) => {
                        const val = e.target.value;
                        setVariants(
                          variants.map((item, i) => (i === idx ? { ...item, attributeValue: val } : item))
                        );
                      }}
                      className="w-full bg-white border-2 border-black rounded-[6px] p-2 text-xs font-bold"
                      required
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Price Extra ($)"
                      value={v.priceExtra}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setVariants(
                          variants.map((item, i) => (i === idx ? { ...item, priceExtra: val } : item))
                        );
                      }}
                      className="w-full bg-white border-2 border-black rounded-[6px] p-2 text-xs font-bold tnum"
                      required
                    />
                  </div>

                  <div className="sm:col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      disabled={variants.length <= 1}
                      className="p-1.5 text-statusRed hover:bg-red-50 rounded border border-black disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Remove variant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link href="/catalog">
              <NeoButton type="button" variant="secondary" disabled={isSubmitting}>
                Cancel
              </NeoButton>
            </Link>
            <NeoButton
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            >
              {isSubmitting ? "Saving to Database..." : "Save Product & Variants"}
            </NeoButton>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
