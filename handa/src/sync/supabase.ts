/**
 * Supabase client — null when the app is not configured for the cloud.
 *
 * Guest mode is a first-class state: without VITE_SUPABASE_URL and
 * VITE_SUPABASE_ANON_KEY nothing in `src/sync` ever touches the network and
 * every exported function no-ops. Never throw because the cloud is absent.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

function build(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  try {
    return createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // Handles the `?code=` on /auth/callback (PKCE) for magic link + Google.
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    });
  } catch (err) {
    // A malformed URL in env must not take the app down; fall back to guest.
    console.warn('[handa/sync] Supabase disabled: invalid configuration', err);
    return null;
  }
}

/** `null` in guest mode. Always check `cloudEnabled` (or `supabase !== null`). */
export const supabase: SupabaseClient | null = build();

/** True when the cloud is configured. UI uses this to show/hide account features. */
export const cloudEnabled: boolean = supabase !== null;

/** Google sign-in button is shown only when the provider is enabled in Supabase too. */
export const GOOGLE_ENABLED: boolean = cloudEnabled && import.meta.env.VITE_GOOGLE_AUTH === '1';

/** Where auth redirects land. Must be listed in Supabase Auth > URL Configuration. */
export function authRedirectUrl(): string {
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : (import.meta.env.VITE_SITE_URL ?? '').replace(/\/$/, '');
  return `${origin}/auth/callback`;
}
