import { writable } from 'svelte/store';

// Support VITE_API_URL or get/set it dynamically
let savedUrl = 'http://92.100.39.109:8000';
try {
    if (typeof localStorage !== 'undefined') {
        savedUrl = localStorage.getItem('api_base_url') || '';
    }
} catch (e) {
    console.warn('localStorage not available:', e);
}

let apiBaseUrl = 'http://92.100.39.109:8000';
// let apiBaseUrl = savedUrl || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || '';
export function getBaseUrl() {
    return apiBaseUrl;
}

export function setBaseUrl(url) {
    apiBaseUrl = url;
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('api_base_url', url);
        }
    } catch (e) {
        console.warn('Could not save API base URL to localStorage:', e);
    }
}

export function getApiUrl(path) {
    return `${apiBaseUrl}${path}`;
}

// Token storage utilities
const getStoredToken = (key) => {
    try {
        if (typeof localStorage !== 'undefined') {
            return localStorage.getItem(key) || '';
        }
    } catch (e) {}
    return '';
};

const setStoredToken = (key, value) => {
    try {
        if (typeof localStorage !== 'undefined') {
            if (value) {
                localStorage.setItem(key, value);
            } else {
                localStorage.removeItem(key);
            }
        }
    } catch (e) {}
};

// Svelte Stores for JWT state
export const accessTokenStore = writable(getStoredToken('access_token'));
export const refreshTokenStore = writable(getStoredToken('refresh_token'));
export const isLoggedInStore = writable(!!getStoredToken('access_token'));

// Keep track of the current token locally for direct access in non-reactive contexts
let currentAccessToken = getStoredToken('access_token');
let currentRefreshToken = getStoredToken('refresh_token');

accessTokenStore.subscribe(value => {
    currentAccessToken = value;
});

refreshTokenStore.subscribe(value => {
    currentRefreshToken = value;
});

export function setTokens(access, refresh) {
    accessTokenStore.set(access);
    setStoredToken('access_token', access);
    
    if (refresh) {
        refreshTokenStore.set(refresh);
        setStoredToken('refresh_token', refresh);
    }
    
    isLoggedInStore.set(!!access);
}

export function clearTokens() {
    accessTokenStore.set('');
    setStoredToken('access_token', '');
    refreshTokenStore.set('');
    setStoredToken('refresh_token', '');
    isLoggedInStore.set(false);
}

// Handle multi-request refresh queueing
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
    refreshSubscribers.push(cb);
}

function onRefreshed(token) {
    refreshSubscribers.forEach(cb => cb(token));
    refreshSubscribers = [];
}

/**
 * Generic API fetch wrapper with JWT authentication and auto-refresh logic
 * @param {string} path - The endpoint path (e.g. '/api/users/me/profile')
 * @param {object} options - Request options (method, body, params, headers, skipAuth, isMultipart)
 * @returns {Promise<any>}
 */
export async function apiFetch(path, options = {}) {
    const { 
        method = 'GET', 
        headers = {}, 
        body, 
        params, 
        skipAuth = false,
        isMultipart = false 
    } = options;

    let url = `${apiBaseUrl}${path}`;

    // Append query parameters
    if (params) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null) {
                if (Array.isArray(val)) {
                    val.forEach(v => queryParams.append(key, v));
                } else {
                    queryParams.append(key, val);
                }
            }
        });
        const queryString = queryParams.toString();
        if (queryString) {
            url += `?${queryString}`;
        }
    }

    const requestHeaders = { ...headers };

    // Attach Authorization header if logged in and not explicitly skipped
    if (currentAccessToken && !skipAuth) {
        requestHeaders['Authorization'] = `Bearer ${currentAccessToken}`;
    }

    // Auto content-type header for JSON, unless it's FormData/multipart
    if (body && !isMultipart && !(body instanceof FormData)) {
        requestHeaders['Content-Type'] = 'application/json';
    }

    const fetchOptions = {
        method,
        headers: requestHeaders,
    };

    if (body) {
        if (isMultipart || body instanceof FormData) {
            fetchOptions.body = body;
            // Browser sets content-type and boundary automatically
        } else {
            fetchOptions.body = typeof body === 'object' ? JSON.stringify(body) : body;
        }
    }

    try {
        const response = await fetch(url, fetchOptions);

        // Auto-refresh token on 401 Unauthorized
        if (response.status === 401 && !skipAuth && currentRefreshToken) {
            if (!isRefreshing) {
                isRefreshing = true;
                refreshAccessToken(currentRefreshToken)
                    .then(newTokens => {
                        setTokens(newTokens.access_token, newTokens.refresh_token);
                        onRefreshed(newTokens.access_token);
                    })
                    .catch(err => {
                        clearTokens();
                        onRefreshed(null);
                    })
                    .finally(() => {
                        isRefreshing = false;
                    });
            }

            // Wait for refresh to resolve
            return new Promise((resolve, reject) => {
                subscribeTokenRefresh((newToken) => {
                    if (newToken) {
                        // Retry original request
                        requestHeaders['Authorization'] = `Bearer ${newToken}`;
                        fetch(url, fetchOptions)
                            .then(async (res) => {
                                if (!res.ok) {
                                    const errData = await res.json().catch(() => ({}));
                                    reject({ status: res.status, data: errData });
                                } else {
                                    resolve(await parseResponse(res));
                                }
                            })
                            .catch(reject);
                    } else {
                        reject({ status: 401, data: { detail: 'Session expired' } });
                    }
                });
            });
        }

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw { status: response.status, data: errData };
        }

        return await parseResponse(response);
    } catch (error) {
        if (error && typeof error.status === 'number') {
            throw error;
        }
        throw { status: 0, data: { detail: error.message || 'Network error' } };
    }
}

async function parseResponse(response) {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return await response.json();
    }
    if (contentType.includes('image/') || contentType.includes('application/octet-stream')) {
        return await response.blob();
    }
    return await response.text();
}

async function refreshAccessToken(refreshToken) {
    const url = `${apiBaseUrl}/api/login/refresh`;
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token: refreshToken })
    });
    if (!res.ok) {
        throw new Error('Refresh token invalid');
    }
    return await res.json();
}
