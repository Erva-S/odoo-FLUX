"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Lock, Mail, User, Building, Check, X, ArrowRight } from "lucide-react";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoInput } from "@/components/ui/NeoInput";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/components/ui/ToastContext";
import { createClient } from "@/lib/supabase/client";
import clsx from "clsx";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Live password validation checks
  const hasLength = password.length > 8; // More than eight characters
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordValid = hasLength && hasUppercase && hasLowercase && hasSpecial;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      error("Please fulfill all password security rules.");
      return;
    }

    try {
      setLoading(true);
      const res = await signup({ email, password, name, companyName });
      if (!res.success) {
        error(res.error || "Failed to create account.");
        return;
      }

      success("Account created successfully! Welcome to Brightloop.");
      router.push("/portal");
    } catch (err: any) {
      error(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
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
            CLIENT SELF-SERVICE
          </span>
        </div>
      </Link>

      {/* Main Card */}
      <div className="w-full max-w-lg bg-neoWhite border-2 border-black rounded-[16px] shadow-neo-lg p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-black tracking-tight text-neoBlack">
            Create Customer Account
          </h1>
          <p className="text-sm text-neutral-600 mt-1 font-medium">
            Join hundreds of teams managing software subscriptions with automated invoicing.
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <NeoInput
            label="Full Name"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
            required
          />

          <NeoInput
            label="Work Email"
            type="email"
            placeholder="jane@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <NeoInput
            label="Organization / Company Name"
            placeholder="Acme Industrial Technologies"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            leftIcon={<Building className="w-4 h-4" />}
            required
          />

          <div className="space-y-2">
            <NeoInput
              label="Account Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            {/* Live Password Rules Checklist */}
            <div className="bg-neoCanvas border-2 border-black rounded-[10px] p-3 space-y-2">
              <p className="text-xs font-bold text-neoBlack uppercase tracking-wider">
                Live Password Security Checklist
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
            </div>
          </div>

          <NeoButton
            type="submit"
            variant="primary"
            className="w-full mt-2"
            disabled={!isPasswordValid}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Create My Portal Account
          </NeoButton>
        </form>

        <div className="pt-4 border-t-2 border-neoDivider text-center text-sm font-medium">
          Already have an account?{" "}
          <Link href="/login" className="font-bold underline hover:text-neutral-800">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

