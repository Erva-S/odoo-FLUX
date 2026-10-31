"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoInput } from "@/components/ui/NeoInput";
import { Product, Plan } from "@/lib/data/types";
import { useToast } from "@/components/ui/ToastContext";
import {
  Plus,
  Check,
  Edit2,
  Trash2,
  Loader2,
  RefreshCw,
  X,
  AlertTriangle,
  Server,
  Layers,
} from "lucide-react";
import {
  getProductsAction,
  getPlansAction,
  updateProductAction,
  deleteProductAction,
} from "@/app/actions/catalog";

export default function CatalogPage() {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<"products" | "plans">("products");

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editSalesPrice, setEditSalesPrice] = useState("");
  const [editCostPrice, setEditCostPrice] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editVariants, setEditVariants] = useState<
    { id?: string; attributeName: string; attributeValue: string; priceExtra: number }[]
  >([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete Confirmation State
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load live data from PostgreSQL
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [prodRes, planRes] = await Promise.all([
        getProductsAction(),
        getPlansAction(),
      ]);

      if (prodRes.success && prodRes.data) {
        setProducts(prodRes.data);
      } else {
        setProducts([]);
      }

      if (planRes.success && planRes.data) {
        setPlans(planRes.data);
      } else {
        setPlans([]);
      }
    } catch {
      setProducts([]);
      setPlans([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Edit Modal
  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditSalesPrice(prod.salesPrice.toString());
    setEditCostPrice(prod.costPrice.toString());
    setEditNotes(prod.notes || "");
    setEditVariants(
      prod.variants.map((v) => ({
        id: v.id,
        attributeName: v.attributeName,
        attributeValue: v.attributeValue,
        priceExtra: v.priceExtra,
      }))
    );
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setIsSavingEdit(false);
  };

  const handleAddEditVariant = () => {
    setEditVariants([
      ...editVariants,
      { attributeName: "Edition", attributeValue: "Standard", priceExtra: 100 },
    ]);
  };

  const handleRemoveEditVariant = (index: number) => {
    setEditVariants(editVariants.filter((_, i) => i !== index));
  };

  // Submit Product Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const trimmedName = editName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      error("Product name must be at least 2 characters.");
      return;
    }

    const priceNum = parseFloat(editSalesPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      error("Sales price must be a positive number.");
      return;
    }

    const costNum = parseFloat(editCostPrice) || 0;
    if (costNum < 0) {
      error("Cost price cannot be negative.");
      return;
    }

    try {
      setIsSavingEdit(true);
      const res = await updateProductAction(editingProduct.id, {
        name: trimmedName,
        type: editingProduct.type,
        salesPrice: priceNum,
        costPrice: costNum,
        notes: editNotes.trim() || undefined,
        variants: editVariants.map((v) => ({
          attributeName: v.attributeName.trim(),
          attributeValue: v.attributeValue.trim(),
          priceExtra: Number(v.priceExtra) || 0,
        })),
      });

      if (!res.success) {
        error(res.error || "Failed to update product in PostgreSQL.");
        return;
      }

      success(`Product "${trimmedName}" updated in PostgreSQL.`);
      closeEditModal();
      loadData(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving product";
      error(msg);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string) => {
    try {
      setIsDeleting(true);
      const res = await deleteProductAction(id);

      if (!res.success) {
        error(res.error || "Failed to delete product.");
        return;
      }

      success("Product safely deleted from PostgreSQL database.");
      setDeletingProductId(null);
      loadData(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting product";
      error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-neoBlack">
                Catalog & Plans
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-neoSage text-black border border-black shadow-neo-sm">
                <Server className="w-3 h-3 text-statusGreen" />
                Live PostgreSQL
              </span>
            </div>
            <p className="text-sm font-body font-bold text-neutral-600 mt-0.5">
              Admin management: recurring plans, software products, and attribute variants connected to Supabase.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing || loading}
              className="p-2.5 border-2 border-black rounded-[8px] bg-white shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-transform disabled:opacity-50"
              title="Refresh database records"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-statusBlue" : ""}`} />
            </button>
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
            className={`px-4 py-2 text-sm font-bold rounded-[8px] border-2 border-black transition-colors ${activeTab === "products"
                ? "bg-neoYellow text-black shadow-neo-sm font-black"
                : "bg-white text-neutral-600 hover:bg-neutral-100"
              }`}
          >
            Products & Variants ({loading ? "..." : products.length})
          </button>
          <button
            onClick={() => setActiveTab("plans")}
            className={`px-4 py-2 text-sm font-bold rounded-[8px] border-2 border-black transition-colors ${activeTab === "plans"
                ? "bg-neoYellow text-black shadow-neo-sm font-black"
                : "bg-white text-neutral-600 hover:bg-neutral-100"
              }`}
          >
            Subscription Plans ({loading ? "..." : plans.length})
          </button>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white border-2 border-black rounded-[14px] p-6 shadow-neo space-y-4 animate-pulse"
              >
                <div className="flex justify-between items-center">
                  <div className="h-5 w-20 bg-neutral-200 rounded" />
                  <div className="h-6 w-24 bg-neutral-200 rounded" />
                </div>
                <div className="h-6 w-3/4 bg-neutral-200 rounded" />
                <div className="h-12 w-full bg-neutral-100 rounded" />
                <div className="h-20 w-full bg-neutral-100 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {!loading && activeTab === "products" && (
          <>
            {products.length === 0 ? (
              <div className="bg-white border-2 border-black rounded-[14px] p-12 shadow-neo text-center space-y-4">
                <Layers className="w-12 h-12 mx-auto text-neutral-400 stroke-1" />
                <h3 className="font-heading font-black text-xl">No products found</h3>
                <p className="text-sm text-neutral-600 max-w-md mx-auto">
                  No products have been added yet. Click &quot;Create First Product&quot; below to add one.
                </p>
                <Link href="/catalog/new">
                  <NeoButton variant="primary" icon={<Plus className="w-4 h-4" />}>
                    Create First Product
                  </NeoButton>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white border-2 border-black rounded-[14px] p-6 shadow-neo flex flex-col justify-between space-y-4 transition-all hover:shadow-neo-lg"
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
                      <p className="text-xs text-neutral-600 leading-relaxed min-h-[32px]">
                        {prod.notes || "No description provided."}
                      </p>

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
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(prod)}
                          className="p-1.5 border border-black rounded-[6px] bg-white hover:bg-neutral-100 shadow-neo-sm"
                          title="Edit Product & Variants"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingProductId(prod.id)}
                          className="p-1.5 border border-black rounded-[6px] bg-white hover:bg-red-50 text-statusRed shadow-neo-sm"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Plans Grid */}
        {!loading && activeTab === "plans" && (
          <>
            {plans.length === 0 ? (
              <div className="bg-white border-2 border-black rounded-[14px] p-12 shadow-neo text-center space-y-4">
                <Layers className="w-12 h-12 mx-auto text-neutral-400 stroke-1" />
                <h3 className="font-heading font-black text-xl">No plans found</h3>
                <p className="text-sm text-neutral-600 max-w-md mx-auto">
                  No recurring plans configured yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map((plan) => (
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
                      <p className="text-xs text-neutral-600 min-h-[32px]">
                        {plan.description || "Recurring subscription package with automated renewal."}
                      </p>

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
                        POSTGRESQL RECURRING
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Edit Product Modal */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white border-2 border-black rounded-[14px] p-6 shadow-neo-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5">
              <div className="flex justify-between items-center border-b-2 border-black pb-3">
                <h3 className="font-heading font-black text-2xl">Edit Product & Variants</h3>
                <button
                  onClick={closeEditModal}
                  className="p-1 hover:bg-neutral-100 rounded border border-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <NeoInput
                  label="Product Name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <NeoInput
                    label="Sales Price ($)"
                    type="number"
                    step="0.01"
                    value={editSalesPrice}
                    onChange={(e) => setEditSalesPrice(e.target.value)}
                    required
                  />
                  <NeoInput
                    label="Cost Price ($)"
                    type="number"
                    step="0.01"
                    value={editCostPrice}
                    onChange={(e) => setEditCostPrice(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-sm font-bold text-neoBlack">Notes & Description</label>
                  <textarea
                    rows={2}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full bg-white border-2 border-black rounded-[8px] p-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                {/* Variants Editor */}
                <div className="border-t-2 border-neoDivider pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-heading font-bold text-sm">Attribute Variants</h4>
                      <p className="text-[11px] text-neutral-500">
                        Add or modify variants (e.g. Brand = Odoo adds +$560.00).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddEditVariant}
                      className="px-2.5 py-1 text-xs font-bold bg-neoYellow border-2 border-black rounded-[6px] shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5"
                    >
                      + Add Variant
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {editVariants.map((v, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-neoCanvas border-2 border-black rounded-[6px] grid grid-cols-12 gap-2 items-center text-xs"
                      >
                        <input
                          type="text"
                          placeholder="Attribute"
                          value={v.attributeName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditVariants(
                              editVariants.map((item, i) =>
                                i === idx ? { ...item, attributeName: val } : item
                              )
                            );
                          }}
                          className="col-span-4 bg-white border border-black rounded p-1.5 font-bold"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Value"
                          value={v.attributeValue}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditVariants(
                              editVariants.map((item, i) =>
                                i === idx ? { ...item, attributeValue: val } : item
                              )
                            );
                          }}
                          className="col-span-4 bg-white border border-black rounded p-1.5 font-bold"
                          required
                        />
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Extra ($)"
                          value={v.priceExtra}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setEditVariants(
                              editVariants.map((item, i) =>
                                i === idx ? { ...item, priceExtra: val } : item
                              )
                            );
                          }}
                          className="col-span-3 bg-white border border-black rounded p-1.5 font-bold tnum"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveEditVariant(idx)}
                          className="col-span-1 text-statusRed hover:bg-red-50 p-1 rounded flex justify-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t-2 border-black">
                  <NeoButton type="button" variant="secondary" onClick={closeEditModal} disabled={isSavingEdit}>
                    Cancel
                  </NeoButton>
                  <NeoButton
                    type="submit"
                    variant="primary"
                    disabled={isSavingEdit}
                    icon={isSavingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  >
                    {isSavingEdit ? "Saving Changes..." : "Save to PostgreSQL"}
                  </NeoButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingProductId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white border-2 border-black rounded-[14px] p-6 shadow-neo-lg max-w-md w-full space-y-4">
              <div className="flex items-center gap-3 text-statusRed">
                <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                <h3 className="font-heading font-black text-xl text-neoBlack">Delete Product?</h3>
              </div>

              <p className="text-xs text-neutral-600 leading-relaxed">
                Are you sure you want to delete this product? All attached variants will also be removed.
                If this product is linked to any active subscription or invoice, deletion will be blocked safely to preserve database integrity.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <NeoButton
                  type="button"
                  variant="secondary"
                  size="compact"
                  disabled={isDeleting}
                  onClick={() => setDeletingProductId(null)}
                >
                  Cancel
                </NeoButton>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => handleDeleteProduct(deletingProductId)}
                  className="px-4 py-2 text-xs font-bold bg-statusRed text-white border-2 border-black rounded-[8px] shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  {isDeleting ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
