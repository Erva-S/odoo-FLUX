"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Profile } from "@/lib/data/types";
import { DEMO_PROFILES, dataStore } from "@/lib/data/store";

interface AuthContextType {
  currentUser: Profile | null;
  role: "admin" | "staff" | "customer" | null;
  login: (email: string, role?: "admin" | "staff" | "customer") => boolean;
  signup: (params: { email: string; name: string; companyName?: string }) => { success: boolean; error?: string };
  logout: () => void;
  switchDemoRole: (role: "admin" | "staff" | "customer") => void;
  createStaffAccount: (params: { email: string; name: string }) => { success: boolean; error?: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(DEMO_PROFILES[0]); // Default to admin for seamless evaluation
  const router = useRouter();

  // Load user from localStorage if present
  useEffect(() => {
    const saved = localStorage.getItem("brightloop_active_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCurrentUser(parsed);
      } catch (e) {
        // use default
      }
    }
  }, []);

  const saveUser = (user: Profile | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem("brightloop_active_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("brightloop_active_user");
    }
  };

  const login = (email: string, role?: "admin" | "staff" | "customer") => {
    const normalized = email.toLowerCase().trim();
    // Check demo profiles or customers
    let user = DEMO_PROFILES.find((p) => p.email.toLowerCase() === normalized);
    if (!user) {
      user = dataStore.customers.find((c) => c.email.toLowerCase() === normalized);
    }

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
    };

    dataStore.customers.unshift(newUser);
    saveUser(newUser);
    return { success: true };
  };

  const createStaffAccount = (params: { email: string; name: string }) => {
    if (currentUser?.role !== "admin") {
      return { success: false, error: "Only admins are authorized to create staff accounts." };
    }

    const newStaff: Profile = {
      id: `staff-${Date.now()}`,
      email: params.email.toLowerCase().trim(),
      name: params.name,
      role: "staff",
      companyName: "Brightloop Operations",
      createdAt: new Date().toISOString(),
    };

    DEMO_PROFILES.push(newStaff);
    return { success: true };
  };

  const switchDemoRole = (role: "admin" | "staff" | "customer") => {
    const target = DEMO_PROFILES.find((p) => p.role === role) || {
      id: `user-${role}`,
      email: `${role}@brightloop.io`,
      name: `Demo ${role.toUpperCase()}`,
      role,
      createdAt: new Date().toISOString(),
    };
    saveUser(target);

    if (role === "customer") {
      router.push("/portal");
    } else {
      router.push("/dashboard");
    }
  };

  const logout = () => {
    saveUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
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

