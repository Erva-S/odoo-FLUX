import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { completePasswordReset } from '../../services/auth.service.js';
import { extractErrorMessage } from '../../services/api.js';
import { Logo } from '../../components/common/Logo.js';
import { Lock, Eye, EyeOff, Check, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const hasMinLength = password.length > 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const isFormValid = hasMinLength && hasUppercase && hasLowercase && hasSpecial && passwordsMatch && !!token;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setError(null);
    setLoading(true);

    try {
      await completePasswordReset({ token, password, confirmPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant/40 p-6 sm:p-8 flex flex-col text-center">
        <div className="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="font-heading text-lg font-bold text-on-surface mb-2">
          Invalid Password Reset Link
        </h1>
        <p className="text-xs text-on-surface-variant mb-6">
          This password reset link is missing a valid security token or has expired.
        </p>
        <Link
          to="/forgot-password"
          className="w-full h-10 rounded-lg bg-primary text-on-primary text-sm font-semibold flex items-center justify-center shadow-sm"
        >
          Request New Reset Link
        </Link>
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
          Set New Password
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
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-10 pl-9 pr-10 rounded-lg bg-surface-container-lowest border border-outline-variant/60 text-on-surface text-sm placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30 space-y-1.5 text-[11px]">
            <div className="flex items-center gap-1.5">
              {hasMinLength ? <Check className="w-3.5 h-3.5 text-secondary" /> : <X className="w-3.5 h-3.5 text-outline" />}
              <span className={hasMinLength ? 'text-secondary font-medium' : 'text-on-surface-variant'}>
                More than 8 characters long
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
                At least one special character
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
                <span>Resetting password...</span>
              </>
            ) : (
              <span>Confirm & Reset Password</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
