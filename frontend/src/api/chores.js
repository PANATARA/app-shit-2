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
  return [
    { id: "1", icon: "material-symbols:dish-washer-rounded", icon_color: "#ffffff", icon_bg: "linear-gradient(135deg, #e8856a 0%, #c17a45 100%)", valuation: 10, name: "Помыть посуду", description: "" },
    { id: "2", icon: "material-symbols:delete-rounded", icon_color: "#ffffff", icon_bg: "linear-gradient(135deg, #e8856a 0%, #c17a45 100%)", valuation: 10, name: "Вынести мусор", description: "" },
    { id: "3", icon: "material-symbols:vacuum-rounded", icon_color: "#ffffff", icon_bg: "linear-gradient(135deg, #6ab8a0 0%, #3d8c75 100%)", valuation: 15, name: "Пылесос", description: "" },
    { id: "4", icon: "material-symbols:local-laundry-service-rounded", icon_color: "#ffffff", icon_bg: "linear-gradient(135deg, #6ab8a0 0%, #3d8c75 100%)", valuation: 20, name: "Стирка", description: "" },
    { id: "5", icon: "material-symbols:pets-rounded", icon_color: "#ffffff", icon_bg: "linear-gradient(135deg, #e8a87c 0%, #c17a45 100%)", valuation: 15, name: "Выгулять собаку", description: "" },
    { id: "6", icon: "material-symbols:water-drop-rounded", icon_color: "#ffffff", icon_bg: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)", valuation: 10, name: "Полить цветы", description: "" },
    { id: "7", icon: "material-symbols:iron-rounded", icon_color: "#ffffff", icon_bg: "linear-gradient(135deg, #e8856a 0%, #c17a45 100%)", valuation: 15, name: "Глажка", description: "" },
    { id: "8", icon: "material-symbols:cooking-rounded", icon_color: "#ffffff", icon_bg: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", valuation: 25, name: "Приготовить еду", description: "" },
    { id: "9", icon: "material-symbols:mop-rounded", icon_color: "#ffffff", icon_bg: "linear-gradient(135deg, #6ab8a0 0%, #3d8c75 100%)", valuation: 20, name: "Помыть полы", description: "" },
    { id: "10", icon: "material-symbols:shopping-cart-rounded", icon_color: "#ffffff", icon_bg: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)", valuation: 20, name: "Закупить продукты", description: "" },
  ];
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
