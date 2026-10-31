"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Zap,
  CreditCard,
  Download,
  ArrowRight,
  CheckCircle2,
  Shield,
  LogOut,
  ChevronDown,
  Loader2,
  RefreshCw,
  Building,
  Phone,
  MapPin,
  Clock,
  FileText,
} from "lucide-react";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoBadge } from "@/components/ui/NeoBadge";
import { NeoTable } from "@/components/ui/NeoTable";
import { NeoInput } from "@/components/ui/NeoInput";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/ToastContext";
import { Invoice } from "@/lib/data/types";
import {
  fetchCustomerPortalDataAction,
  updateCustomerOwnProfileAction,
  payInvoiceSelfServiceAction,
} from "@/app/actions/portal";
import { CustomerPortalData } from "@/lib/services/customer-portal";

export default function CustomerPortalPage() {
  const { currentUser, logout } = useAuth();
  const { success, error: toastError } = useToast();

  const [portalData, setPortalData] = useState<CustomerPortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"subscriptions" | "invoices" | "payments" | "account">("subscriptions");
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Edit Account State
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [savingAccount, setSavingAccount] = useState(false);

  const loadPortalData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchCustomerPortalDataAction();
      if (res.success && res.data) {
        setPortalData(res.data);
        setCompanyName(res.data.profile.companyName || "");
        setPhone(res.data.profile.phone || "");
        setBillingAddress(res.data.profile.billingAddress || "");
      } else {
        toastError(res.error || "Failed to load portal data");
      }
    } catch (err: any) {
      console.error("Portal load error:", err);
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    loadPortalData();
  }, [loadPortalData]);

  const handlePayInvoice = async (inv: Invoice) => {
    setSubmittingPayment(true);
    const remaining = inv.totalAmount - inv.amountPaid;
    const res = await payInvoiceSelfServiceAction(inv.id, remaining);
    setSubmittingPayment(false);

    if (res.success) {
      success(`Payment of $${remaining.toFixed(2)} received for ${inv.invoiceNumber}! Thank you.`);
      setPayingInvoice(null);
      await loadPortalData();
    } else {
      toastError(res.error || "Payment transaction could not be processed.");
    }
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAccount(true);
    const res = await updateCustomerOwnProfileAction({
      companyName,
      phone,
      billingAddress,
    });
    setSavingAccount(false);

    if (res.success) {
      success("Account details updated successfully in PostgreSQL.");
      await loadPortalData();
    } else {
      toastError(res.error || "Failed to update profile.");
    }
  };

  if (loading && !portalData) {
    return (
      <div className="min-h-screen bg-neoCanvas flex items-center justify-center p-4">
        <div className="bg-white border-2 border-black rounded-[14px] p-8 shadow-neo text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-black" />
          <p className="font-heading font-black text-lg">Loading Customer Portal...</p>
          <p className="font-mono text-xs text-neutral-600">Verifying customer session in PostgreSQL</p>
        </div>
      </div>
    );
  }

  const profile = portalData?.profile;
  const subscriptions = portalData?.subscriptions || [];
  const invoices = portalData?.invoices || [];
  const payments = portalData?.payments || [];
  const summary = portalData?.summary || { whatIPay: 0, whenItRenews: "N/A", whatIOwe: 0, activeCount: 0 };

  const unpaidInvoices = invoices.filter((i) => i.status !== "paid" && i.status !== "cancelled");
  const primarySub = subscriptions.find((s) => s.status === "active") || subscriptions[0];

  return (
    <div className="min-h-screen bg-neoCanvas text-neoBlack flex flex-col">
      {/* Top Bar: Yellow Top Bar h-20 */}
      <header className="h-20 bg-neoYellow border-b-2 border-black sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-neoBlack border-2 border-black rounded-[8px] flex items-center justify-center shadow-neo-sm">
              <Zap className="w-6 h-6 text-neoYellow fill-neoYellow" />
            </div>
            <div>
              <span className="font-heading font-black text-xl tracking-tighter text-neoBlack block">
                BRIGHTLOOP
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-800 -mt-1 block font-bold">
                CLIENT PORTAL
              </span>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-2 pl-4">
            <button
              onClick={() => setActiveTab("subscriptions")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-[8px] border-2 border-black transition-colors ${
                activeTab === "subscriptions"
                  ? "bg-white text-black font-extrabold shadow-neo-sm"
                  : "bg-transparent text-neutral-800 hover:bg-black/10"
              }`}
            >
              My Subscriptions ({subscriptions.length})
            </button>
            <button
              onClick={() => setActiveTab("invoices")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-[8px] border-2 border-black transition-colors ${
                activeTab === "invoices"
                  ? "bg-white text-black font-extrabold shadow-neo-sm"
                  : "bg-transparent text-neutral-800 hover:bg-black/10"
              }`}
            >
              My Invoices ({invoices.length})
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-[8px] border-2 border-black transition-colors ${
                activeTab === "payments"
                  ? "bg-white text-black font-extrabold shadow-neo-sm"
                  : "bg-transparent text-neutral-800 hover:bg-black/10"
              }`}
            >
              Payment History ({payments.length})
            </button>
            <button
              onClick={() => setActiveTab("account")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-[8px] border-2 border-black transition-colors ${
                activeTab === "account"
                  ? "bg-white text-black font-extrabold shadow-neo-sm"
                  : "bg-transparent text-neutral-800 hover:bg-black/10"
              }`}
            >
              Account Details
            </button>
          </nav>
        </div>

        {/* User profile & actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadPortalData()}
            className="p-2 border-2 border-black rounded-[8px] bg-white shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <div className="flex items-center gap-2 bg-white border-2 border-black rounded-[8px] px-3 py-1.5 shadow-neo-sm">
            <div className="w-7 h-7 rounded-full bg-neoDark text-white flex items-center justify-center font-bold text-xs">
              {profile?.name ? profile.name[0] : "C"}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-extrabold text-black leading-tight">
                {profile?.name || "Customer"}
              </p>
              <p className="text-[10px] font-mono text-neutral-600">CLIENT ACCOUNT</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 border-2 border-black rounded-[8px] bg-white hover:bg-statusRed/20"
            title="Sign Out"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4 text-black" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8 flex-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-neutral-600">
              Customer Self-Service Portal
            </span>
            <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-neoBlack">
              Welcome back, {profile?.name?.split(" ")[0] || "Customer"}
            </h1>
            <p className="text-sm font-medium text-neutral-600 mt-0.5">
              Organization: <strong>{profile?.companyName || "Acme Industrial Technologies"}</strong> | Email:{" "}
              <strong className="font-mono">{profile?.email}</strong>
            </p>
          </div>

          {/* Mobile Tab Selector */}
          <div className="md:hidden flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveTab("subscriptions")}
              className={`px-3 py-1 text-xs font-bold rounded border border-black ${
                activeTab === "subscriptions" ? "bg-neoYellow font-black" : "bg-white"
              }`}
            >
              Subs ({subscriptions.length})
            </button>
            <button
              onClick={() => setActiveTab("invoices")}
              className={`px-3 py-1 text-xs font-bold rounded border border-black ${
                activeTab === "invoices" ? "bg-neoYellow font-black" : "bg-white"
              }`}
            >
              Invoices ({invoices.length})
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`px-3 py-1 text-xs font-bold rounded border border-black ${
                activeTab === "payments" ? "bg-neoYellow font-black" : "bg-white"
              }`}
            >
              Payments ({payments.length})
            </button>
            <button
              onClick={() => setActiveTab("account")}
              className={`px-3 py-1 text-xs font-bold rounded border border-black ${
                activeTab === "account" ? "bg-neoYellow font-black" : "bg-white"
              }`}
            >
              Account
            </button>
          </div>
        </div>

        {/* 3 Status Headline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: What I Pay (Sage) */}
          <div className="bg-neoSage border-2 border-black rounded-[14px] p-6 shadow-neo-lg flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-black block">
                WHAT I PAY
              </span>
              <p className="text-3xl font-heading font-black text-black tnum">
                ${summary.whatIPay.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs font-bold text-neutral-800">
                Plan: {primarySub?.planName || "Enterprise Tier"}
              </p>
              <p className="text-[11px] text-neutral-700">
                Active contracts: {summary.activeCount} live subscription(s) in PostgreSQL.
              </p>
            </div>
            <div>
              {primarySub ? (
                <Link href={`/subscriptions/${primarySub.id}`}>
                  <NeoButton variant="secondary" size="compact" className="w-full">
                    View Subscription Contract
                  </NeoButton>
                </Link>
              ) : (
                <div className="text-xs font-bold text-neutral-600">No active contracts</div>
              )}
            </div>
          </div>

          {/* Card 2: When it renews (Yellow) */}
          <div className="bg-neoYellow border-2 border-black rounded-[14px] p-6 shadow-neo-lg flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-black block">
                WHEN IT RENEWS
              </span>
              <p className="text-3xl font-heading font-black text-black tnum">
                {summary.whenItRenews}
              </p>
              <p className="text-xs font-bold text-neutral-800">
                Automated Renewal Scheduled
              </p>
              <p className="text-[11px] text-neutral-700">
                Continuous billing via card on file. Zero service interruption.
              </p>
            </div>
            <div>
              <NeoButton
                variant="primary"
                size="compact"
                className="w-full"
                onClick={() => success("Auto-renewal active for this billing cycle.")}
              >
                Auto-Renew Preferences Active
              </NeoButton>
            </div>
          </div>

          {/* Card 3: What I owe (White) */}
          <div className="bg-white border-2 border-black rounded-[14px] p-6 shadow-neo-lg flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-neutral-500 block">
                WHAT I OWE
              </span>
              <p className="text-3xl font-heading font-black text-black tnum">
                ${summary.whatIOwe.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs font-bold text-neutral-800">
                {unpaidInvoices.length > 0
                  ? `${unpaidInvoices.length} outstanding invoice(s)`
                  : "All accounts current & settled"}
              </p>
              <p className="text-[11px] text-neutral-600">
                Pay online instantly with credit card or wire transfer.
              </p>
            </div>
            <div>
              {unpaidInvoices.length > 0 ? (
                <NeoButton
                  variant="primary"
                  size="compact"
                  className="w-full"
                  onClick={() => setPayingInvoice(unpaidInvoices[0])}
                  icon={<CreditCard className="w-4 h-4" />}
                >
                  Pay Invoice Now
                </NeoButton>
              ) : (
                <div className="bg-statusGreen/20 border-2 border-black rounded-[8px] p-2 text-center text-xs font-bold text-black flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-statusGreen" />
                  All Invoices Paid
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab 1: My Subscriptions */}
        {activeTab === "subscriptions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <h2 className="text-2xl font-heading font-black text-neoBlack">
                Your Subscriptions
              </h2>
              <span className="text-xs font-mono font-bold text-neutral-600">
                {subscriptions.length} Contract(s) in PostgreSQL
              </span>
            </div>
            <NeoTable
              columns={[
                {
                  header: "Contract #",
                  accessorKey: "subscriptionNumber",
                  render: (s) => (
                    <Link
                      href={`/subscriptions/${s.id}`}
                      className="font-mono font-bold underline hover:text-neutral-700"
                    >
                      {s.subscriptionNumber}
                    </Link>
                  ),
                },
                {
                  header: "Plan Name",
                  accessorKey: "planName",
                  render: (s) => <span className="font-bold">{s.planName}</span>,
                },
                {
                  header: "Status",
                  render: (s) => <NeoBadge status={s.status} />,
                },
                {
                  header: "Start Date",
                  accessorKey: "startDate",
                  render: (s) => <span className="font-mono text-xs">{s.startDate}</span>,
                },
                {
                  header: "Renewal Date",
                  accessorKey: "expiryDate",
                  render: (s) => <span className="font-mono text-xs">{s.expiryDate || "Ongoing"}</span>,
                },
                {
                  header: "Total Amount",
                  accessorKey: "totalAmount",
                  align: "right",
                  render: (s) => (
                    <span className="font-bold font-mono">
                      ${s.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  ),
                },
                {
                  header: "Action",
                  align: "right",
                  render: (s) => (
                    <Link href={`/subscriptions/${s.id}`}>
                      <NeoButton size="compact" variant="secondary" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                        Details
                      </NeoButton>
                    </Link>
                  ),
                },
              ]}
              data={subscriptions}
              keyExtractor={(s) => s.id}
              emptyState={
                <div className="py-12 text-center space-y-3">
                  <p className="text-base font-bold text-neutral-700">No subscriptions found for your account.</p>
                </div>
              }
            />
          </div>
        )}

        {/* Tab 2: My Invoices */}
        {activeTab === "invoices" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <h2 className="text-2xl font-heading font-black text-neoBlack">
                Your Invoices & Receipts
              </h2>
              <span className="text-xs font-mono font-bold text-neutral-600">
                {invoices.length} Record(s) in PostgreSQL
              </span>
            </div>
            <NeoTable
              columns={[
                {
                  header: "Invoice #",
                  accessorKey: "invoiceNumber",
                  render: (inv) => (
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="font-mono font-bold underline hover:text-neutral-700"
                    >
                      {inv.invoiceNumber}
                    </Link>
                  ),
                },
                {
                  header: "Billing Period",
                  render: (inv) => (
                    <span className="font-mono text-xs">
                      {inv.billingPeriodStart} - {inv.billingPeriodEnd}
                    </span>
                  ),
                },
                {
                  header: "Due Date",
                  accessorKey: "dueDate",
                  render: (inv) => {
                    const isPast = inv.isOverdue;
                    return (
                      <span className={`font-mono text-xs ${isPast ? "font-bold text-statusRed" : "text-black"}`}>
                        {inv.dueDate} {isPast && "(!)"}
                      </span>
                    );
                  },
                },
                {
                  header: "Total",
                  accessorKey: "totalAmount",
                  align: "right",
                  render: (inv) => (
                    <span className="font-bold font-mono">
                      ${inv.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  ),
                },
                {
                  header: "Paid",
                  accessorKey: "amountPaid",
                  align: "right",
                  render: (inv) => (
                    <span className="font-mono text-xs text-neutral-700">
                      ${inv.amountPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  ),
                },
                {
                  header: "Status",
                  render: (inv) => <NeoBadge status={inv.isOverdue ? "overdue" : inv.status} />,
                },
                {
                  header: "Action",
                  align: "right",
                  render: (inv) => (
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/invoices/${inv.id}`}>
                        <NeoButton size="compact" variant="secondary" icon={<Download className="w-3.5 h-3.5" />}>
                          Print / PDF
                        </NeoButton>
                      </Link>
                      {inv.status !== "paid" && inv.status !== "cancelled" && (
                        <NeoButton
                          size="compact"
                          variant="primary"
                          onClick={() => setPayingInvoice(inv)}
                          icon={<CreditCard className="w-3.5 h-3.5" />}
                        >
                          Pay
                        </NeoButton>
                      )}
                    </div>
                  ),
                },
              ]}
              data={invoices}
              keyExtractor={(inv) => inv.id}
              emptyState={
                <div className="py-12 text-center space-y-3">
                  <p className="text-base font-bold text-neutral-700">No invoices have been billed to your account yet.</p>
                </div>
              }
            />
          </div>
        )}

        {/* Tab 3: Payment History */}
        {activeTab === "payments" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <h2 className="text-2xl font-heading font-black text-neoBlack">
                Payment History
              </h2>
              <span className="text-xs font-mono font-bold text-neutral-600">
                {payments.length} Transaction(s) Reconciled
              </span>
            </div>
            <NeoTable
              columns={[
                {
                  header: "Invoice Reference",
                  accessorKey: "invoiceNumber",
                  render: (pay) => (
                    <Link
                      href={`/invoices/${pay.invoiceId}`}
                      className="font-mono font-bold underline hover:text-neutral-700"
                    >
                      {pay.invoiceNumber}
                    </Link>
                  ),
                },
                {
                  header: "Payment Date",
                  accessorKey: "paymentDate",
                  render: (pay) => <span className="font-mono text-xs">{pay.paymentDate}</span>,
                },
                {
                  header: "Method",
                  accessorKey: "method",
                  render: (pay) => (
                    <span className="font-mono text-xs uppercase bg-neoSage/50 px-2 py-0.5 rounded border border-black font-bold">
                      {pay.method.replace("_", " ")}
                    </span>
                  ),
                },
                {
                  header: "Reference Note",
                  accessorKey: "note",
                  render: (pay) => <span className="text-xs text-neutral-600">{pay.note || "Settlement"}</span>,
                },
                {
                  header: "Amount Paid",
                  accessorKey: "amount",
                  align: "right",
                  render: (pay) => (
                    <span className="font-bold font-mono text-statusGreen">
                      ${pay.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  ),
                },
              ]}
              data={payments}
              keyExtractor={(pay) => pay.id}
              emptyState={
                <div className="py-12 text-center space-y-3">
                  <p className="text-base font-bold text-neutral-700">No payments have been recorded yet.</p>
                </div>
              }
            />
          </div>
        )}

        {/* Tab 4: Account Details */}
        {activeTab === "account" && (
          <div className="bg-white border-2 border-black rounded-[14px] p-6 shadow-neo space-y-6 max-w-2xl">
            <div className="border-b-2 border-black pb-3">
              <h2 className="text-2xl font-heading font-black text-neoBlack">Company & Billing Details</h2>
              <p className="text-xs text-neutral-600">
                Manage your enterprise organization details and contact info saved in PostgreSQL.
              </p>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-4">
              <NeoInput
                label="Registered Company / Organization"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-800 uppercase tracking-wide">
                  Account Email Address (Read-only)
                </label>
                <input
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="w-full bg-neutral-100 border-2 border-black rounded-[8px] p-2.5 text-xs font-mono font-bold text-neutral-500 cursor-not-allowed"
                />
              </div>

              <NeoInput
                label="Primary Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-800 uppercase tracking-wide">
                  Official Billing Address
                </label>
                <textarea
                  rows={3}
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  className="w-full bg-neoCanvas border-2 border-black rounded-[8px] p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Street address, Suite, City, State, ZIP"
                />
              </div>

              <div className="flex justify-end pt-2">
                <NeoButton
                  type="submit"
                  variant="primary"
                  size="compact"
                  disabled={savingAccount}
                >
                  {savingAccount ? "Saving..." : "Save Account Changes"}
                </NeoButton>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Payment Settlement Modal */}
      {payingInvoice && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black rounded-[16px] shadow-neo-xl max-w-md w-full p-6 space-y-6">
            <h3 className="text-2xl font-heading font-black">
              Pay Invoice {payingInvoice.invoiceNumber}
            </h3>
            <p className="text-xs text-neutral-600">
              One-click settlement for {payingInvoice.customerName}.
            </p>

            <div className="bg-neoCanvas border-2 border-black rounded-[10px] p-4 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-600">Period:</span>
                <span className="font-mono">{payingInvoice.billingPeriodStart} to {payingInvoice.billingPeriodEnd}</span>
              </div>
              <div className="flex justify-between border-t border-neutral-300 pt-1 text-sm font-bold text-black">
                <span>Amount to Pay:</span>
                <span className="font-mono font-black">
                  ${(payingInvoice.totalAmount - payingInvoice.amountPaid).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t-2 border-neoDivider">
              <NeoButton
                type="button"
                variant="secondary"
                size="compact"
                disabled={submittingPayment}
                onClick={() => setPayingInvoice(null)}
              >
                Cancel
              </NeoButton>
              <NeoButton
                type="button"
                variant="primary"
                size="compact"
                disabled={submittingPayment}
                onClick={() => handlePayInvoice(payingInvoice)}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                {submittingPayment ? "Processing..." : "Authorize & Pay"}
              </NeoButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
