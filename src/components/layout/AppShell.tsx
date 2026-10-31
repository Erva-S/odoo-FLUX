"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Zap,
  LayoutDashboard,
  Repeat,
  FileText,
  CreditCard,
  Users,
  Box,
  Percent,
  Settings,
  Search,
  Plus,
  LogOut,
  Menu,
  X,
  ChevronDown,
  UserCheck,
  ShieldAlert,
} from "lucide-react";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoBadge } from "@/components/ui/NeoBadge";
import { useAuth } from "@/lib/auth/AuthContext";
import clsx from "clsx";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Subscriptions", href: "/subscriptions", icon: Repeat },
  { label: "Invoices", href: "/invoices", icon: FileText },
  { label: "Payments", href: "/payments", icon: CreditCard },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Catalog", href: "/catalog", icon: Box, adminOnly: true },
  { label: "Discounts", href: "/discounts", icon: Percent, adminOnly: true },
  { label: "Settings", href: "/settings", icon: Settings, adminOnly: true },
];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, role, logout, switchDemoRole } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (item.adminOnly && role !== "admin") return false;
    return true;
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/subscriptions?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="min-h-screen bg-neoCanvas flex flex-col">
      {/* Top Bar: Yellow h-20 with border-b-2 */}
      <header className="h-20 bg-neoYellow border-b-2 border-black sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-black border-2 border-black rounded-[8px] bg-white shadow-neo-sm"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-neoBlack border-2 border-black rounded-[8px] flex items-center justify-center shadow-neo-sm group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
              <Zap className="w-6 h-6 text-neoYellow fill-neoYellow" />
            </div>
            <div className="hidden sm:block">
              <span className="font-heading font-black text-xl tracking-tighter text-neoBlack block">
                BRIGHTLOOP
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-800 -mt-1 block font-bold">
                BILLING CONSOLE
              </span>
            </div>
          </Link>
        </div>

        {/* Global Search */}
        <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center max-w-md w-full mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search subscriptions, invoices, customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-[8px] pl-9 pr-4 py-2 text-sm font-medium shadow-neo-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </form>

        {/* Right Menus: "New" menu & User menu */}
        <div className="flex items-center gap-3">
          {/* "New" Dropdown */}
          <div className="relative">
            <NeoButton
              variant="primary"
              size="compact"
              onClick={() => setNewMenuOpen(!newMenuOpen)}
              icon={<Plus className="w-4 h-4" />}
            >
              <span>New</span>
              <ChevronDown className="w-3.5 h-3.5 ml-1" />
            </NeoButton>

            {newMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-52 bg-white border-2 border-black rounded-[10px] shadow-neo-lg z-50 p-1.5 space-y-1 animate-slide-in"
                onClick={() => setNewMenuOpen(false)}
              >
                <Link
                  href="/subscriptions/new"
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-black hover:bg-neoYellow rounded-[6px] transition-colors"
                >
                  <Repeat className="w-4 h-4" /> New Subscription
                </Link>
                <Link
                  href="/invoices/generate"
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-black hover:bg-neoYellow rounded-[6px] transition-colors"
                >
                  <FileText className="w-4 h-4" /> Run Automated Billing
                </Link>
                {role === "admin" && (
                  <>
                    <div className="border-t-2 border-neoDivider my-1" />
                    <Link
                      href="/catalog/new"
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-black hover:bg-neoYellow rounded-[6px] transition-colors"
                    >
                      <Box className="w-4 h-4" /> New Product
                    </Link>
                    <Link
                      href="/discounts/new"
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-black hover:bg-neoYellow rounded-[6px] transition-colors"
                    >
                      <Percent className="w-4 h-4" /> New Discount Code
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 bg-white border-2 border-black rounded-[8px] shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-neoSage border-2 border-black flex items-center justify-center font-bold text-xs">
                {currentUser?.name ? currentUser.name[0].toUpperCase() : "U"}
              </div>
              <div className="hidden lg:block text-left pr-1">
                <p className="text-xs font-extrabold text-black leading-tight">
                  {currentUser?.name || "Active Session"}
                </p>
                <p className="text-[10px] font-bold text-neutral-600 uppercase">
                  {role || "Staff"}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-black" />
            </button>

            {userMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white border-2 border-black rounded-[10px] shadow-neo-lg z-50 p-2 space-y-2 animate-slide-in"
                onClick={() => setUserMenuOpen(false)}
              >
                <div className="p-2 bg-neoCanvas border-2 border-black rounded-[8px]">
                  <p className="text-xs font-extrabold text-black">{currentUser?.name}</p>
                  <p className="text-[11px] text-neutral-600 truncate">{currentUser?.email}</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <NeoBadge status={role || "staff"} />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-neutral-500 px-2 pt-1">
                    Quick Role Switch
                  </p>
                  <button
                    onClick={() => switchDemoRole("admin")}
                    className="w-full text-left px-2.5 py-1.5 text-xs font-bold hover:bg-neoYellow rounded-[6px] flex items-center justify-between"
                  >
                    <span>Switch to Admin</span>
                    {role === "admin" && <span className="text-[10px] font-mono font-bold text-black">ACTIVE</span>}
                  </button>
                  <button
                    onClick={() => switchDemoRole("staff")}
                    className="w-full text-left px-2.5 py-1.5 text-xs font-bold hover:bg-neoYellow rounded-[6px] flex items-center justify-between"
                  >
                    <span>Switch to Staff</span>
                    {role === "staff" && <span className="text-[10px] font-mono font-bold text-black">ACTIVE</span>}
                  </button>
                  <button
                    onClick={() => switchDemoRole("customer")}
                    className="w-full text-left px-2.5 py-1.5 text-xs font-bold hover:bg-neoYellow rounded-[6px] flex items-center justify-between"
                  >
                    <span>Customer Portal</span>
                    {role === "customer" && <span className="text-[10px] font-mono font-bold text-black">ACTIVE</span>}
                  </button>
                </div>

                <div className="border-t-2 border-neoDivider pt-1">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold text-statusRed hover:bg-statusRed/10 rounded-[6px]"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body with Left Sidebar */}
      <div className="flex-1 flex">
        {/* Left Sidebar: #171e19 with sage text; active item is a yellow block with 2px black border and 4px shadow */}
        <aside
          className={clsx(
            "bg-neoCharcoal w-64 border-r-2 border-black flex flex-col justify-between p-4 shrink-0 transition-transform duration-200 z-30",
            "fixed inset-y-20 left-0 md:static md:translate-x-0",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          {/* Navigation Links */}
          <nav className="space-y-2">
            <div className="px-3 py-2 text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
              Main Operations
            </div>
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] font-body font-bold text-sm transition-all duration-150 select-none",
                    isActive
                      ? "bg-neoYellow text-black border-2 border-black shadow-neo"
                      : "text-neoSage hover:text-white hover:bg-neoDark border-2 border-transparent"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom user status in sidebar */}
          <div className="pt-4 border-t-2 border-neoDark mt-6">
            <div className="p-3 bg-neoDark rounded-[10px] border border-black/40 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-neoSage text-black flex items-center justify-center font-bold text-xs shrink-0 border border-black">
                {currentUser?.name ? currentUser.name[0] : "B"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{currentUser?.name}</p>
                <p className="text-[10px] font-mono text-neoSage uppercase font-bold">{role || "Staff"}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-20 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Canvas: #f4f4f5 so data-heavy screens stay readable */}
        <main className="flex-1 bg-neoCanvas p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

