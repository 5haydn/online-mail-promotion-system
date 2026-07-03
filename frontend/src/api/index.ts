import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error.response?.data?.detail || '请求失败'
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      router.push('/login')
    }
    ElMessage.error(typeof msg === 'string' ? msg : JSON.stringify(msg))
    return Promise.reject(error)
  },
)

export default api

// Auth
export const login = (username: string, password: string) =>
  api.post('/auth/login', { username, password })

export const getMe = () => api.get('/auth/me')

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats')

// Customers
export const downloadTemplate = () =>
  api.get('/customers/template', { responseType: 'blob' })

export const uploadCustomers = (file: File, groupId?: number) => {
  const form = new FormData()
  form.append('file', file)
  const params = groupId ? { group_id: groupId } : {}
  return api.post('/customers/upload', form, { params })
}

export const listCustomers = (params?: Record<string, unknown>) =>
  api.get('/customers', { params })

export const listGroups = () => api.get('/customers/groups')

export const createGroup = (data: { name: string; description?: string }) =>
  api.post('/customers/groups', data)

// Notifications
export const listNotifications = (params?: Record<string, unknown>) =>
  api.get('/notifications', { params })

export const markNotificationRead = (id: number) =>
  api.post(`/notifications/${id}/read`)

export const markAllNotificationsRead = () => api.post('/notifications/read-all')
