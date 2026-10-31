"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoBadge } from "@/components/ui/NeoBadge";
import { NeoInput } from "@/components/ui/NeoInput";
import { Invoice, Payment } from "@/lib/data/types";
import { useToast } from "@/components/ui/ToastContext";
import { fetchInvoiceByIdAction, updateInvoiceStatusAction } from "@/app/actions/invoices";
import { recordPaymentAction } from "@/app/actions/payments";
import {
  ArrowLeft,
  Printer,
  Send,
  CheckCircle2,
  XCircle,
  CreditCard,
  Loader2,
} from "lucide-react";

export default function InvoiceDetailPage() {
  const params = useParams();
  const invId = params?.id as string;
  const { success, error: toastError } = useToast();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<Payment["method"]>("bank_transfer");
  const [paymentNote, setPaymentNote] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const loadInvoice = useCallback(async () => {
    if (!invId) return;
    setLoading(true);
    try {
      const data = await fetchInvoiceByIdAction(invId);
      setInvoice(data);
    } catch (err) {
      console.error("Error loading invoice:", err);
    } finally {
      setLoading(false);
    }
  }, [invId]);

  useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

  if (loading) {
    return (
      <AppShell>
        <div className="py-24 text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-black" />
          <p className="font-mono text-sm font-bold text-neutral-700">Loading invoice details from PostgreSQL...</p>
        </div>
      </AppShell>
    );
  }

  if (!invoice) {
    return (
      <AppShell>
        <div className="py-20 text-center space-y-4">
          <h2 className="text-2xl font-heading font-black">Invoice Not Found</h2>
          <p className="text-sm text-neutral-600">The requested invoice ID or number does not exist in PostgreSQL.</p>
          <Link href="/invoices">
            <NeoButton variant="primary">Return to Invoices</NeoButton>
          </Link>
        </div>
      </AppShell>
    );
  }

  // Invoice Status Transitions
  const handleConfirm = async () => {
    setSubmitting(true);
    const res = await updateInvoiceStatusAction(invoice.id, "confirmed");
    setSubmitting(false);
    if (res.success && res.invoice) {
      setInvoice(res.invoice);
      success("Invoice confirmed in PostgreSQL");
    } else {
      toastError(res.error || "Failed to confirm invoice");
    }
  };

  const handleCancel = async () => {
    setSubmitting(true);
    const res = await updateInvoiceStatusAction(invoice.id, "cancelled");
    setSubmitting(false);
    if (res.success && res.invoice) {
      setInvoice(res.invoice);
      success("Invoice cancelled in PostgreSQL");
    } else {
      toastError(res.error || "Failed to cancel invoice");
    }
  };

  const handleSend = () => {
    success(`Invoice ${invoice.invoiceNumber} dispatched to ${invoice.customerEmail}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(paymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    setSubmitting(true);
    const res = await recordPaymentAction({
      invoiceId: invoice.id,
      amount: amountNum,
      method: paymentMethod,
      note: paymentNote || undefined,
    });
    setSubmitting(false);

    if (res.success) {
      setShowPaymentModal(false);
      setPaymentAmount("");
      setPaymentNote("");
      success(`Payment of $${amountNum.toFixed(2)} recorded on ${invoice.invoiceNumber}`);
      await loadInvoice();
    } else {
      toastError(res.error || "Failed to record payment");
    }
  };

  const remaining = Math.max(0, invoice.totalAmount - invoice.amountPaid);
  const isPastDue = invoice.isOverdue;

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4 print:hidden">
          <div className="flex items-center gap-3">
            <Link
              href="/invoices"
              className="p-2 border-2 border-black rounded-[8px] bg-white shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-neoBlack">
                  {invoice.invoiceNumber}
                </h1>
                <NeoBadge status={isPastDue ? "overdue" : invoice.status} />
              </div>
              <p className="text-xs text-neutral-600 font-mono mt-0.5">
                Subscription: <strong>{invoice.subscriptionNumber}</strong> | Customer:{" "}
                <strong>{invoice.customerName}</strong>
              </p>
            </div>
          </div>

          {/* Action Buttons: Confirm, Cancel, Send, Print */}
          <div className="flex flex-wrap items-center gap-2">
            <NeoButton
              variant="secondary"
              size="compact"
              onClick={handlePrint}
              icon={<Printer className="w-4 h-4" />}
            >
              Print / Save PDF
            </NeoButton>

            <NeoButton
              variant="secondary"
              size="compact"
              onClick={handleSend}
              icon={<Send className="w-4 h-4" />}
            >
              Send Invoice
            </NeoButton>

            {invoice.status === "draft" && (
              <NeoButton
                variant="primary"
                size="compact"
                disabled={submitting}
                onClick={handleConfirm}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                Confirm Invoice
              </NeoButton>
            )}

            {invoice.status !== "paid" && invoice.status !== "cancelled" && (
              <>
                <NeoButton
                  variant="primary"
                  size="compact"
                  disabled={submitting || remaining <= 0}
                  onClick={() => {
                    setPaymentAmount(remaining.toFixed(2));
                    setShowPaymentModal(true);
                  }}
                  icon={<CreditCard className="w-4 h-4" />}
                >
                  Record Payment
                </NeoButton>

                <NeoButton
                  variant="destructive"
                  size="compact"
                  disabled={submitting}
                  onClick={handleCancel}
                  icon={<XCircle className="w-4 h-4" />}
                >
                  Cancel Invoice
                </NeoButton>
              </>
            )}
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div className="bg-white border-2 border-black rounded-[14px] p-8 shadow-neo-lg space-y-8 print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-2 border-black pb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-black rounded-[6px] flex items-center justify-center">
                  <span className="text-neoYellow font-black text-base">B</span>
                </div>
                <span className="font-heading font-black text-2xl">BRIGHTLOOP SOFTWARE</span>
              </div>
              <p className="text-xs text-neutral-600">100 Innovation Way, Suite 400</p>
              <p className="text-xs text-neutral-600">San Francisco, CA 94107</p>
              <p className="text-xs font-mono text-neutral-500">accounting@brightloop.io</p>
            </div>

            <div className="sm:text-right">
              <span className="text-xs font-mono font-bold bg-neoYellow px-2.5 py-1 rounded border border-black inline-block">
                OFFICIAL TAX INVOICE
              </span>
              <h2 className="text-3xl font-mono font-black mt-2">{invoice.invoiceNumber}</h2>
              <p className="text-xs text-neutral-600 mt-1">
                Issue Date: <strong className="font-mono">{invoice.createdAt.split("T")[0]}</strong>
              </p>
              <p className="text-xs text-neutral-600">
                Payment Due Date: <strong className="font-mono">{invoice.dueDate}</strong>
              </p>
            </div>
          </div>

          {/* Customer & Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-neoCanvas border-2 border-black rounded-[10px] p-6 text-xs">
            <div>
              <span className="uppercase font-bold text-neutral-500 tracking-wider block text-[10px]">
                Billed To
              </span>
              <p className="font-bold text-base text-black mt-1">{invoice.customerName}</p>
              <p className="text-neutral-600 font-mono">{invoice.customerEmail}</p>
              <p className="text-neutral-600 mt-1">
                {invoice.customerAddress || "Commercial Blvd, Suite 200, Austin TX"}
              </p>
            </div>
            <div className="sm:text-right">
              <span className="uppercase font-bold text-neutral-500 tracking-wider block text-[10px]">
                Subscription Contract
              </span>
              <p className="font-mono font-bold text-sm text-black mt-1">
                {invoice.subscriptionNumber}
              </p>
              <p className="text-neutral-600 mt-0.5">
                Period: {invoice.billingPeriodStart} to {invoice.billingPeriodEnd}
              </p>
              <div className="mt-2 inline-block">
                <NeoBadge status={isPastDue ? "overdue" : invoice.status} />
              </div>
            </div>
          </div>

          {/* Lines Table */}
          <div className="border-2 border-black rounded-[10px] overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-neoBlack text-white">
                  <th className="p-3.5 font-heading font-extrabold uppercase">Description</th>
                  <th className="p-3.5 font-heading font-extrabold uppercase text-center">Qty</th>
                  <th className="p-3.5 font-heading font-extrabold uppercase text-right">Unit Price</th>
                  <th className="p-3.5 font-heading font-extrabold uppercase text-right">Tax Rate</th>
                  <th className="p-3.5 font-heading font-extrabold uppercase text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-neoDivider bg-white font-medium">
                {invoice.lines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-neoYellow/20">
                    <td className="p-3.5 font-bold text-sm">{line.description}</td>
                    <td className="p-3.5 text-center font-mono">{line.quantity}</td>
                    <td className="p-3.5 text-right font-mono">${line.unitPrice.toFixed(2)}</td>
                    <td className="p-3.5 text-right font-mono">{line.taxRate}%</td>
                    <td className="p-3.5 text-right font-mono font-bold">${line.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subtotal, Taxes & Amount Due */}
          <div className="flex flex-col items-end space-y-2 pt-2 text-xs">
            <div className="w-full sm:w-72 flex justify-between text-neutral-600">
              <span>Subtotal:</span>
              <span className="font-mono font-bold">${invoice.subtotal.toFixed(2)}</span>
            </div>
            {invoice.discountAmount > 0 && (
              <div className="w-full sm:w-72 flex justify-between text-statusGreen font-bold">
                <span>Promotional Discount:</span>
                <span className="font-mono">-${invoice.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="w-full sm:w-72 flex justify-between text-neutral-600">
              <span>Standard Tax (10% VAT):</span>
              <span className="font-mono font-bold">${invoice.taxAmount.toFixed(2)}</span>
            </div>
            <div className="w-full sm:w-72 flex justify-between text-neutral-800 border-t border-neutral-300 pt-1">
              <span>Total Invoice Amount:</span>
              <span className="font-mono font-bold">${invoice.totalAmount.toFixed(2)}</span>
            </div>
            <div className="w-full sm:w-72 flex justify-between text-statusGreen font-bold">
              <span>Amount Paid:</span>
              <span className="font-mono">${invoice.amountPaid.toFixed(2)}</span>
            </div>
            <div className="w-full sm:w-72 flex justify-between border-t-2 border-black pt-2 text-base font-extrabold text-black">
              <span>Outstanding Balance:</span>
              <span className="font-mono font-black">
                ${remaining.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black rounded-[16px] shadow-neo-xl max-w-md w-full p-6 space-y-6">
            <div>
              <h3 className="text-2xl font-heading font-black">Record Payment</h3>
              <p className="text-xs font-mono text-neutral-600 mt-1">
                Invoice {invoice.invoiceNumber} | Balance: ${remaining.toFixed(2)}
              </p>
            </div>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <NeoInput
                label="Payment Amount ($)"
                type="number"
                step="0.01"
                min="0.01"
                max={remaining}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                required
              />

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-800 uppercase tracking-wide">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as Payment["method"])}
                  className="w-full bg-neoCanvas border-2 border-black rounded-[8px] p-2.5 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="bank_transfer">Bank Wire Transfer</option>
                  <option value="credit_card">Corporate Credit Card</option>
                  <option value="wire">ACH / Wire Settlement</option>
                  <option value="ach">Direct Debit ACH</option>
                </select>
              </div>

              <NeoInput
                label="Transaction Reference / Note (Optional)"
                type="text"
                placeholder="e.g. Wire confirmation ref #82931"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
              />

              <div className="flex justify-end gap-3 pt-4 border-t-2 border-neoDivider">
                <NeoButton
                  type="button"
                  variant="secondary"
                  size="compact"
                  disabled={submitting}
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </NeoButton>
                <NeoButton type="submit" variant="primary" size="compact" disabled={submitting}>
                  {submitting ? "Processing..." : "Confirm Payment"}
                </NeoButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
