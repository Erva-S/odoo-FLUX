"use client";

import React from "react";
import Link from "next/link";
import {
  Zap,
  Check,
  X,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  BarChart3,
  FileText,
  CreditCard,
  Users,
  Repeat,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoBadge } from "@/components/ui/NeoBadge";
import { MockupWindow } from "@/components/ui/MockupWindow";
import { INITIAL_PLANS } from "@/lib/data/store";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neoCanvas text-neoBlack selection:bg-neoYellow selection:text-black">
      {/* 1. Fixed Header: h-20, #ffe17c, border-b-2 black */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-neoYellow border-b-2 border-black z-50 flex items-center justify-between px-4 sm:px-8">
        {/* Left: Logo 40px black square with yellow bolt */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-neoBlack border-2 border-black rounded-[8px] flex items-center justify-center shadow-neo-sm">
            <Zap className="w-6 h-6 text-neoYellow fill-neoYellow" />
          </div>
          <span className="font-heading font-black text-2xl tracking-tighter text-neoBlack">
            Brightloop
          </span>
        </Link>

        {/* Center links in bold Satoshi */}
        <nav className="hidden md:flex items-center gap-8 font-body font-bold text-sm text-neoBlack">
          <a href="#problem-solution" className="hover:underline">
            Why Us
          </a>
          <a href="#plans" className="hover:underline">
            Plans & Pricing
          </a>
          <a href="#how-it-works" className="hover:underline">
            How It Works
          </a>
          <a href="#roles" className="hover:underline">
            Roles
          </a>
          <Link href="/styleguide" className="hover:underline text-neutral-700">
            Styleguide
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:inline-block">
            <NeoButton variant="secondary" size="compact">
              Sign In
            </NeoButton>
          </Link>
          <Link href="/signup">
            <NeoButton variant="primary" size="compact">
              Start Free Trial
            </NeoButton>
          </Link>
        </div>
      </header>

      {/* Main Container with top padding for fixed header */}
      <main className="pt-20">
        {/* 2. Hero Section on #ffe17c with dot pattern. Two columns. */}
        <section className="bg-neoYellow bg-neo-dots border-b-2 border-black py-16 lg:py-24 px-4 sm:px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-block">
                <span className="bg-white text-black font-bold text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-full border-2 border-black shadow-[2px_2px_0_0_#000]">
                  New: Self-service billing portal
                </span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-black tracking-tight leading-[0.95]">
                Run subscriptions without{" "}
                <span className="text-stroke-black">spreadsheets</span>.
              </h1>

              <p className="text-lg sm:text-xl font-body font-medium text-neutral-800 max-w-xl">
                Tired of missed renewals, hand-typed invoices, and manual bank statement scrolling?
                Brightloop Billing automates your recurring revenue lifecycle from quote to cash.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href="/dashboard">
                  <NeoButton variant="hero" icon={<ArrowRight className="w-5 h-5" />}>
                    Launch Live Console
                  </NeoButton>
                </Link>
                <Link href="/portal">
                  <NeoButton variant="secondary" size="large">
                    Customer Portal Demo
                  </NeoButton>
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-4 text-xs font-bold text-neutral-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>Idempotent Billing Runs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>Odoo Variant Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>Sub-2s Query Engines</span>
                </div>
              </div>
            </div>

            {/* Right column: browser-mockup window showing finance dashboard */}
            <div className="lg:col-span-5">
              <MockupWindow
                title="brightloop // finance-overview.app"
                headerRight={
                  <span className="text-[10px] font-mono bg-neoYellow px-2 py-0.5 rounded text-black font-bold border border-black">
                    LIVE REVENUE
                  </span>
                }
              >
                <div className="space-y-4">
                  {/* Top metrics inside preview */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-neoSage border-2 border-black rounded-[10px] p-3 shadow-[2px_2px_0_0_#000]">
                      <p className="text-[10px] font-bold uppercase text-black">Revenue Collected</p>
                      <p className="text-xl font-heading font-black text-black tnum">$184,250.00</p>
                    </div>
                    <div className="bg-neoCharcoal text-white border-2 border-black rounded-[10px] p-3 shadow-[2px_2px_0_0_#000]">
                      <p className="text-[10px] font-bold uppercase text-neoSage">Still Owed</p>
                      <p className="text-xl font-heading font-black text-neoYellow tnum">$16,420.00</p>
                    </div>
                  </div>

                  {/* Overdue alert panel */}
                  <div className="bg-statusRed/20 border-2 border-black rounded-[10px] p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-extrabold text-black uppercase">Overdue Invoices</p>
                      <p className="text-xs text-neutral-800">4 accounts require follow-up</p>
                    </div>
                    <span className="font-heading font-extrabold text-sm text-statusRed bg-white px-2 py-1 rounded border-2 border-black tnum">
                      $6,800.00
                    </span>
                  </div>

                  {/* Active Subscriptions mini table */}
                  <div className="border-2 border-black rounded-[8px] overflow-hidden text-xs">
                    <div className="bg-neoBlack text-white px-3 py-1.5 font-bold flex justify-between">
                      <span>CUSTOMER</span>
                      <span>STATUS</span>
                    </div>
                    <div className="p-2 space-y-1.5 bg-white">
                      <div className="flex justify-between items-center py-1 border-b border-neoDivider">
                        <span className="font-bold">Wayne Enterprises</span>
                        <NeoBadge status="active" />
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-neoDivider">
                        <span className="font-bold">Acme Corp (Odoo Pack)</span>
                        <NeoBadge status="active" />
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="font-bold">Stark Industries</span>
                        <NeoBadge status="overdue" />
                      </div>
                    </div>
                  </div>
                </div>
              </MockupWindow>
            </div>
          </div>
        </section>

        {/* 3. Problem vs Solution on white: two large cards */}
        <section id="problem-solution" className="bg-white py-20 px-4 sm:px-8 border-b-2 border-black">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs uppercase font-extrabold tracking-widest text-neutral-500">
                The Shift
              </span>
              <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight">
                Stop running recurring revenue on spreadsheets
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left card: Spreadsheets */}
              <div className="bg-neoCanvas border-2 border-dashed border-neutral-400 rounded-[14px] p-8 opacity-75 space-y-6">
                <div className="flex items-center justify-between border-b-2 border-neutral-300 pb-4">
                  <h3 className="text-2xl font-heading font-bold text-neutral-700">
                    The Spreadsheet Trap
                  </h3>
                  <span className="text-xs font-mono font-bold bg-neutral-300 text-neutral-700 px-2.5 py-1 rounded">
                    LEGACY CHAOS
                  </span>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-statusRed/20 border-2 border-black flex items-center justify-center shrink-0 mt-0.5">
                      <X className="w-3.5 h-3.5 text-statusRed stroke-[3]" />
                    </div>
                    <div>
                      <p className="font-bold text-base text-neutral-800">Missed Renewals</p>
                      <p className="text-sm text-neutral-600">
                        Expired contracts keep running silently without invoicing or contract updates.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-statusRed/20 border-2 border-black flex items-center justify-center shrink-0 mt-0.5">
                      <X className="w-3.5 h-3.5 text-statusRed stroke-[3]" />
                    </div>
                    <div>
                      <p className="font-bold text-base text-neutral-800">Hand-typed Invoices</p>
                      <p className="text-sm text-neutral-600">
                        Sales reps re-type totals into Word or PDF templates, creating pricing errors.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-statusRed/20 border-2 border-black flex items-center justify-center shrink-0 mt-0.5">
                      <X className="w-3.5 h-3.5 text-statusRed stroke-[3]" />
                    </div>
                    <div>
                      <p className="font-bold text-base text-neutral-800">Manual Statement Matching</p>
                      <p className="text-sm text-neutral-600">
                        Finance leads scroll raw PDF bank statements trying to match wire references.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Right card: Brightloop Billing */}
              <div className="bg-neoYellow border-2 border-black rounded-[14px] p-8 shadow-neo-lg space-y-6">
                <div className="flex items-center justify-between border-b-2 border-black pb-4">
                  <h3 className="text-2xl font-heading font-black text-neoBlack">
                    Brightloop Billing
                  </h3>
                  <span className="text-xs font-mono font-bold bg-neoBlack text-neoYellow px-2.5 py-1 rounded">
                    AUTOMATED
                  </span>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-statusGreen border-2 border-black flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                    </div>
                    <div>
                      <p className="font-bold text-base text-neoBlack">Invoices from Subscriptions</p>
                      <p className="text-sm text-neutral-800">
                        Never typed by hand. One-click idempotent batch generation across every active plan.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-statusGreen border-2 border-black flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                    </div>
                    <div>
                      <p className="font-bold text-base text-neoBlack">Automatic Tax & Discounts</p>
                      <p className="text-sm text-neutral-800">
                        Admin tax rules, promo codes, and attribute add-ons (Brand = Odoo +$560) calculated dynamically.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-statusGreen border-2 border-black flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                    </div>
                    <div>
                      <p className="font-bold text-base text-neoBlack">Payments Tracked per Invoice</p>
                      <p className="text-sm text-neutral-800">
                        Partial payments, outstanding balance ledger, and automated overdue aging badges.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Plans Grid on #ffe17c with border-y-2 */}
        <section id="plans" className="bg-neoYellow py-20 px-4 sm:px-8 border-b-2 border-black">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs uppercase font-extrabold tracking-widest text-neutral-800">
                Predictable SaaS Pricing
              </span>
              <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight">
                Plans built to scale with your volume
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {INITIAL_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white border-2 border-black rounded-[14px] p-6 shadow-neo flex flex-col justify-between group hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
                >
                  <div className="space-y-4">
                    {/* 16x16 icon box in sage that turns yellow on hover */}
                    <div className="w-12 h-12 bg-neoSage border-2 border-black rounded-[8px] flex items-center justify-center group-hover:bg-neoYellow transition-colors">
                      <Sparkles className="w-6 h-6 text-black" />
                    </div>

                    <div>
                      <h3 className="font-heading font-extrabold text-xl">{plan.name}</h3>
                      <p className="text-xs text-neutral-600 mt-1">{plan.description}</p>
                    </div>

                    <div className="pt-2">
                      <span className="font-heading font-black text-3xl tnum">
                        ${plan.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs font-bold text-neutral-600 ml-1">
                        / {plan.billingPeriod}
                      </span>
                    </div>

                    <div className="border-t-2 border-neoDivider pt-4 space-y-2 text-xs font-medium">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Min Quantity:</span>
                        <span className="font-bold">{plan.minimumQuantity} seat(s)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Auto Renewal:</span>
                        <span className="font-bold">{plan.allowRenew ? "Enabled" : "Manual"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Pause Support:</span>
                        <span className="font-bold">{plan.allowPause ? "Supported" : "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <Link href="/signup" className="w-full">
                      <NeoButton variant="secondary" size="compact" className="w-full">
                        Choose Plan
                      </NeoButton>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. How It Works: dark section #171e19 with 3 numbered steps */}
        <section id="how-it-works" className="bg-neoCharcoal text-white py-20 px-4 sm:px-8 border-b-2 border-black">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs uppercase font-extrabold tracking-widest text-neoSage">
                Streamlined Operations
              </span>
              <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-white">
                How Brightloop Works
              </h2>
            </div>

            {/* 3 steps with 24x24 colored circles joined by line */}
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Connector line */}
              <div className="hidden md:block absolute top-7 left-1/6 right-1/6 h-0.5 bg-neoDark z-0" />

              {/* Step 1 */}
              <div className="relative z-10 bg-neoDark/50 border-2 border-black rounded-[14px] p-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-neoSage border-2 border-black flex items-center justify-center text-black font-heading font-black text-xl shadow-[0_0_12px_rgba(183,198,194,0.6)]">
                  1
                </div>
                <h3 className="font-heading font-black text-xl text-white">Create Account</h3>
                <p className="text-sm text-neutral-300 font-medium">
                  Register in seconds with verified password security or deploy on-premise with Supabase.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 bg-neoDark/50 border-2 border-black rounded-[14px] p-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-neoYellow border-2 border-black flex items-center justify-center text-black font-heading font-black text-xl shadow-[0_0_12px_rgba(255,225,124,0.6)]">
                  2
                </div>
                <h3 className="font-heading font-black text-xl text-white">Pick a Plan & Addons</h3>
                <p className="text-sm text-neutral-300 font-medium">
                  Select recurring terms, attach brand variants like Odoo (+560), and generate instant quotes.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative z-10 bg-neoDark/50 border-2 border-black rounded-[14px] p-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-white border-2 border-black flex items-center justify-center text-black font-heading font-black text-xl shadow-[0_0_12px_rgba(255,255,255,0.6)]">
                  3
                </div>
                <h3 className="font-heading font-black text-xl text-white">Manage in Your Portal</h3>
                <p className="text-sm text-neutral-300 font-medium">
                  Download printable invoices, monitor renewal dates, and execute instant payments seamlessly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Built for three roles: white bento grid, 3 cards */}
        <section id="roles" className="bg-white py-20 px-4 sm:px-8 border-b-2 border-black">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs uppercase font-extrabold tracking-widest text-neutral-500">
                Tailored Workflows
              </span>
              <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight">
                Built for three distinct user roles
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Admin Card on sage */}
              <div className="bg-neoSage border-2 border-black rounded-[14px] p-8 shadow-neo flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="bg-white text-black font-bold text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-full border-2 border-black inline-block">
                    Administrator
                  </span>
                  <h3 className="font-heading font-black text-2xl">Catalog & Team Control</h3>
                  <p className="text-sm text-neutral-800 font-medium leading-relaxed">
                    Sets up products, attribute variants, recurring plans, taxes, and promotional discounts.
                    The only role authorized to add new staff members.
                  </p>
                </div>
                <Link href="/dashboard">
                  <NeoButton variant="secondary" size="compact" className="w-full">
                    Explore Admin View
                  </NeoButton>
                </Link>
              </div>

              {/* Staff Card on yellow with 8px shadow */}
              <div className="bg-neoYellow border-2 border-black rounded-[14px] p-8 shadow-neo-lg flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="bg-white text-black font-bold text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-full border-2 border-black inline-block">
                    Internal Staff
                  </span>
                  <h3 className="font-heading font-black text-2xl">Day-to-day Operations</h3>
                  <p className="text-sm text-neutral-800 font-medium leading-relaxed">
                    Manages quotations from templates, advances subscription lifecycles, prints invoices,
                    records customer payments, and reviews overdue accounts.
                  </p>
                </div>
                <Link href="/dashboard">
                  <NeoButton variant="primary" size="compact" className="w-full">
                    Launch Operations Shell
                  </NeoButton>
                </Link>
              </div>

              {/* Customer Card on #272727 with white text */}
              <div className="bg-neoDark text-white border-2 border-black rounded-[14px] p-8 shadow-neo flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="bg-white text-black font-bold text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-full border-2 border-black inline-block">
                    Customer
                  </span>
                  <h3 className="font-heading font-black text-2xl">Self-Service Portal</h3>
                  <p className="text-sm text-neutral-300 font-medium leading-relaxed">
                    Self-service portal displaying strictly their own subscriptions, renewal countdowns,
                    printable PDF invoices, and one-click payment settlement.
                  </p>
                </div>
                <Link href="/portal">
                  <NeoButton variant="secondary" size="compact" className="w-full">
                    Open Client Portal
                  </NeoButton>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Final CTA on yellow with large centered heading */}
        <section className="bg-neoYellow bg-neo-dots py-24 px-4 sm:px-8 border-b-2 border-black text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl sm:text-6xl font-heading font-black tracking-tight leading-tight">
              Ready to replace spreadsheet chaos with precision billing?
            </h2>
            <p className="text-lg sm:text-xl font-medium text-neutral-800 max-w-2xl mx-auto">
              Get started in under two minutes with seed data preloaded and instant idempotency checks.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/signup">
                <NeoButton variant="hero" icon={<ArrowRight className="w-5 h-5" />}>
                  Start Your Free Trial
                </NeoButton>
              </Link>
              <Link href="/login">
                <NeoButton variant="secondary" size="large">
                  Sign In to Live Demo
                </NeoButton>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer on #171e19 in 4 columns, social squares 40px in #272727 that turn yellow on hover */}
      <footer className="bg-neoCharcoal text-white py-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b-2 border-neoDark pb-12">
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-neoBlack border-2 border-black rounded-[8px] flex items-center justify-center">
                <Zap className="w-6 h-6 text-neoYellow fill-neoYellow" />
              </div>
              <span className="font-heading font-black text-2xl tracking-tighter">Brightloop</span>
            </div>
            <p className="text-xs text-neutral-400 font-medium">
              Enterprise Subscription Management & FinOps automation for modern software organizations.
            </p>
            {/* Social squares 40px in #272727 that turn yellow with black icon on hover */}
            <div className="flex gap-2 pt-2">
              <a
                href="#"
                className="w-10 h-10 bg-neoDark border-2 border-black rounded-[8px] flex items-center justify-center hover:bg-neoYellow hover:text-black transition-colors"
                aria-label="GitHub"
              >
                <span className="font-bold text-xs">GH</span>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-neoDark border-2 border-black rounded-[8px] flex items-center justify-center hover:bg-neoYellow hover:text-black transition-colors"
                aria-label="X / Twitter"
              >
                <span className="font-bold text-xs">X</span>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-neoDark border-2 border-black rounded-[8px] flex items-center justify-center hover:bg-neoYellow hover:text-black transition-colors"
                aria-label="LinkedIn"
              >
                <span className="font-bold text-xs">IN</span>
              </a>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-neoSage">
              Product
            </h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><Link href="/dashboard" className="hover:text-white">Finance Console</Link></li>
              <li><Link href="/subscriptions" className="hover:text-white">Subscription Engine</Link></li>
              <li><Link href="/invoices" className="hover:text-white">Automated Invoicing</Link></li>
              <li><Link href="/catalog" className="hover:text-white">Product Catalog & Variants</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-neoSage">
              Resources
            </h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><Link href="/portal" className="hover:text-white">Customer Portal</Link></li>
              <li><Link href="/styleguide" className="hover:text-white">Design Styleguide</Link></li>
              <li><a href="#plans" className="hover:text-white">Pricing Plans</a></li>
              <li><a href="#how-it-works" className="hover:text-white">Architecture & RLS</a></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-neoSage">
              Brightloop Software
            </h4>
            <p className="text-xs text-neutral-400 font-medium">
              100 Innovation Way, Suite 400<br />
              San Francisco, CA 94107<br />
              support@brightloop.io
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-statusGreen font-bold">
                <span className="w-2 h-2 rounded-full bg-statusGreen animate-ping" />
                All Systems Operational
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 font-medium">
          <p>© 2026 Brightloop Software Inc. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 font-mono">Modern Neo-Brutalist Architecture v1.0</p>
        </div>
      </footer>
    </div>
  );
}

