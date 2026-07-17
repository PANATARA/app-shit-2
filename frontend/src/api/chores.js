import { apiFetch } from './client.js';

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
    return apiFetch('/api/chores', { params });
}

/**
 * Create a new chore for the user's family (admin only)
 * @param {object} choreData - { name, description, icon, valuation }
 * @returns {Promise<any>}
 */
export async function createChore(choreData) {
    return apiFetch('/api/chores', {
        method: 'POST',
        body: choreData
    });
}

/**
 * Delete a family chore by ID (admin only)
 * @param {string|number} choreId
 * @returns {Promise<any>}
 */
export async function deleteChore(choreId) {
    return apiFetch(`/api/chores/${choreId}`, {
        method: 'DELETE'
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
        method: 'PATCH',
        body: choreData
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
    return apiFetch('/api/chores/from-defaults/', {
        method: 'POST',
        body: data
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
        method: 'POST',
        body: completionData
    });
}

/**
 * Get a list of completed family chores sorted by date
 * @param {object} [filters] - Query parameters { due_date }
 * @returns {Promise<any>}
 */
export async function getPlannedChore(filters = {}) {
    return apiFetch('/api/chores/planned', {
        params: filters
    });
}

/**
 * Create a chore completion for a specific chore
 * @param {string} plannedChoreID
 * @returns {Promise<any>}
 */
export async function completePlannedChore(plannedChoreID) {
    return apiFetch(`/api/chores/planned/${plannedChoreID}/complete`, {
        method: 'PATCH',
    });
}

/**
 * Create a chore completion for a specific chore
 * @param {string} plannedChoreID
 * @returns {Promise<any>}
 */
export async function unCompletePlannedChore(plannedChoreID) {
    return apiFetch(`/api/chores/planned/${plannedChoreID}/uncomplete`, {
        method: 'PATCH',
    });
}

export async function deletePlannedChore(id) {
    return apiFetch(`/api/planned-chores/${id}`, { method: "DELETE" });
}

export async function reschedulePlannedChore(id, data) {
    return apiFetch(`/api/planned-chores/${id}/reschedule`, { method: "PATCH", body: data });
}

