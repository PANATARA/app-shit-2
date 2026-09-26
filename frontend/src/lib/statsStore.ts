import { swr, mutate } from "./swr";
import { getFamilyStats, getFamilyLeader } from "$api/family";
import { getStatisticsOnFamilyChore, getStatisticsFamilyMembers } from "$api/stats";
import type { FamilyStatsProfile, ChoreCompletionStat, StatFilters } from "$types/index";

export type { FamilyStatsProfile, ChoreCompletionStat, StatFilters };

// ─── Cache Invalidation Helpers ─────────────────────────────────────────────

/**
 * Инвалидирует кэш статистики семьи и таблицы лидеров
 */
export function invalidateStats() {
    mutate("family-stats*");
    mutate("family-leaders*");
}

// ─── SWR Store Hooks ────────────────────────────────────────────────────────

/**
 * Загружает и кэширует общую статистику семьи (серия, выполнено за неделю и т.д.)
 */
export function useFamilyStats() {
    return swr<FamilyStatsProfile>("family-stats", getFamilyStats);
}

/**
 * Загружает и кэширует таблицу лидеров семьи
 */
export function useFamilyLeaders() {
    return swr<any>("family-leaders", getFamilyLeader);
}

/**
 * Загружает статистику выполнения задач по шаблонам
 */
export function useChoreStatistics(filters: StatFilters = {}) {
    const key = `stats-chores:${JSON.stringify(filters)}`;
    return swr<ChoreCompletionStat[]>(key, () => getStatisticsOnFamilyChore(filters));
}

/**
 * Загружает статистику выполнения задач по участникам
 */
export function useMemberStatistics(filters: StatFilters = {}) {
    const key = `stats-members:${JSON.stringify(filters)}`;
    return swr<ChoreCompletionStat[]>(key, () => getStatisticsFamilyMembers(filters));
}
