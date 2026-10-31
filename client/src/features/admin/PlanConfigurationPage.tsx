import React, { useState } from 'react';
import {
  Layers,
  PauseCircle,
  RotateCw,
  TrendingUp,
  Download,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  Edit2,
  Trash2,
  ArrowRight,
  Settings2,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Modal } from '../../components/ui/Modal.js';
import { Input } from '../../components/ui/Input.js';

interface PlanDefinition {
  id: string;
  name: string;
  code: string;
  price: string;
  period: 'month' | 'year';
  activeTenants: number;
  pauseLimitCycles: number;
  cancellationNoticeDays: number;
  autoRenew: boolean;
  popular?: boolean;
  features: string[];
}

const INITIAL_PLANS: PlanDefinition[] = [
  {
    id: 'plan-1',
    name: 'Growth Starter',
    code: 'PLN-START-V2',
    price: '₹14,999',
    period: 'month',
    activeTenants: 480,
    pauseLimitCycles: 1,
    cancellationNoticeDays: 14,
    autoRenew: true,
    features: [
      'Up to 1,000 active subscribers',
      'Automated GST e-invoices',
      'Standard email dunning',
      'Community support SLA',
    ],
  },
  {
    id: 'plan-2',
    name: 'Professional Scale',
    code: 'PLN-PRO-V2',
    price: '₹49,999',
    period: 'month',
    activeTenants: 812,
    pauseLimitCycles: 2,
    cancellationNoticeDays: 30,
    autoRenew: true,
    popular: true,
    features: [
      'Up to 10,000 active subscribers',
      'NPCI AutoPay & e-Mandate fallback',
      'Multi-currency billing (INR, USD)',
      'FinOps cohort analytics',
      '24/7 Priority support SLA',
    ],
  },
  {
    id: 'plan-3',
    name: 'Enterprise Apex',
    code: 'PLN-ENT-V2',
    price: '₹1,45,000',
    period: 'month',
    activeTenants: 136,
    pauseLimitCycles: 3,
    cancellationNoticeDays: 60,
    autoRenew: true,
    features: [
      'Unlimited subscription portfolios',
      'Dedicated NIC GST e-Invoice Gateway',
      'Custom webhook triggers & event streams',
      'Tailored clawback & early termination rules',
      'Designated enterprise account manager',
    ],
  },
];

