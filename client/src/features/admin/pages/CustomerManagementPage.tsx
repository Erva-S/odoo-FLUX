import React, { useState } from 'react';
import {
  Building2,
  Users,
  ShieldCheck,
  AlertTriangle,
  Search,
  Download,
  Plus,
  TrendingUp,
  FileText,
  CreditCard,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '../../../components/ui/Badge.js';
import { Button } from '../../../components/ui/Button.js';
import { Modal } from '../../../components/ui/Modal.js';
import { Input } from '../../../components/ui/Input.js';

interface CustomerRecord {
  id: string;
  code: string;
  name: string;
  gstin: string;
  contactName: string;
  contactEmail: string;
  subscriptionsCount: number;
  lifetimeRevenue: string;
  balance: string;
  balanceStatus: 'nil' | 'due' | 'overdue';
  status: 'Active' | 'Grace Period' | 'Overdue' | 'Closed';
  tier: 'Enterprise' | 'Mid-Market' | 'Growth';
  state: string;
  mrr: string;
  contractTerm: string;
  healthScore: number;
}

const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    id: '1',
    code: 'INF-2091',
    name: 'Infosurge Tech Ltd',
    gstin: '27AABCI1234F1Z5',
    contactName: 'Naveen Kasturia',
    contactEmail: 'naveen@infosurge.io',
    subscriptionsCount: 3,
    lifetimeRevenue: '₹18,40,000',
    balance: '₹0 Nil',
    balanceStatus: 'nil',
    status: 'Active',
    tier: 'Enterprise',
    state: 'Maharashtra',
    mrr: '₹1,53,333',
    contractTerm: 'Annual Renewal (Nov 2026)',
    healthScore: 98,
  },
  {
    id: '2',
    code: 'KAI-8832',
    name: 'Kaizen Logistics Solutions',
    gstin: '29AAGCK9981K1Z2',
    contactName: 'Ananya Deshmukh',
    contactEmail: 'adeshmukh@kaizenlog.com',
    subscriptionsCount: 1,
    lifetimeRevenue: '₹9,80,000',
    balance: '₹1,12,000',
    balanceStatus: 'overdue',
    status: 'Overdue',
    tier: 'Mid-Market',
    state: 'Karnataka',
    mrr: '₹81,600',
    contractTerm: 'Quarterly Renewal',
    healthScore: 64,
  },
  {
    id: '3',
    code: 'ZEN-4102',
    name: 'Zenith FinTech Labs',
    gstin: '07AAACZ4421H1Z9',
    contactName: 'Vikram Malhotra',
    contactEmail: 'v.malhotra@zenithlabs.in',
    subscriptionsCount: 5,
    lifetimeRevenue: '₹34,20,000',
    balance: '₹0 Nil',
    balanceStatus: 'nil',
    status: 'Active',
    tier: 'Enterprise',
    state: 'Delhi NCR',
    mrr: '₹2,85,000',
    contractTerm: 'Multi-Year Enterprise',
    healthScore: 99,
  },
  {
    id: '4',
    code: 'CLD-1099',
    name: 'CloudPulse Networks',
    gstin: '33AABCC7712M1Z8',
    contactName: 'Rohan Mehra',
    contactEmail: 'rohan@cloudpulse.io',
    subscriptionsCount: 2,
    lifetimeRevenue: '₹4,50,000',
    balance: '₹42,500',
    balanceStatus: 'due',
    status: 'Grace Period',
    tier: 'Growth',
    state: 'Tamil Nadu',
    mrr: '₹37,500',
    contractTerm: 'Monthly Rolling',
    healthScore: 82,
  },
  {
    id: '5',
    code: 'BLU-3011',
    name: 'BlueHorizon Retail Analytics',
    gstin: '24AAACB9021D1Z1',
    contactName: 'Deepa Patel',
    contactEmail: 'deepa@bluehorizon.co.in',
    subscriptionsCount: 1,
    lifetimeRevenue: '₹1,20,000',
    balance: '₹0 Nil',
    balanceStatus: 'nil',
    status: 'Active',
    tier: 'Growth',
    state: 'Gujarat',
    mrr: '₹10,000',
    contractTerm: 'Annual Renewal',
    healthScore: 94,
  },
];

