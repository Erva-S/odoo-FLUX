import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.js';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase.js';
import { extractErrorMessage } from '../../../services/api.js';
import { Logo } from '../../../components/common/Logo.js';
import { User, Mail, Lock, Eye, EyeOff, Check, X, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Real-time password requirement checks (min 9 chars, uppercase, lowercase, special char)
  const hasMinLength = password.length > 8; // More than 8 characters (min 9)
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const isFormValid =
    name.trim().length >= 2 &&
    email.includes('@') &&
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasSpecial &&
    passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setError(null);
    setLoading(true);

    try {
      // 1. If Supabase is configured, register user in Supabase Auth
      if (isSupabaseConfigured()) {
        try {
          const { error: supaErr } = await supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password,
            options: {
              data: { name: name.trim() },
            },
          });
          if (supaErr && !supaErr.message.includes('User already registered')) {
            console.warn('Supabase Auth signUp note:', supaErr.message);
          }
        } catch (supaErr) {
          console.warn('Supabase Auth signUp exception:', supaErr);
        }
      }

      // 2. Register in application PostgreSQL database via backend API
      await register({
        name,
        email,
        password,
        confirmPassword,
      });

      navigate('/portal');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant/40 p-6 sm:p-8 flex flex-col">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="mb-3">
          <Logo size="lg" showSubtitle={false} />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-primary font-semibold tracking-wide uppercase">
          <span>Customer Portal Registration</span>
        </div>
        <h1 className="mt-2 font-heading text-xl font-bold text-on-surface">
          Create your Subscriptly account
        </h1>
        <p className="mt-1 text-xs text-on-surface-variant max-w-sm">
          Access self-service subscriptions, view invoices, and manage payment methods.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error-container/60 border border-error/30 text-error flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-on-surface font-medium" htmlFor="fullName">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input
              id="fullName"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Verma"
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-lowest border border-outline-variant/60 text-on-surface text-sm placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-on-surface font-medium" htmlFor="regEmail">
            Work or Business Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input
              id="regEmail"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahul@company.com"
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-lowest border border-outline-variant/60 text-on-surface text-sm placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-on-surface font-medium" htmlFor="regPassword">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input
              id="regPassword"
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

        <div className="flex flex-col gap-1">
          <label className="text-xs text-on-surface font-medium" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-lowest border border-outline-variant/60 text-on-surface text-sm placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Real-time Requirement Checklist */}
        <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30 space-y-1.5 text-[11px]">
          <span className="text-[10px] uppercase font-bold text-outline tracking-wider block mb-1">
            Password Criteria:
          </span>
          <div className="flex items-center gap-1.5">
            {hasMinLength ? <Check className="w-3.5 h-3.5 text-secondary" /> : <X className="w-3.5 h-3.5 text-outline" />}
            <span className={hasMinLength ? 'text-secondary font-medium' : 'text-on-surface-variant'}>
              More than 8 characters (minimum 9)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {hasUppercase ? <Check className="w-3.5 h-3.5 text-secondary" /> : <X className="w-3.5 h-3.5 text-outline" />}
            <span className={hasUppercase ? 'text-secondary font-medium' : 'text-on-surface-variant'}>
              At least one uppercase letter (A-Z)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {hasLowercase ? <Check className="w-3.5 h-3.5 text-secondary" /> : <X className="w-3.5 h-3.5 text-outline" />}
            <span className={hasLowercase ? 'text-secondary font-medium' : 'text-on-surface-variant'}>
              At least one lowercase letter (a-z)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {hasSpecial ? <Check className="w-3.5 h-3.5 text-secondary" /> : <X className="w-3.5 h-3.5 text-outline" />}
            <span className={hasSpecial ? 'text-secondary font-medium' : 'text-on-surface-variant'}>
              At least one special character (!@#$%^&*...)
            </span>
          </div>
          {confirmPassword && (
            <div className="flex items-center gap-1.5 pt-0.5 border-t border-outline-variant/20">
              {passwordsMatch ? <Check className="w-3.5 h-3.5 text-secondary" /> : <X className="w-3.5 h-3.5 text-error" />}
              <span className={passwordsMatch ? 'text-secondary font-medium' : 'text-error font-medium'}>
                {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
              </span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!isFormValid || loading}
          className="w-full h-10 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 mt-1"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating your account...</span>
            </>
          ) : (
            <>
              <span>Create Customer Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="text-center pt-2">
          <p className="text-xs text-on-surface-variant">
            Already have an active account?{' '}
            <Link to="/login" className="text-primary hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
