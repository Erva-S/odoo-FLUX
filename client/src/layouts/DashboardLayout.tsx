import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Logo } from '../components/common/Logo.js';
import {
  LayoutDashboard,
  Users,
  Package,
  Layers,
  FileText,
  RotateCw,
  Receipt,
  CreditCard,
  Tag,
  Scale,
  BarChart3,
  UserCheck,
  Settings,
  Search,
  Bell,
  Plus,
  ChevronDown,
  LogOut,
  UserCircle,
  Menu,
  X,
  ShieldCheck,
  Building2,
} from 'lucide-react';

export function DashboardLayout() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
    }`;

  const renderNavItems = () => {
    if (role === 'ADMIN') {
      return (
        <>
          <div className="px-3 pb-1.5 pt-1">
            <span className="text-[11px] font-semibold text-outline uppercase tracking-wider">
              Operations
            </span>
          </div>
          <nav className="space-y-1">
            <NavLink to="/admin" end className={navLinkClasses}>
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/admin/customers" className={navLinkClasses}>
              <Users className="w-4 h-4" />
              <span>Customers</span>
              <span className="ml-auto text-[10px] uppercase font-bold text-outline bg-surface-container px-1.5 py-0.5 rounded">P2</span>
            </NavLink>
            <NavLink to="/admin/products" className={navLinkClasses}>
              <Package className="w-4 h-4" />
              <span>Products</span>
              <span className="ml-auto text-[10px] uppercase font-bold text-outline bg-surface-container px-1.5 py-0.5 rounded">P2</span>
            </NavLink>
            <NavLink to="/admin/plans" className={navLinkClasses}>
              <Layers className="w-4 h-4" />
              <span>Plans</span>
              <span className="ml-auto text-[10px] uppercase font-bold text-outline bg-surface-container px-1.5 py-0.5 rounded">P2</span>
            </NavLink>
            <NavLink to="/admin/quotations" className={navLinkClasses}>
              <FileText className="w-4 h-4" />
              <span>Quotations</span>
              <span className="ml-auto text-[10px] uppercase font-bold text-outline bg-surface-container px-1.5 py-0.5 rounded">P2</span>
            </NavLink>
            <NavLink to="/admin/subscriptions" className={navLinkClasses}>
              <RotateCw className="w-4 h-4" />
              <span>Subscriptions</span>
              <span className="ml-auto text-[10px] uppercase font-bold text-outline bg-surface-container px-1.5 py-0.5 rounded">P2</span>
            </NavLink>
          </nav>

          <div className="pt-5 px-3 pb-1.5">
            <span className="text-[11px] font-semibold text-outline uppercase tracking-wider">
              Financials
            </span>
          </div>
          <nav className="space-y-1">
            <NavLink to="/admin/invoices" className={navLinkClasses}>
              <Receipt className="w-4 h-4" />
              <span>Invoices</span>
              <span className="ml-auto text-[10px] uppercase font-bold text-outline bg-surface-container px-1.5 py-0.5 rounded">P2</span>
            </NavLink>
            <NavLink to="/admin/payments" className={navLinkClasses}>
              <CreditCard className="w-4 h-4" />
              <span>Payments</span>
              <span className="ml-auto text-[10px] uppercase font-bold text-outline bg-surface-container px-1.5 py-0.5 rounded">P2</span>
            </NavLink>
            <NavLink to="/admin/discounts" className={navLinkClasses}>
              <Tag className="w-4 h-4" />
              <span>Discounts</span>
              <span className="ml-auto text-[10px] uppercase font-bold text-outline bg-surface-container px-1.5 py-0.5 rounded">P2</span>
            </NavLink>
            <NavLink to="/admin/taxes" className={navLinkClasses}>
              <Scale className="w-4 h-4" />
              <span>Taxes</span>
              <span className="ml-auto text-[10px] uppercase font-bold text-outline bg-surface-container px-1.5 py-0.5 rounded">P2</span>
            </NavLink>
            <NavLink to="/admin/reports" className={navLinkClasses}>
              <BarChart3 className="w-4 h-4" />
              <span>Reports</span>
              <span className="ml-auto text-[10px] uppercase font-bold text-outline bg-surface-container px-1.5 py-0.5 rounded">P2</span>
            </NavLink>
          </nav>

          <div className="pt-5 px-3 pb-1.5">
            <span className="text-[11px] font-semibold text-outline uppercase tracking-wider">
              Administration
            </span>
          </div>
          <nav className="space-y-1">
            <NavLink to="/admin/staff" className={navLinkClasses}>
              <UserCheck className="w-4 h-4 text-primary" />
              <span className="font-medium">Staff</span>
              <span className="ml-auto text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">Active</span>
            </NavLink>
            <NavLink to="/admin/settings" className={navLinkClasses}>
              <Settings className="w-4 h-4" />
              <span>Settings</span>
              <span className="ml-auto text-[10px] uppercase font-bold text-outline bg-surface-container px-1.5 py-0.5 rounded">P2</span>
            </NavLink>
          </nav>
        </>
      );
    }

    if (role === 'STAFF') {
      return (
        <>
          <div className="px-3 pb-1.5 pt-1">
            <span className="text-[11px] font-semibold text-outline uppercase tracking-wider">
              Operations Center
            </span>
          </div>
          <nav className="space-y-1">
            <NavLink to="/staff" end className={navLinkClasses}>
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/staff/customers" className={navLinkClasses}>
              <Users className="w-4 h-4" />
              <span>Customers</span>
              <span className="ml-auto text-[10px] uppercase font-bold text-tertiary bg-tertiary-fixed/40 px-1.5 py-0.5 rounded">360°</span>
            </NavLink>
            <NavLink to="/staff/products" className={navLinkClasses}>
              <Package className="w-4 h-4" />
              <span>Products</span>
              <span className="ml-auto text-[10px] uppercase font-bold text-secondary bg-secondary-fixed/40 px-1.5 py-0.5 rounded">Catalog</span>
            </NavLink>
            <NavLink to="/staff/plans" className={navLinkClasses}>
              <Layers className="w-4 h-4" />
              <span>Plans</span>
              <span className="ml-auto text-[10px] uppercase font-bold text-primary bg-primary-fixed/40 px-1.5 py-0.5 rounded">Engine</span>
            </NavLink>
            <NavLink to="/staff/quotations" className={navLinkClasses}>
              <FileText className="w-4 h-4" />
              <span>Quotations</span>
              <span className="ml-auto text-[10px] uppercase font-bold text-outline bg-surface-container px-1.5 py-0.5 rounded">P2</span>
            </NavLink>
            <NavLink to="/staff/subscriptions" className={navLinkClasses}>
              <RotateCw className="w-4 h-4" />
              <span>Subscriptions</span>
              <span className="ml-auto text-[10px] uppercase font-bold text-outline bg-surface-container px-1.5 py-0.5 rounded">P2</span>
            </NavLink>
            <NavLink to="/staff/invoices" className={navLinkClasses}>
              <Receipt className="w-4 h-4" />
              <span>Invoices</span>
              <span className="ml-auto text-[10px] uppercase font-bold text-outline bg-surface-container px-1.5 py-0.5 rounded">P2</span>
            </NavLink>
            <NavLink to="/staff/payments" className={navLinkClasses}>
              <CreditCard className="w-4 h-4" />
              <span>Payments</span>
              <span className="ml-auto text-[10px] uppercase font-bold text-outline bg-surface-container px-1.5 py-0.5 rounded">P2</span>
            </NavLink>
          </nav>
        </>
      );
    }

    // Customer Navigation
    return (
      <>
        <div className="px-3 pb-1.5 pt-1">
          <span className="text-[11px] font-semibold text-outline uppercase tracking-wider">
            Customer Portal
          </span>
        </div>
        <nav className="space-y-1">
          <NavLink to="/portal" end className={navLinkClasses}>
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </NavLink>
          <NavLink to="/portal/subscriptions" className={navLinkClasses}>
            <RotateCw className="w-4 h-4" />
            <span>My Subscriptions</span>
            <span className="ml-auto text-[10px] uppercase font-bold text-outline bg-surface-container px-1.5 py-0.5 rounded">P2</span>
          </NavLink>
          <NavLink to="/portal/invoices" className={navLinkClasses}>
            <Receipt className="w-4 h-4" />
            <span>My Invoices</span>
            <span className="ml-auto text-[10px] uppercase font-bold text-outline bg-surface-container px-1.5 py-0.5 rounded">P2</span>
          </NavLink>
          <NavLink to="/portal/payments" className={navLinkClasses}>
            <CreditCard className="w-4 h-4" />
            <span>Payment History</span>
            <span className="ml-auto text-[10px] uppercase font-bold text-outline bg-surface-container px-1.5 py-0.5 rounded">P2</span>
          </NavLink>
          <NavLink to="/portal/profile" className={navLinkClasses}>
            <UserCircle className="w-4 h-4 text-primary" />
            <span className="font-medium">My Profile</span>
          </NavLink>
        </nav>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-surface-container-lowest border-r border-outline-variant/40 flex-col z-50 select-none">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-outline-variant/30">
          <Logo size="sm" showSubtitle={false} />
          <span className="text-[10px] font-semibold bg-surface-container text-on-surface-variant px-2 py-0.5 rounded border border-outline-variant/40 uppercase tracking-wider">
            Brightloop
          </span>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {renderNavItems()}
        </div>

        {/* Sidebar Footer Widgets */}
        <div className="p-3 border-t border-outline-variant/30 bg-surface-container-low/40 space-y-2">
          {/* Organization Pill */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                HQ
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-on-surface truncate">
                  Brightloop HQ
                </span>
                <span className="text-[10px] text-secondary flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block" />
                  Live Tier
                </span>
              </div>
            </div>
            <ShieldCheck className="w-4 h-4 text-outline" />
          </div>

          {/* User Profile Summary */}
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0 border border-outline-variant/40">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-on-surface truncate">
                  {user?.name}
                </span>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                  {role}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-1 rounded text-outline hover:text-error hover:bg-error-container/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-72 bg-surface-container-lowest p-4 flex flex-col z-50">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
              <Logo size="sm" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-outline hover:text-on-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              {renderNavItems()}
            </div>
            <div className="pt-4 border-t border-outline-variant/30">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 p-2.5 rounded-lg text-error hover:bg-error-container/20 text-sm font-semibold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="sticky top-0 h-16 bg-surface-container-lowest border-b border-outline-variant/40 z-40 flex items-center justify-between px-4 sm:px-6 md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant"
            >
              <Menu className="w-5 h-5" />
            </button>
            <nav className="flex items-center gap-1.5 text-xs text-on-surface-variant">
              <span className="font-medium text-on-surface">Brightloop HQ</span>
              <span className="text-outline-variant">/</span>
              <span className="font-semibold text-primary capitalize">
                {role?.toLowerCase()} Workspace
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search Bar */}
            <div className="relative hidden md:flex items-center">
              <Search className="w-4 h-4 absolute left-3 text-outline pointer-events-none" />
              <input
                type="text"
                placeholder="Search subscriptions, customers..."
                className="w-64 lg:w-72 h-9 pl-9 pr-12 bg-surface-container-low/70 border border-outline-variant/50 rounded-lg text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
              />
              <kbd className="absolute right-2.5 px-1.5 py-0.5 rounded border border-outline-variant/60 bg-surface-container-lowest text-[10px] text-outline font-medium">
                ⌘K
              </kbd>
            </div>

            {/* Quick Actions */}
            {role === 'ADMIN' && (
              <button
                onClick={() => navigate('/admin/staff')}
                className="h-9 px-3 flex items-center gap-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary-container transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Staff</span>
              </button>
            )}

            {/* Notifications */}
            <button className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-low transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error ring-2 ring-surface-container-lowest" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 pl-2 py-1 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-outline-variant/50 flex items-center justify-center font-bold text-xs group-hover:border-primary transition-colors">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-outline group-hover:text-on-surface transition-colors hidden sm:block" />
              </button>

              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-lg py-1.5 z-50"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-outline-variant/30">
                    <p className="text-xs font-semibold text-on-surface truncate">{user?.name}</p>
                    <p className="text-[11px] text-outline truncate">{user?.email}</p>
                  </div>
                  {role === 'CUSTOMER' && (
                    <button
                      onClick={() => navigate('/portal/profile')}
                      className="w-full text-left px-3 py-2 text-xs text-on-surface hover:bg-surface-container transition-colors flex items-center gap-2"
                    >
                      <UserCircle className="w-3.5 h-3.5 text-outline" />
                      <span>Edit Profile</span>
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs text-error hover:bg-error-container/20 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
