import type { ChoreCompletionStat, StatFilters } from '$types/index';
import { apiFetch } from './client.js';

/**
 * Get family chores sorted by completion count
 */
export async function getStatisticsOnFamilyChore(
  filters: StatFilters = {}
): Promise<ChoreCompletionStat[]> {
  return apiFetch("/api/stats/families/chores", {
    params: filters,
  });
}

/**
 * Get family members sorted by completion count
 */
export async function getStatisticsFamilyMembers(
  filters: StatFilters = {}
): Promise<ChoreCompletionStat[]> {
  return apiFetch("/api/stats/families/members", {
    params: filters,
  });
}