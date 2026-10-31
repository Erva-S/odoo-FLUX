import React, { useState } from 'react';
import {
  Package,
  Layers,
  TrendingUp,
  Search,
  Filter,
  Download,
  Plus,
  Tag,
  Boxes,
  CheckCircle2,
  ChevronRight,
  Edit2,
  Trash2,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '../../../components/ui/Badge.js';
import { Button } from '../../../components/ui/Button.js';
import { Modal } from '../../../components/ui/Modal.js';
import { Input } from '../../../components/ui/Input.js';

interface ProductItem {
  id: string;
  sku: string;
  name: string;
  category: 'Core SaaS' | 'Add-on' | 'Connector' | 'Service';
  basePrice: string;
  billingFrequency: 'Monthly' | 'Quarterly' | 'Annual';
  variantsCount: number;
  status: 'Active' | 'Draft' | 'Deprecated';
  description: string;
}

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-1',
    sku: 'SUB-CORE-001',
    name: 'Subscriptly Enterprise Engine',
    category: 'Core SaaS',
    basePrice: '₹45,000 / mo',
    billingFrequency: 'Monthly',
    variantsCount: 3,
    status: 'Active',
    description: 'Complete recurring billing and dunning management engine with enterprise SLA.',
  },
  {
    id: 'prod-2',
    sku: 'SUB-ANL-002',
    name: 'Real-time FinOps Telemetry',
    category: 'Add-on',
    basePrice: '₹12,500 / mo',
    billingFrequency: 'Monthly',
    variantsCount: 2,
    status: 'Active',
    description: 'Live cohort retention, MRR forecasts, and automated tax accounting analytics.',
  },
  {
    id: 'prod-3',
    sku: 'SUB-GST-003',
    name: 'India GST & e-Invoice Connector',
    category: 'Connector',
    basePrice: '₹9,000 / mo',
    billingFrequency: 'Annual',
    variantsCount: 1,
    status: 'Active',
    description: 'Direct NIC / GSTN government portal bridge with instant IRN & QR generation.',
  },
  {
    id: 'prod-4',
    sku: 'SUB-MAND-004',
    name: 'NPCI e-Mandate & Razorpay AutoPay',
    category: 'Connector',
    basePrice: '₹15,000 / mo',
    billingFrequency: 'Monthly',
    variantsCount: 4,
    status: 'Active',
    description: 'Multi-bank recurring debit engine with automatic retry cascades and dispute triage.',
  },
  {
    id: 'prod-5',
    sku: 'SUB-MIGR-005',
    name: 'White-glove Legacy Migration',
    category: 'Service',
    basePrice: '₹75,000 one-off',
    billingFrequency: 'Annual',
    variantsCount: 1,
    status: 'Active',
    description: 'Dedicated database schema extraction and historical ledger import package.',
  },
];

