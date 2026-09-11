import { writable } from "svelte/store";
import { getCached, setCached } from "$lib/cache";

export interface SWRState<T> {
  data: T | null;
  loading: boolean; // true только при первой загрузке (нет кэша)
  revalidating: boolean; // true при фоновом обновлении
  error: unknown;
}

type MutateListener<T> = (freshData?: T) => void;
const listeners = new Map<string, Set<MutateListener<any>>>();

/**
 * Ручное обновление данных в SWR-кэше и оповещение всех активных подписчиков
 */
export function mutate<T>(key: string, data?: T) {
  if (data !== undefined) {
    setCached(key, data);
  }
  const set = listeners.get(key);
  if (set) {
    set.forEach((fn) => fn(data));
  }
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

  const onMutate: MutateListener<T> = (freshData) => {
    if (freshData !== undefined) {
      store.update((s) => ({ ...s, data: freshData, loading: false }));
    } else {
      revalidate();
    }
  };

  if (!listeners.has(key)) {
    listeners.set(key, new Set());
  }
  const set = listeners.get(key)!;
  set.add(onMutate);

  revalidate();

  return {
    subscribe: store.subscribe,
    revalidate,
  };
}
