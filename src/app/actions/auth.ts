"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (authError || !authData.user) {
      return { success: false, error: authError?.message || "Invalid email or password." };
    }

    const userId = authData.user.id;
    const adminSupabase = createAdminClient();

    // Look up profile by id or email
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("*")
      .or(`id.eq.${userId},email.eq.${trimmedEmail}`)
      .maybeSingle();

    if (!profile) {
      // Create fallback profile
      const newProfPayload: any = {
        id: userId,
        email: trimmedEmail,
        name: authData.user.user_metadata?.name || trimmedEmail.split("@")[0],
        role: "customer",
      };

      const { data: newProf, error: createProfError } = await adminSupabase
        .from("profiles")
        .insert(newProfPayload)
        .select()
        .single();

      if (createProfError || !newProf) {
        return { success: false, error: "Authenticated, but failed to load user profile." };
      }

      return {
        success: true,
        data: {
          user: {
            id: newProf.id,
            email: newProf.email,
            name: newProf.name,
            role: newProf.role,
          },
        },
        redirectTo: "/portal",
      };
    }

    // Check account status if deactivated
    if ((profile as any).is_active === false) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: "Your account has been deactivated. Please contact support at admin@brightloop.io.",
      };
    }

    const actualRole = profile.role;
    const targetPath = actualRole === "customer" ? "/portal" : "/dashboard";

    return {
      success: true,
      data: {
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
        },
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
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
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
