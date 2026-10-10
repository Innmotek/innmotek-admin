/**
 * Innmotek Admin CMS - Client-Side Authentication State Manager
 * 
 * Manages JWT tokens, authenticated user state, and RBAC permissions in localStorage.
 */

const TOKEN_KEY = 'innmotek_admin_token';
const USER_KEY = 'innmotek_admin_user';

export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthSession(token, user) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
  return !!getAuthToken();
}

/**
 * Authenticated Fetch Wrapper
 * Automatically attaches Authorization: Bearer <token> to all requests.
 * Automatically clears session and redirects to /login if token is expired or unauthorized (401).
 */
export async function authFetch(url, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...(options.headers || {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401 && typeof window !== 'undefined') {
    clearAuthSession();
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
  }

  return res;
}

/**
 * Authenticated Request with Real-Time 0%-100% Upload Progress Tracking.
 * 
 * Uses XMLHttpRequest upload listener to deliver accurate progress events.
 * 
 * @param {string} url - API endpoint
 * @param {object} options - Fetch-style options (method, headers, body)
 * @param {(percent: number, loaded: number, total: number) => void} onProgress - Progress callback
 * @returns {Promise<{ ok: boolean, status: number, json: () => Promise<any> }>}
 */
export function authRequestWithProgress(url, options = {}, onProgress = null) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const method = options.method || 'POST';
    xhr.open(method, url, true);

    const token = getAuthToken();
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    if (options.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        xhr.setRequestHeader(key, value);
      }
    }

    if (xhr.upload && typeof onProgress === 'function') {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.min(100, Math.max(0, Math.round((event.loaded / event.total) * 100)));
          onProgress(percent, event.loaded, event.total);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status === 401 && typeof window !== 'undefined') {
        clearAuthSession();
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }

      let parsed = null;
      try {
        parsed = JSON.parse(xhr.responseText);
      } catch (e) {
        parsed = { result: 'error', message: xhr.responseText || 'Request failed' };
      }

      resolve({
        ok: xhr.status >= 200 && xhr.status < 300,
        status: xhr.status,
        json: async () => parsed
      });
    };

    xhr.onerror = () => {
      reject(new Error('Network error during upload'));
    };

    xhr.send(options.body || null);
  });
}

