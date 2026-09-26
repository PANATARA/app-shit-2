import { swr, mutate } from "./swr";
import {
    getUpcomingEvents,
    getAllEvents,
    createEvent as apiCreateEvent,
    updateEvent as apiUpdateEvent,
    deleteEvent as apiDeleteEvent,
} from "$api/family";
import type { FamilyEvent } from "$types/index";

export type { FamilyEvent };

// ─── Cache Invalidation Helpers ─────────────────────────────────────────────

/**
 * Инвалидирует кэш событий семьи (предстоящих и полного списка)
 */
export function invalidateEvents() {
    mutate("family-events*");
    mutate("family-all-events*");
}

// ─── SWR Store Hooks ────────────────────────────────────────────────────────

/**
 * Загружает и кэширует предстоящие события семьи (для главного экрана)
 */
export function useUpcomingEvents() {
    return swr<FamilyEvent[]>("family-events", getUpcomingEvents);
}

/**
 * Загружает и кэширует список событий семьи с пагинацией
 */
export function useAllEvents(limit = 20, offset = 0) {
    const key = offset === 0 ? "family-all-events" : `family-all-events:${limit}:${offset}`;
    return swr<FamilyEvent[]>(key, async () => {
        const res = await getAllEvents({ limit, offset });
        return Array.isArray(res) ? res : (res?.items || []);
    });
}

// ─── Actions & Mutations ────────────────────────────────────────────────────

/**
 * Создать новое семейное событие
 */
export async function addFamilyEvent(data: {
    name: string;
    description?: string | null;
    date: string;
    icon?: string;
    icon_color?: string;
    icon_bg?: string;
}) {
    const res = await apiCreateEvent(data);
    invalidateEvents();
    return res;
}

/**
 * Обновить существующее событие
 */
export async function editFamilyEvent(eventId: string | number, data: Partial<FamilyEvent>) {
    const res = await apiUpdateEvent(String(eventId), data);
    invalidateEvents();
    return res;
}

/**
 * Удалить событие
 */
export async function removeFamilyEvent(eventId: string | number) {
    const res = await apiDeleteEvent(String(eventId));
    invalidateEvents();
    return res;
}
