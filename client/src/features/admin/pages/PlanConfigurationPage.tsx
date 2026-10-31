import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  PauseCircle,
  RotateCw,
  TrendingUp,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  Edit2,
  Trash2,
  Power,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Loader2,
} from 'lucide-react';
import { Badge } from '../../../components/ui/Badge.js';
import { Button } from '../../../components/ui/Button.js';
import { Modal } from '../../../components/ui/Modal.js';
import { Input } from '../../../components/ui/Input.js';
import {
  fetchPlans,
  createPlan,
  updatePlan,
  updatePlanStatus,
  deletePlan,
} from '../../../services/plan.service.js';
import { fetchProducts } from '../../../services/product.service.js';
import { Plan, Product, ProductVariant, BillingFrequency } from '../../../types/catalog.js';
import { formatCurrencyINR } from '../../../utils/formatters.js';
import { extractErrorMessage } from '../../../services/api.js';

const FREQUENCY_LABELS: Record<BillingFrequency, string> = {
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  HALF_YEARLY: 'Half-Yearly',
  YEARLY: 'Yearly',
  ONE_TIME: 'One-Time',
};

export function PlanConfigurationPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [activeProducts, setActiveProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [cadenceFilter, setCadenceFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states (Create)
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formProductId, setFormProductId] = useState('');
  const [formVariantId, setFormVariantId] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formFreq, setFormFreq] = useState<BillingFrequency>('MONTHLY');
  const [formPauseCycles, setFormPauseCycles] = useState('2');
  const [formNoticeDays, setFormNoticeDays] = useState('30');
  const [formTrialDays, setFormTrialDays] = useState('0');
  const [formFeatures, setFormFeatures] = useState('');

  // Form states (Edit)
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editFreq, setEditFreq] = useState<BillingFrequency>('MONTHLY');
  const [editPauseCycles, setEditPauseCycles] = useState('2');
  const [editNoticeDays, setEditNoticeDays] = useState('30');
  const [editTrialDays, setEditTrialDays] = useState('0');
  const [editFeatures, setEditFeatures] = useState('');

  // Load Active Products for Dropdown
  useEffect(() => {
    fetchProducts({ status: 'ACTIVE', limit: 100 })
      .then((res: any) => setActiveProducts(res.items))
      .catch((err: any) => console.error('Failed to load active products:', err));
  }, []);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPlans({
        page,
        limit: 10,
        search: searchTerm || undefined,
        billingFrequency: cadenceFilter !== 'ALL' ? cadenceFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setPlans(res.items);
      setTotalPages(res.pagination.totalPages);
      setTotalCount(res.pagination.total);
      setActiveCount(res.metrics.activeCount);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, cadenceFilter, statusFilter]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  // Derived variants for the selected product in Create Form
  const selectedProduct = activeProducts.find((p) => p.id === formProductId);
  const availableVariants = selectedProduct?.variants?.filter((v: ProductVariant) => v.status === 'ACTIVE') || [];

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProductId) {
      setError('Please select an active product.');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const parsedFeatures = formFeatures
        .split('\n')
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      await createPlan({
        name: formName,
        code: formCode.toUpperCase(),
        description: formDesc || undefined,
        productId: formProductId,
        variantId: formVariantId || null,
        price: parseFloat(formPrice),
        billingFrequency: formFreq,
        status: 'ACTIVE',
        pauseLimitCycles: parseInt(formPauseCycles, 10) || 2,
        cancellationNoticeDays: parseInt(formNoticeDays, 10) || 30,
        trialPeriodDays: parseInt(formTrialDays, 10) || 0,
        features: parsedFeatures.length > 0 ? parsedFeatures : undefined,
      });

      setSuccessMsg(`Plan '${formName}' created successfully`);
      setIsCreateModalOpen(false);
      resetCreateForm();
      loadPlans();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    setSubmitting(true);
    setError(null);

    try {
      const parsedFeatures = editFeatures
        .split('\n')
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      await updatePlan(editingPlan.id, {
        name: editName,
        price: parseFloat(editPrice),
        billingFrequency: editFreq,
        pauseLimitCycles: parseInt(editPauseCycles, 10),
        cancellationNoticeDays: parseInt(editNoticeDays, 10),
        trialPeriodDays: parseInt(editTrialDays, 10),
        features: parsedFeatures,
      });

      setSuccessMsg(`Plan '${editName}' updated successfully`);
      setEditingPlan(null);
      loadPlans();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePlanStatus = async (plan: Plan) => {
    const nextStatus = plan.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updatePlanStatus(plan.id, nextStatus);
      setSuccessMsg(`Plan '${plan.name}' set to ${nextStatus}`);
      loadPlans();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const handleDeletePlan = async (plan: Plan) => {
    if (!window.confirm(`Are you sure you want to delete plan '${plan.name}' (${plan.code})?`)) {
      return;
    }
    try {
      await deletePlan(plan.id);
      setSuccessMsg(`Plan '${plan.name}' deleted successfully`);
      loadPlans();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setEditName(plan.name);
    setEditPrice(String(plan.price));
    setEditFreq(plan.billingFrequency);
    setEditPauseCycles(String(plan.pauseLimitCycles));
    setEditNoticeDays(String(plan.cancellationNoticeDays));
    setEditTrialDays(String(plan.trialPeriodDays));
    setEditFeatures(plan.features?.join('\n') || '');
  };

  const resetCreateForm = () => {
    setFormName('');
    setFormCode('');
    setFormDesc('');
    setFormProductId('');
    setFormVariantId('');
    setFormPrice('');
    setFormFreq('MONTHLY');
    setFormPauseCycles('2');
    setFormNoticeDays('30');
    setFormTrialDays('0');
    setFormFeatures('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-xs font-semibold font-label-caps uppercase tracking-wider">
              Plan Architect
            </span>
            <span className="text-outline text-xs">•</span>
            <span className="font-data-mono text-xs text-outline">v2.0 PostgreSQL Live Engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface font-headline-xl">
            Subscription Plans
          </h1>
          <p className="text-sm text-on-surface-variant font-body-default mt-1">
            Define recurring billing frequencies, renewal rules, pause limits, and early closure policies across product catalogs.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start lg:self-center">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              if (activeProducts.length > 0 && !formProductId) {
                setFormProductId(activeProducts[0].id);
              }
              setIsCreateModalOpen(true);
            }}
          >
            + Create Plan
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

      {/* 2. KPI / Micro Health Bar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-xs uppercase text-outline font-semibold">
              Total Plan Blueprints
            </span>
            <Layers className="w-4 h-4 text-outline" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-on-surface font-metric-display">{totalCount}</span>
            <Badge variant="success" size="sm">
              Live in Database
            </Badge>
          </div>
          <div className="mt-2 text-on-surface-variant text-xs flex items-center justify-between pt-1 border-t border-outline-variant/10">
            <span>Active: <strong className="text-on-surface">{activeCount}</strong></span>
            <span>Inactive: <strong className="text-on-surface">{totalCount - activeCount}</strong></span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-xs uppercase text-outline font-semibold">
              Available Active Products
            </span>
            <Shield className="w-4 h-4 text-outline" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-on-surface font-metric-display">
              {activeProducts.length}
            </span>
            <span className="text-xs text-tertiary font-semibold">Ready for plans</span>
          </div>
          <div className="mt-2 text-on-surface-variant text-xs flex items-center justify-between pt-1 border-t border-outline-variant/10">
            <span>Strict Foreign Key Restrict active</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-xs uppercase text-outline font-semibold">
              Pricing Rigor
            </span>
            <RotateCw className="w-4 h-4 text-outline" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-on-surface font-metric-display">Decimal</span>
            <span className="text-xs font-semibold text-tertiary">Exact 12,2 Precision</span>
          </div>
          <div className="mt-2 text-on-surface-variant text-xs flex items-center justify-between pt-1 border-t border-outline-variant/10">
            <span>Historical contract immunity guaranteed</span>
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
            placeholder="Search plans by name, code or terms..."
            className="w-full h-10 pl-9 pr-4 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline text-sm border border-outline-variant/30 focus:outline-none focus:bg-surface-container-lowest"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Cadence Filters */}
          <div className="bg-surface-container-low p-1 rounded-xl flex items-center gap-1 flex-wrap">
            {['ALL', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'ONE_TIME'].map((cad) => (
              <button
                key={cad}
                type="button"
                onClick={() => {
                  setCadenceFilter(cad);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  cadenceFilter === cad
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {cad === 'ALL' ? 'All Cadences' : FREQUENCY_LABELS[cad as BillingFrequency]}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="bg-surface-container-low p-1 rounded-xl flex items-center gap-1">
            {['ALL', 'ACTIVE', 'INACTIVE'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
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

      {loading && (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* 4. Plan Cards Grid */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-2xl bg-surface-container-lowest p-6 border border-outline-variant/20 shadow-sm relative flex flex-col justify-between hover:border-outline-variant/40 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-on-surface">{plan.name}</h3>
                  <Badge variant={plan.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm">
                    {plan.status}
                  </Badge>
                </div>

                <div className="text-xs text-on-surface-variant font-data-mono mb-2">
                  Code: <strong className="text-on-surface">{plan.code}</strong>
                </div>

                {/* Product & Variant Association */}
                <div className="p-2.5 rounded-lg bg-surface-container-low text-xs mb-4">
                  <div>
                    Product: <strong className="text-on-surface">{plan.product?.name || 'Base'}</strong>
                  </div>
                  {plan.variant && (
                    <div className="text-[11px] text-on-surface-variant mt-0.5">
                      Variant: <strong className="text-primary">{plan.variant.name}</strong>
                    </div>
                  )}
                </div>

                {/* Pricing & Cadence */}
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-3xl font-extrabold text-on-surface font-data-mono">
                    {formatCurrencyINR(Number(plan.price))}
                  </span>
                  <span className="text-xs text-on-surface-variant font-medium">
                    / {FREQUENCY_LABELS[plan.billingFrequency]?.toLowerCase() || plan.billingFrequency.toLowerCase()}
                  </span>
                </div>

                {/* Lifecycle Terms */}
                <div className="grid grid-cols-3 gap-2 my-4 p-3 bg-surface-container-low rounded-xl text-xs text-center">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-outline block">Pause</span>
                    <strong className="text-on-surface text-xs">{plan.pauseLimitCycles} Cycles</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-outline block">Notice</span>
                    <strong className="text-on-surface text-xs">{plan.cancellationNoticeDays} Days</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-outline block">Trial</span>
                    <strong className="text-on-surface text-xs">{plan.trialPeriodDays} Days</strong>
                  </div>
                </div>

                {/* Features List */}
                {plan.features && plan.features.length > 0 && (
                  <div className="space-y-2 my-4">
                    <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-label-caps block">
                      Included Terms
                    </span>
                    {plan.features.slice(0, 4).map((feat: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-on-surface">
                        <CheckCircle2 className="w-3.5 h-3.5 text-tertiary shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(plan)}
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                >
                  Edit
                </Button>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    title={plan.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    onClick={() => handleTogglePlanStatus(plan)}
                  >
                    <Power
                      className={`w-4 h-4 ${plan.status === 'ACTIVE' ? 'text-tertiary' : 'text-outline'}`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Delete Plan"
                    onClick={() => handleDeletePlan(plan)}
                  >
                    <Trash2 className="w-4 h-4 text-error" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {plans.length === 0 && (
            <div className="col-span-3 py-12 text-center text-on-surface-variant text-sm bg-surface-container-lowest rounded-2xl border border-outline-variant/20">
              No subscription plans found matching your filter criteria.
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-5 py-3 border rounded-xl bg-surface-container-lowest flex items-center justify-between text-xs text-on-surface-variant">
          <span>
            Page {page} of {totalPages} ({totalCount} total plans)
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
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

      {/* 5. Create Plan Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Subscription Plan Blueprint"
        description="Configure pricing, billing intervals, lifecycle terms, and governance policies."
        maxWidth="lg"
      >
        <form onSubmit={handleCreatePlan} className="space-y-4">
          <Input
            label="Plan Display Name *"
            placeholder="e.g. Enterprise Custom Growth Tier"
            value={formName}
            onChange={(e: any) => setFormName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Plan Code *"
              placeholder="e.g. PLN-ENT-GROWTH"
              value={formCode}
              onChange={(e: any) => setFormCode(e.target.value)}
              required
            />
            <Input
              label="Recurring Price (INR) *"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 75000"
              value={formPrice}
              onChange={(e: any) => setFormPrice(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Associated Product */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-label-caps mb-1.5">
                Associated Active Product *
              </label>
              <select
                value={formProductId}
                onChange={(e: any) => {
                  setFormProductId(e.target.value);
                  setFormVariantId('');
                }}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none"
                required
              >
                {activeProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Associated Variant */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-label-caps mb-1.5">
                Product Variant (Optional)
              </label>
              <select
                value={formVariantId}
                onChange={(e: any) => setFormVariantId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none"
              >
                <option value="">Base Product (No specific variant)</option>
                {availableVariants.map((v: ProductVariant) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.code}) — {formatCurrencyINR(Number(v.price))}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-label-caps mb-1.5">
                Billing Cadence
              </label>
              <select
                value={formFreq}
                onChange={(e: any) => setFormFreq(e.target.value as BillingFrequency)}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="HALF_YEARLY">Half-Yearly</option>
                <option value="YEARLY">Yearly</option>
                <option value="ONE_TIME">One-Time</option>
              </select>
            </div>
            <Input
              label="Max Pause Cycles"
              type="number"
              min="0"
              max="24"
              value={formPauseCycles}
              onChange={(e: any) => setFormPauseCycles(e.target.value)}
            />
            <Input
              label="Notice (Days)"
              type="number"
              min="0"
              max="365"
              value={formNoticeDays}
              onChange={(e: any) => setFormNoticeDays(e.target.value)}
            />
            <Input
              label="Trial (Days)"
              type="number"
              min="0"
              max="90"
              value={formTrialDays}
              onChange={(e: any) => setFormTrialDays(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-label-caps mb-1.5">
              Included Terms & Features (1 per line)
            </label>
            <textarea
              rows={3}
              placeholder="Up to 10,000 active subscribers&#10;24/7 Priority support SLA&#10;Automated GST e-invoices"
              value={formFeatures}
              onChange={(e: any) => setFormFeatures(e.target.value)}
              className="w-full p-3 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
            <Button variant="outline" size="md" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" isLoading={submitting}>
              Save Plan Blueprint
            </Button>
          </div>
        </form>
      </Modal>

      {/* 6. Edit Plan Modal */}
      {editingPlan && (
        <Modal
          isOpen={true}
          onClose={() => setEditingPlan(null)}
          title={`Edit Plan: ${editingPlan.code}`}
          maxWidth="lg"
        >
          <form onSubmit={handleUpdatePlan} className="space-y-4">
            <Input
              label="Plan Name"
              value={editName}
              onChange={(e: any) => setEditName(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price (INR)"
                type="number"
                min="0"
                step="0.01"
                value={editPrice}
                onChange={(e: any) => setEditPrice(e.target.value)}
                required
              />
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-label-caps mb-1.5">
                  Billing Cadence
                </label>
                <select
                  value={editFreq}
                  onChange={(e: any) => setEditFreq(e.target.value as BillingFrequency)}
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="HALF_YEARLY">Half-Yearly</option>
                  <option value="YEARLY">Yearly</option>
                  <option value="ONE_TIME">One-Time</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Pause Cycles"
                type="number"
                value={editPauseCycles}
                onChange={(e: any) => setEditPauseCycles(e.target.value)}
              />
              <Input
                label="Notice (Days)"
                type="number"
                value={editNoticeDays}
                onChange={(e: any) => setEditNoticeDays(e.target.value)}
              />
              <Input
                label="Trial (Days)"
                type="number"
                value={editTrialDays}
                onChange={(e: any) => setEditTrialDays(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-label-caps mb-1.5">
                Features & Terms (1 per line)
              </label>
              <textarea
                rows={3}
                value={editFeatures}
                onChange={(e: any) => setEditFeatures(e.target.value)}
                className="w-full p-3 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
              <Button variant="outline" size="md" type="button" onClick={() => setEditingPlan(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit" isLoading={submitting}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
