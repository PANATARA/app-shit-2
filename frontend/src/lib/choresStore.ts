import { swr, mutate } from "./swr";
import {
    getChores,
    createChore as apiCreateChore,
    deleteChore as apiDeleteChore,
    updateChore as apiUpdateChore,
    getDefaultChores as apiGetDefaultChores,
    createChoresFromDefault as apiCreateChoresFromDefault,
    getPlannedChore,
    createPlannedChore as apiCreatePlannedChore,
    completePlannedChore as apiCompletePlannedChore,
    unCompletePlannedChore as apiUnCompletePlannedChore,
    deletePlannedChore as apiDeletePlannedChore,
    reschedulePlannedChore as apiReschedulePlannedChore,
    updatePlannedChoreMessage as apiUpdatePlannedChoreMessage,
    getQuickPlannedChores,
    createQuickPlannedChore as apiCreateQuickPlannedChore,
    completeQuickPlannedChore as apiCompleteQuickPlannedChore,
    uncompleteQuickPlannedChore as apiUncompleteQuickPlannedChore,
    updateQuickPlannedChore as apiUpdateQuickPlannedChore,
    deleteQuickPlannedChore as apiDeleteQuickPlannedChore,
    createChoreSchedule as apiCreateChoreSchedule,
    getChoreSchedule as apiGetChoreSchedule,
    updateChoreSchedule as apiUpdateChoreSchedule,
    deleteChoreSchedule as apiDeleteChoreSchedule,
} from "$api/chores";
import type {
    ChoreItem,
    PlannedChore,
    QuickPlannedChore,
    AnyPlannedChore,
    DefaultChore,
} from "$types/index";

export type { ChoreItem, PlannedChore, QuickPlannedChore, AnyPlannedChore, DefaultChore };

// ─── Cache Invalidation Helpers ─────────────────────────────────────────────

/**
 * Инвалидирует кэш доски задач (на конкретную дату или все даты)
 * и обновляет зависимые счетчики статистики и лидеров
 */
export function invalidateBoard(dateKey?: string) {
    if (dateKey) {
        mutate(`planned-chores:${dateKey}`);
        mutate(`quick-planned-chores:${dateKey}`);
    } else {
        mutate("planned-chores:*");
        mutate("quick-planned-chores:*");
    }
    mutate("family-stats");
    mutate("family-leaders");
    mutate("profile");
}

/**
 * Инвалидирует кэш шаблонов семейных задач
 */
export function invalidateFamilyChores() {
    mutate("chores*");
    mutate("planned-chores:*");
}

/**
 * Склеивает и сортирует плановые и быстрые задачи для отображения на доске
 */
export function mergeBoardChores(
    regular: PlannedChore[] | null | undefined,
    quick: QuickPlannedChore[] | null | undefined
): AnyPlannedChore[] {
    return [
        ...(regular ?? []).map((c) => ({ ...c, is_quick: false as const })),
        ...(quick ?? []).map((c) => ({ ...c, is_quick: true as const })),
    ].sort((a, b) => Number(a.is_quick) - Number(b.is_quick));
}

// ─── SWR Store Hooks ────────────────────────────────────────────────────────

/**
 * Загружает и кэширует список запланированных регулярных задач на дату
 */
export function usePlannedChores(dateKey: string) {
    return swr<PlannedChore[]>(`planned-chores:${dateKey}`, () =>
        getPlannedChore({ due_date: dateKey })
    );
}

/**
 * Загружает и кэширует список быстрых задач на дату
 */
export function useQuickPlannedChores(dateKey: string) {
    return swr<QuickPlannedChore[]>(`quick-planned-chores:${dateKey}`, () =>
        getQuickPlannedChores(dateKey, dateKey)
    );
}

/**
 * Загружает и кэширует список шаблонов семейных задач
 */
export function useFamilyChores(limit?: number) {
    const key = limit !== undefined ? `chores:${limit}` : "chores";
    return swr<any>(key, () => getChores(limit));
}

/**
 * Загружает и кэширует системные дефолтные задачи
 */
export function useDefaultChores() {
    return swr<DefaultChore[]>("default-chores", () => apiGetDefaultChores());
}

/**
 * Загружает и кэширует расписание для задачи
 */
export function useChoreSchedule(choreId: string) {
    return swr(`chore-schedule:${choreId}`, () => apiGetChoreSchedule(choreId));
}

// ─── Actions & Mutations ────────────────────────────────────────────────────

/**
 * Переключает статус выполнения задачи (завершена / не завершена)
 * с автоматической инвалидацией кэша доски и статистики
 */
