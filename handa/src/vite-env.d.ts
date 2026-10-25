/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL. Absent => guest mode. */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase anon (public) key. Absent => guest mode. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** '1' to show the Google sign-in button. */
  readonly VITE_GOOGLE_AUTH?: string;
  /** Canonical site URL without trailing slash, e.g. https://prepare.ph */
  readonly VITE_ROUTER?: 'hash' | 'browser';
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
