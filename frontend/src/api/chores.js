import { apiFetch } from "./client.js";

// ==========================================
// 1. CHORES (ЗАДАЧИ)
// ==========================================

/**
 * Get a list of chores for the user's family
 * @param {number} [limit] - Optional limit of results
 * @returns {Promise<any>}
 */
export async function getChores(limit) {
  const params = limit !== undefined ? { limit } : undefined;
  return apiFetch("/api/chores", { params });
}

/**
 * Create a new chore for the user's family (admin only)
 * @param {object} choreData - { name, description, icon, valuation }
 * @returns {Promise<any>}
 */
export async function createChore(choreData) {
  return apiFetch("/api/chores", {
    method: "POST",
    body: choreData,
  });
}

/**
 * Delete a family chore by ID (admin only)
 * @param {string|number} choreId
 * @returns {Promise<any>}
 */
export async function deleteChore(choreId) {
  return apiFetch(`/api/chores/${choreId}`, {
    method: "DELETE",
  });
}

/**
 * Edit a family chore (admin only)
 * @param {string|number} choreId
 * @param {object} choreData - { name, description, icon, valuation }
 * @returns {Promise<any>}
 */
export async function updateChore(choreId, choreData) {
  return apiFetch(`/api/chores/${choreId}`, {
    method: "PATCH",
    body: choreData,
  });
}

export async function getDefaultChores() {
  return apiFetch(`/api/chores/default`);
}

/**
 * Edit a family chore (admin only)
 * @returns {Promise<any>}
 */
export async function createChoresFromDefault(data) {
  return apiFetch("/api/chores/from-defaults/", {
    method: "POST",
    body: data,
  });
}

// ==========================================
// 2. PLANNED CHORES
// ==========================================

/**
 * Create a chore completion for a specific chore
 * @param {string|number} choreId
 * @param {object} completionData - { message, assigned_to_id, due_date }
 * @returns {Promise<any>}
 */
export async function createPlannedChore(choreId, completionData) {
  return apiFetch(`/api/chores/${choreId}/planned`, {
    method: "POST",
    body: completionData,
  });
}

/**
 * Get a list of completed family chores sorted by date
 * @param {object} [filters] - Query parameters { due_date }
 * @returns {Promise<any>}
 */
export async function getPlannedChore(filters = {}) {
  return apiFetch("/api/chores/planned", {
    params: filters,
  });
}

/**
 * Create a chore completion for a specific chore
 * @param {string} plannedChoreID
 * @returns {Promise<any>}
 */
export async function completePlannedChore(plannedChoreID) {
  return apiFetch(`/api/chores/planned/${plannedChoreID}/complete`, {
    method: "PATCH",
  });
}

/**
 * Create a chore completion for a specific chore
 * @param {string} plannedChoreID
 * @returns {Promise<any>}
 */
export async function unCompletePlannedChore(plannedChoreID) {
  return apiFetch(`/api/chores/planned/${plannedChoreID}/uncomplete`, {
    method: "PATCH",
  });
}

export async function deletePlannedChore(id) {
  return apiFetch(`/api/chores/planned/${id}`, { method: "DELETE" });
}

export async function reschedulePlannedChore(id, data) {
  return apiFetch(`/api/chores/planned/${id}/reschedule`, {
    method: "PATCH",
    body: data,
  });
}


/**
 * Create a Quick Planned Chore
 * @param {Object} data
 * @returns {Promise<{id: string}>}
 */
export async function createQuickPlannedChore(data) {
    return apiFetch("/api/chores/quick", {
        method: "POST",
        body: data,
    });
}

/**
 * Get Quick Planned Chores for family
 * @param {string} [dateFrom] - ISO date
 * @param {string} [dateTo] - ISO date
 * @returns {Promise<any>}
 */
export async function getQuickPlannedChores(dateFrom, dateTo) {
    const params = new URLSearchParams();
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo)   params.set("date_to", dateTo);

    const qs = params.toString();
    return apiFetch(`/api/chores/quick${qs ? `?${qs}` : ""}`);
}

/**
 * Complete a Quick Planned Chore
 * @param {string} id
 * @returns {Promise<any>}
 */
export async function completeQuickPlannedChore(id) {
    return apiFetch(`/api/chores/quick/${id}/complete`, {
        method: "PATCH",
    });
}

/**
 * Uncomplete a Quick Planned Chore
 * @param {string} id
 * @returns {Promise<any>}
 */
export async function uncompleteQuickPlannedChore(id) {
    return apiFetch(`/api/chores/quick/${id}/uncomplete`, {
        method: "PATCH",
    });
}

/**
 * Update a Quick Planned Chore
 * @param {string} id
 * @param {Object} data
 * @returns {Promise<any>}
 */
export async function updateQuickPlannedChore(id, data) {
    return apiFetch(`/api/chores/quick/${id}`, {
        method: "PATCH",
        body: data,
    });
}

/**
 * Delete a Quick Planned Chore
 * @param {string} id
 * @returns {Promise<any>}
 */
export async function deleteQuickPlannedChore(id) {
    return apiFetch(`/api/chores/quick/${id}`, {
        method: "DELETE",
    });
}

// ==========================================
// 3. CHORE SCHEDULES (РАСПИСАНИЯ ЗАДАЧ)
// ==========================================

/**
 * Create a chore schedule
 * @param {string} choreId
 * @param {object} scheduleData - { assigned_to_id, frequency_type, interval, days_of_week, day_of_month, starts_at, ends_at }
 * @returns {Promise<any>}
 */
export async function createChoreSchedule(choreId, scheduleData) {
    return apiFetch(`/api/chores/${choreId}/schedule`, {
        method: "POST",
        body: scheduleData,
    });
}

/**
 * Get active schedule for a chore
 * @param {string} choreId
 * @returns {Promise<any>}
 */
export async function getChoreSchedule(choreId) {
    try {
        return await apiFetch(`/api/chores/${choreId}/schedule`);
    } catch (e) {
        if (e && e.status === 404) return null;
        throw e;
    }
}

/**
 * Update a chore schedule
 * @param {string} scheduleId
 * @param {object} scheduleData
 * @returns {Promise<any>}
 */
export async function updateChoreSchedule(scheduleId, scheduleData) {
    return apiFetch(`/api/schedules/${scheduleId}`, {
        method: "PATCH",
        body: scheduleData,
    });
}

/**
 * Soft delete a chore schedule
 * @param {string} scheduleId
 * @param {boolean} [revokeCompletedAwards=false]
 * @returns {Promise<any>}
 */
export async function deleteChoreSchedule(scheduleId, revokeCompletedAwards = false) {
    return apiFetch(
        `/api/schedules/${scheduleId}?revoke_completed_awards=${revokeCompletedAwards}`,
        {
            method: "DELETE",
        }
    );
}

