import { apiFetch, setTokens, clearTokens } from './client.js';

/**
 * Send an authentication code to the specified email
 * @param {string} email
 * @returns {Promise<any>}
 */
export async function requestCode(email) {
    return apiFetch('/api/login/request-code', {
        method: 'POST',
        body: { email },
        skipAuth: true
    });
}

/**
 * Verify the verification code sent to the email and save tokens
 * @param {string} email
 * @param {number} code
 * @returns {Promise<any>}
 */
export async function verifyCode(email, code) {
    const data = await apiFetch('/api/login/verify-code', {
        method: 'POST',
        body: { email, code: parseInt(code, 10) },
        skipAuth: true
    });
    // Store tokens automatically on success
    if (data && data.access_token) {
        setTokens(data.access_token, data.refresh_token);
    }
    return data;
}

/**
 * Debug authentication by email (directly logs in without sending/verifying a code)
 * @param {string} email
 * @returns {Promise<any>}
 */
export async function debugAuth(email) {
    const data = await apiFetch('/api/login/debug-auth', {
        method: 'POST',
        body: { email },
        skipAuth: true
    });
    // Store tokens automatically on success
    if (data && data.access_token) {
        setTokens(data.access_token, data.refresh_token);
    }
    return data;
}

/**
 * Logs out the user by clearing the stored tokens and Svelte stores
 */
export function logout() {
    clearTokens();
}
