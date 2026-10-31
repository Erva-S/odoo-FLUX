import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import {
  UserCircle,
  Building2,
  Phone,
  MapPin,
  RotateCw,
  Receipt,
  CreditCard,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export function CustomerPortalPage() {
  const { user } = useAuth();
  const customer = user?.customer;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Customer Portal
            </span>
            <span className="text-xs text-outline font-medium">Self-Service Account</span>
          </div>
          <h1 className="font-heading text-xl font-bold text-on-surface">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Manage your company billing profile, active plans, and tax invoices.
          </p>
        </div>

        <Link
          to="/portal/profile"
          className="h-9 px-4 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
        >
          <UserCircle className="w-4 h-4" />
          <span>Edit Billing Profile</span>
        </Link>
      </div>

      {/* Customer Profile Summary Card */}
      <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30 mb-4">
          <h2 className="font-heading text-sm font-semibold text-on-surface flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <span>Company & Billing Profile</span>
          </h2>
          <span className="text-xs text-secondary font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Active Customer
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-surface-container-low/70">
            <span className="text-[11px] text-outline uppercase tracking-wider font-semibold block mb-1">
              Account Holder
            </span>
            <span className="font-semibold text-on-surface text-sm">{user?.name}</span>
            <span className="text-outline block text-[11px] mt-0.5">{user?.email}</span>
          </div>

          <div className="p-3 rounded-lg bg-surface-container-low/70">
            <span className="text-[11px] text-outline uppercase tracking-wider font-semibold block mb-1">
              Organization Name
            </span>
            <span className="font-semibold text-on-surface text-sm">
              {customer?.companyName || 'Not specified'}
            </span>
            <span className="text-outline block text-[11px] mt-0.5">Primary Billing Entity</span>
          </div>

          <div className="p-3 rounded-lg bg-surface-container-low/70">
            <span className="text-[11px] text-outline uppercase tracking-wider font-semibold block mb-1">
              Contact Phone
            </span>
            <span className="font-semibold text-on-surface text-sm">
              {customer?.contactNumber || 'Not specified'}
            </span>
            <span className="text-outline block text-[11px] mt-0.5">SMS Alerts & Receipts</span>
          </div>

          <div className="p-3 rounded-lg bg-surface-container-low/70">
            <span className="text-[11px] text-outline uppercase tracking-wider font-semibold block mb-1">
              Billing Address
            </span>
            <span className="font-semibold text-on-surface truncate block" title={customer?.billingAddress || ''}>
              {customer?.billingAddress || 'Not specified'}
            </span>
            <span className="text-outline block text-[11px] mt-0.5">Tax Invoicing Address</span>
          </div>
        </div>
      </div>

      {/* Placeholders for Future Customer Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Subscriptions Placeholder */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-primary-container/10 text-primary flex items-center justify-center mb-3">
              <RotateCw className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-heading text-sm font-semibold text-on-surface">Active Subscriptions</h3>
              <span className="text-[10px] font-bold text-outline bg-surface-container px-2 py-0.5 rounded">Phase 2</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Self-service subscription upgrades, license expansions, and renewal cycle controls.
            </p>
          </div>
          <Link
            to="/portal/subscriptions"
            className="mt-4 pt-3 border-t border-outline-variant/20 text-xs text-primary font-semibold flex items-center justify-between hover:underline"
          >
            <span>View Subscription Area</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Invoices Placeholder */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-secondary-container/30 text-secondary flex items-center justify-center mb-3">
              <Receipt className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-heading text-sm font-semibold text-on-surface">Tax Invoices</h3>
              <span className="text-[10px] font-bold text-outline bg-surface-container px-2 py-0.5 rounded">Phase 2</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Download GST-compliant tax invoices, payment receipts, and billing statements.
            </p>
          </div>
          <Link
            to="/portal/invoices"
            className="mt-4 pt-3 border-t border-outline-variant/20 text-xs text-primary font-semibold flex items-center justify-between hover:underline"
          >
            <span>View Invoices Area</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Payment History Placeholder */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center mb-3">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-heading text-sm font-semibold text-on-surface">Payment History</h3>
              <span className="text-[10px] font-bold text-outline bg-surface-container px-2 py-0.5 rounded">Phase 2</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Inspect payment gateway transaction logs, UPI / card receipts, and refund statuses.
            </p>
          </div>
          <Link
            to="/portal/payments"
            className="mt-4 pt-3 border-t border-outline-variant/20 text-xs text-primary font-semibold flex items-center justify-between hover:underline"
          >
            <span>View Payments Area</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
