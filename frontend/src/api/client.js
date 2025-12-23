import axios from 'axios'

// Single configurable base API URL (env-driven), default to Render URL
const BASE_API_URL = (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim())
  || 'https://shirin-market-backend.onrender.com'

const api = axios.create({
  baseURL: BASE_API_URL,
})

// Attach token for each request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authApi = {
  async login(payload) {
    const { data } = await api.post('/auth/login', payload)
    return data
  },
  async register(payload) {
    const { data } = await api.post('/auth/register', payload)
    return data
  },
  async me() {
    const { data } = await api.get('/auth/me')
    return data
  },
}

export const categoryApi = {
  async list() {
    const { data } = await api.get('/categories')
    return data
  },
  async create(payload) {
    const { data } = await api.post('/categories', payload)
    return data
  },
  async update(id, payload) {
    const { data } = await api.put(`/categories/${id}`, payload)
    return data
  },
  async remove(id) {
    const { data } = await api.delete(`/categories/${id}`)
    return data
  },
}

export const productApi = {
  async list(params = {}) {
    const { data } = await api.get('/products', { params })
    return data
  },
  async get(id) {
    const { data } = await api.get(`/products/${id}`)
    return data
  },
  async create(payload) {
    const { data } = await api.post('/products', payload)
    return data
  },
  async update(id, payload) {
    const { data } = await api.put(`/products/${id}`, payload)
    return data
  },
  async remove(id) {
    const { data } = await api.delete(`/products/${id}`)
    return data
  },
}

export const cartApi = {
  async get() {
    const { data } = await api.get('/cart')
    return data
  },
  async add(payload) {
    const { data } = await api.post('/cart', payload)
    return data
  },
  async update(id, quantity) {
    const { data } = await api.put(`/cart/${id}` , null, { params: { quantity } })
    return data
  },
  async remove(id) {
    const { data } = await api.delete(`/cart/${id}`)
    return data
  },
  async clear() {
    const { data } = await api.delete('/cart')
    return data
  },
}

export default api
