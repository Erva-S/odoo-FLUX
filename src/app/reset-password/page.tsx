"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Lock, Check, X, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoInput } from "@/components/ui/NeoInput";
import { useToast } from "@/components/ui/ToastContext";
import { createClient } from "@/lib/supabase/client";
import clsx from "clsx";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [hasValidSession, setHasValidSession] = useState<boolean>(false);
  const [checkingSession, setCheckingSession] = useState<boolean>(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Live password validation checks
  const hasLength = password.length > 8; // More than 8 characters (min 9)
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isFormValid = hasLength && hasUppercase && hasLowercase && hasSpecial && passwordsMatch;

  useEffect(() => {
    let mounted = true;

    async function verifyRecoverySession() {
      try {
        const supabase = createClient();

        // 1. Check for URL PKCE code
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (!exchangeError && data?.session) {
            if (mounted) {
              setHasValidSession(true);
              setCheckingSession(false);
            }
            return;
          }
        }

        // 2. Check existing Supabase session or hash fragments
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          if (mounted) {
            setHasValidSession(true);
            setCheckingSession(false);
          }
          return;
        }

        // 3. Check hash for type=recovery or access_token
        const hash = window.location.hash;
        if (hash && (hash.includes("type=recovery") || hash.includes("access_token="))) {
          if (mounted) {
            setHasValidSession(true);
            setCheckingSession(false);
          }
          return;
        }

        if (mounted) {
          setHasValidSession(false);
          setCheckingSession(false);
        }
      } catch (err) {
        if (mounted) {
          setHasValidSession(false);
          setCheckingSession(false);
        }
      }
    }

    verifyRecoverySession();

    // Listen for auth state recovery event
    try {
      const supabase = createClient();
      const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
          if (mounted) {
            setHasValidSession(true);
            setCheckingSession(false);
          }
        }
      });

      return () => {
        mounted = false;
        listener?.subscription?.unsubscribe();
      };
    } catch {
      return () => {
        mounted = false;
      };
    }
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      error("Please meet all password requirements.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: supaErr } = await supabase.auth.updateUser({ password });
      if (supaErr) {
        throw new Error(supaErr.message);
      }

      setIsDone(true);
      success("Password updated successfully! Please sign in with your new password.");
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err: any) {
      error(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neoYellow bg-neo-dots flex flex-col justify-center items-center p-4 sm:p-6">
      <Link href="/" className="mb-8 flex items-center gap-3 group">
        <div className="w-12 h-12 bg-neoBlack border-2 border-black rounded-[8px] flex items-center justify-center shadow-neo">
          <Zap className="w-7 h-7 text-neoYellow fill-neoYellow" />
        </div>
        <div>
          <span className="font-heading font-black text-2xl tracking-tighter text-neoBlack block">
            BRIGHTLOOP
          </span>
          <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-800 -mt-1 block font-bold">
            RESET PASSWORD
          </span>
        </div>
      </Link>

      <div className="w-full max-w-md bg-neoWhite border-2 border-black rounded-[16px] shadow-neo-lg p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-black tracking-tight text-neoBlack">
            New Password
          </h1>
          <p className="text-sm text-neutral-600 mt-1 font-medium">
            Set your new strong password to regain access to your account.
          </p>
        </div>

        {checkingSession ? (
          <div className="py-8 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-black animate-spin mx-auto" />
            <p className="text-sm font-bold text-neoBlack">Verifying reset credentials...</p>
          </div>
        ) : !hasValidSession ? (
          <div className="bg-statusRed/10 border-2 border-black rounded-[10px] p-5 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-statusRed mx-auto" />
            <h2 className="text-base font-black text-neoBlack">Invalid or Expired Link</h2>
            <p className="text-xs text-neutral-700 leading-relaxed">
              This password reset link is invalid, has expired, or has already been used. Please submit a new request.
            </p>
            <Link href="/forgot-password" className="inline-block mt-2">
              <NeoButton size="compact" variant="primary">
                Request New Reset Link
              </NeoButton>
            </Link>
          </div>
        ) : isDone ? (
          <div className="bg-neoSage/40 border-2 border-black rounded-[10px] p-4 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-black mx-auto" />
            <p className="font-bold text-sm">Password Updated!</p>
            <p className="text-xs text-neutral-700">
              Your password has been changed. Redirecting to login...
            </p>
            <Link href="/login" className="inline-block mt-2">
              <NeoButton size="compact" variant="secondary">
                Go to Sign In
              </NeoButton>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <NeoInput
              label="New Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <NeoInput
              label="Confirm New Password"
              type="password"
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            {/* Live Password Rules Checklist */}
            <div className="bg-neoCanvas border-2 border-black rounded-[10px] p-3 space-y-2">
              <p className="text-xs font-bold text-neoBlack uppercase tracking-wider">
                Security Requirements
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium">
                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      "w-4 h-4 rounded-full border border-black flex items-center justify-center text-[10px]",
                      hasLength ? "bg-statusGreen text-black font-bold" : "bg-white text-neutral-400"
                    )}
                  >
                    {hasLength ? <Check className="w-3 h-3 stroke-[3]" /> : <X className="w-3 h-3" />}
                  </span>
                  <span className={hasLength ? "text-neoBlack font-bold" : "text-neutral-500"}>
                    More than 8 characters
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      "w-4 h-4 rounded-full border border-black flex items-center justify-center text-[10px]",
                      hasUppercase ? "bg-statusGreen text-black font-bold" : "bg-white text-neutral-400"
                    )}
                  >
                    {hasUppercase ? <Check className="w-3 h-3 stroke-[3]" /> : <X className="w-3 h-3" />}
                  </span>
                  <span className={hasUppercase ? "text-neoBlack font-bold" : "text-neutral-500"}>
                    Uppercase letter (A-Z)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      "w-4 h-4 rounded-full border border-black flex items-center justify-center text-[10px]",
                      hasLowercase ? "bg-statusGreen text-black font-bold" : "bg-white text-neutral-400"
                    )}
                  >
                    {hasLowercase ? <Check className="w-3 h-3 stroke-[3]" /> : <X className="w-3 h-3" />}
                  </span>
                  <span className={hasLowercase ? "text-neoBlack font-bold" : "text-neutral-500"}>
                    Lowercase letter (a-z)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      "w-4 h-4 rounded-full border border-black flex items-center justify-center text-[10px]",
                      hasSpecial ? "bg-statusGreen text-black font-bold" : "bg-white text-neutral-400"
                    )}
                  >
                    {hasSpecial ? <Check className="w-3 h-3 stroke-[3]" /> : <X className="w-3 h-3" />}
                  </span>
                  <span className={hasSpecial ? "text-neoBlack font-bold" : "text-neutral-500"}>
                    Special character (!@#$)
                  </span>
                </div>
              </div>

              {confirmPassword && (
                <div className="pt-2 border-t border-black/10 flex items-center gap-2 text-xs">
                  <span
                    className={clsx(
                      "w-4 h-4 rounded-full border border-black flex items-center justify-center text-[10px]",
                      passwordsMatch ? "bg-statusGreen text-black font-bold" : "bg-statusRed text-white"
                    )}
                  >
                    {passwordsMatch ? <Check className="w-3 h-3 stroke-[3]" /> : <X className="w-3 h-3" />}
                  </span>
                  <span className={passwordsMatch ? "text-neoBlack font-bold" : "text-statusRed font-bold"}>
                    {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                  </span>
                </div>
              )}
            </div>

            <NeoButton
              type="submit"
              variant="primary"
              className="w-full mt-2"
              disabled={!isFormValid || loading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {loading ? "Updating Password..." : "Update Password"}
            </NeoButton>
          </form>
        )}

        <div className="pt-4 border-t-2 border-neoDivider text-center">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-bold underline hover:text-neutral-800">
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

