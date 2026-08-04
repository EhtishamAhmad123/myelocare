import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 30000,
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mc_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mc_token')
      localStorage.removeItem('mc_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  // path is absolute server path like /home/.../uploads/test_1/annotated/xxx.jpg
  // extract relative part from "uploads/"
  const match = path.match(/uploads[\\/](.+)/)
  if (match) return `${BASE_URL}/uploads/${match[1].replace(/\\/g, '/')}`
  return `${BASE_URL}/uploads/${path}`
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

// ─── Doctors ──────────────────────────────────────────────────────────────────
export const doctorsAPI = {
  list: (city) => api.get('/doctors/', { params: city ? { city } : {} }),
  getMe: () => api.get('/doctors/me'),
  get: (id) => api.get(`/doctors/${id}`),
  updateProfile: (data) => api.put('/doctors/profile', data),
  getReviews: (id) => api.get(`/doctors/${id}/reviews`),
  addReview: (data) => api.post('/doctors/reviews', data),
}

// ─── Appointments ────────────────────────────────────────────────────────────
export const appointmentsAPI = {
  book: (data) => api.post('/appointments/', data),
  mine: () => api.get('/appointments/my'),
  stats: () => api.get('/appointments/stats'),
  get: (id) => api.get(`/appointments/${id}`),
  updateStatus: (id, status) => api.put(`/appointments/${id}/status?status=${status}`),
  giveFeedback: (data) => api.post('/appointments/feedback', data),
}

// ─── Lab Tests ────────────────────────────────────────────────────────────────
export const labAPI = {
  orderTest: (data) => api.post('/lab-tests/order', data),
  labtechs: () => api.get('/lab-tests/labtechs'),
  myTests: () => api.get('/lab-tests/my-tests'),
  allTests: () => api.get('/lab-tests/all-tests'),
  stats: () => api.get('/lab-tests/stats'),
  getTest: (id) => api.get(`/lab-tests/${id}`),
  assignSelf: (id) => api.put(`/lab-tests/${id}/assign`),
  uploadImages: (testId, formData) =>
    api.post(`/lab-tests/${testId}/upload-images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    }),
  runDiagnosis: (testId) => api.post(`/lab-tests/${testId}/run-diagnosis`, {}, { timeout: 120000 }),
  updateStatus: (testId, status) => api.put(`/lab-tests/${testId}/status?status=${status}`),
  updateProfile: (data) => api.put('/lab-tests/profile', data),
}

export default api