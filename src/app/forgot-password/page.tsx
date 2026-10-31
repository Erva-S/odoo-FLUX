"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Zap, Mail, ArrowLeft, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoInput } from "@/components/ui/NeoInput";
import { useToast } from "@/components/ui/ToastContext";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const { success, error } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      error("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      // 1. Dispatch recovery request via Supabase Auth
      try {
        const supabase = createClient();
        const { error: supaErr } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (supaErr) {
          console.warn("Supabase recovery request note:", supaErr.message);
        }
      } catch (clientErr) {
        console.warn("Supabase client init:", clientErr);
      }

      // 2. Dispatch recovery email via Subscriptly backend SMTP (verified Gmail transporter)
      try {
        await fetch("http://localhost:5000/api/auth/forgot-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: cleanEmail }),
        });
      } catch (backendErr) {
        console.warn("Backend SMTP recovery note:", backendErr);
      }

      // 3. Generic confirmation without exposing whether the email exists
      setIsSubmitted(true);
      success("If an account exists with this email address, you will receive a password reset link shortly.");
    } catch (err: any) {
      error(err.message || "Failed to process request.");
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
            PASSWORD RECOVERY
          </span>
        </div>
      </Link>

      <div className="w-full max-w-md bg-neoWhite border-2 border-black rounded-[16px] shadow-neo-lg p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-black tracking-tight text-neoBlack">
            Reset Password
          </h1>
          <p className="text-sm text-neutral-600 mt-1 font-medium">
            Enter your registered email and we&apos;ll send a secure password reset link to your inbox.
          </p>
        </div>

        {isSubmitted ? (
          <div className="bg-neoSage/40 border-2 border-black rounded-[10px] p-5 text-center space-y-3">
            <CheckCircle2 className="w-9 h-9 text-black mx-auto" />
            <p className="font-heading font-black text-base text-neoBlack">Check Your Inbox</p>
            <p className="text-xs text-neutral-700 leading-relaxed font-medium">
              If an account exists with <strong>{email}</strong>, a password reset link has been dispatched. Please check your inbox and spam folder.
            </p>
            <Link href="/login" className="inline-block mt-3">
              <NeoButton size="compact" variant="secondary">
                Return to Login
              </NeoButton>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <NeoInput
              label="Registered Email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <NeoButton
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
              icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
            >
              {loading ? "Sending link..." : "Send Reset Link"}
            </NeoButton>
          </form>
        )}

        <div className="pt-2 text-center text-xs">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 font-bold text-neutral-600 hover:text-black hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
