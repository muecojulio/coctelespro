const MEMORY = new Map();
const DEFAULT_TTL_MS = 30 * 60 * 1000;
const STORAGE_PREFIX = 'cp-cache:';

function now() {
  return Date.now();
}

function readStorage(key) {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.exp < now()) {
      localStorage.removeItem(STORAGE_PREFIX + key);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

function writeStorage(key, data, ttlMs) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify({ exp: now() + ttlMs, data }));
  } catch {}
}

export async function cachedFetch(url, options = {}, ttlMs = DEFAULT_TTL_MS) {
  const key = url;
  const mem = MEMORY.get(key);
  if (mem && mem.exp > now()) return mem.data;
  const stored = readStorage(key);
  if (stored != null) {
    MEMORY.set(key, { exp: now() + ttlMs, data: stored });
    return stored;
  }
  const res = await fetch(url, { ...options, cache: 'force-cache', next: { revalidate: Math.round(ttlMs / 1000) } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  const data = await res.json();
  MEMORY.set(key, { exp: now() + ttlMs, data });
  writeStorage(key, data, ttlMs);
  return data;
}

export function clearApiCache() {
  MEMORY.clear();
  if (typeof localStorage === 'undefined') return;
  const keys = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const k = localStorage.key(i);
    if (k && k.startsWith(STORAGE_PREFIX)) keys.push(k);
  }
  keys.forEach((k) => localStorage.removeItem(k));
}
