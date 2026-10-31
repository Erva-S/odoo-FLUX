import { createClient, SupabaseClient, Session, AuthChangeEvent } from '@supabase/supabase-js';

// Environment variables configured via Vite
const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

/**
 * Normalizes Supabase Project URL (e.g. converts dashboard URL to API endpoint)
 */
function normalizeSupabaseUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  const match = trimmed.match(/supabase\.com\/dashboard\/project\/([a-z0-9_-]+)/i);
  if (match && match[1]) {
    return `https://${match[1]}.supabase.co`;
  }
  return trimmed;
}

const supabaseUrl = normalizeSupabaseUrl(rawUrl);

/**
 * Indicates whether live Supabase credentials have been configured
 * in the frontend environment (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).
 */
export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes('your-project-url') &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseAnonKey.includes('your-anon-key') &&
    !supabaseAnonKey.includes('placeholder')
  );
};

// Default fallback URL for safe client initialization in development
const effectiveUrl = isSupabaseConfigured() ? supabaseUrl : 'https://placeholder.supabase.co';
const effectiveKey = isSupabaseConfigured() ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

/**
 * Shared Supabase Client instance for authentication and session management.
 * Note: NEVER expose the service-role key in frontend client code.
 */
export const supabase: SupabaseClient = createClient(effectiveUrl, effectiveKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

/**
 * Initiates Supabase password recovery email.
 * Redirects the user back to the application's /reset-password route.
 */
export async function sendSupabasePasswordReset(email: string, redirectUrl?: string) {
  const targetRedirect = redirectUrl || `${window.location.origin}/reset-password`;

  if (!isSupabaseConfigured()) {
    console.warn(
      '⚠️ [Supabase Auth] VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not configured. Falling back to local backend recovery.'
    );
    return { data: null, error: null, isMock: true };
  }

  const result = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: targetRedirect,
  });

  return { ...result, isMock: false };
}

/**
 * Updates the user's password in Supabase Auth using the active recovery session.
 */
export async function updateSupabasePassword(password: string) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: null, isMock: true };
  }

  const result = await supabase.auth.updateUser({
    password,
  });

  return { ...result, isMock: false };
}

/**
 * Retrieves the current active Supabase Auth session.
 */
export async function getSupabaseSession(): Promise<Session | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Subscribes to Supabase Auth state changes (e.g. PASSWORD_RECOVERY event).
 */
export function onSupabaseAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  if (!isSupabaseConfigured()) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
  return supabase.auth.onAuthStateChange(callback);
}

