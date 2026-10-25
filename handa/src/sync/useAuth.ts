/**
 * Auth store. Wraps Supabase Auth; resolves to 'guest' instantly when the
 * cloud is not configured so the rest of the app never waits on it.
 *
 *   init()                    call once from main.tsx (idempotent)
 *   signInWithEmail(email)    magic link -> /auth/callback
 *   signInWithGoogle()        OAuth redirect -> /auth/callback
 *   signOut()                 keeps local data, stops sync
 *   updateProfile(patch)      region/city/howFound/consent on `profiles`
 *
 * First sign-in on a device: migrateGuestData(userId) tags the guest rows and
 * queues them, then startSync() uploads and pulls.
 */
import { create } from 'zustand';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import type { Tier } from '@/domain/types';
import { PAYMENTS_ENABLED } from '@/domain/tiers';
import { getSetting, setSetting } from '@/store/db';
import { supabase, cloudEnabled, GOOGLE_ENABLED, authRedirectUrl } from './supabase';
import { migrateGuestData } from './migrateGuest';
import { startSync, stopSync, resetPullCursor } from './outbox';

export type AuthStatus = 'loading' | 'guest' | 'signedIn';

export interface AuthUser { id: string; email?: string }

export interface Profile {
  region?: string;
  city?: string;
  howFound?: string;
  consent: boolean;
  consentAt?: string;
}
export type ProfilePatch = Partial<Pick<Profile, 'region' | 'city' | 'howFound' | 'consent'>>;

export interface AuthResult { ok: boolean; error?: string }

export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  tier: Tier;
  profile: Profile;
  /** Set when a sign-in/profile call failed; cleared on the next attempt. */
  lastError?: string;

  init: () => void;
  signInWithEmail: (email: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
  updateProfile: (patch: ProfilePatch) => Promise<AuthResult>;
  /** Re-read the profile row from the cloud. */
  refreshProfile: () => Promise<void>;
}

const EMPTY_PROFILE: Profile = { consent: false };
const MIGRATED_KEY = 'sync.migratedFor';

let initialised = false;
let handledUserId: string | undefined;

function tierFor(user: AuthUser | null, remoteTier: unknown): Tier {
  if (!user) return 'guest';
  if (PAYMENTS_ENABLED && remoteTier === 'plus') return 'plus';
  return 'free';
}

interface ProfileRow {
  region: string | null;
  city: string | null;
  how_found: string | null;
  consent: boolean | null;
  consent_at: string | null;
  tier: string | null;
}

async function fetchProfile(userId: string): Promise<{ profile: Profile; tier: unknown }> {
  if (!supabase) return { profile: EMPTY_PROFILE, tier: 'free' };
  const { data, error } = await supabase
    .from('profiles')
    .select('region, city, how_found, consent, consent_at, tier')
    .eq('id', userId)
    .maybeSingle<ProfileRow>();
  if (error || !data) return { profile: EMPTY_PROFILE, tier: 'free' };
  return {
    profile: {
      region: data.region ?? undefined,
      city: data.city ?? undefined,
      howFound: data.how_found ?? undefined,
      consent: data.consent ?? false,
      consentAt: data.consent_at ?? undefined,
    },
    tier: data.tier,
  };
}

export const useAuth = create<AuthState>()((set, get) => ({
  status: cloudEnabled ? 'loading' : 'guest',
  user: null,
  tier: 'guest',
  profile: EMPTY_PROFILE,

  init() {
    if (initialised) return;
    initialised = true;

    if (!supabase) {
      set({ status: 'guest', user: null, tier: 'guest', profile: EMPTY_PROFILE });
      return;
    }

    const onChange = (event: AuthChangeEvent, session: Session | null) => {
      // Never await Supabase calls inside this callback (auth-js can deadlock);
      // defer the real work to the next tick.
      setTimeout(() => { void handleSession(event, session); }, 0);
    };
    supabase.auth.onAuthStateChange(onChange);

    const handleSession = async (event: AuthChangeEvent, session: Session | null) => {
      const user = session?.user;
      if (!user) {
        if (event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
          handledUserId = undefined;
          stopSync();
          set({ status: 'guest', user: null, tier: 'guest', profile: EMPTY_PROFILE });
        }
        return;
      }

      const authUser: AuthUser = { id: user.id, email: user.email ?? undefined };
      set({ status: 'signedIn', user: authUser, tier: tierFor(authUser, 'free') });

      // Profile is fetched in the background; UI already has the user.
      void fetchProfile(user.id).then(({ profile, tier }) => {
        if (get().user?.id === user.id) set({ profile, tier: tierFor(authUser, tier) });
      });

      // Token refreshes etc. re-fire this handler; only migrate + start once.
      if (handledUserId === user.id) return;
      handledUserId = user.id;

      try {
        const migratedFor = await getSetting<string | undefined>(MIGRATED_KEY, undefined);
        if (migratedFor !== user.id) {
          await migrateGuestData(user.id);
          await resetPullCursor();            // a new account on this device: pull all
          await setSetting(MIGRATED_KEY, user.id);
        }
      } catch (err) {
        console.warn('[handa/auth] guest migration failed', err);
      }
      startSync(user.id);
    };
  },

  async signInWithEmail(email) {
    if (!supabase) return { ok: false, error: 'cloud-disabled' };
    set({ lastError: undefined });
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: authRedirectUrl(), shouldCreateUser: true },
    });
    if (error) { set({ lastError: error.message }); return { ok: false, error: error.message }; }
    return { ok: true };
  },

  async signInWithGoogle() {
    if (!supabase) return { ok: false, error: 'cloud-disabled' };
    if (!GOOGLE_ENABLED) return { ok: false, error: 'google-disabled' };
    set({ lastError: undefined });
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: authRedirectUrl() },
    });
    if (error) { set({ lastError: error.message }); return { ok: false, error: error.message }; }
    return { ok: true }; // browser is redirecting
  },

  async signOut() {
    stopSync();
    handledUserId = undefined;
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) console.warn('[handa/auth] signOut', error.message);
    }
    // Local data stays on the device (guest mode continues to work).
    set({ status: 'guest', user: null, tier: 'guest', profile: EMPTY_PROFILE });
  },

  async updateProfile(patch) {
    const { user, profile } = get();
    if (!supabase || !user) return { ok: false, error: 'not-signed-in' };
    set({ lastError: undefined });

    const row: Record<string, unknown> = {};
    if ('region' in patch) row.region = patch.region ?? null;
    if ('city' in patch) row.city = patch.city ?? null;
    if ('howFound' in patch) row.how_found = patch.howFound ?? null;
    if ('consent' in patch) row.consent = !!patch.consent;   // consent_at is set by a DB trigger

    const { data, error } = await supabase
      .from('profiles')
      .update(row)
      .eq('id', user.id)
      .select('region, city, how_found, consent, consent_at, tier')
      .maybeSingle<ProfileRow>();
    if (error) { set({ lastError: error.message }); return { ok: false, error: error.message }; }

    set({
      profile: data
        ? {
            region: data.region ?? undefined,
            city: data.city ?? undefined,
            howFound: data.how_found ?? undefined,
            consent: data.consent ?? false,
            consentAt: data.consent_at ?? undefined,
          }
        : { ...profile, ...patch, consent: patch.consent ?? profile.consent },
    });
    return { ok: true };
  },

  async refreshProfile() {
    const { user } = get();
    if (!user) return;
    const { profile, tier } = await fetchProfile(user.id);
    if (get().user?.id === user.id) set({ profile, tier: tierFor(user, tier) });
  },
}));
