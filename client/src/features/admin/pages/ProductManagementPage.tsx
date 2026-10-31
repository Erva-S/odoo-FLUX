import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Layers,
  TrendingUp,
  Search,
  Plus,
  Boxes,
  CheckCircle2,
  Edit2,
  Trash2,
  AlertCircle,
  Loader2,
  Power,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
} from 'lucide-react';
import { Badge } from '../../../components/ui/Badge.js';
import { Button } from '../../../components/ui/Button.js';
import { Modal } from '../../../components/ui/Modal.js';
import { Input } from '../../../components/ui/Input.js';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct,
  createProductVariant,
  updateVariantStatus,
  deleteVariant,
} from '../../../services/product.service.js';
import { Product, ProductVariant, ProductStatus } from '../../../types/catalog.js';
import { formatCurrencyINR } from '../../../utils/formatters.js';
import { extractErrorMessage } from '../../../services/api.js';

export function ProductManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [inspectingProduct, setInspectingProduct] = useState<Product | null>(null);
  const [isAddVariantModalOpen, setIsAddVariantModalOpen] = useState(false);

  // Create Product Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState('Software');
  const [salesPrice, setSalesPrice] = useState('5000');
  const [costPrice, setCostPrice] = useState('2500');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('Core SaaS');
  const [description, setDescription] = useState('');
  const [initialVariantName, setInitialVariantName] = useState('');
  const [initialVariantCode, setInitialVariantCode] = useState('');
  const [initialVariantPrice, setInitialVariantPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit Product Form State
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('Software');
  const [editSalesPrice, setEditSalesPrice] = useState('');
  const [editCostPrice, setEditCostPrice] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editCategory, setEditCategory] = useState('Core SaaS');
  const [editDescription, setEditDescription] = useState('');

  // Add Variant Form State
  const [varName, setVarName] = useState('');
  const [varCode, setVarCode] = useState('');
  const [varPrice, setVarPrice] = useState('560');
  const [varBrand, setVarBrand] = useState('');
  const [varDesc, setVarDesc] = useState('');

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchProducts({
        page,
        limit: 10,
        search: searchTerm || undefined,
        category: categoryFilter !== 'All' ? categoryFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setProducts(res.items);
      setTotalPages(res.pagination.totalPages);
      setTotalCount(res.pagination.total);
      setActiveCount(res.metrics.activeCount);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, categoryFilter, statusFilter]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload: any = {
        name,
        code: code.toUpperCase(),
        type,
        salesPrice: parseFloat(salesPrice) || 0,
        costPrice: parseFloat(costPrice) || 0,
        notes: notes || undefined,
        category,
        description: description || undefined,
        status: 'ACTIVE',
      };

      if (initialVariantName && initialVariantCode) {
        payload.variants = [
          {
            name: initialVariantName,
            code: initialVariantCode.toUpperCase(),
            additionalPrice: parseFloat(initialVariantPrice) || 0,
            price: parseFloat(initialVariantPrice) || 0,
            status: 'ACTIVE',
          },
        ];
      }

      await createProduct(payload);
      setSuccessMsg(`Product '${name}' created successfully`);
      setIsCreateModalOpen(false);
      resetCreateForm();
      loadProducts();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSubmitting(true);
    setError(null);

    try {
      await updateProduct(editingProduct.id, {
        name: editName,
        type: editType,
        salesPrice: editSalesPrice ? parseFloat(editSalesPrice) : undefined,
        costPrice: editCostPrice ? parseFloat(editCostPrice) : undefined,
        notes: editNotes || undefined,
        category: editCategory,
        description: editDescription || undefined,
      });
      setSuccessMsg(`Product '${editName}' updated successfully`);
      setEditingProduct(null);
      loadProducts();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditType(prod.type || 'Software');
    setEditSalesPrice(String(prod.salesPrice ?? ''));
    setEditCostPrice(String(prod.costPrice ?? ''));
    setEditNotes(prod.notes || '');
    setEditCategory(prod.category);
    setEditDescription(prod.description || '');
  };

  const resetCreateForm = () => {
    setName('');
    setCode('');
    setType('Software');
    setSalesPrice('5000');
    setCostPrice('2500');
    setNotes('');
    setCategory('Core SaaS');
    setDescription('');
    setInitialVariantName('');
    setInitialVariantCode('');
    setInitialVariantPrice('');
  };

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectingProduct) return;
    setSubmitting(true);
    setError(null);

    try {
      const extraPrice = parseFloat(varPrice) || 0;
      await createProductVariant(inspectingProduct.id, {
        name: varName,
        code: varCode.toUpperCase(),
        additionalPrice: extraPrice,
        price: extraPrice,
        attributes: varBrand ? { brand: varBrand } : undefined,
        description: varDesc || undefined,
        status: 'ACTIVE',
      });
      setSuccessMsg(`Variant '${varName}' added to ${inspectingProduct.name}`);
      setIsAddVariantModalOpen(false);
      setVarName('');
      setVarCode('');
      setVarPrice('560');
      setVarBrand('');
      setVarDesc('');
      loadProducts();
      // Reload inspected product
      const updated = await fetchProducts({ search: inspectingProduct.code });
      if (updated.items.length > 0) {
        setInspectingProduct(updated.items[0]);
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleVariantStatus = async (variant: ProductVariant) => {
    const nextStatus: ProductStatus = variant.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateVariantStatus(variant.id, nextStatus);
      if (inspectingProduct) {
        const updated = inspectingProduct.variants.map((v: ProductVariant) =>
          v.id === variant.id ? { ...v, status: nextStatus } : v
        );
        setInspectingProduct({ ...inspectingProduct, variants: updated });
      }
      loadProducts();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handleToggleStatus = async (prod: Product) => {
    const nextStatus = prod.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateProductStatus(prod.id, nextStatus);
      setSuccessMsg(`Product '${prod.name}' set to ${nextStatus}`);
      loadProducts();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handleDeleteProduct = async (prod: Product) => {
    if (!window.confirm(`Are you sure you want to delete product '${prod.name}' (${prod.code})?`)) {
      return;
    }
    try {
      await deleteProduct(prod.id);
      setSuccessMsg(`Product '${prod.name}' deleted successfully`);
      loadProducts();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const totalVariantsCount = products.reduce((acc, p) => acc + (p.variants?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* 1. Header & Catalog Overview */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-outline text-xs uppercase tracking-wider font-semibold font-label-caps mb-1">
            <span>Catalog Architecture</span>
            <span>ΓÇó</span>
            <span className="text-tertiary font-bold">Phase 2 Live Production</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface font-headline-xl">
            Products & Catalog
          </h1>
          <p className="text-sm text-on-surface-variant font-body-default mt-1">
            Configure software offerings, add-ons, pricing models, and SKU variant tiers for Brightloop Software.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Product
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-error-container text-on-error-container flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-error" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="p-1 hover:bg-black/5 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-tertiary" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="p-1 hover:bg-black/5 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Catalog Summary KPI Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-surface-container-lowest p-5 border border-outline-variant/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-xs uppercase tracking-wider text-outline font-semibold">
              Total Catalog Products
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-data-mono text-[11px]">
              Database
            </span>
          </div>
          <div className="my-3 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-on-surface font-metric-display">
              {totalCount}
            </span>
            <span className="text-xs font-semibold text-tertiary flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> Live
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1 border-t border-outline-variant/10">
            <span>Active: <strong className="text-on-surface">{activeCount}</strong></span>
            <span>Inactive: <strong className="text-on-surface">{totalCount - activeCount}</strong></span>
          </div>
        </div>

        <div className="rounded-xl bg-surface-container-lowest p-5 border border-outline-variant/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-xs uppercase tracking-wider text-outline font-semibold">
              Configured SKU Variants
            </span>
            <Badge variant="indigo" size="sm">
              Multi-tier
            </Badge>
          </div>
          <div className="my-3 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-on-surface font-metric-display">
              {totalVariantsCount}
            </span>
            <span className="text-xs font-semibold text-secondary flex items-center gap-0.5">
              <Boxes className="w-3.5 h-3.5" /> SKUs
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1 border-t border-outline-variant/10">
            <span>Granular sub-tiers and capacity modifiers</span>
          </div>
        </div>

        <div className="rounded-xl bg-surface-container-lowest p-5 border border-outline-variant/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-xs uppercase tracking-wider text-outline font-semibold">
              Architecture Status
            </span>
            <Badge variant="success" size="sm">
              PostgreSQL
            </Badge>
          </div>
          <div className="my-3 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-on-surface font-metric-display">Prisma</span>
            <span className="text-xs font-semibold text-tertiary flex items-center gap-0.5">
              Strict Schema
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1 border-t border-outline-variant/10">
            <span>Relational Restrict integrity active</span>
          </div>
        </div>
      </div>

      {/* 3. Filter Strip */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm">
        <div className="relative min-w-[260px] flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e: any) => setSearchTerm(e.target.value)}
            placeholder="Search by product name, SKU or description..."
            className="w-full h-10 pl-9 pr-4 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline text-sm border border-outline-variant/30 focus:outline-none focus:bg-surface-container-lowest"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center bg-surface-container-low p-1 rounded-lg gap-1">
            {['All', 'Core SaaS', 'Add-on', 'Connector', 'Service'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setCategoryFilter(cat);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  categoryFilter === cat
                    ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center bg-surface-container-low p-1 rounded-lg gap-1">
            {['ALL', 'ACTIVE', 'INACTIVE'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  statusFilter === st
                    ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Products Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant/20 flex items-center justify-between">
          <h3 className="font-headline-sm text-base font-semibold text-on-surface">
            Catalog Products ({products.length} of {totalCount})
          </h3>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase tracking-wider font-semibold select-none border-b border-outline-variant/20">
                <th className="py-3 px-4">Product & SKU</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Sales Price</th>
                <th className="py-3 px-3">Cost Price</th>
                <th className="py-3 px-3">Variants</th>
                <th className="py-3 px-3">Plans</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-sm">
              {products.map((prod) => (
                <tr key={prod.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-surface-container-high text-primary flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-on-surface">{prod.name}</div>
                        <div className="text-[11px] font-data-mono text-outline">{prod.code} • {prod.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex px-2 py-0.5 rounded bg-surface-container text-xs font-medium text-on-surface-variant">
                      {prod.type || 'Software'}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-on-surface font-data-mono">
                    {formatCurrencyINR(Number(prod.salesPrice || 0))}
                  </td>
                  <td className="py-3 px-3 text-xs text-outline font-data-mono">
                    {prod.costPrice !== undefined ? formatCurrencyINR(Number(prod.costPrice || 0)) : '—'}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex px-2 py-0.5 rounded-full bg-surface-container-high text-xs font-data-mono font-medium">
                      {prod.variants?.length || 0} SKUs
                    </span>
                  </td>
                  <td className="py-3 px-3 text-xs text-on-surface-variant">
                    {prod._count?.plans || 0} Plan(s)
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Badge variant={prod.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm">
                      {prod.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="View Details & Variants"
                        onClick={() => setInspectingProduct(prod)}
                      >
                        <Eye className="w-4 h-4 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Edit Product"
                        onClick={() => openEditModal(prod)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title={prod.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        onClick={() => handleToggleStatus(prod)}
                      >
                        <Power
                          className={`w-3.5 h-3.5 ${
                            prod.status === 'ACTIVE' ? 'text-tertiary' : 'text-outline'
                          }`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Delete Product"
                        onClick={() => handleDeleteProduct(prod)}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-error hover:text-error/80" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && products.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-on-surface-variant text-sm">
                    No products found matching your current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Product Details & Variants Slideout Modal */}
      {inspectingProduct && (
        <Modal
          isOpen={true}
          onClose={() => setInspectingProduct(null)}
          title={`Product: ${inspectingProduct.name}`}
          description={`SKU: ${inspectingProduct.code} • Category: ${inspectingProduct.category}`}
          maxWidth="2xl"
        >
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-surface-container-low grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-xs uppercase font-semibold text-outline font-label-caps">Status</span>
                <div className="mt-1">
                  <Badge variant={inspectingProduct.status === 'ACTIVE' ? 'success' : 'neutral'} size="md">
                    {inspectingProduct.status}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-xs uppercase font-semibold text-outline font-label-caps">Base Sales Price</span>
                <p className="text-sm font-bold text-on-surface font-data-mono mt-1">
                  {formatCurrencyINR(Number(inspectingProduct.salesPrice || 0))}
                </p>
              </div>
              <div>
                <span className="text-xs uppercase font-semibold text-outline font-label-caps">Cost Price (Internal)</span>
                <p className="text-sm font-bold text-outline font-data-mono mt-1">
                  {inspectingProduct.costPrice !== undefined ? formatCurrencyINR(Number(inspectingProduct.costPrice || 0)) : '—'}
                </p>
              </div>
              <div>
                <span className="text-xs uppercase font-semibold text-outline font-label-caps">Product Type</span>
                <p className="text-sm font-semibold text-on-surface mt-1">
                  {inspectingProduct.type || 'Software'}
                </p>
              </div>
            </div>

            {inspectingProduct.notes && (
              <div className="p-3 bg-surface-container-low/70 rounded-lg text-xs text-on-surface-variant">
                <span className="font-bold text-on-surface uppercase text-[10px] block mb-0.5">Internal Notes:</span>
                {inspectingProduct.notes}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-sm font-bold text-on-surface">Configured Variants ({inspectingProduct.variants?.length || 0})</h4>
                  <p className="text-[11px] text-on-surface-variant">
                    Final sales price = Base sales price + Variant additional price
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setIsAddVariantModalOpen(true)}
                >
                  + Add Variant
                </Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {inspectingProduct.variants?.map((v: ProductVariant) => {
                  const base = Number(inspectingProduct.salesPrice || 0);
                  const extra = Number(v.additionalPrice ?? v.price ?? 0);
                  const finalCalculated = Math.round((base + extra) * 100) / 100;

                  return (
                    <div
                      key={v.id}
                      className="p-3 rounded-lg border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-on-surface text-sm">{v.name}</div>
                        <div className="text-[11px] font-data-mono text-outline">
                          SKU: {v.code}
                          {v.attributes?.brand && <span className="ml-2 font-medium text-primary">Brand: {v.attributes.brand}</span>}
                        </div>
                        {v.description && <p className="text-on-surface-variant mt-0.5">{v.description}</p>}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="font-bold font-data-mono text-sm text-on-surface">
                            {formatCurrencyINR(finalCalculated)}
                          </div>
                          <div className="text-[10px] text-outline font-data-mono">
                            Base: {formatCurrencyINR(base)} + Extra: {formatCurrencyINR(extra)}
                          </div>
                        </div>
                        <Badge variant={v.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm">
                          {v.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleVariantStatus(v)}
                          title={v.status === 'ACTIVE' ? 'Deactivate variant' : 'Activate variant'}
                        >
                          <Power className={`w-3.5 h-3.5 ${v.status === 'ACTIVE' ? 'text-tertiary' : 'text-outline'}`} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {(!inspectingProduct.variants || inspectingProduct.variants.length === 0) && (
                  <p className="text-xs text-on-surface-variant italic py-3 text-center">
                    No variants configured for this product. Base sales price will apply.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-outline-variant/20">
              <Button variant="outline" size="md" onClick={() => setInspectingProduct(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 6. Create Product Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Catalog Product"
        description="Register a software product tier, subscription offering, or add-on capability."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <Input
            label="Product Name *"
            placeholder="e.g. Software Subscription"
            value={name}
            onChange={(e: any) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              label="Product SKU / Code *"
              placeholder="e.g. SOFT-SUB-01"
              value={code}
              onChange={(e: any) => setCode(e.target.value)}
              required
            />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-label-caps mb-1.5">
                Product Type *
              </label>
              <select
                value={type}
                onChange={(e: any) => setType(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none"
              >
                <option value="Software">Software</option>
                <option value="Subscription">Subscription</option>
                <option value="Service">Service</option>
                <option value="Add-on">Add-on</option>
                <option value="Connector">Connector</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-label-caps mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none"
              >
                <option value="Core SaaS">Core SaaS</option>
                <option value="Add-on">Add-on</option>
                <option value="Connector">Connector</option>
                <option value="Service">Service</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Base Sales Price (INR) *"
              type="number"
              step="0.01"
              min="0"
              placeholder="5000"
              value={salesPrice}
              onChange={(e: any) => setSalesPrice(e.target.value)}
              required
            />
            <Input
              label="Cost Price (Internal INR)"
              type="number"
              step="0.01"
              min="0"
              placeholder="2500"
              value={costPrice}
              onChange={(e: any) => setCostPrice(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-label-caps mb-1.5">
              Internal Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e: any) => setNotes(e.target.value)}
              placeholder="Operational margins, vendor terms, or internal notes..."
              className="w-full p-2.5 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-label-caps mb-1.5">
              Public Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e: any) => setDescription(e.target.value)}
              placeholder="Specifications and architectural scope..."
              className="w-full p-2.5 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-xs focus:outline-none"
            />
          </div>

          {/* Optional Initial Variant */}
          <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-3">
            <span className="text-xs font-bold text-on-surface uppercase tracking-wider block">
              Initial SKU Variant (Optional)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input
                label="Variant Name"
                placeholder="e.g. Standard"
                value={initialVariantName}
                onChange={(e: any) => setInitialVariantName(e.target.value)}
              />
              <Input
                label="Variant SKU"
                placeholder="e.g. SOFT-STD"
                value={initialVariantCode}
                onChange={(e: any) => setInitialVariantCode(e.target.value)}
              />
              <Input
                label="Additional Price (INR)"
                type="number"
                placeholder="0"
                value={initialVariantPrice}
                onChange={(e: any) => setInitialVariantPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
            <Button variant="outline" size="md" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" isLoading={submitting}>
              Save Product
            </Button>
          </div>
        </form>
      </Modal>

      {/* 7. Edit Product Modal */}
      {editingProduct && (
        <Modal
          isOpen={true}
          onClose={() => setEditingProduct(null)}
          title={`Edit Product: ${editingProduct.code}`}
          maxWidth="lg"
        >
          <form onSubmit={handleUpdateProduct} className="space-y-4">
            <Input
              label="Product Name"
              value={editName}
              onChange={(e: any) => setEditName(e.target.value)}
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-label-caps mb-1.5">
                  Product Type
                </label>
                <select
                  value={editType}
                  onChange={(e: any) => setEditType(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none"
                >
                  <option value="Software">Software</option>
                  <option value="Subscription">Subscription</option>
                  <option value="Service">Service</option>
                  <option value="Add-on">Add-on</option>
                  <option value="Connector">Connector</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-label-caps mb-1.5">
                  Category
                </label>
                <select
                  value={editCategory}
                  onChange={(e: any) => setEditCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none"
                >
                  <option value="Core SaaS">Core SaaS</option>
                  <option value="Add-on">Add-on</option>
                  <option value="Connector">Connector</option>
                  <option value="Service">Service</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Base Sales Price (INR)"
                type="number"
                step="0.01"
                min="0"
                value={editSalesPrice}
                onChange={(e: any) => setEditSalesPrice(e.target.value)}
              />
              <Input
                label="Cost Price (Internal INR)"
                type="number"
                step="0.01"
                min="0"
                value={editCostPrice}
                onChange={(e: any) => setEditCostPrice(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-label-caps mb-1.5">
                Internal Notes
              </label>
              <textarea
                rows={2}
                value={editNotes}
                onChange={(e: any) => setEditNotes(e.target.value)}
                placeholder="Internal margins or operational terms..."
                className="w-full p-2.5 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-label-caps mb-1.5">
                Description
              </label>
              <textarea
                rows={2}
                value={editDescription}
                onChange={(e: any) => setEditDescription(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
              <Button variant="outline" size="md" type="button" onClick={() => setEditingProduct(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit" isLoading={submitting}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 8. Add Variant to Inspected Product Modal */}
      {isAddVariantModalOpen && inspectingProduct && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddVariantModalOpen(false)}
          title={`Add Variant to ${inspectingProduct.name}`}
          description={`Base Sales Price: ${formatCurrencyINR(Number(inspectingProduct.salesPrice || 0))}`}
          maxWidth="md"
        >
          <form onSubmit={handleAddVariant} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Variant Name *"
                placeholder="e.g. Odoo"
                value={varName}
                onChange={(e: any) => setVarName(e.target.value)}
                required
              />
              <Input
                label="Brand / Attribute (Optional)"
                placeholder="e.g. Odoo"
                value={varBrand}
                onChange={(e: any) => setVarBrand(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Variant SKU Code *"
                placeholder="e.g. SOFT-ODOO"
                value={varCode}
                onChange={(e: any) => setVarCode(e.target.value)}
                required
              />
              <Input
                label="Additional Price (INR) *"
                type="number"
                min="0"
                step="0.01"
                placeholder="560"
                value={varPrice}
                onChange={(e: any) => setVarPrice(e.target.value)}
                required
              />
            </div>

            {/* Live Pricing Calculation Preview */}
            <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/20 space-y-1.5 text-xs">
              <span className="text-[10px] uppercase font-bold text-outline tracking-wider block">
                Calculated Price Breakdown:
              </span>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Base Sales Price:</span>
                <span className="font-semibold text-on-surface font-data-mono">
                  {formatCurrencyINR(Number(inspectingProduct.salesPrice || 0))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">+ Variant Additional Price:</span>
                <span className="font-semibold text-on-surface font-data-mono">
                  +{formatCurrencyINR(parseFloat(varPrice) || 0)}
                </span>
              </div>
              <div className="pt-1 border-t border-outline-variant/20 flex items-center justify-between text-sm font-bold text-primary">
                <span>Final Sales Price:</span>
                <span className="font-data-mono">
                  {formatCurrencyINR(Number(inspectingProduct.salesPrice || 0) + (parseFloat(varPrice) || 0))}
                </span>
              </div>
            </div>

            <Input
              label="Description (Optional)"
              placeholder="Variant specifications or SLA attributes"
              value={varDesc}
              onChange={(e: any) => setVarDesc(e.target.value)}
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
              <Button variant="outline" size="md" type="button" onClick={() => setIsAddVariantModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit" isLoading={submitting}>
                Add Variant
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
