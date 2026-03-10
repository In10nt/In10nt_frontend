import axios from 'axios'

const api = axios.create({
  baseURL: '/api'
})

// Add token and user ID to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (user.id) {
      config.headers['X-User-Id'] = user.id
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
