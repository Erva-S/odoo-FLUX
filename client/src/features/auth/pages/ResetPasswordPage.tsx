import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { completePasswordReset, syncPasswordReset } from '../../../services/auth.service.js';
import {
  supabase,
  updateSupabasePassword,
  getSupabaseSession,
  onSupabaseAuthStateChange,
  isSupabaseConfigured,
} from '../../../lib/supabase.js';
import { extractErrorMessage } from '../../../services/api.js';
import { Logo } from '../../../components/common/Logo.js';
import { Lock, Eye, EyeOff, Check, X, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Local token param from direct email delivery
  const localToken = searchParams.get('token') || '';
  const pkceCode = searchParams.get('code') || '';

  const [hasValidSession, setHasValidSession] = useState<boolean>(false);
  const [sessionChecking, setSessionChecking] = useState<boolean>(true);
  const [recoveryEmail, setRecoveryEmail] = useState<string>('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Password Requirement Validation Rules (min 9 chars, 1 uppercase, 1 lowercase, 1 special)
  const hasMinLength = password.length > 8; // More than 8 characters (min 9)
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const isFormValid =
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasSpecial &&
    passwordsMatch &&
    (hasValidSession || Boolean(localToken));

  // 1. Verify that user arrived through a valid Supabase password recovery session or token
  useEffect(() => {
    let isMounted = true;

    async function checkRecoverySession() {
      // A. Check for local backend token
      if (localToken) {
        if (isMounted) {
          setHasValidSession(true);
          setSessionChecking(false);
        }
        return;
      }

      // B. If Supabase is not configured in local environment and no token provided
      if (!isSupabaseConfigured()) {
        if (isMounted) {
          setHasValidSession(false);
          setSessionChecking(false);
        }
        return;
      }

      try {
        // C. If PKCE code is present in URL query params, exchange for session
        if (pkceCode) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(pkceCode);
          if (!exchangeError && data?.session) {
            if (isMounted) {
              setHasValidSession(true);
              setRecoveryEmail(data.session.user.email || '');
              setSessionChecking(false);
            }
            return;
          }
        }

        // D. Check existing Supabase session or hash fragments (#access_token=...&type=recovery)
        const session = await getSupabaseSession();
        if (session) {
          if (isMounted) {
            setHasValidSession(true);
            setRecoveryEmail(session.user.email || '');
            setSessionChecking(false);
          }
          return;
        }

        // E. Check URL hash for implicit recovery grant
        const hash = window.location.hash;
        if (hash && (hash.includes('type=recovery') || hash.includes('access_token='))) {
          if (isMounted) {
            setHasValidSession(true);
            setSessionChecking(false);
          }
          return;
        }

        if (isMounted) {
          setHasValidSession(false);
          setSessionChecking(false);
        }
      } catch (err) {
        console.warn('Session verification note:', err);
        if (isMounted) {
          setHasValidSession(false);
          setSessionChecking(false);
        }
      }
    }

    checkRecoverySession();

    // Listen for Supabase PASSWORD_RECOVERY event
    const { data: authListener } = onSupabaseAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        if (isMounted) {
          setHasValidSession(true);
          if (session?.user?.email) {
            setRecoveryEmail(session.user.email);
          }
          setSessionChecking(false);
        }
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [localToken, pkceCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setError(null);
    setLoading(true);

    try {
      let supabaseSuccess = false;

      // 1. Update password using Supabase Auth if session active
      if (isSupabaseConfigured()) {
        const { error: supaErr } = await updateSupabasePassword(password);
        if (supaErr) {
          throw new Error(supaErr.message);
        }
        supabaseSuccess = true;
      }

      // 2. Synchronize password with backend PostgreSQL database
      if (localToken) {
        await completePasswordReset({
          token: localToken,
          password,
          confirmPassword,
        });
      } else if (recoveryEmail) {
        try {
          await syncPasswordReset({
            email: recoveryEmail,
            password,
            confirmPassword,
          });
        } catch (syncErr) {
          console.warn('Backend password sync note:', syncErr);
        }
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Password updated successfully. Please log in with your new credentials.' },
        });
      }, 2500);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // 3. Loading state while checking recovery session
  if (sessionChecking) {
    return (
      <div className="w-full bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant/40 p-8 flex flex-col items-center text-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <h2 className="text-sm font-semibold text-on-surface">Verifying recovery credentials...</h2>
        <p className="text-xs text-on-surface-variant mt-1">Please wait while we validate your reset session.</p>
      </div>
    );
  }

  // 4. Invalid, expired, or missing recovery session handler
  if (!hasValidSession && !localToken) {
    return (
      <div className="w-full bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant/40 p-6 sm:p-8 flex flex-col text-center">
        <div className="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="font-heading text-lg font-bold text-on-surface mb-2">
          Invalid or Expired Reset Link
        </h1>
        <p className="text-xs text-on-surface-variant leading-relaxed mb-6 max-w-sm mx-auto">
          This password reset link is invalid, has expired, or has already been used. Please submit a new request to recover your account.
        </p>
        <Link
          to="/forgot-password"
          className="w-full h-10 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold flex items-center justify-center shadow-sm transition-colors"
        >
          Request New Reset Link
        </Link>
        <div className="mt-4">
          <Link
            to="/login"
            className="text-xs text-on-surface-variant hover:text-on-surface font-medium inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Login</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant/40 p-6 sm:p-8 flex flex-col">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="mb-3">
          <Logo size="lg" showSubtitle={false} />
        </div>
        <h1 className="mt-2 font-heading text-xl font-bold text-on-surface">
          Reset your password
        </h1>
        <p className="mt-1 text-xs text-on-surface-variant max-w-sm">
          Please enter your new strong password below to regain account access.
        </p>
      </div>

      {success ? (
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-12 h-12 rounded-full bg-secondary-container text-secondary flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold text-on-surface mb-2">Password Updated!</h2>
          <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
            Your password has been securely reset. Redirecting you to the sign in page...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="p-3 rounded-lg bg-error-container/60 border border-error/30 text-error flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs text-on-surface font-medium" htmlFor="newPassword">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
              <input
                id="newPassword"
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
            <label className="text-xs text-on-surface font-medium" htmlFor="confirmNewPassword">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
              <input
                id="confirmNewPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-10 pl-9 pr-10 rounded-lg bg-surface-container-lowest border border-outline-variant/60 text-on-surface text-sm placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              />
              <button
                type="button"
                aria-label="Toggle confirm password visibility"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1 rounded transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Password Requirements Checklist */}
          <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30 space-y-1.5 text-[11px]">
            <span className="text-[10px] uppercase font-bold text-outline tracking-wider block mb-1">
              Security Requirements:
            </span>
            <div className="flex items-center gap-1.5">
              {hasMinLength ? <Check className="w-3.5 h-3.5 text-secondary" /> : <X className="w-3.5 h-3.5 text-outline" />}
              <span className={hasMinLength ? 'text-secondary font-medium' : 'text-on-surface-variant'}>
                More than 8 characters long (minimum 9 characters)
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
            className="w-full h-10 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <span>Update Password</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
