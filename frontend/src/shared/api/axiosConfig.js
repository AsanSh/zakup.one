/**
 * Конфигурация axios для автоматического добавления токена
 */
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || '/api/v1';
// Создаем экземпляр axios с базовой конфигурацией
const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 30000, // 30 секунд
    headers: {
        'Content-Type': 'application/json',
    },
});
// Interceptor для добавления токена к каждому запросу
apiClient.interceptors.request.use((config) => {
    // Получаем токен из localStorage
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
        try {
            const data = JSON.parse(stored);
            const token = data.state?.token;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        catch (e) {
            console.error('Ошибка чтения токена из localStorage:', e);
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
// Interceptor для обработки ошибок
apiClient.interceptors.response.use((response) => {
    return response;
}, (error) => {
    // Если ошибка 401 (Unauthorized), перенаправляем на страницу входа
    // НО исключаем сам endpoint логина, чтобы не создавать цикл
    if (error.response?.status === 401) {
        const requestUrl = error.config?.url || '';
        const isLoginEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');
        // Не обрабатываем 401 для endpoint логина/регистрации - пусть компоненты сами обработают
        if (!isLoginEndpoint) {
            // Очищаем токен
            localStorage.removeItem('auth-storage');
            // Перенаправляем на страницу входа только если мы не на странице логина
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                // Не показываем alert здесь - пусть компоненты сами решают, что показывать
                window.location.href = '/login';
            }
        }
    }
    return Promise.reject(error);
});
export default apiClient;
