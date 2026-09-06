type CacheEntry<T> = { data: T; ts: number };
const TTL = 5 * 60 * 1000;

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
