import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle 401 responses
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  registerLabTech: (formData) => api.post('/auth/register-labtech', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  getUnclaimedDoctors: () => api.get('/auth/unclaimed-doctors'),
}

export const doctorsAPI = {
  list: () => api.get('/doctors/'),
  get: (id) => api.get(`/doctors/${id}`),
  updateProfile: (data) => api.put('/doctors/profile', data),
  addReview: (data) => api.post('/doctors/reviews', data),
}

export const appointmentsAPI = {
  book: (data) => api.post('/appointments/', data),
  mine: () => api.get('/appointments/my'),
  get: (id) => api.get(`/appointments/${id}`),
  updateStatus: (id, status) => api.put(`/appointments/${id}/status?status=${status}`),
  giveFeedback: (data) => api.post('/appointments/feedback', data),
}

export const labAPI = {
  orderTest: (data) => api.post('/lab-tests/order', data),
  listLabtechs: () => api.get('/lab-tests/labtechs'),
  pendingTests: () => api.get('/lab-tests/pending'),
  allTests: () => api.get('/lab-tests/all-for-labtech'),
  myPending: () => api.get('/lab-tests/my-pending'),
  getTestDetails: (testId) => api.get(`/lab-tests/${testId}`),
  uploadImages: (testId, formData) => api.post(`/lab-tests/${testId}/upload-images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  runDiagnosis: (testId) => api.post(`/lab-tests/${testId}/run-diagnosis`),
  markCompleted: (testId) => api.put(`/lab-tests/${testId}/complete`),
  cancelTest: (testId) => api.put(`/lab-tests/${testId}/cancel`),  // ← ADD THIS
}
export default api