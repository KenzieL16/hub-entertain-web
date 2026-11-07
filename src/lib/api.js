const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const TOKEN_KEY = 'hub_token';
import { captureError } from './logrocket';

/** remember=true -> localStorage (tetap login), false -> sessionStorage (hilang saat tab ditutup) */
export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY),
  set(token, remember = false) {
    this.clear();
    (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  },
};

export class ApiError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

async function request(method, path, { body, params, signal } = {}) {
  const query = new URLSearchParams(
    Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString();

  const token = tokenStore.get();
  let res;
  try {
    res = await fetch(`${BASE}${path}${query ? `?${query}` : ''}`, {
      method,
      signal,
      headers: {
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    captureError(err, { method, path });    
    throw new ApiError(0, 'Cannot reach the server. Please make sure the backend is running.');
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status >= 500) {
      captureError(new Error(`API ${res.status}: ${method} ${path}`), { message: data?.message });  // ← tambah
    }
    if (res.status === 401 && token && !path.startsWith('/auth/login')) {
      window.dispatchEvent(new Event('auth:expired'));
    }
    throw new ApiError(res.status, data?.message || res.statusText, data?.errors);
  }
  return data;
}

export const api = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, body, opts) => request('POST', path, { ...opts, body }),
  patch: (path, body, opts) => request('PATCH', path, { ...opts, body }),
  delete: (path, opts) => request('DELETE', path, opts),
};
