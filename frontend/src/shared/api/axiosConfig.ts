/**
 * Конфигурация axios для автоматического добавления токена
 */
import axios from 'axios'

const API_URL = '/api/v1'

// Создаем экземпляр axios с базовой конфигурацией
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 секунд
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor для добавления токена к каждому запросу
apiClient.interceptors.request.use(
  (config) => {
    // Получаем токен из localStorage
    const stored = localStorage.getItem('auth-storage')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        const token = data.state?.token
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      } catch (e) {
        console.error('Ошибка чтения токена из localStorage:', e)
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor для обработки ошибок
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Если ошибка 401 (Unauthorized), перенаправляем на страницу входа
    if (error.response?.status === 401) {
      // Очищаем токен
      localStorage.removeItem('auth-storage')
      // Перенаправляем на страницу входа
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient

