"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Check, Download, AlertTriangle, Layers } from "lucide-react";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoInput } from "@/components/ui/NeoInput";
import { NeoBadge } from "@/components/ui/NeoBadge";
import { NeoCard } from "@/components/ui/NeoCard";
import { MockupWindow } from "@/components/ui/MockupWindow";
import { NeoTable } from "@/components/ui/NeoTable";
import { LifecycleRail, SubscriptionStage } from "@/components/subscriptions/LifecycleRail";
import { useToast } from "@/components/ui/ToastContext";

export default function StyleguidePage() {
  const { toast, success, error } = useToast();
  const [testStage, setTestStage] = useState<SubscriptionStage>("active");
  const [inputValue, setInputValue] = useState("");
  const [hasError, setHasError] = useState(false);

  const sampleData = [
    { id: "1", sub: "SUB-0001", customer: "Acme Corporation", plan: "Scale Yearly", amount: "$12,400.00", status: "active" },
    { id: "2", sub: "SUB-0002", customer: "Stark Industries", plan: "Starter Monthly", amount: "$560.00", status: "overdue" },
    { id: "3", sub: "SUB-0003", customer: "Wayne Enterprises", plan: "Enterprise Pro", amount: "$48,000.00", status: "paid" },
    { id: "4", sub: "SUB-0004", customer: "Cyberdyne Systems", plan: "Scale Yearly", amount: "$8,900.00", status: "quotation" },
  ];

  return (
    <div className="min-h-screen bg-neoCanvas p-6 md:p-12 space-y-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-black pb-6">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold mb-2 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Brightloop
          </Link>
          <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight">
            Design Tokens & Primitives
          </h1>
          <p className="text-neutral-600 font-medium mt-1">
            Neo-Brutalist design system testbed: 2px borders, 0-blur hard shadows, Cabinet Grotesk & Satoshi.
          </p>
        </div>
        <div className="flex gap-2">
          <NeoButton variant="secondary" size="compact" onClick={() => success("Toast system working!")}>
            Test Success Toast
          </NeoButton>
          <NeoButton variant="destructive" size="compact" onClick={() => error("Overdue payment alert triggered")}>
            Test Error Toast
          </NeoButton>
        </div>
      </div>

      {/* 1. Palette & Surface Tokens */}
      <section className="space-y-4">
        <h2 className="text-2xl font-heading font-extrabold flex items-center gap-2">
          <Layers className="w-6 h-6" /> Color Palette & Tokens
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          <div className="border-2 border-black rounded-[10px] bg-neoYellow p-4 shadow-neo">
            <p className="font-bold text-sm">Primary Yellow</p>
            <p className="font-mono text-xs">#ffe17c</p>
          </div>
          <div className="border-2 border-black rounded-[10px] bg-neoCharcoal text-white p-4 shadow-neo">
            <p className="font-bold text-sm">Charcoal</p>
            <p className="font-mono text-xs">#171e19</p>
          </div>
          <div className="border-2 border-black rounded-[10px] bg-neoSage text-black p-4 shadow-neo">
            <p className="font-bold text-sm">Sage</p>
            <p className="font-mono text-xs">#b7c6c2</p>
          </div>
          <div className="border-2 border-black rounded-[10px] bg-statusGreen text-black p-4 shadow-neo">
            <p className="font-bold text-sm">Status Green</p>
            <p className="font-mono text-xs">#28c840</p>
          </div>
          <div className="border-2 border-black rounded-[10px] bg-statusAmber text-black p-4 shadow-neo">
            <p className="font-bold text-sm">Status Amber</p>
            <p className="font-mono text-xs">#febc2e</p>
          </div>
          <div className="border-2 border-black rounded-[10px] bg-statusRed text-black p-4 shadow-neo">
            <p className="font-bold text-sm">Status Red</p>
            <p className="font-mono text-xs">#ff5f57</p>
          </div>
        </div>
      </section>

      {/* 2. Push Buttons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-heading font-extrabold">Push Buttons (Tactile Physics)</h2>
        <div className="p-6 bg-white border-2 border-black rounded-[14px] shadow-neo flex flex-wrap items-center gap-6">
          <NeoButton variant="primary">Primary Push Button</NeoButton>
          <NeoButton variant="secondary">Secondary Button</NeoButton>
          <NeoButton variant="destructive">Destructive Action</NeoButton>
          <NeoButton variant="hero">Large Hero CTA</NeoButton>
          <NeoButton size="compact" variant="primary">Compact</NeoButton>
          <NeoButton disabled variant="primary">Disabled</NeoButton>
        </div>
      </section>

      {/* 3. Status Badges */}
      <section className="space-y-4">
        <h2 className="text-2xl font-heading font-extrabold">Status Badges (Strict Neo Pills)</h2>
        <div className="p-6 bg-white border-2 border-black rounded-[14px] shadow-neo flex flex-wrap items-center gap-4">
          <NeoBadge status="active" />
          <NeoBadge status="paid" />
          <NeoBadge status="confirmed" />
          <NeoBadge status="quotation" />
          <NeoBadge status="draft" />
          <NeoBadge status="due_soon" />
          <NeoBadge status="paused" />
          <NeoBadge status="overdue" />
          <NeoBadge status="cancelled" />
          <NeoBadge status="closed" />
          <NeoBadge status="admin" />
          <NeoBadge status="staff" />
          <NeoBadge status="customer" />
        </div>
      </section>

      {/* 4. Form Inputs */}
      <section className="space-y-4">
        <h2 className="text-2xl font-heading font-extrabold">Form Inputs (High-Contrast Focus Ring)</h2>
        <div className="p-6 bg-white border-2 border-black rounded-[14px] shadow-neo grid grid-cols-1 md:grid-cols-2 gap-6">
          <NeoInput
            label="Product Name"
            placeholder="e.g. Enterprise Cloud ERP"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            helperText="The public catalog display name."
          />
          <NeoInput
            label="Price with Validation"
            placeholder="560.00"
            error={hasError ? "Variant adjustment must be positive number" : undefined}
            helperText="Click button below to toggle error state."
          />
          <div className="col-span-full">
            <NeoButton size="compact" variant="secondary" onClick={() => setHasError(!hasError)}>
              Toggle Error State
            </NeoButton>
          </div>
        </div>
      </section>

      {/* 5. Browser Mockup Window & Lifecycle Rail Preview */}
      <section className="space-y-4">
        <h2 className="text-2xl font-heading font-extrabold">Mockup Window & Subscription Lifecycle Rail</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <LifecycleRail
              currentStage={testStage}
              stageDates={{
                draft: "Oct 12",
                quotation: "Oct 14",
                confirmed: "Oct 15",
                active: "Oct 16",
              }}
              onAdvanceStage={(next) => {
                setTestStage(next);
                success(`Subscription moved to ${next}`);
              }}
            />
          </div>
          <div className="lg:col-span-2">
            <MockupWindow title="preview // INV-2026-0814.pdf">
              <div className="space-y-6">
                <div className="flex justify-between items-start border-b-2 border-black pb-4">
                  <div>
                    <h3 className="text-2xl font-black font-heading">BRIGHTLOOP BILLING</h3>
                    <p className="text-xs font-mono text-neutral-600">INVOICE #INV-2026-0814</p>
                  </div>
                  <NeoBadge status="active" label="CONFIRMED" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs uppercase text-neutral-500 font-bold">Billed To</p>
                    <p className="font-bold">Wayne Enterprises Inc.</p>
                    <p className="text-neutral-600">bruce@waynecorp.com</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase text-neutral-500 font-bold">Due Date</p>
                    <p className="font-bold font-mono">Nov 15, 2026</p>
                  </div>
                </div>
                <div className="bg-neoYellow/30 border-2 border-black rounded-[8px] p-4 text-sm font-medium">
                  Live invoice calculation updates instantly upon changing product lines or discount rates.
                </div>
              </div>
            </MockupWindow>
          </div>
        </div>
      </section>

      {/* 6. Neo Table */}
      <section className="space-y-4">
        <h2 className="text-2xl font-heading font-extrabold">Data Table (Sticky Header, Row Hover Fill)</h2>
        <NeoTable
          columns={[
            { header: "Subscription", accessorKey: "sub" },
            { header: "Customer", accessorKey: "customer" },
            { header: "Plan", accessorKey: "plan" },
            { header: "Status", render: (r) => <NeoBadge status={r.status} /> },
            { header: "Amount", accessorKey: "amount", align: "right" },
          ]}
          data={sampleData}
          keyExtractor={(r) => r.id}
          onRowClick={(r) => toast(`Selected ${r.customer} (${r.sub})`, "info")}
        />
      </section>
    </div>
  );
}

