import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../../../services/auth.service.js';
import { sendSupabasePasswordReset, isSupabaseConfigured } from '../../../lib/supabase.js';
import { extractErrorMessage } from '../../../services/api.js';
import { Logo } from '../../../components/common/Logo.js';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    // 1. Basic format validation
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // 2. Call Supabase Auth password recovery with redirect to /reset-password
      const supabaseResult = await sendSupabasePasswordReset(
        cleanEmail,
        `${window.location.origin}/reset-password`
      );

      // 3. Coordinate with backend password reset service for audit logging / local token fallback
      try {
        await requestPasswordReset(cleanEmail);
      } catch (backendErr) {
        // Log backend coordination error without blocking the generic confirmation
        console.warn('Backend password reset coordination note:', backendErr);
      }

      if (supabaseResult.error) {
        // If Supabase returned a client-side error (like rate limit), log it
        console.warn('Supabase Auth recovery note:', supabaseResult.error.message);
      }

      // 4. Always display the standard generic response to prevent user enumeration
      setSubmitted(true);
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
        <h1 className="mt-2 font-heading text-xl font-bold text-on-surface">
          Forgot your password?
        </h1>
        <p className="mt-1 text-xs text-on-surface-variant max-w-sm">
          Enter your registered email address and we will send you a secure password recovery link.
        </p>
      </div>

      {submitted ? (
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-12 h-12 rounded-full bg-secondary-container/50 text-secondary flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold text-on-surface mb-2">Check your inbox</h2>
          <p className="text-xs text-on-surface-variant leading-relaxed max-w-sm mb-6">
            If an account exists with this email address, you will receive a password reset link shortly.
          </p>

          <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30 text-[11px] text-outline text-left mb-6 w-full space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-on-surface">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>Authentication Engine:</span>
            </div>
            <p>
              {isSupabaseConfigured()
                ? 'Supabase Auth recovery email dispatched to registered inbox.'
                : 'Development preview: Password reset link generated and logged to the server terminal output.'}
            </p>
          </div>

          <Link
            to="/login"
            className="w-full h-10 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Sign In</span>
          </Link>
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
            <label className="text-xs text-on-surface font-medium" htmlFor="resetEmail">
              Registered Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
              <input
                id="resetEmail"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                disabled={loading}
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-lowest border border-outline-variant/60 text-on-surface text-sm placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm disabled:opacity-60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full h-10 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending reset link...</span>
              </>
            ) : (
              <>
                <span>Send Reset Link</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="text-xs text-primary hover:underline font-semibold inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to login</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
