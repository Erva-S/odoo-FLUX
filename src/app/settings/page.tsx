"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { NeoCard } from "@/components/ui/NeoCard";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoBadge } from "@/components/ui/NeoBadge";
import { NeoInput } from "@/components/ui/NeoInput";
import { dataStore, DEMO_PROFILES } from "@/lib/data/store";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/ToastContext";
import { Settings, UserPlus, Shield, Percent, CheckCircle2, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const { role, createStaffAccount } = useAuth();
  const { success, error } = useToast();

  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");

  const [taxName, setTaxName] = useState("");
  const [taxRate, setTaxRate] = useState("");

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffEmail) return;

    const res = await createStaffAccount({ name: staffName, email: staffEmail });
    if (!res.success) {
      error(res.error || "Failed to create staff account.");
      return;
    }

    success(`Staff account for ${staffName} (${staffEmail}) created.`);
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

    dataStore.taxes.push({
      id: `tax-${Date.now()}`,
      name: taxName,
      rate: rateNum,
      isActive: true,
    });

    success(`Tax rule "${taxName}" (${rateNum}%) registered.`);
    setTaxName("");
    setTaxRate("");
  };

  if (role !== "admin") {
    return (
      <AppShell>
        <div className="py-20 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-statusRed mx-auto" />
          <h2 className="text-2xl font-heading font-black">Restricted Admin Area</h2>
          <p className="text-neutral-600">Only authorized administrators may manage team staff and tax settings.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="border-b-2 border-black pb-4">
          <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-neoBlack">
            System Administration
          </h1>
          <p className="text-sm font-body font-bold text-neutral-600 mt-0.5">
            Admin access: Provision internal staff members and global tax calculation rules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Staff Provisioning (Admin only) */}
          <div className="bg-white border-2 border-black rounded-[14px] p-6 shadow-neo space-y-6">
            <div className="flex items-center gap-2 border-b-2 border-neoDivider pb-3">
              <UserPlus className="w-5 h-5 text-black" />
              <h2 className="font-heading font-black text-xl">Add Internal Staff Member</h2>
            </div>
            <p className="text-xs text-neutral-600 font-medium">
              Only admins can create staff accounts. Internal staff have day-to-day operations access
              (quotes, subscriptions, invoices, payments) with limited settings.
            </p>

            <form onSubmit={handleAddStaff} className="space-y-4">
              <NeoInput
                label="Staff Full Name"
                placeholder="Marcus Vance"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                required
              />
              <NeoInput
                label="Staff Work Email"
                type="email"
                placeholder="marcus@brightloop.io"
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
                required
              />
              <NeoButton type="submit" variant="primary" size="compact" icon={<CheckCircle2 className="w-4 h-4" />}>
                Create Staff Account
              </NeoButton>
            </form>

            <div className="pt-4 border-t-2 border-neoDivider space-y-2">
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">
                Active Staff Roster
              </span>
              {DEMO_PROFILES.map((p) => (
                <div
                  key={p.id}
                  className="bg-neoCanvas border-2 border-black rounded-[8px] p-2.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold block">{p.name}</span>
                    <span className="text-[11px] font-mono text-neutral-600">{p.email}</span>
                  </div>
                  <NeoBadge status={p.role} />
                </div>
              ))}
            </div>
          </div>

          {/* Tax Rules */}
          <div className="bg-white border-2 border-black rounded-[14px] p-6 shadow-neo space-y-6">
            <div className="flex items-center gap-2 border-b-2 border-neoDivider pb-3">
              <Percent className="w-5 h-5 text-black" />
              <h2 className="font-heading font-black text-xl">Global Tax Rules</h2>
            </div>
            <p className="text-xs text-neutral-600 font-medium">
              Define VAT, GST, or regional software sales tax rates computed automatically on invoices.
            </p>

            <form onSubmit={handleAddTax} className="space-y-4">
              <NeoInput
                label="Tax Rule Name"
                placeholder="e.g. California Tech Surcharge"
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
                Active Tax Rates
              </span>
              {dataStore.taxes.map((t) => (
                <div
                  key={t.id}
                  className="bg-neoCanvas border-2 border-black rounded-[8px] p-2.5 flex items-center justify-between text-xs font-bold"
                >
                  <span>{t.name}</span>
                  <span className="font-mono text-statusGreen bg-white px-2 py-0.5 rounded border border-black">
                    {t.rate}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

