import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Role } from '../types/auth.js';

// Layouts
import { AuthLayout } from '../layouts/AuthLayout.js';
import { DashboardLayout } from '../layouts/DashboardLayout.js';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage.js';
import { RegisterPage } from '../pages/auth/RegisterPage.js';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage.js';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage.js';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage.js';
import { StaffManagementPage } from '../pages/admin/StaffManagementPage.js';

// Staff Pages
import { StaffDashboardPage } from '../pages/staff/StaffDashboardPage.js';

// Customer Pages
import { CustomerPortalPage } from '../pages/customer/CustomerPortalPage.js';
import { CustomerProfilePage } from '../pages/customer/CustomerProfilePage.js';

// Placeholders
import { ComingSoon } from '../components/common/ComingSoon.js';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect unauthorized user to their proper dashboard
    if (role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (role === 'STAFF') return <Navigate to="/staff" replace />;
    return <Navigate to="/portal" replace />;
  }

  return <>{children}</>;
}

function PublicAuthRoute({ children }: { children: React.ReactNode }) {
  const { role, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (isAuthenticated && role) {
    if (role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (role === 'STAFF') return <Navigate to="/staff" replace />;
    return <Navigate to="/portal" replace />;
  }

  return <>{children}</>;
}

export function AppRoutes() {
  const { role, isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Root redirect */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            role === 'ADMIN' ? (
              <Navigate to="/admin" replace />
            ) : role === 'STAFF' ? (
              <Navigate to="/staff" replace />
            ) : (
              <Navigate to="/portal" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Public Auth Routes */}
      <Route
        element={
          <PublicAuthRoute>
            <AuthLayout />
          </PublicAuthRoute>
        }
      >
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="staff" element={<StaffManagementPage />} />
        <Route
          path="customers"
          element={<ComingSoon moduleName="Customers & CRM" description="Centralized subscriber profiles, account health scores, contact directories, and customer lifecycle management." />}
        />
        <Route
          path="products"
          element={<ComingSoon moduleName="Products Catalog" description="Manage SaaS software offerings, add-on features, tiered SKUs, and usage-based meter configurations." />}
        />
        <Route
          path="plans"
          element={<ComingSoon moduleName="Plans & Pricing Tiers" description="Define recurring billing cycles (monthly, annual), trial periods, price overrides, and self-serve plans." />}
        />
        <Route
          path="quotations"
          element={<ComingSoon moduleName="Quotations & Sales" description="Draft custom enterprise contract quotes, discount approvals, and digital sales sign-off workflows." />}
        />
        <Route
          path="subscriptions"
          element={<ComingSoon moduleName="Subscriptions & Lifecycles" description="Manage live recurring billing contracts, trial conversions, mid-cycle upgrades, pauses, and cancellations." />}
        />
        <Route
          path="invoices"
          element={<ComingSoon moduleName="Invoicing & Dunning Engine" description="Automated GST/tax invoice generation, recurring PDF deliveries, and smart dunning retry sequences." />}
        />
        <Route
          path="payments"
          element={<ComingSoon moduleName="Payments & Settlements" description="Integrated payment gateway webhooks (Stripe, Razorpay, UPI), automated reconciliations, and chargeback tracking." />}
        />
        <Route
          path="discounts"
          element={<ComingSoon moduleName="Discounts & Promotions" description="Promotional coupon campaigns, percent/flat fee waivers, and limited-time referral incentives." />}
        />
        <Route
          path="taxes"
          element={<ComingSoon moduleName="Tax & Compliance Rules" description="Multi-jurisdiction GST/VAT calculations, HSN/SAC code mappings, and tax exemption certificates." />}
        />
        <Route
          path="reports"
          element={<ComingSoon moduleName="Financial Reports & Cohorts" description="MRR/ARR growth graphs, net revenue retention, cohort churn analysis, and revenue recognition reports." />}
        />
        <Route
          path="settings"
          element={<ComingSoon moduleName="Workspace Settings" description="General billing defaults, currency formats, webhook endpoint keys, and organization branding." />}
        />
      </Route>

      {/* Staff Routes */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={['STAFF']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StaffDashboardPage />} />
        <Route
          path="customers"
          element={<ComingSoon moduleName="Customer Accounts Triage" description="Operational customer directory for support queries, account verification, and assistance." />}
        />
        <Route
          path="quotations"
          element={<ComingSoon moduleName="Quotations Review" description="Prepare, review, and dispatch sales quotes to pending prospect inquiries." />}
        />
        <Route
          path="subscriptions"
          element={<ComingSoon moduleName="Subscription Queue" description="Review subscription change requests, grace periods, and renewal statuses." />}
        />
        <Route
          path="invoices"
          element={<ComingSoon moduleName="Invoice Processing" description="Inspect invoice delivery receipts and handle billing clarification tickets." />}
        />
        <Route
          path="payments"
          element={<ComingSoon moduleName="Payment Operations" description="Check transaction failure codes and initiate manual retry requests." />}
        />
      </Route>

      {/* Customer Routes */}
      <Route
        path="/portal"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CustomerPortalPage />} />
        <Route path="profile" element={<CustomerProfilePage />} />
        <Route
          path="subscriptions"
          element={<ComingSoon moduleName="My Subscriptions" description="View active subscription plans, upgrade tiers, manage seats, and review upcoming renewal dates." />}
        />
        <Route
          path="invoices"
          element={<ComingSoon moduleName="My Invoices" description="Download official tax invoices, billing receipts, and itemized fee statements." />}
        />
        <Route
          path="payments"
          element={<ComingSoon moduleName="Payment History" description="Manage saved payment cards, UPI mandates, and view recent transaction receipts." />}
        />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