export async function togglePlannedChore(choreItem: AnyPlannedChore, dateKey?: string): Promise<AnyPlannedChore> {
    const isCompleted = choreItem.completed_by !== null;
    let updated: AnyPlannedChore;

    if (choreItem.is_quick) {
        const raw = isCompleted
            ? await apiUncompleteQuickPlannedChore(choreItem.id)
            : await apiCompleteQuickPlannedChore(choreItem.id);
        updated = { ...raw, is_quick: true as const };
    } else {
        const raw = isCompleted
            ? await apiUnCompletePlannedChore(choreItem.id)
            : await apiCompletePlannedChore(choreItem.id);
        updated = { ...raw, is_quick: false as const };
    }

    invalidateBoard(dateKey || choreItem.due_date);
    return updated;
}

/**
 * Создать запланированную задачу по шаблону
 */
export async function addPlannedChore(choreId: string | number, data: any) {
    const res = await apiCreatePlannedChore(choreId, data);
    invalidateBoard(data?.due_date || undefined);
    return res;
}

/**
 * Создать быструю задачу
 */
export async function addQuickPlannedChore(data: any) {
    const res = await apiCreateQuickPlannedChore(data);
    invalidateBoard(data?.due_date || undefined);
    return res;
}

/**
 * Создать расписание для задачи
 */
export async function addChoreSchedule(choreId: string | number, scheduleData: any) {
    const res = await apiCreateChoreSchedule(choreId, scheduleData);
    invalidateBoard();
    mutate(`chore-schedule:${choreId}`);
    return res;
}

/**
 * Обновить существующее расписание задачи
 */
export async function editChoreSchedule(
    scheduleId: string | number,
    choreId: string | number,
    scheduleData: any
) {
    const res = await apiUpdateChoreSchedule(scheduleId, scheduleData);
    invalidateBoard();
    mutate(`chore-schedule:${choreId}`);
    return res;
}

/**
 * Отключить / удалить расписание задачи
 */
export async function removeChoreSchedule(
    scheduleId: string | number,
    choreId: string | number,
    revokeCompletedAwards: boolean = false
) {
    const res = await apiDeleteChoreSchedule(scheduleId, revokeCompletedAwards);
    invalidateBoard();
    mutate(`chore-schedule:${choreId}`, null);
    return res;
}

/**
 * Удалить задачу из расписания доски
 */
export async function removePlannedChore(id: string, isQuick: boolean, dateKey?: string) {
    if (isQuick) {
        await apiDeleteQuickPlannedChore(id);
    } else {
        await apiDeletePlannedChore(id);
    }
    invalidateBoard(dateKey);
}

/**
 * Перенести задачу на другую дату
 */
export async function rescheduleChore(
    id: string,
    isQuick: boolean,
    newDate: string,
    oldDate?: string
) {
    let res: any;
    if (isQuick) {
        res = await apiUpdateQuickPlannedChore(id, { due_date: newDate });
    } else {
        res = await apiReschedulePlannedChore(id, { reschedule_due_date: newDate });
    }
    invalidateBoard(newDate);
    if (oldDate && oldDate !== newDate) {
        invalidateBoard(oldDate);
    }
    return res;
}

/**
 * Обновить подзадачи / комментарий задачи
 */
export async function updateChoreSubtasks(id: string, isQuick: boolean, message: string, dateKey?: string) {
    let res: any;
    if (isQuick) {
        res = await apiUpdateQuickPlannedChore(id, { message });
    } else {
        res = await apiUpdatePlannedChoreMessage(id, message);
    }
    invalidateBoard(dateKey);
    return res;
}

/**
 * Создать новый шаблон семейной задачи
 */
export async function addFamilyChore(data: any) {
    const res = await apiCreateChore(data);
    invalidateFamilyChores();
    return res;
}

/**
 * Обновить шаблон семейной задачи
 */
export async function editFamilyChore(choreId: string | number, data: any) {
    const res = await apiUpdateChore(choreId, data);
    invalidateFamilyChores();
    return res;
}

/**
 * Удалить шаблон семейной задачи
 */
export async function removeFamilyChore(choreId: string | number) {
    const res = await apiDeleteChore(choreId);
    invalidateFamilyChores();
    return res;
}

/**
 * Создать шаблоны задач из системных дефолтных
 */
export async function addChoresFromDefault(data: any) {
    const res = await apiCreateChoresFromDefault(data);
    invalidateFamilyChores();
    return res;
}

export { apiGetDefaultChores as getDefaultChores };
