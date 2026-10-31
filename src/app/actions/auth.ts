"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { UserRole } from "@/types/database.types";

export interface AuthActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  redirectTo?: string;
}

/**
 * Server Action: Email & Password Login
 */
export async function loginWithEmailAction(
  email: string,
  password: string,
  expectedRole?: UserRole
): Promise<AuthActionResult<{ user: { id: string; email: string; name: string; role: UserRole } }>> {
  try {
    const trimmedEmail = email.toLowerCase().trim();
    if (!trimmedEmail || !password) {
      return { success: false, error: "Please enter both email and password." };
    }

    const supabase = await createServerSupabaseClient();
    let authUser: { id: string; email: string; name: string; role: UserRole } | null = null;

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (authData?.user) {
      const userId = authData.user.id;
      const adminSupabase = createAdminClient();

      const { data: profile } = await adminSupabase
        .from("profiles")
        .select("*")
        .or(`id.eq.${userId},email.eq.${trimmedEmail}`)
        .maybeSingle();

      const role = (profile?.role as UserRole) || (authData.user.user_metadata?.role as UserRole) || expectedRole || "customer";
      const name = profile?.name || authData.user.user_metadata?.name || trimmedEmail.split("@")[0];

      authUser = {
        id: profile?.id || userId,
        email: trimmedEmail,
        name,
        role,
      };
    } else {
      // 2. Fallback: Authenticate via Subscriptly PostgreSQL backend
      try {
        const backendRes = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmedEmail, password }),
        });
        const backendData = await backendRes.json();
        if (backendRes.ok && backendData.success && backendData.user) {
          authUser = {
            id: backendData.user.id,
            email: backendData.user.email,
            name: backendData.user.name,
            role: (backendData.user.role?.toLowerCase() as UserRole) || expectedRole || "customer",
          };
        }
      } catch (backendErr) {
        console.warn("Backend auth fallback error:", backendErr);
      }
    }

    if (!authUser) {
      return { success: false, error: authError?.message || "Invalid email or password." };
    }

    const cookieStore = cookies();
    cookieStore.set("subscriptly_token", authUser.id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });
    cookieStore.set("subscriptly_role", authUser.role, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });
    cookieStore.set("subscriptly_user", JSON.stringify(authUser), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    const targetPath = authUser.role === "customer" ? "/portal" : "/dashboard";

    return {
      success: true,
      data: {
        user: authUser,
      },
      redirectTo: targetPath,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "An unexpected error occurred during login.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Public Customer Signup
 */
export async function signupWithEmailAction(params: {
  email: string;
  password: string;
  name: string;
  companyName: string;
}): Promise<AuthActionResult> {
  try {
    const trimmedEmail = params.email.toLowerCase().trim();
    const trimmedName = params.name.trim();
    const trimmedCompany = params.companyName.trim();
    const password = params.password;

    if (!trimmedEmail || !trimmedName || !password) {
      return { success: false, error: "Please fill out all required fields." };
    }

    // Server-side password strength validation
    const hasLength = password.length > 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasLength || !hasUpper || !hasLower || !hasSpecial) {
      return {
        success: false,
        error:
          "Password must be more than 8 characters and include uppercase, lowercase, and a special character.",
      };
    }

    const adminSupabase = createAdminClient();

    // Check if an account already exists in profiles
    const { data: existingProf } = await adminSupabase
      .from("profiles")
      .select("*")
      .eq("email", trimmedEmail)
      .maybeSingle();

    if (existingProf && (existingProf as any).auth_user_id) {
      return {
        success: false,
        error: "An account with this email is already registered. Please sign in.",
      };
    }

    // Register user in Supabase Auth
    const supabase = await createServerSupabaseClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          name: trimmedName,
          company_name: trimmedCompany,
          role: "customer",
        },
      },
    });

    if (authError || !authData.user) {
      return { success: false, error: authError?.message || "Failed to create account." };
    }

    const authUserId = authData.user.id;

    if (existingProf) {
      await adminSupabase
        .from("profiles")
        .update({
          auth_user_id: authUserId,
          name: trimmedName,
          company_name: trimmedCompany || existingProf.company_name,
          updated_at: new Date().toISOString(),
        } as any)
        .eq("id", existingProf.id);
    } else {
      const insertProf: any = {
        id: authUserId,
        auth_user_id: authUserId,
        email: trimmedEmail,
        name: trimmedName,
        company_name: trimmedCompany,
        role: "customer",
        is_active: true,
      };
      await adminSupabase.from("profiles").insert(insertProf);
    }

    return {
      success: true,
      redirectTo: "/portal",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Signup failed.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Provision Staff Account (Admin Only)
 */
export async function createStaffAccountAction(params: {
  email: string;
  name: string;
  tempPassword?: string;
}): Promise<AuthActionResult> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const adminSupabase = createAdminClient();
    const { data: currentProf } = await adminSupabase
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .single();

    if (currentProf?.role !== "admin") {
      return { success: false, error: "Only platform administrators can provision staff accounts." };
    }

    const trimmedEmail = params.email.toLowerCase().trim();
    const trimmedName = params.name.trim();
    const password = params.tempPassword || "BrightStaff@2026!";

    const { data: newAuthUser, error: authError } = await adminSupabase.auth.admin.createUser({
      email: trimmedEmail,
      password,
      email_confirm: true,
      user_metadata: { name: trimmedName, role: "staff" },
    });

    if (authError || !newAuthUser.user) {
      return { success: false, error: authError?.message || "Failed to create staff auth user." };
    }

    const staffId = newAuthUser.user.id;

    const staffPayload: any = {
      id: staffId,
      auth_user_id: staffId,
      email: trimmedEmail,
      name: trimmedName,
      role: "staff",
      company_name: "Brightloop Operations",
      is_active: true,
    };

    const { error: profError } = await adminSupabase.from("profiles").upsert(staffPayload);

    if (profError) {
      return { success: false, error: profError.message };
    }

    revalidatePath("/settings");
    return {
      success: true,
      data: { email: trimmedEmail, name: trimmedName },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Staff creation failed.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Logout
 */
export async function logoutAction() {
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
  const cookieStore = cookies();
  cookieStore.delete("subscriptly_token");
  cookieStore.delete("subscriptly_role");
  cookieStore.delete("subscriptly_user");
  revalidatePath("/", "layout");
  redirect("/login");
}

/**
 * Server Action: Forgot Password
 */
export async function forgotPasswordAction(email: string): Promise<AuthActionResult> {
  try {
    const trimmedEmail = email.toLowerCase().trim();
    if (!trimmedEmail) {
      return { success: false, error: "Please enter your email address." };
    }

    const supabase = await createServerSupabaseClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: `${siteUrl}/auth/callback?next=/settings`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to send reset link.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Reset Password Directly or with Token
 */
export async function resetPasswordDirectAction(
  email: string,
  newPassword: string,
  token?: string | null
): Promise<AuthActionResult> {
  try {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) {
      return { success: false, error: "Please provide your registered email address." };
    }

    if (newPassword.length <= 8) {
      return { success: false, error: "Password must be more than 8 characters." };
    }

    // 1. If token provided, try token reset on backend API
    if (token) {
      try {
        const res = await fetch("http://localhost:5000/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password: newPassword }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          return { success: true };
        }
      } catch (tokenErr) {
        console.warn("Backend token reset error:", tokenErr);
      }
    }

    // 2. Direct password update in PostgreSQL
    try {
      const res = await fetch("http://localhost:5000/api/auth/sync-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true };
      }
    } catch (apiErr) {
      console.warn("Backend sync error:", apiErr);
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to reset password.";
    return { success: false, error: msg };
  }
}
