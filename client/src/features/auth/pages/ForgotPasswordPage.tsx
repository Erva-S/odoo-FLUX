import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../../../services/auth.service.js';
import { extractErrorMessage } from '../../../services/api.js';
import { Logo } from '../../../components/common/Logo.js';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await requestPasswordReset(email);
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
          Reset your password
        </h1>
        <p className="mt-1 text-xs text-on-surface-variant max-w-sm">
          Enter the email associated with your account and we will send you a password reset link.
        </p>
      </div>

      {submitted ? (
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-12 h-12 rounded-full bg-secondary-container/50 text-secondary flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold text-on-surface mb-2">Check your email</h2>
          <p className="text-xs text-on-surface-variant leading-relaxed max-w-xs mb-6">
            If an account exists for <strong className="text-on-surface">{email}</strong>, we have dispatched password reset instructions.
          </p>
          <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30 text-[11px] text-outline text-left mb-6 w-full">
            💡 <strong>Development mode note:</strong> If SMTP is not connected, the password reset link with token is safely logged in the server console output.
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
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-lowest border border-outline-variant/60 text-on-surface text-sm placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
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
                <span>Generating reset link...</span>
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
              <span>Back to login</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
