import { apiFetch, setTokens, clearTokens } from './client.js';
import { registerPushToken, unregisterPushToken } from '../lib/pushNotifications';

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
        // Register device push token if available
        registerPushToken().catch((err) => {
            console.warn('Auto-registering push token after login failed:', err);
        });
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
        // Register device push token if available
        registerPushToken().catch((err) => {
            console.warn('Auto-registering push token after debug auth failed:', err);
        });
    }
    return data;
}

/**
 * Authenticate with Google ID Token (response.credential)
 * @param {string} credential
 * @returns {Promise<any>}
 */
export async function loginWithGoogle(credential) {
    const data = await apiFetch('/api/auth/google', {
        method: 'POST',
        body: { credential },
        skipAuth: true
    });
    // Store tokens automatically on success
    if (data && data.access_token) {
        setTokens(data.access_token, data.refresh_token);
        // Register device push token if available
        registerPushToken().catch((err) => {
            console.warn('Auto-registering push token after Google auth failed:', err);
        });
    }
    return data;
}


/**
 * Logs out the user by unregistering device push token and clearing stored tokens
 */
export async function logout() {
    try {
        await unregisterPushToken();
    } catch (e) {
        console.warn('Could not unregister push token during logout:', e);
    } finally {
        clearTokens();
    }
}