export function PlanConfigurationPage() {
  const [plans, setPlans] = useState<PlanDefinition[]>(INITIAL_PLANS);
  const [cadenceFilter, setCadenceFilter] = useState<'all' | 'month' | 'year'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New plan state
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newPeriod, setNewPeriod] = useState<'month' | 'year'>('month');
  const [newPauseCycles, setNewPauseCycles] = useState(2);
  const [newNoticeDays, setNewNoticeDays] = useState(30);

  const filteredPlans = plans.filter((p) => {
    if (cadenceFilter === 'all') return true;
    return p.period === cadenceFilter;
  });

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice) return;

    const plan: PlanDefinition = {
      id: `plan-${Date.now()}`,
      name: newName,
      code: newCode || `PLN-${newName.substring(0, 4).toUpperCase()}`,
      price: newPrice.startsWith('₹') ? newPrice : `₹${newPrice}`,
      period: newPeriod,
      activeTenants: 0,
      pauseLimitCycles: newPauseCycles,
      cancellationNoticeDays: newNoticeDays,
      autoRenew: true,
      features: ['Automated recurring billing', 'Real-time ledger updates', 'Tax compliant receipts'],
    };

    setPlans([...plans, plan]);
    setIsModalOpen(false);
    setNewName('');
    setNewCode('');
    setNewPrice('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Context Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-xs font-semibold font-label-caps uppercase tracking-wider">
              Plan Architect
            </span>
            <span className="text-outline text-xs">•</span>
            <span className="font-data-mono text-xs text-outline">v2.4.9 Engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface font-headline-xl">
            Subscription Plans
          </h1>
          <p className="text-sm text-on-surface-variant font-body-default mt-1">
            Define recurring billing frequencies, renewal rules, pause limits, and early closure
            policies across product catalogs.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start lg:self-center">
          <Button variant="outline" size="md" leftIcon={<Download className="w-4 h-4" />}>
            Export Rules JSON
          </Button>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            + Create Plan
          </Button>
        </div>
      </div>

      {/* 2. KPI / Micro Health Bar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-xs uppercase text-outline font-semibold">
              Active Plan Blueprints
            </span>
            <Layers className="w-4 h-4 text-outline" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-on-surface font-metric-display">
              {plans.length}
            </span>
            <Badge variant="success" size="sm">
              96% Live
            </Badge>
          </div>
          <div className="mt-2 text-on-surface-variant text-xs flex items-center justify-between pt-1 border-t border-outline-variant/10">
            <span>4 Frequencies</span>
            <span className="font-data-mono text-tertiary font-semibold">+2 Scheduled</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-xs uppercase text-outline font-semibold">
              Pause Guard Triggered
            </span>
            <PauseCircle className="w-4 h-4 text-outline" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-on-surface font-metric-display">42</span>
            <span className="text-xs text-on-surface-variant">tenants</span>
          </div>
          <div className="mt-2 text-on-surface-variant text-xs flex items-center justify-between pt-1 border-t border-outline-variant/10">
            <span>Max 2 cycles enforcement</span>
            <span className="font-data-mono text-on-surface font-medium">98.2% restored</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-xs uppercase text-outline font-semibold">
              Auto-Close Clawbacks
            </span>
            <AlertCircle className="w-4 h-4 text-outline" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-on-surface font-metric-display">₹1,48,200</span>
          </div>
          <div className="mt-2 text-on-surface-variant text-xs flex items-center justify-between pt-1 border-t border-outline-variant/10">
            <span>Penalty yield</span>
            <span className="font-data-mono text-tertiary font-semibold">+12.4% MoM</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-xs uppercase text-outline font-semibold">
              Auto-Renewal Velocity
            </span>
            <RotateCw className="w-4 h-4 text-outline" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-on-surface font-metric-display">91.8%</span>
            <span className="text-xs font-semibold text-tertiary">↑ High</span>
          </div>
          <div className="mt-2 text-on-surface-variant text-xs flex items-center justify-between pt-1 border-t border-outline-variant/10">
            <span>7-day notification rule</span>
            <span className="font-data-mono text-on-surface font-medium">1,840 pending</span>
          </div>
        </div>
      </div>

      {/* 3. Cadence Segmented Filter */}
      <div className="flex items-center gap-2">
        <div className="bg-surface-container-low p-1 rounded-xl flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCadenceFilter('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              cadenceFilter === 'all'
                ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            All Plans
          </button>
          <button
            type="button"
            onClick={() => setCadenceFilter('month')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              cadenceFilter === 'month'
                ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Monthly Cadence
          </button>
          <button
            type="button"
            onClick={() => setCadenceFilter('year')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              cadenceFilter === 'year'
                ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Annual Cadence
          </button>
        </div>
      </div>

      {/* 4. Plan Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-2xl bg-surface-container-lowest p-6 border shadow-sm relative flex flex-col justify-between transition-all ${
              plan.popular
                ? 'border-primary ring-2 ring-primary/20 shadow-md'
                : 'border-outline-variant/20 hover:border-outline-variant/40'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="primary" size="sm">
                  Most Popular Enterprise Choice
                </Badge>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-on-surface">{plan.name}</h3>
                <span className="font-data-mono text-[11px] text-outline">{plan.code}</span>
              </div>

              <div className="flex items-baseline gap-1 my-4">
                <span className="text-3xl font-extrabold text-on-surface font-data-mono">
                  {plan.price}
                </span>
                <span className="text-xs text-on-surface-variant font-medium">
                  / {plan.period === 'month' ? 'month' : 'year'}
                </span>
              </div>

              {/* Policy Badges */}
              <div className="grid grid-cols-2 gap-2 my-4 p-3 bg-surface-container-low rounded-xl text-xs">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-outline">
                    Pause Limit
                  </span>
                  <p className="font-bold text-on-surface mt-0.5">
                    {plan.pauseLimitCycles} Cycles max
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-outline">
                    Cancellation
                  </span>
                  <p className="font-bold text-on-surface mt-0.5">
                    {plan.cancellationNoticeDays} Days Notice
                  </p>
                </div>
              </div>

              {/* Feature Inclusions */}
              <div className="space-y-2.5 my-5">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-label-caps">
                  Included Governance Rules
                </span>
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-on-surface">
                    <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between">
              <span className="text-xs text-on-surface-variant font-data-mono">
                {plan.activeTenants} active contracts
              </span>
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Configure Rules
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* 5. Create Plan Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Subscription Plan Blueprint"
        description="Configure pricing schedule, lifecycle terms, and governance policies."
        maxWidth="lg"
      >
        <form onSubmit={handleCreatePlan} className="space-y-4">
          <Input
            label="Plan Display Name"
            placeholder="e.g. Enterprise Custom Growth Tier"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Plan Code"
              placeholder="e.g. PLN-ENT-GROWTH"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
            />
            <Input
              label="Recurring Price (INR)"
              placeholder="e.g. 75000"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant font-label-caps mb-1.5">
                Cadence
              </label>
              <select
                value={newPeriod}
                onChange={(e) => setNewPeriod(e.target.value as any)}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface text-sm focus:outline-none"
              >
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </div>
            <Input
              label="Max Pause Cycles"
              type="number"
              min={0}
              max={12}
              value={newPauseCycles}
              onChange={(e) => setNewPauseCycles(parseInt(e.target.value, 10) || 0)}
            />
            <Input
              label="Notice Period (Days)"
              type="number"
              min={0}
              max={180}
              value={newNoticeDays}
              onChange={(e) => setNewNoticeDays(parseInt(e.target.value, 10) || 0)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
            <Button variant="outline" size="md" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Save Plan Blueprint
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

