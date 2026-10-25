/** Key-value adapter; localStorage on web, Preferences on Capacitor later. */
export const kv = {
  get(key: string): string | null { try { return localStorage.getItem(key); } catch { return null; } },
  set(key: string, value: string) { try { localStorage.setItem(key, value); } catch { /* full or private */ } },
  del(key: string) { try { localStorage.removeItem(key); } catch { /* ignore */ } },
};
