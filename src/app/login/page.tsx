"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoInput } from "@/components/ui/NeoInput";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/ToastContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, switchDemoRole } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState("admin@brightloop.io");
  const [password, setPassword] = useState("Bright@2026!");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error("Please fill in both email and password.");
      return;
    }

    login(email);
    success("Welcome back to Brightloop Billing!");
    if (email.includes("customer")) {
      router.push("/portal");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-neoYellow bg-neo-dots flex flex-col justify-center items-center p-4 sm:p-6">
      {/* Brand Header */}
      <Link href="/" className="mb-8 flex items-center gap-3 group">
        <div className="w-12 h-12 bg-neoBlack border-2 border-black rounded-[8px] flex items-center justify-center shadow-neo group-hover:translate-x-1 group-hover:translate-y-1 transition-transform">
          <Zap className="w-7 h-7 text-neoYellow fill-neoYellow" />
        </div>
        <div>
          <span className="font-heading font-black text-2xl tracking-tighter text-neoBlack block">
            BRIGHTLOOP
          </span>
          <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-800 -mt-1 block font-bold">
            BILLING CONSOLE
          </span>
        </div>
      </Link>

      {/* Main Card */}
      <div className="w-full max-w-md bg-neoWhite border-2 border-black rounded-[16px] shadow-neo-lg p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-black tracking-tight text-neoBlack">
            Sign In
          </h1>
          <p className="text-sm text-neutral-600 mt-1 font-medium">
            Enter your credentials or choose a 1-click demo role below.
          </p>
        </div>

        {/* Demo Fast Logins */}
        <div className="bg-neoCanvas border-2 border-black rounded-[10px] p-3 space-y-2">
          <div className="text-xs uppercase font-extrabold text-neutral-500 tracking-wider">
            1-Click Demo Accounts
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                switchDemoRole("admin");
                success("Signed in as Admin (Sarah Jenkins)");
              }}
              className="px-2 py-2 text-xs font-bold border-2 border-black rounded-[8px] bg-neoSage hover:bg-neoSage/80 active:translate-x-0.5 active:translate-y-0.5"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => {
                switchDemoRole("staff");
                success("Signed in as Staff (Marcus Vance)");
              }}
              className="px-2 py-2 text-xs font-bold border-2 border-black rounded-[8px] bg-neoYellow hover:bg-yellow-300 active:translate-x-0.5 active:translate-y-0.5"
            >
              Staff
            </button>
            <button
              type="button"
              onClick={() => {
                switchDemoRole("customer");
                success("Signed in as Customer (Jane Doe - Acme Corp)");
              }}
              className="px-2 py-2 text-xs font-bold border-2 border-black rounded-[8px] bg-neoDark text-white hover:bg-neutral-800 active:translate-x-0.5 active:translate-y-0.5"
            >
              Customer
            </button>
          </div>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <NeoInput
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-neoBlack">Password</label>
              <Link
                href="/forgot-password"
                className="text-xs font-bold text-neutral-600 hover:text-black underline"
              >
                Forgot password?
              </Link>
            </div>
            <NeoInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />
          </div>

          <NeoButton type="submit" variant="primary" className="w-full mt-2" icon={<ArrowRight className="w-4 h-4" />}>
            Sign In to Account
          </NeoButton>
        </form>

        <div className="pt-4 border-t-2 border-neoDivider text-center text-sm font-medium">
          Don&apos;t have an account yet?{" "}
          <Link href="/signup" className="font-bold underline hover:text-neutral-800">
            Sign up for free
          </Link>
        </div>
      </div>
    </div>
  );
}

