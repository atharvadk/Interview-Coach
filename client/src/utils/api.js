import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  login: async (data) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Session API
export const sessionApi = {
  start: async (data) => {
    const response = await api.post('/session', data);
    return response.data;
  },
  
  getById: async (sessionId) => {
    const response = await api.get(`/session/${sessionId}`);
    return response.data;
  },
  
  update: async (sessionId, data) => {
    const response = await api.put(`/session/${sessionId}`, data);
    return response.data;
  },
};

// Questions API
export const questionsApi = {
  generate: async (domain, difficulty, count) => {
    const response = await api.post('/questions/generate', { domain, difficulty, count });
    return response.data;
  },
};

// Speech API
export const speechApi = {
  transcribe: async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    const response = await api.post('/speech/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// Face Analysis API
export const faceApi = {
  analyze: async (imageData) => {
    const response = await api.post('/face/analyze', { image: imageData });
    return response.data;
  },
};

// Evaluate API
export const evaluateApi = {
  evaluate: async (transcript, question) => {
    const response = await api.post('/evaluate', { transcript, question });
    return response.data;
  },
};

// Report API
export const reportApi = {
  get: async (sessionId) => {
    const response = await api.get(`/report/${sessionId}`);
    return response.data;
  },
};

export default api;
