import { writable } from "svelte/store";

export const isOfflineStore = writable<boolean>(
    typeof navigator !== "undefined" ? !navigator.onLine : false
);

export function setOffline(offline: boolean) {
    isOfflineStore.set(offline);
}
