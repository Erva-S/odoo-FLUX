"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Zap, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoInput } from "@/components/ui/NeoInput";
import { useToast } from "@/components/ui/ToastContext";

export default function ForgotPasswordPage() {
  const { success } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitted(true);
    success(`Password reset link dispatched to ${email}`);
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
            Enter your registered email and we&apos;ll dispatch a secure recovery token.
          </p>
        </div>

        {isSubmitted ? (
          <div className="bg-neoSage/40 border-2 border-black rounded-[10px] p-4 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-black mx-auto" />
            <p className="font-bold text-sm">Reset Link Sent</p>
            <p className="text-xs text-neutral-700">
              Check your inbox at <strong>{email}</strong> for instructions to reset your password.
            </p>
            <Link href="/login" className="inline-block mt-2">
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

            <NeoButton type="submit" variant="primary" className="w-full">
              Send Password Reset Link
            </NeoButton>
          </form>
        )}

        <div className="pt-4 border-t-2 border-neoDivider text-center">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-bold underline hover:text-neutral-800">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

