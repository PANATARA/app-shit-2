import { apiFetch, getApiUrl, userSession } from './client.js';

/**
 * Get current user's profile
 * @returns {Promise<any>}
 */
export async function getProfile() {
    const data = await apiFetch('/api/users/me/profile');
    if (data) {
        userSession.set({
            userId: data.id,
            isFamilyAdmin: data.is_family_admin,
        });
    }
    return data;
}

/**
 * Update current user's profile
 * @param {object} profileData - { username, name, surname }
 * @returns {Promise<any>}
 */
export async function updateProfile(profileData) {
    return apiFetch('/api/users/me/profile', {
        method: 'PATCH',
        body: profileData
    });
}

/**
 * Get current user's settings
 * @returns {Promise<any>}
 */
export async function getSettings() {
    return apiFetch('/api/users/me/settings');
}

/**
 * Update current user's settings
 * @param {object} settingsData - { app_theme, language, date_of_birth }
 * @returns {Promise<any>}
 */
export async function updateSettings(settingsData) {
    return apiFetch('/api/users/me/settings', {
        method: 'PATCH',
        body: settingsData
    });
}

/**
 * Upload a new avatar for the current user
 * @param {File|Blob} file - The image file to upload
 * @returns {Promise<any>}
 */
export async function uploadAvatar(file) {
    const formData = new FormData();
    formData.append('file', file);

    return apiFetch('/api/usersme/avatar/file', {
        method: 'POST',
        body: formData,
        isMultipart: true
    });
}

/**
 * Get user profile by ID
 * @param {string|number} userId
 * @returns {Promise<any>}
 */
export async function getUserProfile(userId) {
    return apiFetch(`/api/users/${userId}`);
}

/**
 * Get the avatar image of a user by ID
 * Returns a Blob. Note that you can also construct the absolute URL directly using getAvatarUrl(userId)
 * @param {string|number} userId
 * @param {number} [avatarVersion]
 * @returns {Promise<Blob>}
 */
export async function getUserAvatar(userId, avatarVersion) {
    const params = avatarVersion ? { avatar_version: avatarVersion } : undefined;
    return apiFetch(`/api/users/${userId}/avatar`, { params });
}

/**
 * Helper to get the absolute URL for a user's avatar to use directly in an <img> tag.
 * @param {string|number} userId
 * @param {number} [avatarVersion]
 * @returns {string}
 */
export function getUserAvatarUrl(userId, avatarVersion) {
    const path = `/api/users/${userId}/avatar`;
    const query = avatarVersion ? `?avatar_version=${avatarVersion}` : '';
    return getApiUrl(`${path}${query}`);
}
