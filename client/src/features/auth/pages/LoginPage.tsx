import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.js';
import { extractErrorMessage } from '../../../services/api.js';
import { Logo } from '../../../components/common/Logo.js';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

type DemoRole = 'admin' | 'staff' | 'customer';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = (location.state as { message?: string } | null)?.message;

  const [activeRole, setActiveRole] = useState<DemoRole>('admin');
  const [email, setEmail] = useState('admin@brightloop.io');
  const [password, setPassword] = useState('Admin@Brightloop123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role: DemoRole) => {
    setActiveRole(role);
    setError(null);
    if (role === 'admin') {
      setEmail('admin@brightloop.io');
      setPassword('Admin@Brightloop123!');
    } else if (role === 'staff') {
      setEmail('staff@brightloop.io');
      setPassword('Staff@Brightloop123!');
    } else {
      setEmail('customer@brightloop.io');
      setPassword('Customer@Brightloop123!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login({ email, password, rememberMe });
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'STAFF') {
        navigate('/staff');
      } else {
        navigate('/portal');
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant/40 p-6 sm:p-8 flex flex-col">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="mb-3">
          <Logo size="lg" showSubtitle={false} />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-primary font-semibold tracking-wide uppercase">
          <span>Subscriptly</span>
          <span className="text-outline">by Brightloop Software</span>
        </div>
        <h1 className="mt-2 font-heading text-xl font-bold text-on-surface">
          Sign in to your subscription control center
        </h1>
        <p className="mt-1 text-xs text-on-surface-variant max-w-sm">
          Manage recurring billing, revenue operations, and customer lifecycles.
        </p>
      </div>

      {/* Role Quick-Demo Selector */}
      <div className="w-full mb-6">
        <div className="w-full p-1 rounded-lg bg-surface-container flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleRoleSelect('admin')}
            className={`flex-1 py-1.5 px-2 rounded-md text-xs transition-all duration-150 text-center font-medium ${
              activeRole === 'admin'
                ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Admin / FinOps
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect('staff')}
            className={`flex-1 py-1.5 px-2 rounded-md text-xs transition-all duration-150 text-center font-medium ${
              activeRole === 'staff'
                ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Staff / Ops
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect('customer')}
            className={`flex-1 py-1.5 px-2 rounded-md text-xs transition-all duration-150 text-center font-medium ${
              activeRole === 'customer'
                ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Client Portal
          </button>
        </div>

        <div className="mt-2 px-1 flex items-center justify-between text-outline text-[11px]">
          <span className="flex items-center gap-1 text-primary">
            <ShieldCheck className="w-3.5 h-3.5" />
            {activeRole === 'admin' && 'Full revenue, gateway, and ledger privileges'}
            {activeRole === 'staff' && 'Operational queue and customer support access'}
            {activeRole === 'customer' && 'Self-service subscriptions and billing portal'}
          </span>
          <span className="uppercase tracking-wider font-semibold text-[10px]">
            {activeRole === 'admin' ? 'Tier 1' : activeRole === 'staff' ? 'Tier 2' : 'Portal'}
          </span>
        </div>
      </div>

      {/* Success Notification Alert (e.g. from password reset) */}
      {successMessage && (
        <div className="mb-4 p-3 rounded-lg bg-secondary-container/70 border border-secondary/40 text-secondary flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error-container/60 border border-error/30 text-error flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Credentials Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-on-surface font-medium" htmlFor="workEmail">
            Work Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input
              id="workEmail"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-lowest border border-outline-variant/60 text-on-surface text-sm placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-xs text-on-surface font-medium" htmlFor="passwordInput">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-primary hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input
              id="passwordInput"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full h-10 pl-9 pr-10 rounded-lg bg-surface-container-lowest border border-outline-variant/60 text-on-surface text-sm placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            />
            <button
              type="button"
              aria-label="Toggle password visibility"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1 rounded transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
            />
            <span className="text-xs text-on-surface-variant">Remember this device for 30 days</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying credentials...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="text-center pt-2">
          <p className="text-xs text-on-surface-variant">
            Need client self-service access?{' '}
            <Link to="/register" className="text-primary hover:underline font-semibold">
              Register company portal
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
