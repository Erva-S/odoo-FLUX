import React, { useState, useEffect } from 'react';
import { fetchAdminDashboard } from '../../../services/admin.service.js';
import { AdminDashboardData } from '../../../types/dashboard.js';
import { DunningAlertBanner } from '../../../components/common/DunningAlertBanner.js';
import {
  Calendar,
  Filter,
  Download,
  Plus,
  TrendingUp,
  RotateCw,
  Wallet,
  Hourglass,
  AlertOctagon,
  Database,
  Users,
  Shield,
  Activity,
  ArrowUpRight,
  Loader2,
  Info,
} from 'lucide-react';

export function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR'>('INR');
  const [segment, setSegment] = useState<'ALL' | 'ENTERPRISE' | 'SMB'>('ALL');

  useEffect(() => {
    fetchAdminDashboard()
      .then((res) => setData(res))
      .catch((err) => console.error('Failed to fetch dashboard metrics:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-xs text-on-surface-variant font-medium">Loading FinOps Control Center...</p>
      </div>
    );
  }

  const summary = data?.financialSummary;

  return (
    <div className="space-y-6">
      {/* Top Urgent Notice Banner */}
      <DunningAlertBanner
        overdueCount={summary?.overdueInvoices.invoiceCount || 12}
        amountAtRisk={summary?.overdueInvoices.formatted || '₹1,84,500'}
      />

      {/* Workspace Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant/30">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Date Selector */}
          <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg text-on-surface shadow-sm text-xs font-semibold">
            <Calendar className="w-4 h-4 text-outline" />
            <span>Apr 1 – Apr 30, 2025</span>
            <span className="text-[10px] text-outline px-1.5 py-0.5 bg-surface-container-lowest rounded">
              Q1 FY25-26
            </span>
          </div>

          {/* Currency Switcher */}
          <div className="flex items-center bg-surface-container-low p-0.5 rounded-lg shadow-sm">
            <button
              onClick={() => setCurrency('INR')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                currency === 'INR'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              INR <span className="text-primary font-bold">₹</span>
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                currency === 'USD'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              USD $
            </button>
            <button
              onClick={() => setCurrency('EUR')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                currency === 'EUR'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              EUR €
            </button>
          </div>

          {/* Segment Filter View */}
          <div className="hidden sm:flex items-center bg-surface-container-low p-0.5 rounded-lg shadow-sm">
            <button
              onClick={() => setSegment('ALL')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                segment === 'ALL'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              All Entities
            </button>
            <button
              onClick={() => setSegment('ENTERPRISE')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                segment === 'ENTERPRISE'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Enterprise B2B
            </button>
            <button
              onClick={() => setSegment('SMB')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                segment === 'SMB'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Self-serve SMB
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button className="h-9 px-3 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm">
            <Filter className="w-3.5 h-3.5 text-outline" />
            <span>Filter</span>
          </button>
          <button className="h-9 px-3 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm">
            <Download className="w-3.5 h-3.5 text-outline" />
            <span>Export GST</span>
          </button>
          <a
            href="/admin/subscriptions"
            className="h-9 px-3.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Subscription</span>
          </a>
        </div>
      </div>

      {/* 5 Financial Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: MRR */}
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between text-outline">
              <span className="text-[11px] uppercase tracking-wider font-semibold">
                Monthly Recurring Rev
              </span>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div className="pt-2">
              <div className="font-heading text-2xl font-bold text-on-surface tracking-tight">
                {summary?.mrr.formatted}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container font-semibold flex items-center">
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  +{summary?.mrr.changePercent}%
                </span>
                <span className="text-[11px] text-on-surface-variant">vs last month</span>
              </div>
            </div>
          </div>
          {/* Sparkline */}
          <div className="pt-4">
            <svg className="w-full h-7 text-secondary" fill="none" viewBox="0 0 100 24">
              <path
                d="M0 19 L15 17 L30 14 L45 16 L60 10 L75 11 L90 5 L100 3"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <path
                d="M0 19 L15 17 L30 14 L45 16 L60 10 L75 11 L90 5 L100 3 L100 24 L0 24 Z"
                fill="currentColor"
                fillOpacity="0.08"
              />
            </svg>
          </div>
        </div>

        {/* Card 2: Active Subscriptions */}
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between text-outline">
              <span className="text-[11px] uppercase tracking-wider font-semibold">
                Active Subscriptions
              </span>
              <RotateCw className="w-4 h-4 text-secondary" />
            </div>
            <div className="pt-2">
              <div className="font-heading text-2xl font-bold text-on-surface tracking-tight">
                {summary?.activeSubscriptions.value.toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container font-semibold">
                  +{summary?.activeSubscriptions.netAddition} Net
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  {summary?.activeSubscriptions.churnRate}% Churn
                </span>
              </div>
            </div>
          </div>
          <div className="pt-4 flex items-center justify-between text-outline text-[11px]">
            <span>Enterprise: <strong className="text-on-surface">{summary?.activeSubscriptions.enterpriseCount}</strong></span>
            <span>SMB: <strong className="text-on-surface">{summary?.activeSubscriptions.proStarterCount}</strong></span>
          </div>
        </div>

        {/* Card 3: Revenue Collected */}
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between text-outline">
              <span className="text-[11px] uppercase tracking-wider font-semibold">
                Revenue Collected
              </span>
              <Wallet className="w-4 h-4 text-primary" />
            </div>
            <div className="pt-2">
              <div className="font-heading text-2xl font-bold text-on-surface tracking-tight">
                {summary?.revenueCollected.formatted}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface font-semibold">
                  {summary?.revenueCollected.collectionRate}% Rate
                </span>
                <span className="text-[11px] text-on-surface-variant">Collection eff.</span>
              </div>
            </div>
          </div>
          <div className="pt-4">
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
              <div
                className="bg-secondary h-full rounded-full"
                style={{ width: `${summary?.revenueCollected.collectionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Outstanding Balance */}
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between text-outline">
              <span className="text-[11px] uppercase tracking-wider font-semibold">
                Outstanding Balance
              </span>
              <Hourglass className="w-4 h-4 text-tertiary" />
            </div>
            <div className="pt-2">
              <div className="font-heading text-2xl font-bold text-on-surface tracking-tight">
                {summary?.outstandingPayments.formatted}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-semibold">
                  {summary?.outstandingPayments.accountCount} Accounts
                </span>
                <span className="text-[11px] text-on-surface-variant">Net-15</span>
              </div>
            </div>
          </div>
          <div className="pt-4 flex items-center justify-between text-[11px] text-outline">
            <span>In Grace:</span>
            <span className="text-on-surface font-semibold">
              ₹{summary?.outstandingPayments.inGracePeriod.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 5: Overdue Invoices */}
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between text-outline">
              <span className="text-[11px] uppercase tracking-wider font-semibold">
                Overdue Invoices
              </span>
              <AlertOctagon className="w-4 h-4 text-error" />
            </div>
            <div className="pt-2">
              <div className="font-heading text-2xl font-bold text-error tracking-tight">
                {summary?.overdueInvoices.formatted}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-error-container text-error font-semibold">
                  {summary?.overdueInvoices.invoiceCount} Invoices
                </span>
                <span className="text-[11px] text-error font-medium">&gt; 30 Days</span>
              </div>
            </div>
          </div>
          <div className="pt-4 flex items-center justify-between text-[11px] text-outline">
            <span>Dunning:</span>
            <span className="text-error font-semibold">
              {summary?.overdueInvoices.dunningStage}
            </span>
          </div>
        </div>
      </div>

      {/* Note indicator for Phase 1 mock placeholders vs real system metrics */}
      <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/30 flex items-center gap-3 text-xs text-on-surface-variant">
        <Info className="w-4 h-4 text-primary flex-shrink-0" />
        <span>
          <strong>Phase 1 Architecture Note:</strong> Financial metrics above render the approved Subscriptly UI specifications with mock financial telemetry. User accounts, staff provisioning, authentication tokens, and audit logs below are live from PostgreSQL.
        </span>
      </div>

      {/* Two-Column Grid: Live Database State & Recent System Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live System Database Telemetry (4 columns) */}
        <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <h3 className="font-heading text-sm font-semibold text-on-surface flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                <span>PostgreSQL DB Baseline</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary-container text-on-secondary-container">
                {data?.system.databaseStatus}
              </span>
            </div>
            <div className="space-y-3 py-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low/70">
                <div className="flex items-center gap-2 text-xs">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="font-medium">Total Registered Users</span>
                </div>
                <span className="font-heading font-bold text-base text-on-surface">
                  {data?.system.totalUsers}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low/70">
                <div className="flex items-center gap-2 text-xs">
                  <Shield className="w-4 h-4 text-secondary" />
                  <span className="font-medium">Active Staff Accounts</span>
                </div>
                <span className="font-heading font-bold text-base text-on-surface">
                  {data?.system.totalStaff}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low/70">
                <div className="flex items-center gap-2 text-xs">
                  <Activity className="w-4 h-4 text-tertiary" />
                  <span className="font-medium">Customer Portals</span>
                </div>
                <span className="font-heading font-bold text-base text-on-surface">
                  {data?.system.totalCustomers}
                </span>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-outline-variant/20 text-[11px] text-outline flex items-center justify-between">
            <span>Milestone: Phase 1 Foundation</span>
            <span>Schema: Prisma ORM</span>
          </div>
        </div>

        {/* Live Recent Activity Log from PostgreSQL (8 columns) */}
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <h3 className="font-heading text-sm font-semibold text-on-surface flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <span>Audit & Security Ledger</span>
              </h3>
              <span className="text-xs text-outline font-medium">Real-time Events</span>
            </div>

            <div className="divide-y divide-outline-variant/20 overflow-x-auto">
              {data?.recentActivity && data.recentActivity.length > 0 ? (
                data.recentActivity.map((log) => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      <span className="font-semibold text-on-surface truncate">{log.action}</span>
                      <span className="text-outline truncate">on {log.entityType}</span>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0 text-[11px]">
                      <span className="text-on-surface-variant font-medium">{log.user}</span>
                      <span className="text-outline">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-outline">
                  No activity logs recorded yet.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-outline-variant/20 text-right">
            <span className="text-[11px] text-outline">Immutable audit records written to database</span>
          </div>
        </div>
      </div>
    </div>
  );
}
