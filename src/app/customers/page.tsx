"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { NeoTable } from "@/components/ui/NeoTable";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoBadge } from "@/components/ui/NeoBadge";
import { NeoInput } from "@/components/ui/NeoInput";
import { useToast } from "@/components/ui/ToastContext";
import {
  Users,
  Search,
  Building,
  Phone,
  Mail,
  ArrowRight,
  Plus,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  X,
  Server,
} from "lucide-react";
import {
  getCustomersAction,
  createCustomerAction,
  toggleCustomerStatusAction,
} from "@/app/actions/customers";

export default function CustomersPage() {
  const { success, error } = useToast();

  const [customers, setCustomers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // New Customer Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCustomers = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const res = await getCustomersAction({
          search: searchTerm,
          page,
          pageSize: 15,
        });

        if (res.success && res.data) {
          setCustomers(res.data.customers);
          setTotal(res.data.total);
          setTotalPages(res.data.totalPages);
        } else {
          error(res.error || "Failed to load customers from PostgreSQL.");
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Database load error";
        error(msg);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [searchTerm, page, error]
  );

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      error("Name and email are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createCustomerAction({
        name: newName.trim(),
        email: newEmail.trim(),
        companyName: newCompany.trim() || undefined,
        phone: newPhone.trim() || undefined,
        billingAddress: newAddress.trim() || undefined,
      });

      if (!res.success) {
        error(res.error || "Failed to create customer.");
        return;
      }

      success(`Customer "${newName}" created successfully in PostgreSQL.`);
      setCreateModalOpen(false);
      setNewName("");
      setNewEmail("");
      setNewCompany("");
      setNewPhone("");
      setNewAddress("");
      loadCustomers(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating customer";
      error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const nextStatus = !currentStatus;
      const res = await toggleCustomerStatusAction(id, nextStatus);
      if (res.success) {
        success(`Customer account ${nextStatus ? "activated" : "deactivated"}.`);
        loadCustomers(true);
      } else {
        error(res.error || "Failed to change status.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating status";
      error(msg);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-neoBlack">
                Customer Accounts
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-neoSage text-black border border-black shadow-neo-sm">
                <Server className="w-3 h-3 text-statusGreen" />
                Live PostgreSQL
              </span>
            </div>
            <p className="text-sm font-body font-bold text-neutral-600 mt-0.5">
              Direct enterprise clients, billing addresses, and linked subscriptions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadCustomers(true)}
              disabled={refreshing || loading}
              className="p-2.5 border-2 border-black rounded-[8px] bg-white shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-transform disabled:opacity-50"
              title="Refresh database records"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-statusBlue" : ""}`} />
            </button>
            <NeoButton
              variant="primary"
              size="compact"
              onClick={() => setCreateModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Customer
            </NeoButton>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white border-2 border-black rounded-[12px] p-4 shadow-neo flex flex-wrap items-center justify-between gap-4">
          <div className="relative min-w-[260px] flex-1 max-w-md">
            <Search className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customers, emails or companies..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full bg-neoCanvas border-2 border-black rounded-[8px] pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="text-xs font-mono font-bold text-neutral-600 bg-neoCanvas px-3 py-1.5 rounded-[6px] border border-black/30">
            {total} REGISTERED CUSTOMER ENTITIES
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="bg-white border-2 border-black rounded-[14px] p-12 shadow-neo text-center space-y-3">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-statusBlue" />
            <p className="text-xs font-mono font-bold text-neutral-600 uppercase">
              Querying customer profiles from PostgreSQL...
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading && customers.length === 0 && (
          <div className="bg-white border-2 border-black rounded-[14px] p-12 shadow-neo text-center space-y-4">
            <Users className="w-12 h-12 mx-auto text-neutral-400 stroke-1" />
            <h3 className="font-heading font-black text-xl">No Customer Records Found</h3>
            <p className="text-xs text-neutral-600 max-w-md mx-auto">
              No matching customer accounts were returned from your PostgreSQL `profiles` table.
            </p>
            <NeoButton variant="primary" onClick={() => setCreateModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
              Add First Customer
            </NeoButton>
          </div>
        )}

        {/* Customers Table */}
        {!loading && customers.length > 0 && (
          <div className="space-y-4">
            <NeoTable
              columns={[
                {
                  header: "Company / Organization",
                  accessorKey: "companyName",
                  render: (c: any) => (
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold block text-sm">{c.companyName || c.name}</span>
                        {!c.isActive && (
                          <span className="text-[10px] bg-red-100 text-statusRed font-bold px-1.5 py-0.2 rounded border border-red-300">
                            INACTIVE
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-neutral-600">{c.billingAddress || "No billing address set"}</span>
                    </div>
                  ),
                },
                {
                  header: "Primary Contact",
                  accessorKey: "name",
                  render: (c: any) => (
                    <div>
                      <span className="font-bold block">{c.name}</span>
                      <span className="text-[11px] font-mono text-neutral-600">{c.email}</span>
                    </div>
                  ),
                },
                {
                  header: "Phone",
                  accessorKey: "phone",
                  render: (c: any) => <span className="font-mono text-xs">{c.phone || "—"}</span>,
                },
                {
                  header: "Subscriptions",
                  render: (c: any) => (
                    <span className="font-mono font-bold text-xs bg-neoYellow px-2 py-0.5 rounded border border-black">
                      {c.subscriptionCount || 0} ACTIVE
                    </span>
                  ),
                },
                {
                  header: "Status / Actions",
                  align: "right",
                  render: (c: any) => (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(c.id, c.isActive)}
                        className={`px-2 py-1 text-[11px] font-bold rounded border border-black transition-colors ${
                          c.isActive
                            ? "bg-white hover:bg-neutral-100 text-neutral-700"
                            : "bg-statusGreen text-black"
                        }`}
                        title={c.isActive ? "Deactivate Account" : "Activate Account"}
                      >
                        {c.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <Link href={`/subscriptions?search=${encodeURIComponent(c.companyName || c.name)}`}>
                        <NeoButton size="compact" variant="secondary" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                          Subscriptions
                        </NeoButton>
                      </Link>
                    </div>
                  ),
                },
              ]}
              data={customers}
              keyExtractor={(c: any) => c.id}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center bg-white border-2 border-black rounded-[10px] p-3 shadow-neo-sm">
                <span className="text-xs font-mono font-bold text-neutral-600">
                  Page {page} of {totalPages} ({total} total entities)
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1 text-xs font-bold bg-white border-2 border-black rounded-[6px] shadow-neo-sm disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1 text-xs font-bold bg-white border-2 border-black rounded-[6px] shadow-neo-sm disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create Customer Modal */}
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white border-2 border-black rounded-[14px] p-6 shadow-neo-lg max-w-lg w-full space-y-4">
              <div className="flex justify-between items-center border-b-2 border-black pb-3">
                <h3 className="font-heading font-black text-2xl">Add Customer Account</h3>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="p-1 hover:bg-neutral-100 rounded border border-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCustomer} className="space-y-4">
                <NeoInput
                  label="Contact Person Name"
                  placeholder="e.g. Jane Doe"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />

                <NeoInput
                  label="Work Email"
                  type="email"
                  placeholder="e.g. jane@company.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />

                <NeoInput
                  label="Company / Organization"
                  placeholder="e.g. Acme Industrial Technologies"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <NeoInput
                    label="Phone Number"
                    placeholder="+1 (555) 019-2834"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                  />
                  <NeoInput
                    label="Billing Address"
                    placeholder="100 Commercial Way"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t-2 border-black">
                  <NeoButton
                    type="button"
                    variant="secondary"
                    onClick={() => setCreateModalOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </NeoButton>
                  <NeoButton
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  >
                    {isSubmitting ? "Saving to Database..." : "Save Customer"}
                  </NeoButton>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
