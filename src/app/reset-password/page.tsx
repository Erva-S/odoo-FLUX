"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Zap, Lock, Mail, Check, X, ArrowRight, ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoInput } from "@/components/ui/NeoInput";
import { useToast } from "@/components/ui/ToastContext";
import { createClient } from "@/lib/supabase/client";
import { resetPasswordDirectAction } from "@/app/actions/auth";
import clsx from "clsx";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error } = useToast();

  const [email, setEmail] = useState("");
  const [localResetToken, setLocalResetToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    // 1. Extract query params if provided
    const queryEmail = searchParams.get("email");
    const queryToken = searchParams.get("token");
    const queryCode = searchParams.get("code");

    if (queryEmail) setEmail(queryEmail);
    if (queryToken) setLocalResetToken(queryToken);

    // 2. Exchange PKCE code if present from Supabase email link
    if (queryCode) {
      const supabase = createClient();
      supabase.auth.exchangeCodeForSession(queryCode).then(({ data }) => {
        if (data?.session?.user?.email) {
          setEmail(data.session.user.email);
        }
      });
    }

    // 3. Check existing Supabase session email
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email && !queryEmail) {
        setEmail(data.user.email);
      }
    });
  }, [searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      error("Please fulfill all password security rules.");
      return;
    }

    if (!email) {
      error("Please enter your registered email address.");
      return;
    }

    setLoading(true);

    try {
      // 1. Attempt Supabase Auth updateUser if recovery session active
      try {
        const supabase = createClient();
        await supabase.auth.updateUser({ password });
      } catch (supaErr) {
        console.warn("Supabase updateUser note:", supaErr);
      }

      // 2. Perform direct database reset
      const res = await resetPasswordDirectAction(email, password, localResetToken);
      if (!res.success) {
        error(res.error || "Failed to update password.");
        return;
      }

      setIsDone(true);
      success("Your password has been successfully reset! You can now log in.");
    } catch (err: any) {
      error(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neoYellow bg-neo-dots flex flex-col justify-center items-center p-4 sm:p-6">
      <Link href="/" className="mb-6 flex items-center gap-3 group">
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

      <div className="w-full max-w-md bg-neoWhite border-2 border-black rounded-[16px] shadow-neo-lg p-6 sm:p-8 space-y-5">
        <div>
          <h1 className="text-3xl font-heading font-black tracking-tight text-neoBlack">
            Set New Password
          </h1>
          <p className="text-xs text-neutral-600 mt-1 font-bold">
            Create a secure new password for your Subscriptly account.
          </p>
        </div>

        {isDone ? (
          <div className="bg-neoSage/40 border-2 border-black rounded-[10px] p-5 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-black mx-auto" />
            <p className="font-heading font-black text-base text-neoBlack">Password Updated!</p>
            <p className="text-xs text-neutral-700 font-medium">
              Your password has been updated. You can now sign in with your new credentials.
            </p>
            <Link href="/login" className="inline-block mt-3 w-full">
              <NeoButton variant="primary" className="w-full">
                Proceed to Sign In
              </NeoButton>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <NeoInput
              label="Registered Account Email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <div className="space-y-1">
              <label className="text-sm font-bold text-neoBlack">New Password</label>
              <div className="relative">
                <NeoInput
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 9 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <NeoInput
              label="Confirm New Password"
              type={showPassword ? "text" : "password"}
              placeholder="Confirm your password"
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
                    More than 8 chars
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
                    Uppercase (A-Z)
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
                    Lowercase (a-z)
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
                    Special char (!@#$)
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
              icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            >
              {loading ? "Updating Password..." : "Update Password"}
            </NeoButton>
          </form>
        )}

        <div className="pt-3 border-t-2 border-neoDivider text-center">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-bold underline hover:text-neutral-800">
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neoYellow flex items-center justify-center p-4">Loading reset console...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
