type CacheEntry<T> = { data: T; ts: number };
// 7 дней максимальный срок жизни кэша для офлайн-показа / SWR
const TTL = 7 * 24 * 60 * 60 * 1000;

export function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`swr:${key}`);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.ts > TTL) {
      localStorage.removeItem(`swr:${key}`);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function setCached<T>(key: string, data: T): void {
  try {
    localStorage.setItem(
      `swr:${key}`,
      JSON.stringify({ data, ts: Date.now() }),
    );
  } catch (e) {
    // QuotaExceededError — молча игнорируем, кэш просто не запишется
    console.warn("swr cache write failed:", e);
  }
}

export function removeCached(key: string): void {
  try {
    localStorage.removeItem(`swr:${key}`);
  } catch (e) {
    console.warn("swr cache remove failed:", e);
  }
}

export function clearCachePrefix(prefix: string): void {
  try {
    if (typeof localStorage === "undefined") return;
    const fullPrefix = `swr:${prefix}`;
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith(fullPrefix)) {
        localStorage.removeItem(k);
      }
    }
  } catch (e) {
    console.warn("swr clearCachePrefix failed:", e);
  }
}