export function ProductManagementPage() {
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New product form
  const [newName, setNewName] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newCategory, setNewCategory] = useState<ProductItem['category']>('Core SaaS');
  const [newBasePrice, setNewBasePrice] = useState('');
  const [newFreq, setNewFreq] = useState<ProductItem['billingFrequency']>('Monthly');
  const [newDesc, setNewDesc] = useState('');

  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || prod.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newSku) return;

    const item: ProductItem = {
      id: `prod-${Date.now()}`,
      sku: newSku.toUpperCase(),
      name: newName,
      category: newCategory,
      basePrice: newBasePrice || '₹10,000 / mo',
      billingFrequency: newFreq,
      variantsCount: 1,
      status: 'Active',
      description: newDesc || 'Brightloop Software catalog item.',
    };

    setProducts([item, ...products]);
    setIsModalOpen(false);
    setNewName('');
    setNewSku('');
    setNewBasePrice('');
    setNewDesc('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Catalog Overview */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-outline text-xs uppercase tracking-wider font-semibold font-label-caps mb-1">
            <span>Catalog Architecture</span>
            <span>•</span>
            <span className="text-tertiary font-bold">Live Production</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface font-headline-xl">
            Products & Catalog
          </h1>
          <p className="text-sm text-on-surface-variant font-body-default mt-1">
            Configure software licenses, add-ons, pricing models, and variant tiers for Brightloop
            Software.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="md" leftIcon={<Download className="w-4 h-4" />}>
            Export Matrix
          </Button>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Create Product
          </Button>
        </div>
      </div>

      {/* 2. Catalog Summary KPI Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Base Products */}
        <div className="rounded-xl bg-surface-container-lowest p-5 border border-outline-variant/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-xs uppercase tracking-wider text-outline font-semibold">
              Base Catalog Products
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-data-mono text-[11px]">
              SKU Root
            </span>
          </div>
          <div className="my-3 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-on-surface font-metric-display">
              {products.length}
            </span>
            <span className="text-xs font-semibold text-tertiary flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +2 this cycle
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1 border-t border-outline-variant/10">
            <span>
              Active SaaS: <strong className="text-on-surface">11</strong>
            </span>
            <span>
              Add-ons: <strong className="text-on-surface">3</strong>
            </span>
          </div>
        </div>

        {/* Active Variants */}
        <div className="rounded-xl bg-surface-container-lowest p-5 border border-outline-variant/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-xs uppercase tracking-wider text-outline font-semibold">
              Active SKUs & Modifiers
            </span>
            <Badge variant="indigo" size="sm">
              42 SKUs
            </Badge>
          </div>
          <div className="my-3 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-on-surface font-metric-display">42</span>
            <span className="text-xs font-semibold text-secondary flex items-center gap-0.5">
              <Boxes className="w-3.5 h-3.5" /> 3.0 per Base
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1 border-t border-outline-variant/10">
            <span>
              Enterprise Add-ons: <strong className="text-on-surface">28</strong>
            </span>
            <span>
              Connectors: <strong className="text-on-surface">14</strong>
            </span>
          </div>
        </div>

        {/* Catalog Recurring Volume */}
        <div className="rounded-xl bg-surface-container-lowest p-5 border border-outline-variant/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-xs uppercase tracking-wider text-outline font-semibold">
              Recurring Catalog Pipeline
            </span>
            <Badge variant="success" size="sm">
              ARR Potential
            </Badge>
          </div>
          <div className="my-3 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-on-surface font-metric-display">₹1.4 Cr</span>
            <span className="text-xs font-semibold text-tertiary flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +18.4% YoY
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1 border-t border-outline-variant/10">
            <span>Target Expansion MRR</span>
            <span className="font-semibold text-on-surface font-data-mono">₹11.67 L/mo</span>
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
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by product name, SKU or tag..."
            className="w-full h-10 pl-9 pr-4 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline text-sm border border-outline-variant/30 focus:outline-none focus:bg-surface-container-lowest"
          />
        </div>

        <div className="flex items-center bg-surface-container-low p-1 rounded-lg gap-1">
          {['All', 'Core SaaS', 'Add-on', 'Connector', 'Service'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
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
      </div>

      {/* 4. Products Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant/20 flex items-center justify-between">
          <h3 className="font-headline-sm text-base font-semibold text-on-surface">
            Active Catalog Entities ({filteredProducts.length})
          </h3>
          <span className="text-xs text-on-surface-variant">
            Displaying configured SKUs with active pricing rules
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase tracking-wider font-semibold select-none border-b border-outline-variant/20">
                <th className="py-3 px-4">Product & SKU</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Base Price</th>
                <th className="py-3 px-3">Cadence</th>
                <th className="py-3 px-3 text-center">Variants</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-sm">
              {filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-surface-container-high text-primary flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-on-surface">{prod.name}</div>
                        <div className="text-[11px] font-data-mono text-outline">{prod.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex px-2 py-0.5 rounded bg-surface-container text-xs font-medium text-on-surface-variant">
                      {prod.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-on-surface font-data-mono text-xs">
                    {prod.basePrice}
                  </td>
                  <td className="py-3 px-3 text-xs text-on-surface-variant">
                    {prod.billingFrequency}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex px-2 py-0.5 rounded-full bg-surface-container-high text-xs font-data-mono font-medium">
                      {prod.variantsCount} SKUs
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Badge variant="success" size="sm">
                      {prod.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Boxes className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Create Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Catalog Product"
        description="Define a core software tier, add-on capability, or integration bridge."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <Input
            label="Product Name"
            placeholder="e.g. Subscriptly Custom Domain Gateway"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Root SKU Code"
              placeholder="e.g. SUB-DOM-006"
              value={newSku}
              onChange={(e) => setNewSku(e.target.value)}
              required
            />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-label-caps mb-1.5">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none"
              >
                <option value="Core SaaS">Core SaaS</option>
                <option value="Add-on">Add-on</option>
                <option value="Connector">Connector</option>
                <option value="Service">Service</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Base Price (INR)"
              placeholder="e.g. ₹20,000 / mo"
              value={newBasePrice}
              onChange={(e) => setNewBasePrice(e.target.value)}
            />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-label-caps mb-1.5">
                Billing Cadence
              </label>
              <select
                value={newFreq}
                onChange={(e) => setNewFreq(e.target.value as any)}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none"
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annual">Annual</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-label-caps mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Detailed billing specifications and tier inclusions..."
              className="w-full p-3 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
            <Button variant="outline" size="md" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Save Product
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

