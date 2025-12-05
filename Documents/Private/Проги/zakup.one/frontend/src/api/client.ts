import axios from 'axios'

// Используем относительный путь для API, чтобы запросы шли через Nginx
// В production используем '/api' как baseURL, чтобы все запросы шли на /api/...
// Это гарантирует, что запросы будут использовать тот же протокол (HTTP/HTTPS), что и страница

// VITE_API_URL может быть пустым в production - тогда используем '/api'
// Если задан явно (например, для разработки) - используем его
const envBaseURL = import.meta.env.VITE_API_URL || ''
// В production (когда envBaseURL пустой) используем '/api'
// В development можно использовать полный URL (например, 'http://localhost:8000/api')
const baseURL = envBaseURL || '/api'

console.log('🔵 API Client initialized:', {
  envBaseURL,
  finalBaseURL: baseURL,
  currentOrigin: window.location.origin,
})

export const apiClient = axios.create({
  baseURL,  // '/api' в production, или значение из VITE_API_URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // Включаем cookies для сессий Django
})

// Добавляем токен к каждому запросу
apiClient.interceptors.request.use((config) => {
  // Убеждаемся, что URL правильный (начинается с /)
  if (config.url && !config.url.startsWith('/') && !config.url.startsWith('http')) {
    config.url = '/' + config.url
  }
  
  // Формируем полный URL для логирования
  const fullURL = config.baseURL 
    ? (config.baseURL.endsWith('/') ? config.baseURL.slice(0, -1) : config.baseURL) + 
      (config.url?.startsWith('/') ? config.url : '/' + config.url)
    : config.url || ''
  
  console.log('🔵 API Request Interceptor:', {
    url: config.url,
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

