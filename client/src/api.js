/**
 * FoodSquad API Client & Session Manager
 * Connects React frontend seamlessly to Express + MongoDB backend with JWT and Socket.IO
 */
const API_BASE = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'foodsquad_token';
const USER_KEY = 'foodsquad_user';
const ROOM_KEY = 'foodsquad_room_code';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getActiveRoom() {
  return localStorage.getItem(ROOM_KEY) || '';
}

export function setActiveRoom(code) {
  if (code) {
    localStorage.setItem(ROOM_KEY, String(code).toUpperCase());
  } else {
    localStorage.removeItem(ROOM_KEY);
  }
}

export function setAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ROOM_KEY);
}

export async function request(path, options = {}) {
  const token = getToken();
  const roomCode = getActiveRoom();

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(roomCode ? { 'x-room-code': roomCode } : {}),
    ...(options.headers || {}),
  };

  let body = options.body;
  const method = options.method || (body !== undefined ? 'POST' : 'GET');

  if (body !== undefined && typeof body === 'object' && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}/api${path}`, {
    ...options,
    method,
    headers,
    body,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401) {
      clearAuth();
    }
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  // Auto-sync active room if backend returns state with an active room code
  if (data?.room?.code) {
    setActiveRoom(data.room.code);
  }

  return data;
}

export const api = {
  getToken,
  getUser,
  getActiveRoom,
  setActiveRoom,
  setAuth,
  clearAuth,

  // Session
  createSession: async (name) => {
    const data = await request('/session', { method: 'POST', body: { name } });
    if (data?.token && data?.user) {
      setAuth(data.token, data.user);
    }
    return data;
  },

  // State
  getState: () => request('/state'),

  // Rooms
  selectRestaurant: (id) => request('/restaurant/select', { method: 'POST', body: { id } }),
  joinRoom: async (code) => {
    const formatted = String(code || '').trim().toUpperCase();
    setActiveRoom(formatted);
    return request('/rooms/join', { method: 'POST', body: { code: formatted } });
  },

  // Preferences
  savePrefs: (prefs) => request('/prefs', { method: 'POST', body: prefs }),

  // Cart
  addToCart: (params) => request('/cart/add', { method: 'POST', body: params }),
  updateQty: (params) => request('/cart/qty', { method: 'POST', body: params }),
  toggleEater: (params) => request('/cart/eat', { method: 'POST', body: params }),

  // Agent
  getAgent: () => request('/agent'),
  acceptAgent: () => request('/agent/accept', { method: 'POST', body: {} }),

  // Order & Settlement
  placeOrder: () => request('/order/place', { method: 'POST', body: {} }),
  confirmPaid: (id) => request('/paid', { method: 'POST', body: { id } }),
  settleLedger: (id) => request('/ledger/settle', { method: 'POST', body: { id } }),
};
