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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error("Please fill in both email and password.");
      return;
    }

    login(email, selectedRole);
    success(`Welcome back! Signed in with ${selectedRole.toUpperCase()} credentials.`);
    if (selectedRole === "customer" || email.includes("customer")) {
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
              type={showPassword ? "text" : "password"}
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

