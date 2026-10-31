"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoBadge } from "@/components/ui/NeoBadge";
import { NeoInput } from "@/components/ui/NeoInput";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/ToastContext";
import { Tax } from "@/lib/data/types";
import { getTaxesAction } from "@/app/actions/catalog";
import { Settings, UserPlus, Shield, Percent, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { role, createStaffAccount } = useAuth();
  const { success, error } = useToast();

  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");

  const [taxName, setTaxName] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loadingTaxes, setLoadingTaxes] = useState(true);

  useEffect(() => {
    async function loadTaxes() {
      try {
        const res = await getTaxesAction();
        if (res.success && res.data) {
          setTaxes(res.data);
        }
      } catch (err) {
        console.error("Failed to load taxes from PostgreSQL:", err);
      } finally {
        setLoadingTaxes(false);
      }
    }
    loadTaxes();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffEmail) return;

    const res = await createStaffAccount({ name: staffName, email: staffEmail });
    if (!res.success) {
      error(res.error || "Failed to create staff account.");
      return;
    }

    success(`Staff account for ${staffName} (${staffEmail}) created in Supabase Auth & PostgreSQL.`);
    setStaffName("");
    setStaffEmail("");
  };

  const handleAddTax = (e: React.FormEvent) => {
    e.preventDefault();
    const rateNum = parseFloat(taxRate);
    if (isNaN(rateNum) || rateNum <= 0) {
      error("Tax rate must be positive.");
      return;
    }

    setTaxes((prev) => [
      ...prev,
      {
        id: `tax-${Date.now()}`,
        name: taxName,
        rate: rateNum,
        isActive: true,
      },
    ]);

    success(`Tax rule "${taxName}" (${rateNum}%) registered.`);
    setTaxName("");
    setTaxRate("");
  };

  if (role !== "admin") {
    return (
      <AppShell>
        <div className="py-20 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 bg-statusRed/20 border-2 border-black rounded-full flex items-center justify-center mx-auto text-statusRed">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-heading font-black">Admin Access Restricted</h2>
          <p className="text-sm text-neutral-600">
            System settings, staff provisioning, and tax rules are strictly reserved for Platform Administrators.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 border-b-2 border-black pb-4">
          <div className="p-2 border-2 border-black rounded-[8px] bg-white shadow-neo-sm">
            <Settings className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-black tracking-tight text-neoBlack">
              Platform Settings
            </h1>
            <p className="text-xs text-neutral-600 font-bold">
              Admin controls: provision staff credentials and configure jurisdictional tax rules.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Staff Provisioning Card */}
          <div className="bg-white border-2 border-black rounded-[14px] p-6 shadow-neo space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-black pb-3">
              <UserPlus className="w-5 h-5 text-black" />
              <h2 className="font-heading font-black text-xl">Provision Staff Account</h2>
            </div>
            <p className="text-xs text-neutral-600 font-medium">
              Create internal staff users in Supabase Auth & PostgreSQL. Staff accounts are granted operations
              access to customer contracts and invoices without administrative permissions.
            </p>

            <form onSubmit={handleAddStaff} className="space-y-3">
              <NeoInput
                label="Full Name"
                placeholder="Marcus Vance"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                required
              />
              <NeoInput
                label="Email Address"
                type="email"
                placeholder="marcus@brightloop.io"
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
                required
              />
              <NeoButton type="submit" variant="primary" size="compact" icon={<Shield className="w-4 h-4" />}>
                Create Staff Account
              </NeoButton>
            </form>
          </div>

          {/* Tax Rates Configuration */}
          <div className="bg-white border-2 border-black rounded-[14px] p-6 shadow-neo space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-black pb-3">
              <Percent className="w-5 h-5 text-black" />
              <h2 className="font-heading font-black text-xl">Jurisdictional Tax Rates</h2>
            </div>

            <form onSubmit={handleAddTax} className="space-y-3">
              <NeoInput
                label="Tax Rule Name"
                placeholder="Texas State Sales Tax"
                value={taxName}
                onChange={(e) => setTaxName(e.target.value)}
                required
              />
              <NeoInput
                label="Tax Rate (%)"
                type="number"
                step="0.01"
                placeholder="8.25"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                required
              />
              <NeoButton type="submit" variant="secondary" size="compact" icon={<CheckCircle2 className="w-4 h-4" />}>
                Register Tax Rule
              </NeoButton>
            </form>

            <div className="pt-4 border-t-2 border-neoDivider space-y-2">
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">
                Active Tax Rates in PostgreSQL
              </span>
              {loadingTaxes ? (
                <Loader2 className="w-4 h-4 animate-spin text-black" />
              ) : (
                taxes.map((t) => (
                  <div
                    key={t.id}
                    className="bg-neoCanvas border-2 border-black rounded-[8px] p-2.5 flex items-center justify-between text-xs font-bold"
                  >
                    <span>{t.name}</span>
                    <span className="font-mono text-statusGreen bg-white px-2 py-0.5 rounded border border-black">
                      {t.rate}%
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
