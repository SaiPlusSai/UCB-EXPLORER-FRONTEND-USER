import axios from 'axios'

console.log('MODE:', import.meta.env.MODE)
console.log('API URL:', import.meta.env.VITE_API_URL)

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const api = axios.create({
  baseURL: `${baseURL}/api`,
  timeout: 20000,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ucb_visitor_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  config.headers['ngrok-skip-browser-warning'] = 'true'

  return config
})

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ucb_visitor_token')
      localStorage.removeItem('ucb_visitor')
    }

    return Promise.reject(error)
  }
)

export const apiBaseUrl = baseURL