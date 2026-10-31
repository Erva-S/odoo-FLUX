import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import {
  Shield,
  Users,
  RotateCw,
  FileText,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function StaffDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary-container text-on-secondary-container">
              <Shield className="w-3.5 h-3.5" />
              Staff Operations Portal
            </span>
            <span className="text-xs text-outline font-medium">Tier 2 Clearance</span>
          </div>
          <h1 className="font-heading text-xl font-bold text-on-surface">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Operational dashboard for subscriber account triage, quotation reviews, and billing assistance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-outline block">Signed in as</span>
            <span className="text-xs font-semibold text-on-surface">{user?.email}</span>
          </div>
        </div>
      </div>

      {/* Operational Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm">
          <div className="flex items-center justify-between text-outline text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Subscribers In Queue</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="font-heading text-2xl font-bold text-on-surface">42</div>
          <div className="text-[11px] text-on-surface-variant mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-secondary" />
            <span>Avg response time: 14 mins</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm">
          <div className="flex items-center justify-between text-outline text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Quotations Pending</span>
            <FileText className="w-4 h-4 text-tertiary" />
          </div>
          <div className="font-heading text-2xl font-bold text-on-surface">8</div>
          <div className="text-[11px] text-on-surface-variant mt-1 flex items-center gap-1">
            <span>₹3,40,000 Pipeline</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm">
          <div className="flex items-center justify-between text-outline text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Renewals Today</span>
            <RotateCw className="w-4 h-4 text-secondary" />
          </div>
          <div className="font-heading text-2xl font-bold text-on-surface">19</div>
          <div className="text-[11px] text-secondary font-medium mt-1">
            96% Auto-retry success
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm">
          <div className="flex items-center justify-between text-outline text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Payment Tickets</span>
            <CreditCard className="w-4 h-4 text-error" />
          </div>
          <div className="font-heading text-2xl font-bold text-error">3</div>
          <div className="text-[11px] text-error font-medium mt-1">
            Action needed (failed Webhook)
          </div>
        </div>
      </div>

      {/* Operational Queue and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-sm">
          <h2 className="font-heading text-sm font-semibold text-on-surface mb-3 flex items-center justify-between">
            <span>Assigned Operational Queue</span>
            <span className="text-xs text-outline font-normal">Phase 1 Preview</span>
          </h2>
          <div className="space-y-3">
            <div className="p-3.5 rounded-lg bg-surface-container-low/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-secondary" />
                <div>
                  <h3 className="text-xs font-semibold text-on-surface">Acme SaaS Innovations Ltd</h3>
                  <p className="text-[11px] text-outline">Invoice dispute resolved — awaiting customer confirmation</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                Normal Priority
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-surface-container-low/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-tertiary" />
                <div>
                  <h3 className="text-xs font-semibold text-on-surface">DataPulse Analytics Inc</h3>
                  <p className="text-[11px] text-outline">Plan tier upgrade quote requested (Enterprise Plan)</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed">
                High Priority
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-surface-container-low/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-secondary" />
                <div>
                  <h3 className="text-xs font-semibold text-on-surface">Nexio Cloud Labs</h3>
                  <p className="text-[11px] text-outline">GSTIN validation updated on profile</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container">
                Completed
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="font-heading text-sm font-semibold text-on-surface mb-3">
              Staff Authorization Boundaries
            </h2>
            <div className="space-y-2.5 text-xs text-on-surface-variant">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>View and assist permitted customers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                <span>Prepare quotations and monitor subscriptions</span>
              </div>
              <div className="flex items-center gap-2 text-outline">
                <span className="w-4 text-center font-bold">✕</span>
                <span>Cannot provision or deactivate other staff</span>
              </div>
              <div className="flex items-center gap-2 text-outline">
                <span className="w-4 text-center font-bold">✕</span>
                <span>Cannot access system settings or ledger audit</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant/20 mt-4">
            <span className="text-[11px] text-outline">
              Role permissions strictly enforced on backend via RBAC middleware.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
