"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Zap, Lock, Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoInput } from "@/components/ui/NeoInput";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/ToastContext";
import { UserRole } from "@/types/database.types";

function LoginContent() {
  const router = useRouter();
<<<<<<< HEAD
  const { login } = useAuth();
  const { success, error } = useToast();

  const [selectedRole, setSelectedRole] = useState<"admin" | "staff" | "customer">("admin");
  const [email, setEmail] = useState("admin@brightloop.io");
  const [password, setPassword] = useState("Admin@Brightloop123!");
  const [showPassword, setShowPassword] = useState(false);

  const handleSelectRole = (role: "admin" | "staff" | "customer") => {
    setSelectedRole(role);
    if (role === "admin") {
      setEmail("admin@brightloop.io");
      setPassword("Admin@Brightloop123!");
    } else if (role === "staff") {
      setEmail("staff@brightloop.io");
      setPassword("Staff@Brightloop123!");
    } else {
      setEmail("customer@brightloop.io");
      setPassword("Customer@Brightloop123!");
    }
  };
=======
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next");
  const authErrorParam = searchParams.get("error");

  const { login } = useAuth();
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<UserRole>("admin");
  const [email, setEmail] = useState("admin@brightloop.io");
  const [password, setPassword] = useState("Bright@2026!");
  const [loading, setLoading] = useState(false);
>>>>>>> main

  const handleTabChange = (role: UserRole) => {
    setActiveTab(role);
    if (role === "admin") {
      setEmail("admin@brightloop.io");
      setPassword("Bright@2026!");
    } else if (role === "staff") {
      setEmail("staff@brightloop.io");
      setPassword("Bright@2026!");
    } else {
      setEmail("customer@acme.corp");
      setPassword("Bright@2026!");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toastError("Please fill in both email and password.");
      return;
    }

<<<<<<< HEAD
    login(email, selectedRole);
    success(`Welcome back! Signed in with ${selectedRole.toUpperCase()} credentials.`);
    if (selectedRole === "customer" || email.includes("customer")) {
      router.push("/portal");
    } else {
      router.push("/dashboard");
=======
    try {
      setLoading(true);
      const res = await login(email, password, activeTab);
      if (!res.success) {
        toastError(res.error || "Authentication failed. Check your credentials.");
        return;
      }

      success(`Welcome back to Brightloop Billing!`);
      if (res.redirectTo) {
        router.push(res.redirectTo);
      } else if (nextUrl) {
        router.push(nextUrl);
      } else if (activeTab === "customer") {
        router.push("/portal");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login error";
      toastError(msg);
    } finally {
      setLoading(false);
>>>>>>> main
    }
  };

  return (
    <div className="min-h-screen bg-neoYellow bg-neo-dots flex flex-col justify-center items-center p-4 sm:p-6">
      {/* Brand Header */}
      <Link href="/" className="mb-6 flex items-center gap-3 group">
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
      <div className="w-full max-w-md bg-neoWhite border-2 border-black rounded-[16px] shadow-neo-lg p-6 sm:p-8 space-y-5">
        <div>
          <h1 className="text-3xl font-heading font-black tracking-tight text-neoBlack">
            Sign In
          </h1>
<<<<<<< HEAD
          <p className="text-sm text-neutral-600 mt-1 font-medium">
            Select your role and enter credentials to sign in.
          </p>
        </div>

        {/* Role Selector */}
        <div className="bg-neoCanvas border-2 border-black rounded-[10px] p-3 space-y-2">
          <div className="text-xs uppercase font-extrabold text-neutral-600 tracking-wider flex items-center justify-between">
            <span>Select Role</span>
            <span className="text-[10px] font-mono font-bold text-black uppercase">
              Current: {selectedRole}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleSelectRole("admin")}
              className={`px-2 py-2 text-xs font-bold border-2 border-black rounded-[8px] transition-all ${
                selectedRole === "admin"
                  ? "bg-neoYellow text-black shadow-neo-sm font-black translate-x-0.5 translate-y-0.5"
                  : "bg-white text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleSelectRole("staff")}
              className={`px-2 py-2 text-xs font-bold border-2 border-black rounded-[8px] transition-all ${
                selectedRole === "staff"
                  ? "bg-neoYellow text-black shadow-neo-sm font-black translate-x-0.5 translate-y-0.5"
                  : "bg-white text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              Staff
            </button>
            <button
              type="button"
              onClick={() => handleSelectRole("customer")}
              className={`px-2 py-2 text-xs font-bold border-2 border-black rounded-[8px] transition-all ${
                selectedRole === "customer"
                  ? "bg-neoYellow text-black shadow-neo-sm font-black translate-x-0.5 translate-y-0.5"
                  : "bg-white text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              Customer
            </button>
=======
          <p className="text-xs text-neutral-600 mt-1 font-bold">
            Secure multi-role authentication powered by Supabase & PostgreSQL.
          </p>
        </div>

        {authErrorParam && (
          <div className="p-3 bg-red-100 border-2 border-black rounded-[8px] text-xs font-bold text-statusRed flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{decodeURIComponent(authErrorParam)}</span>
>>>>>>> main
          </div>
        )}

        {/* 3 Dedicated Role Login Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-neoCanvas p-1 border-2 border-black rounded-[10px]">
          <button
            type="button"
            onClick={() => handleTabChange("admin")}
            className={`py-1.5 text-xs font-bold rounded-[6px] border border-black transition-all ${
              activeTab === "admin"
                ? "bg-neoSage text-black font-black shadow-neo-sm"
                : "bg-white/60 text-neutral-600 hover:bg-white"
            }`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("staff")}
            className={`py-1.5 text-xs font-bold rounded-[6px] border border-black transition-all ${
              activeTab === "staff"
                ? "bg-neoYellow text-black font-black shadow-neo-sm"
                : "bg-white/60 text-neutral-600 hover:bg-white"
            }`}
          >
            Staff
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("customer")}
            className={`py-1.5 text-xs font-bold rounded-[6px] border border-black transition-all ${
              activeTab === "customer"
                ? "bg-neoDark text-white font-black shadow-neo-sm"
                : "bg-white/60 text-neutral-600 hover:bg-white"
            }`}
          >
            Customer
          </button>
        </div>

        {/* Role Hint Banner */}
        <div className="text-[11px] font-mono font-medium text-neutral-600 bg-neoCanvas/70 p-2 rounded-[6px] border border-black/20 flex items-center justify-between">
          <span>Target Experience: <strong>{activeTab.toUpperCase()}</strong></span>
          <span className="text-statusGreen font-bold">● Supabase Auth (Email & Password)</span>
        </div>

        {/* Standard Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-3.5">
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
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />
          </div>

          <NeoButton
            type="submit"
            variant="primary"
            className="w-full mt-2"
            disabled={loading}
            icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          >
            {loading ? "Signing in..." : `Sign In as ${activeTab.toUpperCase()}`}
          </NeoButton>
        </form>

        <div className="pt-3 border-t-2 border-neoDivider text-center text-xs font-medium">
          Need a customer self-service account?{" "}
          <Link href="/signup" className="font-bold underline hover:text-neutral-800">
            Sign up for free
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neoYellow flex items-center justify-center p-4">Loading login console...</div>}>
      <LoginContent />
    </Suspense>
  );
}
