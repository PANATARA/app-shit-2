import { apiFetch, setTokens, clearTokens } from './client.js';
import { registerPushToken, unregisterPushToken } from '../lib/pushNotifications';

/**
 * Log in using username and password
 * @param {string} username
 * @param {string} password
 * @returns {Promise<any>}
 */
export async function login(username, password) {
    const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: { username: username.trim(), password },
        skipAuth: true
    });
    if (data && data.access_token) {
        setTokens(data.access_token, data.refresh_token);
        registerPushToken().catch((err) => {
            console.warn('Auto-registering push token after login failed:', err);
        });
    }
    return data;
}

/**
 * Register a new user using username and password
 * @param {string} username
 * @param {string} password
 * @param {string|null} [name=null]
 * @returns {Promise<any>}
 */
export async function register(username, password, name = null, avatar = null) {
    const body = {
        username: username.trim(),
        password,
        name: name ? name.trim() : null
    };
    if (avatar) {
        if (avatar.icon) body.icon = avatar.icon;
        if (avatar.icon_color) body.icon_color = avatar.icon_color;
        if (avatar.icon_bg) body.icon_bg = avatar.icon_bg;
    }
    const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body,
        skipAuth: true
    });
    if (data && data.access_token) {
        setTokens(data.access_token, data.refresh_token);
        registerPushToken().catch((err) => {
            console.warn('Auto-registering push token after register failed:', err);
        });
    }
    return data;
}

/**
 * Debug quick authentication (directly logs in or creates test user)
 * @param {string} [username="debug_user"]
 * @returns {Promise<any>}
 */
export async function debugAuth(username = "debug_user") {
    const data = await apiFetch('/api/auth/debug-auth', {
        method: 'POST',
        body: { username: username.trim() || "debug_user" },
        skipAuth: true
    });
    if (data && data.access_token) {
        setTokens(data.access_token, data.refresh_token);
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
    if (data && data.access_token) {
        setTokens(data.access_token, data.refresh_token);
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
