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

// ==========================================
// 2. CHORE COMPLETIONS (ВЫПОЛНЕНИЕ ЗАДАЧ)
// ==========================================

/**
 * Create a chore completion for a specific chore
 * @param {string|number} choreId
 * @param {object} completionData - { message }
 * @returns {Promise<any>}
 */
export async function createChoreCompletion(choreId, completionData) {
    return apiFetch(`/api/chores-completions/${choreId}`, {
        method: 'POST',
        body: completionData
    });
}

/**
 * Get a list of completed family chores sorted by date
 * @param {object} [filters] - Query parameters { status, chore_id, user_id, offset, limit }
 * @returns {Promise<any>}
 */
export async function getChoreCompletions(filters = {}) {
    return apiFetch('/api/chores-completions', {
        params: filters
    });
}

/**
 * Retrieve detailed information about a specific chore completion
 * @param {string|number} choreCompletionId
 * @returns {Promise<any>}
 */
export async function getChoreCompletionDetail(choreCompletionId) {
    return apiFetch(`/api/chores-completions/${choreCompletionId}`);
}

// ==========================================
// 3. CHORE CONFIRMATIONS (ПОДТВЕРЖДЕНИЕ ВЫПОЛНЕНИЯ)
// ==========================================

/**
 * Get all confirmation objects for chores completed by others and pending user's approval
 * @param {object} [options] - Query parameters { status, offset, limit }
 * @returns {Promise<any>}
 */
export async function getMyChoreConfirmations(options = {}) {
    return apiFetch('/api/chores-confirmations', {
        params: options
    });
}

/**
 * Update the status of a chore confirmation (approve or reject)
 * @param {string|number} choreConfirmationId
 * @param {string} status - New status (e.g. from StatusConfirmENUM)
 * @returns {Promise<any>}
 */
export async function setChoreConfirmationStatus(choreConfirmationId, status) {
    return apiFetch(`/api/chores-confirmations/${choreConfirmationId}`, {
        method: 'PATCH',
        body: { status }
    });
}
