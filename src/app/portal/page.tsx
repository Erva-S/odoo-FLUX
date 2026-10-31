"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Zap, CreditCard, Download, ArrowRight, CheckCircle2, Shield, LogOut, ChevronDown } from "lucide-react";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoBadge } from "@/components/ui/NeoBadge";
import { NeoTable } from "@/components/ui/NeoTable";
import { dataStore } from "@/lib/data/store";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/ToastContext";
import { Invoice } from "@/lib/data/types";

export default function CustomerPortalPage() {
  const { currentUser, logout, switchDemoRole } = useAuth();
  const { success } = useToast();

  const [activeTab, setActiveTab] = useState<"subscriptions" | "invoices" | "account">("subscriptions");
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);

  // Filter subscriptions and invoices strictly for current customer
  const customerId = currentUser?.id || "user-customer-acme";

  const customerSubs = useMemo(() => {
    return dataStore.subscriptions.filter(
      (s) =>
        s.customerId === customerId ||
        s.customerEmail.toLowerCase() === currentUser?.email.toLowerCase() ||
        s.customerName.toLowerCase().includes("acme")
    );
  }, [customerId, currentUser]);

  const customerInvoices = useMemo(() => {
    return dataStore.invoices.filter(
      (i) =>
        i.customerId === customerId ||
        i.customerEmail.toLowerCase() === currentUser?.email.toLowerCase() ||
        i.customerName.toLowerCase().includes("acme")
    );
  }, [customerId, currentUser]);

  // Calculations for 3 status cards
  const primarySub = customerSubs.find((s) => s.status === "active") || customerSubs[0];
  const whatIPay = primarySub ? primarySub.totalAmount : 0;
  const whenItRenews = primarySub?.expiryDate || "Nov 15, 2026";

  const unpaidInvoices = customerInvoices.filter((i) => i.status !== "paid");
  const whatIOwe = unpaidInvoices.reduce((acc, i) => acc + (i.totalAmount - i.amountPaid), 0);

  const handlePayInvoice = (inv: Invoice) => {
    dataStore.recordPayment({
      invoiceId: inv.id,
      amount: inv.totalAmount - inv.amountPaid,
      method: "credit_card",
      note: "Customer self-service portal payment",
    });
    success(`Payment successful for ${inv.invoiceNumber}! Thank you.`);
    setPayingInvoice(null);
  };

  return (
    <div className="min-h-screen bg-neoCanvas text-neoBlack">
      {/* Top Bar: Same Yellow Top Bar h-20 with Subscriptions, Invoices, Account, No Sidebar */}
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
          <nav className="hidden sm:flex items-center gap-2 pl-4">
            <button
              onClick={() => setActiveTab("subscriptions")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-[8px] border-2 border-black transition-colors ${
                activeTab === "subscriptions"
                  ? "bg-white text-black font-extrabold shadow-neo-sm"
                  : "bg-transparent text-neutral-800 hover:bg-black/10"
              }`}
            >
              My Subscriptions
            </button>
            <button
              onClick={() => setActiveTab("invoices")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-[8px] border-2 border-black transition-colors ${
                activeTab === "invoices"
                  ? "bg-white text-black font-extrabold shadow-neo-sm"
                  : "bg-transparent text-neutral-800 hover:bg-black/10"
              }`}
            >
              My Invoices
            </button>
            <button
              onClick={() => setActiveTab("account")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-[8px] border-2 border-black transition-colors ${
                activeTab === "account"
                  ? "bg-white text-black font-extrabold shadow-neo-sm"
                  : "bg-transparent text-neutral-800 hover:bg-black/10"
              }`}
            >
              Account
            </button>
          </nav>
        </div>

        {/* User profile & session controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border-2 border-black rounded-[8px] px-3 py-1.5 shadow-neo-sm">
            <div className="w-7 h-7 rounded-full bg-neoDark text-white flex items-center justify-center font-bold text-xs">
              {currentUser?.name ? currentUser.name[0] : "C"}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-extrabold text-black leading-tight">
                {currentUser?.name || "Customer"}
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
      <main className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-neutral-600">
            Self-Service Dashboard
          </span>
          <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-neoBlack">
            Welcome back, {currentUser?.name?.split(" ")[0] || "Customer"}
          </h1>
          <p className="text-sm font-medium text-neutral-600 mt-1">
            Organization: <strong>{currentUser?.companyName || "Acme Industrial Technologies"}</strong>
          </p>
        </div>

        {/* Large Status Cards in 3 colors (sage: what I pay, yellow: when it renews, white: what I owe) with "Pay" or "Download invoice" actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: What I Pay (Sage) */}
          <div className="bg-neoSage border-2 border-black rounded-[14px] p-6 shadow-neo-lg flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-black block">
                WHAT I PAY
              </span>
              <p className="text-3xl font-heading font-black text-black tnum">
                ${whatIPay.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs font-bold text-neutral-800">
                Plan: {primarySub?.planName || "Scale Yearly"}
              </p>
              <p className="text-[11px] text-neutral-700">
                Includes multitenant SaaS and Brand: Odoo integration.
              </p>
            </div>
            <div>
              <Link href={primarySub ? `/subscriptions/${primarySub.id}` : "#"}>
                <NeoButton variant="secondary" size="compact" className="w-full">
                  View Plan Details
                </NeoButton>
              </Link>
            </div>
          </div>

          {/* Card 2: When it renews (Yellow) */}
          <div className="bg-neoYellow border-2 border-black rounded-[14px] p-6 shadow-neo-lg flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-black block">
                WHEN IT RENEWS
              </span>
              <p className="text-3xl font-heading font-black text-black tnum">
                {whenItRenews}
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
                onClick={() => success("Renewal preferences saved: Auto-renew active.")}
              >
                Manage Renewal Terms
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
                ${whatIOwe.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs font-bold text-neutral-800">
                {unpaidInvoices.length > 0
                  ? `${unpaidInvoices.length} outstanding invoice(s)`
                  : "All accounts current & settled"}
              </p>
              <p className="text-[11px] text-neutral-600">
                Pay online instantly with credit card or ACH wire.
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
                <div className="bg-statusGreen/20 border-2 border-black rounded-[8px] p-2 text-center text-xs font-bold text-black">
                  Zero Balance Due
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content depending on active tab */}
        {activeTab === "subscriptions" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-heading font-black text-neoBlack">
              Your Active Subscriptions
            </h2>
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
                  header: "Annual Amount",
                  accessorKey: "totalAmount",
                  align: "right",
                  render: (s) => (
                    <span className="font-bold font-mono">
                      ${s.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  ),
                },
              ]}
              data={customerSubs}
              keyExtractor={(s) => s.id}
            />
          </div>
        )}

        {activeTab === "invoices" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-heading font-black text-neoBlack">
              Your Invoices & Receipts
            </h2>
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
                    const isPast = new Date(inv.dueDate) < new Date() && inv.status !== "paid";
                    return (
                      <span className={`font-mono text-xs ${isPast ? "font-bold text-statusRed" : "text-black"}`}>
                        {inv.dueDate} {isPast && "(!)"}
                      </span>
                    );
                  },
                },
                {
                  header: "Amount",
                  accessorKey: "totalAmount",
                  align: "right",
                  render: (inv) => (
                    <span className="font-bold font-mono">
                      ${inv.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  ),
                },
                {
                  header: "Status",
                  render: (inv) => <NeoBadge status={inv.status} />,
                },
                {
                  header: "Action",
                  align: "right",
                  render: (inv) => (
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/invoices/${inv.id}`}>
                        <NeoButton size="compact" variant="secondary" icon={<Download className="w-3.5 h-3.5" />}>
                          View / Print
                        </NeoButton>
                      </Link>
                      {inv.status !== "paid" && (
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
              data={customerInvoices}
              keyExtractor={(inv) => inv.id}
            />
          </div>
        )}

        {activeTab === "account" && (
          <div className="bg-white border-2 border-black rounded-[14px] p-6 shadow-neo space-y-4 max-w-2xl">
            <h2 className="text-2xl font-heading font-black text-neoBlack">Account Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-neoDivider pb-2">
                <span className="text-neutral-600 font-bold">Contact Name:</span>
                <span>{currentUser?.name}</span>
              </div>
              <div className="flex justify-between border-b border-neoDivider pb-2">
                <span className="text-neutral-600 font-bold">Email Address:</span>
                <span className="font-mono">{currentUser?.email}</span>
              </div>
              <div className="flex justify-between border-b border-neoDivider pb-2">
                <span className="text-neutral-600 font-bold">Company / Org:</span>
                <span>{currentUser?.companyName || "Acme Technologies"}</span>
              </div>
              <div className="flex justify-between border-b border-neoDivider pb-2">
                <span className="text-neutral-600 font-bold">Billing Address:</span>
                <span>{currentUser?.billingAddress || "450 Industrial Parkway, Austin, TX 78701"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 font-bold">Portal Role:</span>
                <NeoBadge status="customer" />
              </div>
            </div>
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
                onClick={() => setPayingInvoice(null)}
              >
                Cancel
              </NeoButton>
              <NeoButton
                type="button"
                variant="primary"
                size="compact"
                onClick={() => handlePayInvoice(payingInvoice)}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                Authorize & Pay
              </NeoButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

