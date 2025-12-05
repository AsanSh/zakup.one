import axios from 'axios'

// Используем относительный путь для API, чтобы запросы шли через Nginx
// Это решает проблемы с CORS и дизайном
// В браузере всегда используем относительный путь (пустая строка = текущий домен и протокол)
// Это гарантирует, что запросы будут использовать тот же протокол (HTTP/HTTPS), что и страница

// Получаем URL из переменной окружения, если она задана
// В production VITE_API_URL должен быть пустым, чтобы использовать относительный путь
const envApiUrl = import.meta.env.VITE_API_URL

// В браузере всегда используем относительный путь, если envUrl пустой или не задан
// Только в режиме разработки (локально) можно использовать явный URL
const baseURL = (typeof window !== 'undefined' && (!envApiUrl || envApiUrl.trim() === '')) 
  ? '' // Относительный путь в браузере
  : (envApiUrl || '') // Используем envUrl если задан, иначе пустая строка

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // Включаем cookies для сессий Django
})

// Добавляем токен к каждому запросу
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  return config
})

// Обработка ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Токен недействителен - очищаем и перенаправляем на логин
      localStorage.removeItem('token')
      localStorage.removeItem('zakup_user_data')
      // Используем replace для избежания истории
      if (window.location.pathname !== '/login') {
        window.location.replace('/login')
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient

