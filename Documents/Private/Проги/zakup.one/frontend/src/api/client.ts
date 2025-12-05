import axios from 'axios'

// Используем относительный путь для API, чтобы запросы шли через Nginx
// Это решает проблемы с CORS и дизайном
// В браузере всегда используем относительный путь (пустая строка = текущий домен и протокол)
// Это гарантирует, что запросы будут использовать тот же протокол (HTTP/HTTPS), что и страница

// VITE_API_URL должен быть пустым в production для использования относительного пути
// Vite заменяет import.meta.env.VITE_API_URL во время сборки
// Если переменная пустая, Vite подставит пустую строку
const baseURL = import.meta.env.VITE_API_URL || ''

console.log('API Client initialized with baseURL:', baseURL)

export const apiClient = axios.create({
  baseURL: baseURL || '/',  // Используем '/' если пусто, чтобы гарантировать относительный путь
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // Включаем cookies для сессий Django
})

// Добавляем токен к каждому запросу
apiClient.interceptors.request.use((config) => {
  // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Убеждаемся, что URL всегда начинается с /api/
  if (config.url) {
    // Если URL не начинается с /api/ и не является абсолютным URL
    if (!config.url.startsWith('/api/') && !config.url.startsWith('http')) {
      console.warn('⚠️ URL не начинается с /api/, исправляем:', config.url)
      // Добавляем /api/ в начало
      config.url = config.url.startsWith('/') 
        ? `/api${config.url}` 
        : `/api/${config.url}`
    }
  }
  
  // Формируем полный URL для логирования
  const fullURL = config.baseURL && config.baseURL !== '/'
    ? (config.baseURL.endsWith('/') ? config.baseURL.slice(0, -1) : config.baseURL) + 
      (config.url?.startsWith('/') ? config.url : '/' + config.url)
    : config.url || ''
  
  console.log('🔵 API Request Interceptor:', {
    originalURL: config.url,
    method: config.method,
    baseURL: config.baseURL,
    fullURL: fullURL,
  })
  
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  return config
}, (error) => {
  console.error('❌ API Request Error:', error)
  return Promise.reject(error)
})

// Обработка ошибок
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response Success:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    })
    return response
  },
  (error) => {
    console.error('API Response Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
      headers: error.response?.headers,
    })
    
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

