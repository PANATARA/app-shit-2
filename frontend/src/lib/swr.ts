import { writable } from "svelte/store";
import { getCached, setCached } from "$lib/cashe";

export interface SWRState<T> {
  data: T | null;
  loading: boolean; // true только при первой загрузке (нет кэша)
  revalidating: boolean; // true при фоновом обновлении
  error: unknown;
}

export function swr<T>(key: string, fetcher: () => Promise<T>) {
  const cached = getCached<T>(key);

  const store = writable<SWRState<T>>({
    data: cached,
    loading: !cached, // показываем скелетон только если нет кэша
    revalidating: !!cached, // есть кэш — сразу идём обновлять фоном
    error: null,
  });

  async function revalidate() {
    try {
      const fresh = await fetcher();
      setCached(key, fresh);
      store.update((s) => ({ ...s, data: fresh, error: null }));
    } catch (e) {
      store.update((s) => ({ ...s, error: e }));
    } finally {
      store.update((s) => ({ ...s, loading: false, revalidating: false }));
    }
  }

  revalidate();

  return { subscribe: store.subscribe, revalidate };
}
