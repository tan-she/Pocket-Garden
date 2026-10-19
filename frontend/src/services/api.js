import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// ── Plants ────────────────────────────────────────────────────────────
export const plantsApi = {
  getAll: (gardenId) => api.get('/plants', { params: gardenId ? { garden_id: gardenId } : {} }),
  getById: (id) => api.get(`/plants/${id}`),
  create: (data) => api.post('/plants', data),
  update: (id, data) => api.put(`/plants/${id}`, data),
  delete: (id) => api.delete(`/plants/${id}`),
  getStats: () => api.get('/plants/stats'),
}

// ── Gardens ────────────────────────────────────────────────────────────
export const gardensApi = {
  getAll: () => api.get('/gardens'),
  getById: (id) => api.get(`/gardens/${id}`),
  create: (data) => api.post('/gardens', data),
  update: (id, data) => api.put(`/gardens/${id}`, data),
  delete: (id) => api.delete(`/gardens/${id}`),
}

// ── Care Logs ─────────────────────────────────────────────────────────
export const careLogsApi = {
  getAll: (plantId) => api.get('/care-logs', { params: plantId ? { plant_id: plantId } : {} }),
  create: (data) => api.post('/care-logs', data),
  update: (id, data) => api.put(`/care-logs/${id}`, data),
  delete: (id) => api.delete(`/care-logs/${id}`),
  getSummary: () => api.get('/care-logs/summary'),
}

// ── Community Posts ───────────────────────────────────────────────────
export const communityApi = {
  getAll: (params) => api.get('/community', { params }),
  getById: (id) => api.get(`/community/${id}`),
  create: (data) => api.post('/community', data),
  update: (id, data) => api.put(`/community/${id}`, data),
  delete: (id) => api.delete(`/community/${id}`),
}

// ── Analytics ─────────────────────────────────────────────────────────
export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getCareActivity: () => api.get('/analytics/care-activity'),
  getPopularCategories: () => api.get('/analytics/popular-categories'),
  getSurvivalRates: () => api.get('/analytics/survival-rates'),
}

export default api
