import { writable } from "svelte/store";
import { getCached, setCached, clearCachePrefix } from "$lib/cache";

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
  if (key.endsWith("*")) {
    const prefix = key.slice(0, -1);
    clearCachePrefix(prefix);
    for (const [k, set] of listeners.entries()) {
      if (k.startsWith(prefix) && set.size > 0) {
        // Оповещаем только активных слушателей
        const activeListeners = Array.from(set);
        activeListeners.forEach((fn) => fn(data));
      }
    }
    return;
  }

  if (data !== undefined) {
    setCached(key, data);
  }

  const set = listeners.get(key);
  if (set && set.size > 0) {
    const activeListeners = Array.from(set);
    activeListeners.forEach((fn) => fn(data));
  }
}

/**
 * Очистить весь кэш SWR и сбросить активных слушателей (при выходе из аккаунта)
 */
export function clearAllSwr(): void {
  clearCachePrefix("");
  listeners.clear();
}

export function swr<T>(key: string, fetcher: () => Promise<T>) {
  const cached = getCached<T>(key);

  let onMutate: MutateListener<T>;

  const store = writable<SWRState<T>>(
    {
      data: cached,
      loading: !cached, // показываем скелетон только если нет кэша
      revalidating: !!cached, // есть кэш — сразу идём обновлять фоном
      error: null,
    },
    () => {
      // Старт подписки (первый компонент подписался) -> регистрируем слушателя
      if (!listeners.has(key)) {
        listeners.set(key, new Set());
      }
      listeners.get(key)!.add(onMutate);

      return () => {
        // Остановка подписки (все компоненты размонтировались) -> авто-отписка
        const set = listeners.get(key);
        if (set) {
          set.delete(onMutate);
          if (set.size === 0) {
            listeners.delete(key);
          }
        }
      };
    }
  );

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

  onMutate = (freshData) => {
    if (freshData !== undefined) {
      store.update((s) => ({ ...s, data: freshData, loading: false }));
    } else {
      revalidate();
    }
  };

  revalidate();

  return {
    subscribe: store.subscribe,
    revalidate,
  };
}
