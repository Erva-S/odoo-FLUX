"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { UserRole } from "@/types/database.types";
import { Profile } from "@/lib/data/types";
import {
  loginWithEmailAction,
  signupWithEmailAction,
  logoutAction,
  createStaffAccountAction,
} from "@/app/actions/auth";

interface AuthContextType {
  currentUser: Profile | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, password?: string, roleHint?: UserRole) => Promise<{ success: boolean; error?: string; redirectTo?: string }>;
  signup: (params: { email: string; password: string; name: string; companyName: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<void>;
  createStaffAccount: (params: { email: string; name: string }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  // Load profile from Supabase Auth & PostgreSQL
  const refreshUser = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setCurrentUser(null);
        return;
      }

      // Fetch profile from PostgreSQL
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .or(`id.eq.${user.id},auth_user_id.eq.${user.id}`)
        .maybeSingle();

      if (profile) {
        setCurrentUser({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          companyName: profile.company_name || undefined,
          phone: profile.phone || undefined,
          billingAddress: profile.billing_address || undefined,
          createdAt: profile.created_at,
        });
      } else {
        // Fallback to auth metadata
        setCurrentUser({
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
          role: (user.user_metadata?.role as UserRole) || "customer",
          createdAt: user.created_at,
        });
      }
    } catch (e) {
      console.error("AuthContext refreshUser error:", e);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    refreshUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
      if (session?.user) {
        await refreshUser();
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

<<<<<<< HEAD
    if (!user) {
      // Default to customer if not found
      user = {
        id: `user-${Date.now()}`,
        email: normalized,
        name: normalized.split("@")[0],
        role: role || "customer",
        createdAt: new Date().toISOString(),
      };
    }

    saveUser(user);
    return true;
  };

  const signup = (params: { email: string; name: string; companyName?: string }) => {
    const normalized = params.email.toLowerCase().trim();
    const existing =
      dataStore.customers.some((c) => c.email.toLowerCase() === normalized) ||
      DEMO_PROFILES.some((p) => p.email.toLowerCase() === normalized);
    if (existing) {
      return { success: false, error: "An account with this email already exists." };
    }

    const newUser: Profile = {
      id: `cust-${Date.now()}`,
      email: normalized,
      name: params.name,
      role: "customer",
      companyName: params.companyName || `${params.name}'s Organization`,
      createdAt: new Date().toISOString(),
=======
    return () => {
      subscription.unsubscribe();
>>>>>>> main
    };
  }, [refreshUser, supabase]);

  const login = async (email: string, password = "Bright@2026!", roleHint?: UserRole) => {
    const res = await loginWithEmailAction(email, password, roleHint);
    if (res.success && res.data?.user) {
      await refreshUser();
      if (res.redirectTo) {
        router.push(res.redirectTo);
      }
      return { success: true, redirectTo: res.redirectTo };
    }
    return { success: false, error: res.error };
  };

  const signup = async (params: { email: string; password: string; name: string; companyName: string }) => {
    const res = await signupWithEmailAction(params);
    if (res.success) {
      await refreshUser();
      router.push("/portal");
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  const logout = async () => {
    await logoutAction();
    setCurrentUser(null);
  };

  const switchDemoRole = async (role: UserRole) => {
    let email = "admin@brightloop.io";
    if (role === "staff") email = "staff@brightloop.io";
    if (role === "customer") email = "customer@acme.corp";

    await login(email, "Bright@2026!", role);
  };

  const createStaffAccount = async (params: { email: string; name: string }) => {
    return await createStaffAccountAction(params);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        loading,
        login,
        signup,
        logout,
        switchDemoRole,
        createStaffAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
