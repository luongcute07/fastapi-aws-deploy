import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Interceptor for centralized error formatting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.message ||
      'Đã xảy ra lỗi khi kết nối tới máy chủ.'
    return Promise.reject(new Error(message))
  }
)

/**
 * Get all users
 */
export const getUsers = async () => {
  const response = await api.get('/users')
  return response.data
}

/**
 * Get single user by ID
 */
export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`)
  return response.data
}

/**
 * Create a new user
 * @param {{ name: string, email: string }} userData
 */
export const createUser = async (userData) => {
  const response = await api.post('/users', userData)
  return response.data
}

/**
 * Update an existing user by ID
 * @param {number} id
 * @param {{ name?: string, email?: string }} userData
 */
export const updateUser = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData)
  return response.data
}

/**
 * Delete a user by ID
 * @param {number} id
 */
export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`)
  return response.data
}

export default api
