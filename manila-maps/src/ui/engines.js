// Loads the Data team's search and routing engines if they exist in this build.
// The map works without them (search/routing UI then explains what's missing).
const mods = import.meta.glob(['../engine/search.js', '../engine/router.js']);

async function load(path, factory, bundle) {
  const imp = mods[path];
  if (!imp) return null;
  try {
    const m = await imp();
    if (typeof m[factory] !== 'function') return null;
    return await m[factory](bundle);
  } catch (e) {
    console.warn(`${path} unavailable:`, e);
    return null;
  }
}

export function loadEngines(bundle) {
  const engines = { search: null, router: null, searchReady: null, routerReady: null };
  const has = (n) => { try { return bundle.has(n) && bundle.size(n) > 0; } catch { return false; } };
  engines.searchReady = has('search.bin')
    ? load('../engine/search.js', 'createSearch', bundle).then((s) => (engines.search = s))
    : Promise.resolve(null);
  engines.routerReady = has('route.bin')
    ? load('../engine/router.js', 'createRouter', bundle).then((r) => (engines.router = r))
    : Promise.resolve(null);
  return engines;
}
