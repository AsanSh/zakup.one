import axios from 'axios'

// Используем относительный путь для API, чтобы запросы шли через Nginx
// Это решает проблемы с CORS и дизайном
// В браузере всегда используем относительный путь (пустая строка = текущий домен и протокол)
// Это гарантирует, что запросы будут использовать тот же протокол (HTTP/HTTPS), что и страница
const getApiUrl = () => {
  // В браузере всегда используем относительный путь
  if (typeof window !== 'undefined') {
    // Если VITE_API_URL задан и не пустой, используем его
    // Но в production всегда используем относительный путь
    const envUrl = import.meta.env.VITE_API_URL
    if (envUrl && envUrl.trim() !== '' && import.meta.env.DEV) {
      // Только в режиме разработки используем явный URL
      return envUrl
    }
    // В production всегда используем относительный путь (пустая строка)
    return ''
  }
  // На сервере (SSR) - не используется в нашем случае, но на всякий случай
  return ''
}

export const apiClient = axios.create({
  baseURL: getApiUrl(),
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

