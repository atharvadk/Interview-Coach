import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('jwt_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ──────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login:    (data) => api.post('/api/auth/login', data),
};

// ── User ──────────────────────────────────────────
export const userAPI = {
  getMe:       () => api.get('/api/users/me'),
  getSessions: () => api.get('/api/users/sessions'),
  getStats:    () => api.get('/api/users/stats'),
};

// ── Session ───────────────────────────────────────
export const sessionAPI = {
  start: (data) => api.post('/api/session/start', data),
};

// ── Questions ─────────────────────────────────────
export const questionAPI = {
  generate: (data) => api.post('/api/questions/generate', data),
};

// ── Speech ────────────────────────────────────────
export const speechAPI = {
  transcribe: (formData) =>
    api.post('/api/speech/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ── Face / Emotion ────────────────────────────────
export const faceAPI = {
  analyze: (formData) =>
    api.post('/api/face/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ── Evaluate ──────────────────────────────────────
export const evaluateAPI = {
  evaluate: (data) => api.post('/api/evaluate', data),
};

// ── Report ────────────────────────────────────────
export const reportAPI = {
  getReport: (sessionId) => api.get(`/api/report/${sessionId}`),
};

export default api;