export function CustomerManagementPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>(INITIAL_CUSTOMERS);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('1');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'subs' | 'invoices' | 'payments' | 'audit'>('subs');

  const [newCompanyName, setNewCompanyName] = useState('');
  const [newGstin, setNewGstin] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newTier, setNewTier] = useState<'Enterprise' | 'Mid-Market' | 'Growth'>('Growth');

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch =
      cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.gstin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || cust.status === statusFilter;
    const matchesTier = tierFilter === 'all' || cust.tier.toLowerCase() === tierFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesTier;
  });

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName || !newContactEmail) return;

    const newCust: CustomerRecord = {
      id: String(Date.now()),
      code: `BL-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newCompanyName,
      gstin: newGstin || '27AAACB0000A1Z5',
      contactName: newContactName || 'Operations Contact',
      contactEmail: newContactEmail,
      subscriptionsCount: 1,
      lifetimeRevenue: '₹0',
      balance: '₹0 Nil',
      balanceStatus: 'nil',
      status: 'Active',
      tier: newTier,
      state: 'Maharashtra',
      mrr: '₹15,000',
      contractTerm: 'New Onboarding',
      healthScore: 100,
    };

    setCustomers([newCust, ...customers]);
    setSelectedCustomerId(newCust.id);
    setIsModalOpen(false);
    setNewCompanyName('');
    setNewGstin('');
    setNewContactName('');
    setNewContactEmail('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Metrics Block */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="relative overflow-hidden bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
              Total Portfolios
            </span>
            <span className="p-1.5 rounded-lg bg-surface-container-low text-primary">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-on-surface font-headline-xl">2,840</span>
            <Badge variant="success" size="sm">
              <TrendingUp className="w-3 h-3 inline mr-0.5" /> +8.4%
            </Badge>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-on-surface-variant">
            <span>Across 14 operational states</span>
            <span className="text-primary font-medium font-data-mono">Active Base</span>
          </div>
        </div>

        <div className="relative overflow-hidden bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
              Active Subscribers
            </span>
            <span className="p-1.5 rounded-lg bg-surface-container-low text-tertiary">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-on-surface font-headline-xl">1,428</span>
            <span className="text-xs text-on-surface-variant font-data-mono">50.28% ratio</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
              <div className="bg-tertiary h-full rounded-full" style={{ width: '50.28%' }} />
            </div>
            <span className="text-[11px] font-semibold text-tertiary font-data-mono">Healthy</span>
          </div>
        </div>

        <div className="relative overflow-hidden bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
              High-Value (₹10L+)
            </span>
            <span className="p-1.5 rounded-lg bg-surface-container-low text-secondary">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-on-surface font-headline-xl">312</span>
            <Badge variant="indigo" size="sm">
              ARR Driver
            </Badge>
          </div>
          <div className="mt-2 flex justify-between text-xs text-on-surface-variant">
            <span>Contributing 76.4% ARR</span>
            <span className="font-semibold text-on-surface font-data-mono">₹24.8 Cr</span>
          </div>
        </div>

        <div className="relative overflow-hidden bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-xs text-error uppercase tracking-wider font-semibold">
              At-Risk / Overdue
            </span>
            <span className="p-1.5 rounded-lg bg-error-container text-error">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-error font-headline-xl">18</span>
            <Badge variant="error" size="sm">
              Action Needed
            </Badge>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-on-surface-variant">
            <span>
              Arrears: <strong className="text-error font-data-mono">₹14.92 Lakh</strong>
            </span>
            <button className="text-primary font-medium hover:underline text-xs">Reconcile</button>
          </div>
        </div>
      </section>

      {/* 2. Filter Strip */}
      <section className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/20 shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[280px] flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by Name, GSTIN, Domain or Email..."
              className="w-full h-10 pl-9 pr-4 bg-surface-container-low rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest border border-outline-variant/30 transition-colors"
            />
          </div>

          <div className="flex items-center bg-surface-container-low p-1 rounded-lg gap-1">
            {['All', 'Active', 'Grace Period', 'Overdue', 'Closed'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="relative">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="h-10 pl-3 pr-8 rounded-lg bg-surface-container-low text-xs text-on-surface font-medium focus:outline-none cursor-pointer border border-outline-variant/30"
            >
              <option value="all">Enterprise Tier: All</option>
              <option value="enterprise">Tier 1: Enterprise (₹5L+)</option>
              <option value="mid-market">Tier 2: Mid-Market (₹1L-₹5L)</option>
              <option value="growth">Tier 3: Growth Starter</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end xl:self-auto">
          <Button variant="outline" size="md" leftIcon={<Download className="w-4 h-4" />}>
            Export GST CSV
          </Button>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            + Add Customer
          </Button>
        </div>
      </section>

      {/* 3. Master Data Matrix + Dynamic Customer 360 Slideout Layout */}
      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-6 items-start">
        <div className="2xl:col-span-7 flex flex-col gap-4">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 bg-surface-container-lowest flex items-center justify-between border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <h3 className="font-headline-sm text-base font-semibold text-on-surface">Client Registries</h3>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high font-data-mono text-[11px] text-on-surface-variant">
                  Showing {filteredCustomers.length} of {customers.length}
                </span>
              </div>
              <div className="text-xs text-on-surface-variant font-label-default">Sorted by: High ARR</div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase tracking-wider font-semibold select-none border-b border-outline-variant/20">
                    <th className="py-3 px-4">Customer & GSTIN</th>
                    <th className="py-3 px-3">Contact</th>
                    <th className="py-3 px-3 text-center">Subs</th>
                    <th className="py-3 px-3 text-right">Lifetime Rev</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-sm">
                  {filteredCustomers.map((cust) => {
                    const isSelected = cust.id === selectedCustomerId;
                    return (
                      <tr
                        key={cust.id}
                        onClick={() => setSelectedCustomerId(cust.id)}
                        className={`cursor-pointer transition-colors duration-150 ${
                          isSelected
                            ? 'bg-primary-fixed/30 border-l-4 border-primary'
                            : 'hover:bg-surface-container-low/60'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary-container text-on-primary font-semibold flex items-center justify-center shrink-0 shadow-sm text-xs">
                              {cust.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-on-surface truncate text-sm">{cust.name}</span>
                              <span className="font-data-mono text-[11px] text-on-surface-variant truncate">
                                GST: {cust.gstin}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-on-surface truncate">{cust.contactName}</span>
                            <span className="text-[11px] text-on-surface-variant truncate">{cust.contactEmail}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-surface-container text-primary font-data-mono text-xs font-semibold">
                            {cust.subscriptionsCount}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-data-mono font-medium text-xs text-on-surface">
                          {cust.lifetimeRevenue}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Badge
                            variant={
                              cust.status === 'Active'
                                ? 'success'
                                : cust.status === 'Grace Period'
                                ? 'warning'
                                : cust.status === 'Overdue'
                                ? 'error'
                                : 'neutral'
                            }
                            size="sm"
                          >
                            {cust.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <ChevronRight
                            className={`w-4 h-4 ml-auto transition-transform ${
                              isSelected ? 'text-primary translate-x-1' : 'text-outline'
                            }`}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Customer 360 Inspection Card */}
        <div className="2xl:col-span-5 flex flex-col gap-4">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm p-6 sticky top-20">
            <div className="flex items-start justify-between pb-5 border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary text-on-primary font-bold text-lg flex items-center justify-center shadow-md">
                  {selectedCustomer.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-on-surface font-headline-sm">{selectedCustomer.name}</h2>
                    <Badge variant="primary" size="sm">
                      {selectedCustomer.tier}
                    </Badge>
                  </div>
                  <div className="text-xs text-on-surface-variant font-data-mono mt-0.5">
                    ID: {selectedCustomer.code} • GST: {selectedCustomer.gstin}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 my-4 p-3 bg-surface-container-low rounded-xl">
              <div>
                <span className="text-[10px] uppercase font-semibold text-outline tracking-wider font-label-caps">
                  Run Rate
                </span>
                <p className="text-sm font-bold text-on-surface font-data-mono mt-0.5">{selectedCustomer.mrr}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-outline tracking-wider font-label-caps">
                  Health
                </span>
                <p className="text-sm font-bold text-tertiary font-data-mono mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {selectedCustomer.healthScore}/100
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-outline tracking-wider font-label-caps">
                  Balance
                </span>
                <p className="text-sm font-bold text-on-surface font-data-mono mt-0.5">{selectedCustomer.balance}</p>
              </div>
            </div>

            <div className="flex border-b border-outline-variant/20 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('subs')}
                className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'subs' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'
                }`}
              >
                Subscriptions ({selectedCustomer.subscriptionsCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('invoices')}
                className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'invoices' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'
                }`}
              >
                Invoices
              </button>
            </div>

            {activeTab === 'subs' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-lg border border-outline-variant/20 bg-surface-container-lowest">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-on-surface">Core Subscription Suite</h4>
                      <p className="text-xs text-on-surface-variant">50 Seats • Billed Annually</p>
                    </div>
                    <Badge variant="success" size="sm">
                      Active
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Customer Portfolio"
        description="Register a corporate client for subscription billing."
      >
        <form onSubmit={handleAddCustomer} className="space-y-4">
          <Input
            label="Company Name"
            placeholder="Acme Corp"
            value={newCompanyName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCompanyName(e.target.value)}
            required
          />
          <Input
            label="Contact Email"
            type="email"
            placeholder="billing@acme.com"
            value={newContactEmail}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewContactEmail(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button variant="outline" size="md" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Register Portfolio
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
