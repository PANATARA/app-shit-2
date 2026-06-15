import { apiFetch, getApiUrl } from './client.js';

/**
 * Get information about the user's family
 * @returns {Promise<any>}
 */
export async function getFamily() {
    return apiFetch('/api/families');
}

/**
 * Create a new family and add the current user as a member
 * @param {object} familyData - { name, icon }
 * @returns {Promise<any>}
 */
export async function createFamily(familyData) {
    return apiFetch('/api/families', {
        method: 'POST',
        body: familyData
    });
}

/**
 * Upload new family's avatar
 * Note: the trailing slash is included exactly as specified in the openapi spec: '/api/families/avatar/file/'
 * @param {File|Blob} file - The image file to upload
 * @returns {Promise<any>}
 */
export async function uploadFamilyAvatar(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiFetch('/api/families/avatar/file/', {
        method: 'POST',
        body: formData,
        isMultipart: true
    });
}

/**
 * Get family's avatar
 * Returns a Blob. Note that you can also construct the absolute URL directly using getFamilyAvatarUrl()
 * @returns {Promise<Blob>}
 */
export async function getFamilyAvatar() {
    return apiFetch('/api/families/avatar');
}

/**
 * Helper to get the absolute URL for the family's avatar to use directly in an <img> tag.
 * @returns {string}
 */
export function getFamilyAvatarUrl() {
    return getApiUrl('/api/families/avatar');
}

/**
 * Get Family Members
 * @returns {Promise<any>}
 */
export async function getFamilyMembers() {
    return apiFetch('/api/families/members');
}

/**
 * Get Family Leader
 * @returns {Promise<any>}
 */
export async function getFamilyLeader() {
    return apiFetch('/api/families/members/leader');
}

/**
 * Logout the user from the family, preventing administrators from leaving
 * @returns {Promise<any>}
 */
export async function logoutFromFamily() {
    return apiFetch('/api/families/logout', {
        method: 'PATCH'
    });
}

/**
 * Kick a user from the family (admin only)
 * @param {string|number} userId
 * @returns {Promise<any>}
 */
export async function kickFamilyMember(userId) {
    return apiFetch(`/api/families/kick/${userId}`, {
        method: 'DELETE'
    });
}

/**
 * Change the family administrator
 * @param {string|number} userId
 * @returns {Promise<any>}
 */
export async function changeFamilyAdmin(userId) {
    return apiFetch(`/api/families/change_admin/${userId}`, {
        method: 'PATCH'
    });
}

/**
 * Generate an invite token for family invitations
 * @param {object} inviteData - { should_confirm_chore_completion: boolean }
 * @returns {Promise<any>}
 */
export async function generateInviteToken(inviteData) {
    return apiFetch('/api/families/invite', {
        method: 'POST',
        body: inviteData
    });
}

/**
 * Join to family by invite-token
 * @param {string} inviteToken
 * @returns {Promise<any>}
 */
export async function joinFamily(inviteToken) {
    return apiFetch(`/api/families/join/${inviteToken}`, {
        method: 'POST'
    });
}
